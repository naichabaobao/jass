
const Type = {
  /**
   * 单位
   */
  Unit: {
    /**
     * 人族
     */
    Human: {
      /**
       * 标准
       */
      Standard: {
        /**
         * 单位
         */
        Unit: 0x00,
        /**
         * 建筑
         */
        Building: 0x01,
        /**
         * 英雄
         */
        Hero: 0x02,
        /**
         * 特殊
         */
        Special: 0x03
      },
      /**
       * 战役
       */
      Campaign: {
        /**
         * 单位
         */
        Unit: 0x04,
        /**
         * 建筑
         */
        Building: 0x05,
        /**
         * 英雄
         */
        Hero: 0x06,
        /**
         * 特殊
         */
        Special: 0x07
      }
    },
    /**
     * 兽族
     */
    Orc: {
      /**
      * 标准
      */
      Standard: {
        /**
         * 单位
         */
        Unit: 0x08,
        /**
         * 建筑
         */
        Building: 0x09,
        /**
         * 英雄
         */
        Hero: 0x0a,
        /**
         * 特殊
         */
        Special: 0x0b
      },
      /**
      * 战役
      */
      Campaign: {
        /**
         * 单位
         */
        Unit: 0x0c,
        /**
         * 建筑
         */
        Building: 0x0d,
        /**
         * 英雄
         */
        Hero: 0x0e,
        /**
         * 特殊
         */
        Special: 0x0f
      }
    },
    /**
     * 暗夜精灵
     */
    NightElf: {
      /**
       * 标准
       */
      Standard: {
        /**
         * 单位
         */
        Unit: 0x10,
        /**
         * 建筑
         */
        Building: 0x11,
        /**
         * 英雄
         */
        Hero: 0x12,
        /**
         * 特殊
         */
        Special: 0x13
      },
      /**
       * 战役
       */
      Campaign: {
        /**
         * 单位
         */
        Unit: 0x14,
        /**
         * 建筑
         */
        Building: 0x15,
        /**
         * 英雄
         */
        Hero: 0x16,
        /**
         * 特殊
         */
        Special: 0x17
      }
    },
    /**
     * 不死族
     */
    Undead: {
      /**
       * 标准
       */
      Standard: {
        Unit: 0x18,
        Building: 0x19,
        Hero: 0x1a,
        Special: 0x1b
      },
      /**
       * 战役
       */
      Campaign: {
        Unit: 0x1c,
        Building: 0x1d,
        Hero: 0x1e,
        Special: 0x1f
      }
    },
    /**
     * 娜伽
     */
    Naga: {
      /**
       * 战役
       */
      Campaign: {
        Unit: 0x24,
        Building: 0x25,
        Hero: 0x26,
        Special: 0x27
      }
    },
    /**
     * 中立敌对
     */
    NeutralHostile: {
      /**
       * 标准
       */
      Standard: {
        Unit: 0x28,
        Building: 0x29,
        Hero: 0x2a,
        Special: 0x2b
      },
      /**
       * 战役
       */
      Campaign: {
        Unit: 0x2c,
        Building: 0x2d,
        Hero: 0x2e,
        Special: 0x2f
      }
    },
    /**
     * 中立被动
     */
    NeutralPassive: {
      /**
       * 标准
       */
      Standard: {
        Unit: 0x30,
        Building: 0x31,
        Hero: 0x32,
        Special: 0x33
      },
      /**
       * 战役
       */
      Campaign: {
        Unit: 0x34,
        Building: 0x35,
        Hero: 0x36,
        Special: 0x37
      }
    },
  },
  /**
   * 物品
   */
  Item: {
    /**
     * 永久的
     */
    Perpetual: 0x38,
    /**
     * 可充的
     */
    Rechargeable: 0x39,
    /**
     * 力量提升
     */
    Powerlifting: 0x3a,
    /**
     * 人造的
     */
    Artificial: 0x3b,
    /**
     * 可购买的
     */
    Purchasable: 0x3c,
    /**
     * 战役
     */
    Campaign: 0x3d,
    /**
     * 混杂
     */
    Jumbly: 0x3e
  },
  /**
   * 可破坏物
   */
  Destructible: {
    /**
     * 树木或可破坏物
     */
    TreesOrDestructible: 0x3f,
    /**
     * 路径阻断器
     */
    PathBreaker: 0x40,
    /**
     * 桥或斜坡
     */
    BridgeOrSlope: 0x41
  },
  /**
   * 地形装饰物
   */
  Ornament: {
    /**
     * 环境
     */
    Environment: 0x42,
    /**
     * 建筑
     */
    Architecture: 0x43,
    /**
     * 电影
     */
    Film: 0x44,
    /**
     * 悬崖或地形
     */
    CliffOrTerrain: 0x45,
    /**
     * 道具
     */
    Props: 0x46,
    /**
     * 水
     */
    Water: 0x47
  },
  /**
   * 技能
   */
  Ability: {
    Human: {
      Unit: 0x48,
      Hero: 0x49
    },
    Orc: {
      Unit: 0x4a,
      Hero: 0x4b
    },
    NightElf: {
      Unit: 0x4c,
      Hero: 0x4d
    },
    Undead: {
      Unit: 0x4e,
      Hero: 0x4f
    },
    NeutralPassive: {
      Unit: 0x50
    },
    Special: {
      Unit: 0x52,
      Hero: 0x53,
      Item: 0x54
    }
  },
  /**
   * 状态效果
   */
  Buff: {
    Human: {
      Magic: 0x55,
      Area: 0x56
    },
    Orc: {
      Magic: 0x57,
      Area: 0x58
    },
    NightElf: {
      Magic: 0x59,
      Area: 0x60
    },
    Undead: {
      Magic: 0x61,
      Area: 0x62
    },
    Special: {
      Magic: 0x63,
      Area: 0x64
    },
  },
  /**
   * 科技
   */
  Technology: {
    Human: 0x65,
    Orc: 0x66,
    NightElf: 0x67,
    Undead: 0x68,
    Special: 0x69
  }
}

