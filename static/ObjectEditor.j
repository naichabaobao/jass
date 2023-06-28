globals
        // 物理编辑器及额外变量对照表(绝大部分)
        // 物编以重置版为基准(v1.36),部分添加了1.27a译文,从1.27a获取了极少量重置版缺失数据
        // 物编包含单位、物品、可破坏物、技能、魔法效果（buff）、科技的四字符码、技能ID（纯数字变量不一定能识别，请手动搜索，缺少1.29后的新技能）及命令串，不含地表装饰物
        // 额外变量：地表纹理，地表纹理变化、地形设置，地形形状/刷子类型，天气特效，昼夜环境音效，主题曲，闪电特效，自定义UI/控件的框架定义，UI/控件的框架类型，图像类型，电影滤镜纹理，天空盒子，颜色值
        
        
        // 单位(很可能齐了)
        
                // 人族对战英雄
        
                // 大法师
                constant integer Hamg
                // 圣骑士
                constant integer Hpal
                // 山丘之王
                constant integer Hmkg
                // 血魔法师
                constant integer Hblm
        
        
                // 人族战役英雄及特殊人物
        
                // 阿尔萨斯
                constant integer Hart
                // 阿尔萨斯(使用霜之哀伤)
                constant integer Harf
                // 吉安娜
                constant integer Hjai
                // 穆拉丁·铜须
                constant integer Hmbr
                // 乌瑟尔
                constant integer Huht
                // 安东尼达斯
                constant integer Hgam
                // 安东尼达斯
                constant integer Hant
                // 麦迪文
                constant integer nmed
                // 麦迪文(乌鸦形态)
                constant integer nmdm
                // 加里瑟斯/加里索斯大人
                constant integer Hlgr
                // 海军上将普罗德摩尔
                constant integer Hapm
                // 兽人克星达格伦/达贡兽族屠杀者
                constant integer Hdgo
                // 尼古拉斯·布赞勋爵/尼科拉斯大人
                constant integer Hpb1
                // 格雷戈里·埃德蒙森爵士/格雷戈里爵士
                constant integer Hpb2
                // 生命使者哈拉克/哈拉生命使者
                constant integer Hhkl
                // 维护者玛古洛斯/马格罗斯守御者
                constant integer Hmgd
                // 希雷诺斯/西里诺克斯
                constant integer nser
        
        
                // 人族对战单位
        
                // 矮人直升机
                constant integer hgyr
                // 人族步兵
                constant integer hfoo
                // 狮鹫骑士
                constant integer hgry
                // 人族骑士
                constant integer hkni
                // 矮人迫机炮
                constant integer hmtm
                // 农民
                constant integer hpea
                // 牧师（人族）
                constant integer hmpr
                // 矮人火枪手
                constant integer hrif
                // 女巫(人族)
                constant integer hsor
                // 攻城坦克
                constant integer hmtt
                // 攻城坦克(火箭弹幕升级后)
                constant integer hrtt
                // 民兵
                constant integer hmil
                // 魔法破坏者(破法)
                constant integer hspt
                // 龙鹰骑士
                constant integer hdhw
                // 水元素(1级)
                constant integer hwat
                // 水元素(2级)
                constant integer hwt2
                // 水元素(3级)
                constant integer hwt3
                // 凤凰(人族)
                constant integer hphx
                // 凤凰蛋(人族)
                constant integer hpxe
        
        
                // 人族战役单位
        
                // 教士(人族)
                constant integer nchp
                // 水术师(人族)
                constant integer nhym
                // 队长(人族)/船长(人族)
                constant integer hcth
                // 狱卒卡塞恩(人族)
                constant integer njks
                // 人类运输船
                constant integer hbot
                // 人类护卫舰
                constant integer hdes
                // 人类战舰
                constant integer hbsh
                // 小孩
                constant integer nvlk
                // 小孩(2)
                constant integer nvk2
                // 村民(女性)
                constant integer nvlw
                // 村民(男性)
                constant integer nvil
                // 村民(男性2)
                constant integer nvl2
        
        
                // 人族建筑
        
                // 狮鹫笼
                constant integer hgra
                // 兵营(人族)
                constant integer hbar
                // 铁匠铺
                constant integer hbla
                // 城镇大厅(人族一本基地)
                constant integer htow
                // 主城(人族二本基地)
                constant integer hkee
                // 城堡(人族三本基地)
                constant integer hcas
                // 农场
                constant integer hhou
                // 国王祭坛
                constant integer halt
                // 伐木场
                constant integer hlum
                // 神秘圣地
                constant integer hars
                // 哨塔
                constant integer hwtw
                // 炮塔(人族)
                constant integer hctw
                // 圣塔(人族)(编辑器无此单位)
                constant integer htws
                // 防御塔(人族)
                constant integer hgtw
                // 神秘之塔(人族)
                constant integer hatw
                // 车间
                constant integer harm
                // 神秘宝藏室
                constant integer hvlt
        
        
                // 人族战役建筑
        
                // 传送门(人族)
                constant integer hprt
                // 人类船坞
                constant integer hshy
                // 寒冰宝盒
                constant integer nitb
                // 水果摊
                constant integer nfrt
                // 魔法宝库
                constant integer nmgv
                // 达拉然警戒塔
                constant integer ndgt
                // 谷仓
                constant integer ngwr
        
        
                // 兽族对战英雄
        
                // 剑圣
                constant integer Obla
                // 先知
                constant integer Ofar
                // 牛头人酋长
                constant integer Otch
                // 暗影猎手
                constant integer Oshd
        
        
                // 兽族战役英雄及特殊人物
        
                // 格罗玛什·地狱咆哮
                constant integer Ogrh
                // 格罗玛什·地狱咆哮(喝下恶魔之血/着魔的)
                constant integer Opgh
                // 黑石氏族剑圣
                constant integer Nbbc
                // 萨尔
                constant integer Othr
                // 萨尔(无座骑)
                // @version 1.32
                constant integer Oths
                // 加索克
                constant integer ogrk
                // 达克苏尔
                constant integer odkt
                // 贝恩
                constant integer obai
                // 沃金
                constant integer ovlj
                // 马索格
                constant integer omtg
                // 纳兹格雷尔
                constant integer onzg
                // 工程师加兹鲁维
                constant integer negz
                // 米纱
                constant integer nmsh
                // 凯恩·血蹄(过场动画)
                constant integer Otcc
                // 凯恩·血蹄
                constant integer Ocbh
                // 凯恩·血蹄(资料片)
                constant integer Ocb2
                // 古尔丹
                constant integer Ogld
                // 德雷克塔尔
                constant integer Odrt
                // 洛坎
                constant integer Orkn
                // 萨穆罗
                constant integer Osam
                // 陈·风暴烈酒
                constant integer Nsjs
                // 雷克萨
                constant integer Orex
        
        
                // 兽族对战单位
        
                // 兽族步兵(编辑器无此单位)
                constant integer oang
                // 投石车
                constant integer ocat
                // 巫医
                constant integer odoc
                // 兽族步兵
                constant integer ogru
                // 猎头者
                constant integer ohun
                // 狂战士(猎头升级后)
                constant integer otbk
                // 科多兽
                constant integer okod
                // 苦工
                constant integer opeo
                // 狼骑兵
                constant integer orai
                // 萨满祭司
                constant integer oshm
                // 牛头人
                constant integer otau
                // 驭风者
                constant integer owyv
                // 蝙蝠骑士
                constant integer otbr
                // 灵魂行者
                constant integer ospw
                // 灵魂行者(虚无形态)
                constant integer ospm
                // 监视结界(单位)
                constant integer nwad
                // 警戒结界(单位)
                constant integer oeye
                // 治疗结界(单位)
                constant integer ohwd
                // 毒蛇结界(1级)(单位)
                constant integer osp1
                // 毒蛇结界(2级)(单位)
                constant integer osp2
                // 毒蛇结界(3级)(单位)
                constant integer osp3
                // 毒蛇结界(4级)(单位)
                constant integer osp4
                // 静滞陷阱(单位)
                constant integer otot
                // 幽灵狼(1级)
                constant integer osw1
                // 恐狼(2级)
                constant integer osw2
                // 影狼(3级)
                constant integer osw3
        
        
                // 兽族建筑
        
                // 风暴祭坛
                constant integer oalt
                // 兵营(兽族)
                constant integer obar
                // 兽栏
                constant integer obea
                // 战争磨坊
                constant integer ofor
                // 大厅(兽人一本基地)
                constant integer ogre
                // 据点(兽人二本基地)
                constant integer ostr
                // 堡垒(兽人三本基地)
                constant integer ofrt
                // 灵魂小屋
                constant integer osld
                // 兽人地洞
                constant integer otrb
                // 牛头人图腾
                constant integer otto
                // 了望塔
                constant integer owtw
                // 巫毒小屋
                constant integer ovln
        
        
                // 魔兽争霸2兽族单位
        
                // 食人魔法师
                constant integer nomg
                // 红色巨龙
                constant integer nrwm
                // 地精自爆工兵
                constant integer ngsp
                // 地精飞艇
                constant integer nzep
                // 兽人术士
                constant integer nw2w
                // 猪圈
                constant integer npgf
        
        
                // 兽族战役单位
        
                // 奴隶主
                constant integer owad
                // 兽人督军
                constant integer owar
                // 邪兽人步兵
                constant integer nchg
                // 邪兽人术士
                constant integer nchw
                // 邪兽人狼骑兵
                constant integer nchr
                // 邪兽人苦工
                constant integer ncpn
                // 邪兽人科多兽
                constant integer nckb
                // 邪兽人地洞(混乱)
                constant integer ocbw
                // 兽人船坞
                constant integer ocbw
                // 巨龙栖地
                constant integer ndrb
                // 鲜血之泉
                constant integer nbfl
                // 被污染的生命之泉
                constant integer ndfl
                // 能量产生器
                constant integer npgr
                // 驭风者牢笼(1)
                constant integer nwc1
                // 驭风者牢笼(2)
                constant integer nwc2
                // 驭风者牢笼(3)
                constant integer nwc3
                // 驭风者牢笼(4)
                constant integer nwc4
                // 支柱(单位)
                constant integer nspc
                // 科多兽(无骑手)
                constant integer oosc
                // 灵魂驭风者
                constant integer oswy
                // 驭风者(无骑手)
                constant integer ownr
                // 地精爆破者
                constant integer ngbl
                // 兽人运输船
                constant integer obot
                // 兽人护卫舰
                constant integer odes
                // 兽人毁灭战舰
                constant integer ojgn
        
        
                // 不死族对战英雄
        
                // 死亡骑士
                constant integer Udea
                // 恐惧魔王
                constant integer Udre
                // 巫妖
                constant integer Ulic
                // 地穴领主
                constant integer Ucrl
        
        
                // 不死族战役英雄及人物
        
                // 玛尔加尼斯
                constant integer Umal
                // 提克迪奥斯
                constant integer Utic
                // 阿兹加洛
                constant integer Npld
                // 迪瑟洛克
                constant integer Udth
                // 玛诺洛斯
                constant integer Nman
                // 阿克蒙德
                constant integer Uwar
                // 基尔加丹
                constant integer Nklj
                // 基尔加丹(过场动画)
                constant integer Nkjx
                // 克尔苏加德(巫妖)
                constant integer Uktl
                // 克尔苏加德(巫妖、过场动画)
                constant integer Uclc
                // 巫妖王(过场动画)
                constant integer nzlc
                // 巴纳扎尔
                constant integer Ubal
                // 希尔瓦娜斯
                constant integer Usyl
                // 瓦里玛萨斯
                constant integer Uvar
                // 达文格尔
                constant integer Uvng
                // 阿努巴拉克
                constant integer Uanb
                // 阿尔萨斯(邪恶)
                constant integer Uear
        
        
                // 不死族对战单位
        
                // 憎恶
                constant integer uabo
                // 侍僧
                constant integer uaco
                // 女妖
                constant integer uban
                // 地穴恶魔
                constant integer ucry
                // 冰霜巨龙
                constant integer ufro
                // 石像鬼
                constant integer ugar
                // 石像鬼石像形态
                constant integer ugrm
                // 食尸鬼
                constant integer ugho
                // 清道夫(绞肉机)
                constant integer umtw
                // 通灵师(亡灵男巫)
                constant integer unec
                // 影魔(阴影)
                constant integer ushd
                // 黑曜石雕像
                constant integer uobs
                // 毁灭者
                constant integer ubsp
                // 骷髅战士
                constant integer uske
                // 骷髅法师
                constant integer uskm
                // 钻地的地穴恶魔
                constant integer ucrm
                // 钻地的腐尸甲虫(2级)
                constant integer ucsB
                // 钻地的腐尸甲虫(3级)
                constant integer ucsC
                // 腐尸甲虫(1级)
                constant integer ucs1
                // 腐尸甲虫(2级)
                constant integer ucs2
                // 腐尸甲虫(3级)
                constant integer ucs3
                // 疾病之云(单位)
                constant integer uplg
                // 蝗虫(单位)
                constant integer uloc
                // 石像鬼石像形态
                constant integer ugrm
        
        
                // 不死族建筑
        
                // 闹鬼金矿
                constant integer ugol
                // 黑暗祭坛
                constant integer uaod
                // 埋骨地
                constant integer ubon
                // 某种尖塔(不死族)(编辑器无此单位)
                constant integer ugsp
                // 浮空城(大墓地)
                constant integer unpl
                // 亡者大厅
                constant integer unp1
                // 黑色城堡
                constant integer unp2
                // 献祭深渊
                constant integer usap
                // 地穴(不死族兵营)
                constant integer usep
                // 屠宰场
                constant integer uslh
                // 诅咒神殿
                constant integer utod
                // 通灵塔
                constant integer uzig
                // 幽魂之塔
                constant integer uzg1
                // 蛛魔之塔(冰塔)
                constant integer uzg2
                // 坟场
                constant integer ugrv
                // 遗物陵墓
                constant integer utom
        
        
                // 不死族战役单位
        
                // 僵尸
                constant integer nzom
                // 僵尸(女性)
                // @version 1.32
                constant integer nzof
                // 亡灵运输船
                constant integer ubot
                // 亡灵护卫舰
                constant integer udes
                // 亡灵战舰
                constant integer uubs
                // 邪灵空艇
                constant integer uarb
                // 憎恶(过场动画)
                constant integer uabc
        
        
                // 不死族战役建筑
        
                // 神龛
                constant integer nshr
                // 恶魔之门
                constant integer ndmg
                // 被污染的谷仓
                constant integer ngni
                // 霜之哀伤底座
                constant integer nfrm
                // 召唤之书底座
                constant integer nbsm
                // 亡灵船坞
                constant integer ushp
        
        
                // 暗夜精灵族对战英雄
        
                // 恶魔猎手
                constant integer Edem
                // 恶魔猎手(变身形态)
                constant integer Edmm
                // 丛林守护者
                constant integer Ekee
                // 月之女祭司
                constant integer Emoo
                // 月之女祭司
                constant integer MOON_PRIESTESS
                // 守望者
                constant integer Ewar
        
        
                // 暗夜精灵族战役英雄及人物
        
                // 塞纳留斯
                constant integer Ecen
                // 伊利丹
                constant integer Eill
                // 伊利丹(邪恶)
                constant integer Eevi
                // 伊利丹(恶魔变形)
                constant integer Eilm
                // 伊利丹(恶魔变形)
                constant integer Eevm
                // 伊利丹(恶魔形态)
                constant integer Eidm
                // 玛維
                constant integer Ewrd
                // 玛法里奥
                constant integer Emfr
                // 玛法里奥
                constant integer Efur
                // 玛法里奥(未骑鹿)
                constant integer Emns
                // 泰栏德
                constant integer Etyr
                // 珊蒂斯(暗夜精灵族)
                constant integer eshd
                // 娜萨(暗夜精灵族)
                constant integer ensh
                // 萨里法斯(暗夜精灵族)
                constant integer nthr
                // 珊蒂斯(暗夜精灵族)
                constant integer eshd
                // 幽魂(暗夜精灵族)
                constant integer Ekgg
        
        
                // 暗夜精灵族单位
        
                // 小精灵
                constant integer ewsp
                // 弓箭手
                constant integer earc
                // 猛禽德鲁伊(鸟德)(人形)
                constant integer edot
                // 猛禽德鲁伊(鸟德)(鸦形)
                constant integer edtm
                // 投刃车
                constant integer ebal
                // 利爪德鲁伊(熊德)(人形)
                constant integer edoc
                // 利爪德鲁伊(熊德)(熊形)
                constant integer edcm
                // 树妖(小鹿)
                constant integer edry
                // 角鹰兽
                constant integer ehip
                // 角鹰兽骑士
                constant integer ehpr
                // 女猎手
                constant integer esen
                // 奇美拉
                constant integer echm
                // 山岭巨人
                constant integer emtg
                // 精灵龙
                constant integer efdr
                // 树人
                constant integer efon
                // 复仇的化身
                constant integer espv
                // 复仇之魂
                constant integer even
                // 猫头鹰斥候(1级)
                constant integer nowl
                // 猫头鹰斥候(2级)
                constant integer now2
                // 猫头鹰斥候(3级)
                constant integer now3
        
        
                // 暗夜精灵族战役单位
        
                // 暗夜精灵运输船
                constant integer etrs
                // 暗夜精灵护卫舰
                constant integer edes
                // 暗夜精灵战舰
                constant integer ebsh
                // 暗夜精灵信使
                constant integer ebsh
                // 囚车(暗夜精灵族)
                constant integer eilw
                // 哨兵(暗夜精灵族)
                constant integer nwat
                // 守望者(暗夜精灵族)
                constant integer nssn
        
        
                // 暗夜精灵族建筑
        
                // 知识古树
                constant integer eaoe
                // 战争古树
                constant integer eaom
                // 风之古树
                constant integer eaow
                // 生命之树(暗夜一本)
                constant integer etol
                // 纪元之树(暗夜二本)
                constant integer etoa
                // 永恒之树(暗夜三本)
                constant integer etoe
                // 守护古树
                constant integer etrp
                // 长者祭坛
                constant integer eate
                // 熊窝(暗夜精灵族)(编辑器无此单位)
                constant integer edol
                // 奇美拉栖木
                constant integer edos
                // 猎手大厅
                constant integer edob
                // 月亮井
                constant integer emow
                // 被缠绕的金矿
                constant integer egol
                // 奇迹古树
                constant integer eden
        
        
                // 暗夜精灵族战役建筑
        
                // 塞纳留斯之角底座
                constant integer nhcn
                // 威能之泉
                constant integer nfnp
                // 兽穴(暗夜精灵族)
                constant integer nbwd
                // 暗夜精灵渔村(单层)
                constant integer nfv2
                // 暗夜精灵渔村(双层、面向东南)
                constant integer nfv3
                // 暗夜精灵渔村(双层、面向西南)
                constant integer nfv0
                // 暗夜精灵渔村(有顶饰、面向东南)
                constant integer nfv4
                // 暗夜精灵渔村(有顶饰、面向西南)
                constant integer nfv1
                // 暗夜精灵渔村(被毁坏的)
                constant integer nvr1
                // 暗夜精灵渔村(被毁坏的)
                constant integer nvr2
                // 暗夜精灵渔村(被毁坏的)
                constant integer nvr0
                // 暗夜精灵船坞
                constant integer eshy
                // 附魔宝石方尖碑(暗夜精灵族)
                constant integer ngob
        
        
                //腐化的暗夜精灵族/萨特族单位
        
                // 萨特
                constant integer nsty
                // 萨特欺诈者
                constant integer nsat
                // 萨特影舞者
                constant integer nsts
                // 萨特窃魂者
                constant integer nstl
                // 萨特唤魔者
                constant integer nsth
                // 腐化的树人
                constant integer nenc
                // 剧毒树人
                constant integer nenp
                // 瘟疫树人
                constant integer nepl
        
        
                // 腐化的暗夜精灵族/萨特族建筑
        
                // 腐化的生命之树
                constant integer nctl
                // 腐化的纪元之树
                constant integer ncta
                // 腐化的永恒之树
                constant integer ncte
                // 腐化的月亮井
                constant integer ncmw
                // 腐化的守护古树
                constant integer ncap
                // 腐化的战争古树
                constant integer ncaw
        
        
        
                // 高等精灵族/血精灵族战役英雄及人物
        
                // 安纳斯特里亚·逐日者
                // @version 1.32
                constant integer Hssa
                // 萨洛瑞安·寻晨者
                // @version 1.32
                constant integer Hddt
                // 卡尔萨斯
                constant integer Hkal
                // 求知者凯伦
                // @version 1.32
                constant integer Haah
                // 婕娜拉·晓春
                // @version 1.32
                constant integer Hjnd
                // 希尔瓦娜斯·风行者
                constant integer Hvwd
        
        
                // 高等精灵族/血精灵族战役单位
        
                // 弓箭手(高等精灵)
                constant integer nhea
                // 剑士(高等精灵)
                constant integer hhes
                // 龙鹰(高等精灵)
                constant integer nws1
                // 信使(高等精灵)
                // @version 1.32
                constant integer hrrh
                // 特使(高等精灵)/使者(高等精灵)
                constant integer nemi
                // 高等精灵(女性)
                constant integer nhef
                // 高等精灵(男性)
                constant integer nhem
                // 血精灵副官/血精灵中尉
                constant integer nbel
                // 血精灵牧师
                // @version 1.32
                constant integer hbep
                // 血精灵女巫
                // @version 1.32
                constant integer hbes
                // 血精灵工人/工人(血精灵)
                constant integer nhew
                // 血精灵工程师
                constant integer nbee
                // 货车/车
                constant integer hbew
        
        
                // 高等精灵族/血精灵族战役建筑
        
                // 高等精灵农场
                constant integer nefm
                // 高等精灵农场1
                constant integer nef0
                // 高等精灵农场2
                constant integer nef1
                // 高等精灵农场3
                constant integer nef2
                // 高等精灵农场4
                constant integer nef3
                // 高等精灵农场5
                constant integer nef4
                // 高等精灵农场6
                constant integer nef5
                // 高等精灵农场7
                constant integer nef6
                // 高等精灵农场8
                constant integer nef7
                // 奥术瞭望台
                constant integer haro
                // 高等精灵警戒塔
                constant integer negt
                // 天怒塔
                constant integer negm
                // 地怒塔
                constant integer negf
                // 冰霜塔
                constant integer ndt1
                // 高级冰霜塔
                constant integer ndt2
                // 巨石塔
                constant integer nbt1
                // 高级巨石塔
                constant integer nbt2
                // 死亡塔
                constant integer ntt1
                // 高级死亡塔
                constant integer ntt2
                // 火焰塔
                constant integer nft1
                // 高级火焰塔
                constant integer nft2
                // 能量塔
                constant integer net1
                // 高级能量塔
                constant integer net2
                // 高等精灵兵营
                constant integer nheb
        
        
                // 达拉内尔族(破碎者)英雄
        
                // 阿卡玛(达拉内尔族(破碎者))
                constant integer Naka
        
        
                // 达拉内尔族(破碎者)单位
        
                // 德莱尼工人(达拉内尔族(破碎者))
                constant integer ndrl
                // 德莱尼守备官(达拉内尔族(破碎者))
                constant integer ndrn
                // 德莱尼追猎者(达拉内尔族(破碎者))
                constant integer ndrt
                // 德莱尼守卫(达拉内尔族(破碎者))
                constant integer ndrf
                // 德莱尼保护者(达拉内尔族(破碎者))
                constant integer ndrp
                // 德莱尼信徒(达拉内尔族(破碎者))
                constant integer ndrm
                // 德莱尼哨兵(达拉内尔族(破碎者))
                constant integer ndrw
                // 德莱尼先驱(达拉内尔族(破碎者))
                constant integer ndrh
                // 德莱尼屠魔者(达拉内尔族(破碎者))
                constant integer ndrd
                // 德莱尼先知(达拉内尔族(破碎者))
                constant integer ndrs
                // 德莱尼投石车(达拉内尔族(破碎者))
                constant integer ncat
                // 火蜥蜴
                constant integer ndsa
        
        
                // 达拉内尔族(破碎者)建筑
        
                // 先知陋室(达拉内尔族(破碎者))
                constant integer ndh4
                // 德莱尼兵营(达拉内尔族(破碎者))
                constant integer ndh3
                // 德莱尼避难所(达拉内尔族(破碎者))
                constant integer ndh2
                // 德莱尼小屋(达拉内尔族(破碎者))
                constant integer ndh0
                // 德莱尼小屋 2(达拉内尔族(破碎者))
                constant integer ndh1
                // 德莱尼酋长小屋(达拉内尔族(破碎者))
                constant integer ndch
        
        
                // 酒馆英雄
        
                // 炼金术士(普通形态)
                constant integer Nalc
                // 炼金术士(变形 1级)
                constant integer Nalm
                // 炼金术士(变形 2级)
                constant integer Nal2
                // 炼金术士(变形 3级)
                constant integer Nal3
                // 海巫(娜迦族)
                constant integer Nngs
                // 修补匠(常规形态)
                constant integer Ntin
                // 修补匠(变身)
                constant integer Nrob
                // 兽王
                constant integer Nbst
                // 深渊领主
                constant integer Nplh
                // 炎魔领主
                constant integer Nfir
                // 熊猫酒仙
                constant integer Npbm
                // 黑暗游侠
                constant integer Nbrn
        
        
                // 特殊英雄
        
                // 鱼人巫师
                constant integer Nmsr
        
        
                // 娜迦族英雄
        
                // 海巫(娜迦族)(非酒馆出售)
                constant integer Nswt
                // 瓦斯琪
                constant integer Hvsh
        
        
                // 娜迦族单位
        
                // 毒鳍龙
                constant integer nsnp
                // 纳迦海妖
                constant integer nnsw
                // 飞蛇
                constant integer nwgs
                // 龙龟(娜迦族)
                constant integer nhyc
                // 深海鱼人奴隶(娜迦族)
                constant integer nmpe
                // 纳迦侍从
                constant integer nmyr
                // 深海鱼人掠夺者(娜迦族)
                constant integer nnmg
                // 纳迦皇家卫兵
                constant integer nnrg
                // 召唤者(娜迦族)
                constant integer nnsu
                // 潜水的毒鳍龙
                constant integer nsbs
                // 潜水的纳迦侍从
                constant integer nmys
                // 潜水的纳迦皇家卫兵
                constant integer nnrs
        
        
                // 娜迦建筑
        
                // 潮汐神殿
                constant integer nntt
                // 珊瑚礁
                constant integer nnfm
                // 艾萨拉圣所
                constant integer nnsa
                // 孵化场
                constant integer nnsg
                // 潮汐守卫
                constant integer nntg
                // 深渊祭坛
                constant integer nnad
        
        
                // 小动物
        
                // 企鹅
                constant integer npng
                // 信天翁
                constant integer nalb
                // 兔子
                constant integer necr
                // 寄居蟹
                constant integer nhmc
                // 小蜥蜴
                constant integer nskk
                // 小鸡
                constant integer nech
                // 沙虫
                constant integer ndwm
                // 浣熊
                constant integer nrac
                // 海豹
                constant integer nsea
                // 狗
                constant integer ndog
                // 猪
                constant integer npig
                // 白色猫头鹰
                constant integer nsno
                // 秃鹫
                constant integer nvul
                // 绵羊
                constant integer nshe
                // 老鼠
                constant integer nrat
                // 螃蟹
                constant integer ncrb
                // 邪能野猪
                constant integer nfbr
                // 雄鹿
                constant integer nder
                // 青蛙
                constant integer nfro
                // 企鹅(水生的)
                constant integer npnw
                // 绵羊(两栖)
                constant integer nsha
                // 绵羊(水生的)
                constant integer nshf
                // 看门狗
                constant integer ngog
        
        
                // 中立单位
        
                // 恶魔猎犬
                constant integer nfel
                // 地狱火
                constant integer ninf
                // 末日守卫(标准)
                constant integer nbal
                // 末日守卫(召唤)
                constant integer nba2
                // 骷髅战士
                constant integer nske
                // 骷髅弓箭手
                constant integer nska
                // 骷髅神射手
                constant integer nskm
                // 燃烧弓箭手
                constant integer nskf
                // 巨型骷髅战士
                constant integer nskg
                // 骷髅弓箭手
                constant integer nsca
                // 骷髅战士
                constant integer nsce
                // 虾兵召唤物
                constant integer nlps
                // 水栖奴仆(1级)
                constant integer ncfs
                // 水栖奴仆(2级)
                constant integer ncws
                // 水栖奴仆(3级)
                constant integer ncns
                // 灵魂猪
                constant integer nspp
                // 熊怪
                constant integer nfrl
                // 熊怪追踪者
                constant integer nfrb
                // 熊怪萨满
                constant integer nfrs
                // 熊怪勇士
                constant integer nfrg
                // 巨熊怪战士
                constant integer nfra
                // 熊怪萨满长者
                constant integer nfre
                // 火蜥蜴幼崽
                constant integer nslh
                // 火蜥蜴
                constant integer nslr
                // 火蜥蜴元老
                constant integer nslv
                // 火蜥蜴领主
                constant integer nsll
                // 海龟幼崽
                constant integer ntrh
                // 海龟
                constant integer ntrs
                // 巨型海龟
                constant integer ntrt
                // 超巨型海龟
                constant integer ntrg
                // 龙龟
                constant integer ntrd
                // 强盗
                constant integer nban
                // 土匪
                constant integer nbrg
                // 流寇
                constant integer nrog
                // 打手
                constant integer nenf
                // 强盗头子
                constant integer nbld
                // 刺客
                constant integer nass
                // 黑色雏龙
                constant integer nbdr
                // 黑色幼龙
                constant integer nbdk
                // 黑色巨龙
                constant integer nbwm
                // 红色雏龙
                constant integer nrdk
                // 红色幼龙
                constant integer nrdr
                // 蓝色雏龙
                constant integer nadw
                // 蓝色幼龙
                constant integer nadk
                // 蓝色巨龙
                constant integer nadr
                // 蓝色龙人干涉者
                constant integer nbdm
                // 蓝色龙人战士
                constant integer nbdw
                // 蓝色龙人督察
                constant integer nbdo
                // 蓝色龙人学徒
                constant integer nbda
                // 蓝色龙人巫师
                constant integer nbds
                // 青铜雏龙
                constant integer nbzw
                // 青铜幼龙
                constant integer nbzk
                // 青铜巨龙
                constant integer nbzd
                // 绿色雏龙
                constant integer ngrw
                // 绿色幼龙
                constant integer ngdk
                // 绿色巨龙
                constant integer ngrd
                // 虚空龙幼崽
                constant integer nnht
                // 虚空幼龙
                constant integer nndk
                // 虚空龙
                constant integer nndr
                // 半人马弓箭手
                constant integer ncea
                // 半人马穿刺者
                constant integer ncim
                // 半人马先驱者
                constant integer ncen
                // 半人马苦工
                constant integer ncer
                // 半人马女巫/半人马巫师
                constant integer ncks
                // 半人马可汗
                constant integer ncnk
                // 黑暗巨魔高阶祭司
                constant integer ndth
                // 黑暗巨魔暗影祭司
                constant integer ndtp
                // 黑暗巨魔狂战士
                constant integer ndtb
                // 黑暗巨魔督军
                constant integer ndtw
                // 黑暗巨魔
                constant integer ndtr
                // 黑暗巨魔诱捕者
                constant integer ndtt
                // 森林巨魔高阶祭司
                constant integer nfsh
                // 森林巨魔暗影祭司
                constant integer nfsp
                // 森林巨魔
                constant integer nftr
                // 森林巨魔狂战士
                constant integer nftb
                // 森林巨魔诱捕者
                constant integer nftt
                // 森林巨魔督军
                constant integer nftk
                // 冰巨魔
                constant integer nitr
                // 冰巨魔狂战士
                constant integer nits
                // 冰巨魔诱捕者
                constant integer nitt
                // 冰巨魔督军
                constant integer nitw
                // 冰巨魔高阶祭司
                constant integer nith
                // 冰巨魔牧师
                constant integer nitp
                // 幽魂
                constant integer ngh1
                // 怨灵
                constant integer ngh2
                // 狂暴元素
                constant integer nelb
                // 暴怒元素
                constant integer nele
                // 泥土魔像
                constant integer ngrk
                // 岩石魔像
                constant integer ngst
                // 花岗岩魔像
                constant integer nggr
                // 战斗魔像
                constant integer narg
                // 战争魔像
                constant integer nwrg
                // 攻城魔像
                constant integer nsgg
                // 豺狼人偷猎者
                constant integer ngna
                // 豺狼人刺客
                constant integer ngns
                // 豺狼人
                constant integer ngno
                // 豺狼人蛮兵
                constant integer ngnb
                // 豺狼人看守
                constant integer ngnw
                // 豺狼人督察
                constant integer ngnv
                // 鹰身人斥候
                constant integer nhar
                // 鹰身人流寇
                constant integer nhrr
                // 鹰身人风女巫
                constant integer nhrw
                // 鹰身人风暴巫婆
                constant integer nhrh
                // 鹰身人女王
                constant integer nhrq
                // 堕落牧师
                constant integer nhfp
                // 欺诈者
                constant integer nhdc
                // 异教徒
                constant integer nhhr
                // 狗头人
                constant integer nkob
                // 狗头人地卜师
                constant integer nkog
                // 狗头人监工
                constant integer nkol
                // 狗头人隧道工
                constant integer nkot
                // 怪兽诱饵
                constant integer nlur
                // 闪电蜥蜴
                constant integer nltl
                // 雷霆蜥蜴
                constant integer nthl
                // 风暴巨蜥
                constant integer nstw
                // 野枭兽
                constant integer nowb
                // 暴怒野枭兽/暴怒枭熊
                constant integer nowe
                // 狂暴野枭兽/狂暴枭兽
                constant integer nowk
                // 钢鬃斥候
                constant integer nrzs
                // 钢鬃蛮兵
                constant integer nrzb
                // 钢鬃医师
                constant integer nrzm
                // 钢鬃酋长
                constant integer nrzg
                // 野猪人
                constant integer nrzt
                // 野猪人猎手
                constant integer nqbh
                // 小蜘蛛
                constant integer nspd
                // 蛛魔战士
                constant integer nnwa
                // 蛛魔织网者
                constant integer nnwl
                // 蛛魔蜘蛛领主
                constant integer nnws
                // 蛛魔先知
                constant integer nnwr
                // 蛛魔女王
                constant integer nnwq
                // 火焰亡魂
                constant integer nrvf
                // 冰霜亡魂
                constant integer nrvs
                // 闪电亡魂
                constant integer nrvl
                // 冰雪亡魂
                constant integer nrvi
                // 死灵亡魂
                constant integer nrvd
                // 食人魔战士
                constant integer nogr
                // 食人魔重殴者
                constant integer nogm
                // 食人魔领主
                constant integer nogl
                // 淤泥怪奴仆
                constant integer nslm
                // 淤泥怪抛掷者
                constant integer nslf
                // 淤泥怪畸体
                constant integer nsln
                // 黑蜘蛛
                constant integer nspb
                // 蜘蛛
                constant integer nspr
                // 巨型蜘蛛
                constant integer nsgt
                // 喷毒蜘蛛
                constant integer nssp
                // 虫母
                constant integer nsbm
                // 森林蜘蛛
                constant integer nspg
                // 野人
                constant integer nsqt
                // 古老野人
                constant integer nsqe
                // 野人神谕者
                constant integer nsqo
                // 远古野人
                constant integer nsqa
                // 雪怪
                constant integer nwen
                // 森林狼
                constant integer nwlt
                // 巨狼
                constant integer nwlg
                // 恐狼
                constant integer nwld
                // 霜狼
                constant integer nwwf
                // 巨型霜狼
                constant integer nwwg
                // 恐怖霜狼
                constant integer nwwd
                // 古老雪怪
                constant integer nwnr
                // 远古雪怪
                constant integer nwna
                // 雪怪萨满
                constant integer nwns
                // 流寇巫师
                constant integer nwzr
                // 变节巫师
                constant integer nwzg
                // 巫师学徒
                constant integer nwiz
                // 黑暗巫师
                constant integer nwzd
                // 多头蛇
                constant integer nhyd
                // 多头蛇幼崽
                constant integer nhyh
                // 古老多头蛇
                constant integer nehy
                // 远古多头蛇
                constant integer nahy
                // 虾兵龙虾人
                constant integer nlpr
                // 虾兵召唤物
                constant integer nlps
                // 龙虾人唤潮者
                constant integer nltc
                // 龙虾人池居者
                constant integer nlpd
                // 龙虾人先知
                constant integer nlds
                // 硬钳龙虾人
                constant integer nlsn
                // 龙虾人潮汐领主
                constant integer nlkl
                // 鱼人食腐者
                constant integer nmfs
                // 鱼人变异者
                constant integer nmmu
                // 鱼人瘟疫使者
                constant integer nmpg
                // 鱼人奔潮者
                constant integer nmrl
                // 鱼人猎手
                constant integer nmrr
                // 鱼人夜行者
                constant integer nmrm
                // 深海峭壁鱼人
                constant integer nmcf
                // 深海血腮鱼人
                constant integer nmbg
                // 深海鱼人潮汐战士
                constant integer nmtw
                // 深海鱼人猎捕者
                constant integer nmsn
                // 深海鱼人掠夺者
                constant integer nmrv
                // 深海鱼人暗影法师
                constant integer nmsc
                // 蜘蛛蟹岸行者
                constant integer nscb
                // 潮汐亡魂
                constant integer ntrv
                // 海洋亡魂
                constant integer nsrv
                // 深渊亡魂
                constant integer ndrv
                // 深海领主亡魂
                constant integer nlrv
                // 暗礁元素
                constant integer nrel
                // 海元素
                constant integer nsel
                // 海巨人
                constant integer nsgn
                // 海巨人猎手
                constant integer nsgh
                // 海巨人巨怪
                constant integer nsgb
                // 骷髅兽人
                constant integer nsko
                // 骷髅兽人步兵
                constant integer nsog
                // 骷髅兽人勇士
                constant integer nsoc
                // 暴掠学徒
                constant integer nsra
                // 暴掠隐士
                constant integer nsrh
                // 暴掠通灵侍僧
                constant integer nsrn
                // 暴掠术士
                constant integer nsrw
                // 原始熊猫人
                constant integer nfrp
                // 蜘蛛蟹肢解者
                constant integer nsc2
                // 蜘蛛蟹巨怪
                constant integer nsc3
                // 猛犸象
                constant integer nmam
                // 冰牙猛犸象
                constant integer nmit
                // 恐怖猛犸象
                constant integer nmdr
                // 猛犸人战士
                constant integer nmgw
                // 猛犸人掠夺者
                constant integer nmgr
                // 猛犸人毁灭者
                constant integer nmgd
                // 海象人斗士
                constant integer ntkf
                // 海象人长矛手
                constant integer ntka
                // 海象人战士
                constant integer ntkw
                // 海象人诱捕者
                constant integer ntkt
                // 海象人酋长
                constant integer ntkc
                // 海象人医师
                constant integer ntkh
                // 海象人巫师
                constant integer ntks
                // 水晶蛛蝎
                constant integer nanc
                // 尖刺蛛蝎
                constant integer nanb
                // 尖刺蛛蝎
                constant integer nanm
                // 蛛蝎战士
                constant integer nanw
                // 蛛蝎掘地者
                constant integer nane
                // 蛛蝎主宰
                constant integer nano
                // 无面欺诈者
                constant integer nfor
                // 无面恐魔
                constant integer nfot
                // 无面死亡使者
                constant integer nfod
                // 不灭黑暗猎手
                constant integer nubk
                // 不灭狂暴者
                constant integer nubr
                // 不灭黑暗编织者
                constant integer nubw
                // 北极熊
                constant integer nplb
                // 巨型北极熊
                constant integer nplg
                // 北极熊怪
                constant integer nfpl
                // 北极熊怪勇士
                constant integer nfpc
                // 北极熊怪萨满长者
                constant integer nfpe
                // 北极熊怪萨满
                constant integer nfps
                // 北极巨熊怪战士
                constant integer nfpu
                // 北极熊怪追踪者
                constant integer nfpt
                // 邪能兽
                constant integer npfl
                // 邪能破坏者
                constant integer npfm
                // 魅魔
                constant integer ndqn
                // 邪恶折磨者
                constant integer ndqv
                // 邪恶女妖
                constant integer ndqt
                // 痛苦魔女
                constant integer ndqp
                // 苦难女王
                constant integer ndqs
                // 恶魔卫士
                constant integer nfgu
                // 血怪
                constant integer nfgb
                // 主宰
                constant integer nfov
                // 地狱火机关
                constant integer ninc
                // 地狱火机械
                constant integer ninm
                // 地狱火毁灭战车
                constant integer nina
                // 小型虚空行者
                constant integer nvdl
                // 虚空行者
                constant integer nvdw
                // 大型虚空行者
                constant integer nvdg
                // 古老虚空行者
                constant integer nvde
                // 艾瑞达巫师
                constant integer ners
                // 艾瑞达恶魔信徒
                constant integer nerd
                // 艾瑞达术士
                constant integer nerw
                // 暴怒丛林捕猎者
                constant integer njgb
                // 古老丛林捕猎者
                constant integer njga
                // 丛林捕猎者
                constant integer njg1
                // 半人马弓箭手
                constant integer ncef
                // 半人马穿刺者
                constant integer ncif
                // 半人马女巫/半人马巫师
                constant integer nckf
        
        
                // 中立建筑(对战)
        
                // 地精实验室
                constant integer ngad
                // 地精商店
                constant integer ngme
                // 市集(市场)
                constant integer nmrk
                // 酒馆
                constant integer ntav
                // 生命之泉
                constant integer nfoh
                // 魔法之泉
                constant integer nmoo
                // 红龙栖地
                constant integer ndrr
                // 绿龙栖地
                constant integer ndrg
                // 虚空龙栖地
                constant integer ndro
                // 蓝龙栖地
                constant integer ndru
                // 青铜龙栖地
                constant integer ndrz
                // 黑龙栖地
                constant integer ndrk
                // 雇佣兵营地(洛丹伦(夏))
                constant integer nmer
                // 雇佣兵营地(洛丹伦(秋))
                constant integer nmr2
                // 雇佣兵营地(洛丹伦(冬))
                constant integer nmr3
                // 雇佣兵营地(贫瘠之地)
                constant integer nmr4
                // 雇佣兵营地(灰谷)
                constant integer nmr5
                // 雇佣兵营地(费伍德森林)
                constant integer nmr6
                // 雇佣兵营地(诺森德)
                constant integer nmr7
                // 雇佣兵营地(城邦)
                constant integer nmr8
                // 雇佣兵营地(达拉然)
                constant integer nmr9
                // 雇佣兵营地(村庄)
                constant integer nmr0
                // 雇佣兵营地(地牢)
                constant integer nmra
                // 雇佣兵营地(地下)
                constant integer nmrb
                // 雇佣兵营地(沉落的废墟)
                constant integer nmrc
                // 雇佣兵营地(冰冠冰川)
                constant integer nmrd
                // 雇佣兵营地(外域)
                constant integer nmre
                // 雇佣兵营地(黑色城堡)
                constant integer nmrf
                // 传送门
                constant integer nwgt
                // 地精船坞
                constant integer nshp
        
        
                // 中立特殊单位及建筑
        
                // 运输船
                constant integer nbot
                // 船只
                constant integer nbsp
                // 地精伐木机
                constant integer ngir
                // 亡灵赛车
                constant integer nccu
                // 兽人赛车
                constant integer ncco
                // 矮人赛车
                constant integer nccr
                // 迪亚波罗赛车
                constant integer nccd
                // 战车
                constant integer nwar
                // 无骑手的马/无人之马
                constant integer hhdl
                // 背负行囊的马/背负背包的马
                constant integer hrdh
                // 地精地雷(单位)
                constant integer nglm
                // 豺狼人督军
                constant integer ngow
                // 沥血者斯纳麦恩
                constant integer ngos
                // 血巫师
                constant integer nwzw
                // 石槌食人魔
                constant integer nogo
                // 石槌法师
                constant integer nogn
                // 石槌酋长
                constant integer noga
                // 防卫魔像
                constant integer nggd
                // 守护魔像
                constant integer nggg
                // 覆苔花岗岩魔像
                constant integer nggm
                // 血肉魔像
                constant integer nfgl
                // 次级灵魂兽(1级)
                constant integer nsw1
                // 灵魂兽(2级)
                constant integer nsw2
                // 高等灵魂兽(3级)
                constant integer nsw3
                // 巨熊(1级)
                constant integer ngz1
                // 怒熊(2级)
                constant integer ngz2
                // 灵熊(3级)
                constant integer ngz3
                // 米莎(1级)
                constant integer ngzc
                // 米莎(2级)
                constant integer ngzd
                // 米莎(3级)
                constant integer ngza
                // 米莎(4级)
                constant integer ngz4
                // 战鹰(1级)
                constant integer nwe1
                // 雷霆雄鹰(2级)
                constant integer nwe2
                // 灵魂战鹰(3级)
                constant integer nwe3
                // 豪猪(1级)
                constant integer nqb1
                // 恐怖豪猪(2级)
                constant integer nqb2
                // 暴怒豪猪(3级)
                constant integer nqb3
                // 怪兽诱饵
                constant integer nlur
                // 龙卷风(单位)
                constant integer ntor
                // 发条地精(1级)
                constant integer ncgb
                // 发条地精(2级)
                constant integer ncg1
                // 发条地精(3级)
                constant integer ncg2
                // 发条地精(3级+)
                constant integer ncg3
                // 口袋工厂(1级)
                constant integer nfac
                // 口袋工厂(2级)
                constant integer nfa1
                // 口袋工厂(3级)
                constant integer nfa2
                // 熔岩爪牙(1级)
                constant integer nlv1
                // 熔岩爪牙(2级)
                constant integer nlv2
                // 熔岩爪牙(3级)
                constant integer nlv3
                // 大地之灵(熊猫,陈·风暴烈酒1级大招)
                constant integer npn3
                // 火焰之灵(熊猫,陈·风暴烈酒1级大招)
                constant integer npn1
                // 风暴之灵(熊猫,陈·风暴烈酒1级大招)
                constant integer npn2
                // 大地之灵(陈·风暴烈酒2级大招)
                constant integer npn6
                // 火焰之灵(陈·风暴烈酒2级大招)
                constant integer npn4
                // 风暴之灵(陈·风暴烈酒2级大招)
                constant integer npn5
                // 小型黑暗奴仆
                constant integer ndr1
                // 黑暗奴仆
                constant integer ndr2
                // 大型黑暗奴仆
                constant integer ndr3
                // 蛛魔通灵塔
                constant integer nnzg
                // 钻地的尖刺蛛蝎
                constant integer nbnb
                // 冰巨魔小屋
                constant integer nth1
                // 冰巨魔小屋 2
                constant integer nth0
                // 半人马帐篷
                constant integer ncnt
                // 半人马帐篷(2)
                constant integer nct1
                // 半人马帐篷(3)
                constant integer nct2
                // 森林巨魔小屋
                constant integer nfh0
                // 森林巨魔小屋 2
                constant integer nfh1
                // 深海鱼人小屋 0
                constant integer nmg0
                // 深海鱼人小屋 1
                constant integer nmg1
                // 熊怪小屋
                constant integer nfr2
                // 熊怪小屋 2
                constant integer nfr1
                // 牛头人帐篷
                constant integer ntnt
                // 牛头人帐篷 2
                constant integer ntt2
                // 豺狼人小屋
                constant integer ngnh
                // 豺狼人小屋 2
                constant integer ngt2
                // 鱼人小屋
                constant integer nmh0
                // 鱼人小屋 2
                constant integer nmh1
                // 鱼人小屋 2
                constant integer nmg2
                // 鹰身人巢穴
                constant integer nhns
                // 鹰身人巢穴 2
                constant integer nhn2
                // 能量法阵
                constant integer ncop
                // 能量法阵(中型)
                constant integer ncp2
                // 能量法阵(大型的)
                constant integer ncp3
                // 帐篷
                constant integer nten
                // 帐篷 2
                constant integer ntn2
                // 帐篷 3
                constant integer ntn3
                // 冰冠方尖碑
                constant integer nico
                // 区域指示器(自定义战役)
                constant integer nzin
                // 复活石(面向东南)
                constant integer nbse
                // 复活石(面向西南)
                constant integer nbsw
                // 次元之门(面向东南)
                constant integer ndke
                // 次元之门(面向西南)
                constant integer ndkw
                // 被忘却者(古神)
                constant integer nfgo
                // 触须(古神)
                constant integer nfgt
                // 城市建筑 0
                constant integer ncb0
                // 城市建筑 1
                constant integer ncb1
                // 城市建筑 2
                constant integer ncb2
                // 城市建筑 3
                constant integer ncb3
                // 城市建筑 4
                constant integer ncb4
                // 城市建筑 5
                constant integer ncb5
                // 城市建筑 6
                constant integer ncb6
                // 城市建筑 7
                constant integer ncb7
                // 城市建筑 8
                constant integer ncb8
                // 城市建筑 9
                constant integer ncb9
                // 城市建筑 10
                constant integer ncba
                // 城市建筑 11
                constant integer ncbb
                // 城市建筑 12
                constant integer ncbc
                // 城市建筑 13
                constant integer ncbd
                // 城市建筑 14
                constant integer ncbe
                // 城市建筑 15
                constant integer ncbf
        
        
                // 星际争霸单位
        
                // 泰伦人类陆战队员
                constant integer zcso
                // 刺蛇
                constant integer zhyd
                // 跳虫
                constant integer zzrg
        
        
        // 常用物品(应该齐)
        
        
                // 物品 优越之戒
                constant integer rnsp
                // 物品 再生之戒/恢复指环
                constant integer rlif
                // 物品 恶魔雕像
                constant integer fgdg
                // 物品 主宰权杖/统治权杖
                constant integer ccmd
                // 物品 沉默法杖/沉默权杖
                constant integer ssil
                // 物品 法盾护符/魔法护盾护身符
                constant integer spsh
                // 物品 灵巧头巾
                constant integer hcun
                // 物品 勇气头盔
                constant integer hval
                // 物品 勇气勋章
                constant integer mcou
                // 物品 战歌军鼓/战歌之鼓
                constant integer war2
                // 物品 军团末日号角/毁灭之角
                constant integer lgdh
                // 物品 远古坚韧杖鼓/古之忍耐姜歌
                constant integer ajen
                // 物品 卡德加的洞察烟斗/卡嘉长萧
                constant integer kpin
                // 物品 暴风雄狮号角/风暴狮角
                constant integer lhst
                // 物品 奥蕾莉亚的精准长笛/阿利亚之笛
                constant integer afac
                // 物品 天灾骨风铃/天灾骨钟
                constant integer sbch
                // 物品 战歌军鼓/战歌之鼓
                constant integer ward
                // 物品 烈焰披风/火焰风衣
                constant integer clfm
                // 物品 水晶球
                constant integer crys
                // 物品 法力垂饰/魔法垂饰
                constant integer pmna
                // 物品 能量垂饰
                constant integer penr
                // 物品 卡德加的生命宝石/卡嘉医疗宝石
                constant integer rhth
                // 物品 活力护身符/生命护身符
                constant integer prvt
                // 物品 攻击之爪+3
                constant integer rat3
                // 物品 攻击之爪+4
                // 在1.35或以下版本中是攻击之爪+5
                constant integer rat6
                // 物品 攻击之爪+8
                // 在1.35或以下版本中是攻击之爪+9
                constant integer rat9
                // 物品 攻击之爪+12
                constant integer ratc
                // 物品 攻击之爪+15
                constant integer ratf
                // 物品 防护之戒+1
                constant integer rde0
                // 物品 防护之戒+2
                constant integer rde1
                // 物品 防护之戒+3
                constant integer rde2
                // 物品 防护之戒+4
                constant integer rde3
                // 物品 防护之戒+5
                constant integer rde4
                // 物品 贵族头环
                constant integer cnob
                // 物品 急速手套/加速手套
                constant integer gcel
                // 物品 符文护腕/神秘腰带
                constant integer brac
                // 物品 闪避护符
                constant integer evtl
                // 物品 艺人面罩
                constant integer rwiz
                // 物品 暗影斗篷/影子风衣
                constant integer clsd
                // 物品 奎尔萨拉斯之靴+6
                constant integer belv
                // 物品 巨人力量腰带+6
                constant integer bgst
                // 物品 法师长袍+6
                constant integer ciri
                // 物品 敏捷便鞋+3
                constant integer rag1
                // 物品 智力斗篷+3
                constant integer rin1
                // 物品 食人魔力量护手+3
                constant integer rst1
                // 物品 法术免疫项链/魔法免疫项链
                constant integer nspi
                // 物品 法术书/魔法书
                constant integer sbok
                // 物品 远古雕像
                constant integer anfg
                // 物品 敏捷护腕
                constant integer brag
                // 物品 德鲁伊布袋
                constant integer drph
                // 物品 铁树枝干
                constant integer iwbr
                // 物品 青玉戒指/灵巧指环
                constant integer jdrn
                // 物品 雄狮之戒
                constant integer lnrn
                // 物品 力量之锤
                constant integer mlst
                // 物品 颅骨盾
                constant integer sksh
                // 物品 蜘蛛戒指
                constant integer sprn
                // 物品 巨力图腾
                constant integer tmmt
                // 物品 巫毒娃娃
                constant integer vddl
                // 物品 乌云号角
                constant integer sfog
                // 物品 大法师之戒(全属性+3,不带辉煌光环)
                constant integer ram4
                // 物品 大法师之戒(全属性+3,带辉煌光环)
                constant integer ram3
                // 物品 大法师之戒(全属性+2,不带辉煌光环)
                constant integer ram2
                // 物品 大法师之戒(全属性+1,不带辉煌光环)
                constant integer ram1
                // 物品 冰龙颅骨盾/冰霜巨龙头骨护盾
                constant integer fwss
                // 物品 萨满图腾
                constant integer shtm
                // 物品 生锈的矿镐/生锈的矿铲
                constant integer rump
                // 物品 塞拉希尔/瑟拉思尔
                constant integer srtl
                // 物品 结实的战斧/战斧
                constant integer stwa
                // 物品 血杀斧/远古战斧
                constant integer klmm
                // 物品 海洋权杖/海之权杖
                constant integer rots
                // 物品 先祖法杖/先祖权杖
                constant integer axas
                // 物品 心灵法杖/心灵权杖
                constant integer mnsf
                // 物品 驱魔种子
                // @version 1.32
                constant integer sxpl
                // 物品 净化藤蔓
                // @version 1.32
                constant integer vpur
                // 物品 艾苏恩之心/埃苏尼之心
                constant integer azhr
                // 物品 空瓶子/空瓶
                constant integer bzbe
                // 物品 装满的瓶子/盛满泉水的瓶子
                constant integer bzbf
                // 物品 奶酪
                constant integer ches
                // 物品 塞纳留斯之角
                constant integer cnhn
                // 物品 古尔丹之颅
                constant integer glsk
                // 物品 净化雕文/净化浮雕
                constant integer gopr
                // 物品 月亮水晶
                constant integer k3m1
                // 物品 不完整的三合月匙/三月之匙的另外一个部分
                constant integer k3m2
                // 物品 三合月匙/三月之匙
                constant integer k3m3
                // 物品 泰瑞纳斯国王的骨灰罐
                constant integer ktrm
                // 物品 鲜血钥匙
                constant integer kybl
                // 物品 幽灵钥匙/魔鬼钥匙
                constant integer kygh
                // 物品 月亮钥匙
                constant integer kymn
                // 物品 太阳钥匙
                constant integer kysn
                // 物品 杰拉德丢失的帐本/吉拉德的账本
                constant integer ledg
                // 物品 好东西/李维特
                constant integer phlt
                // 物品 希雷诺斯之心/赛瑞诺克斯之心
                constant integer sehr
                // 物品 附魔宝石/魔法宝石
                constant integer engs
                // 物品 暗影宝珠碎片
                constant integer sorf
                // 物品 宝石碎片
                constant integer gmfr
                // 物品 给吉安娜·普罗德摩尔的便条
                constant integer jpnt
                // 物品 微光草/荧光草
                constant integer shwd
                // 物品 骸骨法器/骸骨宝物
                constant integer skrt
                // 物品 隐藏关卡道具/秘密关卡激活
                constant integer sclp
                // 物品 怀特的腿
                constant integer wtlg
                // 物品 怀特的另一条腿
                constant integer wolg
                // 物品 魔法钥匙串
                constant integer mgtk
                // 物品 莫戈林的报告/莫哥林的报告
                constant integer mort
                // 物品 一桶雷酒/雷霆水桶
                constant integer dkfw
                // 物品 雷霆蜥蜴蛋/雷霆蜥蜴之蛋
                constant integer thle
                // 物品 雷霆凤凰蛋
                constant integer dphe
                // 物品 雷霆花的鳞茎/雷电花芯
                constant integer dthb
                // 物品 雷蜥钻石/雷霆蜥蜴钻石
                constant integer thdm
                // 物品 德雷克塔尔的法术书/德雷克萨尔的魔法书
                constant integer dtsb
                // 物品 信号枪
                constant integer fgun
                // 物品 怪兽诱饵/怪兽诱捕守卫
                constant integer lure
                // 物品 灵魂魔典/灵魂宝物
                constant integer grsl
                // 物品 奥金护盾/芒硝护盾
                constant integer arsh
                // 物品 艾苏恩的精华
                constant integer esaz
                // 物品 复生法杖/鼓舞权杖
                constant integer stre
                // 物品 古老圣物/稀有神器
                constant integer horl
                // 物品 好战头盔/战舰之舵
                constant integer hbth
                // 物品 折刃护甲/剑刃护甲
                constant integer blba
                // 物品 符文护手/神秘手套
                constant integer rugt
                // 物品 火拳护手/火焰手套
                constant integer frhg
                // 物品 法术掌握手套/法术大师手套
                constant integer gvsm
                // 物品 死亡领主之冠/死亡领主皇冠
                constant integer crdt
                // 物品 死亡领主之盾/死亡领主护盾
                constant integer shdt
                // 物品 荣誉护盾
                constant integer shhn
                // 物品 附魔盾牌/施魔护盾
                constant integer shen
                // 物品 发条企鹅/时钟企鹅
                constant integer stpg
                // 物品 微光烤肉/烤肉
                constant integer shrs
                // 物品 血羽之心
                constant integer bfhr
                // 物品 萨满利爪
                constant integer shcw
                // 物品 灼热之刃/灼热之刀
                constant integer srbd
                // 物品 寒冰护卫者/霜冻守卫
                constant integer frgd
                // 物品 附魔小瓶/魔法小瓶
                constant integer envl
                // 物品 治疗权杖/医疗权杖
                constant integer schl
                // 物品 刺客之刃/刺客佩刀
                constant integer asbl
                // 物品 一桶麦酒/麦酒桶
                constant integer kgal
                // 物品 金币
                constant integer gold
                // 物品 一捆木柴
                constant integer lmbr
                // 物品 强固雕文/防御浮雕
                constant integer gfor
                // 物品 夜视雕文/夜视浮雕
                constant integer guvi
                // 物品 全知雕文/全知浮雕
                constant integer gomn
                // 物品 灵魂链接符文/灵魂锁链神符
                constant integer rspl
                // 物品 次级复活符文/小型复活神符
                constant integer rre1
                // 物品 强效复活符文/大型复活神符
                constant integer rre2
                // 物品 重生符文/重生神符
                constant integer rreb
                // 物品 护盾符文/护盾神符
                constant integer rsps
                // 物品 速度符文/速度神符
                constant integer rspd
                // 物品 法力符文/魔法神符
                constant integer rman
                // 物品 强效法力符文/大型魔法神符
                constant integer rma2
                // 物品 复原符文/恢复神符
                constant integer rres
                // 物品 次级治疗符文/小型治疗神符
                constant integer rhe1
                // 物品 治疗符文/治疗神符
                constant integer rhe2
                // 物品 强效治疗符文/大型治疗神符
                constant integer rhe3
                // 物品 驱魔符文/驱魔神符
                constant integer rdis
                // 物品 监视符文/岗哨神符
                constant integer rwat
                // 物品 生命手册
                constant integer manh
                // 物品 知识之书
                constant integer tpow
                // 物品 敏捷之书+2
                constant integer tdx2
                // 物品 智力之书+2
                constant integer tin2
                // 物品 力量之书+2
                constant integer tst2
                // 物品 敏捷之书
                constant integer tdex
                // 物品 智力之书
                constant integer tint
                // 物品 力量之书
                constant integer tstr
                // 物品 强效经验之书/超级经验之书
                constant integer tgxp
                // 物品 经验之书
                constant integer texp
                // 物品 传送法杖/传送权杖
                constant integer stel
                // 物品 召唤钻石
                constant integer dsum
                // 物品 召回护符
                constant integer amrc
                // 物品 保存法杖/保存权杖
                constant integer spre
                // 物品 月亮石
                constant integer moon
                // 物品 速度之靴
                constant integer bspd
                // 物品 机械小动物
                constant integer mcri
                // 物品 闪电宝珠/闪电之球
                constant integer oli2
                // 物品 闪电宝珠/闪电之球
                constant integer olig
                // 物品 火焰宝珠/火焰之球
                constant integer ofir
                // 物品 火焰宝珠/火焰之球
                constant integer ofr2
                // 物品 腐蚀宝珠/腐蚀之球
                constant integer ocor
                // 物品 毒液宝珠/毒液之球
                constant integer oven
                // 物品 冰霜宝珠/霜冻之球
                constant integer ofro
                // 物品 基尔加丹宝珠/之球
                constant integer gldo
                // 物品 减速宝珠/减速之球
                constant integer oslo
                // 物品 天界灵魂宝珠/灵魂之球
                constant integer cosl
                // 物品 灵魂
                constant integer soul
                // 物品 灵魂宝石
                constant integer gsou
                // 物品 黑暗宝珠/黑暗之球
                constant integer odef
                // 物品 暗影宝珠+10/黑暗之球+10
                constant integer sora
                // 物品 暗影宝珠+1/黑暗之球+1
                constant integer sor1
                // 物品 暗影宝珠+2/黑暗之球+2
                constant integer sor2
                // 物品 暗影宝珠+3/黑暗之球+3
                constant integer sor3
                // 物品 暗影宝珠+4/黑暗之球+4
                constant integer sor4
                // 物品 暗影宝珠+5/黑暗之球+5
                constant integer sor5
                // 物品 暗影宝珠+6/黑暗之球+6
                constant integer sor6
                // 物品 暗影宝珠+7/黑暗之球+7
                constant integer sor7
                // 物品 暗影宝珠+8/黑暗之球+8
                constant integer sor8
                // 物品 暗影宝珠+9/黑暗之球+9
                constant integer sor9
                // 物品 真视宝石
                constant integer gemt
                // 物品 暗夜精灵旗帜
                constant integer nflg
                // 物品 亡灵旗帜
                constant integer uflg
                // 物品 人类旗帜
                constant integer flag
                // 物品 兽人旗帜
                constant integer oflg
                // 物品 战旗
                constant integer btst
                // 物品 复活卷轴
                constant integer srrc
                // 物品 地精地雷
                constant integer gobm
                // 物品 地精夜视镜
                constant integer tels
                // 物品 迷你伐木场/微型伐木场
                constant integer tlum
                // 物品 迷你兵营/微型兵营
                constant integer tbar
                // 物品 迷你农场/微型农场
                constant integer tfar
                // 物品 迷你列王祭坛/微型国王祭坛
                constant integer tbak
                // 物品 迷你铁匠铺/微型铁匠铺
                constant integer tbsm
                // 物品 迷你城堡/小城堡
                constant integer tcas
                // 物品 象牙塔
                constant integer tsct
                // 物品 迷你大厅/小型的大厅
                constant integer tgrh
                // 物品 反魔法药剂/抗体药水
                constant integer pams
                // 物品 神圣药水
                constant integer pdiv
                // 物品 神圣药水
                // @version 1.32
                constant integer pdi2
                // 物品 次级无敌药水/较小的无敌药水
                constant integer pnvl
                // 物品 无敌药水
                constant integer pnvu
                // 物品 亡者之书/死亡之书
                constant integer fgsk
                // 物品 全知药水
                constant integer pomn
                // 物品 嗜财权杖
                // @version 1.32
                constant integer scav
                // 物品 复原卷轴/恢复卷轴
                constant integer sres
                // 物品 复原药水/恢复药水
                constant integer pres
                // 物品 寒冰碎片/冰冻碎片
                constant integer shar
                // 物品 尖刺项圈/长钉衣领
                constant integer fgfh
                // 物品 岩石徽记/岩石印记
                constant integer fgrg
                // 物品 幻象魔杖/幻象权杖
                constant integer will
                // 物品 强效治疗药水/大生命药水
                constant integer pghe
                // 物品 强效法力药水/大魔法药水
                constant integer pgma
                // 物品 眼影魔杖/影子权杖
                constant integer wshs
                // 物品 恢复药水
                constant integer rej3
                // 物品 恶魔雕像
                constant integer fhdg
                // 物品 治疗结界/治疗守卫
                constant integer whwd
                // 物品 法力窃取魔杖
                constant integer woms
                // 物品 生命石/医疗石
                constant integer hlst
                // 物品 蓝色幼龙蛋/蓝龙之卵
                // @version 1.32
                constant integer fgbd
                // 物品 红色幼龙蛋/红龙之卵
                constant integer fgrd
                // 物品 警戒结界/岗哨守卫
                constant integer wswd
                // 物品 重生十字章
                constant integer ankh
                // 物品 野兽卷轴
                constant integer sror
                // 物品 野性护符/野性护身符
                constant integer wild
                // 物品 奥术卷轴/神秘卷轴
                constant integer arsc
                // 物品 邪恶军团卷轴
                constant integer scul
                // 物品 献祭之书/牺牲之书
                constant integer tmsc
                // 物品 大型恢复卷轴/大型恢复卷轴
                constant integer rej6
                // 物品 次级恢复卷轴/小型恢复卷轴
                constant integer rej5
                // 物品 强效恢复药水/大型恢复药水
                constant integer rej4
                // 物品 次级恢复药水/小型恢复药水
                constant integer rej2
                // 物品 法力卷轴/魔法卷轴
                constant integer sman
                // 物品 初级恢复药水/小型恢复药水
                constant integer rej1
                // 物品 速度药水
                constant integer pspd
                // 物品 强效隐形药水/大隐形药水
                constant integer pgin
                // 物品 野性咒符/野性护符
                constant integer totw
                // 物品 亡者再临卷轴/操作死尸卷轴
                constant integer sand
                // 物品 野性神像
                // @version 1.32
                constant integer iotw
                // 物品 闪电之盾魔杖
                constant integer wlsd
                // 物品 雕饰鳞片
                constant integer engr
                // 物品 飓风魔杖
                constant integer wcyc
                // 物品 魔法石
                constant integer mnst
                // 物品 中和魔杖
                constant integer wneu
                // 物品技能 仪式匕首
                // @version 1.30
                constant integer ritd
                // 物品 保护卷轴/守护卷轴
                constant integer spro
                // 物品 吸血药水
                constant integer vamp
                // 物品 城镇传送卷轴/回城卷轴
                constant integer stwp
                // 物品 庇护法杖/避难权杖
                constant integer ssan
                // 物品 恢复卷轴
                constant integer sreg
                // 物品 明澈药水/净化药水
                constant integer pclr
                // 物品 次级明澈药水/小净化药水
                constant integer plcl
                // 物品 治疗卷轴
                constant integer shea
                // 物品 治疗药水/生命药水
                constant integer phea
                // 物品 治疗药膏/医疗剂
                constant integer hslv
                // 物品 魔法药水
                constant integer pman
                // 物品 显影之尘
                constant integer dust
                // 物品 献祭之颅/献祭头骨
                constant integer skul
                // 物品 地狱火之石/恶魔岩石
                constant integer infs
                // 物品 虚无法杖/否决权杖(非消耗品)
                constant integer sneg
                // 物品 虚无魔杖/否决权杖(消耗品)
                constant integer wneg
                // 物品 蛛丝胸针/蜘蛛丝饰针
                constant integer silk
                // 物品 通灵魔棒/巫术妖棍
                constant integer rnec
                // 物品 速度卷轴
                constant integer shas
                // 物品 重修之书/再训练之书
                constant integer tret
                // 物品 隐形药水
                constant integer pinv
                // 物品 凯伦的逃脱匕首/科勒恩的逃脱匕首
                constant integer desc
                // 物品 列王之冠+5/国王之冠 +5
                constant integer ckng
                // 物品 威能之书/能量之书
                constant integer tkno
                // 物品 死亡面具/死亡面罩
                constant integer modt
        
        
        // 英雄技能(齐)
        
                // 人族对战英雄技能
        
                // 英雄技能 天神下凡(山丘之王)
                constant integer AHav
                // 英雄技能 猛击(山丘之王)
                constant integer AHbh
                // 英雄技能 风暴之锤(山丘之王)
                constant integer AHtb
                // 英雄技能 雷霆一击(山丘之王)
                constant integer AHtc
                // 英雄技能 虔诚光环(圣骑士)
                constant integer AHad
                // 英雄技能 圣盾术(圣骑士)
                constant integer AHds
                // 英雄技能 圣光术(圣骑士)
                constant integer AHhb
                // 英雄技能 复活术(圣骑士)
                constant integer AHre
                // 英雄技能 暴风雪(大法师)
                constant integer AHbz
                // 英雄技能 辉煌光环(大法师)
                constant integer AHab
                // 英雄技能 群体传送(大法师)
                constant integer AHmt
                // 英雄技能 水元素(大法师)
                constant integer AHwe
                // 英雄技能 放逐(血法)
                constant integer AHbn
                // 英雄技能 烈焰风暴(血法)
                constant integer AHfs
                // 英雄技能 火凤凰(血法)
                constant integer AHpx
                // 英雄技能 法力虹吸(血法)
                constant integer AHdr
        
        
                // 兽族对战英雄技能
        
                // 英雄技能 致命一击(剑圣)
                constant integer AOcr
                // 英雄技能 镜像(剑圣)
                constant integer AOmi
                // 英雄技能 剑刃风暴(剑圣)
                constant integer AOww
                // 英雄技能 疾风步(剑圣)
                constant integer AOwk
                // 英雄技能 闪电链(先知)
                constant integer AOcl
                // 英雄技能 地震术(先知)
                constant integer AOeq
                // 英雄技能 视界术(先知)
                constant integer AOfs
                // 英雄技能 野性之魂(召狼)(先知)
                constant integer AOsf
                // 英雄技能 坚韧光环(牛头)
                constant integer AOae
                // 英雄技能 重生(牛头)
                constant integer AOre
                // 英雄技能 震荡波(牛头)
                constant integer AOsh
                // 英雄技能 战争践踏(牛头)
                constant integer AOws
                // 英雄技能 治疗波(暗影猎手)
                constant integer AOhw
                // 英雄技能 妖术(暗影猎手)
                constant integer AOhx
                // 英雄技能 毒蛇结界(蛇棒)(暗影猎手)
                constant integer AOsw
                // 英雄技能 巫毒狂舞(友军无敌)(暗影猎手)
                constant integer AOvd
        
        
                // 不死族对战英雄技能
        
                // 英雄技能 沉睡(恐惧魔王)
                constant integer AUsl
                // 英雄技能 吸血光环(恐惧魔王)
                constant integer AUav
                // 英雄技能 腐臭蜂群(恐惧魔王)
                constant integer AUcs
                // 英雄技能 地狱火(恐惧魔王)
                constant integer AUin
                // 英雄技能 黑暗仪式(巫妖)
                constant integer AUdr
                // 英雄技能 枯萎凋零(巫妖)
                constant integer AUdd
                // 英雄技能 冰霜新星(巫妖)
                constant integer AUfu
                // 英雄技能 霜甲术(自动施法)(巫妖)
                constant integer AUfn
                // 英雄技能 亡者再临(死骑)
                constant integer AUan
                // 英雄技能 凋零/死亡缠绕(死骑)
                constant integer AUdc
                // 英雄技能 天灾/死亡契约(死骑)
                constant integer AUdp
                // 英雄技能 邪恶光环(死骑)
                constant integer AUau
                // 英雄技能 腐尸甲虫(小强)
                constant integer AUcb
                // 英雄技能 穿刺(小强)
                constant integer AUim
                // 英雄技能 虫群风暴(小强)
                constant integer AUls
                // 英雄技能 尖刺甲壳(小强)
                constant integer AUts
        
        
                // 暗夜精灵族对战英雄技能
        
                // 英雄技能 自然之力(丛林守护者)
                constant integer AEfn
                // 英雄技能 纠缠根须(丛林守护者)
                constant integer AEer
                // 英雄技能 荆棘光环(丛林守护者)
                constant integer AEah
                // 英雄技能 宁静(丛林守护者)
                constant integer AEtq
                // 英雄技能 闪避(恶魔猎手)
                constant integer AEev
                // 英雄技能 献祭(恶魔猎手)
                constant integer AEim
                // 英雄技能 法力燃烧(恶魔猎手)
                constant integer AEmb
                // 英雄技能 恶魔变形(恶魔猎手)
                constant integer AEme
                // 英雄技能 灼热之箭(白虎)
                constant integer AHfa
                // 英雄技能 斥候(白虎)
                constant integer AEst
                // 英雄技能 星辰坠落(流星雨)(白虎)
                constant integer AEsf
                // 英雄技能 强击光环(白虎)
                constant integer AEar
                // 英雄技能 闪现(守望者)
                constant integer AEbl
                // 英雄技能 刀扇(守望者)
                constant integer AEfk
                // 英雄技能 暗影突袭(守望者)
                constant integer AEsh
                // 英雄技能 复仇(守望者)
                constant integer AEsv
        
        
                // 酒馆英雄技能
        
                // 英雄技能 冰霜箭(娜迦海巫)
                constant integer ANfa
                // 英雄技能 叉状闪电(娜迦海巫)
                constant integer ANfl
                // 英雄技能 寒冰箭矢
                constant integer AHca
                // 英雄技能 法力护盾(娜迦海巫)
                constant integer ANms
                // 英雄技能 龙卷风(娜迦海巫)
                constant integer ANto
                // 英雄技能 治疗喷雾(炼金术士)
                constant integer ANhs
                // 英雄技能 化学狂暴(炼金术士)
                constant integer ANcr
                // 英雄技能 酸性炸弹(炼金术士)
                constant integer ANab
                // 英雄技能 点金术(炼金术士)
                constant integer ANtm
                // 英雄技能 集束火箭(修补匠)
                constant integer ANcs
                // 英雄技能 集束火箭(1级升级)(修补匠)
                constant integer ANc1
                // 英雄技能 集束火箭(2级升级)(修补匠)
                constant integer ANc2
                // 英雄技能 集束火箭(3级升级)(修补匠)
                constant integer ANc3
                // 英雄技能 口袋工厂(修补匠)
                constant integer ANsy
                // 英雄技能 口袋工厂(升级1)(修补匠)
                constant integer ANs1
                // 英雄技能 口袋工厂(升级2)(修补匠)
                constant integer ANs2
                // 英雄技能 口袋工厂(升级3)(修补匠)
                constant integer ANs3
                // 英雄技能 工程学升级(修补匠)
                constant integer ANeg
                // 英雄技能 拆毁(修补匠)
                constant integer ANde
                // 英雄技能 拆毁(1级升级)(修补匠)
                constant integer ANd1
                // 英雄技能 拆毁(2级升级)(修补匠)
                constant integer ANd2
                // 英雄技能 拆毁(3级升级)(修补匠)
                constant integer ANd3
                // 英雄技能 机械地基(修补匠)
                constant integer ANrg
                // 英雄技能 机械地基(1级升级)(修补匠)
                constant integer ANg1
                // 英雄技能 机械地基(2级升级)(修补匠)
                constant integer ANg2
                // 英雄技能 机械地基(3级升级)(修补匠)
                constant integer ANg3
                // 英雄技能 召唤巨熊(兽王)
                constant integer ANsg
                // 英雄技能 召唤战鹰(兽王)
                constant integer ANsw
                // 英雄技能 召唤豪猪(兽王)
                constant integer ANsq
                // 英雄技能 群兽奔腾(兽王)
                constant integer ANst
                // 英雄技能 火焰之息(熊猫)
                constant integer ANbf
                // 英雄技能 酩酊酒雾(熊猫)
                constant integer ANdh
                // 英雄技能 醉拳(熊猫)
                constant integer ANdb
                // 英雄技能 风火雷电(熊猫)
                constant integer ANef
                // 英雄技能 召唤熔岩爪牙(火焰领主)
                constant integer ANlm
                // 英雄技能 灵魂燃烧(火焰领主)
                constant integer ANso
                // 英雄技能 焚身化骨(火焰领主)
                constant integer ANic
                // 英雄技能 焚身化骨(箭矢)(火焰领主)
                constant integer ANia
                // 英雄技能 火山爆发(火焰领主)
                constant integer ANvc
                // 英雄技能 火焰之雨(深渊领主)
                constant integer ANrf
                // 英雄技能 恐惧嚎叫(深渊领主)
                constant integer ANht
                // 英雄技能 顺劈斩(深渊领主)
                constant integer ANca
                // 英雄技能 末日降临(深渊领主)
                constant integer ANdo
                // 英雄技能 沉默(黑暗游侠)
                constant integer ANsi
                // 英雄技能 黑蚀箭(黑暗游侠)
                constant integer ANba
                // 英雄技能 生命吸取(黑暗游侠)
                constant integer ANdr
                // 英雄技能 蛊惑(黑暗游侠)
                constant integer ANch
        
        
                // 其他英雄技能
        
                // 英雄技能 通魔(在重置版,至少在1.36中找不到)
                constant integer ANcl
                // 英雄技能 召唤米莎(雷克萨)
                constant integer Arsg
                // 英雄技能 召唤豪猪(雷克萨)
                constant integer Arsq
                // 英雄技能 风暴之锤(雷克萨)
                constant integer ANsb
                // 英雄技能 群兽奔腾(雷克萨)
                constant integer Arsp
                // 英雄技能 地狱火(中立敌对)
                constant integer ANin
                // 英雄技能 地狱火(提克迪奥斯)
                constant integer SNin
                // 英雄技能 地震术(中立敌对)
                constant integer SNeq
                // 英雄技能 季风
                constant integer ANmo
                // 英雄技能 属性加成
                constant integer Aamk
                // 英雄技能 引导
                constant integer ANcl
                // 英雄技能 召唤虾兵
                constant integer Aslp
                // 英雄技能 恶魔变形(伊利丹)
                constant integer AEIl
                // 英雄技能 恶魔变形(邪恶的伊利丹)
                constant integer AEvi
                // 英雄技能 战斗咆哮
                constant integer ANbr
                // 英雄技能 星辰坠落(更强大的)
                constant integer AEsb
                // 英雄技能 枯萎凋零(中立敌对)
                constant integer SNdd
                // 英雄技能 水栖奴仆
                constant integer ANwm
                // 英雄技能 淬毒之箭
                constant integer AEpa
                // 英雄技能 混乱之雨(巴纳扎尔)
                constant integer ANr3
                // 英雄技能 死亡一指(阿克蒙德)
                constant integer ANfd
                // 英雄技能 混乱之雨(阿克蒙德)
                constant integer ANrc
                // 英雄技能 黑暗之门(阿克蒙德)
                constant integer ANdp
                // 英雄技能 灵魂保存(玛尔加尼斯)
                constant integer ANsl
                // 英雄技能 黑暗转换(玛尔加尼斯)
                constant integer ANdc
                // 英雄技能 黑暗转换(玛尔加尼斯、快)
                constant integer SNdc
                // 英雄技能 灵魂兽
                constant integer ACs8
                // 英雄技能 重生
                constant integer ANr2
                // 英雄技能 重生(玛诺洛斯)
                constant integer ANrn
                // 英雄技能 野性之魂
                constant integer ACs7
                // 英雄技能 疾风步(中立敌对)
                constant integer ANwk
                // 英雄技能 天神下凡(中立)
                constant integer ANav
                // 英雄技能 震荡波
                constant integer ANsh
                // 英雄技能 火焰之息(陈·风暴烈酒)
                constant integer ANcf
                // 英雄技能 酩酊酒雾(陈·风暴烈酒)
                constant integer Acdh
                // 英雄技能 醉拳(陈·风暴烈酒)
                constant integer Acdb
                // 英雄技能 风火雷电(陈·风暴烈酒)
                constant integer Acef
                // 英雄技能 火焰箭(中立敌对)
                constant integer ANfb
                // 英雄技能 震荡波(凯恩)
                constant integer AOs2
                // 英雄技能 战争践踏
                constant integer AOw2
                // 英雄技能 坚韧光环(凯恩)
                constant integer AOr2
                // 英雄技能 重生(凯恩)
                constant integer AOr3
                // 英雄技能 治疗波(洛坎)
                constant integer ANhw
                // 英雄技能 妖术(洛坎)
                constant integer ANhx
                // 英雄技能 毒蛇结界(洛坎)
                constant integer Arsw
                // 英雄技能 巫毒幽魂
                constant integer AOls
                // 英雄技能 闪现(中立)
                constant integer ANbl
        
        
        // 单位技能(未按种族区分)
        
                // 单位技能 传送门技能
                constant integer Awrp
                // 单位技能 共享商店,联盟建筑
                constant integer Aall
                // 单位技能 出售单位
                constant integer Asud
                // 单位技能 出售物品
                constant integer Asid
                // 单位技能 卸载(空中载具)
                constant integer Adro
                // 单位技能 卸载(海上载具)
                constant integer Sdro
                // 单位技能 商店购买物品
                constant integer Apit
                // 单位技能 选择使用者
                constant integer Anei
                // 单位技能 返回
                constant integer Artn
                // 单位技能 地雷 - 爆炸(地精地雷)/金矿- 爆炸了(地精地雷)
                constant integer Amin
                // 单位技能 死亡时造成范围伤害(地精地雷)
                constant integer Amnx
                // 单位技能 死亡时造成范围伤害(大地雷)
                constant integer Amnz
                // 单位技能 死亡时造成范围伤害(地精工兵)
                constant integer Adda
                // 单位技能 咔嘣！(地精工兵)
                constant integer Asds
                // 单位技能 永久隐形
                constant integer Apiv
                // 单位技能 游荡(中立)/游荡者(中立)
                constant integer Awan
                // 单位技能 无敌(中立)
                constant integer Avul
                // 单位技能 复活英雄
                constant integer Arev
                // 单位技能 立刻复活英雄
                constant integer Aawa
                // 单位技能 立刻卸载(被缠绕的金矿)
                constant integer Adri
                // 单位技能 装载(地精飞艇)
                constant integer Aloa
                // 单位技能 装载(船) 
                constant integer Slo3
                // 单位技能 货舱(编辑器无此技能)
                constant integer Amtc
                // 单位技能 货舱
                constant integer Acar
                // 单位技能 货舱(地精飞艇)
                constant integer Sch3
                // 单位技能 货舱(坦克)
                constant integer Sch4
                // 单位技能 货舱(船)
                constant integer Sch5
                // 单位技能 货舱(清道夫/绞肉车)
                constant integer Sch2
                // 单位技能 货舱(兽人地洞)
                constant integer Abun
                // 单位技能 (混乱货舱装载)
                constant integer Achl
                // 单位技能 货舱死亡(中立敌对)
                constant integer Achd
                // 单位技能 缠绕金矿
                constant integer Aent
                // 单位技能 金矿技能
                constant integer Agld
                // 单位技能 被缠绕的金矿技能
                constant integer Aegm
                // 单位技能 荒芜金矿技能
                constant integer Abgm
                // 单位技能 集结
                constant integer ARal
                // 单位技能 选择单位
                constant integer Ane2
                // 单位技能 选择英雄
                constant integer Aneu
                // 单位技能 装载小精灵(被缠绕的金矿)
                constant integer Slo2
                // 单位技能 装载(被缠绕的金矿)
                constant integer Aenc
                // 单位技能 卸载尸体
                constant integer Amed
                // 单位技能 获取尸体
                constant integer Amel
                // 单位技能 装载(兽人地洞)
                constant integer Sloa
                // 单位技能 解除戒备(兽人地洞)
                constant integer Astd
                // 单位技能 运货骡子 
                constant integer Apak
                // 单位技能 潜水(侍从)
                constant integer Asb1
                // 单位技能 潜水(毒鳍龙)
                constant integer Asb3
                // 单位技能 潜水(皇家卫兵)
                constant integer Asb2
                // 单位技能 法术免疫(中立敌对)
                constant integer ACmi
                // 单位技能 法术免疫(阿克蒙德)
                constant integer ACm2
                // 单位技能 法术免疫(龙)
                constant integer ACm3
                // 单位技能 法术免疫
                constant integer Amim
                // 物品技能 法术免疫(物品)
                constant integer AImx
                // 单位技能 影遁
                constant integer Ashm
                // 单位技能 影遁(立刻的)
                constant integer Sshm
                // 单位技能 影遁(阿卡玛)
                constant integer Ahid
                // 单位技能 飓风术(塞纳留斯)
                constant integer SCc1
                // 单位技能 物品栏(英雄)
                constant integer AInv
                // 单位技能 物品栏(亡灵)
                constant integer Aiun
                // 单位技能 物品栏(人类)
                constant integer Aihn
                // 单位技能 物品栏(兽人)
                constant integer Aion
                // 单位技能 物品栏(暗夜精灵)
                constant integer Aien
                // 单位技能 报警
                constant integer Aalr
                // 单位技能 开火
                constant integer Afir
                // 单位技能 移动
                constant integer Amov
                // 单位技能 英雄
                constant integer AHer
                // 单位技能 攻击
                constant integer Aatk
                // 单位技能 优先攻击(石像鬼)
                // @version 1.32.9
                constant integer Aatp
                // 单位技能 疾病云雾(亡者再临)
                // @version 1.33
                constant integer Aap5
                // 单位技能 食尸鬼狂暴(图标)
                // @version 1.32
                constant integer Augf
                // 单位技能 骷髅精通(图标)
                // @version 1.32
                constant integer Ausm
                // 单位技能 凤凰(图标)
                // @version 1.32
                constant integer Ahpe
                // 单位技能 坐骑作战训练(图标)
                // @version 1.32
                constant integer Ahan
                // 单位技能 改良伐木技术(图标)
                // @version 1.32
                constant integer Ahlh
                // 单位技能 长管火枪(图标)
                // @version 1.32
                constant integer Ahri
                // 单位技能 裂甲之刃
                // @version 1.30
                constant integer Ahsb
                // 物品技能 仪式匕首(恢复)
                // @version 1.30
                constant integer AIg2
                // 物品技能 仪式匕首(瞬发治疗)
                // @version 1.30
                constant integer AIdg
                // 单位技能 加强型防御(图标)
                // @version 1.32
                constant integer Aorb
                // 单位技能 尖刺障碍(图标)
                // @version 1.32
                constant integer Aosp
                // 单位技能 巨魔再生(图标)
                // @version 1.32
                constant integer Aotr
                // 单位技能 狂战士升级(图标)
                // @version 1.32
                constant integer Aobk
                // 单位技能 野蛮之力(图标)
                // @version 1.32
                constant integer Aobs
                // 单位技能 冰霜攻击(新的,具有图标)
                constant integer Afrc
                // 单位技能 影魔(图标)
                // @version 1.32
                constant integer Augh
                // 单位技能 强弓(图标)
                // @version 1.32
                constant integer Aeib
                // 单位技能 月井之春(图标)
                // @version 1.32
                constant integer Aews
                // 单位技能 箭术(图标)
                // @version 1.32
                constant integer Aemk
                // 单位技能 黑暗召唤(玛尔加尼斯)
                constant integer AUmd
                // 单位技能 亡者再临(中立敌对)
                constant integer ACad
                // 单位技能 强固雕文
                constant integer AIgf
                // 单位技能 强固雕文
                constant integer AIgu
                // 单位技能 减速光环(龙卷风)
                constant integer Aasl
                // 单位技能 建筑伤害光环(龙卷风)
                constant integer Atdg
                // 单位技能 龙卷风旋转(龙卷风)
                constant integer Atsp
                // 单位技能 龙卷风游荡(龙卷风)
                constant integer Atwa
                // 单位技能 刚毛飞射
                constant integer ANak
                // 单位技能 干扰射线
                constant integer Ache
                // 单位技能 钻地(中立敌对)
                constant integer Abu5
                // 单位技能 寄生虫
                constant integer ACpa
                // 单位技能 法力虹吸(中立敌对)
                constant integer ACsm
                // 单位技能 吞噬魔法(中立敌对)
                constant integer ACde
                // 单位技能 硬化体肤
                constant integer Ansk
                // 单位技能 火焰之雨(中立敌对1)
                constant integer ACrg
                // 单位技能 恐惧嚎叫(中立敌对)
                constant integer Acht
                // 单位技能 顺劈斩(中立敌对)
                constant integer ACce
                // 单位技能 疾风步(中立敌对)
                constant integer ANwk
                // 单位技能 嘲讽(中立敌对)
                constant integer ANta
                // 单位技能 放逐(中立敌对)
                constant integer ACbn
                // 单位技能 生命吸取(中立敌对)
                constant integer ACdr
                // 单位技能 妖术(中立敌对)
                constant integer AChx
                // 单位技能 纠缠根须(中立敌对2)
                constant integer Aenw
                // 单位技能 治疗波(中立敌对)
                constant integer AChv
                // 单位技能 沉默(中立敌对)
                constant integer ACsi
                // 单位技能 法力护盾(中立敌对)
                constant integer ACmf
                // 单位技能 暗影突袭(中立敌对)
                constant integer ACss
                // 单位技能 寒冰箭
                constant integer ACcb
                // 单位技能 冰霜吐息
                constant integer ACbf
                // 单位技能 冰霜吐息
                constant integer Afrb
                // 单位技能 冰霜攻击
                constant integer Afra
                // 单位技能 冰霜攻击
                constant integer Afr2
                // 单位技能 冰冻吐息
                constant integer Afrz
                // 单位技能 火焰之息(中立敌对)
                constant integer ACbc
                // 单位技能 烈焰风暴(中立敌对)
                constant integer ACfs
                // 单位技能 烈焰风暴(中立敌对2)
                constant integer ANfs
                // 单位技能 穿刺(中立敌对)
                constant integer ACmp
                // 单位技能 尖刺外壳
                constant integer ANth
                // 单位技能 尖刺外壳(按钮位置2,2)
                constant integer ANt2
                // 单位技能 心智腐烂
                constant integer ANmr
                // 单位技能 蛊惑(中立敌对)
                constant integer ACch
                // 单位技能 治疗结界(中立敌对)
                constant integer AChw
                // 单位技能 回春术(熊怪)
                constant integer ACr2
                // 单位技能 法术免疫,法术免疫
                constant integer ACm2
                // 单位技能 法术免疫,法术免疫
                constant integer ACm3
                // 单位技能 复仇
                constant integer Arng
                // 单位技能 真视(中立1)
                constant integer Adtg
                // 单位技能 真视(中立2)
                constant integer ANtr
                // 单位技能 生命之树升级技能
                constant integer Atol
                // 单位技能 苦痛之指(中立敌对)
                constant integer ACfd
                // 单位技能 苦痛之指(中立敌对)
                constant integer ACf3
                // 单位技能 死亡一指(中立敌对)
                constant integer Afod
                // 单位技能 虔诚光环(中立敌对)
                constant integer ACav
                // 单位技能 一直沉睡
                constant integer Asla
                // 单位技能 吞噬货物
                constant integer Advc
                // 单位技能 永久献祭(中立敌对1)
                constant integer ANpi
                // 单位技能 永久献祭(中立敌对2)
                constant integer Apig
                // 单位技能 战斗戒备(邪兽人地洞)
                constant integer Sbtl
                // 单位技能 收取黄金和木材
                constant integer AAns
                // 单位技能 暴露
                constant integer Andt
                // 单位技能 用黄金交换木材
                constant integer ANgl
                // 单位技能 用木材交换黄金
                constant integer ANlg
                // 单位技能 法力恢复, 生命恢复光环(中立)
                constant integer ANre
                // 单位技能 生命恢复
                constant integer ANrl
                // 单位技能 窥探
                constant integer ANsp
                // 单位技能 乌鸦形态
                constant integer Amrf
                // 单位技能 治疗术(中立敌对1)
                constant integer Anhe
                // 单位技能 减速术(中立敌对)
                constant integer ACsw
                // 单位技能 砸击(中立敌对)
                constant integer ACtc
                // 单位技能 砸击(雷霆蜥蜴)
                constant integer ACt2
                // 单位技能 投掷巨石
                constant integer ACtb
                // 单位技能 狂暴之怒
                constant integer ACbr
                // 单位技能 嗜血(中立敌对2)
                constant integer ACbb
                // 单位技能 狂乱
                constant integer Afzy
                // 单位技能 嗜血(中立敌对1)
                constant integer ACbl
                // 单位技能 诱捕(中立敌对)
                constant integer ACen
                // 单位技能 吞噬(中立敌对)
                constant integer ACdv
                // 单位技能 沉睡
                constant integer ACsp
                // 单位技能 生出骷髅(可能是黑蚀箭)
                constant integer Asod
                // 单位技能 生出小蜘蛛(中立敌对)
                constant integer Assp
                // 单位技能 生出蜘蛛(中立敌对)
                constant integer Aspd
                // 单位技能 生出多头蛇
                constant integer Aspy
                // 单位技能 生出多头蛇幼崽
                constant integer Aspt
                // 单位技能 统御光环
                constant integer AOac
                // 单位技能 统御光环
                constant integer ACac
                // 单位技能 重生(中立敌对)
                constant integer ACrn
                // 单位技能 法力燃烧(中立敌对1)
                constant integer Ambd
                // 单位技能 法力燃烧(中立敌对2)
                constant integer Amnb
                // 单位技能 法力燃烧(中立敌对3)
                constant integer Ambb
                // 单位技能 幽魂
                constant integer Agho
                // 单位技能 幽魂(可见)
                constant integer Aeth
                // 单位技能 法力恢复光环
                constant integer Aarm
                // 单位技能 生命恢复光环(中立)
                constant integer ACnr
                // 单位技能 法力恢复(中立)
                constant integer ANre
                // 单位技能 返送黄金
                constant integer Argd
                // 单位技能 返送黄金和木材
                constant integer Argl
                // 单位技能 返送木材
                constant integer Arlm
                // 单位技能 未知技能(中立敌对)
                constant integer Aand
                // 单位技能 反魔法护罩(中立敌对)
                constant integer ACam
                // 单位技能 辉煌光环(中立敌对)
                constant integer ACba
                // 单位技能 猛击(中立敌对1)
                constant integer ACbh
                // 单位技能 猛击(中立敌对2)
                constant integer ANbh
                // 单位技能 重殴(中立敌对3/重殴)
                constant integer ANb2
                // 单位技能 疾病之云(编辑器无此技能)
                constant integer Aapl
                // 单位技能 疾病之云(憎恶)
                constant integer Aap1
                // 单位技能 疾病之云(瘟疫结界)
                constant integer Aap2
                // 单位技能 疾病之云(中立敌对)
                constant integer Aap3
                // 单位技能 疾病之云(清道夫)
                constant integer Apts
                // 单位技能 疾病之云(中立敌对)(无伤害)
                constant integer Aap4
                // 单位技能 强击光环(中立敌对)
                constant integer ACat
                // 单位技能 荒芜
                constant integer Abli
                // 单位技能 荒芜驱散 小
                constant integer Abds
                // 单位技能 荒芜驱散 大
                constant integer Abdl
                // 单位技能 荒芜蔓延 小
                constant integer Abgs
                // 单位技能 荒芜蔓延 大
                constant integer Abgl
                // 单位技能 暴风雪(中立敌对)
                constant integer ACbz
                // 单位技能 食尸(中立敌对)
                constant integer ACcn
                // 单位技能 腐臭蝠群(中立敌对)
                constant integer ACca
                // 单位技能 闪电链(中立敌对)
                constant integer ACcl
                // 单位技能 寒冰箭矢(中立敌对)
                constant integer ACcw
                // 单位技能 残废术(中立敌对)
                constant integer ACcr
                // 单位技能 致命一击(中立敌对)
                constant integer ACct
                // 单位技能 诅咒(中立敌对)
                constant integer ACcs
                // 单位技能 飓风术(中立敌对)
                constant integer ACcy
                // 单位技能 枯萎凋零(中立敌对)
                constant integer SNdd
                // 单位技能 凋零缠绕(中立敌对)
                constant integer ACdc
                // 单位技能 侦测者
                constant integer Adet
                // 单位技能 侦测者(警戒结界)
                constant integer Adt1
                // 单位技能 侦测者(影魔)(未使用)
                constant integer Adt2
                // 单位技能 侦测者(飞行器)(未使用)
                constant integer Adt3
                // 单位技能 驱散魔法(中立敌对)
                constant integer Adsm
                // 单位技能 驱除魔法(中立敌对)
                constant integer ACdm
                // 单位技能 驱除魔法(中立敌对、二号位)
                constant integer ACd2
                // 单位技能 圣盾术(中立敌对)
                constant integer ACds
                // 单位技能 坚韧光环(中立敌对)
                constant integer SCae
                // 单位技能 诱捕(中立敌对)
                constant integer ACen
                // 单位技能 纠缠根须(中立敌对1)
                constant integer Aenr
                // 单位技能 闪避(中立敌对)
                constant integer ACev
                // 单位技能 闪避(中立敌对)(100%生效)
                constant integer ACes
                // 单位技能 精灵之火(中立敌对)
                constant integer ACff
                // 单位技能 野性之魂(中立敌对)
                constant integer ACsf
                // 单位技能 野性之魂(中立敌对、猪)
                constant integer ACs9
                // 单位技能 火焰箭(中立敌对)
                constant integer ACfb
                // 单位技能 自然之力(中立敌对)
                constant integer ACfr
                // 单位技能 霜甲术(中立敌对)
                constant integer ACfa
                // 单位技能 霜甲术(自动施法)(中立敌对)
                constant integer ACf2
                // 单位技能 霜甲术(自动施法)(中立敌对)
                constant integer ACfu
                // 单位技能 冰霜新星(中立敌对)
                constant integer ACfn
                // 单位技能 采集(阿克蒙德的食尸鬼采集木材)
                constant integer Ahr2
                // 单位技能 采集(地精伐木机采集木材)
                constant integer Ahr3
                // 单位技能 治疗术(中立敌对2)
                constant integer Anh1
                // 单位技能 治疗术(中立敌对3)
                constant integer Anh2
                // 单位技能 献祭(中立敌对)
                constant integer ACim
                // 单位技能 未知技能(总是开启)
                constant integer ACma
                // 单位技能 心灵之火(中立敌对)
                constant integer ACif
                // 单位技能 闪电之盾(中立敌对)
                constant integer ACls
                // 单位技能 变形术(中立敌对)
                constant integer ACpy
                // 单位技能 占据(中立敌对)
                constant integer ACps
                // 单位技能 粉碎(中立敌对)
                constant integer ACpv
                // 单位技能 净化(中立敌对)
                constant integer ACpu
                // 单位技能 火焰之雨(中立敌对2)
                constant integer ACrf
                // 单位技能 亡者复生(中立敌对)
                constant integer ACrd
                // 单位技能 回春术(中立敌对)
                constant integer ACrj
                // 单位技能 修理(人族)
                constant integer Ahrp
                // 单位技能 咆哮(中立敌对)
                constant integer ACro
                // 单位技能 咆哮(骷髅兽人勇士)
                constant integer ACr1
                // 单位技能 扎根(古树)
                constant integer Aro1
                // 单位技能 扎根(守护古树)
                constant integer Aro2
                // 单位技能 灼热之箭(中立敌对)
                constant integer ACsa
                // 单位技能 震荡波(中立敌对)
                constant integer ACsh
                // 单位技能 震荡波(陷阱)
                constant integer ACst
                // 单位技能 沉睡(中立敌对)
                constant integer ACsl
                // 单位技能 减速术(中立敌对)
                constant integer ACsw
                // 单位技能 荆棘光环(中立敌对)
                constant integer ACah
                // 单位技能 邪恶光环(中立敌对)
                constant integer ACua
                // 单位技能 邪恶狂热(中立敌对)
                constant integer ACuf
                // 单位技能 生命窃取(霜之哀伤)
                constant integer SCva
                // 单位技能 吸血光环(中立敌对)
                constant integer ACvp
                // 单位技能 战争践踏(中立敌对1),(中立敌对)
                constant integer Awrs
                // 单位技能 战争践踏(中立敌对2),(中立敌对)
                constant integer Awrh
                // 单位技能 战争践踏(中立敌对3),(中立敌对)
                constant integer Awrg
                // 单位技能 粉碎(中立敌对)
                constant integer ACpv
                // 单位技能 浸毒武器(中立敌对)
                constant integer ACvs
                // 单位技能 蛛网(中立敌对)
                constant integer ACwb
                // 单位技能 粉碎波浪
                constant integer ACcv
                // 单位技能 粉碎波浪(次级)
                constant integer ACc2
                // 单位技能 粉碎波浪(次级)
                constant integer ACc3
                // 单位技能 召唤海元素
                constant integer ACwe
                // 单位技能 凤凰烈焰(飞行单位)
                constant integer Apmf
                // 单位技能 抗性体肤(中立敌对1)
                constant integer ACrk
                // 单位技能 抗性体肤(中立敌对2)
                constant integer ACsk
                // 单位技能 叉状闪电(中立敌对)
                constant integer ACfl
                // 单位技能 孳生触须
                constant integer ACtn
                // 单位技能 反噬
                constant integer Afbb
                // 单位技能 驱除魔法(娜迦)
                constant integer Andm
                // 单位技能 采集(娜迦)(中立)(采集黄金和木材)
                constant integer ANha
                // 单位技能 诱捕(娜迦)
                constant integer ANen
                // 单位技能 寄生虫(娜迦)
                constant integer ANpa
                // 单位技能 飓风术(娜迦)
                constant integer Acny
                // 单位技能 召唤仪式(娜迦)
                constant integer Ahnl
                // 单位技能 地洞侦测(飞行单位、已废弃)
                constant integer Abdt
                // 单位技能 骑乘
                constant integer Amou
                // 单位技能 采集(黄金和木材)
                constant integer Ahar
                // 单位技能 采集(食尸鬼采集木材)
                constant integer Ahrl
                // 单位技能 暴露
                constant integer Adta
                // 单位技能 修理(兽族、娜迦族、达拉内尔族(破碎者))
                constant integer Arep
                // 单位技能 建造(暗夜精灵)
                constant integer AEbu
                // 单位技能 建造(纳迦)
                constant integer AGbu
                // 单位技能 建造(人族)
                constant integer AHbu
                // 单位技能 建造(中立)
                constant integer ANbu
                // 单位技能 建造(兽人)
                constant integer AObu
                // 单位技能 建造(亡灵)
                constant integer AUbu
                // 单位技能 着火(人类)
                constant integer Afih
                // 单位技能 着火(暗夜精灵)
                constant integer Afin
                // 单位技能 着火(兽人)
                constant integer Afio
                // 单位技能 着火
                constant integer Afir
                // 单位技能 着火(亡灵)
                constant integer Afiu
                // 单位技能 蝗虫
                constant integer Aloc
                // 单位技能 卸下驾驶员
                constant integer Atdp
                // 单位技能 装载驾驶员
                constant integer Atlp
                // 单位技能 塔楼
                constant integer Attu
                // 单位技能 复仇之魂
                constant integer Avng
                // 单位技能 法力闪耀
                constant integer Amfl
                // 单位技能 相位变换
                constant integer Apsh
                // 单位技能 虚灵(暗夜精灵族)
                constant integer Aetl
                // 单位技能 球体(复仇 - 1级)
                constant integer Asp1
                // 单位技能 球体(复仇 - 2级)
                constant integer Asp2
                // 单位技能 球体(复仇 - 3级)
                constant integer Asp3
                // 单位技能 球体(复仇 - 4级)
                constant integer Asp4
                // 单位技能 球体(复仇 - 5级)
                constant integer Asp5
                // 单位技能 球体(复仇 - 6级)
                constant integer Asp6
                // 单位技能 战棍
                constant integer Agra
                // 单位技能 硬化体肤
                constant integer Assk
                // 单位技能 抗性体肤
                constant integer Arsk
                // 单位技能 嘲讽
                constant integer Atau
                // 单位技能 月刃
                constant integer Amgl
                // 单位技能 月刃(娜萨)
                constant integer Amgr
                // 单位技能 减速毒药
                constant integer Aspo
                // 单位技能 哨兵
                constant integer Aesn
                // 单位技能 哨兵(娜萨)
                constant integer Aesr
                // 单位技能 吃树
                constant integer Aeat
                // 单位技能 补充法力和生命
                constant integer Ambt
                // 单位技能 采集(小精灵采集黄金和木材)
                constant integer Awha
                // 单位技能 采集(小精灵黄金和木材－远古之魂)
                constant integer Awh2
                // 单位技能 自爆
                constant integer Adtn
                // 单位技能 治疗术
                constant integer Awhe
                // 单位技能 扎根
                constant integer Aroo
                // 单位技能 熊形态
                constant integer Abrf
                // 单位技能 风暴乌鸦形态
                constant integer Arav
                // 单位技能 不明技能(用于熊德变身)(可选的)
                constant integer Sbr2
                // 单位技能 不明技能(用于鸟德变身)(可选的)
                constant integer Sra2
                // 单位技能 驱除魔法
                constant integer Aadm
                // 单位技能 法术免疫
                constant integer Amim
                // 单位技能 夜视能力
                constant integer Ault
                // 单位技能 艾露恩的赐福
                constant integer Aegr
                // 单位技能 骑乘角鹰兽(老的)
                constant integer Acoa
                // 单位技能 骑乘角鹰兽
                constant integer Aco2
                // 单位技能 搭载弓箭手(老的)
                constant integer Acoh
                // 单位技能 搭载弓箭手
                constant integer Aco3
                // 单位技能 解散(角鹰兽骑士骑乘)
                constant integer Adec
                // 单位技能 腐蚀吐息
                constant integer Acor
                // 单位技能 精灵之火
                constant integer Afae
                // 单位技能 精灵之火(变形)
                constant integer Afa2
                // 单位技能 飓风术
                constant integer Acyc
                // 单位技能 回春术
                constant integer Arej
                // 单位技能 复苏/更新(暗夜精灵族修理建筑)
                constant integer Aren
                // 单位技能 咆哮
                constant integer Aroa
                // 单位技能 咆哮(变形)
                constant integer Ara2
                // 单位技能 闪电攻击
                constant integer Alit
                // 单位技能 不明技能(标注为生命之树升级)
                constant integer Atol
                // 单位技能 隐藏/影遁(物品)
                constant integer AIhm
                // 单位技能 空中枷锁
                constant integer Amls
                // 单位技能 暴露
                constant integer AHta
                // 单位技能 反噬(破法者)
                constant integer Afbk
                // 单位技能 反噬(奥术塔)
                constant integer Afbt
                // 单位技能 控制魔法
                constant integer Acmg
                // 单位技能 对空机炮
                constant integer Aflk
                // 单位技能 破片榴弹
                constant integer Afsh
                // 单位技能 火箭弹幕
                constant integer Aroc
                // 单位技能 混乱
                constant integer Srtt
                // 单位技能 魔法防御
                constant integer Amdf
                // 单位技能 球体
                constant integer Asph
                // 单位技能 法术窃取
                constant integer Asps
                // 单位技能 迷雾之云
                constant integer Aclf
                // 单位技能 凤凰变形 (凤凰蛋相关)
                constant integer Aphx
                // 单位技能 凤凰烈焰
                constant integer Apxf
                // 单位技能 飞行器炸弹
                constant integer Agyb
                // 单位技能 风暴战锤
                constant integer Asth
                // 单位技能 真视(飞行器)
                constant integer Agyv
                // 单位技能 防御
                constant integer Adef
                // 单位技能 照明弹
                constant integer Afla
                // 单位技能 魔法岗哨(人类防御塔)
                constant integer Adts
                // 单位技能 心灵之火
                constant integer Ainf
                // 单位技能 驱散魔法
                constant integer Adis
                // 单位技能 治疗术
                constant integer Ahea
                // 单位技能 减速术
                constant integer Aslo
                // 单位技能 隐形术
                constant integer Aivs
                // 单位技能 变形术
                constant integer Aply
                // 单位技能 战斗号召(农夫)
                constant integer Amil
                // 单位技能 战斗号召(议政厅)
                constant integer Amic
                // 单位技能 裂甲之刃
                constant integer Ahsb
                // 单位技能 荒芜上的生命恢复
                constant integer Ablr
                // 单位技能 补充
                constant integer Arpb
                // 单位技能 荒芜精华
                constant integer Arpl
                // 单位技能 灵魂之触
                constant integer Arpm
                // 单位技能 发掘尸体
                constant integer Aexh
                // 单位技能 补充法力
                constant integer Amb2
                // 单位技能 毁灭者形态
                constant integer Aave 
                // 单位技能 毁灭宝珠
                constant integer Afak
                // 单位技能 吞噬魔法
                constant integer Advm
                // 单位技能 荒芜光环
                constant integer Aabr
                // 单位技能 吸收法力
                constant integer Aabs
                // 单位技能 钻地(地穴恶魔)
                constant integer Abur
                // 单位技能 钻地(2级甲虫)
                constant integer Abu2
                // 单位技能 钻地(3级甲虫)
                constant integer Abu3
                // 单位技能 真视(影魔)
                constant integer Atru
                // 单位技能 采集(侍僧黄金)
                constant integer Aaha
                // 单位技能 反召唤建筑
                constant integer Auns
                // 单位技能 产生尸体
                constant integer Agyd
                // 单位技能 献祭(侍僧)
                constant integer Alam
                // 单位技能 献祭(献祭深渊)
                constant integer Asac
                // 单位技能 食尸(食尸鬼)
                constant integer Acan
                // 单位技能 食尸(憎恶)
                constant integer Acn2
                // 单位技能 蜘蛛攻击
                constant integer Aspa
                // 单位技能 蛛网
                constant integer Aweb
                // 单位技能 石像形态
                constant integer Astn
                // 单位技能 亡者复生
                constant integer Arai
                // 单位技能 邪恶狂热
                constant integer Auhf
                // 单位技能 邪恶狂热(术士)
                constant integer Suhf
                // 单位技能 诅咒
                constant integer Acrs
                // 单位技能 反魔法护罩
                constant integer Aams
                // 单位技能 反魔法护罩(魔法抗性)
                constant integer Aam2
                // 单位技能 占据
                constant integer Apos
                // 单位技能 占据(引导中)
                constant integer Aps2
                // 单位技能 残废术
                constant integer Acri
                // 单位技能 残废术(术士)
                constant integer Scri
                // 单位技能 恢复(不死族修理建筑)
                constant integer Arst
                // 单位技能 邪恶狂潮
                constant integer Auuf
                // 单位技能 燃油
                constant integer Abof
                // 单位技能 狂暴
                constant integer Absk
                // 单位技能 狂战士升级
                constant integer Sbsk
                // 单位技能 加强型地洞升级
                constant integer Arbr
                // 单位技能 先祖之魂
                constant integer Aast
                // 单位技能 消魔(老的)
                constant integer Adch
                // 单位技能 消魔
                constant integer Adcn
                // 单位技能 肉身形态
                constant integer Acpf
                // 单位技能 虚灵形态
                constant integer Aetf
                // 单位技能 灵魂链接
                constant integer Aspl
                // 单位技能 火油瓶
                constant integer Aliq
                // 单位技能 不稳定化合物
                constant integer Auco
                // 单位技能 火焰箭(术士)
                constant integer Awfb
                // 单位技能 混乱(兽人步兵)
                constant integer Acha
                // 单位技能 混乱
                constant integer Sca1
                // 单位技能 混乱(狼骑兵)
                constant integer Sca2
                // 单位技能 混乱(萨满祭司)
                constant integer Sca3
                // 单位技能 混乱(科多兽)
                constant integer Sca4
                // 单位技能 混乱(苦工)
                constant integer Sca5
                // 单位技能 混乱(格罗玛什)
                constant integer Sca6
                // 单位技能 粉碎
                constant integer Awar
                // 单位技能 战斗戒备
                constant integer Abtl
                // 单位技能 解除戒备
                constant integer Astd
                // 单位技能 诱捕
                constant integer Aens
                // 单位技能 粉碎
                constant integer Awar
                // 单位技能 吞噬
                constant integer Adev
                // 单位技能 净化
                constant integer Aprg
                // 单位技能 净化
                constant integer Apg2
                // 单位技能 闪电之盾
                constant integer Alsh
                // 单位技能 嗜血
                constant integer Ablo
                // 单位技能 警戒结界
                constant integer Aeye
                // 单位技能 静滞陷阱
                constant integer Asta
                // 单位技能 治疗结界(巫医)
                constant integer Ahwd
                // 单位技能 治疗结界光环(治疗结界)
                constant integer Aoar
                // 单位技能 毒矛
                constant integer Aven
                // 单位技能 毒刺
                constant integer Apoi
                // 单位技能 毒刺(毒液之球)
                constant integer Apo2
                // 单位技能 追踪术
                constant integer Anit
                // 单位技能 尖刺障碍
                constant integer Aspi
                // 单位技能 掠夺
                constant integer Asal
                // 单位技能 掠夺
                constant integer Asa2
                // 单位技能 战鼓
                constant integer Aakb
        
        
        // 物品技能
        
                // 物品技能 监视符文
                constant integer APwt
                // 物品技能 闪现
                constant integer AIbk
                // 物品技能 力量提升
                constant integer AIsm
                // 物品技能 敏捷提升
                constant integer AIam
                // 物品技能 暂时速度加成
                constant integer AIsp
                // 物品技能 攻击力加成(+3)
                constant integer AIat
                // 物品技能 护甲加成
                constant integer AIde
                // 物品技能 范围树木/城墙伤害
                constant integer AIdm
                // 物品技能 经验获取
                constant integer AIem
                // 物品技能 经验获取(强效)
                constant integer AIe2
                // 物品技能 浓雾之云
                constant integer AIfg
                // 物品技能 夺取旗帜
                constant integer AIfl
                // 物品技能 夺取旗帜(人类)
                constant integer AIfm
                // 物品技能 夺取旗帜(暗夜精灵)
                constant integer AIfn
                // 物品技能 夺取旗帜(兽人)
                constant integer AIfo
                // 物品技能 夺取旗帜(亡灵)
                constant integer AIfe
                // 物品技能 等级提升
                constant integer AIlm
                // 物品技能 智力提升
                constant integer AIim
                // 物品技能 力量/敏捷/智力提升
                constant integer AIxm
                // 物品技能 治疗
                constant integer AIhe
                // 物品技能 治疗(最小的)
                constant integer AIhx
                // 物品技能 范围治疗
                constant integer AIha
                // 物品技能 范围治疗(强效)
                constant integer AIhb
                // 物品技能 范围治疗 - 次级
                constant integer APh1
                // 物品技能 范围治疗
                constant integer APh2
                // 物品技能 范围治疗 - 强效
                constant integer APh3
                // 物品技能 暂时隐形
                constant integer AIvi
                // 物品技能 暂时无敌
                constant integer AIvu
                // 物品技能 暂时无敌(次级)
                constant integer AIvl
                // 物品技能 法力值恢复
                constant integer AIma
                // 物品技能 范围法力值恢复
                constant integer AImr
                // 物品技能 符文 - 范围法力值恢复
                constant integer APmr
                // 物品技能 符文 - 范围法力值恢复 - 强效
                constant integer APmg
                // 物品技能 生命值/法力值恢复
                constant integer AIre
                // 物品技能 范围生命值/法力值恢复
                constant integer AIra
                // 物品技能 符文 - 范围生命值/法力值恢复
                constant integer APra
                // 物品技能 暂时范围护甲加成
                constant integer AIda
                // 物品技能 暂时范围护甲加成(有生命&法力恢复)
                constant integer AIdb
                // 物品技能 保护卷轴
                constant integer Bdef
                // 物品技能 范围侦测
                constant integer AIta
                // 物品技能 法力恢复
                constant integer AIrm
                // 物品技能 火焰箭
                constant integer AIfi
                // 物品技能 幻象
                constant integer AIil
                // 物品技能 幻象
                constant integer BIil
                // 物品技能 驱散
                constant integer AIdi
                // 物品技能 驱散(有冷却时间)
                constant integer AIds
                // 物品技能 驱散
                constant integer APdi
                // 物品技能 攻击火焰加成
                constant integer AIfb
                // 物品技能 攻击闪电加成
                constant integer AIlb
                // 物品技能 攻击黑蚀箭加成
                constant integer AIdf
                // 物品技能 净化(1)
                constant integer AIlp
                // 物品技能 攻击冰霜加成
                constant integer AIob
                // 物品技能 攻击毒素加成
                constant integer AIpb
                // 物品技能 攻击腐化加成
                constant integer AIcb
                // 物品技能 腐蚀
                constant integer BIcb
                // 物品技能 视野范围加成
                constant integer AIsi
                // 物品技能 盗取灵魂
                constant integer AIso
                // 物品技能 灵魂占据
                constant integer Asou
                // 物品技能 盗取灵魂
                constant integer BIsv
                // 物品技能 重生
                constant integer AIrc
                // 物品技能 召回
                constant integer AIrt
                // 物品技能 城镇传送
                constant integer AItp
                // 物品技能 统御
                constant integer AIco
                // 物品技能 召唤红色/蓝色幼龙
                constant integer AIfd
                // 物品技能 召唤熊怪/蓝色龙人
                constant integer AIff
                // 物品技能 召唤岩石魔像
                constant integer AIfr
                // 物品技能 召唤末日守卫
                constant integer AIfu
                // 物品技能 召唤恶魔猎犬
                constant integer AIfh
                // 物品技能 召唤骷髅
                constant integer AIfs
                // 物品技能 召唤冰雪亡魂
                constant integer AIir
                // 物品技能 召唤巨熊怪战士
                constant integer AIuw
                // 物品技能 召唤单位
                constant integer BFig
                // 物品技能 放置地精地雷
                constant integer AIpm
                // 物品技能 永久伤害提升,攻击力提升
                constant integer AIaa
                // 物品技能 永久生命值提升,生命值提升
                constant integer AImi
                // 物品技能 永久生命值提升(次级)
                constant integer AIpx
                // 物品技能 生命窃取
                constant integer AIva
                // 物品技能 献祭
                constant integer AIcf
                // 物品技能 烈焰披风
                constant integer BIcf
                // 物品技能 英雄属性加成
                constant integer AIab
                // 物品技能 冰冻攻击力加成
                constant integer AIzb
                // 物品技能 生命值加成
                constant integer AIml
                // 物品技能 生命值加成(最小的)
                constant integer AIlz
                // 物品技能 生命恢复
                constant integer Arel
                // 物品技能 反魔法护罩
                constant integer Aami
                // 物品技能 法力值加成
                constant integer AImm
                // 物品技能 法力值加成(100)
                constant integer AImz
                // 物品技能 法力值加成(75)
                constant integer AImv
                // 物品技能 法力值加成(200)
                constant integer AI2m
                // 物品技能 攻击速度加成
                constant integer AIas
                // 物品技能 攻击速度加成(急速手套)
                constant integer AIsx
                // 物品技能 攻击速度加成(强效)
                constant integer AIs2
                // 物品技能 亡者再临
                constant integer AIan
                // 物品技能 复活术
                constant integer AIrs
                // 物品技能 复活术(冷却时间)
                constant integer AIrx
                // 物品技能 次级复活符文
                constant integer APrl
                // 物品技能 强效复活符文
                constant integer APrr
                // 物品技能 永久伤害提升 - 攻击力提升
                constant integer AIaa
                // 物品技能 永久生命值提升 - 生命值提升
                constant integer AImi
                // 物品技能 移动速度加成
                constant integer AIms
                // 物品技能 英雄属性加成(+3 敏捷)
                constant integer AIa3
                // 物品技能 英雄属性加成(+4 敏捷)
                constant integer AIa4
                // 物品技能 英雄属性加成(+6 敏捷)
                constant integer AIa6
                // 物品技能 英雄属性加成(+10 敏捷)
                constant integer AIaz
                // 物品技能 英雄属性加成(+5 所有属性)
                constant integer AIx5
                // 物品技能 英雄属性加成(+2 所有属性)
                constant integer AIx2
                // 物品技能 英雄属性加成(+3 力量)
                constant integer AIs3
                // 物品技能 英雄属性加成(+4 力量)
                constant integer AIs4
                // 物品技能 英雄属性加成(+6 力量)
                constant integer AIs6
                // 物品技能 英雄属性加成(+3 智力)
                constant integer AIi3
                // 物品技能 英雄属性加成(+4 智力)
                constant integer AIi4
                // 物品技能 英雄属性加成(+6 智力)
                constant integer AIi6
                // 物品技能 敏捷提升(+2)
                constant integer AIgm
                // 物品技能 智力提升(+2)
                constant integer AItm
                // 物品技能 力量提升(+2)
                constant integer AInm
                // 物品技能 攻击力加成(+6)
                constant integer AIt6
                // 物品技能 攻击力加成(+9)(在1.36中为+8,技能名称和说明未修改)
                constant integer AIt9
                // 物品技能 攻击力加成(+12)
                constant integer AItc
                // 物品技能 攻击力加成(+15)
                constant integer AItf
                // 物品技能 飓风术
                constant integer AIcy
                // 物品技能 护甲加成(+1)
                constant integer AId1
                // 物品技能 护甲加成(+2)
                constant integer AId2
                // 物品技能 护甲加成(+3)
                constant integer AId3
                // 物品技能 护甲加成(+4)
                constant integer AId4
                // 物品技能 护甲加成(+5)
                constant integer AId5
                // 物品技能 护甲加成(+7)
                constant integer AId7
                // 物品技能 护甲加成(+8)
                constant integer AId8
                // 物品技能 护甲加成(+10)
                constant integer AId0
                // 物品技能 召唤地狱火
                constant integer AIin
                // 物品技能 生命值加成(最小的)
                constant integer AIlf
                // 物品技能 生命值加成(次级)
                constant integer AIl1
                // 物品技能 生命值加成(强效)
                constant integer AIl2
                // 物品技能 生命恢复(次级)
                constant integer Arll
                // 物品技能 治疗(次级)
                constant integer AIh1
                // 物品技能 治疗(强效)
                constant integer AIh2
                // 物品技能 治疗结界
                constant integer AIhw
                // 物品技能 警戒结界
                constant integer AIsw
                // 物品技能 暂时隐形(次级)
                constant integer AIv1
                // 物品技能 暂时隐形(强效)
                constant integer AIv2
                // 物品技能 法力值恢复(次级)
                constant integer AIm1
                // 物品技能 法力值恢复(强效)
                constant integer AIm2
                // 物品技能 法力恢复(次级)
                constant integer AIrn
                // 物品技能 虔诚光环
                constant integer AIad
                // 物品技能 统御光环
                constant integer AIcd
                // 物品技能 辉煌光环
                constant integer AIba
                // 物品技能 吸血光环
                constant integer AIav
                // 物品技能 强击光环
                constant integer AIar
                // 物品技能 坚韧光环
                constant integer AIae
                // 物品技能 邪恶光环
                constant integer AIau
                // 物品技能 闪电之盾
                constant integer AIls
                // 物品技能 咆哮
                constant integer AIrr
                // 物品技能 闪避
                constant integer AIev
                // 物品技能 法术免疫
                constant integer AImx
                // 物品技能 法力值加成(最小的)
                constant integer AImb
                // 物品技能 法力值加成(强效)
                constant integer AIbm
                // 物品技能 夜视能力
                constant integer AIuv
                // 物品技能 永久生命值提升(+50)
                constant integer AImh
                // 物品技能 英雄属性加成(+1 敏捷)
                constant integer AIa1
                // 物品技能 英雄属性加成(+1 所有属性)
                constant integer AIx1
                // 物品技能 英雄属性加成(+1 力量)
                constant integer AIs1
                // 物品技能 英雄属性加成(+1 智力)
                constant integer AIi1
                // 物品技能 飞毯
                constant integer AIfc
                // 物品技能 治疗药膏
                constant integer AIrl
                // 物品技能 再生(持续恢复)
                constant integer BIrl
                // 物品技能 明澈药水
                constant integer AIpr
                // 物品技能 次级明澈药水
                constant integer AIpl
                // 物品技能 普通物品技能 恢复效果
                constant integer AIp1
                // 物品技能 明澈药水(持续恢复)
                constant integer BIrm
                // 物品技能 普通物品技能 恢复效果(II)
                constant integer AIp2
                // 物品技能 普通物品技能 恢复效果(III)
                constant integer AIp3
                // 物品技能 普通物品技能 恢复效果(IV)
                constant integer AIp4
                // 物品技能 普通物品技能 恢复效果(V)
                constant integer AIp5
                // 物品技能 普通物品技能 恢复效果(VI)
                constant integer AIp6
                // 物品技能 恢复卷轴
                constant integer AIsl
                // 物品技能 回春术(持续恢复)
                constant integer BIrg
                // 物品技能 一箱黄金
                constant integer AIgo
                // 物品技能 一捆木材
                constant integer AIlu
                // 物品技能 信号枪
                constant integer AIfa
                // 物品技能 暴露整张地图
                constant integer AIrv
                // 物品技能 连锁驱散
                constant integer AIdc
                // 物品技能 蛛网
                constant integer AIwb
                // 物品技能 怪兽诱饵
                constant integer AImo
                // 物品技能 怪兽诱饵
                constant integer BImo
                // 物品技能 随机物品
                constant integer AIri
                // 物品技能 放置荒芜
                constant integer Ablp
                // 物品技能 窃取
                constant integer Aste
                // 物品技能 改变一天的时间
                constant integer AIct
                // 物品技能 吸血药水
                constant integer AIpv
                // 物品技能 吸血药水
                constant integer BIpv
                // 物品技能 法术伤害减免
                constant integer AIsr
                // 物品技能 建造迷你城堡
                constant integer AIbl
                // 物品技能 建造迷你大厅
                constant integer AIbg
                // 物品技能 建造迷你哨塔
                constant integer AIbt
                // 物品技能 影眼魔杖
                constant integer Ashs
                // 物品技能 影眼魔杖
                constant integer Bshs
                // 物品技能 重修之书
                constant integer Aret
                // 物品技能 传送法杖
                constant integer AImt
                // 物品技能 保存法杖
                constant integer ANpr
                // 物品技能 机械小动物
                constant integer Amec
                // 物品技能 机械小动物
                constant integer Bmec
                // 物品技能 法术护盾(护符)
                constant integer ANss
                // 物品技能 法术护盾(符文)
                constant integer ANse
                // 物品技能 法术护盾
                constant integer BNss
                // 物品技能 法术书
                constant integer Aspb
                // 物品技能 亡者复生
                constant integer AIrd
                // 物品技能 庇护法杖
                constant integer ANsa
                // 物品技能 庇护
                constant integer BNsa
                // 物品技能 急速卷轴
                constant integer AIsa
                // 物品技能 速度符文
                constant integer APsa
                // 物品技能 显影之尘
                constant integer AItb
                // 物品技能 显影之尘
                constant integer Bdet
                // 物品技能 攻击减速加成
                constant integer AIsb
                // 物品技能 攻击闪电加成(新的)
                constant integer AIll
                // 物品技能 减速
                constant integer AIos
                // 物品技能 黑蚀箭
                constant integer ANbs
                // 物品技能 灵魂链接(范围)
                constant integer Aspp
                // 物品技能 重生
                constant integer AIrb
                // 物品技能 重生(这个单位已经重生过了)
                constant integer BIrb
                // 物品技能 黑暗召唤
                constant integer AUds
                // 物品技能 反魔法护罩
                constant integer AIxs
                // 物品技能 圣盾术
                constant integer AIdv
                // 物品技能 沉默
                constant integer AIse
                // 物品技能 净化(2)
                constant integer AIpg
                // 物品技能 净化(3)
                constant integer AIps
                // 物品技能 攻击力加成(+1)
                constant integer AItg
                // 物品技能 攻击力加成(+2)
                constant integer AIth
                // 物品技能 攻击力加成(+4)
                constant integer AIti
                // 物品技能 攻击力加成(+5)(在1.36中为+4,技能名称和说明未修改)
                constant integer AItj
                // 物品技能 攻击力加成(+7)
                constant integer AItk
                // 物品技能 攻击力加成(+8)
                constant integer AItl
                // 物品技能 攻击力加成(+10)
                constant integer AItn
                // 物品技能 攻击力加成(+20)
                constant integer AItx
                // 物品技能 最低治疗(减慢冷却时间)
                constant integer AIh3
                // 物品技能 兽人战旗
                constant integer AIfx
                // 物品技能 攻击火焰加成(古尔丹)
                constant integer AIgd
                // 物品技能 建造迷你列王祭坛
                constant integer AIbh
                // 物品技能 建造迷你铁匠铺
                constant integer AIbb
                // 物品技能 建造迷你伐木场
                constant integer AIbr
                // 物品技能 建造迷你农场
                constant integer AIbf
                // 物品技能 建造迷你兵营
                constant integer AIbs
                // 物品技能 暗影宝珠技能
                constant integer AIdn
                // 物品技能 复活(特别战役物品)
                constant integer AInd
                // 物品技能 邪恶狂热
                constant integer AIuf
                // 物品技能 控制魔法
                constant integer AIcm
                // 物品技能 死亡一指
                constant integer AIfz
                // 物品技能 天灾契约
                constant integer AIdp
                // 物品技能 防御(被动防御)
                constant integer AIdd
                // 物品技能 猛击
                constant integer AIbx
                // 物品技能 水栖奴仆
                constant integer AIwm
                // 物品技能 召唤猎头者
                constant integer AIsh
                // 物品技能 猎头者之灵
                constant integer BIsh
                // 物品技能 恢复光环
                constant integer AIgx
                // 物品技能 圣光术
                constant integer AIhl
                // 物品技能 减速毒药
                constant integer AIsz
                // 物品技能 企鹅叫
                constant integer AIpz
                // 物品技能 近战火焰攻击力加成
                constant integer AIfw
                // 物品技能 近战冰霜攻击力加成
                constant integer AIft
                // 物品技能 近战闪电攻击力加成
                constant integer AIlx
                // 物品技能 致命一击
                constant integer AIcs
                // 物品技能 防御
                constant integer AIdd
                // 物品技能 闪电链
                constant integer AIcl
                // 物品技能 狂暴
                constant integer AIxk
                // 物品技能 蛛网
                constant integer BIwb
                // 物品技能 传送 - 暴露
                constant integer Btrv
                // 物品技能 仪式匕首(瞬发治疗)
                // @version 1.30
                constant integer AIdg
                // 物品技能 治疗减免(降低目标单位的生命恢复速度)
                constant integer BIhm
                // 物品技能 战鼓
                constant integer AIwd
                // 物品技能 仪式匕首(持续恢复)
                // @version 1.30
                constant integer AIg2
                // 物品技能 暂时无敌(神圣)
                constant integer AIvg
                // 物品技能 攻击治疗减免加成
                constant integer AIf2
                // 物品技能 点金术
                constant integer AIts
                // 物品技能 召唤熊怪追踪者
                constant integer AIut
                // 物品技能 英雄属性加成(+5 敏捷)
                constant integer AIa5
                // 物品技能 英雄属性加成(+3 所有属性)
                constant integer AIx3
                // 物品技能 英雄属性加成(+4 所有属性)
                constant integer AIx4
                // 物品技能 英雄属性加成(+5 力量)
                constant integer AIs5
                // 物品技能 英雄属性加成(+5 智力)
                constant integer AIi5
        
        
        // 魔法效果 (BUFF)
        
        
                // 魔法效果 (BUFF) 永久献祭(中立敌对1)
                constant integer BNpi
                // 魔法效果 (BUFF) 永久献祭(中立敌对2)
                constant integer Bpig
                // 魔法效果 (BUFF) 灵魂保存
                constant integer BNsl
                // 魔法效果 (BUFF) 群兽奔腾
                constant integer BNst
                // 魔法效果 (BUFF) 火焰之雨(范围)
                constant integer BNrf
                // 魔法效果 (BUFF) 冰冻
                constant integer Bfre
                // 魔法效果 (BUFF) 共享视野
                constant integer Bsha
                // 魔法效果 (BUFF) 龙卷风伤害
                constant integer Btdg
                // 魔法效果 (BUFF) 龙卷风旋转(范围)
                constant integer Btsa
                // 魔法效果 (BUFF) 季风
                constant integer ANmd
                // 魔法效果 (BUFF) 混乱之雨(效果)
                constant integer XErc
                // 魔法效果 (BUFF) 火焰之雨(效果)
                constant integer XErf
                // 魔法效果 (BUFF) 改变一天的时间(物品)
                constant integer XIct
                // 魔法效果 (BUFF) 季风(效果)
                constant integer XNmo
                // 魔法效果 (BUFF) 火山爆发(范围)
                constant integer BNva
                // 魔法效果 (BUFF) 火山爆发(效果)
                constant integer XNvc
                // 魔法效果 (BUFF) 集束火箭(效果)
                constant integer XNcs
                // 魔法效果 (BUFF) 治疗喷雾(效果)
                constant integer XNhs
                // 魔法效果 (BUFF) 焚身化骨
                constant integer BNic
                // 魔法效果 (BUFF) 灵魂燃烧
                constant integer BNso
                // 魔法效果 (BUFF) 熔岩爪牙
                constant integer BNlm
                // 魔法效果 (BUFF) 口袋工厂
                constant integer BNfy
                // 魔法效果 (BUFF) 集束火箭
                constant integer BNcs
                // 魔法效果 (BUFF) 工程学升级
                constant integer BNeg
                // 魔法效果 (BUFF) 发条地精
                constant integer BNcg
                // 魔法效果 (BUFF) 治疗喷雾
                constant integer BNhs
                // 魔法效果 (BUFF) 酸液炸弹
                constant integer BNab
                // 魔法效果 (BUFF) 化学狂暴
                constant integer BNcr
                // 魔法效果 (BUFF) 点金术
                constant integer BNtm
                // 魔法效果 (BUFF) 法力护盾
                constant integer BNms
                // 魔法效果 (BUFF) 火焰之雨
                constant integer BNrd
                // 魔法效果 (BUFF) 寒冰箭矢
                constant integer BHca
                // 魔法效果 (BUFF) 寒冰箭矢(叠加)
                constant integer Bcsd
                // 魔法效果 (BUFF) 寒冰箭矢(信息)
                constant integer Bcsi
                // 魔法效果 (BUFF) 恐惧嚎叫
                constant integer BNht
                // 魔法效果 (BUFF) 末日降临
                constant integer BNdo
                // 魔法效果 (BUFF) 末日降临(奴仆)
                constant integer BNdi
                // 魔法效果 (BUFF) 熊猫人元素之灵
                constant integer BNef
                // 魔法效果 (BUFF) 巨熊
                constant integer BNsg
                // 魔法效果 (BUFF) 豪猪
                constant integer BNsq
                // 魔法效果 (BUFF) 战鹰
                constant integer BNsw
                // 魔法效果 (BUFF) 心智腐烂
                constant integer BNmr
                // 魔法效果 (BUFF) 火焰之息
                constant integer BNbf
                // 魔法效果 (BUFF) 酩酊酒雾
                constant integer BNdh
                // 魔法效果 (BUFF) 沉默
                constant integer BNsi
                // 魔法效果 (BUFF) 黑蚀箭
                constant integer BNba
                // 魔法效果 (BUFF) 黑暗奴仆
                constant integer BNdm
                // 魔法效果 (BUFF) 季风
                constant integer BNmo
                // 魔法效果 (BUFF) 水栖奴仆
                constant integer BNwm
                // 魔法效果 (BUFF) 龙卷风(减速光环)
                constant integer Basl
                // 魔法效果 (BUFF) 龙卷风旋转(自动施放飓风)
                constant integer Btsp
                // 魔法效果 (BUFF) 龙卷风(时间化生命)
                constant integer BNto
                // 魔法效果 (BUFF) 黑暗转换
                constant integer BNdc
                // 魔法效果 (BUFF) 灵魂保存
                constant integer BNsp
                // 魔法效果 (BUFF) 眩晕
                constant integer Bchd
                // 魔法效果 (BUFF) 地狱火
                constant integer BNin
                // 魔法效果 (BUFF) 狂乱
                constant integer Bfzy
                // 魔法效果 (BUFF) 统御光环
                constant integer Boac
                // 魔法效果 (BUFF) 限时生命
                constant integer BTLF
                // 魔法效果 (BUFF) 法力恢复光环
                constant integer Barm
                // 魔法效果 (BUFF) 冰霜吐息
                constant integer BCbf
                // 魔法效果 (BUFF) 砸击
                constant integer BCtc
                // 魔法效果 (BUFF) 战斗咆哮
                constant integer BNbr
                // 魔法效果 (BUFF) 寄生虫
                constant integer BNpm
                // 魔法效果 (BUFF) 寄生虫
                constant integer BNpa
                // 魔法效果 (BUFF) 被侦测到
                constant integer Bdet
                // 魔法效果 (BUFF) 无敌
                constant integer Bvul
                // 魔法效果 (BUFF) 速度加成
                constant integer Bspe
                // 魔法效果 (BUFF) 减速
                constant integer Bfro
                // 魔法效果 (BUFF) 昏迷
                constant integer BSTN
                // 魔法效果 (BUFF) 昏迷(暂停)
                constant integer BPSE
                // 魔法效果 (BUFF) 荒芜(效果)
                constant integer Xbli
                // 魔法效果 (BUFF) 暴露(效果)
                constant integer Xbdt
                // 魔法效果 (BUFF) 英雄消散(效果)
                constant integer Xdis
                // 魔法效果 (BUFF) 复仇之魂
                constant integer Bvng
                // 魔法效果 (BUFF) 法力闪耀
                constant integer Bmfl
                // 魔法效果 (BUFF) 法力闪耀(额外的)
                constant integer Bmfa
                // 魔法效果 (BUFF) 相位变换
                constant integer Bpsh
                // 魔法效果 (BUFF) 嘲讽
                constant integer Btau
                // 魔法效果 (BUFF) 暗影突袭
                constant integer BEsh
                // 魔法效果 (BUFF) 暗影突袭
                constant integer BEsi
                // 魔法效果 (BUFF) 复仇
                constant integer BEsv
                // 魔法效果 (BUFF) 减速毒药(不叠加)
                constant integer Bspo
                // 魔法效果 (BUFF) 减速毒药(叠加)
                constant integer Bssd
                // 魔法效果 (BUFF) 腐蚀吐息
                constant integer Bcor
                // 魔法效果 (BUFF) 献祭
                constant integer BEim
                // 魔法效果 (BUFF) 恶魔变形
                constant integer BEme
                // 魔法效果 (BUFF) 纠缠根须
                constant integer BEer
                // 魔法效果 (BUFF) 自然之力
                constant integer BEfn
                // 魔法效果 (BUFF) 荆棘光环
                constant integer BEah
                // 魔法效果 (BUFF) 斥候
                constant integer BEst
                // 魔法效果 (BUFF) 强击光环
                constant integer BEar
                // 魔法效果 (BUFF) 精灵之火
                constant integer Bfae
                // 魔法效果 (BUFF) 飓风术
                constant integer Bcyc
                // 魔法效果 (BUFF) 飓风术(额外的)
                constant integer Bcy2
                // 魔法效果 (BUFF) 回春术
                constant integer Brej
                // 魔法效果 (BUFF) 咆哮
                constant integer Broa
                // 魔法效果 (BUFF) 献祭(施法者)
                constant integer BEia
                // 魔法效果 (BUFF) 吃树
                constant integer Beat
                // 魔法效果 (BUFF) 战棍
                constant integer Bgra
                // 魔法效果 (BUFF) 减速毒药(信息)
                constant integer Bssi
                // 魔法效果 (BUFF) 树皮术
                constant integer Bbar
                // 魔法效果 (BUFF) 星辰坠落(目标)
                constant integer AEsd
                // 魔法效果 (BUFF) 宁静(目标)
                constant integer AEtr
                // 魔法效果 (BUFF) 夜视能力
                constant integer Bult
                // 魔法效果 (BUFF) 星辰坠落(效果)
                constant integer XEsf
                // 魔法效果 (BUFF) 宁静(效果)
                constant integer XEtq
                // 魔法效果 (BUFF) 哨兵(效果)
                constant integer XEsn
                // 魔法效果 (BUFF) 建筑伤害 - 暗夜精灵 小
                constant integer Xfns
                // 魔法效果 (BUFF) 建筑伤害 - 暗夜精灵 中
                constant integer Xfnm
                // 魔法效果 (BUFF) 建筑伤害 - 暗夜精灵 大
                constant integer Xfnl
                // 魔法效果 (BUFF) 空中枷锁
                constant integer Bmlt
                // 魔法效果 (BUFF) 控制魔法
                constant integer Bcmg
                // 魔法效果 (BUFF) 吸取生命和法力(附加)
                constant integer Bdbb
                // 魔法效果 (BUFF) 吸取生命(附加)
                constant integer Bdbl
                // 魔法效果 (BUFF) 法力虹吸(附加)
                constant integer Bdbm
                // 魔法效果 (BUFF) 迷雾之云
                constant integer Bclf
                // 魔法效果 (BUFF) 烈焰风暴
                constant integer BHfs
                // 魔法效果 (BUFF) 放逐
                constant integer BHbn
                // 魔法效果 (BUFF) 凤凰
                constant integer Bphx
                // 魔法效果 (BUFF) 凤凰烈焰
                constant integer Bpxf
                // 魔法效果 (BUFF) 心灵之火
                constant integer Binf
                // 魔法效果 (BUFF) 治疗术
                constant integer Bhea
                // 魔法效果 (BUFF) 中立治疗术
                constant integer BNhe
                // 魔法效果 (BUFF) 减速术
                constant integer Bslo
                // 魔法效果 (BUFF) 隐形术
                constant integer Binv
                // 魔法效果 (BUFF) 变形术
                constant integer Bply
                // 魔法效果 (BUFF) 暴风雪
                constant integer BHbd
                // 魔法效果 (BUFF) 水元素
                constant integer BHwe
                // 魔法效果 (BUFF) 辉煌光环
                constant integer BHab
                // 魔法效果 (BUFF) 风暴之锤
                constant integer BHtb
                // 魔法效果 (BUFF) 雷霆一击
                constant integer BHtc
                // 魔法效果 (BUFF) 猛击
                constant integer BHbh
                // 魔法效果 (BUFF) 天神下凡
                constant integer BHav
                // 魔法效果 (BUFF) 圣盾术
                constant integer BHds
                // 魔法效果 (BUFF) 虔诚光环
                constant integer BHad
                // 魔法效果 (BUFF) 民兵
                constant integer Bmil
                // 魔法效果 (BUFF) 暴风雪(施法者)
                constant integer BHbz
                // 魔法效果 (BUFF) 吸取生命和法力(施法者)
                constant integer Bdcb
                // 魔法效果 (BUFF) 吸取生命(施法者)
                constant integer Bdcl
                // 魔法效果 (BUFF) 吸取法力(施法者)
                constant integer Bdcm
                // 魔法效果 (BUFF) 吸取生命和法力(目标)
                constant integer Bdtb
                // 魔法效果 (BUFF) 吸取生命(目标)
                constant integer Bdtl
                // 魔法效果 (BUFF) 吸取法力(目标)
                constant integer Bdtm
                // 魔法效果 (BUFF) 空中枷锁(施法者)
                constant integer Bmlc
                // 魔法效果 (BUFF) 隐形术(额外的)
                constant integer Bivs
                // 魔法效果 (BUFF) 暴风雪 (效果)
                constant integer XHbz
                // 魔法效果 (BUFF) 烈焰风暴(效果)
                constant integer XHfs
                // 魔法效果 (BUFF) 迷雾之云(效果)
                constant integer Xclf
                // 魔法效果 (BUFF) 照明弹(效果)
                constant integer Xfla
                // 魔法效果 (BUFF) 建筑伤害 – 人类 小
                constant integer Xfhs
                // 魔法效果 (BUFF) 建筑伤害 – 人类 中
                constant integer Xfhm
                // 魔法效果 (BUFF) 建筑伤害 – 人类 大
                constant integer Xfhl
                // 魔法效果 (BUFF) 补充
                constant integer Brpb
                // 魔法效果 (BUFF) 荒芜精华
                constant integer Brpl
                // 魔法效果 (BUFF) 灵魂之触
                constant integer Brpm
                // 魔法效果 (BUFF) 荒芜光环
                constant integer Babr
                // 魔法效果 (BUFF) 穿刺
                constant integer BUim
                // 魔法效果 (BUFF) 腐尸甲虫
                constant integer BUcb
                // 魔法效果 (BUFF) 蝗虫
                constant integer BUlo
                // 魔法效果 (BUFF) 反召唤
                constant integer Buns
                // 魔法效果 (BUFF) 小蜘蛛
                constant integer Bspa
                // 魔法效果 (BUFF) 蛛网(地面)
                constant integer Bweb
                // 魔法效果 (BUFF) 蛛网(空中)
                constant integer Bwea
                // 魔法效果 (BUFF) 疾病云雾
                constant integer Bapl
                // 魔法效果 (BUFF) 冰冻吐息
                constant integer Bfrz
                // 魔法效果 (BUFF) 骷髅奴仆/复活死尸
                constant integer Brai
                // 魔法效果 (BUFF) 邪恶狂热
                constant integer Buhf
                // 魔法效果 (BUFF) 反魔法护罩
                constant integer Bams
                // 魔法效果 (BUFF) 反魔法护罩(额外的)
                constant integer Bam2
                // 魔法效果 (BUFF) 占据
                constant integer Bpos
                // 魔法效果 (BUFF) 邪恶光环
                constant integer BUau
                // 魔法效果 (BUFF) 亡者再临/操纵死尸
                constant integer BUan
                // 魔法效果 (BUFF) 沉睡
                constant integer BUsl
                // 魔法效果 (BUFF) 吸血光环
                constant integer BUav
                // 魔法效果 (BUFF) 霜甲术
                constant integer BUfa
                // 魔法效果 (BUFF) 枯萎凋零
                constant integer BUdd
                // 魔法效果 (BUFF) 诅咒
                constant integer Bcrs
                // 魔法效果 (BUFF) 残废术
                constant integer Bcri
                // 魔法效果 (BUFF) 腐臭蝠群(施法者)
                constant integer BUcs
                // 魔法效果 (BUFF) 沉睡(暂停)
                constant integer BUsp
                // 魔法效果 (BUFF) 沉睡(昏迷)
                constant integer BUst
                // 魔法效果 (BUFF) 尖刺甲壳
                constant integer BUts
                // 魔法效果 (BUFF) 疾病之云
                constant integer Bplg
                // 魔法效果 (BUFF) 亡者再临(额外的)
                constant integer BUad
                // 魔法效果 (BUFF) 占据(施法者)
                constant integer Bpoc
                // 魔法效果 (BUFF) 枯萎凋零(效果)
                constant integer XUdd
                // 魔法效果 (BUFF) 建筑伤害 – 亡灵 小
                constant integer Xfus
                // 魔法效果 (BUFF) 建筑伤害 – 亡灵 中
                constant integer Xfum
                // 魔法效果 (BUFF) 建筑伤害 – 亡灵 大
                constant integer Xful
                // 魔法效果 (BUFF) 优先攻击
                constant integer Batp
                // 魔法效果 (BUFF) 燃油
                constant integer Bbof
                // 魔法效果 (BUFF) 狂暴
                constant integer Bbsk
                // 魔法效果 (BUFF) 灵魂链接
                constant integer Bspl
                // 魔法效果 (BUFF) 妖术
                constant integer BOhx
                // 魔法效果 (BUFF) 结界
                constant integer BOwd
                // 魔法效果 (BUFF) 巫毒狂舞
                constant integer BOvd
                // 魔法效果 (BUFF) 诱捕(地面的)
                constant integer Beng
                // 魔法效果 (BUFF) 诱捕(空中的)
                constant integer Bena
                // 魔法效果 (BUFF) 吞噬
                constant integer Bdvv
                // 魔法效果 (BUFF) 净化
                constant integer Bprg
                // 魔法效果 (BUFF) 闪电之盾
                constant integer Blsh
                // 魔法效果 (BUFF) 嗜血
                constant integer Bblo
                // 魔法效果 (BUFF) 警戒结界
                constant integer Beye
                // 魔法效果 (BUFF) 静滞陷阱
                constant integer Bstt
                // 魔法效果 (BUFF) 静滞陷阱
                constant integer Bsta
                // 魔法效果 (BUFF) 治疗结界
                constant integer Bhwd
                // 魔法效果 (BUFF) 治疗结界光环
                constant integer Boar
                // 魔法效果 (BUFF) 毒素(不叠加)
                constant integer Bpoi
                // 魔法效果 (BUFF) 毒素(叠加)
                constant integer Bpsd
                // 魔法效果 (BUFF) 毒素(信息)
                constant integer Bpsi
                // 魔法效果 (BUFF) 战鼓
                constant integer Bakb
                // 魔法效果 (BUFF) 疾风步
                constant integer BOwk
                // 魔法效果 (BUFF) 镜像
                constant integer BOmi
                // 魔法效果 (BUFF) 野性之魂
                constant integer BOsf
                // 魔法效果 (BUFF) 地震术
                constant integer BOeq
                // 魔法效果 (BUFF) 坚韧光环
                constant integer BOae
                // 魔法效果 (BUFF) 战争践踏
                constant integer BOws
                // 魔法效果 (BUFF) 地震术(施法者)
                constant integer BOea
                // 魔法效果 (BUFF) 震荡波(施法者)
                constant integer BOsh
                // 魔法效果 (BUFF) 巫毒狂舞(施法者)
                constant integer BOvc
                // 魔法效果 (BUFF) 剑刃风暴(施法者)
                constant integer BOww
                // 魔法效果 (BUFF) 吞噬(施法者)
                constant integer Bdig
                // 魔法效果 (BUFF) 诱捕(一般的)
                constant integer Bens
                // 魔法效果 (BUFF) 火油瓶
                constant integer Bliq
                // 魔法效果 (BUFF) 闪电之盾(施法者)
                constant integer Blsa
                // 魔法效果 (BUFF) 地震术(效果)
                constant integer XOeq
                // 魔法效果 (BUFF) 重生(效果)
                constant integer XOre
                // 魔法效果 (BUFF) 燃油(效果)
                constant integer Xbof
                // 魔法效果 (BUFF) 建筑伤害 – 兽人 小
                constant integer Xfos
                // 魔法效果 (BUFF) 建筑伤害 – 兽人 中
                constant integer Xfom
                // 魔法效果 (BUFF) 建筑伤害 – 兽人 大
                constant integer Xfol
                // 魔法效果 (BUFF) 剧毒(不叠加)
                constant integer BIpb
                // 魔法效果 (BUFF) 剧毒(叠加)
                constant integer BIpd
                // 魔法效果 (BUFF) 剧毒 (信息)
                constant integer BIpi
        
        
        // 科技
        
                // 人族科技
        
                // 科技 钢铁铸剑
                constant integer Rhme
                // 科技 黑火药
                constant integer Rhra
                // 科技 炮兵(人族)(编辑器无此科技)
                constant integer Rhaa
                // 科技 钢铁装甲
                constant integer Rhar
                // 科技 黄金(人族)(编辑器无此科技)
                constant integer Rhmi
                // 科技 改良石工技术
                constant integer Rhac
                // 科技 控制魔法
                constant integer Rhss
                // 科技 防御
                constant integer Rhde
                // 科技 坐骑作战训练
                constant integer Rhan
                // 科技 牧师专家级训练
                constant integer Rhpt
                // 科技 女巫专家级训练
                constant integer Rhst
                // 科技 镶钉皮甲
                constant integer Rhla
                // 科技 长管火枪
                constant integer Rhri
                // 科技 改良伐木技术
                constant integer Rhlh
                // 科技 魔法岗哨
                constant integer Rhse
                // 科技 散射(人族)(编辑器无此科技)
                constant integer Rhsr
                // 科技 飞行器炸弹
                constant integer Rhgb
                // 科技 风暴战锤
                constant integer Rhhb
                // 科技 控制魔法
                constant integer Rhss
                // 科技 破片榴弹
                constant integer Rhfs
                // 科技 火箭弹幕
                constant integer Rhrt
                // 科技 对空炮机
                constant integer Rhfc
                // 科技 迷雾之云
                constant integer Rhcd
                // 科技 裂甲之刃
                constant integer Rhsb
                // 科技 背包(人类)
                constant integer Rhpm
        
        
                // 兽族科技
        
                // 科技 精钢近战武器
                constant integer Rome
                // 科技 精钢远程武器
                constant integer Rora
                // 科技 火炮(兽族)(编辑器无此科技)
                constant integer Roaa
                // 科技 精钢护甲
                constant integer Roar
                // 科技 战鼓伤害强化
                constant integer Rwdm
                // 科技 掠夺
                constant integer Ropg
                // 科技 野蛮之力
                constant integer Robs
                // 科技 粉碎伤害强化
                constant integer Rows
                // 科技 诱捕(兽族)
                constant integer Roen
                // 科技 毒矛(兽族)
                constant integer Rovs
                // 科技 巫医专家级训练
                constant integer Rowd
                // 科技 萨满祭司专家级训练
                constant integer Rost
                // 科技 尖刺障碍
                constant integer Rosp
                // 科技 加强型防御
                constant integer Rorb
                // 科技 巨魔再生
                constant integer Rotr
                // 科技 火油瓶(兽族)
                constant integer Rolf
                // 科技 灵魂行者专家级训练
                constant integer Rowt
                // 科技 狂战士升级
                constant integer Robk
                // 科技 燃油(兽族)
                constant integer Robf
                // 科技 背包(兽人)
                constant integer Ropm
        
        
                // 不死族科技
        
                // 科技 邪恶力量
                constant integer Rume
                // 科技 生物攻击
                constant integer Rura
                // 科技 邪恶护甲
                constant integer Ruar
                // 科技 食尸
                constant integer Ruac
                // 科技 食尸鬼狂暴
                constant integer Rugf
                // 科技 蛛网
                constant integer Ruwb
                // 科技 不明科技(不死族)(编辑器无此科技)
                constant integer Ruab
                // 科技 石像形态
                constant integer Rusf
                // 科技 通灵师/亡灵男巫专家级训练
                constant integer Rune
                // 科技 女妖专家级训练
                constant integer Ruba
                // 科技 不明科技(不死族)(编辑器无此科技)
                constant integer Rump
                // 科技 冰冻吐息
                constant integer Rufb
                // 科技 骷髅持久术
                constant integer Rusl
                // 科技 骷髅精通
                constant integer Rusm
                // 科技 发掘尸体
                constant integer Ruex
                // 科技 牺牲(不死族)(编辑器无此科技)
                constant integer Rurs
                // 科技 不明科技(不死族)(编辑器无此科技)
                constant integer Ruax
                // 科技 生物甲壳
                constant integer Rucr
                // 科技 疾病之云
                constant integer Rupc
                // 科技 毁灭者形态
                constant integer Rusp
                // 科技 钻地
                constant integer Rubu
                // 科技 背包(亡灵)
                constant integer Rupm
        
        
                // 暗夜精灵族科技
        
                // 科技 月之力量
                constant integer Resm
                // 科技 野性力量
                constant integer Resw
                // 科技 月之护甲
                constant integer Rema
                // 科技 强化外皮
                constant integer Rerh
                // 科技 夜视能力
                constant integer Reuv
                // 科技 自然祝福
                constant integer Renb
                // 科技 哨兵
                constant integer Resc
                // 科技 升级月刃
                constant integer Remg
                // 科技 强弓
                constant integer Reib
                // 科技 箭术
                constant integer Remk
                // 科技 猛禽德鲁伊专家级训练
                constant integer Redt
                // 科技 利爪德鲁伊专家级训练
                constant integer Redc
                // 科技 驱除魔法(暗夜精灵族)
                constant integer Resi
                // 科技 腐蚀吐息
                constant integer Recb
                // 科技 角鹰兽训练
                constant integer Reht
                // 科技 不明科技(暗夜精灵族)(编辑器无此科技)
                constant integer Repd
                // 科技 利爪之印
                constant integer Reeb
                // 科技 猛禽之印
                constant integer Reec
                // 科技 硬化体肤
                constant integer Rehs
                // 科技 抗性体肤
                constant integer Rers
                // 科技 月井之春
                constant integer Rews
                // 科技 锐锋之刃
                constant integer Repb
                // 科技 背包(暗夜精灵)
                constant integer Repm
        
        
                // 娜迦科技
        
                // 科技 珊瑚鳞甲
                constant integer Rnam
                // 科技 珊瑚锋刃
                constant integer Rnat
                // 科技 驱除魔法(娜迦族)
                constant integer Rnsi
                // 科技 诱捕(娜迦族)
                constant integer Rnen
                // 科技 潜水
                constant integer Rnsb
                // 科技 纳迦海妖专家级训练
                constant integer Rnsw
        
        
                // 中立科技
        
                // 科技 混乱
                constant integer Roch
                // 科技 夜视雕文(升级)
                constant integer Rguv
                // 科技 强固雕文(升级1)
                constant integer Rgfo
        
        
        // 常用可破坏物(齐)
        
                // 可破坏物 升降台墙
                constant integer DTep
                // 可破坏物 升降台1
                constant integer DTrf
                // 可破坏物 升降台2
                constant integer DTrx
                // 可破坏物 冬天树墙
                constant integer WTtw
                // 可破坏物 冰冠树墙
                constant integer ITtw
                // 可破坏物 地下树墙
                constant integer GTsh
                // 可破坏物 地牢树墙
                constant integer DTsh
                // 可破坏物 城邦冬天树墙
                constant integer YTwt
                // 可破坏物 城邦夏天树墙
                constant integer YTct
                // 可破坏物 城邦废墟树墙
                constant integer JTct
                // 可破坏物 城邦秋天树墙
                constant integer YTft
                // 可破坏物 城邦落雪树墙
                constant integer YTst
                // 可破坏物 夏天树墙
                constant integer LTlt
                // 可破坏物 外域树墙
                constant integer OTtw
                // 可破坏物 废墟树墙
                constant integer ZTtw
                // 可破坏物 村庄树墙
                constant integer VTlt
                // 可破坏物 灰谷树墙
                constant integer ATtr
                // 可破坏物 烧焦树墙
                constant integer Ytsc
                // 可破坏物 秋天树墙
                constant integer FTtw
                // 可破坏物 落雪树墙
                constant integer WTst
                // 可破坏物 诺森德冰树墙
                constant integer NTiw
                // 可破坏物 诺森德树墙
                constant integer NTtw
                // 可破坏物 贫瘠之地树墙
                constant integer BTtw
                // 可破坏物 费伍德树墙
                constant integer CTtr
                // 可破坏物 达拉然废墟树墙
                constant integer JTtw
                // 可破坏物 银月城树
                constant integer Yts1
                // 可破坏物 黑色城堡树墙
                constant integer KTtw
                // 可破坏物 冰冠巨冠树
                constant integer ITtc
                // 可破坏物 废墟巨冠树
                constant integer ZTtc
                // 可破坏物 灰谷巨冠树
                constant integer ATtc
                // 可破坏物 诺森德巨冠树
                constant integer NTtc
                // 可破坏物 贫瘠之地巨冠树
                constant integer BTtc
                // 可破坏物 费伍德巨冠树
                constant integer CTtc
                // 可破坏物 发光的传送门
                constant integer OTsp
                // 可破坏物 冰冠堡垒入口
                constant integer YTc1
                // 可破坏物 冰冠王座
                constant integer IOt0
                // 可破坏物 冰冠王座(对角1)
                constant integer IOt1
                // 可破坏物 冰冠王座(对角2)
                constant integer IOt2
                // 可破坏物 冰冠王座大门
                constant integer ITtg
                // 可破坏物 冰屋
                constant integer ITig
                // 可破坏物 力场墙
                constant integer Dofw
                // 可破坏物 力场墙
                constant integer Dofv
                // 可破坏物 卵囊
                constant integer DTes
                // 可破坏物 国王的王座
                constant integer XOkt
                // 可破坏物 国王的王座(对角1)
                constant integer XOk1
                // 可破坏物 国王的王座(对角2)
                constant integer XOk2
                // 可破坏物 地牢大门(垂直)
                constant integer DTg3
                // 可破坏物 地牢大门(对角1)
                constant integer DTg2
                // 可破坏物 地牢大门(对角2)
                constant integer DTg4
                // 可破坏物 地牢大门(水平)
                constant integer DTg1
                // 可破坏物 地牢尖刺
                constant integer DTsp
                // 可破坏物 城市入口
                constant integer YTce
                // 可破坏物 城市入口
                constant integer YTcx
                // 可破坏物 复活石
                constant integer BTrs
                // 可破坏物 复活石
                constant integer BTrx
                // 可破坏物 大门(垂直)
                constant integer LTg3
                // 可破坏物 大门(对角1)
                constant integer LTg2
                // 可破坏物 大门(对角2)
                constant integer LTg4
                // 可破坏物 大门(水平)
                constant integer LTg1
                // 可破坏物 奥格瑞玛大门
                constant integer YTcn
                // 可破坏物 寒冰大门(垂直)
                constant integer ITg3
                // 可破坏物 寒冰大门(对角1)
                constant integer ITg2
                // 可破坏物 寒冰大门(对角2)
                constant integer ITg4
                // 可破坏物 寒冰大门(水平)
                constant integer ITg1
                // 可破坏物 寒冰岩石
                constant integer ITor
                // 可破坏物 寒冰岩石大门(垂直)
                constant integer ITx3
                // 可破坏物 寒冰岩石大门(对角1)
                constant integer ITx2
                // 可破坏物 寒冰岩石大门(对角2)
                constant integer ITx4
                // 可破坏物 寒冰岩石大门(水平)
                constant integer ITx1
                // 可破坏物 巨型废墟大门(垂直)
                constant integer ZTsg
                // 可破坏物 巨型废墟大门(水平)
                constant integer ZTsx
                // 可破坏物 已完成的奥格瑞玛塔楼
                constant integer XTv8
                // 可破坏物 已完成的奥格瑞玛墙节
                constant integer XTv6
                // 可破坏物 废墟大门(垂直)
                constant integer ZTg3
                // 可破坏物 废墟大门(对角1)
                constant integer ZTg2
                // 可破坏物 废墟大门(对角2)
                constant integer ZTg4
                // 可破坏物 废墟大门(水平)
                constant integer ZTg1
                // 可破坏物 建造中的奥格瑞玛塔楼
                constant integer XTv7
                // 可破坏物 建造中的奥格瑞玛墙节
                constant integer XTv5
                // 可破坏物 恶魔大门(垂直)
                constant integer ATg3
                // 可破坏物 恶魔大门(对角1)
                constant integer ATg2
                // 可破坏物 恶魔大门(对角2)
                constant integer ATg4
                // 可破坏物 恶魔大门(水平)
                constant integer ATg1
                // 可破坏物 恶魔风暴
                constant integer OTds
                // 可破坏物 悬崖洞穴大门(1)
                constant integer DTc1
                // 可破坏物 悬崖洞穴大门(2)
                constant integer DTc2
                // 可破坏物 控制杆
                constant integer DTlv
                // 可破坏物 摇滚阿尔萨斯
                constant integer ITag
                // 可破坏物 支柱
                constant integer BTsc
                // 可破坏物 板条箱
                constant integer LTcr
                // 可破坏物 桶
                constant integer LTbr
                // 可破坏物 桶
                constant integer LTbx
                // 可破坏物 桶
                constant integer LTbs
                // 可破坏物 洛丹伦城市主建筑
                constant integer XTv3
                // 可破坏物 洛丹伦城市主门
                constant integer YTc2
                // 可破坏物 洛丹伦城市主门柱塔
                constant integer BTsk
                // 可破坏物 洛丹伦城市尖塔
                constant integer BTs4
                // 可破坏物 洛丹伦城市穹顶
                constant integer XTv1
                // 可破坏物 浮冰
                constant integer ITf1
                // 可破坏物 浮冰
                constant integer ITf2
                // 可破坏物 浮冰
                constant integer ITf3
                // 可破坏物 浮冰
                constant integer ITf4
                // 可破坏物 滚石之门(垂直1)
                constant integer ZTd2
                // 可破坏物 滚石之门(垂直1)
                constant integer ITd2
                // 可破坏物 滚石之门(垂直2)
                constant integer ITd4
                // 可破坏物 滚石之门(垂直2)
                constant integer ZTd4
                // 可破坏物 滚石之门(垂直3)
                constant integer ZTd6
                // 可破坏物 滚石之门(垂直4)
                constant integer ZTd8
                // 可破坏物 滚石之门(水平1)
                constant integer ITd1
                // 可破坏物 滚石之门(水平1)
                constant integer ZTd1
                // 可破坏物 滚石之门(水平2)
                constant integer ITd3
                // 可破坏物 滚石之门(水平2)
                constant integer ZTd3
                // 可破坏物 滚石之门(水平3)
                constant integer ZTd5
                // 可破坏物 滚石之门(水平4)
                constant integer ZTd7
                // 可破坏物 火山
                constant integer Volc
                // 可破坏物 炸药桶
                constant integer LTex
                // 可破坏物 牢笼
                constant integer LOcg
                // 可破坏物 狮子雕像
                constant integer BTs2
                // 可破坏物 石块
                constant integer DTrc
                // 可破坏物 石块
                constant integer LTrt
                // 可破坏物 石块
                constant integer LTrc
                // 可破坏物 石质墙(垂直)
                constant integer ZTw2
                // 可破坏物 石质墙(垂直)
                constant integer ITw2
                // 可破坏物 石质墙(垂直)
                constant integer LTw2
                // 可破坏物 石质墙(对角1)
                constant integer LTw3
                // 可破坏物 石质墙(对角1)
                constant integer ZTw3
                // 可破坏物 石质墙(对角1)
                constant integer ITw3
                // 可破坏物 石质墙(对角2)
                constant integer ZTw1
                // 可破坏物 石质墙(对角2)
                constant integer LTw1
                // 可破坏物 石质墙(对角2)
                constant integer ITw1
                // 可破坏物 石质墙(水平)
                constant integer ITw0
                // 可破坏物 石质墙(水平)
                constant integer ZTw0
                // 可破坏物 石质墙(水平)
                constant integer LTw0
                // 可破坏物 精灵大门(垂直)
                constant integer LTe3
                // 可破坏物 精灵大门(对角1)
                constant integer LTe2
                // 可破坏物 精灵大门(对角2)
                constant integer LTe4
                // 可破坏物 精灵大门(水平)
                constant integer LTe1
                // 可破坏物 纳迦废墟圆圈
                constant integer ZTnc
                // 可破坏物 船只
                constant integer NTbd
                // 可破坏物 被毁的洛丹伦城市主建筑
                constant integer XTv4
                // 可破坏物 被毁的洛丹伦城市主门
                constant integer YTc4
                // 可破坏物 被毁的洛丹伦城市主门柱塔
                constant integer BTs1
                // 可破坏物 被毁的洛丹伦城市尖塔
                constant integer BTs5
                // 可破坏物 被毁的洛丹伦城市穹顶
                constant integer XTv2
                // 可破坏物 被毁的狮子雕像
                constant integer BTs3
                // 可破坏物 路障
                constant integer LTba
                // 可破坏物 达拉然建筑
                constant integer XTbd
                // 可破坏物 达拉然紫罗栏城堡
                constant integer XTvt
                // 可破坏物 钢铁大门(垂直)
                constant integer DTg7
                // 可破坏物 钢铁大门(对角1)
                constant integer DTg6
                // 可破坏物 钢铁大门(对角2)
                constant integer DTg8
                // 可破坏物 钢铁大门(水平)
                constant integer DTg5
                // 可破坏物 魔法围栏
                constant integer XTmp
                // 可破坏物 魔法围栏(有角度的)
                constant integer XTm5
                // 可破坏物 魔法围栏墙
                constant integer XTmx
                // 可破坏物 魔法围栏墙(有角度的)
                constant integer XTx5
        
                // 可破坏物 视线阻断器
                constant integer YTlb
                // 可破坏物 视线阻断器(大)
                constant integer YTlc
                // 可破坏物 视线阻断器(全部)
                constant integer YTfb
                // 可破坏物 视线阻断器(全部)(大)
                constant integer YTfc
                // 可破坏物 视线阻断器(地面)
                constant integer YTpb
                // 可破坏物 视线阻断器(地面)(大)
                constant integer YTpc
                // 可破坏物 视线阻断器(空中)
                constant integer YTab
                // 可破坏物 视线阻断器(空中)(大)
                constant integer YTac
        
                // 可破坏物 传送门斜坡
                constant integer WGTR
                // 可破坏物 力场之桥(垂直)
                constant integer DTs0
                // 可破坏物 力场之桥(对角1)
                constant integer DTs1
                // 可破坏物 力场之桥(对角2)
                constant integer DTs3
                // 可破坏物 力场之桥(水平)
                constant integer DTs2
                // 可破坏物 宽天然桥(垂直)
                constant integer YT32
                // 可破坏物 宽天然桥(垂直)
                constant integer YT08
                // 可破坏物 宽天然桥(对角1)
                constant integer YT33
                // 可破坏物 宽天然桥(对角1)
                constant integer YT09
                // 可破坏物 宽天然桥(对角2)
                constant integer YT11
                // 可破坏物 宽天然桥(对角2)
                constant integer YT35
                // 可破坏物 宽天然桥(水平)
                constant integer YT10
                // 可破坏物 宽天然桥(水平)
                constant integer YT34
                // 可破坏物 宽斯坦索姆桥(垂直)
                constant integer YT20
                // 可破坏物 宽斯坦索姆桥(对角1)
                constant integer YT21
                // 可破坏物 宽斯坦索姆桥(对角2)
                constant integer YT23
                // 可破坏物 宽斯坦索姆桥(水平)
                constant integer YT22
                // 可破坏物 宽暗夜精灵木质桥(垂直)
                constant integer NB08
                // 可破坏物 宽暗夜精灵木质桥(对角1)
                constant integer NB09
                // 可破坏物 宽暗夜精灵木质桥(对角2)
                constant integer NB11
                // 可破坏物 宽暗夜精灵木质桥(水平)
                constant integer NB10
                // 可破坏物 宽木质桥(垂直)
                constant integer LT08
                // 可破坏物 宽木质桥(对角1)
                constant integer LT09
                // 可破坏物 宽木质桥(对角2)
                constant integer LT11
                // 可破坏物 宽木质桥(水平)
                constant integer LT10
                // 可破坏物 宽板条木质桥(垂直)
                constant integer RW08
                // 可破坏物 宽板条木质桥(对角1)
                constant integer RW09
                // 可破坏物 宽板条木质桥(对角2)
                constant integer RW11
                // 可破坏物 宽板条木质桥(水平)
                constant integer RW10
                // 可破坏物 宽石质桥(垂直)
                constant integer YT20
                // 可破坏物 宽石质桥(垂直)
                constant integer YT44
                // 可破坏物 宽石质桥(对角1)
                constant integer YT45
                // 可破坏物 宽石质桥(对角1)
                constant integer YT21
                // 可破坏物 宽石质桥(对角2)
                constant integer YT23
                // 可破坏物 宽石质桥(对角2)
                constant integer YT47
                // 可破坏物 宽石质桥(水平)
                constant integer YT22
                // 可破坏物 宽石质桥(水平)
                constant integer YT46
                // 可破坏物 宽精灵桥(垂直)
                constant integer EB08
                // 可破坏物 宽精灵桥(对角1)
                constant integer EB09
                // 可破坏物 宽精灵桥(对角2)
                constant integer EB11
                // 可破坏物 宽精灵桥(水平)
                constant integer EB10
                // 可破坏物 宽茂盛之桥(垂直)
                constant integer OG08
                // 可破坏物 宽茂盛之桥(对角1)
                constant integer OG09
                // 可破坏物 宽茂盛之桥(对角2)
                constant integer OG11
                // 可破坏物 宽茂盛之桥(水平)
                constant integer OG10
                // 可破坏物 寒冰之桥(垂直)
                constant integer ITib
                // 可破坏物 寒冰之桥(对角1)
                constant integer ITi2
                // 可破坏物 寒冰之桥(对角2)
                constant integer ITi4
                // 可破坏物 寒冰之桥(水平)
                constant integer ITi3
                // 可破坏物 最后希望之桥(垂直)
                constant integer LTtc
                // 可破坏物 最后希望之桥(水平)
                constant integer LTtx
                // 可破坏物 树桥(垂直)
                constant integer ATt1
                // 可破坏物 树桥(垂直)
                constant integer LTt4
                // 可破坏物 树桥(垂直)
                constant integer LTt2
                // 可破坏物 树桥(垂直)
                constant integer LTt0
                // 可破坏物 树桥(水平)
                constant integer LTt1
                // 可破坏物 树桥(水平)
                constant integer ATt0
                // 可破坏物 树桥(水平)
                constant integer LTt3
                // 可破坏物 树桥(水平)
                constant integer LTt5
                // 可破坏物 特殊寒冰之桥
                constant integer YT66
                // 可破坏物 短天然桥(垂直)
                constant integer YT24
                // 可破坏物 短天然桥(垂直)
                constant integer YT00
                // 可破坏物 短天然桥(对角1)
                constant integer YT25
                // 可破坏物 短天然桥(对角1)
                constant integer YT01
                // 可破坏物 短天然桥(对角2)
                constant integer YT27
                // 可破坏物 短天然桥(对角2)
                constant integer YT03
                // 可破坏物 短天然桥(水平)
                constant integer YT02
                // 可破坏物 短天然桥(水平)
                constant integer YT26
                // 可破坏物 短斯坦索姆桥(垂直)
                constant integer YY12
                // 可破坏物 短斯坦索姆桥(对角1)
                constant integer YY13
                // 可破坏物 短斯坦索姆桥(对角2)
                constant integer YY15
                // 可破坏物 短斯坦索姆桥(水平)
                constant integer YY14
                // 可破坏物 短暗夜精灵木质桥(垂直)
                constant integer NB00
                // 可破坏物 短暗夜精灵木质桥(对角1)
                constant integer NB01
                // 可破坏物 短暗夜精灵木质桥(对角2)
                constant integer NB03
                // 可破坏物 短暗夜精灵木质桥(水平)
                constant integer NB02
                // 可破坏物 短板条木质桥(垂直)
                constant integer RW00
                // 可破坏物 短板条木质桥(对角1)
                constant integer RW01
                // 可破坏物 短板条木质桥(对角2)
                constant integer RW03
                // 可破坏物 短板条木质桥(水平)
                constant integer RW02
                // 可破坏物 短石质桥(垂直)
                constant integer YT12
                // 可破坏物 短石质桥(垂直)
                constant integer YT36
                // 可破坏物 短石质桥(对角1)
                constant integer YT37
                // 可破坏物 短石质桥(对角1)
                constant integer YT13
                // 可破坏物 短石质桥(对角2)
                constant integer YT39
                // 可破坏物 短石质桥(对角2)
                constant integer YT15
                // 可破坏物 短石质桥(水平)
                constant integer YT38
                // 可破坏物 短石质桥(水平)
                constant integer YT14
                // 可破坏物 短精灵桥(垂直)
                constant integer EB00
                // 可破坏物 短精灵桥(对角1)
                constant integer EB01
                // 可破坏物 短精灵桥(对角2)
                constant integer EB03
                // 可破坏物 短精灵桥(水平)
                constant integer EB02
                // 可破坏物 短茂盛之桥(垂直)
                constant integer OG00
                // 可破坏物 短茂盛之桥(对角1)
                constant integer OG01
                // 可破坏物 短茂盛之桥(对角2)
                constant integer OG03
                // 可破坏物 短茂盛之桥(水平)
                constant integer OG02
                // 可破坏物 石质斜坡(右上)
                constant integer LTr3
                // 可破坏物 石质斜坡(右上)
                constant integer LTs3
                // 可破坏物 石质斜坡(右上2)
                constant integer LTs7
                // 可破坏物 石质斜坡(右上2)
                constant integer LTr7
                // 可破坏物 石质斜坡(右下)
                constant integer LTr4
                // 可破坏物 石质斜坡(右下)
                constant integer LTs4
                // 可破坏物 石质斜坡(右下2)
                constant integer LTs8
                // 可破坏物 石质斜坡(右下2)
                constant integer LTr8
                // 可破坏物 石质斜坡(左上 2)
                constant integer LTs6
                // 可破坏物 石质斜坡(左上 2)
                constant integer LTr6
                // 可破坏物 石质斜坡(左上)
                constant integer LTr2
                // 可破坏物 石质斜坡(左上)
                constant integer LTs2
                // 可破坏物 石质斜坡(左下)
                constant integer LTs1
                // 可破坏物 石质斜坡(左下)
                constant integer LTr1
                // 可破坏物 石质斜坡(左下2)
                constant integer LTs5
                // 可破坏物 石质斜坡(左下2)
                constant integer LTr5
                // 可破坏物 码头
                constant integer ATwf
                // 可破坏物 精灵桥
                constant integer YT67
                // 可破坏物 纳迦小斜坡(向上)
                constant integer ZTr1
                // 可破坏物 纳迦小斜坡(向下)
                constant integer ZTr3
                // 可破坏物 纳迦小斜坡(向右)
                constant integer ZTr2
                // 可破坏物 纳迦小斜坡(向左)
                constant integer ZTr0
                // 可破坏物 脚踏开关
                constant integer DTfx
                // 可破坏物 脚踏开关
                constant integer DTfp
                // 可破坏物 被毁的桥
                constant integer YSdb
                // 可破坏物 被毁的桥
                constant integer YSdc
                // 可破坏物 超宽天然桥(垂直)
                constant integer YT48
                // 可破坏物 超宽天然桥(对角1)
                constant integer YT49
                // 可破坏物 超宽天然桥(对角2)
                constant integer YT51
                // 可破坏物 超宽天然桥(水平)
                constant integer YT50
                // 可破坏物 长天然桥(垂直)
                constant integer YT28
                // 可破坏物 长天然桥(垂直)
                constant integer YT04
                // 可破坏物 长天然桥(对角1)
                constant integer YT05
                // 可破坏物 长天然桥(对角1)
                constant integer YT29
                // 可破坏物 长天然桥(对角2)
                constant integer YT07
                // 可破坏物 长天然桥(对角2)
                constant integer YT31
                // 可破坏物 长天然桥(水平)
                constant integer YT30
                // 可破坏物 长天然桥(水平)
                constant integer YT06
                // 可破坏物 长斯坦索姆桥(垂直)
                constant integer YY16
                // 可破坏物 长斯坦索姆桥(对角1)
                constant integer YY17
                // 可破坏物 长斯坦索姆桥(对角2)
                constant integer YY19
                // 可破坏物 长斯坦索姆桥(水平)
                constant integer YY18
                // 可破坏物 长暗夜精灵木质桥(垂直)
                constant integer NB04
                // 可破坏物 长暗夜精灵木质桥(对角1)
                constant integer NB05
                // 可破坏物 长暗夜精灵木质桥(对角2)
                constant integer NB07
                // 可破坏物 长暗夜精灵木质桥(水平)
                constant integer NB06
                // 可破坏物 长木质桥(垂直)
                constant integer LT04
                // 可破坏物 长木质桥(对角1)
                constant integer LT05
                // 可破坏物 长木质桥(对角2)
                constant integer LT07
                // 可破坏物 长木质桥(水平)
                constant integer LT06
                // 可破坏物 长板条木质桥(垂直)
                constant integer RW04
                // 可破坏物 长板条木质桥(对角1)
                constant integer RW05
                // 可破坏物 长板条木质桥(对角2)
                constant integer RW07
                // 可破坏物 长板条木质桥(水平)
                constant integer RW06
                // 可破坏物 长石质桥(垂直)
                constant integer YT16
                // 可破坏物 长石质桥(垂直)
                constant integer YT40
                // 可破坏物 长石质桥(对角1)
                constant integer YT17
                // 可破坏物 长石质桥(对角1)
                constant integer YT41
                // 可破坏物 长石质桥(对角2)
                constant integer YT43
                // 可破坏物 长石质桥(对角2)
                constant integer YT19
                // 可破坏物 长石质桥(水平)
                constant integer YT18
                // 可破坏物 长石质桥(水平)
                constant integer YT42
                // 可破坏物 长精灵桥(垂直)
                constant integer EB04
                // 可破坏物 长精灵桥(对角1)
                constant integer EB05
                // 可破坏物 长精灵桥(对角2)
                constant integer EB07
                // 可破坏物 长精灵桥(水平)
                constant integer EB06
                // 可破坏物 长茂盛之桥(垂直)
                constant integer OG04
                // 可破坏物 长茂盛之桥(对角1)
                constant integer OG05
                // 可破坏物 长茂盛之桥(对角2)
                constant integer OG07
                // 可破坏物 长茂盛之桥(水平)
                constant integer OG06
                // 可破坏物 隐形平台
                constant integer OTip
                // 可破坏物 隐形平台(小)
                constant integer OTis
        
        
        // 补充单位/物品/技能/科技名
        
        
                // 英雄 娜迦海巫
                constant integer NAGA_SORCERESS
                // 英雄 兽王
                constant integer BEAST_MASTER
                // 英雄 黑暗游侠
                constant integer DARK_RANGER
                // 英雄 深渊领主
                constant integer NEUTRAL_PIT_LORD
                // 英雄 酒仙(熊猫)
                constant integer BREW_MASTER
                // 英雄 修补匠
                constant integer GOBLIN_TINKER
                // 英雄 火焰领主
                constant integer FIRELORD
                // 英雄 炼金术士
                constant integer ALCHEMIST
        
                // 科技 裂甲之刃
                constant integer UPG_SUN_BLADE
        
                // 物品 治疗药水
                constant integer HEALING_POTION
                // 物品 法力药水
                constant integer MANA_POTION
                // 物品 城镇传送卷轴/回城卷轴
                constant integer TOWN_PORTAL
                // 物品 象牙塔
                constant integer IVORY_TOWER
                // 物品 火焰宝珠
                constant integer ORB_OF_FIRE
                // 物品 火焰宝珠
                constant integer ORB_OF_FIRE_N
                // 物品 庇护法杖/避难权杖
                constant integer STAFF_OF_SANCTUARY
                // 物品 治疗药膏
                constant integer HEALING_SALVE
                // 物品 速度卷轴
                constant integer SCROLL_OF_SPEED
                // 物品 闪电宝珠
                constant integer ORB_OF_LIGHTNING
                // 物品 闪电宝珠
                constant integer ORB_OF_LIGHTNING_N
                // 物品 迷你大厅(兽族)
                constant integer TINY_GREAT_HALL
                // 物品 通灵魔棒(骷髅杖)
                constant integer ROD_OF_NECROMANCY
                // 物品 献祭之颅(制造腐地)
                constant integer SACRIFICIAL_SKULL
                // 物品 显影之尘
                constant integer DUST_OF_APPEARANCE
                // 物品 腐蚀宝珠
                constant integer ORB_OF_CORRUPTION
                // 物品 治疗卷轴
                constant integer SCROLL_OF_HEALING
                // 物品 月亮石
                constant integer MOONSTONE
                // 物品 保存法杖
                constant integer STAFF_OF_PRESERVATION
                // 物品 毒液宝珠
                constant integer ORB_OF_VENOM
                // 物品 反魔法药剂
                constant integer ANTI_MAGIC_POTION
                // 物品 仪式匕首
                constant integer RITUAL_DAGGER
                // 物品 贵族头环
                constant integer CIRCLET_OF_NOBILITY
                // 物品 法力护身符
                constant integer PERIAPT_OF_VITALITY
                // 物品 速度之靴
                constant integer BOOTS_OF_SPEED
                // 物品 显影之尘
                constant integer M_DUST_OF_APPEARANCE
                // 物品 治疗卷轴
                constant integer M_SCROLL_OF_HEALING
                // 物品 保护卷轴
                constant integer SCROLL_OF_PROTECTION
                // 物品 城镇传送卷轴/回城卷轴
                constant integer M_TOWN_PORTAL
                // 物品 隐形药水
                constant integer POTION_OF_INVISIBILITY
                // 物品 重修之书
                constant integer TOME_OF_RETRAINING
                // 物品 传送法杖
                constant integer STAFF_OF_TELEPORTATION
                // 物品 次级无敌药水
                constant integer POTION_OF_LESSER_INVULNERBILITY
        
                // 英雄技能 叉状闪电(娜迦海巫)
                constant integer FORKLIGHTNING
                // 英雄技能 冰霜箭(娜迦海巫)
                constant integer FROSTARROWS
                // 英雄技能 法力护盾(娜迦海巫)
                constant integer MANASHIELD
                // 英雄技能 龙卷风(娜迦海巫)
                constant integer TORNADO
                // 英雄技能 召唤巨熊(兽王)
                constant integer BEAR
                // 英雄技能 召唤豪猪(兽王)
                constant integer QUILBEAST
                // 英雄技能 召唤战鹰(兽王)
                constant integer HAWK
                // 英雄技能 群兽奔腾(兽王)
                constant integer STAMPEDE
                // 英雄技能 沉默(黑暗游侠)
                constant integer SILENCE
                // 英雄技能 黑蚀箭(黑暗游侠)
                constant integer BLACKARROW
                // 英雄技能 生命吸取(黑暗游侠)
                constant integer DRAIN
                // 英雄技能 蛊惑(黑暗游侠)
                constant integer CHARM
                // 英雄技能 火焰之雨(深渊领主)
                constant integer RAINOFFIRE
                // 英雄技能 恐惧嚎叫(深渊领主)
                constant integer HOWL
                // 英雄技能 顺劈斩(深渊领主)
                constant integer CLEAVING
                // 英雄技能 末日降临(深渊领主)
                constant integer DOOM
                // 英雄技能 火焰之息(熊猫)
                constant integer BOF
                // 英雄技能 酩酊酒雾(熊猫)
                constant integer HAZE
                // 英雄技能 醉拳(熊猫)
                constant integer BRAWLER
                // 英雄技能 风火雷电(熊猫)
                constant integer SEF
                // 英雄技能 口袋工厂(修补匠)
                constant integer POCKETFACTORY
                // 英雄技能 集束火箭(修补匠)
                constant integer ROCKETS
                // 英雄技能 工程学升级(修补匠)
                constant integer UPGRADE
                // 英雄技能 机械地基(修补匠)
                constant integer ROBOGOBLIN
                // 英雄技能 灵魂燃烧(火焰领主)
                constant integer SOUL_BURN
                // 英雄技能 召唤熔岩爪牙(火焰领主)
                constant integer SUMMON_LAVASPAWN
                // 英雄技能 焚身化骨(箭矢)(火焰领主)
                constant integer INCINERATE
                // 英雄技能 火山爆发(火焰领主)
                constant integer VOLCANO
                // 英雄技能 治疗喷雾(炼金术士)
                constant integer HEALING_SPRAY
                // 英雄技能 酸性炸弹(炼金术士)
                constant integer ACID_BOMB
                // 英雄技能 化学狂暴(炼金术士)
                constant integer CHEMICAL_RAGE
                // 英雄技能 点金术(炼金术士)
                constant integer TRANSMUTE
        
        
        // 技能命令串或ID(命令串只有部分,ID估计全了,已去重)
        // 内容主要源自百度陈年旧贴,故不含1.29及之后新技能的命令串和ID(查了一下,好像也没有新命令串,ID就不管了)
        
                // 技能命令串
        
        
                // 技能命令串或ID 返回工作(农民单点发起)(民兵变回农民)
                constant string peasant
                // 技能命令串或ID 潜水(娜迦)
                constant string submerga
                // 技能命令串或ID 取消潜水(娜迦)
                constant string unsubmerge
                // 技能命令串或ID 装载(飞艇、船、缠绕金矿等)
                constant string loadall
                // 技能命令串或ID 影遁
                constant string ambush
                // 技能命令串或ID 诱捕(网)
                constant string ensnare
                // 技能命令串或ID 吞噬(科多兽等)
                constant string devour
                // 技能命令串或ID 幻象物品(物品技能)
                constant string wandillusion
                // 技能命令串或ID 吸收魔法(毁灭者)
                constant string absorb
                // 技能命令串或ID 酸性炸弹
                constant string acidbomb
                // 技能命令串或ID 采集(侍僧)(黄金)
                constant string acolyteharvest
                // 技能命令串或ID AImove(AI移动)
                constant string aimove
                // 技能命令串或ID 影遁(夜晚)
                constant string ambush
                // 技能命令串或ID 先祖幽灵
                constant string ancestralspirit
                // 技能命令串或ID 先祖幽灵(目标)
                constant string ancestralspirittarget
                // 技能命令串或ID 操纵死尸
                constant string animatedead
                // 技能命令串或ID 反魔法外壳(单位技能)/具有反魔法盾的物品(物品技能)
                constant string antimagicshell
                // 技能命令串或ID 攻击
                constant string attack
                // 技能命令串或ID 攻击地面
                constant string attackground
                // 技能命令串或ID 攻击一次
                constant string attackonce
                // 技能命令串或ID 属性加成(黄点技能)
                constant string attributemodskill
                // 技能命令串或ID 邪恶光环
                constant string auraunholy
                // 技能命令串或ID 吸血光环
                constant string auravampiric
                // 技能命令串或ID 驱逐魔法(小鹿)
                constant string autodispel
                // 技能命令串或ID 取消驱逐(小鹿)
                constant string autodispeloff
                // 技能命令串或ID 激活驱逐(小鹿)
                constant string autodispelon
                // 技能命令串或ID 缠绕金矿(指定单位)
                constant string autoentangle
                // 技能命令串或ID 缠绕金矿(立即)(指定单位)
                constant string autoentangleinstant
                // 技能命令串或ID 自动采集黄金
                constant string autoharvestgold
                // 技能命令串或ID 自动采集木材
                constant string autoharvestlumber
                // 技能命令串或ID 天神下凡
                constant string avatar
                // 技能命令串或ID 破坏者形态
                constant string avengerform
                // 技能命令串或ID 唤醒
                constant string awaken
                // 技能命令串或ID 虚无(血法)
                constant string banish
                // 技能命令串或ID 硬化皮肤
                constant string barkskin
                // 技能命令串或ID 激活硬化皮肤
                constant string barkskinoff
                // 技能命令串或ID 取消硬化皮肤
                constant string barkskinon
                // 技能命令串或ID 战斗咆哮
                constant string battleroar
                // 技能命令串或ID 战斗警备(兽族地洞)
                constant string battlestations
                // 技能命令串或ID 变熊
                constant string bearform
                // 技能命令串或ID 狂战士
                constant string berserk
                // 技能命令串或ID 黑暗之箭
                constant string blackarrow
                // 技能命令串或ID 取消黑暗之箭
                constant string blackarrowoff
                // 技能命令串或ID 激活黑暗之箭
                constant string blackarrowon
                // 技能命令串或ID 荒芜(荒芜之地)
                constant string blight
                // 技能命令串或ID 闪烁(物品等级)(英雄技能&物品技能)
                constant string blink
                // 技能命令串或ID 暴风雪
                constant string blizzard
                // 技能命令串或ID 嗜血术
                constant string bloodlust
                // 技能命令串或ID 取消嗜血术
                constant string bloodlustoff
                // 技能命令串或ID 激活嗜血术
                constant string bloodluston
                // 技能命令串或ID 登船
                constant string board
                // 技能命令串或ID 火焰吐息
                constant string breathoffire
                // 技能命令串或ID 霜冻呼吸
                constant string breathoffrost
                // 技能命令串或ID 建筑菜单
                constant string build
                // 技能命令串或ID 钻地
                constant string burrow
                // 技能命令串或ID 吞食尸体
                constant string cannibalize
                // 技能命令串或ID 腐尸甲虫(指定单位)
                constant string carrionscarabs
                // 技能命令串或ID 召唤腐尸甲虫(无目标)
                constant string carrionscarabsinstant
                // 技能命令串或ID 取消腐尸甲虫
                constant string carrionscarabsoff
                // 技能命令串或ID 激活腐尸甲虫
                constant string carrionscarabson
                // 技能命令串或ID 腐臭蜂群
                constant string carrionswarm
                // 技能命令串或ID 闪电链
                constant string chainlightning
                // 技能命令串或ID 通魔
                constant string channel
                // 技能命令串或ID 符咒
                constant string charm
                // 技能命令串或ID 化学风暴
                constant string chemicalrage
                // 技能命令串或ID 乌云技能(单位技能&物品技能)
                constant string cloudoffog
                // 技能命令串或ID 火箭群
                constant string clusterrockets
                // 技能命令串或ID 激活霜冻之箭
                constant string coldarrows
                // 技能命令串或ID 霜冻之箭
                constant string coldarrowstarg
                // 技能命令串或ID 控制魔法
                constant string controlmagic
                // 技能命令串或ID 腐蚀喷吐
                constant string corrosivebreath
                // 技能命令串或ID 骑乘角鹰兽&搭载弓箭手
                constant string coupleinstant
                // 技能命令串或ID 搭载弓箭手
                constant string coupletarget
                // 技能命令串或ID 操纵死尸(中立)
                constant string creepanimatedead
                // 技能命令串或ID 吞噬(中立)
                constant string creepdevour
                // 技能命令串或ID 治疗(中立)
                constant string creepheal
                // 技能命令串或ID 取消治疗(中立)
                constant string creephealoff
                // 技能命令串或ID 激活治疗(中立)
                constant string creephealon
                // 技能命令串或ID 投石(中立)
                constant string creepthunderbolt
                // 技能命令串或ID 雷霆一击(中立)
                constant string creepthunderclap
                // 技能命令串或ID 残废
                constant string cripple
                // 技能命令串或ID 诅咒
                constant string curse
                // 技能命令串或ID 解除诅咒
                constant string curseoff
                // 技能命令串或ID 激活诅咒
                constant string curseon
                // 技能命令串或ID 飓风术(鸟德)
                constant string cyclone
                // 技能命令串或ID 黑暗转换
                constant string darkconversion
                // 技能命令串或ID 黑暗之门
                constant string darkportal
                // 技能命令串或ID 黑暗仪式
                constant string darkritual
                // 技能命令串或ID 黑暗召唤(英雄技能&物品技能)
                constant string darksummoning
                // 技能命令串或ID 死亡凋零
                constant string deathanddecay
                // 技能命令串或ID 死亡缠绕
                constant string deathcoil
                // 技能命令串或ID 死亡契约
                constant string deathpact
                // 技能命令串或ID 卸载弓箭手
                constant string decouple
                // 技能命令串或ID 激活防御
                constant string defend
                // 技能命令串或ID 显示/探测
                constant string detectaoe
                // 技能命令串或ID 自爆(小精灵)
                constant string detonate
                // 技能命令串或ID 吞噬(科多兽等)
                constant string devour
                // 技能命令串或ID 吞噬魔法(毁灭者)
                constant string devourmagic
                // 技能命令串或ID 分离
                constant string disassociate
                // 技能命令串或ID 消魔(白牛)
                constant string disenchant
                // 技能命令串或ID 取消坐骑
                constant string dismount
                // 技能命令串或ID 驱散(人族牧师)
                constant string dispel
                // 技能命令串或ID 激活神圣护甲
                constant string divineshield
                // 技能命令串或ID 末日审判
                constant string doom
                // 技能命令串或ID 生命汲取/魔法吸吮
                constant string drain
                // 技能命令串或ID 地狱火
                constant string dreadlordinferno
                // 技能命令串或ID 丢弃物品
                constant string dropitem
                // 技能命令串或ID 醉酒云雾
                constant string drunkenhaze
                // 技能命令串或ID 地震(先知)
                constant string earthquake
                // 技能命令串或ID 吃树(古树)
                constant string eattree
                // 技能命令串或ID 火土风暴
                constant string elementalfury
                // 技能命令串或ID 诱捕(网,非蛛网)
                constant string ensnare
                // 技能命令串或ID 激活诱捕(网,非蛛网)
                constant string ensnareoff
                // 技能命令串或ID 取消诱捕(网,非蛛网)
                constant string ensnareon
                // 技能命令串或ID 缠绕金矿
                constant string entangle
                // 技能命令串或ID 缠绕金矿(立即)
                constant string entangleinstant
                // 技能命令串或ID 纠缠须根
                constant string entanglingroots
                // 技能命令串或ID 虚无状态(白牛转换形态技能)
                constant string etherealform
                // 技能命令串或ID 取消虚无状态(白牛转换形态技能)
                constant string unetherealform
                // 技能命令串或ID 虚无状态(白牛转换形态技能)
                constant string uncorporealform
                // 技能命令串或ID 灵肉状态(白牛转换形态技能)
                constant string corporealform
                // 技能命令串或ID 岗哨守卫
                constant string evileye
                // 技能命令串或ID 精灵之火
                constant string faeriefire
                // 技能命令串或ID 取消精灵之火
                constant string faeriefireoff
                // 技能命令串或ID 激活精灵之火
                constant string faeriefireon
                // 技能命令串或ID 刀阵旋风
                constant string fanofknives
                // 技能命令串或ID 远视(先知)
                constant string farsight
                // 技能命令串或ID 死亡之指(物品)(单位技能&物品技能)
                constant string fingerofdeath
                // 技能命令串或ID 霹雳闪电
                constant string firebolt
                // 技能命令串或ID 烈焰风暴
                constant string flamestrike
                // 技能命令串或ID 激活灼热之箭
                constant string flamingarrows
                // 技能命令串或ID 灼热之箭
                constant string flamingarrowstarg
                // 技能命令串或ID 激活毁灭之球(毁灭者)
                constant string flamingattack
                // 技能命令串或ID 毁灭之球(毁灭者)
                constant string flamingattacktarg
                // 技能命令串或ID 照明弹
                constant string flare
                // 技能命令串或ID 自然之船
                constant string forceboard
                // 技能命令串或ID 自然之力
                constant string forceofnature
                // 技能命令串或ID 火土风暴
                constant string forkedlightning
                // 技能命令串或ID 冰冻喷吐
                constant string freezingbreath
                // 技能命令串或ID 狂热(中立)
                constant string frenzy
                // 技能命令串或ID 取消狂热
                constant string frenzyoff
                // 技能命令串或ID 激活狂热
                constant string frenzyon
                // 技能命令串或ID 霜冻护甲
                constant string frostarmor
                // 技能命令串或ID 取消霜冻护甲
                constant string frostarmoroff
                // 技能命令串或ID 激活霜冻护甲
                constant string frostarmoron
                // 技能命令串或ID 霜冻新星
                constant string frostnova
                // 技能命令串或ID 给与物品
                constant string getitem
                // 技能命令串或ID 黄金交换木材
                constant string gold2lumber
                // 技能命令串或ID 战棍(山岭巨人)
                constant string grabtree
                // 技能命令串或ID 采集(黄金和木材)
                constant string harvest
                // 技能命令串或ID 医疗喷雾
                constant string healingspray
                // 技能命令串或ID 治疗守卫
                constant string healingward
                // 技能命令串或ID 医疗波
                constant string healingwave
                // 技能命令串或ID 取消治疗(人族牧师)
                constant string healoff
                // 技能命令串或ID 激活治疗(人族牧师)
                constant string healon
                // 技能命令串或ID 治疗(人族牧师)
                constant string heal
                // 技能命令串或ID 妖术
                constant string hex
                // 技能命令串或ID 保持原位(技能面板)
                constant string holdposition
                // 技能命令串或ID 神圣之光
                constant string holybolt
                // 技能命令串或ID 恐怖嚎叫
                constant string howlofterror
                // 技能命令串或ID 人族建筑菜单
                constant string humanbuild
                // 技能命令串或ID 激活献祭(恶魔猎手)
                constant string immolation
                // 技能命令串或ID 穿刺(地穴领主)
                constant string impale
                // 技能命令串或ID 燃灰(箭矢)
                constant string incineratearrow
                // 技能命令串或ID 取消燃灰(箭矢)
                constant string incineratearrowoff
                // 技能命令串或ID 激活燃灰(箭矢)
                constant string incineratearrowon
                // 技能命令串或ID 地狱火
                constant string inferno
                // 技能命令串或ID 心灵之火(人族牧师)
                constant string innerfire
                // 技能命令串或ID 取消心灵之火(人族牧师)
                constant string innerfireoff
                // 技能命令串或ID 激活心灵之火(人族牧师)
                constant string innerfireon
                // 技能命令串或ID 召唤骷髅(无目标)
                constant string instant
                // 技能命令串或ID 隐形术(人族女巫)
                constant string invisibility
                // 技能命令串或ID 召唤炎魔
                constant string lavamonster
                // 技能命令串或ID 闪电护盾
                constant string lightningshield
                // 技能命令串或ID 搭载弓箭手
                constant string loadarcher 
                // 技能命令串或ID 获取尸体(绞肉车)
                constant string loadcorpse
                // 技能命令串或ID 获取尸体(立即)(绞肉车)
                constant string loadcorpseinstant
                // 技能命令串或ID 蝗虫群
                constant string locustswarm
                // 技能命令串或ID 木材交换黄金
                constant string lumber2gold
                // 技能命令串或ID 激活魔法防御
                constant string magicdefense
                // 技能命令串或ID 空中锁链
                constant string magicleash
                // 技能命令串或ID 取消魔法防御
                constant string magicundefense
                // 技能命令串或ID 法力燃烧
                constant string manaburn
                // 技能命令串或ID 停止魔力之焰(精灵龙)
                constant string manaflareoff
                // 技能命令串或ID 魔力之焰(精灵龙)
                constant string manaflareon
                // 技能命令串或ID 取消魔法盾
                constant string manashieldoff
                // 技能命令串或ID 激活魔法盾
                constant string manashieldon
                // 技能命令串或ID 群体传送/传送权杖(英雄技能&物品技能)
                constant string massteleport
                // 技能命令串或ID 机械类的小玩艺(物品技能)
                constant string mechanicalcritter
                // 技能命令串或ID 恶魔变身
                constant string metamorphosis
                // 技能命令串或ID 战斗号召(人族民兵)
                constant string militia
                // 技能命令串或ID 农民转换成民兵
                constant string militiaconvert
                // 技能命令串或ID 返回工作(人族民兵)
                constant string militiaoff
                // 技能命令串或ID 民兵转换成农民
                constant string militiaunconvert
                // 技能命令串或ID 心灵腐烂
                constant string mindrot
                // 技能命令串或ID 镜像
                constant string mirrorimage
                // 技能命令串或ID 季风
                constant string monsoon
                // 技能命令串或ID 骑乘
                constant string mount
                // 技能命令串或ID 骑乘角鹰兽
                constant string mounthippogryph
                // 技能命令串或ID 移动/跟随
                constant string move
                // 技能命令串或ID 娜迦建造菜单
                constant string nagabuild
                // 技能命令串或ID 显示(人族及中立)
                constant string neutraldetectaoe
                // 技能命令串或ID 选择英雄
                constant string neutralinteract
                // 技能命令串或ID 收费(中立)
                constant string neutralspell
                // 技能命令串或ID 暗夜精灵建造菜单
                constant string nightelfbuild
                // 技能命令串或ID 兽族建筑菜单
                constant string orcbuild
                // 技能命令串或ID 寄生虫(娜迦)
                constant string parasite
                // 技能命令串或ID 取消寄生虫(娜迦)
                constant string parasiteoff
                // 技能命令串或ID 激活寄生虫(娜迦)
                constant string parasiteon
                // 技能命令串或ID 巡逻
                constant string patrol
                // 技能命令串或ID 相位移动(精灵龙)
                constant string phaseshift
                // 技能命令串或ID 相位移动(立即)(精灵龙)
                constant string phaseshiftinstant
                // 技能命令串或ID 取消相位移动(精灵龙)
                constant string phaseshiftoff
                // 技能命令串或ID 激活相位移动(精灵龙)
                constant string phaseshifton
                // 技能命令串或ID 凤凰烈焰(飞行单位)
                constant string phoenixfire
                // 技能命令串或ID 凤凰转换形态
                constant string phoenixmorph
                // 技能命令串或ID 毒箭
                constant string poisonarrowstarg
                // 技能命令串或ID 变形术(人族女巫)
                constant string polymorph
                // 技能命令串或ID 占据
                constant string possession
                // 技能命令串或ID 保存权杖(物品技能)
                constant string preservation
                // 技能命令串或ID 净化/带有净化效果的物品(1)(单位技能&物品技能)
                constant string purge
                // 技能命令串或ID 混乱之雨
                constant string rainofchaos
                // 技能命令串或ID 火焰雨
                constant string rainoffire
                // 技能命令串或ID 召唤骷髅(指定单位)
                constant string raisedead
                // 技能命令串或ID 取消召唤骷髅(亡灵男巫)
                constant string raisedeadoff
                // 技能命令串或ID 激活召唤骷髅(亡灵男巫)
                constant string raisedeadon
                // 技能命令串或ID 补充(月井之春)
                constant string recharge
                // 技能命令串或ID 取消补充(月井之春)
                constant string rechargeoff
                // 技能命令串或ID 激活补充(月井之春)
                constant string rechargeon
                // 技能命令串或ID 回春术
                constant string rejuvination
                // 技能命令串或ID 修理(暗夜精灵族)
                constant string renew
                // 技能命令串或ID 取消修理(暗夜精灵族)
                constant string renewoff
                // 技能命令串或ID 激活修理(暗夜精灵族)
                constant string renewon
                // 技能命令串或ID 修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
                constant string repair
                // 技能命令串或ID 取消修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
                constant string repairoff
                // 技能命令串或ID 激活修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
                constant string repairon
                // 技能命令串或ID 枯萎精髓及灵魂触摸(十胜石雕像)
                constant string replenish
                // 技能命令串或ID 枯萎精髓(十胜石雕像)
                constant string replenishlife
                // 技能命令串或ID 取消枯萎精髓(十胜石雕像)
                constant string replenishlifeoff
                // 技能命令串或ID 激活枯萎精髓(十胜石雕像)
                constant string replenishlifeon
                // 技能命令串或ID 灵魂触摸(十胜石雕像)
                constant string replenishmana
                // 技能命令串或ID 取消灵魂触摸(十胜石雕像)
                constant string replenishmanaoff
                // 技能命令串或ID 激活灵魂触摸(十胜石雕像)
                constant string replenishmanaon
                // 技能命令串或ID 取消枯萎精髓及灵魂触摸(十胜石雕像)
                constant string replenishoff
                // 技能命令串或ID 激活枯萎精髓及灵魂触摸(十胜石雕像)
                constant string replenishon
                // 技能命令串或ID 请求(英雄)
                constant string request_hero
                // 技能命令串或ID 牺牲(侍僧)
                constant string requestsacrifice
                // 技能命令串或ID 修理(不死灵族)
                constant string restoration
                // 技能命令串或ID 取消修理(不死灵族)
                constant string restorationoff
                // 技能命令串或ID 激活修理(不死灵族)
                constant string restorationon
                // 技能命令串或ID 返还建造
                constant string resumebuild
                // 技能命令串或ID 返还资源
                constant string resumeharvesting
                // 技能命令串或ID 返还资源
                constant string returnresources
                // 技能命令串或ID 复活(圣骑士)
                constant string resurrection
                // 技能命令串或ID 复仇(中立)
                constant string revenge
                // 技能命令串或ID 复活英雄
                constant string revive
                // 技能命令串或ID 咆哮
                constant string roar
                // 技能命令串或ID 牺牲(深渊)(不死灵族)
                constant string sacrifice
                // 技能命令串或ID 避难
                constant string sanctuary
                // 技能命令串或ID 侦查(白虎猫头鹰)
                constant string scout
                // 技能命令串或ID 卡布恩(自爆工兵)
                constant string selfdestruct
                // 技能命令串或ID 取消卡布恩(自爆工兵)
                constant string selfdestructoff
                // 技能命令串或ID 激活卡布恩(自爆工兵)
                constant string selfdestructon
                // 技能命令串或ID 哨兵(女猎)
                constant string sentinel
                // 技能命令串或ID 设置集结点
                constant string setrally
                // 技能命令串或ID 影子权杖(物品技能)
                constant string shadowsight
                // 技能命令串或ID 暗影突袭
                constant string shadowstrike
                // 技能命令串或ID 震荡波
                constant string shockwave
                // 技能命令串或ID 沉默
                constant string silence
                // 技能命令串或ID 睡眠(恐惧魔王)
                constant string sleep
                // 技能命令串或ID 减速(人族女巫)
                constant string slow
                // 技能命令串或ID 取消减速(人族女巫)
                constant string slowoff
                // 技能命令串或ID 激活减速(人族女巫)
                constant string slowon
                // 技能命令串或ID 右键点击
                constant string smart
                // 技能命令串或ID 灵魂燃烧
                constant string soulburn
                // 技能命令串或ID 灵魂保存
                constant string soulpreservation
                // 技能命令串或ID 魔法护盾(物品技能)
                constant string spellshield
                // 技能命令串或ID 魔法护盾(AEO)
                constant string spellshieldaoe
                // 技能命令串或ID 魔法盗取
                constant string spellsteal
                // 技能命令串或ID 取消魔法盗取
                constant string spellstealoff
                // 技能命令串或ID 激活魔法盗取
                constant string spellstealon
                // 技能命令串或ID 监视(岗哨守卫)
                constant string spies
                // 技能命令串或ID 灵魂链接
                constant string spiritlink
                // 技能命令串或ID 复仇天神
                constant string spiritofvengeance
                // 技能命令串或ID 灵魂巨魔
                constant string spirittroll
                // 技能命令串或ID 野兽幽魂
                constant string spiritwolf
                // 技能命令串或ID 惊吓
                constant string stampede
                // 技能命令串或ID 卸载苦工(兽族地洞)
                constant string standdown
                // 技能命令串或ID 群星坠落
                constant string starfall
                // 技能命令串或ID 静止陷阱
                constant string stasistrap
                // 技能命令串或ID 盗取(物品技能)
                constant string steal
                // 技能命令串或ID 战争践踏
                constant string stomp
                // 技能命令串或ID 停止
                constant string stop
                // 技能命令串或ID 口袋工厂
                constant string summonfactory
                // 技能命令串或ID 召唤熊
                constant string summongrizzly
                // 技能命令串或ID 召唤凤凰
                constant string summonphoenix
                // 技能命令串或ID 召唤豪猪
                constant string summonquillbeast
                // 技能命令串或ID 召唤战鹰
                constant string summonwareagle
                // 技能命令串或ID 空投坦克
                constant string tankdroppilot
                // 技能命令串或ID 挂载坦克
                constant string tankloadpilot
                // 技能命令串或ID 挂载坦克形态(tankpilot)
                constant string tankpilot
                // 技能命令串或ID 嘲讽(山岭巨人)
                constant string taunt
                // 技能命令串或ID 风暴之锤
                constant string thunderbolt
                // 技能命令串或ID 雷霆一击
                constant string thunderclap
                // 技能命令串或ID 龙卷风(娜迦女海巫)
                constant string tornado
                // 技能命令串或ID 返回工作(城镇大厅)(townbelloff)
                constant string townbelloff
                // 技能命令串或ID 战斗号召(城镇大厅)(townbellon)
                constant string townbellon
                // 技能命令串或ID 宁静
                constant string tranquility
                // 技能命令串或ID 点金术
                constant string transmute
                // 技能命令串或ID 取消天神下凡
                constant string unavatar
                // 技能命令串或ID 取消破坏者形态
                constant string unavengerform
                // 技能命令串或ID 取消变熊
                constant string unbearform
                // 技能命令串或ID 取消钻地
                constant string unburrow
                // 技能命令串或ID 取消霜冻之箭
                constant string uncoldarrows
                // 技能命令串或ID 不死建造菜单
                constant string undeadbuild
                // 技能命令串或ID 取消防御
                constant string undefend
                // 技能命令串或ID 取消神圣护甲
                constant string undivineshield
                // 技能命令串或ID 取消灼热之箭
                constant string unflamingarrows
                // 技能命令串或ID 取消毁灭之球(毁灭者)
                constant string unflamingattack
                // 技能命令串或ID 邪恶狂热
                constant string unholyfrenzy
                // 技能命令串或ID 激活献祭(恶魔猎手)
                constant string immolation
                // 技能命令串或ID 解除献祭(恶魔猎手)
                constant string unimmolation
                // 技能命令串或ID 装载
                constant string load
                // 技能命令串或ID 卸载
                constant string unload
                // 技能命令串或ID 全部卸载
                constant string unloadall
                // 技能命令串或ID 丢弃所有尸体(绞肉车)
                constant string unloadallcorpses
                // 技能命令串或ID 全部卸载(立即)
                constant string unloadallinstant
                // 技能命令串或ID 毒箭
                constant string poisonarrows
                // 技能命令串或ID 取消毒箭
                constant string unpoisonarrows
                // 技能命令串或ID 风暴之鸦
                constant string ravenform
                // 技能命令串或ID 取消风暴之鸦
                constant string unravenform
                // 技能命令串或ID 机器人形态
                constant string robogoblin
                // 技能命令串或ID 取消机器人形态
                constant string unrobogoblin
                // 技能命令串或ID 扎根(古树)
                constant string root
                // 技能命令串或ID 拔根(古树)
                constant string unroot
                // 技能命令串或ID 不稳定化合物(自爆蝙蝠)
                constant string unstableconcoction
                // 技能命令串或ID 石像形态
                constant string stoneform
                // 技能命令串或ID 取消石像形态
                constant string unstoneform
                // 技能命令串或ID 反召唤(物品技能)(侍僧卖建筑)(单位技能&物品技能)
                constant string unsummon
                // 技能命令串或ID 取消疾风步
                constant string unwindwalk
                // 技能命令串或ID 复仇之魂
                constant string vengeance
                // 技能命令串或ID 复仇之魂(无目标)
                constant string vengeanceinstant
                // 技能命令串或ID 取消复仇之魂
                constant string vengeanceoff
                // 技能命令串或ID 激活复仇之魂
                constant string vengeanceon
                // 技能命令串或ID 火山爆发
                constant string volcano
                // 技能命令串或ID 巫毒(暗影猎手)
                constant string voodoo
                // 技能命令串或ID 产卵触角/毒蛇守卫
                constant string ward
                // 技能命令串或ID (召唤)水元素
                constant string waterelemental
                // 技能命令串或ID 召唤水奴
                constant string wateryminion
                // 技能命令串或ID 蛛网
                constant string web
                // 技能命令串或ID 取消蛛网
                constant string weboff
                // 技能命令串或ID 激活蛛网
                constant string webon
                // 技能命令串或ID 剑刃风暴
                constant string whirlwind
                // 技能命令串或ID 疾风步
                constant string windwalk
                // 技能命令串或ID 采集(小精灵)(黄金和木材)
                constant string wispharvest
                // 技能命令串或ID 加速卷轴/能暂时加快移动速度的物品(物品技能)
                constant string scrollofspeed
                // 技能命令串或ID 取消
                constant string cancel
                // 技能命令串或ID 移动物品到第一格
                constant string moveslot1
                // 技能命令串或ID 移动物品到第二格
                constant string moveslot2
                // 技能命令串或ID 移动物品到第三格
                constant string moveslot3
                // 技能命令串或ID 移动物品到第四格
                constant string moveslot4
                // 技能命令串或ID 移动物品到第五格
                constant string moveslot5
                // 技能命令串或ID 移动物品到第六格
                constant string moveslot6
                // 技能命令串或ID 使用第一格物品
                constant string useslot1
                // 技能命令串或ID 使用第二格物品
                constant string useslot2
                // 技能命令串或ID 使用第三格物品
                constant string useslot3
                // 技能命令串或ID 使用第四格物品
                constant string useslot4
                // 技能命令串或ID 使用第五格物品
                constant string useslot5
                // 技能命令串或ID 使用第六格物品
                constant string useslot6
                // 技能命令串或ID 技能菜单(技能面板)
                constant string skillmenu
                // 技能命令串或ID 昏迷
                constant string stunned
                // 技能命令串或ID 巡逻(技能面板)
                constant string instant1
                // 技能命令串或ID 移动(技能面板)
                constant string instant2
                // 技能命令串或ID 停止(技能面板)
                constant string instant3
                // 技能命令串或ID 采集(黄金和木材)(技能面板)
                constant string instant4
        
        
                // 技能ID
        
        
                // 中立技能
        
                // 技能命令串或ID 显示(人族及中立)
                constant integer 852023
                // 技能命令串或ID 卡布恩(自爆工兵)
                constant integer 852040
                // 技能命令串或ID 激活卡布恩(自爆工兵)
                constant integer 852041
                // 技能命令串或ID 取消卡布恩(自爆工兵)
                constant integer 852042
                // 技能命令串或ID 乌鸦形态(中立)
                constant integer 852155
                // 技能命令串或ID 取消乌鸦形态(中立)
                constant integer 852156
                // 技能命令串或ID 黑暗转换
                constant integer 852228
                // 技能命令串或ID 黑暗之门
                constant integer 852229
                // 技能命令串或ID 霹雳闪电
                constant integer 852231
                // 技能命令串或ID 混乱之雨
                constant integer 852237
                // 技能命令串或ID 火焰雨
                constant integer 852238
                // 技能命令串或ID 复仇(中立)
                constant integer 852241
                // 技能命令串或ID 灵魂保存
                constant integer 852242
                // 技能命令串或ID 霜冻之箭
                constant integer 852243
                // 技能命令串或ID 激活霜冻之箭
                constant integer 852244
                // 技能命令串或ID 取消霜冻之箭
                constant integer 852245
                // 技能命令串或ID 操纵死尸(中立)
                constant integer 852246
                // 技能命令串或ID 吞噬(中立)
                constant integer 852247
                // 技能命令串或ID 野怪医疗(中立)
                constant integer 852248
                // 技能命令串或ID 治疗(中立)
                constant integer 852248
                // 技能命令串或ID 激活治疗(中立)
                constant integer 852249
                // 技能命令串或ID 取消治疗(中立)
                constant integer 852250
                // 技能命令串或ID 投石(中立)
                constant integer 852252
                // 技能命令串或ID 雷霆一击(中立)
                constant integer 852253
                // 技能命令串或ID 毒箭
                constant integer 852254
                // 技能命令串或ID 激活毒箭
                constant integer 852255
                // 技能命令串或ID 取消毒箭
                constant integer 852256
                // 技能命令串或ID 生命汲取/魔法吸吮
                constant integer 852487
                // 技能命令串或ID 产卵触角/毒蛇守卫
                constant integer 852504
                // 技能命令串或ID 霜冻呼吸
                constant integer 852560
                // 技能命令串或ID 狂热(中立)
                constant integer 852561
                // 技能命令串或ID 心灵腐烂
                constant integer 852565
                // 技能命令串或ID 黑暗之箭
                constant integer 852577
                // 技能命令串或ID 激活黑暗之箭
                constant integer 852578
                // 技能命令串或ID 取消黑暗之箭
                constant integer 852579
                // 技能命令串或ID 火焰吐息
                constant integer 852580
                // 技能命令串或ID 符咒
                constant integer 852581
                // 技能命令串或ID 末日审判
                constant integer 852583
                // 技能命令串或ID 醉酒云雾
                constant integer 852585
                // 技能命令串或ID 火土风暴
                constant integer 852586
                // 技能命令串或ID 叉状闪电
                constant integer 852587
                // 技能命令串或ID 恐怖嚎叫
                constant integer 852588
                // 技能命令串或ID 激活魔法盾
                constant integer 852589
                // 技能命令串或ID 取消魔法盾
                constant integer 852590
                // 技能命令串或ID 季风
                constant integer 852591
                // 技能命令串或ID 沉默
                constant integer 852592
                // 技能命令串或ID 惊吓
                constant integer 852593
                // 技能命令串或ID 召唤熊
                constant integer 852594
                // 技能命令串或ID 召唤豪猪
                constant integer 852595
                // 技能命令串或ID 召唤战鹰
                constant integer 852596
                // 技能命令串或ID 龙卷风(娜迦女海巫)
                constant integer 852597
                // 技能命令串或ID 召唤水奴
                constant integer 852598
                // 技能命令串或ID 战争咆哮
                constant integer 852599
                // 技能命令串或ID 通魔
                constant integer 852600
                // 技能命令串或ID 寄生虫(娜迦)
                constant integer 852601
                // 技能命令串或ID 激活寄生虫(娜迦)
                constant integer 852602
                // 技能命令串或ID 取消寄生虫(娜迦)
                constant integer 852603
                // 技能命令串或ID 潜水(娜迦)
                constant integer 852604
                // 技能命令串或ID 取消潜水(娜迦)
                constant integer 852605
                // 技能命令串或ID 瓦解光线(中立)
                constant integer 852615
                // 技能命令串或ID 收费(中立)
                constant integer 852630
                // 技能命令串或ID 火箭群
                constant integer 852652
                // 技能命令串或ID 开启机器人形态
                constant integer 852656
                // 技能命令串或ID 取消机器人形态
                constant integer 852657
                // 技能命令串或ID 口袋工厂
                constant integer 852658
                // 技能命令串或ID 酸性炸弹
                constant integer 852662
                // 技能命令串或ID 化学风暴
                constant integer 852663
                // 技能命令串或ID 医疗喷雾
                constant integer 852664
                // 技能命令串或ID 点金术
                constant integer 852665
                // 技能命令串或ID 召唤炎魔
                constant integer 852667
                // 技能命令串或ID 灵魂燃烧
                constant integer 852668
                // 技能命令串或ID 火山爆发
                constant integer 852669
                // 技能命令串或ID 燃灰(箭矢)
                constant integer 852670
                // 技能命令串或ID 激活燃灰(箭矢)
                constant integer 852671
                // 技能命令串或ID 取消燃灰(箭矢)
                constant integer 852672
                // 技能命令串或ID 娜迦建造菜单
                constant integer 852467
                // 技能命令串或ID 魔法护盾(AEO)(spellshieldaoe)
                constant integer 852572
                // 技能命令串或ID 属性加成(黄点技能)
                constant integer 852576
        
        
                // 物品技能
        
                // 技能命令串或ID 群体传送/传送权杖(英雄技能&物品技能)
                constant integer 852093
                // 技能命令串或ID 净化/带有净化效果的物品(1)(单位技能&物品技能)
                constant integer 852111
                // 技能命令串或ID 反魔法外壳(单位技能)/具有反魔法盾的物品(物品技能)
                constant integer 852186
                // 技能命令串或ID 反召唤(物品技能)(侍僧卖建筑)(单位技能&物品技能)
                constant integer 852210
                // 技能命令串或ID 黑暗召唤(英雄技能&物品技能)
                constant integer 852220
                // 技能命令串或ID 死亡之指(物品)(单位技能&物品技能)
                constant integer 852230
                // 技能命令串或ID 能召唤单位的物品(物品技能)
                constant integer 852261
                // 技能命令串或ID 统治权杖(物品技能)
                constant integer 852267
                // 技能命令串或ID 能暂时加强范围内所有单位护甲的物品(物品技能)
                constant integer 852269
                // 技能命令串或ID 能探测一定区域的物品(物品技能)
                constant integer 852270
                // 技能命令串或ID 具有驱逐魔法效果的物品(物品技能)
                constant integer 852271
                // 技能命令串或ID 具有医疗效果的物品/最小的医疗能力(物品技能)
                constant integer 852272
                // 技能命令串或ID 能进行范围医疗的物品/时钟企鹅(物品技能)
                constant integer 852273
                // 技能命令串或ID 幻象物品(物品技能)
                constant integer 852274
                // 技能命令串或ID 带有净化效果的物品(1)(物品技能)
                constant integer 852275
                // 技能命令串或ID 能提高一定范围内所有单位魔法值的物品/神秘区域魔法恢复(物品技能)
                constant integer 852277
                // 技能命令串或ID 能置放地精地雷的物品(物品技能)
                constant integer 852278
                // 技能命令串或ID 召唤物品(物品技能)
                constant integer 852279
                // 技能命令串或ID 能进行医疗和增加魔法值的单位(物品技能)
                constant integer 852281
                // 技能命令串或ID 神秘区域生命魔法恢复/能提高一定范围内所有单位魔法值和生命值的物品(物品技能)
                constant integer 852282
                // 技能命令串或ID 能盗取单位灵魂的物品(物品技能)
                constant integer 852284
                // 技能命令串或ID 加速卷轴/能暂时加快移动速度的物品(物品技能)
                constant integer 852285
                // 技能命令串或ID 回城卷轴物品(物品技能)
                constant integer 852286
                // 技能命令串或ID 能让单位暂时隐身的物品(物品技能)
                constant integer 852287
                // 技能命令串或ID 能让单位暂时无敌的物品(物品技能)
                constant integer 852288
                // 技能命令串或ID 再训练之书(物品技能)
                constant integer 852471
                // 技能命令串或ID 乌云技能(单位技能&物品技能)
                constant integer 852473
                // 技能命令串或ID 闪烁(物品等级)(英雄技能&物品技能)
                constant integer 852525
                // 技能命令串或ID 机械类的小玩艺(物品技能)
                constant integer 852564
                // 技能命令串或ID 保存权杖(物品技能)
                constant integer 852568
                // 技能命令串或ID 影子权杖(物品技能)
                constant integer 852570
                // 技能命令串或ID 魔法护盾(物品技能)
                constant integer 852571
                // 技能命令串或ID 盗取(物品技能)
                constant integer 852574
                // 技能命令串或ID 净化药水/医疗剂/恢复卷轴/普通物品-回复效果(物品技能)
                constant integer 852609
                // 技能命令串或ID 能显示整个地图的物品(物品技能)
                constant integer 852612
                // 技能命令串或ID 带有蛛网技能的物品(物品技能)
                constant integer 852613
                // 技能命令串或ID 怪兽诱捕守卫(物品技能)
                constant integer 852614
                // 技能命令串或ID 带有锁链驱逐效果的物品(物品技能)
                constant integer 852615
                // 技能命令串或ID 信号枪(物品技能)
                constant integer 852618
                // 技能命令串或ID 建造小型的建筑(迷你建筑)(物品技能)
                constant integer 852619
                // 技能命令串或ID 改变一天的时间(物品技能)
                constant integer 852621
                // 技能命令串或ID 吸血药水(物品技能)
                constant integer 852623
                // 技能命令串或ID 复活死尸(物品技能)
                constant integer 852624
                // 技能命令串或ID 尘土之影(物品技能)
                constant integer 852625
        
        
                // 特殊命令类
        
                // 技能命令串或ID 右键点击
                constant integer 851971
                // 技能命令串或ID 停止
                constant integer 851972
                // 技能命令串或ID 昏迷
                constant integer 851973
                // 技能命令串或ID 中立单位静止
                constant integer 851974
                // 技能命令串或ID 取消
                constant integer 851976
                // 技能命令串或ID 设置集结点
                constant integer 851980
                // 技能命令串或ID 攻击
                constant integer 851983
                // 技能命令串或ID 攻击一次
                constant integer 851985
                // 技能命令串或ID 攻击地面
                constant integer 851984
                // 技能命令串或ID 黄金交换木材
                constant integer 852233
                // 技能命令串或ID 木材交换黄金
                constant integer 852234
                // 技能命令串或ID 巡逻(技能面板)
                constant integer 851991
                // 技能命令串或ID 移动(技能面板)
                constant integer 851987
                // 技能命令串或ID 停止(技能面板)
                constant integer 851975
                // 技能命令串或ID 采集(黄金和木材)(技能面板)
                constant integer 852019
                // 技能命令串或ID 移动/跟随
                constant integer 851986
                // 技能命令串或ID AImove(AI移动)
                constant integer 851988
                // 技能命令串或ID 保持原位(技能面板)
                constant integer 851993
                // 技能命令串或ID 建筑菜单
                constant integer 851994
                // 技能命令串或ID 巡逻
                constant integer 851990
                // 技能命令串或ID 技能菜单(技能面板)
                constant integer 852000
                // 技能命令串或ID 移动物品到第一格
                constant integer 852002
                // 技能命令串或ID 移动物品到第二格
                constant integer 852003
                // 技能命令串或ID 移动物品到第三格
                constant integer 852004
                // 技能命令串或ID 移动物品到第四格
                constant integer 852005
                // 技能命令串或ID 移动物品到第五格
                constant integer 852006
                // 技能命令串或ID 移动物品到第六格
                constant integer 852007
                // 技能命令串或ID 使用第一格物品
                constant integer 852008
                // 技能命令串或ID 使用第二格物品
                constant integer 852009
                // 技能命令串或ID 使用第三格物品
                constant integer 852010
                // 技能命令串或ID 使用第四格物品
                constant integer 852011
                // 技能命令串或ID 使用第五格物品
                constant integer 852012
                // 技能命令串或ID 使用第六格物品
                constant integer 852013
                // 技能命令串或ID 给与物品
                constant integer 851981
                // 技能命令串或ID 丢弃物品
                constant integer 852001
                // 技能命令串或ID 返还资源
                constant integer 852017
                // 技能命令串或ID 返还建造(resumebuild)
                constant integer 851999
                // 技能命令串或ID 采集(黄金和木材)
                constant integer 852018
                // 技能命令串或ID 自动采集黄金
                constant integer 852021
                // 技能命令串或ID 自动采集木材
                constant integer 852022
                // 技能命令串或ID 开始复活祭坛里的第一个英雄
                constant integer 852027
                // 技能命令串或ID 开始复活祭坛里的第二个英雄
                constant integer 852028
                // 技能命令串或ID 开始复活祭坛里的第三个英雄
                constant integer 852029
                // 技能命令串或ID 开始复活祭坛里的第四个英雄
                constant integer 852030
                // 技能命令串或ID 开始复活祭坛里的第五个英雄
                constant integer 852031
                // 技能命令串或ID 开始复活祭坛里的第六个英雄
                constant integer 852032
                // 技能命令串或ID 开始复活祭坛里的第七个英雄
                constant integer 852033
                // 技能命令串或ID 复活英雄
                constant integer 852039
                // 技能命令串或ID 登船
                constant integer 852043
                // 技能命令串或ID 全部登船
                constant integer 85044
                // 技能命令串或ID 装载
                constant integer 852046
                // 技能命令串或ID 卸载
                constant integer 852047
                // 技能命令串或ID 全部卸载
                constant integer 852048
                // 技能命令串或ID 全部卸载(立即)
                constant integer 852049
                // 技能命令串或ID 立即复活酒馆里的第一个英雄
                constant integer 852462
                // 技能命令串或ID 立即复活酒馆里的第二个英雄
                constant integer 852463
                // 技能命令串或ID 立即复活酒馆里的第三个英雄
                constant integer 852464
                // 技能命令串或ID 立即复活酒馆里的第四个英雄
                constant integer 852465
                // 技能命令串或ID 蝗虫随机游走
                constant integer 852557
                // 技能命令串或ID 蝗虫返回单位
                constant integer 852558
                // 技能命令串或ID 请求(英雄)(request_hero)
                constant integer 852239
                // 技能命令串或ID 返还资源(returnresources)
                constant integer 852020
                // 技能命令串或ID 选择英雄
                constant integer 852566
        
        
                // 暗夜精灵族技能
        
                // 技能命令串或ID 暗夜精灵建造菜单
                constant integer 851997
                // 技能命令串或ID 影遁(夜晚)
                constant integer 852131
                // 技能命令串或ID 驱逐魔法(小鹿)
                constant integer 852132
                // 技能命令串或ID 激活驱逐(小鹿)
                constant integer 852133
                // 技能命令串或ID 取消驱逐(小鹿)
                constant integer 852134
                // 技能命令串或ID 变熊
                constant integer 852138
                // 技能命令串或ID 取消变熊
                constant integer 852139
                // 技能命令串或ID 飓风术(鸟德)
                constant integer 852144
                // 技能命令串或ID 自爆(小精灵)
                constant integer 852145
                // 技能命令串或ID 吃树(古树)
                constant integer 852146
                // 技能命令串或ID 缠绕金矿
                constant integer 852147
                // 技能命令串或ID 缠绕金矿(立即)
                constant integer 852148
                // 技能命令串或ID 精灵之火
                constant integer 852149
                // 技能命令串或ID 激活精灵之火
                constant integer 852150
                // 技能命令串或ID 取消精灵之火
                constant integer 852151
                // 技能命令串或ID 风暴之鸦
                constant integer 852155
                // 技能命令串或ID 取消风暴之鸦
                constant integer 852156
                // 技能命令串或ID 补充(月井之春)
                constant integer 852157
                // 技能命令串或ID 激活补充(月井之春)
                constant integer 852158
                // 技能命令串或ID 取消补充(月井之春)
                constant integer 852159
                // 技能命令串或ID 回春术
                constant integer 852160
                // 技能命令串或ID 修理(暗夜精灵族)
                constant integer 852161
                // 技能命令串或ID 激活修理(暗夜精灵族)
                constant integer 852162
                // 技能命令串或ID 取消修理(暗夜精灵族)
                constant integer 852163
                // 技能命令串或ID 咆哮
                constant integer 852164
                // 技能命令串或ID 扎根(古树)
                constant integer 852165
                // 技能命令串或ID 拔根(古树)
                constant integer 852166
                // 技能命令串或ID 纠缠须根
                constant integer 852171
                // 技能命令串或ID 灼热之箭
                constant integer 852173
                // 技能命令串或ID 激活灼热之箭
                constant integer 852174
                // 技能命令串或ID 灼热之箭目标(flamingarrowstarg)
                constant integer 852540
                // 技能命令串或ID 取消灼热之箭
                constant integer 852175
                // 技能命令串或ID 自然之力
                constant integer 852176
                // 技能命令串或ID 自然之船(forceboard)
                constant integer 852044
                // 技能命令串或ID 激活献祭(恶魔猎手)
                constant integer 852177
                // 技能命令串或ID 解除献祭(恶魔猎手)
                constant integer 852178
                // 技能命令串或ID 法力燃烧
                constant integer 852179
                // 技能命令串或ID 恶魔变身
                constant integer 852180
                // 技能命令串或ID 侦查(白虎猫头鹰)
                constant integer 852181
                // 技能命令串或ID 哨兵(女猎)
                constant integer 852182
                // 技能命令串或ID 群星坠落
                constant integer 852183
                // 技能命令串或ID 宁静
                constant integer 852184
                // 技能命令串或ID 缠绕金矿(指定单位)
                constant integer 852505
                // 技能命令串或ID 缠绕金矿(立即)(指定单位)
                constant integer 852506
                // 技能命令串或ID 搭载弓箭手
                constant integer 852507
                // 技能命令串或ID 搭载弓箭手
                constant integer 852142
                // 技能命令串或ID 骑乘(mount)
                constant integer 852469
                // 技能命令串或ID 骑乘角鹰兽(mounthippogryph)
                constant integer 852143
                // 技能命令串或ID 骑乘角鹰兽&搭载弓箭手
                constant integer 852508
                // 技能命令串或ID 卸载弓箭手
                constant integer 852509
                // 技能命令串或ID 战棍(山岭巨人)
                constant integer 852511
                // 技能命令串或ID 魔力之焰(精灵龙)
                constant integer 852512
                // 技能命令串或ID 停止魔力之焰(精灵龙)
                constant integer 852513
                // 技能命令串或ID 相位移动(精灵龙)
                constant integer 852514
                // 技能命令串或ID 激活相位移动(精灵龙)
                constant integer 852515
                // 技能命令串或ID 取消相位移动(精灵龙)
                constant integer 852516
                // 技能命令串或ID 相位移动(立即)(精灵龙)
                constant integer 852517
                // 技能命令串或ID 嘲讽(山岭巨人)
                constant integer 852520
                // 技能命令串或ID 复仇之魂
                constant integer 852521
                // 技能命令串或ID 激活复仇之魂
                constant integer 852522
                // 技能命令串或ID 取消复仇之魂
                constant integer 852523
                // 技能命令串或ID 复仇之魂(无目标)
                constant integer 852524
                // 技能命令串或ID 刀阵旋风
                constant integer 852526
                // 技能命令串或ID 暗影突袭
                constant integer 852527
                // 技能命令串或ID 复仇天神
                constant integer 852528
                // 技能命令串或ID 硬化皮肤
                constant integer 852135
                // 技能命令串或ID 激活硬化皮肤
                constant integer 852137
                // 技能命令串或ID 取消硬化皮肤
                constant integer 852136
                // 技能命令串或ID 腐蚀喷吐
                constant integer 852140
                // 技能命令串或ID 分离(disassociate)
                constant integer 852240
                // 技能命令串或ID 取消坐骑(dismount)
                constant integer 852470
                // 技能命令串或ID 采集(小精灵)(黄金和木材)
                constant integer 852214
        
        
                // 不死族技能
        
                // 技能命令串或ID 不死建造菜单
                constant integer 851998
                // 技能命令串或ID 获取尸体(绞肉车)
                constant integer 852050
                // 技能命令串或ID 获取尸体(立即)(绞肉车)
                constant integer 852053
                // 技能命令串或ID 丢弃所有尸体(绞肉车)
                constant integer 852054
                // 技能命令串或ID 吞食尸体
                constant integer 852188
                // 技能命令串或ID 残废
                constant integer 852189
                // 技能命令串或ID 诅咒
                constant integer 852190
                // 技能命令串或ID 激活诅咒
                constant integer 852191
                // 技能命令串或ID 解除诅咒
                constant integer 852192
                // 技能命令串或ID 占据
                constant integer 852196
                // 技能命令串或ID 召唤骷髅(指定单位)
                constant integer 852197
                // 技能命令串或ID 激活召唤骷髅(亡灵男巫)
                constant integer 852198
                // 技能命令串或ID 取消召唤骷髅(亡灵男巫)
                constant integer 852199
                // 技能命令串或ID 召唤骷髅(无目标)
                constant integer 852200
                // 技能命令串或ID 牺牲(侍僧)
                constant integer 852201
                // 技能命令串或ID 修理(不死灵族)
                constant integer 852202
                // 技能命令串或ID 激活修理(不死灵族)
                constant integer 852203
                // 技能命令串或ID 取消修理(不死灵族)
                constant integer 852204
                // 技能命令串或ID 采集(侍僧)(黄金)
                constant integer 852185
                // 技能命令串或ID 牺牲(深渊)(不死灵族)
                constant integer 852205
                // 技能命令串或ID 石像形态
                constant integer 852206
                // 技能命令串或ID 取消石像形态
                constant integer 852207
                // 技能命令串或ID 邪恶狂热
                constant integer 852209
                // 技能命令串或ID 蛛网
                constant integer 852211
                // 技能命令串或ID 激活蛛网
                constant integer 852212
                // 技能命令串或ID 取消蛛网
                constant integer 852213
                // 技能命令串或ID 操纵死尸
                constant integer 852217
                // 技能命令串或ID 腐臭蜂群
                constant integer 852218
                // 技能命令串或ID 黑暗仪式
                constant integer 852219
                // 技能命令串或ID 死亡凋零
                constant integer 852221
                // 技能命令串或ID 死亡缠绕
                constant integer 852222
                // 技能命令串或ID 死亡契约
                constant integer 852223
                // 技能命令串或ID 地狱火
                constant integer 852224
                // 技能命令串或ID 霜冻护甲
                constant integer 852225
                // 技能命令串或ID 霜冻新星
                constant integer 852226
                // 技能命令串或ID 睡眠(恐惧魔王)
                constant integer 852227
                // 技能命令串或ID 激活霜冻护甲
                constant integer 852458
                // 技能命令串或ID 取消霜冻护甲
                constant integer 852459
                // 技能命令串或ID 吸收魔法(毁灭者)
                constant integer 852529
                // 技能命令串或ID 破坏者形态
                constant integer 852531
                // 技能命令串或ID 取消破坏者形态
                constant integer 852532
                // 技能命令串或ID 钻地
                constant integer 852533
                // 技能命令串或ID 取消钻地
                constant integer 852534
                // 技能命令串或ID 吞噬魔法(毁灭者)
                constant integer 852536
                // 技能命令串或ID 毁灭之球(毁灭者)
                constant integer 852539
                // 技能命令串或ID 激活毁灭之球(毁灭者)
                constant integer 852540
                // 技能命令串或ID 取消毁灭之球(毁灭者)
                constant integer 852541
                // 技能命令串或ID 枯萎精髓及灵魂触摸(十胜石雕像)
                constant integer 852542
                // 技能命令串或ID 激活枯萎精髓及灵魂触摸(十胜石雕像)
                constant integer 852543
                // 技能命令串或ID 取消枯萎精髓及灵魂触摸(十胜石雕像)
                constant integer 852544
                // 技能命令串或ID 枯萎精髓(十胜石雕像)
                constant integer 852545
                // 技能命令串或ID 激活枯萎精髓(十胜石雕像)
                constant integer 852546
                // 技能命令串或ID 取消枯萎精髓(十胜石雕像)
                constant integer 852547
                // 技能命令串或ID 灵魂触摸(十胜石雕像)
                constant integer 852548
                // 技能命令串或ID 激活灵魂触摸(十胜石雕像)
                constant integer 852549
                // 技能命令串或ID 取消灵魂触摸(十胜石雕像)
                constant integer 852550
                // 技能命令串或ID 腐尸甲虫(指定单位)
                constant integer 852551
                // 技能命令串或ID 激活腐尸甲虫
                constant integer 852552
                // 技能命令串或ID 取消腐尸甲虫
                constant integer 852553
                // 技能命令串或ID 召唤腐尸甲虫(无目标)
                constant integer 852554
                // 技能命令串或ID 穿刺(地穴领主)
                constant integer 852555
                // 技能命令串或ID 蝗虫群
                constant integer 852556
                // 技能命令串或ID 冰冻喷吐
                constant integer 852195
                // 技能命令串或ID 激活狂热
                constant integer 852562
                // 技能命令串或ID 取消狂热
                constant integer 852563
                // 技能命令串或ID 地狱火
                constant integer 852232
                // 技能命令串或ID 邪恶光环
                constant integer 852215
                // 技能命令串或ID 吸血光环
                constant integer 852216
                // 技能命令串或ID 唤醒
                constant integer 852466
                // 技能命令串或ID 荒芜(荒芜之地)
                constant integer 852187
        
        
                //兽族技能
        
                // 技能命令串或ID 兽族建筑菜单
                constant integer 851996
                // 技能命令串或ID 修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
                constant integer 852024
                // 技能命令串或ID 激活修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
                constant integer 852025
                // 技能命令串或ID 取消修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
                constant integer 852026
                // 技能命令串或ID 战斗警备(兽族地洞)
                constant integer 852099
                // 技能命令串或ID 狂战士
                constant integer 852100
                // 技能命令串或ID 嗜血术
                constant integer 852101
                // 技能命令串或ID 激活嗜血术
                constant integer 852102
                // 技能命令串或ID 取消嗜血术
                constant integer 852103
                // 技能命令串或ID 吞噬(科多兽等)
                constant integer 852104
                // 技能命令串或ID 岗哨守卫
                constant integer 852105
                // 技能命令串或ID 诱捕(网,非蛛网)
                constant integer 852106
                // 技能命令串或ID 激活诱捕(网,非蛛网)
                constant integer 852108
                // 技能命令串或ID 取消诱捕(网,非蛛网)
                constant integer 852107
                // 技能命令串或ID 治疗守卫
                constant integer 852109
                // 技能命令串或ID 闪电护盾
                constant integer 852110
                // 技能命令串或ID 卸载苦工(兽族地洞)
                constant integer 852113
                // 技能命令串或ID 静止陷阱
                constant integer 852114
                // 技能命令串或ID 闪电链
                constant integer 852119
                // 技能命令串或ID 地震(先知)
                constant integer 852121
                // 技能命令串或ID 远视(先知)
                constant integer 852122
                // 技能命令串或ID 镜像
                constant integer 852123
                // 技能命令串或ID 震荡波
                constant integer 852125
                // 技能命令串或ID 野兽幽魂
                constant integer 852126
                // 技能命令串或ID 战争践踏
                constant integer 852127
                // 技能命令串或ID 剑刃风暴
                constant integer 852128
                // 技能命令串或ID 疾风步
                constant integer 852129
                // 技能命令串或ID 取消疾风步
                constant integer 852130
                // 技能命令串或ID 先祖幽灵
                constant integer 852490
                // 技能命令串或ID 先祖幽灵(目标)
                constant integer 852491
                // 技能命令串或ID 虚无状态(白牛转换形态技能)
                constant integer 852494
                // 技能命令串或ID 灵肉状态(白牛转换形态技能)
                constant integer 852493
                // 技能命令串或ID 虚无状态(白牛转换形态技能)
                constant integer 852496
                // 技能命令串或ID 取消虚无状态(白牛转换形态技能)
                constant integer 852497
                // 技能命令串或ID 消魔(白牛)
                constant integer 852495
                // 技能命令串或ID 不稳定化合物(自爆蝙蝠)
                constant integer 852500
                // 技能命令串或ID 医疗波
                constant integer 852501
                // 技能命令串或ID 妖术
                constant integer 852502
                // 技能命令串或ID 巫毒(暗影猎手)
                constant integer 852503
                // 技能命令串或ID 灵魂锁链
                constant integer 854299
                // 技能命令串或ID 监视(岗哨守卫)(spies)
                constant integer 852235
                // 技能命令串或ID 灵魂巨魔(spirittroll)
                constant integer 852573
        
        
                // 人族技能
        
                // 技能命令串或ID 人族建筑菜单
                constant integer 851995
                // 技能命令串或ID 激活防御
                constant integer 852055
                // 技能命令串或ID 取消防御
                constant integer 852056
                // 技能命令串或ID 驱散(人族牧师)
                constant integer 852057
                // 技能命令串或ID 照明弹
                constant integer 852060
                // 技能命令串或ID 治疗(人族牧师)
                constant integer 852063
                // 技能命令串或ID 激活治疗(人族牧师)
                constant integer 852064
                // 技能命令串或ID 取消治疗(人族牧师)
                constant integer 852065
                // 技能命令串或ID 心灵之火(人族牧师)
                constant integer 852066
                // 技能命令串或ID 激活心灵之火(人族牧师)
                constant integer 852067
                // 技能命令串或ID 取消心灵之火(人族牧师)
                constant integer 852068
                // 技能命令串或ID 隐形术(人族女巫)
                constant integer 852069
                // 技能命令串或ID 战斗号召(人族民兵)
                constant integer 852072
                // 技能命令串或ID 返回工作(人族民兵)
                constant integer 852073
                // 技能命令串或ID 战斗号召(城镇大厅)(townbellon)
                constant integer 852082
                // 技能命令串或ID 返回工作(城镇大厅)(townbelloff)
                constant integer 852083
                // 技能命令串或ID 农民转换成民兵
                constant integer 852071
                // 技能命令串或ID 民兵转换成农民
                constant integer 852651
                // 技能命令串或ID 变形术(人族女巫)
                constant integer 852074
                // 技能命令串或ID 减速(人族女巫)
                constant integer 852075
                // 技能命令串或ID 激活减速(人族女巫)
                constant integer 852076
                // 技能命令串或ID 取消减速(人族女巫)
                constant integer 852077
                // 技能命令串或ID 天神下凡
                constant integer 852086
                // 技能命令串或ID 取消天神下凡
                constant integer 852087
                // 技能命令串或ID 暴风雪
                constant integer 852089
                // 技能命令串或ID 激活神圣护甲
                constant integer 852090
                // 技能命令串或ID 取消神圣护甲
                constant integer 852091
                // 技能命令串或ID 神圣之光
                constant integer 852092
                // 技能命令串或ID 复活(圣骑士)
                constant integer 852094
                // 技能命令串或ID 风暴之锤
                constant integer 852095
                // 技能命令串或ID 雷霆一击
                constant integer 852096
                // 技能命令串或ID (召唤)水元素
                constant integer 852097
                // 技能命令串或ID 控制魔法
                constant integer 852474
                // 技能命令串或ID 激活魔法防御
                constant integer 852478
                // 技能命令串或ID 取消魔法防御
                constant integer 852479
                // 技能命令串或ID 空中锁链
                constant integer 852480
                // 技能命令串或ID 凤凰烈焰(飞行单位)
                constant integer 852481
                // 技能命令串或ID 凤凰转换形态
                constant integer 852482
                // 技能命令串或ID 召唤凤凰
                constant integer 852489
                // 技能命令串或ID 魔法盗取
                constant integer 852483
                // 技能命令串或ID 激活魔法盗取
                constant integer 852484
                // 技能命令串或ID 取消魔法盗取
                constant integer 852485
                // 技能命令串或ID 虚无(血法)
                constant integer 852486
                // 技能命令串或ID 烈焰风暴
                constant integer 852488
                // 技能命令串或ID 避难(sanctuary)
                constant integer 852569
                // 技能命令串或ID 显示/探测(detectaoe)
                constant integer 852015
                // 技能命令串或ID 空投坦克(tankdroppilot)
                constant integer 852079
                // 技能命令串或ID 挂载坦克(tankloadpilot)
                constant integer 852080
                // 技能命令串或ID 挂载坦克形态(tankpilot)
                constant integer 852081
        
        
        //fdf (Frame 定义文件)/UI
        // 1.32+原生UI/框架
        // 源：https://www.hiveworkshop.com/threads/ui-reading-a-fdf.315850/
        
        
                // 框架类型
        
                // 框架类型 背景
                constant string BACKDROP
                // 框架类型 按钮
                constant string BUTTON
                // 框架类型 聊天显示框
                constant string CHATDISPLAY
                // 框架类型 复选框
                constant string CHECKBOX
                // 框架类型 控制
                constant string CONTROL
                // 框架类型 对话框
                constant string DIALOG
                // 框架类型 输入框
                constant string EDITBOX
                // 框架类型 框架
                constant string FRAME
                // 框架类型 黏合按钮
                constant string GLUEBUTTON
                // 框架类型 黏合复选框
                constant string GLUECHECKBOX
                // 框架类型 黏合输入框
                constant string GLUEEDITBOX
                // 框架类型 黏合弹出菜单
                constant string GLUEPOPUPMENU
                // 框架类型 黏合文本按钮
                constant string GLUETEXTBUTTON
                // 框架类型 高亮显示
                constant string HIGHLIGHT
                // 框架类型 列表框
                constant string LISTBOX
                // 框架类型 菜单
                constant string MENU
                // 框架类型 模型
                constant string MODEL
                // 框架类型 弹出菜单
                constant string POPUPMENU
                // 框架类型 滚动条
                constant string SCROLLBAR
                // 框架类型 简易按钮
                constant string SIMPLEBUTTON
                // 框架类型 简易复选框
                constant string SIMPLECHECKBOX
                // 框架类型 简易框架
                constant string SIMPLEFRAME
                // 框架类型 简易状态栏
                constant string SIMPLESTATUSBAR
                // 框架类型 聊天框
                constant string SLASHCHATBOX
                // 框架类型 滑块
                constant string SLIDER
                // 框架类型 精灵图
                constant string SPRITE
                // 框架类型 文本
                constant string TEXT
                // 框架类型 文本区域
                constant string TEXTAREA
                // 框架类型 文本按钮
                constant string TEXTBUTTON
                // 框架类型 限时文本
                constant string TIMERTEXT
        
        
                // FDF(框架定义)
        
                // FDF(框架定义) 字母模式
                // 变量类型为字符串,如(官方默认提供)
                // "ADD"  添加
                // "ALPHAKEY"  字母键
                constant string AlphaMode
                // FDF(框架定义) 锚点
                // 变量类型为组合,如(官方默认提供)
                // BOTTOMLEFT, -0.256, 0  左下角
                // BOTTOMRIGHT, 0, 0  右下角
                // TOPLEFT, 0.0, -0.003  左上角
                // TOPRIGHT, -0.0914, -0.003125  右上角
                constant string Anchor
                // FDF(框架定义) 背景
                // 变量类型为字符串,如(官方默认提供)
                // "EscMenuBackground"  Esc菜单背景
                // "EscMenuBlankBackground"  Esc菜单空白背景
                // "EscMenuEditBoxBackground"  Esc菜单输入框背景
                // "MultiboardBackground"  多面板背景
                // "MultiboardMinimizeButtonDisabled"  禁用多面板最小化按钮
                // "EscMenuButtonBackground"  Esc菜单按钮背景
                // "EscMenuButtonDisabledPushedBackground"  禁用Esc菜单按钮背景(按下时)
                // "EscMenuCheckBoxPushedBackground"  Esc菜单复选框背景(按下时)
                // "HeroAgilityIcon"  英雄敏捷图标
                // "HeroIntelligenceIcon"  英雄智力图标
                // "QuestDialogCompletedBackground"  任务完成对话框背景
                // "UI\Widgets\BattleNet\bnet-inputbox-back.blp"  输入框按钮背景
                // "UI\Widgets\BattleNet\bnet-mainmenu-clans-disabled.blp"  禁用战队主菜单
                constant string BackdropBackground
                // FDF(框架定义) 背景插入
                // 变量类型为实数,默认值如(官方默认提供)
                // 0.0 0.0 0.01 0.0
                // 0.0 0.01 0.0 0.0
                // 0.0025 0.0025 0.0025 0.0025
                // 0.003 0.003 0.003 0.003
                constant string BackdropBackgroundInsets
                // FDF(框架定义) 背景大小
                // 变量类型为实数,默认值(官方默认提供),如 0.128
                constant string BackdropBackgroundSize
                // FDF(框架定义) 背景混合
                constant string BackdropBlendAll
                // FDF(框架定义) 背景底部文件
                // 变量类型为字符串,如(官方默认提供)
                // "UI\Widgets\HeavyBorderBottom.blp"  加粗底边
                // "UI\Widgets\LightBorderBottom.blp"  高亮底边
                // "UI\Widgets\ButtonCorners.blp"  按钮边框样式(怀疑是圆角方角)
                // "UI\Widgets\LightBorderCorners.blp"  高亮边框
                constant string BackdropBottomFile
                // FDF(框架定义) 背景边框文件
                // 变量类型为字符串,如(官方默认提供)
                // "BL|BR|B"
                // "UL|UR|T"
                constant string BackdropCornerFile
                // FDF(框架定义) 背景边框标志
                // 变量类型为实数,如(官方默认提供)
                // 0.0125,0.006,0.008,0.0155
                constant string BackdropCornerFlags
                // FDF(框架定义) 背景边框尺寸
                constant string BackdropCornerSize
                // FDF(框架定义) 背景边文件
                // 变量类型为字符串,如(官方默认提供)
                // "EscMenuBorder"  ESC菜单边框
                // "EscMenuEditBoxBorder"  ESC菜单输入框边框
                // "EscMenuButtonBorder"  ESC菜单按钮边框
                // "CinematicBorder"  电影边框
                // "EscMenuButtonDisabledPushedBorder"  禁用Esc菜单按钮边框(按下时)
                // "EscMenuButtonPushedBorder"  Esc菜单按钮边框(按下时)
                // "UI\Glues\ScoreScreen\scorescreen-buttonbackground.blp"  得分屏按钮背景
                // "UI\Widgets\BattleNet\bnet-dialoguebox-border.blp"  对话框边框
                // "UI\widgets\BattleNet\bnet-tooltip-border.blp"  提示工具边框
                // "UI\Widgets\Glues\GlueScreen-Button1-BackdropBorder-Disabled.blp"  黏合屏按钮1背景框(禁用)
                // "UI\Widgets\Glues\GlueScreen-Button1-BackdropBorder-DisabledDown.blp"  黏合屏按钮1背景框(禁用按下)
                // "UI\Widgets\Glues\GlueScreen-Button1-BorderedBackdropBorder-Disabled.blp"  黏合屏按钮1背景框(禁用)
                // "UI\Widgets\Glues\GlueScreen-Button2-BackdropBorder-Disabled.blp"  黏合按钮2背景框(禁用)
                constant string BackdropEdgeFile
                // FDF(框架定义) 背景半侧文件
                constant string BackdropHalfSides
                // FDF(框架定义) 背景左侧文件
                // 变量类型为字符串,如(官方默认提供)
                // "UI\Widgets\ButtonLeft.blp"  左按钮
                constant string BackdropLeftFile
                // FDF(框架定义) 背景镜像
                constant string BackdropMirrored
                // FDF(框架定义) 背景右侧文件
                // 变量类型为字符串,如(官方默认提供)
                // "UI\Widgets\HeavyBorderRight.blp"  加粗右边框
                constant string BackdropRightFile
                // FDF(框架定义) 背景平铺
                constant string BackdropTileBackground
                // FDF(框架定义) 背景顶部文件
                // 变量类型为字符串,如(官方默认提供)
                // "UI\Widgets\ButtonTop.blp"  顶部按钮
                constant string BackdropTopFile
                // FDF(框架定义) 背景艺术
                // 变量类型为字符串,如(官方默认提供)
                // "UI\Glues\BattleNet\BattlenetLoginGlue\BattlenetLoginGlue.mdl"  战网登录
                // "UI\Glues\BattleNet\BattleNetTeamLevelBar\BattleNetTeamLevelBar.mdl"  战网战队等级栏
                constant string BackgroundArt
                // FDF(框架定义) 栏纹理
                // 变量类型为字符串,如(官方默认提供)
                // "SimpleBuildTimeIndicator"  简易建造时间指示器
                constant string BarTexture
                // FDF(框架定义) 按钮文本偏移(按下时)
                // 支持变量实数和带f的实数(f意义不明)
                // -0.0015f -0.0015f
                // 0.001 -0.001
                constant string ButtonPushedTextOffset
                // FDF(框架定义) 按钮文本
                // 变量类型为字符串,如(官方默认提供)
                // "AddFriendButtonText"  添加好友按钮文本
                // "AdvancedOptionsButtonText"  高级设置按钮文本
                constant string ButtonText
                // FDF(框架定义) 聊天框边框尺寸
                // 变量类型为实数,如 0.01
                constant string ChatDisplayBorderSize
                // FDF(框架定义) 聊天框输入框
                // 变量类型为字符串,如 "BattleNetChatDisplayEditBoxTemplate"  战网聊天框输入框模板
                constant string ChatDisplayEditBox
                // FDF(框架定义) 聊天框高亮
                // 变量类型为实数,如 0.01
                constant string ChatDisplayLineHeight
                // FDF(框架定义) 聊天框滚动条
                // 变量类型为字符串,如 "BattleNetChatDisplayScrollBarTemplate"  战网聊天框滚动条模板
                constant string ChatDisplayScrollBar
                // FDF(框架定义) 复选框选中高亮
                // 变量类型为字符串,如(官方默认提供)
                // "BattleNetRadioButtonHighlightTemplate"  战网单选按钮高亮模板
                // "EscMenuRadioButtonHighlightTemplate"  菜单单选按钮高亮模板
                constant string CheckBoxCheckHighlight
                // FDF(框架定义)禁用复选框选中高亮
                // 变量类型为字符串,如(官方默认提供)
                // "BattleNetDisabledRadioButtonHighlightTemplate"  禁用战网单选按钮选中高亮模板
                // "EscMenuDisabledCheckHighlightTemplate"  禁用菜单单选按钮选中高亮模板
                constant string CheckBoxDisabledCheckHighlight
                // FDF(框架定义) 选中纹理
                // 变量类型为字符串,如(官方默认提供) "ReplayCheckBoxCheck"  录像复选框选中
                constant string CheckedTexture
                // FDF(框架定义) 控制背景
                // 变量类型为字符串,如(官方默认提供)
                // "ActionMenuBackdrop"  活动菜单背景
                // "AdvancedPopupMenuBackdrop"  高级弹出菜单背景
                constant string ControlBackdrop
                // FDF(框架定义) 禁用控制背景
                // 变量类型为字符串,如(官方默认提供)
                // "BattleNetCheckBoxDisabledBackdrop"  禁用战网复选框背景
                // "BattleNetPopupMenuDisabledBackdropTemplate"  禁用战网弹出菜单背景
                constant string ControlDisabledBackdrop
                // FDF(框架定义) 禁用控制背景(按下时)
                constant string ControlDisabledPushedBackdrop
                // FDF(框架定义) 控制焦点高亮
                // 变量类型为字符串,如(官方默认提供)
                // "CampaignCameraButtonFocusHighlightTemplate"  战役镜头按钮焦点高亮模板
                // "IconicButtonFocusHighlightTemplate"  图标按钮焦点高亮模板
                constant string ControlFocusHighlight
                // FDF(框架定义) 控制鼠标悬停高亮
                // 变量类型为字符串,如(官方默认提供)
                // "BorderedButtonMouseOverHighlightTemplate"  背景按钮鼠标悬停高亮模板
                // "ButtonMouseOverHighlightTemplate"  按钮鼠标悬停高亮模板
                constant string ControlMouseOverHighlight
                // FDF(框架定义) 控制背景(按下时)
                // 变量类型为字符串,如(官方默认提供)
                // "BattleNetRadioButtonPushedBackdrop"  战网单选按钮背景(按下时)
                // "BorderedButtonPushedBackdropTemplate"  背景按钮背景模板(按下时)
                constant string ControlPushedBackdrop
                // FDF(框架定义) 控制快捷键
                // 变量类型为字符串,如(官方默认提供)
                // "BNET_LADDER_SHORTCUT"
                // "BNET_PASSWORD_RECOVERY_SHORTCUT"
                constant string ControlShortcutKey
                // FDF(框架定义) 控制尺寸
                // 变量类型为字符串,如(官方默认提供)
                // "AUTOTRACK|HIGHLIGHTONFOCUS|HIGHLIGHTONMOUSEOVER"  自动跟踪|焦点高亮|鼠标悬停高亮
                // "AUTOTRACK|HIGHLIGHTONMOUSEOVER"  自动跟踪|鼠标悬停高亮
                // "AUTOTRACK"  自动跟踪
                constant string ControlStyle
                // FDF(框架定义) 装饰文件名称
                constant string DecorateFileNames
                // FDF(框架定义) 对话框背景
                // 变量类型为字符串,如(官方默认提供)
                // "BattleNetDialogBackdropTemplate"  战网对话框背景模板
                // "CustomFilterDialogBackdrop"  自定义对话框背景
                constant string DialogBackdrop
                // FDF(框架定义) 禁用状态提示
                // 变量类型为字符串,如(官方默认提供)
                // "UpperButtonBarButtonDisabledTextTemplate" "ALLIES"  左上方默认按纽栏按钮禁用状态提示模板-盟友
                // "UpperButtonBarButtonDisabledTextTemplate" "CHAT"  左上方默认按纽栏按钮禁用状态提示模板-聊天
                constant string DisabledText
                // FDF(框架定义) 禁用状态纹理
                // 变量类型为字符串,如(官方默认提供) "UpperMenuButtonDisabledBackground"  左上方默认按纽栏按钮禁用状态背景
                constant string DisabledTexture
                // FDF(框架定义) 输入框尺寸
                // 变量类型为实数,如 0.009
                constant string EditBorderSize
                // FDF(框架定义) 输入框光标颜色
                // 变量类型为红绿蓝三色实数组,如 1.0 1.0 1.0
                constant string EditCursorColor
                // FDF(框架定义) 输入框文本控件
                // 变量类型为字符串,如(官方默认提供) "AccountNameEditBoxText"  账户名输入框文本
                constant string EditTextFrame
                // FDF(框架定义) 文件
                // 变量类型为字符串,如(官方默认提供)
                // "ConsoleTexture01"  控制台纹理
                // "ConsoleTexture03"  控制台纹理
                // "ConsoleTexture04"  控制台纹理
                // "ConsoleTexture05"  控制台纹理
                // "ConsoleTexture06"  控制台纹理
                // "GoldIcon"  金矿图标
                // "HeroStrengthIcon"  英雄力量图标
                // "LumberIcon"  木材图标
                // "SimpleBuildTimeIndicatorBorder"  简易建造时间指示器
                constant string File
                // FDF(框架定义) 字体(似乎包含字号)
                // 变量类型为字符串,如(官方默认提供)
                // "InfoPanelTextFont", 0.0085  信息面板字体
                // "InfoPanelTextFont",0.01  信息面板字体
                // "MasterFont",0.008  大师字体
                // "MasterFont",0.01  大师字体
                constant string Font
                // FDF(框架定义) 字体颜色
                // 变量类型为红绿蓝三色+透明度实数组,如 0.99 0.827 0.0705 1.0
                constant string FontColor
                // FDF(框架定义) 字体禁用状态颜色
                // 变量类型为红绿蓝三色+透明度实数组,如 0.5 0.5 0.5 1.0
                constant string FontDisabledColor
                // FDF(框架定义) 字体标识(限制输入字符数或文本类型)
                // 变量类型为字符串,如(官方默认提供)
                // "FIXEDSIZE"  固定长度
                // "PASSWORDFIELD"  密码类型(输入任意字符都显示成 **)
                constant string FontFlags
                // FDF(框架定义) 字体高亮颜色
                // 变量类型为红绿蓝三色+透明度实数组,如 1.0 1.0 1.0 1.0
                constant string FontHighlightColor
                // FDF(框架定义) 字体(两端)对齐
                // JUSTIFYCENTER  居中对齐
                // JUSTIFYLEFT  左对齐
                // JUSTIFYRIGHT  右对齐
                constant string FontJustificationH
                // FDF(框架定义) 字体两端边距
                // 变量类型为左右两端边距实数组,如
                // 0.0 -0.001
                // 0.0 -0.002
                // 0.0 0.0
                // 0.01 0.0
                // 0.01 0.001
                constant string FontJustificationOffset
                // FDF(框架定义) 字体(垂直)对齐
                // JUSTIFYTOP  顶部对齐
                // JUSTIFYMIDDLE  中部对齐
                // JUSTIFYBOTTOM  底部对齐
                constant string FontJustificationV
                // FDF(框架定义) 字体阴影颜色
                // 变量类型为红绿蓝三色+透明度实数组,如 0.0 0.0 0.0 0.9
                constant string FontShadowColor
                // FDF(框架定义) 字体阴影偏移
                // 变量类型为 X Y 双向偏移量实数组,如 0.001 -0.001
                constant string FontShadowOffset
                // FDF(框架定义) 控件
                // 变量类型为字符串,如(官方默认提供) "GLUEBUTTON" "HeroSelectorButton"  黏合按钮 英雄选择按钮
                constant string Frame
                // FDF(框架定义) 控件字体(似乎包含字号)
                // "EscMenuTextFont", 0.011, ""  ESC菜单文本字体
                // "InfoPanelTextFont", 0.011, "",  信息面板字体
                // "InfoPanelTextFont", 0.013, "",  信息面板字体
                // "MasterFont", 0.007, "",  大师字体
                // "MasterFont", 0.01, "",  大师字体
                // "MasterFont", 0.011, "",  大师字体
                // "MasterFont", 0.01171, "",  大师字体
                constant string FrameFont
                // FDF(框架定义) 高度
                // 支持变量实数和带f的实数(f意义不明),如 0.024,0.48f
                constant string Height
                // FDF(框架定义) 高亮字母文件
                // 变量类型为字符串,如(官方默认提供)
                // "EscMenuButtonMouseOverHighlight"  ESC菜单按钮鼠标悬停高亮
                // "EscMenuCheckBoxCheckHighlight"  ESC菜单复选框选中高亮
                // "EscMenuDisabledRadioButtonSelectedHighlight"  禁用ESC菜单单选按钮选中高亮
                // "UI\Glues\ScoreScreen\scorescreen-tab-hilight.blp"  得分屏选项卡高亮
                // "UI\Widgets\Glues\GlueScreen-Button-KeyboardHighlight.blp"  得分屏按钮按键高亮
                // "UI\Widgets\Glues\GlueScreen-Checkbox-Check.blp"  得分屏检查栏选中
                // "UI\Widgets\Glues\GlueScreen-Checkbox-CheckDisabled.blp"  禁用得分屏检查栏选中
                // "UI\Widgets\Glues\GlueScreen-RadioButton-ButtonDisabled.blp"  禁用得分屏单选按钮
                constant string HighlightAlphaFile
                // FDF(框架定义) 高亮字母模式
                // 变量类型为字符串,如(官方默认提供)
                // "ADD"  添加
                // "BLEND"  混合
                constant string HighlightAlphaMode
                // FDF(框架定义) 高亮颜色
                // 变量类型为红绿蓝三色+透明度实数组,如
                // 0.0 0.0 1.0 0.1
                // 1.0 0.0 0.0 0.2
                constant string HighlightColor
                // FDF(框架定义) 高亮文本
                // 变量类型为字符串,如(官方默认提供)
                // "UpperButtonBarButtonHighlightTextTemplate" "KEY_ALLIES"  左上方默认按纽栏按钮高亮文本提示模板-关键词 盟友
                // "UpperButtonBarButtonHighlightTextTemplate" "KEY_CHAT"  左上方默认按纽栏按钮高亮文本提示模板-关键词 聊天
                constant string HighlightText
                // FDF(框架定义) 高亮类型
                // 变量类型为字符串,如(官方默认提供)
                // "FILETEXTURE"  文件纹理
                // "SHADE"  遮罩
                constant string HighlightType
                // FDF(框架定义) 包含文件
                // 变量类型为字符串,如(官方默认提供) "UI\FrameDef\UI\InfoPanelTemplates.fdf"  信息面板模板文件
                constant string IncludeFile
                // FDF(框架定义) 层级(图层)
                constant string Layer
                // FDF(框架定义) 层级样式(图层样式)
                // 变量类型为字符串,如(官方默认提供)
                // "NOSHADING"  无遮蔽
                // "IGNORETRACKEVENTS"  忽略可追溯事件
                // "NOSHADING|IGNORETRACKEVENTS"  无遮蔽|忽略可追溯事件
                constant string LayerStyle
                // FDF(框架定义) 列表边框
                // 变量类型为实数,如 0.01
                constant string ListBoxBorder
                // FDF(框架定义) 列表滚动条边框
                // 变量类型为字符串,如(官方默认提供) "StandardListBoxScrollBarTemplate"  标准列表滚动条模板
                constant string ListBoxScrollBar
                // FDF(框架定义) 菜单边框
                // 变量类型为实数,如 0.009
                constant string MenuBorder
                // FDF(框架定义) 菜单项目
                // 变量类型为字符串,如(官方默认提供)
                // "NORMAL", -2  普通(-2)
                // "WINDOW_MODE_WINDOWED", -2  跟随系统(-2)
                constant string MenuItem
                // FDF(框架定义) 菜单项目高度
                // 变量类型为实数,如 0.0082, 0.011
                constant string MenuItemHeight
                // FDF(框架定义) 菜单文本高亮颜色
                // 变量类型为红绿蓝三色+透明度实数组,如 0.99 0.827 0.0705 1.0
                constant string MenuTextHighlightColor
                // FDF(框架定义) 普通文本
                // 变量类型为字符串,如(官方默认提供)
                // "UpperButtonBarButtonTextTemplate" "KEY_ALLIES"  左上方默认按纽栏按钮文本模板-关键词 盟友
                // "UpperButtonBarButtonTextTemplate" "KEY_MENU"  左上方默认按纽栏按钮文本模板-关键词 菜单
                constant string NormalText
                // FDF(框架定义) 普通纹理
                // 变量类型为字符串,如(官方默认提供) "ReplayCheckBoxNormal"  普通录像复选框
                constant string NormalTexture
                // FDF(框架定义) 弹出指示符
                // 变量类型为字符串,如(官方默认提供)
                // "CampaignPopupMenuArrow"  战役弹出菜单指示符
                // "CustomPopupMenuArrow"  自定义弹出菜单指示符
                constant string PopupArrowFrame
                // FDF(框架定义) 弹出按钮插入
                // 变量类型为实数,如 0.01, 0.015
                constant string PopupButtonInset
                // FDF(框架定义) 弹出按钮
                // "TeamMemberRaceMenuMenu3"  队伍成员种族菜单
                // "TextureQualityPopupMenuMenu"  纹理材质弹出菜单
                constant string PopupMenuFrame
                // FDF(框架定义) 弹出(菜单)标题
                // 变量类型为字符串,如(官方默认提供)
                // "EscOptionsLightsPopupMenuTitle"  ESC设置弹出菜单常亮标题
                // "PopupMenuTitle"  弹出菜单标题
                // "ReplayVisionMenuTitle"  录像查看菜单标题
                // "TeamMemberPopupMenuTitle"  队伍成员弹出菜单标题
                constant string PopupTitleFrame
                // FDF(框架定义) 纹理(按下时)
                // 变量类型为字符串,如(官方默认提供) "UpperMenuButtonPushedBackground"  顶部菜单按钮背景(按下时)
                constant string PushedTexture
                // FDF(框架定义) 滚动条下滚动按钮
                // 变量类型为字符串,如(官方默认提供) "EscMenuScrollBarDecButton"  滚动条下滚动按钮
                constant string ScrollBarDecButtonFrame
                // FDF(框架定义) 滚动条上滚动按钮
                // 变量类型为字符串,如(官方默认提供) "EscMenuScrollBarIncButton"  滚动条上滚动按钮
                constant string ScrollBarIncButtonFrame
                // FDF(框架定义) 设置所有锚点
                constant string SetAllPoints
                // FDF(框架定义) 设置锚点
                // 变量组合,如(官方默认提供)
                // BOTTOM, "BuildTimeIndicator", TOP, 0.0, 0.00325  建造时间指示器
                // BOTTOM, "ChatDialog", BOTTOM, 0.0, 0.03  聊天对话框
                // BOTTOMLEFT, "AllyHeader", BOTTOMRIGHT, 0.004, 0.0  表头
                // BOTTOMLEFT, "BattleNetChatPanel", BOTTOMLEFT, 0.01125, 0.02125  战网聊天面板
                // BOTTOMRIGHT, "QuestListItem", BOTTOMRIGHT, -0.003, 0  任务列表项目
                // BOTTOMRIGHT, "AllianceDialog", BOTTOM, -0.003, 0.03  盟友对话框
                // CENTER, "GameSaveSplashDialog", CENTER, 0.0, 0.0  游戏保存启动画面对话框
                // CENTER, "IconBackdrop4", BOTTOMRIGHT, -0.007625, 0.006875  图标背景
                // LEFT, "AllianceAcceptButton", RIGHT, 0.005, 0.0  盟友接受按钮
                // LEFT, "AlliedVictoryCheckBox", RIGHT, 0.01, 0.0  联盟胜利复选框
                // RIGHT, "ChannelEnterButton", LEFT, -0.02, 0.0  绑定端口按钮
                // RIGHT, "ChatDialog", TOPRIGHT, -0.031, -0.0765  聊天对话框
                // TOP, "AnonSearchTitle", BOTTOM, 0.0, -0.005  立即搜索标题
                // TOP, "AuthorLabel", BOTTOM, 0.0, -0.004  作者商标
                // TOPLEFT, "LeaderboardTitle", BOTTOMLEFT, -0.02f, -0.002  排行榜标题
                // TOPLEFT,"WindowModeBackdrop",BOTTOMLEFT, 0.0, 0.01375  跟随系统模式背景
                // TOPRIGHT, "AdvancedOptionsPane", TOPRIGHT, -0.004, -0.03  高级设置框
                constant string SetPoint
                // FDF(框架定义) 滑块初始值
                // 变量类型为实数,如 0, 1
                constant string SliderInitialValue
                // FDF(框架定义) 轮播图水平布局
                constant string SliderLayoutHorizontal
                // FDF(框架定义) 轮播图垂直布局
                constant string SliderLayoutVertical
                // FDF(框架定义) 滑块最大值
                // 变量类型为实数,如 2, 4
                constant string SliderMaxValue
                // FDF(框架定义) 滑块最小值
                // 变量类型为实数,如 0
                constant string SliderMinValue
                // FDF(框架定义) 滑块滑动距离(格数)
                // 变量类型为实数,如 1
                constant string SliderStepSize
                // FDF(框架定义) 滑块拇指按钮
                // 变量类型为字符串,如(官方默认提供)
                // "BattleNetThumbButton"  战网滑块拇指按钮
                // "EscMenuScrollThumbButton"  ESC菜单滑块拇指按钮
                // "StandardThumbButton"  标准滑块拇指按钮
                constant string SliderThumbButtonFrame
                // FDF(框架定义) 字串符
                // 变量类型为字符串,如(官方默认提供) "UpperButtonBarButtonTextTemplate"  弹出按钮栏按钮文本模板
                constant string constant string
                // FDF(框架定义) 字串符列表
                constant string constant stringList
                // FDF(框架定义) 选项卡焦点(默认值)
                constant string TabFocusDefault
                // FDF(框架定义) 选项卡焦点-下一个
                // 变量类型为字符串,如(官方默认提供)
                // "AddProfileButton"  添加配置文件按钮
                // "BackButton"  返回按钮
                constant string TabFocusNext
                // FDF(框架定义) 选项卡焦点-推送
                constant string TabFocusPush
                // FDF(框架定义) 贴图坐标
                // 官方默认坐标如
                // 0, 0.33984375, 0, 0.125
                // 0, 1, 0.4140625, 1
                // 0.0, 0.6640625, 0.25, 0.421875
                // 0.0, 0.6640625, 0.75, 0.921875
                constant string TexCoord
                // FDF(框架定义) 文本
                // 变量类型为字串符,如 "30"
                constant string Text
                // FDF(框架定义) 文本区域插入
                // 变量类型为实数,如 0.005, 0.0
                constant string TextAreaInset
                // FDF(框架定义) 文本区域行间距
                // 变量类型为实数,如 0.001, 0.0015
                constant string TextAreaLineGap
                // FDF(框架定义) 文本区域行高度
                // 变量类型为实数,如 0.011, 0.015
                constant string TextAreaLineHeight
                // FDF(框架定义) 文本区域最大行数
                // 变量类型为整数,如 128, 32
                constant string TextAreaMaxLines
                // FDF(框架定义) 文本区域滚动条
                // 变量类型为字串符,如(官方默认提供) "ChatScrollBar"  聊天滚动条
                constant string TextAreaScrollBar
                // FDF(框架定义)文本长度
                // 变量类型为整数,如 8
                constant string TextLength
                // FDF(框架定义) 纹理
                // 继承于父类 "ResourceIconTemplate"  资源图标模板
                // 变量类型为字串符,如(官方默认提供) "InfoPanelIconAllyFoodIcon"  信息面板图标-盟友人口图标
                constant string Texture
                // FDF(框架定义) 使用活动上下文
                constant string UseActiveContext
                // FDF(框架定义) 高亮显示
                // 变量类型为字串符,如(官方默认提供) "UpperMenuButtonHighlight"  弹出菜单按钮高亮显示
                constant string UseHighlight
                // FDF(框架定义) 宽度
                // 支持变量实数和带f的实数(f意义不明),如 0.24, 0.417f
                constant string Width
        
        
        // 电影滤镜纹理
        
        
                // 电影滤镜纹理 白色迷雾
                // 是blp文件，需文件名带后缀
                constant string White_mask.blp
                // 电影滤镜纹理 黑色迷雾
                // 是blp文件，需文件名带后缀
                constant string Black_mask.blp
                // 电影滤镜纹理 薄雾滤镜
                // 是blp文件，需文件名带后缀
                constant string HazeFilter_mask.blp
                // 电影滤镜纹理 地面迷雾
                // 是blp文件，需文件名带后缀
                constant string GroundFog_mask.blp
                // 电影滤镜纹理 薄雾和迷雾
                // 是blp文件，需文件名带后缀
                constant string HazeAndFogFilter_Mask.blp
                // 电影滤镜纹理 对角线消减
                // 是blp文件，需文件名带后缀
                constant string DiagonalSlash_mask.blp
                // 电影滤镜纹理 梦境(边框模糊)
                // 是blp文件，需文件名带后缀
                constant string DreamFilter_Mask.blp
                // 电影滤镜纹理 冰
                // 是blp文件，需文件名带后缀
                constant string IceFilter_Mask.blp
                // 电影滤镜纹理 范围
                // 是blp文件，需文件名带后缀
                constant string Scope_Mask.blp
                // 电影滤镜纹理 兵!(字图)
                // 是blp文件，需文件名带后缀
                constant string SpecialPowMask.blp
                // 电影滤镜纹理 溅泼声!(字图)
                // 是blp文件，需文件名带后缀
                constant string SpecialSplatMask.blp
                // 电影滤镜纹理 幼年熊猫!(字图)
                // 是blp文件，需文件名带后缀
                constant string Panda-n-Cub.blp
        
        
        // 天气特效类型
        
        
                // 天气特效类型 白杨谷大雨
                constant string RAhr
                // 天气特效类型 白杨谷小雨
                constant string RAlr
                // 天气特效类型 达拉然之盾
                constant string MEds
                // 天气特效类型 地下城/地牢 蓝雾(厚)
                constant string FDbh
                // 天气特效类型 地下城/地牢 蓝雾(薄)
                constant string FDbl
                // 天气特效类型 地下城/地牢 绿雾(厚)
                constant string FDgh
                // 天气特效类型 地下城/地牢 绿雾(薄)
                constant string FDgl
                // 天气特效类型 地下城/地牢 红雾(厚)
                constant string FDrh
                // 天气特效类型 地下城/地牢 红雾(薄)
                constant string FDrl
                // 天气特效类型 地下城/地牢 白雾(厚)
                constant string FDwh
                // 天气特效类型 地下城/地牢 白雾(薄)
                constant string FDwl
                // 天气特效类型 洛丹伦大雨
                constant string RLhr
                // 天气特效类型 洛丹伦小雨
                constant string RLlr
                // 天气特效类型 诺森德的暴风雪
                constant string SNbs
                // 天气特效类型 诺森德大雪
                constant string SNhs
                // 天气特效类型 诺森德小雪
                constant string SNls
                // 天气特效类型 边缘之地大风
                constant string WOcw
                // 天气特效类型 边缘之地的风
                constant string WOlw
                // 天气特效类型 日光
                constant string LRaa
                // 天气特效类型 月光
                constant string LRma
                // 天气特效类型 大风
                constant string WNcw
        
        
        // 闪电类型
        
        
                // 闪电类型 闪电链 - 主
                constant string CLPB
                // 闪电类型 闪电链 - 次
                constant string CLSB
                // 闪电类型 汲取
                constant string DRAB
                // 闪电类型 生命汲取
                constant string DRAL
                // 闪电类型 魔法汲取
                constant string DRAM
                // 闪电类型 死亡之指
                constant string AFOD
                // 闪电类型 叉状闪电
                constant string FORK
                // 闪电类型 医疗波 - 主
                constant string HWPB
                // 闪电类型 医疗波 - 次
                constant string HWSB
                // 闪电类型 闪电攻击
                constant string CHIM
                // 闪电类型 魔法镣铐
                constant string LEAS
                // 闪电类型 法力燃烧
                constant string MBUR
                // 闪电类型 魔力之焰
                constant string MFPB
                // 闪电类型 灵魂锁链
                constant string SPLK
        
        
        // 地形设置
        
        
                // 地形设置 洛丹伦(夏)
                constant string LORDAERON_SUMMER
                // 地形设置 洛丹伦(秋)
                constant string LORDAERON_FALL
                // 地形设置 洛丹伦(冬)
                constant string LORDAERON_WINTER
                // 地形设置 贫瘠之地
                constant string BARRENS
                // 地形设置 白杨谷
                constant string ASHENVALE
                // 地形设置 费尔伍德
                constant string FELWOOD
                // 地形设置 诺森德
                constant string NORTHREND
                // 地形设置 城邦
                constant string CITYSCAPE
                // 地形设置 村庄
                constant string VILLAGE
                // 地形设置 村庄(秋)
                constant string VILLAGEFALL
                // 地形设置 地下城/地牢
                constant string DUNGEON
                // 地形设置 地底
                constant string DUNGEON2
                // 地形设置 达拉然
                constant string DALARAN
                // 地形设置 达拉然遗迹
                constant string DALARANRUINS
                // 地形设置 沉沦的遗迹
                constant string RUINS
                // 地形设置 冰封王座
                constant string ICECROWN
                // 地形设置 边缘之地
                constant string OUTLAND
                // 地形设置 黑色城堡
                constant string BLACKCITADEL
                // 地形设置 所有
                constant string ALL
        
        
        // 地表纹理
        
        
                // 地表纹理 洛丹伦(夏) - 泥地
                constant string Ldrt
                // 地表纹理 洛丹伦(夏) - 烂泥地
                constant string Ldro
                // 地表纹理 洛丹伦(夏) - 泥草地
                constant string Ldrg
                // 地表纹理 洛丹伦(夏) - 岩石
                constant string Lrok
                // 地表纹理 洛丹伦(夏) - 草地
                constant string Lgrs
                // 地表纹理 洛丹伦(夏) - 黑暗草地
                constant string Lgrd
                // 地表纹理 洛丹伦(秋) - 泥地
                constant string Fdrt
                // 地表纹理 洛丹伦(秋) - 烂泥地
                constant string Fdro
                // 地表纹理 洛丹伦(秋) - 泥草地
                constant string Fdrg
                // 地表纹理 洛丹伦(秋) - 岩石
                constant string Frok
                // 地表纹理 洛丹伦(秋) - 草地
                constant string Fgrs
                // 地表纹理 洛丹伦(秋) - 黑暗草地
                constant string Fgrd
                // 地表纹理 洛丹伦(冬) - 泥地
                constant string Wdrt
                // 地表纹理 洛丹伦(冬) - 烂泥地
                constant string Wdro
                // 地表纹理 洛丹伦(冬) - 雪草地
                constant string Wsng
                // 地表纹理 洛丹伦(冬) - 岩石
                constant string Wrok
                // 地表纹理 洛丹伦(冬) - 草地
                constant string Wgrs
                // 地表纹理 洛丹伦(冬) - 雪地
                constant string Wsnw
                // 地表纹理 贫瘠之地 - 泥地
                constant string Bdrt
                // 地表纹理 贫瘠之地 - 烂泥地
                constant string Bdrh
                // 地表纹理 贫瘠之地 - 鹅卵石
                constant string Bdrr
                // 地表纹理 贫瘠之地 - 泥草地
                constant string Bdrg
                // 地表纹理 贫瘠之地 - 沙漠
                constant string Bdsr
                // 地表纹理 贫瘠之地 - 黑暗沙漠
                constant string Bdsd
                // 地表纹理 贫瘠之地 - 岩石
                constant string Bflr
                // 地表纹理 贫瘠之地 - 草地
                constant string Bgrr
                // 地表纹理 白杨谷 - 泥地
                constant string Adrt
                // 地表纹理 白杨谷 - 烂泥地
                constant string Adrd
                // 地表纹理 白杨谷 - 草地
                constant string Agrs
                // 地表纹理 白杨谷 - 岩石
                constant string Arck
                // 地表纹理 白杨谷 - 长草
                constant string Agrd
                // 地表纹理 白杨谷 - 藤蔓
                constant string Avin
                // 地表纹理 白杨谷 - 泥草地
                constant string Adrg
                // 地表纹理 白杨谷 - 树叶
                constant string Alvd
                // 地表纹理 费尔伍德 - 泥地
                constant string Cdrt
                // 地表纹理 费尔伍德 - 烂泥地
                constant string Cdrd
                // 地表纹理 费尔伍德 - 毒沼
                constant string Cpos
                // 地表纹理 费尔伍德 - 岩石
                constant string Crck
                // 地表纹理 费尔伍德 - 藤蔓
                constant string Cvin
                // 地表纹理 费尔伍德 - 草地
                constant string Cgrs
                // 地表纹理 费尔伍德 - 树叶
                constant string Clvg
                // 地表纹理 诺森德 - 泥地
                constant string Ndrt
                // 地表纹理 诺森德 - 暗黑泥地
                constant string Ndrd
                // 地表纹理 诺森德 - 岩石
                constant string Nrck
                // 地表纹理 诺森德 - 草地
                constant string Ngrs
                // 地表纹理 诺森德 - 冰
                constant string Nice
                // 地表纹理 诺森德 - 雪地
                constant string Nsnw
                // 地表纹理 诺森德 - 雪岩地
                constant string Nsnr
                // 地表纹理 城邦 - 泥地
                constant string Ydrt
                // 地表纹理 城邦 - 烂泥地
                constant string Ydtr
                // 地表纹理 城邦 - 黑大理石
                constant string Yblm
                // 地表纹理 城邦 - 砖
                constant string Ybtl
                // 地表纹理 城邦 - 方形地砖
                constant string Ysqd
                // 地表纹理 城邦 - 圆形地砖
                constant string Yrtl
                // 地表纹理 城邦 - 草地
                constant string Ygsb
                // 地表纹理 城邦 - 修剪的草地
                constant string Yhdg
                // 地表纹理 城邦 - 白大理石
                constant string Ywmb
                // 地表纹理 村庄 - 泥地
                constant string Vdrt
                // 地表纹理 村庄 - 烂泥地
                constant string Vdrr
                // 地表纹理 村庄 - 庄稼
                constant string Vcrp
                // 地表纹理 村庄 - 卵石路
                constant string Vcbp
                // 地表纹理 村庄 - 碎石路
                constant string Vstp
                // 地表纹理 村庄 - 矮草
                constant string Vgrs
                // 地表纹理 村庄 - 岩石
                constant string Vrck
                // 地表纹理 村庄 - 长草
                constant string Vgrt
                // 地表纹理 村庄(秋) - 泥地
                constant string Qdrt
                // 地表纹理 村庄(秋) - 烂泥地
                constant string Qdrr
                // 地表纹理 村庄(秋) - 庄稼
                constant string Qcrp
                // 地表纹理 村庄(秋) - 卵石路
                constant string Qcbp
                // 地表纹理 村庄(秋) - 碎石路
                constant string Qstp
                // 地表纹理 村庄(秋) - 矮草
                constant string Qgrs
                // 地表纹理 村庄(秋) - 岩石
                constant string Qrck
                // 地表纹理 村庄(秋) - 长草
                constant string Qgrt
                // 地表纹理 达拉然 - 泥地
                constant string Xdrt
                // 地表纹理 达拉然 - 烂泥地
                constant string Xdtr
                // 地表纹理 达拉然 - 黑大理石
                constant string Xblm
                // 地表纹理 达拉然 - 砖块
                constant string Xbtl
                // 地表纹理 达拉然 - 方形地砖
                constant string Xsqd
                // 地表纹理 达拉然 - 圆形地砖
                constant string Xrtl
                // 地表纹理 达拉然 - 草地
                constant string Xgsb
                // 地表纹理 达拉然 - 修剪的草地
                constant string Xhdg
                // 地表纹理 达拉然 - 白大理石
                constant string Xwmb
                // 地表纹理 地下城/地牢 - 泥地
                constant string Ddrt
                // 地表纹理 地下城/地牢 - 砖
                constant string Dbrk
                // 地表纹理 地下城/地牢 - 红色石头
                constant string Drds
                // 地表纹理 地下城/地牢 - 熔岩裂缝
                constant string Dlvc
                // 地表纹理 地下城/地牢 - 熔岩
                constant string Dlav
                // 地表纹理 地下城/地牢 - 黑暗岩石
                constant string Ddkr
                // 地表纹理 地下城/地牢 - 灰色石头
                constant string Dgrs
                // 地表纹理 地下城/地牢 - 方形地砖
                constant string Dsqd
                // 地表纹理 地底 - 泥地
                constant string Gdrt
                // 地表纹理 地底 - 砖
                constant string Gbrk
                // 地表纹理 地底 - 红色石头
                constant string Grds
                // 地表纹理 地底 - 熔岩裂缝
                constant string Glvc
                // 地表纹理 地底 - 熔岩
                constant string Glav
                // 地表纹理 地底 - 黑暗岩石
                constant string Gdkr
                // 地表纹理 地底 - 灰色石头
                constant string Ggrs
                // 地表纹理 地底 - 方形地砖
                constant string Gsqd
                // 地表纹理 沉沦的遗迹 - 泥地
                constant string Zdrt
                // 地表纹理 沉沦的遗迹 - 烂泥地
                constant string Zdtr
                // 地表纹理 沉沦的遗迹 - 泥草地
                constant string Zdrg
                // 地表纹理 沉沦的遗迹 - 碎砖
                constant string Zbks
                // 地表纹理 沉沦的遗迹 - 沙地
                constant string Zsan
                // 地表纹理 沉沦的遗迹 - 大砖块
                constant string Zbkl
                // 地表纹理 沉沦的遗迹 - 圆形地砖
                constant string Ztil
                // 地表纹理 沉沦的遗迹 - 草地
                constant string Zgrs
                // 地表纹理 沉沦的遗迹 - 黑暗草地
                constant string Zvin
                // 地表纹理 冰封王座 - 泥地
                constant string Idrt
                // 地表纹理 冰封王座 - 烂泥地
                constant string Idtr
                // 地表纹理 冰封王座 - 黑暗冰
                constant string Idki
                // 地表纹理 冰封王座 - 黑砖块
                constant string Ibkb
                // 地表纹理 冰封王座 - 刻字砖块
                constant string Irbk
                // 地表纹理 冰封王座 - 砖铺
                constant string Itbk
                // 地表纹理 冰封王座 - 冰
                constant string Iice
                // 地表纹理 冰封王座 - 黑方块
                constant string Ibsq
                // 地表纹理 冰封王座 - 雪地
                constant string Isnw
                // 地表纹理 边缘之地 - 泥地
                constant string Odrt
                // 地表纹理 边缘之地 - 轻泥地
                constant string Odtr
                // 地表纹理 边缘之地 - 烂泥地
                constant string Osmb
                // 地表纹理 边缘之地 - 干裂土地
                constant string Ofst
                // 地表纹理 边缘之地 - 平石头
                constant string Olgb
                // 地表纹理 边缘之地 - 岩石
                constant string Orok
                // 地表纹理 边缘之地 - 轻石头
                constant string Ofsl
                // 地表纹理 边缘之地 - 深谷
                constant string Oaby
                // 地表纹理 黑色城堡 - 泥地
                constant string Kdrt
                // 地表纹理 黑色城堡 - 轻泥地
                constant string Kfsl
                // 地表纹理 黑色城堡 - 烂泥地
                constant string Kdtr
                // 地表纹理 黑色城堡 - 平石头
                constant string Kfst
                // 地表纹理 黑色城堡 - 碎砖
                constant string Ksmb
                // 地表纹理 黑色城堡 - 大砖块
                constant string Klgb
                // 地表纹理 黑色城堡 - 方形地砖
                constant string Ksqt
                // 地表纹理 黑色城堡 - 黑砖块
                constant string Kdkt
                // 地表纹理 达拉然遗迹 - 泥地
                constant string Jdrt
                // 地表纹理 达拉然遗迹 - 烂泥地
                constant string Jdtr
                // 地表纹理 达拉然遗迹 - 黑大理石
                constant string Jblm
                // 地表纹理 达拉然遗迹 - 砖块
                constant string Jbtl
                // 地表纹理 达拉然遗迹 - 方形地砖
                constant string Jsqd
                // 地表纹理 达拉然遗迹 - 圆形地砖
                constant string Jrtl
                // 地表纹理 达拉然遗迹 - 草地
                constant string Jgsb
                // 地表纹理 达拉然遗迹 - 修剪的草地
                constant string Jhdg
                // 地表纹理 达拉然遗迹 - 白大理石
                constant string Jwmb
                // 地表纹理 白杨谷 - 泥土悬崖
                constant string cAc2
                // 地表纹理 白杨谷 - 草地悬崖
                constant string cAc1
                // 地表纹理 贫瘠之地 - 沙地悬崖
                constant string cBc2
                // 地表纹理 贫瘠之地 - 草地悬崖
                constant string cBc1
                // 地表纹理 黑色城堡 - 泥土悬崖
                constant string cKc1
                // 地表纹理 黑色城堡 - 砖砌墙壁
                constant string cKc2
                // 地表纹理 城邦 - 泥土悬崖
                constant string cYc2
                // 地表纹理 城邦 - 方砖墙壁
                constant string cYc1
                // 地表纹理 达拉然 - 泥土悬崖
                constant string cXc2
                // 地表纹理 达拉然 - 方砖墙壁
                constant string cXc1
                // 地表纹理 达拉然遗迹 - 泥土悬崖
                constant string cJc2
                // 地表纹理 达拉然遗迹 - 方砖墙壁
                constant string cJc1
                // 地表纹理 地下城 - 天然墙壁
                constant string cDc2
                // 地表纹理 地下城 - 石砖墙壁
                constant string cDc1
                // 地表纹理 费尔伍德 - 泥土悬崖
                constant string cCc2
                // 地表纹理 费尔伍德 - 草地悬崖
                constant string cCc1
                // 地表纹理 冰封王座 - 石砌墙壁
                constant string cIc2
                // 地表纹理 冰封王座 - 雪地悬崖
                constant string cIc1
                // 地表纹理 洛丹伦(秋) - 泥土悬崖
                constant string cFc2
                // 地表纹理 洛丹伦(秋) - 草地悬崖
                constant string cFc1
                // 地表纹理 洛丹伦(夏) - 泥土悬崖
                constant string cLc2
                // 地表纹理 洛丹伦(夏) - 草地悬崖
                constant string cLc1
                // 地表纹理 洛丹伦(冬) - 草地悬崖
                constant string cWc2
                // 地表纹理 洛丹伦(冬) - 雪地悬崖
                constant string cWc1
                // 地表纹理 诺森德- 泥土悬崖
                constant string cNc2
                // 地表纹理 诺森德- 雪地悬崖
                constant string cNc1
                // 地表纹理 边缘之地- 深渊
                constant string cOc1
                // 地表纹理 边缘之地- 泥土悬崖
                constant string cOc2
                // 地表纹理 沉沦的遗迹 - 泥土悬崖
                constant string cZc2
                // 地表纹理 沉沦的遗迹 - 石砌墙壁
                constant string cZc1
                // 地表纹理 地底 - 天然墙壁
                constant string cGc2
                // 地表纹理 地底 - 砖砌墙壁
                constant string cGc1
                // 地表纹理 村庄 - 泥土悬崖
                constant string cVc2
                // 地表纹理 村庄 - 厚草地悬崖
                constant string cVc1
                // 地表纹理 村庄(秋) - 泥土悬崖
                constant string cQc2
                // 地表纹理 村庄(秋) - 厚草地悬崖
                constant string cQc1
        
        
        // 地形形状/刷子类型
        
        
                // 地形形状/刷子类型 圆形
                constant string CIRCLE
                // 地形形状/刷子类型 方形
                constant string SQUARE
        
        
        // 图像类型
        
        
                // 图像类型 阴影
                constant string SHADOW
                // 图像类型 选择
                constant string SELECTION
                // 图像类型 指示器
                constant string INDICATOR
                // 图像类型 闭塞标志
                constant string OCCLUSIONMARK
                // 图像类型 地面纹理变化
                constant string UBERSPLAT
                // 图像类型 最顶端
                constant string LAST
        
        
        // 地表纹理变化
        
        
                // 地表纹理变化 测试
                constant string TEST
                // 地表纹理变化 洛丹伦(夏)泥地小
                constant string LSDS
                // 地表纹理变化 洛丹伦(夏)泥地中
                constant string LSDM
                // 地表纹理变化 洛丹伦(夏)泥地大
                constant string LSDL
                // 地表纹理变化 人类弹坑
                constant string HCRT
                // 地表纹理变化 不死族金矿
                constant string UDSU
                // 地表纹理变化 中立城市小建筑(死亡)
                constant string DNCS
                // 地表纹理变化 群体传送
                constant string HMTP
                // 地表纹理变化 回城卷轴
                constant string SCTP
                // 地表纹理变化 召唤护身符
                constant string AMRC
                // 地表纹理变化 黑暗转换
                constant string DRKC
                // 地表纹理变化 兽族小建筑(死亡)
                constant string DOSB
                // 地表纹理变化 兽族中建筑(死亡)
                constant string DOMB
                // 地表纹理变化 兽族大建筑(死亡)
                constant string DOLB
                // 地表纹理变化 人类小建筑(死亡)
                constant string DHSB
                // 地表纹理变化 人类中建筑(死亡)
                constant string DHMB
                // 地表纹理变化 人类大建筑(死亡)
                constant string DHLB
                // 地表纹理变化 不死族小建筑(死亡)
                constant string DUSB
                // 地表纹理变化 不死族中建筑(死亡)
                constant string DUMB
                // 地表纹理变化 不死族大建筑(死亡)
                constant string DULB
                // 地表纹理变化 暗夜精灵小古树(死亡)
                constant string DNSB
                // 地表纹理变化 暗夜精灵中古树(死亡)
                constant string DNMB
                // 地表纹理变化 暗夜精灵小古迹(死亡)
                constant string DNSA
                // 地表纹理变化 暗夜精灵中古迹(死亡)
                constant string DNMA
                // 地表纹理变化 人类小建筑
                constant string HSMA
                // 地表纹理变化 人类中建筑
                constant string HMED
                // 地表纹理变化 人类大建筑
                constant string HLAR
                // 地表纹理变化 兽族小建筑
                constant string OSMA
                // 地表纹理变化 兽族中建筑
                constant string OMED
                // 地表纹理变化 兽族大建筑
                constant string OLAR
                // 地表纹理变化 不死族建筑
                constant string USMA
                // 地表纹理变化 不死族建筑
                constant string UMED
                // 地表纹理变化 不死族建筑
                constant string ULAR
                // 地表纹理变化 暗夜精灵小古树
                constant string ESMA
                // 地表纹理变化 暗夜精灵中古树
                constant string EMDA
                // 地表纹理变化 暗夜精灵小建筑
                constant string ESMB
                // 地表纹理变化 暗夜精灵中建筑
                constant string EMDB
                // 地表纹理变化 城镇大厅
                constant string HTOW
                // 地表纹理变化 城堡
                constant string HCAS
                // 地表纹理变化 金矿
                constant string NGOL
                // 地表纹理变化 雷霆一击
                constant string THND
                // 地表纹理变化 恶魔之门
                constant string NDGS
                // 地表纹理变化 荆棘之盾
                constant string CLTS
                // 地表纹理变化 烈焰风暴1
                constant string HFS1
                // 地表纹理变化 烈焰风暴2
                constant string HFS2
                // 地表纹理变化 兽族地洞
                constant string USBR
                // 地表纹理变化 娜迦族大建筑
                constant string NLAR
                // 地表纹理变化 娜迦族中建筑
                constant string NMED
                // 地表纹理变化 黑暗之门(面向西南)
                constant string DPSW
                // 地表纹理变化 黑暗之门(面向东南)
                constant string DPSE
                // 地表纹理变化 火山
                constant string NVOL
                // 地表纹理变化 火山口
                constant string NVCR
        
        
        // 主题音乐
        
        
                // 主题音乐 阿尔塞斯的主题曲
                constant string ARTHAS
                // 主题音乐 血精灵的主题曲
                constant string BLOODELF
                // 主题音乐 伙伴的友谊
                constant string COMRADESHIP
                // 主题音乐 制作人员
                constant string CREDITS
                // 主题音乐 黑暗代言人
                constant string DARKAGENTS
                // 主题音乐 黑暗胜利
                constant string DARKVICTORY
                // 主题音乐 毁灭
                constant string DOOM
                // 主题音乐 英雄胜利
                constant string HEROIC_VICTORY
                // 主题音乐 人族1
                constant string HUMAN1
                // 主题音乐 人族2
                constant string HUMAN2
                // 主题音乐 人族3
                constant string HUMAN3
                // 主题音乐 人族X1
                constant string HUMANX1
                // 主题音乐 人族失败
                constant string DEFEAT_HUMAN
                // 主题音乐 人族胜利
                constant string VICTORY_HUMAN
                // 主题音乐 尤迪安的主题曲
                constant string ILLIDAN
                // 主题音乐 巫妖王的主题曲
                constant string LICHKING
                // 主题音乐 主要场景
                constant string MAINSCREEN
                // 主题音乐 主要场景X
                constant string MAINSCREENX
                // 主题音乐 娜迦的主题曲
                constant string NAGA
                // 主题音乐 暗夜精灵族1
                constant string NIGHTELF1
                // 主题音乐 暗夜精灵族2
                constant string NIGHTELF2
                // 主题音乐 暗夜精灵族3
                constant string NIGHTELF3
                // 主题音乐 暗夜精灵族X1
                constant string NIGHTELFX1
                // 主题音乐 暗夜精灵族失败
                constant string DEFEAT_NIGHTELF
                // 主题音乐 暗夜精灵族胜利
                constant string VICTORY_NIGHTELF
                // 主题音乐 兽族1
                constant string ORC1
                // 主题音乐 兽族2
                constant string ORC2
                // 主题音乐 兽族3
                constant string ORC3
                // 主题音乐 兽族X1
                constant string ORCX1
                // 主题音乐 兽族失败
                constant string DEFEAT_ORC
                // 主题音乐 半兽人的主题曲
                constant string ORC_THEME
                // 主题音乐 兽族胜利
                constant string VICTORY_ORC
                // 主题音乐 追击
                constant string PURSUIT
                // 主题音乐 神秘哀伤
                constant string SADMYSTERY
                // 主题音乐 紧张
                constant string TENSION
                // 主题音乐 悲剧降临
                constant string TRAGICCONFRONTATION
                // 主题音乐 不死族1
                constant string UNDEAD1
                // 主题音乐 不死族2
                constant string UNDEAD2
                // 主题音乐 不死族3
                constant string UNDEAD3
                // 主题音乐 不死族 X1
                constant string UNDEADX1
                // 主题音乐 不死族失败
                constant string DEFEAT_UNDEAD
                // 主题音乐 不死族胜利
                constant string VICTORY_UNDEAD
        
        
        // 环境音效
        
        
        // 白天环境音效
        
                // 白天环境音效 白杨谷
                constant string AshenvaleDay
                // 白天环境音效 贫瘠之地
                constant string BarrensDay
                // 白天环境音效 黑色城堡
                // 黑色城堡有两个，分别是 WEconstant string_AMBIENTTHEMEDAY_K WEconstant string_AMBIENTTHEMEDAY_O
                constant string BlackCitadelDay
                // 白天环境音效 城邦
                constant string CityScapeDay
                // 白天环境音效 达拉然
                constant string DalaranDay
                // 白天环境音效 达拉然遗迹
                constant string DalaranRuinsDay
                // 白天环境音效 地下城/地牢
                constant string DungeonDay
                // 白天环境音效 费尔伍德
                constant string FelwoodDay
                // 白天环境音效 冰封王座
                constant string IceCrownDay
                // 白天环境音效 洛丹伦(秋)
                constant string LordaeronFallDay
                // 白天环境音效 洛丹伦(夏)
                constant string LordaeronSummerDay
                // 白天环境音效 洛丹伦(冬)
                constant string LordaeronWinterDay
                // 白天环境音效 诺森德
                constant string NorthrendDay
                // 白天环境音效 沉沦的遗迹
                constant string SunkenRuinsDay
                // 白天环境音效 村庄
                constant string VillageDay
                // 白天环境音效 村庄(秋)
                constant string VillageFallDay
                // 白天环境音效 地底
                constant string DungeonCaveDay
        
        
        // 夜晚环境音效
        
                // 夜晚环境音效 白杨谷
                constant string AshenvaleNight
                // 夜晚环境音效 贫瘠之地
                constant string BarrensNight
                // 夜晚环境音效 黑色城堡
                // 黑色城堡有两个，分别是 WEconstant string_AMBIENTTHEMENIGHT_K WEconstant string_AMBIENTTHEMENIGHT_O
                constant string BlackCitadelNight
                // 夜晚环境音效 城邦
                constant string CityScapeNight
                // 夜晚环境音效 达拉然
                constant string DalaranNight
                // 夜晚环境音效 达拉然遗迹
                constant string DalaranRuinsNight
                // 夜晚环境音效 地下城/地牢
                constant string DungeonNight
                // 夜晚环境音效 费尔伍德
                constant string FelwoodNight
                // 夜晚环境音效 冰封王座
                constant string IceCrownNight
                // 夜晚环境音效 洛丹伦(秋)
                constant string LordaeronFallNight
                // 夜晚环境音效 洛丹伦(夏)
                constant string LordaeronSummerNight
                // 夜晚环境音效 洛丹伦(冬)
                constant string LordaeronWinterNight
                // 夜晚环境音效 诺森德
                constant string NorthrendNight
                // 夜晚环境音效 沉沦的遗迹
                constant string SunkenRuinsNight
                // 夜晚环境音效 村庄
                constant string VillageNight
                // 夜晚环境音效 村庄(秋)
                constant string VillageFallNight
                // 夜晚环境音效 地底
                constant string DungeonCaveNight
        
        
        
        // 天空盒子模型文件名
        
        
                // 天空盒子模型文件名 暴风雪的天空
                // 是mdl格式，需文件名带后缀
                constant string BlizzardSky.mdl
                // 天空盒子模型文件名 达拉然的天空
                // 是mdl格式，需文件名带后缀
                constant string DalaranSky.mdl
                // 天空盒子模型文件名 费尔伍德的天空
                // 是mdl格式，需文件名带后缀
                constant string FelwoodSky.mdl
                // 天空盒子模型文件名 迷雾的天空
                // 是mdl格式，需文件名带后缀
                constant string FoggedSky.mdl
                // 天空盒子模型文件名 一般的天空
                // 是mdl格式，需文件名带后缀
                constant string SkyLight.mdl
                // 天空盒子模型文件名 洛丹伦的秋天的天空
                // 是mdl格式，需文件名带后缀
                constant string LordaeronFallSky.mdl
                // 天空盒子模型文件名 洛丹伦的夏天的天空
                // 是mdl格式，需文件名带后缀
                constant string LordaeronSummerSky.mdl
                // 天空盒子模型文件名 洛丹伦的冬天的天
                // 是mdl格式，需文件名带后缀
                constant string LordaeronWinterSky.mdl
                // 天空盒子模型文件名 洛丹伦的冬天的天空 (亮绿色)
                // 是mdl格式，需文件名带后缀
                constant string LordaeronWinterSkyBrightGreen.mdl
                // 天空盒子模型文件名 洛丹伦的冬天的天空 (粉红色)
                // 是mdl格式，需文件名带后缀
                constant string LordaeronWinterSkyPink.mdl
                // 天空盒子模型文件名 洛丹伦的冬天的天空 (紫色)
                // 是mdl格式，需文件名带后缀
                constant string LordaeronWinterSkyPurple.mdl
                // 天空盒子模型文件名 洛丹伦的冬天的天空 (红色)
                // 是mdl格式，需文件名带后缀
                constant string LordaeronWinterSkyRed.mdl
                // 天空盒子模型文件名 洛丹伦的冬天的天空 (黄色)
                // 是mdl格式，需文件名带后缀
                constant string LordaeronWinterSkyYellow.mdl
                // 天空盒子模型文件名 边缘之地的天空
                // 是mdl格式，需文件名带后缀
                constant string Outland_Sky.mdl
        
        
        
        // 颜色值
        
        
                // 颜色值 红色（玩家1配色）
                // 注意开头添加|，结尾添加|r，三色值： 255, 3, 3
                constant string CffFF0000 
                // 颜色值 蓝色（玩家2配色）
                // 注意开头添加|，结尾添加|r，三色值：0, 66, 255
                constant string Cff0064FF
                // 颜色值 青色（玩家3配色）
                // 注意开头添加|，结尾添加|r，三色值：28, 230, 185
                constant string Cff1BE7BA
                // 颜色值 紫色（玩家4配色）
                // 注意开头添加|，结尾添加|r，三色值：84, 0, 129
                constant string Cff550081
                // 颜色值 黄色（玩家5配色）
                // 注意开头添加|，结尾添加|r，三色值：255, 252, 0
                constant string CffFFFC00
                // 颜色值 橙色（玩家6配色）
                // 注意开头添加|，结尾添加|r，三色值：254, 138, 14
                constant string CffFF8A0D
                // 颜色值 绿色（玩家7配色）
                // 注意开头添加|，结尾添加|r，三色值：32, 192, 0
                constant string Cff21BF00
                // 颜色值 粉色（玩家8配色）
                // 注意开头添加|，结尾添加|r，三色值：229, 91, 176
                constant string CffE45CAF
                // 颜色值 深灰色（玩家9配色）
                // 注意开头添加|，结尾添加|r，三色值：149, 150, 151
                constant string Cff949696
                // 颜色值 深蓝色（玩家10配色）
                // 注意开头添加|，结尾添加|r，三色值：126, 191, 241
                constant string Cff7EBFF1
                // 颜色值 浅绿色（玩家11配色）
                // 注意开头添加|，结尾添加|r，三色值：16, 98, 70
                constant string Cff106247
                // 颜色值 棕色（玩家12配色）
                // 注意开头添加|，结尾添加|r，三色值：78, 42, 3
                constant string Cff4F2B05
                // 颜色值 褐红色（玩家13配色）
                // 注意开头添加|，结尾添加|r，三色值：155, 0, 0
                constant string Cff9C0000
                // 颜色值 深蓝色（玩家14配色）
                // 注意开头添加|，结尾添加|r，三色值：0, 0, 195
                constant string Cff0000C3
                // 颜色值 蓝绿色（玩家15配色）
                // 注意开头添加|，结尾添加|r，三色值：0, 234, 255
                constant string Cff00EBFF
                // 颜色值 紫罗兰色（玩家16配色）
                // 注意开头添加|，结尾添加|r，三色值：190, 0, 254
                constant string CffBD00FF
                // 颜色值 小麦色（玩家17配色）
                // 注意开头添加|，结尾添加|r，三色值：235, 205, 135
                constant string CffECCD87
                // 颜色值 桃色（玩家18配色）
                // 注意开头添加|，结尾添加|r，三色值：248, 164, 139
                constant string CffF7A58B
                // 颜色值 薄荷色（玩家19配色）
                // 注意开头添加|，结尾添加|r，三色值：191, 255, 128
                constant string CffBFFF81
                // 颜色值 淡紫色（玩家20配色）
                // 注意开头添加|，结尾添加|r，三色值：220, 185, 235
                constant string CffDBB9EB
                // 颜色值 煤焦油色（玩家21配色）
                // 注意开头添加|，结尾添加|r，三色值：80, 79, 85
                constant string Cff4F5055
                // 颜色值 雪白色（玩家22配色）
                // 注意开头添加|，结尾添加|r，三色值：235, 240, 255
                constant string CffECF0FF
                // 颜色值 祖母绿色（玩家23配色）
                // 注意开头添加|，结尾添加|r，三色值：0, 120, 30
                constant string Cff00781E
                // 颜色值 花生色（玩家24配色）
                // 注意开头添加|，结尾添加|r，三色值：164, 111, 51
                constant string CffA57033
                // 颜色值 黑棕色（中立敌对玩家配色）
                // 注意开头添加|，结尾添加|r，三色值：50, 50, 50
                constant string Cff323232
                // 颜色值 黑色
                // 注意开头添加|，结尾添加|r，三色值：0, 0, 0
                constant string Cff000000
                // 颜色值 象牙黑色
                // 注意开头添加|，结尾添加|r，三色值：41, 36, 33
                constant string Cff292421
                // 颜色值 白色
                // 注意开头添加|，结尾添加|r，三色值：255, 255, 255
                constant string Cffffffff
                // 颜色值 淡灰色
                // 注意开头添加|，结尾添加|r，三色值：220, 220, 220
                constant string Cffdcdcdc
                // 颜色值 深灰色
                // 注意开头添加|，结尾添加|r，三色值：169, 169, 169
                constant string Cffa9a9a9
                // 颜色值 金色
                // 注意开头添加|，结尾添加|r，三色值：255, 215, 0
                constant string Cffffd700
                // 颜色值 道奇蓝色
                // 注意开头添加|，结尾添加|r，三色值：30, 144, 255
                constant string Cff1e90ff
                // 颜色值 孔雀蓝色
                // 注意开头添加|，结尾添加|r，三色值：51, 161, 201
                constant string Cff33a1c9
                // 颜色值 嫩绿色
                // 注意开头添加|，结尾添加|r，三色值：0, 255, 127
                constant string Cff00ff7f
                // 颜色值 翠绿色
                // 注意开头添加|，结尾添加|r，三色值：0, 201, 87
                constant string Cff00c957
                // 颜色值 土耳其玉色
                // 注意开头添加|，结尾添加|r，三色值：0, 199, 140
                constant string Cff00c78c
                // 颜色值 碧绿色
                // 注意开头添加|，结尾添加|r，三色值：127, 255, 212
                constant string Cff7fffd4
                // 颜色值 靛青色
                // 注意开头添加|，结尾添加|r，三色值：8, 46, 84
                constant string Cff082e54
                // 颜色值 番茄红色
                // 注意开头添加|，结尾添加|r，三色值：255, 99, 71
                constant string Cffff6347
                // 颜色值 桔色
                // 注意开头添加|，结尾添加|r，三色值：255, 69, 0
                constant string Cffff4500
                // 颜色值 珊瑚色
                // 注意开头添加|，结尾添加|r，三色值：225, 127, 80
                constant string Cffe17f50
                // 颜色值 玫瑰红色
                // 注意开头添加|，结尾添加|r，三色值：188, 143, 143
                constant string Cffbc8f8f
                // 颜色值 肉色
                // 注意开头添加|，结尾添加|r，三色值：255, 125, 64
                constant string Cffff7d40
                 // 颜色值 湖紫色
                // 注意开头添加|，结尾添加|r，三色值：153, 51, 250
                constant string Cff9933fa
                // 颜色值 紫罗兰色
                // 注意开头添加|，结尾添加|r，三色值：138, 43, 226
                constant string Cff8a2be2


        endglobals