const unitHuman = {
  "hpea": {
    code: "hpea",
    name: "农民",
    tip: "人族的基本工作单位，能采集金矿和木材还能建造和修理建筑物。紧急情况之下还可以变成民兵。|n|n|cffffcc00能攻击地面单位和树木。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hfoo": {
    code: "hfoo",
    name: "步兵",
    tip: "步兵能学习到防御模式技能。|n|n|cffffcc00能攻击地面单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hkni": {
    code: "hkni",
    name: "骑士",
    tip: "强大的地面单位，能学到训兽术。|n|n|cffffcc00能攻击地面单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hrif": {
    code: "hrif",
    name: "矮人火炮手",
    tip: "非常适合于对付敌人的空中单位，还能获得长管火枪的升级。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hmtm": {
    code: "hmtm",
    name: "迫击炮小队",
    tip: "远距离攻城单位，对付建筑物特别地有效，但是速度很慢很容易遭受敌人的近身攻击。还能获得照明弹和碎片攻击技能。|n|n|cffffcc00能攻击地面单位和树木。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hgyr": {
    code: "hgyr",
    name: "飞行机器",
    tip: "快速移动的飞行机器，能出色地完成侦察任务也能有效地抵抗敌人的空中单位，能获得飞行机器炸弹和高射炮火的升级。|n能看见隐形单位。|n|n|cffffcc00能攻击空中单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hgry": {
    code: "hgry",
    name: "狮鹫骑士",
    tip: "威力巨大的飞行单位，狮鹫上面骑乘着一个矮人族的锤手。能学到风暴战锤技能。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hmpr": {
    code: "hmpr",
    name: "牧师",
    tip: "一开始就拥有强大的医疗能力，随后还能学习到驱逐魔法和心灵之火这两项技能。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hsor": {
    code: "hsor",
    name: "女巫",
    tip: "一开始能施放减慢敌人移动和进攻速度的减速魔法，随后还能学习到隐形术和变形术。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hmtt": {
    code: "hmtt",
    name: "蒸汽机车",
    tip: "重型装甲车辆，特别擅长于对付敌人的建筑物。升级之后可以拥有弹幕攻击能力。|n|n|cffffcc00能攻击建筑物。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hspt": {
    code: "hspt",
    name: "魔法破坏者",
    tip: "精灵族的英勇战士，被训练来消灭法师。初始技能为魔法盗取，可以操纵魔法效果为你所用，还有魔法免疫和反馈技能，也可以学会控制魔法。|n|n|cffffcc00能攻击地面单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "hdhw": {
    code: "hdhw",
    name: "龙鹰骑士",
    tip: "动作敏捷的飞行单位，骑乘一位精灵族战士。拥有空中锁镣技能，可以暂时禁锢和残废敌空中单位。可以学习到训兽术和乌云技能。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Unit
  },
  "htow": {
    code: "htow",
    name: "城镇大厅",
    tip: "基本建筑物，用来训练农民和存贮搜集到的资源，在升级到了主城和城堡之后能让玩家建造许多新的建筑物和单位。",
    type: Type.Unit.Human.Standard.Building
  },
  "hkee": {
    code: "hkee",
    name: "主城",
    tip: "升级到主城之后能使玩家建造许多新的建筑物和单位。",
    type: Type.Unit.Human.Standard.Building
  },
  "hcas": {
    code: "hcas",
    name: "城堡",
    tip: "升级到城堡之后能使玩家建造许多新的建筑物和单位。",
    type: Type.Unit.Human.Standard.Building
  },
  "hhou": {
    code: "hhou",
    name: "农场",
    tip: "提供人口，增加可造单位数量的最大值。",
    type: Type.Unit.Human.Standard.Building
  },
  "halt": {
    code: "halt",
    name: "国王祭坛",
    tip: "召唤新的英雄或者复活死去的英雄。",
    type: Type.Unit.Human.Standard.Building
  },
  "hbar": {
    code: "hbar",
    name: "兵营",
    tip: "最基本的产兵建筑物。能训练出人族的步兵，矮人火枪手和骑士。|n步兵的防御模式，矮人火枪手的长管火枪以及训兽术也都是在这里进行研究的。",
    type: Type.Unit.Human.Standard.Building
  },
  "hlum": {
    code: "hlum",
    name: "伐木场",
    tip: "能储存采集到的木材。|n还包括对伐木效率和石工技术的研究。",
    type: Type.Unit.Human.Standard.Building
  },
  "hbla": {
    code: "hbla",
    name: "铁匠铺",
    tip: "能对护甲，武器和火药进行升级。",
    type: Type.Unit.Human.Standard.Building
  },
  "harm": {
    code: "harm",
    name: "车间",
    tip: "能生产出蒸汽机车、迫击炮小队和飞行机器。|n并且包括对照明弹、碎片攻击、弹幕攻击、飞行机器炸弹和高射炮火的升级。",
    type: Type.Unit.Human.Standard.Building
  },
  "hars": {
    code: "hars",
    name: "神秘圣地",
    tip: "能训练出牧师，女巫，魔法破坏者。|n还包括对牧师，女巫的魔法技能升级，控制魔法的技能升级。使得人族的防御塔具有探测隐形单位能力的魔法岗哨也是在这里进行研究的。",
    type: Type.Unit.Human.Standard.Building
  },
  "hgra": {
    code: "hgra",
    name: "狮鹫笼",
    tip: "能训练出狮鹫骑士和龙鹰骑士。|n还包括对风暴战锤和乌云技能的研究。",
    type: Type.Unit.Human.Standard.Building
  },
  "hwtw": {
    code: "hwtw",
    name: "哨塔",
    tip: "基本的侦察型建筑物，能升级到炮塔或者防御塔，还能学习到魔法岗哨技能。",
    type: Type.Unit.Human.Standard.Building
  },
  "hgtw": {
    code: "hgtw",
    name: "防御塔",
    tip: "基本的防守型建筑物，能学习到魔法岗哨技能。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Building
  },
  "hctw": {
    code: "hctw",
    name: "炮塔",
    tip: "重型的防御性建筑物，对付成群结队的敌人尤为有效。还能学到魔法岗哨技能。|n|n|cffffcc00能攻击地面单位和树木。|r",
    type: Type.Unit.Human.Standard.Building
  },
  "hatw": {
    code: "hatw",
    name: "神秘之塔",
    tip: "魔法防御塔。对于敌人的英雄和魔法施放者特别有效。有魔法回应技能，使它的攻击能够破坏魔法值，破坏的量与攻击的伤害相同。可以学习魔法哨兵技能。|n|n|cffffcc00攻击地面和空中单位。",
    type: Type.Unit.Human.Standard.Building
  },
  "hvlt": {
    code: "hvlt",
    name: "神秘藏宝室",
    tip: "建造一个出售物品的商店。可供购买的物品的种类取决于你的城镇大厅的升级情况(城镇大厅，主城或者城堡)以及你所拥有的建筑物种类。",
    type: Type.Unit.Human.Standard.Building
  },
  "Hpal": {
    code: "Hpal",
    name: "圣骑士",
    tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光，神圣护甲，专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r",
    type: Type.Unit.Human.Standard.Hero
  },
  "Hamg": {
    code: "Hamg",
    name: "大魔法师",
    tip: "一位神秘的英雄，特别擅长于远程攻击。他能学到暴风雪，召唤水元素，辉煌光环和群体传送魔法。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Hero
  },
  "Hmkg": {
    code: "Hmkg",
    name: "山丘之王",
    tip: "战士型英雄，特别擅长于冲锋陷阵。能学习到风暴之锤、雷霆一击、重击和天神下凡。|n|n|cffffcc00能攻击地面单位。|r",
    type: Type.Unit.Human.Standard.Hero
  },
  "Hblm": {
    code: "Hblm",
    name: "血魔法师",
    tip: "一位神秘的英雄，擅长于控制魔法能量和远程攻击。能学习到烈焰风暴、驱散、吸魔和火凤凰这四项技能。|n|n|cffffcc00能攻击地面和空中单位。|r",
    type: Type.Unit.Human.Standard.Hero
  },
  "hpxe": {
    code: "hpxe",
    name: "凤凰蛋",
    tip: "",
    type: Type.Unit.Human.Standard.Special
  },
  "hrtt": {
    code: "hrtt",
    name: "蒸汽机车",
    tip: "重型装甲车辆，特别擅长于对付敌人的建筑物。拥有弹幕攻击技能从而可以对敌人的空中单位进行攻击。|n|n|cffffcc00能攻击建筑物。|r",
    type: Type.Unit.Human.Standard.Special
  },
  "hmil": {
    code: "hmil",
    name: "民兵",
    tip: "农民相应战斗号召跑到最近的一个城镇大厅转变成民兵。",
    type: Type.Unit.Human.Standard.Special
  },
  "hwat": {
    code: "hwat",
    name: "水元素",
    tip: "等级一",
    type: Type.Unit.Human.Standard.Special
  },
  "hwt2": {
    code: "hwt2",
    name: "水元素",
    tip: "等级二",
    type: Type.Unit.Human.Standard.Special
  },
  "hwt3": {
    code: "hwt3",
    name: "水元素",
    tip: "等级三",
    type: Type.Unit.Human.Standard.Special
  },
  "hphx": {
    code: "hphx",
    name: "火凤凰",
    tip: "",
    type: Type.Unit.Human.Standard.Special
  },
  "hrdh": { code: "hrdh", name: "背负背包的马", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "hbew": { code: "hbew", name: "车", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "nhew": { code: "nhew", name: "工人(血精灵)", tip: "基本的工人单位。能建造建筑物和进行修理。", type: Type.Unit.Human.Campaign.Unit },
  "njks": { code: "njks", name: "监狱小卒", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "hhal": { code: "hhal", name: "(无人之马", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "nbee": { code: "nbee", name: "血精灵工程师", tip: "极度聪慧的血精灵在发明新的技术和打造强大的防御塔方面极为擅长。|n|n|cffffcc00攻击地面单位和树木。|r", type: Type.Unit.Human.Campaign.Unit },
  "nbel": { code: "nbel", name: "血精灵中尉", tip: "来自于强大的卡尔省血精灵军队的中尉。破坏魔法施放单位的专家。|n|n|cffffcc00攻击地面单位|r", type: Type.Unit.Human.Campaign.Unit },
  "hhes": { code: "hhes", name: "剑士", tip: "多才多艺的步兵战士。能学习到防御技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Unit },
  "heth": { code: "heth", name: "船长", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "hbot": { code: "hbot", name: "人族运输船", tip: "大型的海上船只，能携带单位。", type: Type.Unit.Human.Campaign.Unit },
  "hdes": { code: "hdes", name: "人族护卫舰", tip: "多功能的攻击舰。擅长于攻击空中单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Unit },
  "hbsh": { code: "hbsh", name: "人族战舰", tip: "强大的舰船，能够有效地攻击地面建筑物。|n|n|cffffcc00能攻击地面单位。", type: Type.Unit.Human.Campaign.Unit },
  "nemi": { code: "nemi", name: "使者", tip: "基本的远程攻击单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Unit },
  "nhef": { code: "nhef", name: "高等精灵(女性)", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "nhem": { code: "nhem", name: "高等精灵(男性)", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "nhea": { code: "nhea", name: "弓箭手", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "nmed": { code: "nmed", name: "麦迪文", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "nser": { code: "nser", name: "西里诺克斯", tip: "", type: Type.Unit.Human.Campaign.Unit },
  "nchp": { code: "nchp", name: "牧师", tip: "支持性的魔法单位。能施放医疗，驱逐魔法和心灵之火技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Unit },
  "nhym": { code: "nhym", name: "术士", tip: "多才多艺的魔法单位。能施放减速，冲击波和变形魔法。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Unit },
  "nws1": { code: "nws1", name: "龙鹰", tip: "重型的远程攻击单位，能诱捕敌方单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Unit },
  "nitb": { code: "nitb", name: "冰之宝盒", tip: "里面有着宝藏。", type: Type.Unit.Human.Campaign.Building },
  "nmgy": { code: "nmgy", name: "魔法宝箱", tip: "在每个盒子里面都藏着一个秘密。", type: Type.Unit.Human.Campaign.Building },
  "hshy": { code: "hshy", name: "人族船坞", tip: "船只建造工厂。这里能建造出人族的运输船，护卫舰和战舰。", type: Type.Unit.Human.Campaign.Building },
  "haro": { code: "haro", name: "神秘了望台", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nfrt": { code: "nfrt", name: "水果店", tip: "你一生中所见过的最不可思议的水果店。", type: Type.Unit.Human.Campaign.Building },
  "ndt1": { code: "ndt1", name: "冰霜之塔", tip: "射出冰片进行攻击，擅长于减慢敌人的速度，对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "ndt2": { code: "ndt2", name: "高级水霜之塔", tip: "加快发射冰片的速度，擅长于减慢敌人的速度，对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "nft2": { code: "nft2", name: "高级火焰之塔", tip: "增加喷射火焰的攻击力，擅长于毁灭靠近的敌人，对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "nbt2": { code: "nbt2", name: "高级巨石之塔", tip: "增加石头的攻击力，擅长于对付地面单位，对魔法免疫。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Building },
  "net2": { code: "net2", name: "高级能里之塔", tip: "增加能量之箭的攻击力，擅长于对付敌人的空中单位，对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "ntx2": { code: "ntx2", name: "高级死亡之塔", tip: "射出致命的能量箭，擅长于实施大规模的伤害，对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "nft1": { code: "nft1", name: "火焰之塔", tip: "能射出灼热的火焰。擅长于毁灭靠近的敌人。对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "nbt1": { code: "nbt1", name: "巨石之塔", tip: "投掷出能造成溅射伤害的巨石，擅长于对付地面单位，对魔法免疫。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Building },
  "net1": { code: "net1", name: "能量之塔", tip: "射出能量之箭，擅长于对付敌人的空中单位，对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "ntt1": { code: "ntt1", name: "死亡之塔", tip: "射出致命的能量箭，擅长于实施大规模的伤害，对魔法免疫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "ngwr": { code: "ngwr", name: "谷仓", tip: "", type: Type.Unit.Human.Campaign.Building },
  "negm": { code: "negm", name: "天怒之塔", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nezf": { code: "nezf", name: "地怒之塔", tip: "", type: Type.Unit.Human.Campaign.Building },
  "negt": { code: "negt", name: "高等精灵防御塔", tip: "主要的防御性建筑。 |n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Building },
  "ndgt": { code: "ndgt", name: "达拉然守卫塔", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nheb": { code: "nheb", name: "高等精灵兵营", tip: "主要部队生产建筑。 训练高等精灵剑士和高等精灵弓箭手和龙鹰。|n 同时包括对于高等精灵剑士防御技能的升级。", type: Type.Unit.Human.Campaign.Building },
  "nefm": { code: "nefm", name: "高等精灵农场", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef0": { code: "nef0", name: "高等精灵农场1", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef1": { code: "nef1", name: "高等精灵农场2", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef2": { code: "nef2", name: "高等精灵农场3", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef3": { code: "nef3", name: "高等精灵农场4", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef4": { code: "nef4", name: "高等精灵农场5", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef5": { code: "nef5", name: "高等精灵农场6", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef6": { code: "nef6", name: "高等精灵农场7", tip: "", type: Type.Unit.Human.Campaign.Building },
  "nef7": { code: "nef7", name: "高等精灵农场8", tip: "", type: Type.Unit.Human.Campaign.Building },
  "Hart": { code: "Hart", name: "阿尔塞斯", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Harf": { code: "Harf", name: "阿尔塞斯(挥舞着霜之哀伤宝剑)", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hgam": { code: "Hgam", name: "安东尼达斯", tip: "一位神秘的英雄，擅长于远程攻击。能学习到暴风雪、召唤水元素、辉煌光环、和群体传送技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hant": { code: "Hant", name: "安东尼达斯", tip: "一位神秘的英雄，特别擅长于远程攻击。他能学到暴风雪、召唤水元素、辉煌光环和群体传送魔法。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hdgo": { code: "Hdgo", name: "达贡兽族屠杀者", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hpb2": { code: "Hpb2", name: "格雷戈里爵士", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hhkl": { code: "Hhkl", name: "哈拉生命使者", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hapm": { code: "Hapm", name: "海军上将普洛德摩尔", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hjai": { code: "Hjai", name: "吉安娜", tip: "一位神秘的英雄，特别擅长于远程攻击。他能学到暴风雪、召唤水元素、辉煌光环和群体传送魔法。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hlgr": { code: "Hlgr", name: "加理瑟斯", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hkal": { code: "Hkal", name: "卡尔", tip: "一位神秘的英雄，擅长于控制魔法能量和远程攻击。能学习到烈焰风暴、驱散、吸魔和火凤凰这四项技能。|n|n|cffffcc00攻击地面和空中单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hmgd": { code: "Hmgd", name: "马格罗斯守御者", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hmbr": { code: "Hmbr", name: "穆拉丁", tip: "战士型英雄，特别擅长于冲锋陷阵。能学习到风暴之锤、雷霆一击、重击和天神下凡。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hpb1": { code: "Hpb1", name: "尼科拉斯大人", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Huth": { code: "Huth", name: "乌瑟尔", tip: "战士型英雄，特别擅长于保护自己周围的部队，能学习到神圣之光、神圣护甲、专注光环和复活这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Human.Campaign.Hero },
  "Hvwd": { code: "Hvwd", name: "追风之西尔瓦娜斯", tip: "", type: Type.Unit.Human.Campaign.Hero },
  "hprt": { code: "hprt", name: "传送门", tip: "打开传送门。", type: Type.Unit.Human.Campaign.Building },
  "nmdm": { code: "nmdm", name: "麦迪文(血乌鸦形态)", tip: "", type: Type.Unit.Human.Campaign.Building },
}
const unitOrc = {
  "opeo": { code: "opeo", name: "苦工", tip: "兽族的基本工人单位。能采集黄金和木材。还能建造建筑物和进行修理。在钻入地洞以后还能对来犯的敌人进行反击。|n|n|cffffcc00能攻击地面单位和树木。|r", type: Type.Unit.Orc.Standard.Unit },
  "ogru": { code: "ogru", name: "兽族步兵", tip: "基本的兽族地面单位。能得到狂暴力量的升级。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "orai": { code: "orai", name: "掠夺者", tip: "一种机动性很强的狼骑士。对付建筑物特别的有效，能学习到诱捕技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "otau": { code: "otau", name: "牛头人", tip: "大型的单位，能学习到粉碎技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "ohun": { code: "ohun", name: "巨魔猎头者", tip: "能有效对空的单位。能学习到巨魔再生和狂暴愤怒技能。|n|n|cffffcc00能攻击地面和空中单位。|r ", type: Type.Unit.Orc.Standard.Unit },
  "ocat": { code: "ocat", name: "粉碎者", tip: "远程攻城武器。对建筑很有效，但缓慢而昂贵。可以学会燃烧之油技能。|n|n|cffffcc00攻击地面单位和树木。|r", type: Type.Unit.Orc.Standard.Unit },
  "okod": { code: "okod", name: "科多兽", tip: "笨重的战争野兽，上面骑着一个兽族鼓手。能学到战鼓和吞噬技能。战鼓能提高周围单位的攻击力，它本身也能进行升级。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "owyv": { code: "owyv", name: "风骑士", tip: "一种高度机动的飞行单位。特别擅长于侦察。能获得浸毒武器的升级。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "otbr": { code: "otbr", name: "巨魔蝙蝠骑士", tip: "轻型的飞行单位，有着出色的感官。擅长于摧毁敌人的建筑物，具有不稳定化合物技能，使得巨魔蝙蝠骑士能利用爆炸来伤害周围的空中单位。还能学习到液体炸弹和巨魔再生技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "odoc": { code: "odoc", name: "巨魔巫医", tip: "魔法单位，一开始能施放岗哨魔法，从而能侦察到一定的区域。随后这种单位还能学习到静止陷阱和治疗守卫。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "oshm": { code: "oshm", name: "萨满祭司", tip: "魔法单位。一开始能施放净化技能，从而能固定住敌人和驱逐其身上的魔法效果。随后还能学习到闪电护盾和嗜血术。|n|n|cffffcc00能攻击地面单位和空中单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "ospw": { code: "ospw", name: "灵魂行者", tip: "诡秘的牛头人法师。具有虚无形态技能，从而能让其对物理攻击免疫。还具有灵魂锁链技能，从而能对敌人进行连锁伤害。同时也能学习到消魔和先祖幽灵技能。|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Standard.Unit },
  "ogre": { code: "ogre", name: "大厅", tip: "兽族的基本建筑物。能训练出苦工，在升级到了要塞和堡垒之后能让玩家建造许多新的建筑物和单位。", type: Type.Unit.Orc.Campaign.Building },
  "ostr": { code: "ostr", name: "要塞", tip: "在升级到要塞以后能使玩家建造许多新的建筑物和单位。", type: Type.Unit.Orc.Campaign.Building },
  "ofrt": { code: "ofrt", name: "堡垒", tip: "升级到了堡垒之后能让玩家建造许多新的建筑物和单位。", type: Type.Unit.Orc.Campaign.Building },
  "oalt": { code: "oalt", name: "风暴祭坛", tip: "能召唤新的英雄和复活阵亡的英雄。", type: Type.Unit.Orc.Campaign.Building },
  "obar": { code: "obar", name: "兵营", tip: "主要部队生产建筑。训练步兵，猎头者和粉碎者。|n同时包括狂暴力量，狂暴愤怒，巨魔再生和燃烧汽油的升级。", type: Type.Unit.Orc.Campaign.Building },
  "ofor": { code: "ofor", name: "战争磨坊", tip: "能存储采集到的木材。|n这里还包括对兽族各种单位的攻防升级，尖刺障碍和加强型防御也是在这里进行研究的。", type: Type.Unit.Orc.Campaign.Building },
  "otto": { code: "otto", name: "牛头人图腾", tip: "能训练出牛头人来。|n还包括对粉碎技能的研究。", type: Type.Unit.Orc.Campaign.Building },
  "osld": { code: "osld", name: "灵魂归宿", tip: "能生产出兽族的魔法单位：萨满祭司，巨魔巫医和灵魂行者。|n这里也可以进行对萨满祭司，巨魔巫医和灵魂行者的各种魔法升级。", type: Type.Unit.Orc.Campaign.Building },
  "obea": { code: "obea", name: "兽栏", tip: "能训练出掠夺者，科多兽，风骑士和巨魔蝙蝠骑士。|n这里还包括诱捕，浸毒武器，战鼓和液体炸弹的升级。", type: Type.Unit.Orc.Campaign.Building },
  "otrb": { code: "otrb", name: "兽族地洞", tip: "能提供人口，从而增加可造单位数量的最大值。苦工在进入其中以后还能对来犯的敌人进行反击。能进行加强型防御升级。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Building },
  "owtw": { code: "owtw", name: "了望塔", tip: "防御性建筑，能得到到加强型防御升级。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Building },
  "ovln": { code: "ovln", name: "巫毒商店", tip: "建造出一个能出售物品的商店。可以购买的物品种类取决于你的大厅升级情况(大厅, 要塞, 堡垒)和你所拥有的建筑物种类。", type: Type.Unit.Orc.Campaign.Building },
  "Obla": { code: "Obla", name: "剑圣", tip: "一种较为灵活的英雄，特别擅长于一对一。能学习到镜像，疾步风，致命一击和剑刃风暴这四种技能。|n|n|cffffcc00能攻击地面单位。", type: Type.Unit.Orc.Campaign.Hero },
  "Ofar": { code: "Ofar", name: "先知", tip: "一种神秘的英雄，特别擅长于远程攻击和侦察。能学习到闪电链，透视，野兽幽魂和地震这四种技能。|n|n|cffffcc00能攻击地面单位和空中单位。", type: Type.Unit.Orc.Campaign.Hero },
  "Otch": { code: "Otch", name: "牛头人酋长", tip: "一种战士型英雄，特别擅长于近战和吸收伤害。能学习到震荡波，战争践踏，耐久光环和重生这四种技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Oshd": { code: "Oshd", name: "暗影猎手", tip: "灵巧型的英雄，擅长于医疗和巫毒魔法。能学习到医疗波，妖术，毒蛇守卫和巫毒技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "oeye": { code: "oeye", name: "岗哨守卫", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "nwad": { code: "nwad", name: "观察守卫", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "otot": { code: "otot", name: "静止陷阱", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "osw1": { code: "osw1", name: "幽魂之狼(等级1)", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "osw2": { code: "osw2", name: "恐惧之狼(等级2)", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "osw3": { code: "osw3", name: "阴影之狼(等级3)", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "ohwd": { code: "ohwd", name: "治疗守卫", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "osp1": { code: "osp1", name: "毒蛇守卫(等级1)", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "osp2": { code: "osp2", name: "毒蛇守卫(等级2)", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "osp3": { code: "osp3", name: "毒蛇守卫(等级3)", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "osp4": { code: "osp4", name: "毒蛇守卫(等级4)", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "ospm": { code: "ospm", name: "灵魂行者(虚无状态)", tip: "诡秘的牛头人法师。具有虚无形态技能，从而能让其对物理攻击免疫。还具有灵魂锁链技能，从而能对敌人进行连锁伤害。同时也能学习到消魔和先祖幽灵技能。|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Special },
  "otbk": { code: "otbk", name: "巨竟狂暴战士", tip: "能有效对空的投矛战士，拥有狂暴愤怒技能，从而增加了攻击力但是也会因此而受到额外的伤害。能学习巨魔再生技能。|n|n|cffffcc00能攻击地面和空中单位。|r ", type: Type.Unit.Orc.Campaign.Special },

  nspe: { code: "nspe", name: "支柱", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  oose: { code: "oose", name: "科多兽(怀需要分配驾驭者", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  owar: { code: "owar", name: "兽族战争首领", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  ogrk: { code: "ogrk", name: "加嗦克", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  oswy: { code: "oswy", name: "灵魂飞龙", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  ownr: { code: "ownr", name: "双足飞龙(不需要分驾驭者", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  odkt: { code: "odkt", name: "德拉克苏尔", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  obot: { code: "obot", name: "兽族运输船", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  odes: { code: "odes", name: "兽族护卫舰", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  ojgn: { code: "ojgn", name: "兽族魔力战舰", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  nw2w: { code: "nw2w", name: "兽族巫师", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  nchw: { code: "nchw", name: "邪恶的巫师", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  nchg: { code: "nchg", name: "邪恶的兽族步兵", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  nchr: { code: "nchr", name: "邪恶的掠夺者", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  nckb: { code: "nckb", name: "邪恶的科多兽", tip: "", type: Type.Unit.Orc.Campaign.Unit },
  ncpn: { code: "ncpn", name: "邪恶的苦工", tip: "", type: Type.Unit.Orc.Campaign.Unit },

  "npgr": { code: "npgr", name: "能里产生器", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "oshy": { code: "oshy", name: "兽族船坞", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nwc1": { code: "nwc1", name: "双足飞龙牢笼(1", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nwc2": { code: "nwc2", name: "双足飞龙牢笼(2", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "npgf": { code: "npgf", name: "猪圈农场", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "ndrb": { code: "ndrb", name: "龙之栖木", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nbfl": { code: "nbfl", name: "血浴之泉", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "ndfl": { code: "ndfl", name: "被污染的生命之泉", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "ocbw": { code: "ocbw", name: "邪恶兽族地洞(混乱的", tip: "", type: Type.Unit.Orc.Campaign.Building },

  "Nsjs": { code: "Nsjs", name: "陈-风暴烈酒", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Odrt": { code: "Odrt", name: "德雷克萨尔", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Ogrh": { code: "Ogrh", name: "格罗姆地狱咆哮", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Opgh": { code: "Opgh", name: "格罗姆一地狱咆哮(恶魔附体)", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Ogld": { code: "Ogld", name: "古尔丹", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Ocbh": { code: "Ocbh", name: "卡林-血蹄", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Ocb2": { code: "Ocb2", name: "卡林血蹄(资料片", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Orex": { code: "Orex", name: "雷克萨", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Orkn": { code: "Orkn", name: "洛克汗", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Othr": { code: "Othr", name: "萨尔", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Osam": { code: "Osam", name: "萨穆罗", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Nbbc": { code: "Nbbc", name: "黑岩氏族的剑圣", tip: "", type: Type.Unit.Orc.Campaign.Hero },

  "omtg": { code: "omtg", name: "马索格", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "ovlj": { code: "ovlj", name: "沃尔京", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "onzg": { code: "onzg", name: "那滋盖尔", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "negz": { code: "negz", name: "工程师加磁劳", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "nmsh": { code: "nmsh", name: "米纱", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "Otcc": { code: "Otcc", name: "卡林-血蹄(过场动画", tip: "", type: Type.Unit.Orc.Campaign.Special },
  "ngbl": { code: "ngbl", name: "地精爆破T", tip: "", type: Type.Unit.Orc.Campaign.Special },

}

const unitNightElf = {
  "ewsp": { code: "ewsp", name: "小精灵", tip: "暗夜精灵族基本的工人单位。能采集金矿和木材。还能建造精灵族的建筑物并进行修理更新。|n能自我爆炸从而伤害到周围被召唤出来的单位并吸收一定范围内所有单位的魔法值。", type: Type.Unit.NightElf.Standard.Unit },
  "earc": { code: "earc", name: "弓箭手", tip: "基本的远程攻击单位。拥有艾鲁尼之优雅技能。能学习到射击术，硬弓和驯服角鹰兽这三项技能。|n|n|cffffcc00能攻击地面和空中单位。|r ", type: Type.Unit.NightElf.Standard.Unit },
  "esen": { code: "esen", name: "女猎手", tip: "灵活的远程攻击单位，能学习到哨兵和月刃技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "edry": { code: "edry", name: "树妖", tip: "她的毒性攻击能减慢敌人的速度并慢慢地消耗敌人的生命值。她还具有驱魔技能和魔法免疫技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "ebal": { code: "ebal", name: "投刃车", tip: "远距离的攻城武器。对付建筑物特别地有效。还能得到穿刺剑刃的升级。从而能攻击树木。|n|n|cffffcc00能攻击地面单位和树木。|r", type: Type.Unit.NightElf.Standard.Unit },
  "ehip": { code: "ehip", name: "角鹰兽", tip: "近战型飞行单位。能学习到驯服角鹰兽技能。|n|n|cffffcc00能攻击空中单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "ehpr": { code: "ehpr", name: "角鹰兽骑士", tip: "弓箭手骑乘在了角鹰兽上面就成为了角鹰兽骑士。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "echm": { code: "echm", name: "奇美拉", tip: "双头飞龙。能学到腐蚀喷吐技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "edot": { code: "edot", name: "猛禽德鲁伊(暗夜精灵形态)", tip: "灵活的魔法单位。一开始就能施放精灵之火，从而能降低某个单位的护甲并让其不能隐形。随后还能学习到风暴之鸦，飓风和猛禽之痕技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "edoc": { code: "edoc", name: "利爪德鲁伊(暗夜精灵族形态)", tip: "近战型的魔法施放单位。一开始能施放咆哮技能，从而增加攻击力。随后还能学习到生命恢复，变熊和利爪之痕技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "emtg": { code: "emtg", name: "山岭巨人", tip: "大型的近战单位，善于吸收敌人的进攻。具有嘲讽和拔树技能。也能学习到硬化皮肤和抗性皮肤这两个技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Unit },
  "efdr": { code: "efdr", name: "精灵龙", tip: "小型的飞行单位，擅长伤害敌人的魔法单位。具有变相移动，魔力之焰和魔法免疫技能。|n|n|Cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Unit },

  "etol": { code: "etol", name: "生命之树", tip: "暗夜精灵族的基本建筑物。能训练小精灵和缠绕金矿。在升级到了远古之树和永恒之树之后能让玩家建造许多新的建筑物和单位。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Building },
  "etoa": { code: "etoa", name: "远古之树", tip: "升级到了远古之树之后能让玩家建造许多新的建筑物和单位。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Building },
  "etoe": { code: "etoe", name: "永恒之树", tip: "升级到了永恒之树之后能让玩家建造许多新的建筑物和单位。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Building },
  "emow": { code: "emow", name: "月亮井", tip: "提供人口，从而增加可造单位数量的最大值。还能补充暗夜精灵族单位的魔法值和生命值。在夜间它也能自我恢复魔法能量。还能得到月井之春技能的升级。", type: Type.Unit.NightElf.Standard.Building },
  "eete": { code: "eete", name: "长者祭坛", tip: "能召唤新的英雄和复活阵亡的英雄。", type: Type.Unit.NightElf.Standard.Building },
  "eaom": { code: "eaom", name: "战争古树", tip: "能生产出：弓箭手，女猎手和投刃车。|n还包括对弓箭手，女猎手和投刃车的各类升级。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Building },
  "eaoe": { code: "eaoe", name: "知识古树", tip: "能生产出暗夜精灵族的地面魔法单位：利爪德鲁伊，山岭巨人和树妖。|n还包括对利爪德鲁伊，驱魔技能，利爪之痕，硬化皮肤和抗性皮肤的升级。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Building },
  "eaow": { code: "eaow", name: "风之古树", tip: "能生产出：角鹰兽，猛禽德鲁伊和精灵龙。|n还包括对角鹰兽和猛禽德鲁伊的各类升级。比如猛禽之痕和训练角鹰兽。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Building },
  "edob": { code: "edob", name: "猎手大厅", tip: "能对所有单位的攻防进行升级，还包括对夜视能力的升级。", type: Type.Unit.NightElf.Standard.Building },
  "etrp": { code: "etrp", name: "远古守护者", tip: "防御性古树。在扎根以后，会向空中投掷大量的石块以对来犯的敌人进行反击。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Building },
  "edos": { code: "edos", name: "奇美拉栖木", tip: "能训练出奇美拉怪兽。|n还包括对腐蚀喷吐的研究。", type: Type.Unit.NightElf.Standard.Building },
  "egol": { code: "egol", name: "被缠绕的金矿", tip: "冒出一些根须缠绕在金矿上，使得小精灵能采集资源。", type: Type.Unit.NightElf.Standard.Building },
  "eden": { code: "eden", name: "奇迹古树", tip: "建造一个可以出售物品的商店。物品的类型取决于你的生命之树的升级情况(生命之树,远古之树,永恒之树)以及你当前所拥有的建筑物种类。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Building },

  "Ekee": { code: "Ekee", name: "从林守护者", tip: "一种神秘的英雄，特别擅长于自然类的魔法。能学习到纠缠根须，自然之力，荆刺光环和宁静这四项技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Hero },
  "Emoo": { code: "Emoo", name: "月之女祭司", tip: "战士型英雄，擅长于远程攻击。能学习到侦察，灼热之箭，强击光环和群星坠落这四项技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Hero },
  "Edem": { code: "Edem", name: "恶魔猎手", tip: "一种灵活的英雄，能学习到献祭，闪避法力燃烧和变身这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Hero },
  "Ewar": { code: "Ewar", name: "守望者", tip: "灵巧型英雄，能在战场上来去自如，能学习到闪烁, 刀阵旋风, 暗影突袭和复仇之魂这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Hero },

  "now1": { code: "now1", name: "猫头鹰侦察者(等级1)", tip: "", type: Type.Unit.NightElf.Standard.Special },
  "now2": { code: "now2", name: "猫头鹰侦察者(等级2)", tip: "", type: Type.Unit.NightElf.Standard.Special },
  "now3": { code: "now3", name: "猫头鹰侦察者(等级3)", tip: "", type: Type.Unit.NightElf.Standard.Special },
  "Edmm": { code: "Edmm", name: "恶魔猎手(恶魔形态)", tip: "一种灵活的英雄，能学习到献祭，闪避法力燃烧和变身这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Special },
  "edtm": { code: "edtm", name: "猛禽德鲁伊(风暴之鸦形态)", tip: "灵活的魔法单位。一开始就能施放精灵之火，从而能降低某个单位的护甲并让其不能隐形。随后还能学习到风暴之鸦，飓风和猛禽之痕技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Standard.Special },
  "edcm": { code: "edcm", name: "利爪德鲁伊(变能)", tip: "近战型的魔法施放单位。一开始能施放咆哮技能，从而增加攻击力。随后还能学习到生命恢复，变熊和利爪之痕技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.NightElf.Standard.Special },
  "efon": { code: "efon", name: "树人", tip: "", type: Type.Unit.NightElf.Standard.Special },
  "espv": { code: "espv", name: "复仇天神", tip: "", type: Type.Unit.NightElf.Standard.Special },
  "even": { code: "even", name: "复仇之魂", tip: "", type: Type.Unit.NightElf.Standard.Special },

  "enec": { code: "enec", name: "暗夜精灵信使", tip: "", type: Type.Unit.NightElf.Campaign.Unit },
  "eilw": { code: "eilw", name: "囚车", tip: "", type: Type.Unit.NightElf.Campaign.Unit },
  "nwat": { code: "nwat", name: "岗哨", tip: "", type: Type.Unit.NightElf.Campaign.Unit },
  "ensh": { code: "ensh", name: "娜萨", tip: "", type: Type.Unit.NightElf.Campaign.Unit },
  "nssh": { code: "nssh", name: "守望者", tip: "", type: Type.Unit.NightElf.Campaign.Unit },
  "eshd": { code: "eshd", name: "塞恩德里斯", tip: "", type: Type.Unit.NightElf.Campaign.Unit },
  "etrs": { code: "etrs", name: "暗夜精灵族运输船", tip: "能够运送单位的运输船。", type: Type.Unit.NightElf.Campaign.Unit },
  "edes": { code: "edes", name: "暗夜精灵族护卫舰", tip: "多功能的战斗舰船，擅长于攻击空中单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.NightElf.Campaign.Unit },
  "ebsh": { code: "ebsh", name: "暗夜精灵族战舰", tip: "强大的攻城舰船，能够很好地攻击地面建筑物和敌人的船只。|n|n|cffffcc00攻击地面单位。|r", type: Type.Unit.NightElf.Campaign.Unit },
  "nthr": { code: "nthr", name: "萨里法斯", tip: "", type: Type.Unit.NightElf.Campaign.Unit },

  "eshy": { code: "eshy", name: "暗夜精灵族船坞", tip: "船只建造工厂。能建造出暗夜精灵族的运输船，护卫舰和战舰。", type: Type.Unit.Orc.Campaign.Building },
  "nvr1": { code: "nvr1", name: "暗夜精灵族渔村(被毁坏的)", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nvr0": { code: "nvr0", name: "暗夜精灵族渔村(被毁坏的)", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nvr2": { code: "nvr2", name: "暗夜精灵族渔村(被毁坏的)", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nfv4": { code: "nfv4", name: "暗夜精灵族渔村(顶层有装饰的)", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nfv1": { code: "nfv1", name: "暗夜精灵族渔村(顶层有装饰的)", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nfv3": { code: "nfv3", name: "暗夜精灵族渔村(双层的) ", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nfv0": { code: "nfv0", name: "暗夜精灵族渔村(双层的)", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nfv2": { code: "nfv2", name: "暗夜精灵族渔村(单层的)", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "ngob": { code: "ngob", name: "魔法宝石塔", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nbwd": { code: "nbwd", name: "兽穴", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nctl": { code: "nctl", name: "生命之树", tip: "暗夜精灵族的基本建筑物。能训练小精灵和缠绕金矿。在升级到了远古之树和永恒之树之后能让玩家建造许多新的建筑物和单位。", type: Type.Unit.Orc.Campaign.Building },
  "ncta": { code: "ncta", name: "远古之树", tip: "升级到了远古之树之后能让玩家建造许多新的建筑物和单位。", type: Type.Unit.Orc.Campaign.Building },
  "ncte": { code: "ncte", name: "永恒之树", tip: "升级到了永恒之树之后能让玩家建造许多新的建筑物和单位。", type: Type.Unit.Orc.Campaign.Building },
  "ncap": { code: "ncap", name: "远古守护者", tip: "防御性的古树。当扎根于地面的时候，能投掷出巨大的石块对敌人造成伤害。|n能攻击地面和空中单位。", type: Type.Unit.Orc.Campaign.Building },
  "ncaw": { code: "ncaw", name: "战争古树", tip: "主要的产兵建筑。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Building },
  "nhcn": { code: "nhcn", name: "伴神赛纳留斯之角", tip: "", type: Type.Unit.Orc.Campaign.Building },
  "nfnp": { code: "nfnp", name: "威力之泉", tip: "", type: Type.Unit.Orc.Campaign.Building },

  "Efur": { code: "Efur", name: "法里奥", tip: "一种神秘的英雄，特别擅长于自然类的魔法。能学习到纠缠根须、自然之力、荆刺光环和宁静这四项技能。|n|n|cffffcc00攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Emfr": { code: "Emfr", name: "玛尔法里奥", tip: "一种神秘的英雄，特别擅长于自然类的魔法。能学习到纠缠根须、自然之力、荆刺光环和宁静这四项技能。|n|n|cffffcc00攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Emns": { code: "Emns", name: "玛尔法里奥(没有鹿角)", tip: "一种神秘的英雄，特别擅长于自然类的魔法。能学习到纠缠根须、自然之力、荆刺光环和宁静这四项技能。|n|n|cffffcc00攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Ewrd": { code: "Ewrd", name: "玛维", tip: "灵巧型英雄，能在战场上来去自如，能学习到闪烁、刀阵旋风、暗影突袭和复仇之魂这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Ecen": { code: "Ecen", name: "赛纳留斯", tip: "", type: Type.Unit.Orc.Campaign.Hero },
  "Etyr": { code: "Etyr", name: "泰兰德", tip: "战士型英雄，擅长于远程攻击。能学习到侦察、灼热之箭、强击光环和群星坠落这四项技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Ekgg": { code: "Ekgg", name: "幽灵", tip: "一种神秘的英雄，特别擅长于自然类的魔法。能学习到纠缠根须、自然之力、荆刺光环和宁静这四项技能。|n|n|cffffcc00攻击地面和空中单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Eill": { code: "Eill", name: "尤迪安", tip: "一种灵活的英雄，能学习到献祭、闪避、法力燃烧和变身这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Hero },
  "Eevi": { code: "Eevi", name: "尤迪安(邪恶的)", tip: "一种灵活的英雄，能学习到献祭、闪避、法力燃烧和变身这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Hero },

  "Eevm": { code: "Eevm", name: "尤迪安(Morphed)", tip: "一种灵活的英雄，能学习到献祭、闪避、法力燃烧和变身这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Special },
  "Eilm": { code: "Eilm", name: "尤迪安(被变了形的)", tip: "一种灵活的英雄，能学习到献祭、闪避、法力燃烧和变身这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Special },
  "Eidm": { code: "Eidm", name: "尤迪安(恶魔形态)", tip: "一种灵活的英雄，能学习到献祭、闪避、法力燃烧和变身这四项技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Orc.Campaign.Special },
}

const unitUndead = {
  "uaco": { code: "uaco", name: "侍僧", tip: "不死族的基本工人单位。能召唤建筑物，采集金矿和进行修复工作。在牺牲深渊里牺牲以后侍僧还可以变为阴影。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Standard.Unit },
  "ushd": { code: "ushd", name: "阴影", tip: "一个永远隐形的灵魂，能看见其他隐形单位，但是不能进攻。", type: Type.Unit.Undead.Standard.Unit },
  "ugho": { code: "ugho", name: "食尸鬼", tip: "基本的地面单位，也能采集木材。能学习到吞食尸体和食尸鬼狂热技能。|n|n|cffffcc00能攻击地面单位和树木。|r", type: Type.Unit.Undead.Standard.Unit },
  "uabo": { code: "uabo", name: "憎恶", tip: "重型的近战单位。能学习到疾病云雾和吞食尸体技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Standard.Unit },
  "umtw": { code: "umtw", name: "绞肉车", tip: "能存放尸体，也是一种远程的攻城武器。对付建筑物特别地有效，但是自己本身也移动缓慢而容易遭受攻击。还能学习到疾病云雾技能。|n|n|cffffcc00能攻击地面单位和树木。|r", type: Type.Unit.Undead.Standard.Unit },
  "ucry": { code: "ucry", name: "穴居恶魔", tip: "远程攻击单位。能学习到蛛网和钻地技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Standard.Unit },
  "ugar": { code: "ugar", name: "石像鬼", tip: "飞行单位。能学习到石像形态技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Unit },
  "uban": { code: "uban", name: "女妖", tip: "魔法单位，一开始能施放诅咒技能，从而让敌人有一定的概率击空。随后还能学习到反魔法外壳和占据魔法。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Unit },
  "unec": { code: "unec", name: "不死族巫师", tip: "一种魔法单位。一开始能施放复活死尸技能。随后还能学习到邪恶狂热和残废技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Unit },
  "uobs": { code: "uobs", name: "十胜石雕像", tip: "一种坚固的雕像，能帮助你恢复自己部队的生命值和魔法值。具有灵魂触摸，枯萎精髓技能，还可以学习到破坏者形态技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Unit },
  "ufro": { code: "ufro", name: "冰霜巨龙", tip: "重型的飞行单位，能学习到冰冻喷吐技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Unit },

  "unpl": { code: "unpl", name: "大墓地", tip: "不死族的基本建筑物。能训练出侍僧和存贮采集到木材资源。在升级到了亡者大厅和黑色城堡之后能让玩家建造许多新的建筑物和单位。", type: Type.Unit.Undead.Standard.Building },
  "unp1": { code: "unp1", name: "亡者大厅", tip: "升级到了亡者大厅之后能让玩家建造许多新的建筑物和单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Building },
  "unp2": { code: "unp2", name: "黑色城堡", tip: "升级到了亡者大厅之后能让玩家建造许多新的建筑物和单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Building },
  "uzig": { code: "uzig", name: "通灵塔", tip: "能提供人口，从而增加可造单位数量的最大值。在经过升级以后能变成一个可以攻击地面单位和空中单位的建筑物。", type: Type.Unit.Undead.Standard.Building },
  "uzg1": { code: "uzg1", name: "幽魂之塔", tip: "防御性建筑物。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Building },
  "uzg2": { code: "uzg2", name: "蛛网怪塔", tip: "升级到防御建筑，造成冰冻伤害，减慢敌人单位速度。|n|n|cffffcc00攻击地面和空中单位|r", type: Type.Unit.Undead.Standard.Building },
  "uaod": { code: "uaod", name: "黑暗禁坛", tip: "能召唤新的英雄和复活阵亡的英雄。", type: Type.Unit.Undead.Standard.Building },
  "usep": { code: "usep", name: "地穴", tip: "主要的产兵建筑物，能训练出食尸鬼，穴居恶魔和石像鬼。还包括对食尸鬼狂热，吞食尸体，石像形态，蛛网和钻地的研究。", type: Type.Unit.Undead.Standard.Building },
  "usap": { code: "usap", name: "牺牲深渊", tip: "能将侍僧转化成阴影。阴影是一种能看见敌方隐形单位的隐形单位。自己本身也不能攻击敌人。", type: Type.Unit.Undead.Standard.Building },
  "ugrv": { code: "ugrv", name: "坟场", tip: "能对不死族单位的攻防进行升级。也能产生尸体和存放收集到木材资源。", type: Type.Unit.Undead.Standard.Building },
  "uslh": { code: "uslh", name: "屠宰场", tip: "能生产出憎恶、绞肉车和十胜石雕像。还包括对疾病云雾，破坏者形态的研究。", type: Type.Unit.Undead.Standard.Building },
  "utod": { code: "utod", name: "诅咒神庙", tip: "能训练出不死族巫师和女妖。|n还包括对不死族巫师和女妖的升级，骨质增强术和骷髅法术也是在这里研究的。", type: Type.Unit.Undead.Standard.Building },
  "ubon": { code: "ubon", name: "埋骨地", tip: "能生产出霜冻巨龙。还包括对冰冻喷吐的研究。", type: Type.Unit.Undead.Standard.Building },
  "ugol": { code: "ugol", name: "闹鬼金矿", tip: "在金矿被闹鬼了之后侍僧才可以从中采集黄金资源。", type: Type.Unit.Undead.Standard.Building },
  "utom": { code: "utom", name: "古墓废墟", tip: "建造出一个能出售物品的商店。商店内的物品种类取决于你的大墓地的升级情况(大墓地, 亡者大厅, 黑色城堡)以及你所拥有的建筑物种类。", type: Type.Unit.Undead.Standard.Building },

  "Udea": { code: "Udea", name: "死亡骑士", tip: "是人族圣骑士的邪恶对手。能学习到死亡缠绕，死亡契约，邪恶光环和操纵死尸这四种技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Standard.Hero },
  "Ulic": { code: "Ulic", name: "巫妖", tip: "一种神秘的英雄，能学习到霜冻护甲，霜冻新星，黑暗仪式和死亡凋零技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Hero },
  "Udre": { code: "Udre", name: "恐惧魔王", tip: "一种狡猾的英雄，能学习到腐臭蜂群，睡眠，吸血光环和地狱火技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Standard.Hero },
  "Ucrl": { code: "Ucrl", name: "地穴领主", tip: "战士型英雄，擅长于控制昆虫进行攻击。能学习到穿刺，尖刺外壳, 腐尸甲虫和蝗虫群这四个技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Standard.Hero },

  "uloc": { code: "uloc", name: "蝗虫", tip: "", type: Type.Unit.Undead.Standard.Special },
  "uplg": { code: "uplg", name: "疾病云雾", tip: "", type: Type.Unit.Undead.Standard.Special },
  "ucrm": { code: "ucrm", name: "钻入地下的穴居恶魔", tip: "远程攻击单位。能学习到蛛网和钻地技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Standard.Special },
  "ugrm": { code: "ugrm", name: "石像形态下的石像鬼", tip: "飞行单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Special },
  "uske": { code: "uske", name: "骷髅战士", tip: "", type: Type.Unit.Undead.Standard.Special },
  "uskm": { code: "uskm", name: "骷髅魔法师", tip: "", type: Type.Unit.Undead.Standard.Special },
  "ubsp": { code: "ubsp", name: "破坏者", tip: "巨大飞行单位，必须吞噬魔法才能保持其自己的魔法能量。特别擅长于伤害敌人的魔法单位和聚集在一起的敌军。具有魔法免疫，吞噬魔法，吸收魔法和毁灭之球技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Standard.Special },
  "ucs1": { code: "ucs1", name: "腐尸甲虫(等级1)", tip: "", type: Type.Unit.Undead.Standard.Special },
  "ucs2": { code: "ucs2", name: "腐尸甲虫(等级2)", tip: "", type: Type.Unit.Undead.Standard.Special },
  "ucsB": { code: "ucsB", name: "钻入地下的腐尸甲虫(等级2)", tip: "", type: Type.Unit.Undead.Standard.Special },
  "ucs3": { code: "ucs3", name: "腐尸甲虫(等级3)", tip: "", type: Type.Unit.Undead.Standard.Special },
  "UcsC": { code: "UcsC", name: "钻入地下的腐户甲虫(等级3)", tip: "", type: Type.Unit.Undead.Standard.Special },

  "uarb": { code: "uarb", name: "飞艇", tip: "一种大批量的运输机。", type: Type.Unit.Undead.Campaign.Unit },
  "uktn": { code: "uktn", name: "克尔苏加德(不死族巫师)", tip: "", type: Type.Unit.Undead.Campaign.Unit },
  "uktg": { code: "uktg", name: "克尔苏加德(幽灵)", tip: "", type: Type.Unit.Undead.Campaign.Unit },
  "uswb": { code: "uswb", name: "追风之西尔瓦娜斯(女妖)", tip: "", type: Type.Unit.Undead.Campaign.Unit },
  "ubdd": { code: "ubdd", name: "萨皮洛恩(不死族的)", tip: "", type: Type.Unit.Undead.Campaign.Unit },
  "ubdr": { code: "ubdr", name: "萨皮洛恩(活着的)", tip: "", type: Type.Unit.Undead.Campaign.Unit },
  "ubot": { code: "ubot", name: "不死族运输船", tip: "能够运送单位的运输船。", type: Type.Unit.Undead.Campaign.Unit },
  "udes": { code: "udes", name: "不死族族护卫舰", tip: "多功能的战斗舰船，擅长于攻击空中单位。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Campaign.Unit },
  "uubs": { code: "uubs", name: "不死族战舰", tip: "强大的攻城舰船能够很好地攻击地面建筑物和敌人的船只。|n|n|cffffcc00攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Unit },
  "uzom": { code: "uzom", name: "僵尸", tip: "轻型的近战单位。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Unit },

  "ushp": { code: "ushp", name: "不死族船坞", tip: "造船工厂，能制造出不死族的运输船，护卫舰和战舰。", type: Type.Unit.Undead.Campaign.Building },
  "ushr": { code: "ushr", name: "神殿", tip: "", type: Type.Unit.Undead.Campaign.Building },
  "udmg": { code: "udmg", name: "恶魔之门", tip: "", type: Type.Unit.Undead.Campaign.Building },
  "ugni": { code: "ugni", name: "腐烂谷仓", tip: "里面都是糜烂的谷物。", type: Type.Unit.Undead.Campaign.Building },
  "ufrm": { code: "ufrm", name: "霜之哀伤底座", tip: "", type: Type.Unit.Undead.Campaign.Building },
  "ubsm": { code: "ubsm", name: "召唤底座之书", tip: "", type: Type.Unit.Undead.Campaign.Building },

  "Uear": { code: "Uear", name: "阿尔塞斯(邪恶的)", tip: "战士型英雄，是人族圣骑士的邪恶对手。能学习到死亡缠绕、死亡契约、邪恶光环和操纵死尸这四种技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Uanb": { code: "Uanb", name: "阿诺拉克", tip: "战士型英雄，擅长于控制昆虫进行攻击。能学习到穿刺、尖刺外壳、腐尸甲虫和蝗虫群这四个技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Ubal": { code: "Ubal", name: "巴那泽尔", tip: "一种狡猾的英雄，善于控制战场。能学习到腐臭蜂群、睡眠、吸血光环和地狱火技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Uvng": { code: "Uvng", name: "戴尔维恩格尔", tip: "一种狡猾的英雄，善于控制战场。能学习到腐臭蜂群、睡眠、吸血光环和地狱火技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Udth": { code: "Udth", name: "德赛洛克", tip: "一种狡猾的英雄，善于控制战场。能学习到腐臭蜂群、睡眠、吸血光环和地狱火技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Uvar": { code: "Uvar", name: "法理玛瑟斯", tip: "一种狡猾的英雄，善于控制战场。能学习到腐臭蜂群、睡眠、吸血光环和地狱火技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Uktl": { code: "Uktl", name: "克尔苏加德(巫妖)", tip: "一种神秘的英雄，特别擅长于冰系魔法。能学习到霜冻护甲、霜冻新星、黑暗仪式和死亡凋零技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Umal": { code: "Umal", name: "麦尔盖尼斯", tip: "一种狡猾的英雄，善于控制战场。能学习到腐臭蜂群、睡眠、吸血光环和地狱火技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Utic": { code: "Utic", name: "提克迪奥斯", tip: "一种狡猾的英雄，善于控制战场。能学习到腐臭蜂群、睡眠、吸血光环和地狱火技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Usyl": { code: "Usyl", name: "西尔瓦娜斯", tip: "灵巧型的英雄，擅长于与对手周旋。能学习到沉默魔法、黑暗之箭、生命汲取和符咒这四项技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Campaign.Hero },
  "Uman": { code: "Uman", name: "玛诺洛斯", tip: "", type: Type.Unit.Undead.Campaign.Hero },
  "Uwar": { code: "Uwar", name: "阿克蒙德", tip: "", type: Type.Unit.Undead.Campaign.Hero },
  "Upld": { code: "Upld", name: "阿哥勒尔", tip: "", type: Type.Unit.Undead.Campaign.Hero },
  "Uklj": { code: "Uklj", name: "基尔加丹", tip: "", type: Type.Unit.Undead.Campaign.Hero },
  "Umag": { code: "Umag", name: "麦哥瑟里登", tip: "战士型英雄，善于恐吓敌人。能学习火焰雨、恐怖嚎叫、分裂攻击和魔鬼缠身。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Hero },

  "nzlc": { code: "nzlc", name: "巫妖王(过场动画战役单位)", tip: "这就是巫妖王，事实的确是如此的，难道你不相信我么？", type: Type.Unit.Undead.Campaign.Special },
  "uabc": { code: "uabc", name: "憎恶(过场动画)", tip: "重型近战单位。可以学习疾病云雾技能。|n|n|cffffcc00能攻击地面单位。|r", type: Type.Unit.Undead.Campaign.Special },
  "Uclc": { code: "Uclc", name: "克尔苏加德(巫妖，过场动画)", tip: "一种神秘的英雄，特别擅长于冰系魔法。能学习到霜冻护甲、霜冻新星、黑暗仪式和死亡凋零技能。|n|n|cffffcc00能攻击地面和空中单位。|r", type: Type.Unit.Undead.Campaign.Special },
  "Nkjx": { code: "Nkjx", name: "基尔加丹(过场动画)", tip: "", type: Type.Unit.Undead.Campaign.Special },
}

// "": { code: "", name: "", tip: "", type: Type.Unit.Undead },

const code = { ...unitHuman, ...unitOrc, ...unitNightElf, ...unitUndead }

module.exports = {
  code, Type
}
