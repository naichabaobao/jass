globals
// 物理编辑器及额外变量对照表(绝大部分)
// 物编以重置版为基准(v1.36),部分添加了1.27a译文,从1.27a获取了极少量重置版缺失数据
// 物编包含单位、物品、可破坏物、技能、魔法效果（buff）、科技的四字码，不含地表装饰物，包含技能ID（纯数字变量不一定能识别，请手动搜索，缺少1.29后的新技能）及命令串
// 额外变量：地表纹理，地表纹理变化、地形设置，地形形状/刷子类型，天气特效，昼夜环境音效，主题曲，闪电特效，自定义UI/控件的框架定义，UI/控件的框架类型，图像类型，电影滤镜纹理等


// 单位(很可能齐了)

        // 人族对战英雄

        // 大法师
        integer Hamg
        // 圣骑士
        integer Hpal
        // 山丘之王
        integer Hmkg
        // 血魔法师
        integer Hblm


        // 人族战役英雄及特殊人物

        // 阿尔萨斯
        integer Hart
        // 阿尔萨斯(使用霜之哀伤)
        integer Harf
        // 吉安娜
        integer Hjai
        // 穆拉丁·铜须
        integer Hmbr
        // 乌瑟尔
        integer Huht
        // 安东尼达斯
        integer Hgam
        // 安东尼达斯
        integer Hant
        // 麦迪文
        integer nmed
        // 麦迪文(乌鸦形态)
        integer nmdm
        // 加里瑟斯/加里索斯大人
        integer Hlgr
        // 海军上将普罗德摩尔
        integer Hapm
        // 兽人克星达格伦/达贡兽族屠杀者
        integer Hdgo
        // 尼古拉斯·布赞勋爵/尼科拉斯大人
        integer Hpb1
        // 格雷戈里·埃德蒙森爵士/格雷戈里爵士
        integer Hpb2
        // 生命使者哈拉克/哈拉生命使者
        integer Hhkl
        // 维护者玛古洛斯/马格罗斯守御者
        integer Hmgd
        // 希雷诺斯/西里诺克斯
        integer nser


        // 人族对战单位

        // 矮人直升机
        integer hgyr
        // 人族步兵
        integer hfoo
        // 狮鹫骑士
        integer hgry
        // 人族骑士
        integer hkni
        // 矮人迫机炮
        integer hmtm
        // 农民
        integer hpea
        // 牧师
        integer hmpr
        // 矮人火枪手
        integer hrif
        // 女巫(人族)
        integer hsor
        // 攻城坦克
        integer hmtt
        // 攻城坦克(火箭弹幕升级后)
        integer hrtt
        // 民兵
        integer hmil
        // 魔法破坏者(破法)
        integer hspt
        // 龙鹰骑士
        integer hdhw
        // 水元素(1级)
        integer hwat
        // 水元素(2级)
        integer hwt2
        // 水元素(3级)
        integer hwt3
        // 凤凰(人族)
        integer hphx
        // 凤凰蛋(人族)
        integer hpxe


        // 人族战役单位

        // 教士(人族)
        integer nchp
        // 水术师(人族)
        integer nhym
        // 队长(人族)/船长(人族)
        integer hcth
        // 狱卒卡塞恩(人族)
        integer njks
        // 人类运输船
        integer hbot
        // 人类护卫舰
        integer hdes
        // 人类战舰
        integer hbsh
        // 小孩
        integer nvlk
        // 小孩(2)
        integer nvk2
        // 村民(女性)
        integer nvlw
        // 村民(男性)
        integer nvil
        // 村民(男性2)
        integer nvl2


        // 人族建筑

        // 狮鹫笼
        integer hgra
        // 兵营(人族)
        integer hbar
        // 铁匠铺
        integer hbla
        // 城镇大厅(人族一本基地)
        integer htow
        // 主城(人族二本基地)
        integer hkee
        // 城堡(人族三本基地)
        integer hcas
        // 农场
        integer hhou
        // 国王祭坛
        integer halt
        // 伐木场
        integer hlum
        // 神秘圣地
        integer hars
        // 哨塔
        integer hwtw
        // 炮塔(人族)
        integer hctw
        // 圣塔(人族)(编辑器无此单位)
        integer htws
        // 防御塔(人族)
        integer hgtw
        // 神秘之塔(人族)
        integer hatw
        // 车间
        integer harm
        // 神秘宝藏室
        integer hvlt


        // 人族战役建筑

        // 传送门(人族)
        integer hprt
        // 人类船坞
        integer hshy
        // 寒冰宝盒
        integer nitb
        // 水果摊
        integer nfrt
        // 魔法宝库
        integer nmgv
        // 达拉然警戒塔
        integer ndgt
        // 谷仓
        integer ngwr


        // 兽族对战英雄

        // 剑圣
        integer Obla
        // 先知
        integer Ofar
        // 牛头人酋长
        integer Otch
        // 暗影猎手
        integer Oshd


        // 兽族战役英雄及特殊人物

        // 格罗玛什·地狱咆哮
        integer Ogrh
        // 格罗玛什·地狱咆哮(喝下恶魔之血/着魔的)
        integer Opgh
        // 黑石氏族剑圣
        integer Nbbc
        // 萨尔
        integer Othr
        // 萨尔(无座骑)
        // @version 1.32
        integer Oths
        // 加索克
        integer ogrk
        // 达克苏尔
        integer odkt
        // 贝恩
        integer obai
        // 沃金
        integer ovlj
        // 马索格
        integer omtg
        // 纳兹格雷尔
        integer onzg
        // 工程师加兹鲁维
        integer negz
        // 米纱
        integer nmsh
        // 凯恩·血蹄(过场动画)
        integer Otcc
        // 凯恩·血蹄
        integer Ocbh
        // 凯恩·血蹄(资料片)
        integer Ocb2
        // 古尔丹
        integer Ogld
        // 德雷克塔尔
        integer Odrt
        // 洛坎
        integer Orkn
        // 萨穆罗
        integer Osam
        // 陈·风暴烈酒
        integer Nsjs
        // 雷克萨
        integer Orex


        // 兽族对战单位

        // 兽族步兵(编辑器无此单位)
        integer oang
        // 投石车
        integer ocat
        // 巫医
        integer odoc
        // 兽族步兵
        integer ogru
        // 猎头者
        integer ohun
        // 狂战士(猎头升级后)
        integer otbk
        // 科多兽
        integer okod
        // 苦工
        integer opeo
        // 狼骑兵
        integer orai
        // 萨满祭司
        integer oshm
        // 牛头人
        integer otau
        // 驭风者
        integer owyv
        // 蝙蝠骑士
        integer otbr
        // 灵魂行者
        integer ospw
        // 灵魂行者(虚无形态)
        integer ospm
        // 监视结界(单位)
        integer nwad
        // 警戒结界(单位)
        integer oeye
        // 治疗结界(单位)
        integer ohwd
        // 毒蛇结界(1级)(单位)
        integer osp1
        // 毒蛇结界(2级)(单位)
        integer osp2
        // 毒蛇结界(3级)(单位)
        integer osp3
        // 毒蛇结界(4级)(单位)
        integer osp4
        // 静滞陷阱(单位)
        integer otot
        // 幽灵狼(1级)
        integer osw1
        // 恐狼(2级)
        integer osw2
        // 影狼(3级)
        integer osw3


        // 兽族建筑

        // 风暴祭坛
        integer oalt
        // 兵营(兽族)
        integer obar
        // 兽栏
        integer obea
        // 战争磨坊
        integer ofor
        // 大厅(兽人一本基地)
        integer ogre
        // 据点(兽人二本基地)
        integer ostr
        // 堡垒(兽人三本基地)
        integer ofrt
        // 灵魂小屋
        integer osld
        // 兽人地洞
        integer otrb
        // 牛头人图腾
        integer otto
        // 了望塔
        integer owtw
        // 巫毒小屋
        integer ovln


        // 魔兽争霸2兽族单位

        // 食人魔法师
        integer nomg
        // 红色巨龙
        integer nrwm
        // 地精自爆工兵
        integer ngsp
        // 地精飞艇
        integer nzep
        // 兽人术士
        integer nw2w
        // 猪圈
        integer npgf


        // 兽族战役单位

        // 奴隶主
        integer owad
        // 兽人督军
        integer owar
        // 邪兽人步兵
        integer nchg
        // 邪兽人术士
        integer nchw
        // 邪兽人狼骑兵
        integer nchr
        // 邪兽人苦工
        integer ncpn
        // 邪兽人科多兽
        integer nckb
        // 邪兽人地洞(混乱)
        integer ocbw
        // 兽人船坞
        integer ocbw
        // 巨龙栖地
        integer ndrb
        // 鲜血之泉
        integer nbfl
        // 被污染的生命之泉
        integer ndfl
        // 能量产生器
        integer npgr
        // 驭风者牢笼(1)
        integer nwc1
        // 驭风者牢笼(2)
        integer nwc2
        // 驭风者牢笼(3)
        integer nwc3
        // 驭风者牢笼(4)
        integer nwc4
        // 支柱(单位)
        integer nspc
        // 科多兽(无骑手)
        integer oosc
        // 灵魂驭风者
        integer oswy
        // 驭风者(无骑手)
        integer ownr
        // 地精爆破者
        integer ngbl
        // 兽人运输船
        integer obot
        // 兽人护卫舰
        integer odes
        // 兽人毁灭战舰
        integer ojgn


        // 不死族对战英雄

        // 死亡骑士
        integer Udea
        // 恐惧魔王
        integer Udre
        // 巫妖
        integer Ulic
        // 地穴领主
        integer Ucrl


        // 不死族战役英雄及人物

        // 玛尔加尼斯
        integer Umal
        // 提克迪奥斯
        integer Utic
        // 阿兹加洛
        integer Npld
        // 迪瑟洛克
        integer Udth
        // 玛诺洛斯
        integer Nman
        // 阿克蒙德
        integer Uwar
        // 基尔加丹
        integer Nklj
        // 基尔加丹(过场动画)
        integer Nkjx
        // 克尔苏加德(巫妖)
        integer Uktl
        // 克尔苏加德(巫妖、过场动画)
        integer Uclc
        // 巫妖王(过场动画)
        integer nzlc
        // 巴纳扎尔
        integer Ubal
        // 希尔瓦娜斯
        integer Usyl
        // 瓦里玛萨斯
        integer Uvar
        // 达文格尔
        integer Uvng
        // 阿努巴拉克
        integer Uanb
        // 阿尔萨斯(邪恶)
        integer Uear


        // 不死族对战单位

        // 憎恶
        integer uabo
        // 侍僧
        integer uaco
        // 女妖
        integer uban
        // 地穴恶魔
        integer ucry
        // 冰霜巨龙
        integer ufro
        // 石像鬼
        integer ugar
        // 石像鬼石像形态
        integer ugrm
        // 食尸鬼
        integer ugho
        // 清道夫(绞肉机)
        integer umtw
        // 通灵师(亡灵男巫)
        integer unec
        // 影魔(阴影)
        integer ushd
        // 黑曜石雕像
        integer uobs
        // 毁灭者
        integer ubsp
        // 骷髅战士
        integer uske
        // 骷髅法师
        integer uskm
        // 钻地的地穴恶魔
        integer ucrm
        // 钻地的腐尸甲虫(2级)
        integer ucsB
        // 钻地的腐尸甲虫(3级)
        integer ucsC
        // 腐尸甲虫(1级)
        integer ucs1
        // 腐尸甲虫(2级)
        integer ucs2
        // 腐尸甲虫(3级)
        integer ucs3
        // 疾病之云(单位)
        integer uplg
        // 蝗虫(单位)
        integer uloc
        // 石像鬼石像形态
        integer ugrm


        // 不死族建筑

        // 闹鬼金矿
        integer ugol
        // 黑暗祭坛
        integer uaod
        // 埋骨地
        integer ubon
        // 某种尖塔(不死族)(编辑器无此单位)
        integer ugsp
        // 浮空城(大墓地)
        integer unpl
        // 亡者大厅
        integer unp1
        // 黑色城堡
        integer unp2
        // 献祭深渊
        integer usap
        // 地穴(不死族兵营)
        integer usep
        // 屠宰场
        integer uslh
        // 诅咒神殿
        integer utod
        // 通灵塔
        integer uzig
        // 幽魂之塔
        integer uzg1
        // 蛛魔之塔(冰塔)
        integer uzg2
        // 坟场
        integer ugrv
        // 遗物陵墓
        integer utom


        // 不死族战役单位

        // 僵尸
        integer nzom
        // 僵尸(女性)
        // @version 1.32
        integer nzof
        // 亡灵运输船
        integer ubot
        // 亡灵护卫舰
        integer udes
        // 亡灵战舰
        integer uubs
        // 邪灵空艇
        integer uarb
        // 憎恶(过场动画)
        integer uabc


        // 不死族战役建筑

        // 神龛
        integer nshr
        // 恶魔之门
        integer ndmg
        // 被污染的谷仓
        integer ngni
        // 霜之哀伤底座
        integer nfrm
        // 召唤之书底座
        integer nbsm
        // 亡灵船坞
        integer ushp


        // 暗夜精灵族对战英雄

        // 恶魔猎手
        integer Edem
        // 恶魔猎手(变身形态)
        integer Edmm
        // 丛林守护者
        integer Ekee
        // 月之女祭司
        integer Emoo
        // 守望者
        integer Ewar


        // 暗夜精灵族战役英雄及人物

        // 塞纳留斯
        integer Ecen
        // 伊利丹
        integer Eill
        // 伊利丹(邪恶)
        integer Eevi
        // 伊利丹(恶魔变形)
        integer Eilm
        // 伊利丹(恶魔变形)
        integer Eevm
        // 伊利丹(恶魔形态)
        integer Eidm
        // 玛維
        integer Ewrd
        // 玛法里奥
        integer Emfr
        // 玛法里奥
        integer Efur
        // 玛法里奥(未骑鹿)
        integer Emns
        // 泰栏德
        integer Etyr
        // 珊蒂斯(暗夜精灵族)
        integer eshd
        // 娜萨(暗夜精灵族)
        integer ensh
        // 萨里法斯(暗夜精灵族)
        integer nthr
        // 珊蒂斯(暗夜精灵族)
        integer eshd
        // 幽魂(暗夜精灵族)
        integer Ekgg


        // 暗夜精灵族单位

        // 小精灵
        integer ewsp
        // 弓箭手
        integer earc
        // 猛禽德鲁伊(鸟德)(人形)
        integer edot
        // 猛禽德鲁伊(鸟德)(鸦形)
        integer edtm
        // 投刃车
        integer ebal
        // 利爪德鲁伊(熊德)(人形)
        integer edoc
        // 利爪德鲁伊(熊德)(熊形)
        integer edcm
        // 树妖(小鹿)
        integer edry
        // 角鹰兽
        integer ehip
        // 角鹰兽骑士
        integer ehpr
        // 女猎手
        integer esen
        // 奇美拉
        integer echm
        // 山岭巨人
        integer emtg
        // 精灵龙
        integer efdr
        // 树人
        integer efon
        // 复仇的化身
        integer espv
        // 复仇之魂
        integer even
        // 猫头鹰斥候(1级)
        integer nowl
        // 猫头鹰斥候(2级)
        integer now2
        // 猫头鹰斥候(3级)
        integer now3


        // 暗夜精灵族战役单位

        // 暗夜精灵运输船
        integer etrs
        // 暗夜精灵护卫舰
        integer edes
        // 暗夜精灵战舰
        integer ebsh
        // 暗夜精灵信使
        integer ebsh
        // 囚车(暗夜精灵族)
        integer eilw
        // 哨兵(暗夜精灵族)
        integer nwat
        // 守望者(暗夜精灵族)
        integer nssn


        // 暗夜精灵族建筑

        // 知识古树
        integer eaoe
        // 战争古树
        integer eaom
        // 风之古树
        integer eaow
        // 生命之树(暗夜一本)
        integer etol
        // 纪元之树(暗夜二本)
        integer etoa
        // 永恒之树(暗夜三本)
        integer etoe
        // 守护古树
        integer etrp
        // 长者祭坛
        integer eate
        // 熊窝(暗夜精灵族)(编辑器无此单位)
        integer edol
        // 奇美拉栖木
        integer edos
        // 猎手大厅
        integer edob
        // 月亮井
        integer emow
        // 被缠绕的金矿
        integer egol
        // 奇迹古树
        integer eden


        // 暗夜精灵族战役建筑

        // 塞纳留斯之角底座
        integer nhcn
        // 威能之泉
        integer nfnp
        // 兽穴(暗夜精灵族)
        integer nbwd
        // 暗夜精灵渔村(单层)
        integer nfv2
        // 暗夜精灵渔村(双层、面向东南)
        integer nfv3
        // 暗夜精灵渔村(双层、面向西南)
        integer nfv0
        // 暗夜精灵渔村(有顶饰、面向东南)
        integer nfv4
        // 暗夜精灵渔村(有顶饰、面向西南)
        integer nfv1
        // 暗夜精灵渔村(被毁坏的)
        integer nvr1
        // 暗夜精灵渔村(被毁坏的)
        integer nvr2
        // 暗夜精灵渔村(被毁坏的)
        integer nvr0
        // 暗夜精灵船坞
        integer eshy
        // 附魔宝石方尖碑(暗夜精灵族)
        integer ngob


        //腐化的暗夜精灵族/萨特族单位

        // 萨特
        integer nsty
        // 萨特欺诈者
        integer nsat
        // 萨特影舞者
        integer nsts
        // 萨特窃魂者
        integer nstl
        // 萨特唤魔者
        integer nsth
        // 腐化的树人
        integer nenc
        // 剧毒树人
        integer nenp
        // 瘟疫树人
        integer nepl


        // 腐化的暗夜精灵族/萨特族建筑

        // 腐化的生命之树
        integer nctl
        // 腐化的纪元之树
        integer ncta
        // 腐化的永恒之树
        integer ncte
        // 腐化的月亮井
        integer ncmw
        // 腐化的守护古树
        integer ncap
        // 腐化的战争古树
        integer ncaw



        // 高等精灵族/血精灵族战役英雄及人物

        // 安纳斯特里亚·逐日者
        // @version 1.32
        integer Hssa
        // 萨洛瑞安·寻晨者
        // @version 1.32
        integer Hddt
        // 卡尔萨斯
        integer Hkal
        // 求知者凯伦
        // @version 1.32
        integer Haah
        // 婕娜拉·晓春
        // @version 1.32
        integer Hjnd
        // 希尔瓦娜斯·风行者
        integer Hvwd


        // 高等精灵族/血精灵族战役单位

        // 弓箭手(高等精灵)
        integer nhea
        // 剑士(高等精灵)
        integer hhes
        // 龙鹰(高等精灵)
        integer nws1
        // 信使(高等精灵)
        // @version 1.32
        integer hrrh
        // 特使(高等精灵)/使者(高等精灵)
        integer nemi
        // 高等精灵(女性)
        integer nhef
        // 高等精灵(男性)
        integer nhem
        // 血精灵副官/血精灵中尉
        integer nbel
        // 血精灵牧师
        // @version 1.32
        integer hbep
        // 血精灵女巫
        // @version 1.32
        integer hbes
        // 血精灵工人/工人(血精灵)
        integer nhew
        // 血精灵工程师
        integer nbee
        // 货车/车
        integer hbew


        // 高等精灵族/血精灵族战役建筑

        // 高等精灵农场
        integer nefm
        // 高等精灵农场1
        integer nef0
        // 高等精灵农场2
        integer nef1
        // 高等精灵农场3
        integer nef2
        // 高等精灵农场4
        integer nef3
        // 高等精灵农场5
        integer nef4
        // 高等精灵农场6
        integer nef5
        // 高等精灵农场7
        integer nef6
        // 高等精灵农场8
        integer nef7
        // 奥术瞭望台
        integer haro
        // 高等精灵警戒塔
        integer negt
        // 天怒塔
        integer negm
        // 地怒塔
        integer negf
        // 冰霜塔
        integer ndt1
        // 高级冰霜塔
        integer ndt2
        // 巨石塔
        integer nbt1
        // 高级巨石塔
        integer nbt2
        // 死亡塔
        integer ntt1
        // 高级死亡塔
        integer ntt2
        // 火焰塔
        integer nft1
        // 高级火焰塔
        integer nft2
        // 能量塔
        integer net1
        // 高级能量塔
        integer net2
        // 高等精灵兵营
        integer nheb


        // 达拉内尔族(破碎者)英雄

        // 阿卡玛(达拉内尔族(破碎者))
        integer Naka


        // 达拉内尔族(破碎者)单位

        // 德莱尼工人(达拉内尔族(破碎者))
        integer ndrl
        // 德莱尼守备官(达拉内尔族(破碎者))
        integer ndrn
        // 德莱尼追猎者(达拉内尔族(破碎者))
        integer ndrt
        // 德莱尼守卫(达拉内尔族(破碎者))
        integer ndrf
        // 德莱尼保护者(达拉内尔族(破碎者))
        integer ndrp
        // 德莱尼信徒(达拉内尔族(破碎者))
        integer ndrm
        // 德莱尼哨兵(达拉内尔族(破碎者))
        integer ndrw
        // 德莱尼先驱(达拉内尔族(破碎者))
        integer ndrh
        // 德莱尼屠魔者(达拉内尔族(破碎者))
        integer ndrd
        // 德莱尼先知(达拉内尔族(破碎者))
        integer ndrs
        // 德莱尼投石车(达拉内尔族(破碎者))
        integer ncat
        // 火蜥蜴
        integer ndsa


        // 达拉内尔族(破碎者)建筑

        // 先知陋室(达拉内尔族(破碎者))
        integer ndh4
        // 德莱尼兵营(达拉内尔族(破碎者))
        integer ndh3
        // 德莱尼避难所(达拉内尔族(破碎者))
        integer ndh2
        // 德莱尼小屋(达拉内尔族(破碎者))
        integer ndh0
        // 德莱尼小屋 2(达拉内尔族(破碎者))
        integer ndh1
        // 德莱尼酋长小屋(达拉内尔族(破碎者))
        integer ndch


        // 酒馆英雄

        // 炼金术士(普通形态)
        integer Nalc
        // 炼金术士(变形 1级)
        integer Nalm
        // 炼金术士(变形 2级)
        integer Nal2
        // 炼金术士(变形 3级)
        integer Nal3
        // 海巫(娜迦族)
        integer Nngs
        // 修补匠(常规形态)
        integer Ntin
        // 修补匠(变身)
        integer Nrob
        // 兽王
        integer Nbst
        // 深渊领主
        integer Nplh
        // 炎魔领主
        integer Nfir
        // 熊猫酒仙
        integer Npbm
        // 黑暗游侠
        integer Nbrn


        // 特殊英雄

        // 鱼人巫师
        integer Nmsr


        // 娜迦族英雄

        // 海巫(娜迦族)(非酒馆出售)
        integer Nswt
        // 瓦斯琪
        integer Hvsh


        // 娜迦族单位

        // 毒鳍龙
        integer nsnp
        // 纳迦海妖
        integer nnsw
        // 飞蛇
        integer nwgs
        // 龙龟(娜迦族)
        integer nhyc
        // 深海鱼人奴隶(娜迦族)
        integer nmpe
        // 纳迦侍从
        integer nmyr
        // 深海鱼人掠夺者(娜迦族)
        integer nnmg
        // 纳迦皇家卫兵
        integer nnrg
        // 召唤者(娜迦族)
        integer nnsu
        // 潜水的毒鳍龙
        integer nsbs
        // 潜水的纳迦侍从
        integer nmys
        // 潜水的纳迦皇家卫兵
        integer nnrs


        // 娜迦建筑

        // 潮汐神殿
        integer nntt
        // 珊瑚礁
        integer nnfm
        // 艾萨拉圣所
        integer nnsa
        // 孵化场
        integer nnsg
        // 潮汐守卫
        integer nntg
        // 深渊祭坛
        integer nnad


        // 小动物

        // 企鹅
        integer npng
        // 信天翁
        integer nalb
        // 兔子
        integer necr
        // 寄居蟹
        integer nhmc
        // 小蜥蜴
        integer nskk
        // 小鸡
        integer nech
        // 沙虫
        integer ndwm
        // 浣熊
        integer nrac
        // 海豹
        integer nsea
        // 狗
        integer ndog
        // 猪
        integer npig
        // 白色猫头鹰
        integer nsno
        // 秃鹫
        integer nvul
        // 绵羊
        integer nshe
        // 老鼠
        integer nrat
        // 螃蟹
        integer ncrb
        // 邪能野猪
        integer nfbr
        // 雄鹿
        integer nder
        // 青蛙
        integer nfro
        // 企鹅(水生的)
        integer npnw
        // 绵羊(两栖)
        integer nsha
        // 绵羊(水生的)
        integer nshf
        // 看门狗
        integer ngog


        // 中立单位

        // 恶魔猎犬
        integer nfel
        // 地狱火
        integer ninf
        // 末日守卫(标准)
        integer nbal
        // 末日守卫(召唤)
        integer nba2
        // 骷髅战士
        integer nske
        // 骷髅弓箭手
        integer nska
        // 骷髅神射手
        integer nskm
        // 燃烧弓箭手
        integer nskf
        // 巨型骷髅战士
        integer nskg
        // 骷髅弓箭手
        integer nsca
        // 骷髅战士
        integer nsce
        // 虾兵召唤物
        integer nlps
        // 水栖奴仆(1级)
        integer ncfs
        // 水栖奴仆(2级)
        integer ncws
        // 水栖奴仆(3级)
        integer ncns
        // 灵魂猪
        integer nspp
        // 熊怪
        integer nfrl
        // 熊怪追踪者
        integer nfrb
        // 熊怪萨满
        integer nfrs
        // 熊怪勇士
        integer nfrg
        // 巨熊怪战士
        integer nfra
        // 熊怪萨满长者
        integer nfre
        // 火蜥蜴幼崽
        integer nslh
        // 火蜥蜴
        integer nslr
        // 火蜥蜴元老
        integer nslv
        // 火蜥蜴领主
        integer nsll
        // 海龟幼崽
        integer ntrh
        // 海龟
        integer ntrs
        // 巨型海龟
        integer ntrt
        // 超巨型海龟
        integer ntrg
        // 龙龟
        integer ntrd
        // 强盗
        integer nban
        // 土匪
        integer nbrg
        // 流寇
        integer nrog
        // 打手
        integer nenf
        // 强盗头子
        integer nbld
        // 刺客
        integer nass
        // 黑色雏龙
        integer nbdr
        // 黑色幼龙
        integer nbdk
        // 黑色巨龙
        integer nbwm
        // 红色雏龙
        integer nrdk
        // 红色幼龙
        integer nrdr
        // 蓝色雏龙
        integer nadw
        // 蓝色幼龙
        integer nadk
        // 蓝色巨龙
        integer nadr
        // 蓝色龙人干涉者
        integer nbdm
        // 蓝色龙人战士
        integer nbdw
        // 蓝色龙人督察
        integer nbdo
        // 蓝色龙人学徒
        integer nbda
        // 蓝色龙人巫师
        integer nbds
        // 青铜雏龙
        integer nbzw
        // 青铜幼龙
        integer nbzk
        // 青铜巨龙
        integer nbzd
        // 绿色雏龙
        integer ngrw
        // 绿色幼龙
        integer ngdk
        // 绿色巨龙
        integer ngrd
        // 虚空龙幼崽
        integer nnht
        // 虚空幼龙
        integer nndk
        // 虚空龙
        integer nndr
        // 半人马弓箭手
        integer ncea
        // 半人马穿刺者
        integer ncim
        // 半人马先驱者
        integer ncen
        // 半人马苦工
        integer ncer
        // 半人马女巫/半人马巫师
        integer ncks
        // 半人马可汗
        integer ncnk
        // 黑暗巨魔高阶祭司
        integer ndth
        // 黑暗巨魔暗影祭司
        integer ndtp
        // 黑暗巨魔狂战士
        integer ndtb
        // 黑暗巨魔督军
        integer ndtw
        // 黑暗巨魔
        integer ndtr
        // 黑暗巨魔诱捕者
        integer ndtt
        // 森林巨魔高阶祭司
        integer nfsh
        // 森林巨魔暗影祭司
        integer nfsp
        // 森林巨魔
        integer nftr
        // 森林巨魔狂战士
        integer nftb
        // 森林巨魔诱捕者
        integer nftt
        // 森林巨魔督军
        integer nftk
        // 冰巨魔
        integer nitr
        // 冰巨魔狂战士
        integer nits
        // 冰巨魔诱捕者
        integer nitt
        // 冰巨魔督军
        integer nitw
        // 冰巨魔高阶祭司
        integer nith
        // 冰巨魔牧师
        integer nitp
        // 幽魂
        integer ngh1
        // 怨灵
        integer ngh2
        // 狂暴元素
        integer nelb
        // 暴怒元素
        integer nele
        // 泥土魔像
        integer ngrk
        // 岩石魔像
        integer ngst
        // 花岗岩魔像
        integer nggr
        // 战斗魔像
        integer narg
        // 战争魔像
        integer nwrg
        // 攻城魔像
        integer nsgg
        // 豺狼人偷猎者
        integer ngna
        // 豺狼人刺客
        integer ngns
        // 豺狼人
        integer ngno
        // 豺狼人蛮兵
        integer ngnb
        // 豺狼人看守
        integer ngnw
        // 豺狼人督察
        integer ngnv
        // 鹰身人斥候
        integer nhar
        // 鹰身人流寇
        integer nhrr
        // 鹰身人风女巫
        integer nhrw
        // 鹰身人风暴巫婆
        integer nhrh
        // 鹰身人女王
        integer nhrq
        // 堕落牧师
        integer nhfp
        // 欺诈者
        integer nhdc
        // 异教徒
        integer nhhr
        // 狗头人
        integer nkob
        // 狗头人地卜师
        integer nkog
        // 狗头人监工
        integer nkol
        // 狗头人隧道工
        integer nkot
        // 怪兽诱饵
        integer nlur
        // 闪电蜥蜴
        integer nltl
        // 雷霆蜥蜴
        integer nthl
        // 风暴巨蜥
        integer nstw
        // 野枭兽
        integer nowb
        // 暴怒野枭兽/暴怒枭熊
        integer nowe
        // 狂暴野枭兽/狂暴枭兽
        integer nowk
        // 钢鬃斥候
        integer nrzs
        // 钢鬃蛮兵
        integer nrzb
        // 钢鬃医师
        integer nrzm
        // 钢鬃酋长
        integer nrzg
        // 野猪人
        integer nrzt
        // 野猪人猎手
        integer nqbh
        // 小蜘蛛
        integer nspd
        // 蛛魔战士
        integer nnwa
        // 蛛魔织网者
        integer nnwl
        // 蛛魔蜘蛛领主
        integer nnws
        // 蛛魔先知
        integer nnwr
        // 蛛魔女王
        integer nnwq
        // 火焰亡魂
        integer nrvf
        // 冰霜亡魂
        integer nrvs
        // 闪电亡魂
        integer nrvl
        // 冰雪亡魂
        integer nrvi
        // 死灵亡魂
        integer nrvd
        // 食人魔战士
        integer nogr
        // 食人魔重殴者
        integer nogm
        // 食人魔领主
        integer nogl
        // 淤泥怪奴仆
        integer nslm
        // 淤泥怪抛掷者
        integer nslf
        // 淤泥怪畸体
        integer nsln
        // 黑蜘蛛
        integer nspb
        // 蜘蛛
        integer nspr
        // 巨型蜘蛛
        integer nsgt
        // 喷毒蜘蛛
        integer nssp
        // 虫母
        integer nsbm
        // 森林蜘蛛
        integer nspg
        // 野人
        integer nsqt
        // 古老野人
        integer nsqe
        // 野人神谕者
        integer nsqo
        // 远古野人
        integer nsqa
        // 雪怪
        integer nwen
        // 森林狼
        integer nwlt
        // 巨狼
        integer nwlg
        // 恐狼
        integer nwld
        // 霜狼
        integer nwwf
        // 巨型霜狼
        integer nwwg
        // 恐怖霜狼
        integer nwwd
        // 古老雪怪
        integer nwnr
        // 远古雪怪
        integer nwna
        // 雪怪萨满
        integer nwns
        // 流寇巫师
        integer nwzr
        // 变节巫师
        integer nwzg
        // 巫师学徒
        integer nwiz
        // 黑暗巫师
        integer nwzd
        // 多头蛇
        integer nhyd
        // 多头蛇幼崽
        integer nhyh
        // 古老多头蛇
        integer nehy
        // 远古多头蛇
        integer nahy
        // 虾兵龙虾人
        integer nlpr
        // 虾兵召唤物
        integer nlps
        // 龙虾人唤潮者
        integer nltc
        // 龙虾人池居者
        integer nlpd
        // 龙虾人先知
        integer nlds
        // 硬钳龙虾人
        integer nlsn
        // 龙虾人潮汐领主
        integer nlkl
        // 鱼人食腐者
        integer nmfs
        // 鱼人变异者
        integer nmmu
        // 鱼人瘟疫使者
        integer nmpg
        // 鱼人奔潮者
        integer nmrl
        // 鱼人猎手
        integer nmrr
        // 鱼人夜行者
        integer nmrm
        // 深海峭壁鱼人
        integer nmcf
        // 深海血腮鱼人
        integer nmbg
        // 深海鱼人潮汐战士
        integer nmtw
        // 深海鱼人猎捕者
        integer nmsn
        // 深海鱼人掠夺者
        integer nmrv
        // 深海鱼人暗影法师
        integer nmsc
        // 蜘蛛蟹岸行者
        integer nscb
        // 潮汐亡魂
        integer ntrv
        // 海洋亡魂
        integer nsrv
        // 深渊亡魂
        integer ndrv
        // 深海领主亡魂
        integer nlrv
        // 暗礁元素
        integer nrel
        // 海元素
        integer nsel
        // 海巨人
        integer nsgn
        // 海巨人猎手
        integer nsgh
        // 海巨人巨怪
        integer nsgb
        // 骷髅兽人
        integer nsko
        // 骷髅兽人步兵
        integer nsog
        // 骷髅兽人勇士
        integer nsoc
        // 暴掠学徒
        integer nsra
        // 暴掠隐士
        integer nsrh
        // 暴掠通灵侍僧
        integer nsrn
        // 暴掠术士
        integer nsrw
        // 原始熊猫人
        integer nfrp
        // 蜘蛛蟹肢解者
        integer nsc2
        // 蜘蛛蟹巨怪
        integer nsc3
        // 猛犸象
        integer nmam
        // 冰牙猛犸象
        integer nmit
        // 恐怖猛犸象
        integer nmdr
        // 猛犸人战士
        integer nmgw
        // 猛犸人掠夺者
        integer nmgr
        // 猛犸人毁灭者
        integer nmgd
        // 海象人斗士
        integer ntkf
        // 海象人长矛手
        integer ntka
        // 海象人战士
        integer ntkw
        // 海象人诱捕者
        integer ntkt
        // 海象人酋长
        integer ntkc
        // 海象人医师
        integer ntkh
        // 海象人巫师
        integer ntks
        // 水晶蛛蝎
        integer nanc
        // 尖刺蛛蝎
        integer nanb
        // 尖刺蛛蝎
        integer nanm
        // 蛛蝎战士
        integer nanw
        // 蛛蝎掘地者
        integer nane
        // 蛛蝎主宰
        integer nano
        // 无面欺诈者
        integer nfor
        // 无面恐魔
        integer nfot
        // 无面死亡使者
        integer nfod
        // 不灭黑暗猎手
        integer nubk
        // 不灭狂暴者
        integer nubr
        // 不灭黑暗编织者
        integer nubw
        // 北极熊
        integer nplb
        // 巨型北极熊
        integer nplg
        // 北极熊怪
        integer nfpl
        // 北极熊怪勇士
        integer nfpc
        // 北极熊怪萨满长者
        integer nfpe
        // 北极熊怪萨满
        integer nfps
        // 北极巨熊怪战士
        integer nfpu
        // 北极熊怪追踪者
        integer nfpt
        // 邪能兽
        integer npfl
        // 邪能破坏者
        integer npfm
        // 魅魔
        integer ndqn
        // 邪恶折磨者
        integer ndqv
        // 邪恶女妖
        integer ndqt
        // 痛苦魔女
        integer ndqp
        // 苦难女王
        integer ndqs
        // 恶魔卫士
        integer nfgu
        // 血怪
        integer nfgb
        // 主宰
        integer nfov
        // 地狱火机关
        integer ninc
        // 地狱火机械
        integer ninm
        // 地狱火毁灭战车
        integer nina
        // 小型虚空行者
        integer nvdl
        // 虚空行者
        integer nvdw
        // 大型虚空行者
        integer nvdg
        // 古老虚空行者
        integer nvde
        // 艾瑞达巫师
        integer ners
        // 艾瑞达恶魔信徒
        integer nerd
        // 艾瑞达术士
        integer nerw
        // 暴怒丛林捕猎者
        integer njgb
        // 古老丛林捕猎者
        integer njga
        // 丛林捕猎者
        integer njg1
        // 半人马弓箭手
        integer ncef
        // 半人马穿刺者
        integer ncif
        // 半人马女巫/半人马巫师
        integer nckf


        // 中立建筑(对战)

        // 地精实验室
        integer ngad
        // 地精商店
        integer ngme
        // 市集(市场)
        integer nmrk
        // 酒馆
        integer ntav
        // 生命之泉
        integer nfoh
        // 魔法之泉
        integer nmoo
        // 红龙栖地
        integer ndrr
        // 绿龙栖地
        integer ndrg
        // 虚空龙栖地
        integer ndro
        // 蓝龙栖地
        integer ndru
        // 青铜龙栖地
        integer ndrz
        // 黑龙栖地
        integer ndrk
        // 雇佣兵营地(洛丹伦(夏))
        integer nmer
        // 雇佣兵营地(洛丹伦(秋))
        integer nmr2
        // 雇佣兵营地(洛丹伦(冬))
        integer nmr3
        // 雇佣兵营地(贫瘠之地)
        integer nmr4
        // 雇佣兵营地(灰谷)
        integer nmr5
        // 雇佣兵营地(费伍德森林)
        integer nmr6
        // 雇佣兵营地(诺森德)
        integer nmr7
        // 雇佣兵营地(城邦)
        integer nmr8
        // 雇佣兵营地(达拉然)
        integer nmr9
        // 雇佣兵营地(村庄)
        integer nmr0
        // 雇佣兵营地(地牢)
        integer nmra
        // 雇佣兵营地(地下)
        integer nmrb
        // 雇佣兵营地(沉落的废墟)
        integer nmrc
        // 雇佣兵营地(冰冠冰川)
        integer nmrd
        // 雇佣兵营地(外域)
        integer nmre
        // 雇佣兵营地(黑色城堡)
        integer nmrf
        // 传送门
        integer nwgt
        // 地精船坞
        integer nshp


        // 中立特殊单位及建筑

        // 运输船
        integer nbot
        // 船只
        integer nbsp
        // 地精伐木机
        integer ngir
        // 亡灵赛车
        integer nccu
        // 兽人赛车
        integer ncco
        // 矮人赛车
        integer nccr
        // 迪亚波罗赛车
        integer nccd
        // 战车
        integer nwar
        // 无骑手的马/无人之马
        integer hhdl
        // 背负行囊的马/背负背包的马
        integer hrdh
        // 地精地雷(单位)
        integer nglm
        // 豺狼人督军
        integer ngow
        // 沥血者斯纳麦恩
        integer ngos
        // 血巫师
        integer nwzw
        // 石槌食人魔
        integer nogo
        // 石槌法师
        integer nogn
        // 石槌酋长
        integer noga
        // 防卫魔像
        integer nggd
        // 守护魔像
        integer nggg
        // 覆苔花岗岩魔像
        integer nggm
        // 血肉魔像
        integer nfgl
        // 次级灵魂兽(1级)
        integer nsw1
        // 灵魂兽(2级)
        integer nsw2
        // 高等灵魂兽(3级)
        integer nsw3
        // 巨熊(1级)
        integer ngz1
        // 怒熊(2级)
        integer ngz2
        // 灵熊(3级)
        integer ngz3
        // 米莎(1级)
        integer ngzc
        // 米莎(2级)
        integer ngzd
        // 米莎(3级)
        integer ngza
        // 米莎(4级)
        integer ngz4
        // 战鹰(1级)
        integer nwe1
        // 雷霆雄鹰(2级)
        integer nwe2
        // 灵魂战鹰(3级)
        integer nwe3
        // 豪猪(1级)
        integer nqb1
        // 恐怖豪猪(2级)
        integer nqb2
        // 暴怒豪猪(3级)
        integer nqb3
        // 怪兽诱饵
        integer nlur
        // 龙卷风(单位)
        integer ntor
        // 发条地精(1级)
        integer ncgb
        // 发条地精(2级)
        integer ncg1
        // 发条地精(3级)
        integer ncg2
        // 发条地精(3级+)
        integer ncg3
        // 口袋工厂(1级)
        integer nfac
        // 口袋工厂(2级)
        integer nfa1
        // 口袋工厂(3级)
        integer nfa2
        // 熔岩爪牙(1级)
        integer nlv1
        // 熔岩爪牙(2级)
        integer nlv2
        // 熔岩爪牙(3级)
        integer nlv3
        // 大地之灵(熊猫,陈·风暴烈酒1级大招)
        integer npn3
        // 火焰之灵(熊猫,陈·风暴烈酒1级大招)
        integer npn1
        // 风暴之灵(熊猫,陈·风暴烈酒1级大招)
        integer npn2
        // 大地之灵(陈·风暴烈酒2级大招)
        integer npn6
        // 火焰之灵(陈·风暴烈酒2级大招)
        integer npn4
        // 风暴之灵(陈·风暴烈酒2级大招)
        integer npn5
        // 小型黑暗奴仆
        integer ndr1
        // 黑暗奴仆
        integer ndr2
        // 大型黑暗奴仆
        integer ndr3
        // 蛛魔通灵塔
        integer nnzg
        // 钻地的尖刺蛛蝎
        integer nbnb
        // 冰巨魔小屋
        integer nth1
        // 冰巨魔小屋 2
        integer nth0
        // 半人马帐篷
        integer ncnt
        // 半人马帐篷(2)
        integer nct1
        // 半人马帐篷(3)
        integer nct2
        // 森林巨魔小屋
        integer nfh0
        // 森林巨魔小屋 2
        integer nfh1
        // 深海鱼人小屋 0
        integer nmg0
        // 深海鱼人小屋 1
        integer nmg1
        // 熊怪小屋
        integer nfr2
        // 熊怪小屋 2
        integer nfr1
        // 牛头人帐篷
        integer ntnt
        // 牛头人帐篷 2
        integer ntt2
        // 豺狼人小屋
        integer ngnh
        // 豺狼人小屋 2
        integer ngt2
        // 鱼人小屋
        integer nmh0
        // 鱼人小屋 2
        integer nmh1
        // 鱼人小屋 2
        integer nmg2
        // 鹰身人巢穴
        integer nhns
        // 鹰身人巢穴 2
        integer nhn2
        // 能量法阵
        integer ncop
        // 能量法阵(中型)
        integer ncp2
        // 能量法阵(大型的)
        integer ncp3
        // 帐篷
        integer nten
        // 帐篷 2
        integer ntn2
        // 帐篷 3
        integer ntn3
        // 冰冠方尖碑
        integer nico
        // 区域指示器(自定义战役)
        integer nzin
        // 复活石(面向东南)
        integer nbse
        // 复活石(面向西南)
        integer nbsw
        // 次元之门(面向东南)
        integer ndke
        // 次元之门(面向西南)
        integer ndkw
        // 被忘却者(古神)
        integer nfgo
        // 触须(古神)
        integer nfgt
        // 城市建筑 0
        integer ncb0
        // 城市建筑 1
        integer ncb1
        // 城市建筑 2
        integer ncb2
        // 城市建筑 3
        integer ncb3
        // 城市建筑 4
        integer ncb4
        // 城市建筑 5
        integer ncb5
        // 城市建筑 6
        integer ncb6
        // 城市建筑 7
        integer ncb7
        // 城市建筑 8
        integer ncb8
        // 城市建筑 9
        integer ncb9
        // 城市建筑 10
        integer ncba
        // 城市建筑 11
        integer ncbb
        // 城市建筑 12
        integer ncbc
        // 城市建筑 13
        integer ncbd
        // 城市建筑 14
        integer ncbe
        // 城市建筑 15
        integer ncbf


        // 星际争霸单位

        // 泰伦人类陆战队员
        integer zcso
        // 刺蛇
        integer zhyd
        // 跳虫
        integer zzrg


// 常用物品(应该齐)


        // 物品 优越之戒
        integer rnsp
        // 物品 再生之戒/恢复指环
        integer rlif
        // 物品 恶魔雕像
        integer fgdg
        // 物品 主宰权杖/统治权杖
        integer ccmd
        // 物品 沉默法杖/沉默权杖
        integer ssil
        // 物品 法盾护符/魔法护盾护身符
        integer spsh
        // 物品 灵巧头巾
        integer hcun
        // 物品 勇气头盔
        integer hval
        // 物品 勇气勋章
        integer mcou
        // 物品 战歌军鼓/战歌之鼓
        integer war2
        // 物品 军团末日号角/毁灭之角
        integer lgdh
        // 物品 远古坚韧杖鼓/古之忍耐姜歌
        integer ajen
        // 物品 卡德加的洞察烟斗/卡嘉长萧
        integer kpin
        // 物品 暴风雄狮号角/风暴狮角
        integer lhst
        // 物品 奥蕾莉亚的精准长笛/阿利亚之笛
        integer afac
        // 物品 天灾骨风铃/天灾骨钟
        integer sbch
        // 物品 战歌军鼓/战歌之鼓
        integer ward
        // 物品 烈焰披风/火焰风衣
        integer clfm
        // 物品 水晶球
        integer crys
        // 物品 法力垂饰/魔法垂饰
        integer pmna
        // 物品 能量垂饰
        integer penr
        // 物品 卡德加的生命宝石/卡嘉医疗宝石
        integer rhth
        // 物品 活力护身符/生命护身符
        integer prvt
        // 物品 攻击之爪+3
        integer rat3
        // 物品 攻击之爪+4
        // 在1.35或以下版本中是攻击之爪+5
        integer rat6
        // 物品 攻击之爪+8
        // 在1.35或以下版本中是攻击之爪+9
        integer rat9
        // 物品 攻击之爪+12
        integer ratc
        // 物品 攻击之爪+15
        integer ratf
        // 物品 防护之戒+1
        integer rde0
        // 物品 防护之戒+2
        integer rde1
        // 物品 防护之戒+3
        integer rde2
        // 物品 防护之戒+4
        integer rde3
        // 物品 防护之戒+5
        integer rde4
        // 物品 贵族头环
        integer cnob
        // 物品 急速手套/加速手套
        integer gcel
        // 物品 符文护腕/神秘腰带
        integer brac
        // 物品 闪避护符
        integer evtl
        // 物品 艺人面罩
        integer rwiz
        // 物品 暗影斗篷/影子风衣
        integer clsd
        // 物品 奎尔萨拉斯之靴+6
        integer belv
        // 物品 巨人力量腰带+6
        integer bgst
        // 物品 法师长袍+6
        integer ciri
        // 物品 敏捷便鞋+3
        integer rag1
        // 物品 智力斗篷+3
        integer rin1
        // 物品 食人魔力量护手+3
        integer rst1
        // 物品 法术免疫项链/魔法免疫项链
        integer nspi
        // 物品 法术书/魔法书
        integer sbok
        // 物品 远古雕像
        integer anfg
        // 物品 敏捷护腕
        integer brag
        // 物品 德鲁伊布袋
        integer drph
        // 物品 铁树枝干
        integer iwbr
        // 物品 青玉戒指/灵巧指环
        integer jdrn
        // 物品 雄狮之戒
        integer lnrn
        // 物品 力量之锤
        integer mlst
        // 物品 颅骨盾
        integer sksh
        // 物品 蜘蛛戒指
        integer sprn
        // 物品 巨力图腾
        integer tmmt
        // 物品 巫毒娃娃
        integer vddl
        // 物品 乌云号角
        integer sfog
        // 物品 大法师之戒(全属性+3,不带辉煌光环)
        integer ram4
        // 物品 大法师之戒(全属性+3,带辉煌光环)
        integer ram3
        // 物品 大法师之戒(全属性+2,不带辉煌光环)
        integer ram2
        // 物品 大法师之戒(全属性+1,不带辉煌光环)
        integer ram1
        // 物品 冰龙颅骨盾/冰霜巨龙头骨护盾
        integer fwss
        // 物品 萨满图腾
        integer shtm
        // 物品 生锈的矿镐/生锈的矿铲
        integer rump
        // 物品 塞拉希尔/瑟拉思尔
        integer srtl
        // 物品 结实的战斧/战斧
        integer stwa
        // 物品 血杀斧/远古战斧
        integer klmm
        // 物品 海洋权杖/海之权杖
        integer rots
        // 物品 先祖法杖/先祖权杖
        integer axas
        // 物品 心灵法杖/心灵权杖
        integer mnsf
        // 物品 驱魔种子
        // @version 1.32
        integer sxpl
        // 物品 净化藤蔓
        // @version 1.32
        integer vpur
        // 物品 艾苏恩之心/埃苏尼之心
        integer azhr
        // 物品 空瓶子/空瓶
        integer bzbe
        // 物品 装满的瓶子/盛满泉水的瓶子
        integer bzbf
        // 物品 奶酪
        integer ches
        // 物品 塞纳留斯之角
        integer cnhn
        // 物品 古尔丹之颅
        integer glsk
        // 物品 净化雕文/净化浮雕
        integer gopr
        // 物品 月亮水晶
        integer k3m1
        // 物品 不完整的三合月匙/三月之匙的另外一个部分
        integer k3m2
        // 物品 三合月匙/三月之匙
        integer k3m3
        // 物品 泰瑞纳斯国王的骨灰罐
        integer ktrm
        // 物品 鲜血钥匙
        integer kybl
        // 物品 幽灵钥匙/魔鬼钥匙
        integer kygh
        // 物品 月亮钥匙
        integer kymn
        // 物品 太阳钥匙
        integer kysn
        // 物品 杰拉德丢失的帐本/吉拉德的账本
        integer ledg
        // 物品 好东西/李维特
        integer phlt
        // 物品 希雷诺斯之心/赛瑞诺克斯之心
        integer sehr
        // 物品 附魔宝石/魔法宝石
        integer engs
        // 物品 暗影宝珠碎片
        integer sorf
        // 物品 宝石碎片
        integer gmfr
        // 物品 给吉安娜·普罗德摩尔的便条
        integer jpnt
        // 物品 微光草/荧光草
        integer shwd
        // 物品 骸骨法器/骸骨宝物
        integer skrt
        // 物品 隐藏关卡道具/秘密关卡激活
        integer sclp
        // 物品 怀特的腿
        integer wtlg
        // 物品 怀特的另一条腿
        integer wolg
        // 物品 魔法钥匙串
        integer mgtk
        // 物品 莫戈林的报告/莫哥林的报告
        integer mort
        // 物品 一桶雷酒/雷霆水桶
        integer dkfw
        // 物品 雷霆蜥蜴蛋/雷霆蜥蜴之蛋
        integer thle
        // 物品 雷霆凤凰蛋
        integer dphe
        // 物品 雷霆花的鳞茎/雷电花芯
        integer dthb
        // 物品 雷蜥钻石/雷霆蜥蜴钻石
        integer thdm
        // 物品 德雷克塔尔的法术书/德雷克萨尔的魔法书
        integer dtsb
        // 物品 信号枪
        integer fgun
        // 物品 怪兽诱饵/怪兽诱捕守卫
        integer lure
        // 物品 灵魂魔典/灵魂宝物
        integer grsl
        // 物品 奥金护盾/芒硝护盾
        integer arsh
        // 物品 艾苏恩的精华
        integer esaz
        // 物品 复生法杖/鼓舞权杖
        integer stre
        // 物品 古老圣物/稀有神器
        integer horl
        // 物品 好战头盔/战舰之舵
        integer hbth
        // 物品 折刃护甲/剑刃护甲
        integer blba
        // 物品 符文护手/神秘手套
        integer rugt
        // 物品 火拳护手/火焰手套
        integer frhg
        // 物品 法术掌握手套/法术大师手套
        integer gvsm
        // 物品 死亡领主之冠/死亡领主皇冠
        integer crdt
        // 物品 死亡领主之盾/死亡领主护盾
        integer shdt
        // 物品 荣誉护盾
        integer shhn
        // 物品 附魔盾牌/施魔护盾
        integer shen
        // 物品 发条企鹅/时钟企鹅
        integer stpg
        // 物品 微光烤肉/烤肉
        integer shrs
        // 物品 血羽之心
        integer bfhr
        // 物品 萨满利爪
        integer shcw
        // 物品 灼热之刃/灼热之刀
        integer srbd
        // 物品 寒冰护卫者/霜冻守卫
        integer frgd
        // 物品 附魔小瓶/魔法小瓶
        integer envl
        // 物品 治疗权杖/医疗权杖
        integer schl
        // 物品 刺客之刃/刺客佩刀
        integer asbl
        // 物品 一桶麦酒/麦酒桶
        integer kgal
        // 物品 金币
        integer gold
        // 物品 一捆木柴
        integer lmbr
        // 物品 强固雕文/防御浮雕
        integer gfor
        // 物品 夜视雕文/夜视浮雕
        integer guvi
        // 物品 全知雕文/全知浮雕
        integer gomn
        // 物品 灵魂链接符文/灵魂锁链神符
        integer rspl
        // 物品 次级复活符文/小型复活神符
        integer rre1
        // 物品 强效复活符文/大型复活神符
        integer rre2
        // 物品 重生符文/重生神符
        integer rreb
        // 物品 护盾符文/护盾神符
        integer rsps
        // 物品 速度符文/速度神符
        integer rspd
        // 物品 法力符文/魔法神符
        integer rman
        // 物品 强效法力符文/大型魔法神符
        integer rma2
        // 物品 复原符文/恢复神符
        integer rres
        // 物品 次级治疗符文/小型治疗神符
        integer rhe1
        // 物品 治疗符文/治疗神符
        integer rhe2
        // 物品 强效治疗符文/大型治疗神符
        integer rhe3
        // 物品 驱魔符文/驱魔神符
        integer rdis
        // 物品 监视符文/岗哨神符
        integer rwat
        // 物品 生命手册
        integer manh
        // 物品 知识之书
        integer tpow
        // 物品 敏捷之书+2
        integer tdx2
        // 物品 智力之书+2
        integer tin2
        // 物品 力量之书+2
        integer tst2
        // 物品 敏捷之书
        integer tdex
        // 物品 智力之书
        integer tint
        // 物品 力量之书
        integer tstr
        // 物品 强效经验之书/超级经验之书
        integer tgxp
        // 物品 经验之书
        integer texp
        // 物品 传送法杖/传送权杖
        integer stel
        // 物品 召唤钻石
        integer dsum
        // 物品 召回护符
        integer amrc
        // 物品 保存法杖/保存权杖
        integer spre
        // 物品 月亮石
        integer moon
        // 物品 速度之靴
        integer bspd
        // 物品 机械小动物
        integer mcri
        // 物品 闪电宝珠/闪电之球
        integer oli2
        // 物品 闪电宝珠/闪电之球
        integer olig
        // 物品 火焰宝珠/火焰之球
        integer ofir
        // 物品 火焰宝珠/火焰之球
        integer ofr2
        // 物品 腐蚀宝珠/腐蚀之球
        integer ocor
        // 物品 毒液宝珠/毒液之球
        integer oven
        // 物品 冰霜宝珠/霜冻之球
        integer ofro
        // 物品 基尔加丹宝珠/之球
        integer gldo
        // 物品 减速宝珠/减速之球
        integer oslo
        // 物品 天界灵魂宝珠/灵魂之球
        integer cosl
        // 物品 灵魂
        integer soul
        // 物品 灵魂宝石
        integer gsou
        // 物品 黑暗宝珠/黑暗之球
        integer odef
        // 物品 暗影宝珠+10/黑暗之球+10
        integer sora
        // 物品 暗影宝珠+1/黑暗之球+1
        integer sor1
        // 物品 暗影宝珠+2/黑暗之球+2
        integer sor2
        // 物品 暗影宝珠+3/黑暗之球+3
        integer sor3
        // 物品 暗影宝珠+4/黑暗之球+4
        integer sor4
        // 物品 暗影宝珠+5/黑暗之球+5
        integer sor5
        // 物品 暗影宝珠+6/黑暗之球+6
        integer sor6
        // 物品 暗影宝珠+7/黑暗之球+7
        integer sor7
        // 物品 暗影宝珠+8/黑暗之球+8
        integer sor8
        // 物品 暗影宝珠+9/黑暗之球+9
        integer sor9
        // 物品 真视宝石
        integer gemt
        // 物品 暗夜精灵旗帜
        integer nflg
        // 物品 亡灵旗帜
        integer uflg
        // 物品 人类旗帜
        integer flag
        // 物品 兽人旗帜
        integer oflg
        // 物品 战旗
        integer btst
        // 物品 复活卷轴
        integer srrc
        // 物品 地精地雷
        integer gobm
        // 物品 地精夜视镜
        integer tels
        // 物品 迷你伐木场/微型伐木场
        integer tlum
        // 物品 迷你兵营/微型兵营
        integer tbar
        // 物品 迷你农场/微型农场
        integer tfar
        // 物品 迷你列王祭坛/微型国王祭坛
        integer tbak
        // 物品 迷你铁匠铺/微型铁匠铺
        integer tbsm
        // 物品 迷你城堡/小城堡
        integer tcas
        // 物品 象牙塔
        integer tsct
        // 物品 迷你大厅/小型的大厅
        integer tgrh
        // 物品 反魔法药剂/抗体药水
        integer pams
        // 物品 神圣药水
        integer pdiv
        // 物品 神圣药水
        // @version 1.32
        integer pdi2
        // 物品 次级无敌药水/较小的无敌药水
        integer pnvl
        // 物品 无敌药水
        integer pnvu
        // 物品 亡者之书/死亡之书
        integer fgsk
        // 物品 全知药水
        integer pomn
        // 物品 嗜财权杖
        // @version 1.32
        integer scav
        // 物品 复原卷轴/恢复卷轴
        integer sres
        // 物品 复原药水/恢复药水
        integer pres
        // 物品 寒冰碎片/冰冻碎片
        integer shar
        // 物品 尖刺项圈/长钉衣领
        integer fgfh
        // 物品 岩石徽记/岩石印记
        integer fgrg
        // 物品 幻象魔杖/幻象权杖
        integer will
        // 物品 强效治疗药水/大生命药水
        integer pghe
        // 物品 强效法力药水/大魔法药水
        integer pgma
        // 物品 眼影魔杖/影子权杖
        integer wshs
        // 物品 恢复药水
        integer rej3
        // 物品 恶魔雕像
        integer fhdg
        // 物品 治疗结界/治疗守卫
        integer whwd
        // 物品 法力窃取魔杖
        integer woms
        // 物品 生命石/医疗石
        integer hlst
        // 物品 蓝色幼龙蛋/蓝龙之卵
        // @version 1.32
        integer fgbd
        // 物品 红色幼龙蛋/红龙之卵
        integer fgrd
        // 物品 警戒结界/岗哨守卫
        integer wswd
        // 物品 重生十字章
        integer ankh
        // 物品 野兽卷轴
        integer sror
        // 物品 野性护符/野性护身符
        integer wild
        // 物品 奥术卷轴/神秘卷轴
        integer arsc
        // 物品 邪恶军团卷轴
        integer scul
        // 物品 献祭之书/牺牲之书
        integer tmsc
        // 物品 大型恢复卷轴/大型恢复卷轴
        integer rej6
        // 物品 次级恢复卷轴/小型恢复卷轴
        integer rej5
        // 物品 强效恢复药水/大型恢复药水
        integer rej4
        // 物品 次级恢复药水/小型恢复药水
        integer rej2
        // 物品 法力卷轴/魔法卷轴
        integer sman
        // 物品 初级恢复药水/小型恢复药水
        integer rej1
        // 物品 速度药水
        integer pspd
        // 物品 强效隐形药水/大隐形药水
        integer pgin
        // 物品 野性咒符/野性护符
        integer totw
        // 物品 亡者再临卷轴/操作死尸卷轴
        integer sand
        // 物品 野性神像
        // @version 1.32
        integer iotw
        // 物品 闪电之盾魔杖
        integer wlsd
        // 物品 雕饰鳞片
        integer engr
        // 物品 飓风魔杖
        integer wcyc
        // 物品 魔法石
        integer mnst
        // 物品 中和魔杖
        integer wneu
        // 物品技能 仪式匕首
        // @version 1.30
        integer ritd
        // 物品 保护卷轴/守护卷轴
        integer spro
        // 物品 吸血药水
        integer vamp
        // 物品 城镇传送卷轴/回城卷轴
        integer stwp
        // 物品 庇护法杖/避难权杖
        integer ssan
        // 物品 恢复卷轴
        integer sreg
        // 物品 明澈药水/净化药水
        integer pclr
        // 物品 次级明澈药水/小净化药水
        integer plcl
        // 物品 治疗卷轴
        integer shea
        // 物品 治疗药水/生命药水
        integer phea
        // 物品 治疗药膏/医疗剂
        integer hslv
        // 物品 魔法药水
        integer pman
        // 物品 显影之尘
        integer dust
        // 物品 献祭之颅/献祭头骨
        integer skul
        // 物品 地狱火之石/恶魔岩石
        integer infs
        // 物品 虚无法杖/否决权杖(非消耗品)
        integer sneg
        // 物品 虚无魔杖/否决权杖(消耗品)
        integer wneg
        // 物品 蛛丝胸针/蜘蛛丝饰针
        integer silk
        // 物品 通灵魔棒/巫术妖棍
        integer rnec
        // 物品 速度卷轴
        integer shas
        // 物品 重修之书/再训练之书
        integer tret
        // 物品 隐形药水
        integer pinv
        // 物品 凯伦的逃脱匕首/科勒恩的逃脱匕首
        integer desc
        // 物品 列王之冠+5/国王之冠 +5
        integer ckng
        // 物品 威能之书/能量之书
        integer tkno
        // 物品 死亡面具/死亡面罩
        integer modt


// 英雄技能(齐)

        // 人族对战英雄技能

        // 英雄技能 天神下凡(山丘之王)
        integer AHav
        // 英雄技能 猛击(山丘之王)
        integer AHbh
        // 英雄技能 风暴之锤(山丘之王)
        integer AHtb
        // 英雄技能 雷霆一击(山丘之王)
        integer AHtc
        // 英雄技能 虔诚光环(圣骑士)
        integer AHad
        // 英雄技能 圣盾术(圣骑士)
        integer AHds
        // 英雄技能 圣光术(圣骑士)
        integer AHhb
        // 英雄技能 复活术(圣骑士)
        integer AHre
        // 英雄技能 暴风雪(大法师)
        integer AHbz
        // 英雄技能 辉煌光环(大法师)
        integer AHab
        // 英雄技能 群体传送(大法师)
        integer AHmt
        // 英雄技能 水元素(大法师)
        integer AHwe
        // 英雄技能 放逐(血法)
        integer AHbn
        // 英雄技能 烈焰风暴(血法)
        integer AHfs
        // 英雄技能 火凤凰(血法)
        integer AHpx
        // 英雄技能 法力虹吸(血法)
        integer AHdr


        // 兽族对战英雄技能

        // 英雄技能 致命一击(剑圣)
        integer AOcr
        // 英雄技能 镜像(剑圣)
        integer AOmi
        // 英雄技能 剑刃风暴(剑圣)
        integer AOww
        // 英雄技能 疾风步(剑圣)
        integer AOwk
        // 英雄技能 闪电链(先知)
        integer AOcl
        // 英雄技能 地震术(先知)
        integer AOeq
        // 英雄技能 视界术(先知)
        integer AOfs
        // 英雄技能 野性之魂(召狼)(先知)
        integer AOsf
        // 英雄技能 坚韧光环(牛头)
        integer AOae
        // 英雄技能 重生(牛头)
        integer AOre
        // 英雄技能 震荡波(牛头)
        integer AOsh
        // 英雄技能 战争践踏(牛头)
        integer AOws
        // 英雄技能 治疗波(暗影猎手)
        integer AOhw
        // 英雄技能 妖术(暗影猎手)
        integer AOhx
        // 英雄技能 毒蛇结界(蛇棒)(暗影猎手)
        integer AOsw
        // 英雄技能 巫毒狂舞(友军无敌)(暗影猎手)
        integer AOvd


        // 不死族对战英雄技能

        // 英雄技能 沉睡(恐惧魔王)
        integer AUsl
        // 英雄技能 吸血光环(恐惧魔王)
        integer AUav
        // 英雄技能 腐臭蜂群(恐惧魔王)
        integer AUcs
        // 英雄技能 地狱火(恐惧魔王)
        integer AUin
        // 英雄技能 黑暗仪式(巫妖)
        integer AUdr
        // 英雄技能 枯萎凋零(巫妖)
        integer AUdd
        // 英雄技能 冰霜新星(巫妖)
        integer AUfu
        // 英雄技能 霜甲术(自动施法)(巫妖)
        integer AUfn
        // 英雄技能 亡者再临(死骑)
        integer AUan
        // 英雄技能 凋零/死亡缠绕(死骑)
        integer AUdc
        // 英雄技能 天灾/死亡契约(死骑)
        integer AUdp
        // 英雄技能 邪恶光环(死骑)
        integer AUau
        // 英雄技能 腐尸甲虫(小强)
        integer AUcb
        // 英雄技能 穿刺(小强)
        integer AUim
        // 英雄技能 虫群风暴(小强)
        integer AUls
        // 英雄技能 尖刺甲壳(小强)
        integer AUts


        // 暗夜精灵族对战英雄技能

        // 英雄技能 自然之力(丛林守护者)
        integer AEfn
        // 英雄技能 纠缠根须(丛林守护者)
        integer AEer
        // 英雄技能 荆棘光环(丛林守护者)
        integer AEah
        // 英雄技能 宁静(丛林守护者)
        integer AEtq
        // 英雄技能 闪避(恶魔猎手)
        integer AEev
        // 英雄技能 献祭(恶魔猎手)
        integer AEim
        // 英雄技能 法力燃烧(恶魔猎手)
        integer AEmb
        // 英雄技能 恶魔变形(恶魔猎手)
        integer AEme
        // 英雄技能 灼热之箭(白虎)
        integer AHfa
        // 英雄技能 斥候(白虎)
        integer AEst
        // 英雄技能 星辰坠落(流星雨)(白虎)
        integer AEsf
        // 英雄技能 强击光环(白虎)
        integer AEar
        // 英雄技能 闪现(守望者)
        integer AEbl
        // 英雄技能 刀扇(守望者)
        integer AEfk
        // 英雄技能 暗影突袭(守望者)
        integer AEsh
        // 英雄技能 复仇(守望者)
        integer AEsv


        // 酒馆英雄技能

        // 英雄技能 冰霜箭(娜迦海巫)
        integer ANfa
        // 英雄技能 叉状闪电(娜迦海巫)
        integer ANfl
        // 英雄技能 寒冰箭矢
        integer AHca
        // 英雄技能 法力护盾(娜迦海巫)
        integer ANms
        // 英雄技能 龙卷风(娜迦海巫)
        integer ANto
        // 英雄技能 治疗喷雾(炼金术士)
        integer ANhs
        // 英雄技能 化学狂暴(炼金术士)
        integer ANcr
        // 英雄技能 酸性炸弹(炼金术士)
        integer ANab
        // 英雄技能 点金术(炼金术士)
        integer ANtm
        // 英雄技能 集束火箭(修补匠)
        integer ANcs
        // 英雄技能 集束火箭(1级升级)(修补匠)
        integer ANc1
        // 英雄技能 集束火箭(2级升级)(修补匠)
        integer ANc2
        // 英雄技能 集束火箭(3级升级)(修补匠)
        integer ANc3
        // 英雄技能 口袋工厂(修补匠)
        integer ANsy
        // 英雄技能 口袋工厂(升级1)(修补匠)
        integer ANs1
        // 英雄技能 口袋工厂(升级2)(修补匠)
        integer ANs2
        // 英雄技能 口袋工厂(升级3)(修补匠)
        integer ANs3
        // 英雄技能 工程学升级(修补匠)
        integer ANeg
        // 英雄技能 拆毁(修补匠)
        integer ANde
        // 英雄技能 拆毁(1级升级)(修补匠)
        integer ANd1
        // 英雄技能 拆毁(2级升级)(修补匠)
        integer ANd2
        // 英雄技能 拆毁(3级升级)(修补匠)
        integer ANd3
        // 英雄技能 机械地基(修补匠)
        integer ANrg
        // 英雄技能 机械地基(1级升级)(修补匠)
        integer ANg1
        // 英雄技能 机械地基(2级升级)(修补匠)
        integer ANg2
        // 英雄技能 机械地基(3级升级)(修补匠)
        integer ANg3
        // 英雄技能 召唤巨熊(兽王)
        integer ANsg
        // 英雄技能 召唤战鹰(兽王)
        integer ANsw
        // 英雄技能 召唤豪猪(兽王)
        integer ANsq
        // 英雄技能 群兽奔腾(兽王)
        integer ANst
        // 英雄技能 火焰之息(熊猫)
        integer ANbf
        // 英雄技能 酩酊酒雾(熊猫)
        integer ANdh
        // 英雄技能 醉拳(熊猫)
        integer ANdb
        // 英雄技能 风火雷电(熊猫)
        integer ANef
        // 英雄技能 召唤熔岩爪牙(火焰领主)
        integer ANlm
        // 英雄技能 灵魂燃烧(火焰领主)
        integer ANso
        // 英雄技能 焚身化骨(火焰领主)
        integer ANic
        // 英雄技能 焚身化骨(箭矢)(火焰领主)
        integer ANia
        // 英雄技能 火山爆发(火焰领主)
        integer ANvc
        // 英雄技能 火焰之雨(深渊领主)
        integer ANrf
        // 英雄技能 恐惧嚎叫(深渊领主)
        integer ANht
        // 英雄技能 顺劈斩(深渊领主)
        integer ANca
        // 英雄技能 末日降临(深渊领主)
        integer ANdo
        // 英雄技能 沉默(黑暗游侠)
        integer ANsi
        // 英雄技能 黑蚀箭(黑暗游侠)
        integer ANba
        // 英雄技能 生命吸取(黑暗游侠)
        integer ANdr
        // 英雄技能 蛊惑(黑暗游侠)
        integer ANch


        // 其他英雄技能

        // 英雄技能 通魔(在重置版,至少在1.36中找不到)
        integer ANcl
        // 英雄技能 召唤米莎(雷克萨)
        integer Arsg
        // 英雄技能 召唤豪猪(雷克萨)
        integer Arsq
        // 英雄技能 风暴之锤(雷克萨)
        integer ANsb
        // 英雄技能 群兽奔腾(雷克萨)
        integer Arsp
        // 英雄技能 地狱火(中立敌对)
        integer ANin
        // 英雄技能 地狱火(提克迪奥斯)
        integer SNin
        // 英雄技能 地震术(中立敌对)
        integer SNeq
        // 英雄技能 季风
        integer ANmo
        // 英雄技能 属性加成
        integer Aamk
        // 英雄技能 引导
        integer ANcl
        // 英雄技能 召唤虾兵
        integer Aslp
        // 英雄技能 恶魔变形(伊利丹)
        integer AEIl
        // 英雄技能 恶魔变形(邪恶的伊利丹)
        integer AEvi
        // 英雄技能 战斗咆哮
        integer ANbr
        // 英雄技能 星辰坠落(更强大的)
        integer AEsb
        // 英雄技能 枯萎凋零(中立敌对)
        integer SNdd
        // 英雄技能 水栖奴仆
        integer ANwm
        // 英雄技能 淬毒之箭
        integer AEpa
        // 英雄技能 混乱之雨(巴纳扎尔)
        integer ANr3
        // 英雄技能 死亡一指(阿克蒙德)
        integer ANfd
        // 英雄技能 混乱之雨(阿克蒙德)
        integer ANrc
        // 英雄技能 黑暗之门(阿克蒙德)
        integer ANdp
        // 英雄技能 灵魂保存(玛尔加尼斯)
        integer ANsl
        // 英雄技能 黑暗转换(玛尔加尼斯)
        integer ANdc
        // 英雄技能 黑暗转换(玛尔加尼斯、快)
        integer SNdc
        // 英雄技能 灵魂兽
        integer ACs8
        // 英雄技能 重生
        integer ANr2
        // 英雄技能 重生(玛诺洛斯)
        integer ANrn
        // 英雄技能 野性之魂
        integer ACs7
        // 英雄技能 疾风步(中立敌对)
        integer ANwk
        // 英雄技能 天神下凡(中立)
        integer ANav
        // 英雄技能 震荡波
        integer ANsh
        // 英雄技能 火焰之息(陈·风暴烈酒)
        integer ANcf
        // 英雄技能 酩酊酒雾(陈·风暴烈酒)
        integer Acdh
        // 英雄技能 醉拳(陈·风暴烈酒)
        integer Acdb
        // 英雄技能 风火雷电(陈·风暴烈酒)
        integer Acef
        // 英雄技能 火焰箭(中立敌对)
        integer ANfb
        // 英雄技能 震荡波(凯恩)
        integer AOs2
        // 英雄技能 战争践踏
        integer AOw2
        // 英雄技能 坚韧光环(凯恩)
        integer AOr2
        // 英雄技能 重生(凯恩)
        integer AOr3
        // 英雄技能 治疗波(洛坎)
        integer ANhw
        // 英雄技能 妖术(洛坎)
        integer ANhx
        // 英雄技能 毒蛇结界(洛坎)
        integer Arsw
        // 英雄技能 巫毒幽魂
        integer AOls
        // 英雄技能 闪现(中立)
        integer ANbl


// 单位技能(未按种族区分)

        // 单位技能 传送门技能
        integer Awrp
        // 单位技能 共享商店,联盟建筑
        integer Aall
        // 单位技能 出售单位
        integer Asud
        // 单位技能 出售物品
        integer Asid
        // 单位技能 卸载(空中载具)
        integer Adro
        // 单位技能 卸载(海上载具)
        integer Sdro
        // 单位技能 商店购买物品
        integer Apit
        // 单位技能 选择使用者
        integer Anei
        // 单位技能 返回
        integer Artn
        // 单位技能 地雷 - 爆炸(地精地雷)/金矿- 爆炸了(地精地雷)
        integer Amin
        // 单位技能 死亡时造成范围伤害(地精地雷)
        integer Amnx
        // 单位技能 死亡时造成范围伤害(大地雷)
        integer Amnz
        // 单位技能 死亡时造成范围伤害(地精工兵)
        integer Adda
        // 单位技能 咔嘣！(地精工兵)
        integer Asds
        // 单位技能 永久隐形
        integer Apiv
        // 单位技能 游荡(中立)/游荡者(中立)
        integer Awan
        // 单位技能 无敌(中立)
        integer Avul
        // 单位技能 复活英雄
        integer Arev
        // 单位技能 立刻复活英雄
        integer Aawa
        // 单位技能 立刻卸载(被缠绕的金矿)
        integer Adri
        // 单位技能 装载(地精飞艇)
        integer Aloa
        // 单位技能 装载(船) 
        integer Slo3
        // 单位技能 货舱(编辑器无此技能)
        integer Amtc
        // 单位技能 货舱
        integer Acar
        // 单位技能 货舱(地精飞艇)
        integer Sch3
        // 单位技能 货舱(坦克)
        integer Sch4
        // 单位技能 货舱(船)
        integer Sch5
        // 单位技能 货舱(清道夫/绞肉车)
        integer Sch2
        // 单位技能 货舱(兽人地洞)
        integer Abun
        // 单位技能 (混乱货舱装载)
        integer Achl
        // 单位技能 货舱死亡(中立敌对)
        integer Achd
        // 单位技能 缠绕金矿
        integer Aent
        // 单位技能 金矿技能
        integer Agld
        // 单位技能 被缠绕的金矿技能
        integer Aegm
        // 单位技能 荒芜金矿技能
        integer Abgm
        // 单位技能 集结
        integer ARal
        // 单位技能 选择单位
        integer Ane2
        // 单位技能 选择英雄
        integer Aneu
        // 单位技能 装载小精灵(被缠绕的金矿)
        integer Slo2
        // 单位技能 装载(被缠绕的金矿)
        integer Aenc
        // 单位技能 卸载尸体
        integer Amed
        // 单位技能 获取尸体
        integer Amel
        // 单位技能 装载(兽人地洞)
        integer Sloa
        // 单位技能 解除戒备(兽人地洞)
        integer Astd
        // 单位技能 运货骡子 
        integer Apak
        // 单位技能 潜水(侍从)
        integer Asb1
        // 单位技能 潜水(毒鳍龙)
        integer Asb3
        // 单位技能 潜水(皇家卫兵)
        integer Asb2
        // 单位技能 法术免疫(中立敌对)
        integer ACmi
        // 单位技能 法术免疫(阿克蒙德)
        integer ACm2
        // 单位技能 法术免疫(龙)
        integer ACm3
        // 单位技能 法术免疫
        integer Amim
        // 物品技能 法术免疫(物品)
        integer AImx
        // 单位技能 影遁
        integer Ashm
        // 单位技能 影遁(立刻的)
        integer Sshm
        // 单位技能 影遁(阿卡玛)
        integer Ahid
        // 单位技能 飓风术(塞纳留斯)
        integer SCc1
        // 单位技能 物品栏(英雄)
        integer AInv
        // 单位技能 物品栏(亡灵)
        integer Aiun
        // 单位技能 物品栏(人类)
        integer Aihn
        // 单位技能 物品栏(兽人)
        integer Aion
        // 单位技能 物品栏(暗夜精灵)
        integer Aien
        // 单位技能 报警
        integer Aalr
        // 单位技能 开火
        integer Afir
        // 单位技能 移动
        integer Amov
        // 单位技能 英雄
        integer AHer
        // 单位技能 攻击
        integer Aatk
        // 单位技能 优先攻击(石像鬼)
        // @version 1.32.9
        integer Aatp
        // 单位技能 疾病云雾(亡者再临)
        // @version 1.33
        integer Aap5
        // 单位技能 食尸鬼狂暴(图标)
        // @version 1.32
        integer Augf
        // 单位技能 骷髅精通(图标)
        // @version 1.32
        integer Ausm
        // 单位技能 凤凰(图标)
        // @version 1.32
        integer Ahpe
        // 单位技能 坐骑作战训练(图标)
        // @version 1.32
        integer Ahan
        // 单位技能 改良伐木技术(图标)
        // @version 1.32
        integer Ahlh
        // 单位技能 长管火枪(图标)
        // @version 1.32
        integer Ahri
        // 单位技能 裂甲之刃
        // @version 1.30
        integer Ahsb
        // 物品技能 仪式匕首(恢复)
        // @version 1.30
        integer AIg2
        // 物品技能 仪式匕首(瞬发治疗)
        // @version 1.30
        integer AIdg
        // 单位技能 加强型防御(图标)
        // @version 1.32
        integer Aorb
        // 单位技能 尖刺障碍(图标)
        // @version 1.32
        integer Aosp
        // 单位技能 巨魔再生(图标)
        // @version 1.32
        integer Aotr
        // 单位技能 狂战士升级(图标)
        // @version 1.32
        integer Aobk
        // 单位技能 野蛮之力(图标)
        // @version 1.32
        integer Aobs
        // 单位技能 冰霜攻击(新的,具有图标)
        integer Afrc
        // 单位技能 影魔(图标)
        // @version 1.32
        integer Augh
        // 单位技能 强弓(图标)
        // @version 1.32
        integer Aeib
        // 单位技能 月井之春(图标)
        // @version 1.32
        integer Aews
        // 单位技能 箭术(图标)
        // @version 1.32
        integer Aemk
        // 单位技能 黑暗召唤(玛尔加尼斯)
        integer AUmd
        // 单位技能 亡者再临(中立敌对)
        integer ACad
        // 单位技能 强固雕文
        integer AIgf
        // 单位技能 强固雕文
        integer AIgu
        // 单位技能 减速光环(龙卷风)
        integer Aasl
        // 单位技能 建筑伤害光环(龙卷风)
        integer Atdg
        // 单位技能 龙卷风旋转(龙卷风)
        integer Atsp
        // 单位技能 龙卷风游荡(龙卷风)
        integer Atwa
        // 单位技能 刚毛飞射
        integer ANak
        // 单位技能 干扰射线
        integer Ache
        // 单位技能 钻地(中立敌对)
        integer Abu5
        // 单位技能 寄生虫
        integer ACpa
        // 单位技能 法力虹吸(中立敌对)
        integer ACsm
        // 单位技能 吞噬魔法(中立敌对)
        integer ACde
        // 单位技能 硬化体肤
        integer Ansk
        // 单位技能 火焰之雨(中立敌对1)
        integer ACrg
        // 单位技能 恐惧嚎叫(中立敌对)
        integer Acht
        // 单位技能 顺劈斩(中立敌对)
        integer ACce
        // 单位技能 疾风步(中立敌对)
        integer ANwk
        // 单位技能 嘲讽(中立敌对)
        integer ANta
        // 单位技能 放逐(中立敌对)
        integer ACbn
        // 单位技能 生命吸取(中立敌对)
        integer ACdr
        // 单位技能 妖术(中立敌对)
        integer AChx
        // 单位技能 纠缠根须(中立敌对2)
        integer Aenw
        // 单位技能 治疗波(中立敌对)
        integer AChv
        // 单位技能 沉默(中立敌对)
        integer ACsi
        // 单位技能 法力护盾(中立敌对)
        integer ACmf
        // 单位技能 暗影突袭(中立敌对)
        integer ACss
        // 单位技能 寒冰箭
        integer ACcb
        // 单位技能 冰霜吐息
        integer ACbf
        // 单位技能 冰霜吐息
        integer Afrb
        // 单位技能 冰霜攻击
        integer Afra
        // 单位技能 冰霜攻击
        integer Afr2
        // 单位技能 冰冻吐息
        integer Afrz
        // 单位技能 火焰之息(中立敌对)
        integer ACbc
        // 单位技能 烈焰风暴(中立敌对)
        integer ACfs
        // 单位技能 烈焰风暴(中立敌对2)
        integer ANfs
        // 单位技能 穿刺(中立敌对)
        integer ACmp
        // 单位技能 尖刺外壳
        integer ANth
        // 单位技能 尖刺外壳(按钮位置2,2)
        integer ANt2
        // 单位技能 心智腐烂
        integer ANmr
        // 单位技能 蛊惑(中立敌对)
        integer ACch
        // 单位技能 治疗结界(中立敌对)
        integer AChw
        // 单位技能 回春术(熊怪)
        integer ACr2
        // 单位技能 法术免疫,法术免疫
        integer ACm2
        // 单位技能 法术免疫,法术免疫
        integer ACm3
        // 单位技能 复仇
        integer Arng
        // 单位技能 真视(中立1)
        integer Adtg
        // 单位技能 真视(中立2)
        integer ANtr
        // 单位技能 生命之树升级技能
        integer Atol
        // 单位技能 苦痛之指(中立敌对)
        integer ACfd
        // 单位技能 苦痛之指(中立敌对)
        integer ACf3
        // 单位技能 死亡一指(中立敌对)
        integer Afod
        // 单位技能 虔诚光环(中立敌对)
        integer ACav
        // 单位技能 一直沉睡
        integer Asla
        // 单位技能 吞噬货物
        integer Advc
        // 单位技能 永久献祭(中立敌对1)
        integer ANpi
        // 单位技能 永久献祭(中立敌对2)
        integer Apig
        // 单位技能 战斗戒备(邪兽人地洞)
        integer Sbtl
        // 单位技能 收取黄金和木材
        integer AAns
        // 单位技能 暴露
        integer Andt
        // 单位技能 用黄金交换木材
        integer ANgl
        // 单位技能 用木材交换黄金
        integer ANlg
        // 单位技能 法力恢复, 生命恢复光环(中立)
        integer ANre
        // 单位技能 生命恢复
        integer ANrl
        // 单位技能 窥探
        integer ANsp
        // 单位技能 乌鸦形态
        integer Amrf
        // 单位技能 治疗术(中立敌对1)
        integer Anhe
        // 单位技能 减速术(中立敌对)
        integer ACsw
        // 单位技能 砸击(中立敌对)
        integer ACtc
        // 单位技能 砸击(雷霆蜥蜴)
        integer ACt2
        // 单位技能 投掷巨石
        integer ACtb
        // 单位技能 狂暴之怒
        integer ACbr
        // 单位技能 嗜血(中立敌对2)
        integer ACbb
        // 单位技能 狂乱
        integer Afzy
        // 单位技能 嗜血(中立敌对1)
        integer ACbl
        // 单位技能 诱捕(中立敌对)
        integer ACen
        // 单位技能 吞噬(中立敌对)
        integer ACdv
        // 单位技能 沉睡
        integer ACsp
        // 单位技能 生出骷髅(可能是黑蚀箭)
        integer Asod
        // 单位技能 生出小蜘蛛(中立敌对)
        integer Assp
        // 单位技能 生出蜘蛛(中立敌对)
        integer Aspd
        // 单位技能 生出多头蛇
        integer Aspy
        // 单位技能 生出多头蛇幼崽
        integer Aspt
        // 单位技能 统御光环
        integer AOac
        // 单位技能 统御光环
        integer ACac
        // 单位技能 重生(中立敌对)
        integer ACrn
        // 单位技能 法力燃烧(中立敌对1)
        integer Ambd
        // 单位技能 法力燃烧(中立敌对2)
        integer Amnb
        // 单位技能 法力燃烧(中立敌对3)
        integer Ambb
        // 单位技能 幽魂
        integer Agho
        // 单位技能 幽魂(可见)
        integer Aeth
        // 单位技能 法力恢复光环
        integer Aarm
        // 单位技能 生命恢复光环(中立)
        integer ACnr
        // 单位技能 法力恢复(中立)
        integer ANre
        // 单位技能 返送黄金
        integer Argd
        // 单位技能 返送黄金和木材
        integer Argl
        // 单位技能 返送木材
        integer Arlm
        // 单位技能 未知技能(中立敌对)
        integer Aand
        // 单位技能 反魔法护罩(中立敌对)
        integer ACam
        // 单位技能 辉煌光环(中立敌对)
        integer ACba
        // 单位技能 猛击(中立敌对1)
        integer ACbh
        // 单位技能 猛击(中立敌对2)
        integer ANbh
        // 单位技能 重殴(中立敌对3/重殴)
        integer ANb2
        // 单位技能 疾病之云(编辑器无此技能)
        integer Aapl
        // 单位技能 疾病之云(憎恶)
        integer Aap1
        // 单位技能 疾病之云(瘟疫结界)
        integer Aap2
        // 单位技能 疾病之云(中立敌对)
        integer Aap3
        // 单位技能 疾病之云(清道夫)
        integer Apts
        // 单位技能 疾病之云(中立敌对)(无伤害)
        integer Aap4
        // 单位技能 强击光环(中立敌对)
        integer ACat
        // 单位技能 荒芜
        integer Abli
        // 单位技能 荒芜驱散 小
        integer Abds
        // 单位技能 荒芜驱散 大
        integer Abdl
        // 单位技能 荒芜蔓延 小
        integer Abgs
        // 单位技能 荒芜蔓延 大
        integer Abgl
        // 单位技能 暴风雪(中立敌对)
        integer ACbz
        // 单位技能 食尸(中立敌对)
        integer ACcn
        // 单位技能 腐臭蝠群(中立敌对)
        integer ACca
        // 单位技能 闪电链(中立敌对)
        integer ACcl
        // 单位技能 寒冰箭矢(中立敌对)
        integer ACcw
        // 单位技能 残废术(中立敌对)
        integer ACcr
        // 单位技能 致命一击(中立敌对)
        integer ACct
        // 单位技能 诅咒(中立敌对)
        integer ACcs
        // 单位技能 飓风术(中立敌对)
        integer ACcy
        // 单位技能 枯萎凋零(中立敌对)
        integer SNdd
        // 单位技能 凋零缠绕(中立敌对)
        integer ACdc
        // 单位技能 侦测者
        integer Adet
        // 单位技能 侦测者(警戒结界)
        integer Adt1
        // 单位技能 侦测者(影魔)(未使用)
        integer Adt2
        // 单位技能 侦测者(飞行器)(未使用)
        integer Adt3
        // 单位技能 驱散魔法(中立敌对)
        integer Adsm
        // 单位技能 驱除魔法(中立敌对)
        integer ACdm
        // 单位技能 驱除魔法(中立敌对、二号位)
        integer ACd2
        // 单位技能 圣盾术(中立敌对)
        integer ACds
        // 单位技能 坚韧光环(中立敌对)
        integer SCae
        // 单位技能 诱捕(中立敌对)
        integer ACen
        // 单位技能 纠缠根须(中立敌对1)
        integer Aenr
        // 单位技能 闪避(中立敌对)
        integer ACev
        // 单位技能 闪避(中立敌对)(100%生效)
        integer ACes
        // 单位技能 精灵之火(中立敌对)
        integer ACff
        // 单位技能 野性之魂(中立敌对)
        integer ACsf
        // 单位技能 野性之魂(中立敌对、猪)
        integer ACs9
        // 单位技能 火焰箭(中立敌对)
        integer ACfb
        // 单位技能 自然之力(中立敌对)
        integer ACfr
        // 单位技能 霜甲术(中立敌对)
        integer ACfa
        // 单位技能 霜甲术(自动施法)(中立敌对)
        integer ACf2
        // 单位技能 霜甲术(自动施法)(中立敌对)
        integer ACfu
        // 单位技能 冰霜新星(中立敌对)
        integer ACfn
        // 单位技能 采集(阿克蒙德的食尸鬼采集木材)
        integer Ahr2
        // 单位技能 采集(地精伐木机采集木材)
        integer Ahr3
        // 单位技能 治疗术(中立敌对2)
        integer Anh1
        // 单位技能 治疗术(中立敌对3)
        integer Anh2
        // 单位技能 献祭(中立敌对)
        integer ACim
        // 单位技能 未知技能(总是开启)
        integer ACma
        // 单位技能 心灵之火(中立敌对)
        integer ACif
        // 单位技能 闪电之盾(中立敌对)
        integer ACls
        // 单位技能 变形术(中立敌对)
        integer ACpy
        // 单位技能 占据(中立敌对)
        integer ACps
        // 单位技能 粉碎(中立敌对)
        integer ACpv
        // 单位技能 净化(中立敌对)
        integer ACpu
        // 单位技能 火焰之雨(中立敌对2)
        integer ACrf
        // 单位技能 亡者复生(中立敌对)
        integer ACrd
        // 单位技能 回春术(中立敌对)
        integer ACrj
        // 单位技能 修理(人族)
        integer Ahrp
        // 单位技能 咆哮(中立敌对)
        integer ACro
        // 单位技能 咆哮(骷髅兽人勇士)
        integer ACr1
        // 单位技能 扎根(古树)
        integer Aro1
        // 单位技能 扎根(守护古树)
        integer Aro2
        // 单位技能 灼热之箭(中立敌对)
        integer ACsa
        // 单位技能 震荡波(中立敌对)
        integer ACsh
        // 单位技能 震荡波(陷阱)
        integer ACst
        // 单位技能 沉睡(中立敌对)
        integer ACsl
        // 单位技能 减速术(中立敌对)
        integer ACsw
        // 单位技能 荆棘光环(中立敌对)
        integer ACah
        // 单位技能 邪恶光环(中立敌对)
        integer ACua
        // 单位技能 邪恶狂热(中立敌对)
        integer ACuf
        // 单位技能 生命窃取(霜之哀伤)
        integer SCva
        // 单位技能 吸血光环(中立敌对)
        integer ACvp
        // 单位技能 战争践踏(中立敌对1),(中立敌对)
        integer Awrs
        // 单位技能 战争践踏(中立敌对2),(中立敌对)
        integer Awrh
        // 单位技能 战争践踏(中立敌对3),(中立敌对)
        integer Awrg
        // 单位技能 粉碎(中立敌对)
        integer ACpv
        // 单位技能 浸毒武器(中立敌对)
        integer ACvs
        // 单位技能 蛛网(中立敌对)
        integer ACwb
        // 单位技能 粉碎波浪
        integer ACcv
        // 单位技能 粉碎波浪(次级)
        integer ACc2
        // 单位技能 粉碎波浪(次级)
        integer ACc3
        // 单位技能 召唤海元素
        integer ACwe
        // 单位技能 凤凰烈焰(飞行单位)
        integer Apmf
        // 单位技能 抗性体肤(中立敌对1)
        integer ACrk
        // 单位技能 抗性体肤(中立敌对2)
        integer ACsk
        // 单位技能 叉状闪电(中立敌对)
        integer ACfl
        // 单位技能 孳生触须
        integer ACtn
        // 单位技能 反噬
        integer Afbb
        // 单位技能 驱除魔法(娜迦)
        integer Andm
        // 单位技能 采集(娜迦)(中立)(采集黄金和木材)
        integer ANha
        // 单位技能 诱捕(娜迦)
        integer ANen
        // 单位技能 寄生虫(娜迦)
        integer ANpa
        // 单位技能 飓风术(娜迦)
        integer Acny
        // 单位技能 召唤仪式(娜迦)
        integer Ahnl
        // 单位技能 地洞侦测(飞行单位、已废弃)
        integer Abdt
        // 单位技能 骑乘
        integer Amou
        // 单位技能 采集(黄金和木材)
        integer Ahar
        // 单位技能 采集(食尸鬼采集木材)
        integer Ahrl
        // 单位技能 暴露
        integer Adta
        // 单位技能 修理(兽族、娜迦族、达拉内尔族(破碎者))
        integer Arep
        // 单位技能 建造(暗夜精灵)
        integer AEbu
        // 单位技能 建造(纳迦)
        integer AGbu
        // 单位技能 建造(人族)
        integer AHbu
        // 单位技能 建造(中立)
        integer ANbu
        // 单位技能 建造(兽人)
        integer AObu
        // 单位技能 建造(亡灵)
        integer AUbu
        // 单位技能 着火(人类)
        integer Afih
        // 单位技能 着火(暗夜精灵)
        integer Afin
        // 单位技能 着火(兽人)
        integer Afio
        // 单位技能 着火
        integer Afir
        // 单位技能 着火(亡灵)
        integer Afiu
        // 单位技能 蝗虫
        integer Aloc
        // 单位技能 卸下驾驶员
        integer Atdp
        // 单位技能 装载驾驶员
        integer Atlp
        // 单位技能 塔楼
        integer Attu
        // 单位技能 复仇之魂
        integer Avng
        // 单位技能 法力闪耀
        integer Amfl
        // 单位技能 相位变换
        integer Apsh
        // 单位技能 虚灵(暗夜精灵族)
        integer Aetl
        // 单位技能 球体(复仇 - 1级)
        integer Asp1
        // 单位技能 球体(复仇 - 2级)
        integer Asp2
        // 单位技能 球体(复仇 - 3级)
        integer Asp3
        // 单位技能 球体(复仇 - 4级)
        integer Asp4
        // 单位技能 球体(复仇 - 5级)
        integer Asp5
        // 单位技能 球体(复仇 - 6级)
        integer Asp6
        // 单位技能 战棍
        integer Agra
        // 单位技能 硬化体肤
        integer Assk
        // 单位技能 抗性体肤
        integer Arsk
        // 单位技能 嘲讽
        integer Atau
        // 单位技能 月刃
        integer Amgl
        // 单位技能 月刃(娜萨)
        integer Amgr
        // 单位技能 减速毒药
        integer Aspo
        // 单位技能 哨兵
        integer Aesn
        // 单位技能 哨兵(娜萨)
        integer Aesr
        // 单位技能 吃树
        integer Aeat
        // 单位技能 补充法力和生命
        integer Ambt
        // 单位技能 采集(小精灵采集黄金和木材)
        integer Awha
        // 单位技能 采集(小精灵黄金和木材－远古之魂)
        integer Awh2
        // 单位技能 自爆
        integer Adtn
        // 单位技能 治疗术
        integer Awhe
        // 单位技能 扎根
        integer Aroo
        // 单位技能 熊形态
        integer Abrf
        // 单位技能 风暴乌鸦形态
        integer Arav
        // 单位技能 不明技能(用于熊德变身)(可选的)
        integer Sbr2
        // 单位技能 不明技能(用于鸟德变身)(可选的)
        integer Sra2
        // 单位技能 驱除魔法
        integer Aadm
        // 单位技能 法术免疫
        integer Amim
        // 单位技能 夜视能力
        integer Ault
        // 单位技能 艾露恩的赐福
        integer Aegr
        // 单位技能 骑乘角鹰兽(老的)
        integer Acoa
        // 单位技能 骑乘角鹰兽
        integer Aco2
        // 单位技能 搭载弓箭手(老的)
        integer Acoh
        // 单位技能 搭载弓箭手
        integer Aco3
        // 单位技能 解散(角鹰兽骑士骑乘)
        integer Adec
        // 单位技能 腐蚀吐息
        integer Acor
        // 单位技能 精灵之火
        integer Afae
        // 单位技能 精灵之火(变形)
        integer Afa2
        // 单位技能 飓风术
        integer Acyc
        // 单位技能 回春术
        integer Arej
        // 单位技能 复苏/更新(暗夜精灵族修理建筑)
        integer Aren
        // 单位技能 咆哮
        integer Aroa
        // 单位技能 咆哮(变形)
        integer Ara2
        // 单位技能 闪电攻击
        integer Alit
        // 单位技能 不明技能(标注为生命之树升级)
        integer Atol
        // 单位技能 隐藏/影遁(物品)
        integer AIhm
        // 单位技能 空中枷锁
        integer Amls
        // 单位技能 暴露
        integer AHta
        // 单位技能 反噬(破法者)
        integer Afbk
        // 单位技能 反噬(奥术塔)
        integer Afbt
        // 单位技能 控制魔法
        integer Acmg
        // 单位技能 对空机炮
        integer Aflk
        // 单位技能 破片榴弹
        integer Afsh
        // 单位技能 火箭弹幕
        integer Aroc
        // 单位技能 混乱
        integer Srtt
        // 单位技能 魔法防御
        integer Amdf
        // 单位技能 球体
        integer Asph
        // 单位技能 法术窃取
        integer Asps
        // 单位技能 迷雾之云
        integer Aclf
        // 单位技能 凤凰变形 (凤凰蛋相关)
        integer Aphx
        // 单位技能 凤凰烈焰
        integer Apxf
        // 单位技能 飞行器炸弹
        integer Agyb
        // 单位技能 风暴战锤
        integer Asth
        // 单位技能 真视(飞行器)
        integer Agyv
        // 单位技能 防御
        integer Adef
        // 单位技能 照明弹
        integer Afla
        // 单位技能 魔法岗哨(人类防御塔)
        integer Adts
        // 单位技能 心灵之火
        integer Ainf
        // 单位技能 驱散魔法
        integer Adis
        // 单位技能 治疗术
        integer Ahea
        // 单位技能 减速术
        integer Aslo
        // 单位技能 隐形术
        integer Aivs
        // 单位技能 变形术
        integer Aply
        // 单位技能 战斗号召(农夫)
        integer Amil
        // 单位技能 战斗号召(议政厅)
        integer Amic
        // 单位技能 裂甲之刃
        integer Ahsb
        // 单位技能 荒芜上的生命恢复
        integer Ablr
        // 单位技能 补充
        integer Arpb
        // 单位技能 荒芜精华
        integer Arpl
        // 单位技能 灵魂之触
        integer Arpm
        // 单位技能 发掘尸体
        integer Aexh
        // 单位技能 补充法力
        integer Amb2
        // 单位技能 毁灭者形态
        integer Aave 
        // 单位技能 毁灭宝珠
        integer Afak
        // 单位技能 吞噬魔法
        integer Advm
        // 单位技能 荒芜光环
        integer Aabr
        // 单位技能 吸收法力
        integer Aabs
        // 单位技能 钻地(地穴恶魔)
        integer Abur
        // 单位技能 钻地(2级甲虫)
        integer Abu2
        // 单位技能 钻地(3级甲虫)
        integer Abu3
        // 单位技能 真视(影魔)
        integer Atru
        // 单位技能 采集(侍僧黄金)
        integer Aaha
        // 单位技能 反召唤建筑
        integer Auns
        // 单位技能 产生尸体
        integer Agyd
        // 单位技能 献祭(侍僧)
        integer Alam
        // 单位技能 献祭(献祭深渊)
        integer Asac
        // 单位技能 食尸(食尸鬼)
        integer Acan
        // 单位技能 食尸(憎恶)
        integer Acn2
        // 单位技能 蜘蛛攻击
        integer Aspa
        // 单位技能 蛛网
        integer Aweb
        // 单位技能 石像形态
        integer Astn
        // 单位技能 亡者复生
        integer Arai
        // 单位技能 邪恶狂热
        integer Auhf
        // 单位技能 邪恶狂热(术士)
        integer Suhf
        // 单位技能 诅咒
        integer Acrs
        // 单位技能 反魔法护罩
        integer Aams
        // 单位技能 反魔法护罩(魔法抗性)
        integer Aam2
        // 单位技能 占据
        integer Apos
        // 单位技能 占据(引导中)
        integer Aps2
        // 单位技能 残废术
        integer Acri
        // 单位技能 残废术(术士)
        integer Scri
        // 单位技能 恢复(不死族修理建筑)
        integer Arst
        // 单位技能 邪恶狂潮
        integer Auuf
        // 单位技能 燃油
        integer Abof
        // 单位技能 狂暴
        integer Absk
        // 单位技能 狂战士升级
        integer Sbsk
        // 单位技能 加强型地洞升级
        integer Arbr
        // 单位技能 先祖之魂
        integer Aast
        // 单位技能 消魔(老的)
        integer Adch
        // 单位技能 消魔
        integer Adcn
        // 单位技能 肉身形态
        integer Acpf
        // 单位技能 虚灵形态
        integer Aetf
        // 单位技能 灵魂链接
        integer Aspl
        // 单位技能 火油瓶
        integer Aliq
        // 单位技能 不稳定化合物
        integer Auco
        // 单位技能 火焰箭(术士)
        integer Awfb
        // 单位技能 混乱(兽人步兵)
        integer Acha
        // 单位技能 混乱
        integer Sca1
        // 单位技能 混乱(狼骑兵)
        integer Sca2
        // 单位技能 混乱(萨满祭司)
        integer Sca3
        // 单位技能 混乱(科多兽)
        integer Sca4
        // 单位技能 混乱(苦工)
        integer Sca5
        // 单位技能 混乱(格罗玛什)
        integer Sca6
        // 单位技能 粉碎
        integer Awar
        // 单位技能 战斗戒备
        integer Abtl
        // 单位技能 解除戒备
        integer Astd
        // 单位技能 诱捕
        integer Aens
        // 单位技能 粉碎
        integer Awar
        // 单位技能 吞噬
        integer Adev
        // 单位技能 净化
        integer Aprg
        // 单位技能 净化
        integer Apg2
        // 单位技能 闪电之盾
        integer Alsh
        // 单位技能 嗜血
        integer Ablo
        // 单位技能 警戒结界
        integer Aeye
        // 单位技能 静滞陷阱
        integer Asta
        // 单位技能 治疗结界(巫医)
        integer Ahwd
        // 单位技能 治疗结界光环(治疗结界)
        integer Aoar
        // 单位技能 毒矛
        integer Aven
        // 单位技能 毒刺
        integer Apoi
        // 单位技能 毒刺(毒液之球)
        integer Apo2
        // 单位技能 追踪术
        integer Anit
        // 单位技能 尖刺障碍
        integer Aspi
        // 单位技能 掠夺
        integer Asal
        // 单位技能 掠夺
        integer Asa2
        // 单位技能 战鼓
        integer Aakb


// 物品技能

        // 物品技能 监视符文
        integer APwt
        // 物品技能 闪现
        integer AIbk
        // 物品技能 力量提升
        integer AIsm
        // 物品技能 敏捷提升
        integer AIam
        // 物品技能 暂时速度加成
        integer AIsp
        // 物品技能 攻击力加成(+3)
        integer AIat
        // 物品技能 护甲加成
        integer AIde
        // 物品技能 范围树木/城墙伤害
        integer AIdm
        // 物品技能 经验获取
        integer AIem
        // 物品技能 经验获取(强效)
        integer AIe2
        // 物品技能 浓雾之云
        integer AIfg
        // 物品技能 夺取旗帜
        integer AIfl
        // 物品技能 夺取旗帜(人类)
        integer AIfm
        // 物品技能 夺取旗帜(暗夜精灵)
        integer AIfn
        // 物品技能 夺取旗帜(兽人)
        integer AIfo
        // 物品技能 夺取旗帜(亡灵)
        integer AIfe
        // 物品技能 等级提升
        integer AIlm
        // 物品技能 智力提升
        integer AIim
        // 物品技能 力量/敏捷/智力提升
        integer AIxm
        // 物品技能 治疗
        integer AIhe
        // 物品技能 治疗(最小的)
        integer AIhx
        // 物品技能 范围治疗
        integer AIha
        // 物品技能 范围治疗(强效)
        integer AIhb
        // 物品技能 范围治疗 - 次级
        integer APh1
        // 物品技能 范围治疗
        integer APh2
        // 物品技能 范围治疗 - 强效
        integer APh3
        // 物品技能 暂时隐形
        integer AIvi
        // 物品技能 暂时无敌
        integer AIvu
        // 物品技能 暂时无敌(次级)
        integer AIvl
        // 物品技能 法力值恢复
        integer AIma
        // 物品技能 范围法力值恢复
        integer AImr
        // 物品技能 符文 - 范围法力值恢复
        integer APmr
        // 物品技能 符文 - 范围法力值恢复 - 强效
        integer APmg
        // 物品技能 生命值/法力值恢复
        integer AIre
        // 物品技能 范围生命值/法力值恢复
        integer AIra
        // 物品技能 符文 - 范围生命值/法力值恢复
        integer APra
        // 物品技能 暂时范围护甲加成
        integer AIda
        // 物品技能 暂时范围护甲加成(有生命&法力恢复)
        integer AIdb
        // 物品技能 保护卷轴
        integer Bdef
        // 物品技能 范围侦测
        integer AIta
        // 物品技能 法力恢复
        integer AIrm
        // 物品技能 火焰箭
        integer AIfi
        // 物品技能 幻象
        integer AIil
        // 物品技能 幻象
        integer BIil
        // 物品技能 驱散
        integer AIdi
        // 物品技能 驱散(有冷却时间)
        integer AIds
        // 物品技能 驱散
        integer APdi
        // 物品技能 攻击火焰加成
        integer AIfb
        // 物品技能 攻击闪电加成
        integer AIlb
        // 物品技能 攻击黑蚀箭加成
        integer AIdf
        // 物品技能 净化(1)
        integer AIlp
        // 物品技能 攻击冰霜加成
        integer AIob
        // 物品技能 攻击毒素加成
        integer AIpb
        // 物品技能 攻击腐化加成
        integer AIcb
        // 物品技能 腐蚀
        integer BIcb
        // 物品技能 视野范围加成
        integer AIsi
        // 物品技能 盗取灵魂
        integer AIso
        // 物品技能 灵魂占据
        integer Asou
        // 物品技能 盗取灵魂
        integer BIsv
        // 物品技能 重生
        integer AIrc
        // 物品技能 召回
        integer AIrt
        // 物品技能 城镇传送
        integer AItp
        // 物品技能 统御
        integer AIco
        // 物品技能 召唤红色/蓝色幼龙
        integer AIfd
        // 物品技能 召唤熊怪/蓝色龙人
        integer AIff
        // 物品技能 召唤岩石魔像
        integer AIfr
        // 物品技能 召唤末日守卫
        integer AIfu
        // 物品技能 召唤恶魔猎犬
        integer AIfh
        // 物品技能 召唤骷髅
        integer AIfs
        // 物品技能 召唤冰雪亡魂
        integer AIir
        // 物品技能 召唤巨熊怪战士
        integer AIuw
        // 物品技能 召唤单位
        integer BFig
        // 物品技能 放置地精地雷
        integer AIpm
        // 物品技能 永久伤害提升,攻击力提升
        integer AIaa
        // 物品技能 永久生命值提升,生命值提升
        integer AImi
        // 物品技能 永久生命值提升(次级)
        integer AIpx
        // 物品技能 生命窃取
        integer AIva
        // 物品技能 献祭
        integer AIcf
        // 物品技能 烈焰披风
        integer BIcf
        // 物品技能 英雄属性加成
        integer AIab
        // 物品技能 冰冻攻击力加成
        integer AIzb
        // 物品技能 生命值加成
        integer AIml
        // 物品技能 生命值加成(最小的)
        integer AIlz
        // 物品技能 生命恢复
        integer Arel
        // 物品技能 反魔法护罩
        integer Aami
        // 物品技能 法力值加成
        integer AImm
        // 物品技能 法力值加成(100)
        integer AImz
        // 物品技能 法力值加成(75)
        integer AImv
        // 物品技能 法力值加成(200)
        integer AI2m
        // 物品技能 攻击速度加成
        integer AIas
        // 物品技能 攻击速度加成(急速手套)
        integer AIsx
        // 物品技能 攻击速度加成(强效)
        integer AIs2
        // 物品技能 亡者再临
        integer AIan
        // 物品技能 复活术
        integer AIrs
        // 物品技能 复活术(冷却时间)
        integer AIrx
        // 物品技能 次级复活符文
        integer APrl
        // 物品技能 强效复活符文
        integer APrr
        // 物品技能 永久伤害提升 - 攻击力提升
        integer AIaa
        // 物品技能 永久生命值提升 - 生命值提升
        integer AImi
        // 物品技能 移动速度加成
        integer AIms
        // 物品技能 英雄属性加成(+3 敏捷)
        integer AIa3
        // 物品技能 英雄属性加成(+4 敏捷)
        integer AIa4
        // 物品技能 英雄属性加成(+6 敏捷)
        integer AIa6
        // 物品技能 英雄属性加成(+10 敏捷)
        integer AIaz
        // 物品技能 英雄属性加成(+5 所有属性)
        integer AIx5
        // 物品技能 英雄属性加成(+2 所有属性)
        integer AIx2
        // 物品技能 英雄属性加成(+3 力量)
        integer AIs3
        // 物品技能 英雄属性加成(+4 力量)
        integer AIs4
        // 物品技能 英雄属性加成(+6 力量)
        integer AIs6
        // 物品技能 英雄属性加成(+3 智力)
        integer AIi3
        // 物品技能 英雄属性加成(+4 智力)
        integer AIi4
        // 物品技能 英雄属性加成(+6 智力)
        integer AIi6
        // 物品技能 敏捷提升(+2)
        integer AIgm
        // 物品技能 智力提升(+2)
        integer AItm
        // 物品技能 力量提升(+2)
        integer AInm
        // 物品技能 攻击力加成(+6)
        integer AIt6
        // 物品技能 攻击力加成(+9)(在1.36中为+8,技能名称和说明未修改)
        integer AIt9
        // 物品技能 攻击力加成(+12)
        integer AItc
        // 物品技能 攻击力加成(+15)
        integer AItf
        // 物品技能 飓风术
        integer AIcy
        // 物品技能 护甲加成(+1)
        integer AId1
        // 物品技能 护甲加成(+2)
        integer AId2
        // 物品技能 护甲加成(+3)
        integer AId3
        // 物品技能 护甲加成(+4)
        integer AId4
        // 物品技能 护甲加成(+5)
        integer AId5
        // 物品技能 护甲加成(+7)
        integer AId7
        // 物品技能 护甲加成(+8)
        integer AId8
        // 物品技能 护甲加成(+10)
        integer AId0
        // 物品技能 召唤地狱火
        integer AIin
        // 物品技能 生命值加成(最小的)
        integer AIlf
        // 物品技能 生命值加成(次级)
        integer AIl1
        // 物品技能 生命值加成(强效)
        integer AIl2
        // 物品技能 生命恢复(次级)
        integer Arll
        // 物品技能 治疗(次级)
        integer AIh1
        // 物品技能 治疗(强效)
        integer AIh2
        // 物品技能 治疗结界
        integer AIhw
        // 物品技能 警戒结界
        integer AIsw
        // 物品技能 暂时隐形(次级)
        integer AIv1
        // 物品技能 暂时隐形(强效)
        integer AIv2
        // 物品技能 法力值恢复(次级)
        integer AIm1
        // 物品技能 法力值恢复(强效)
        integer AIm2
        // 物品技能 法力恢复(次级)
        integer AIrn
        // 物品技能 虔诚光环
        integer AIad
        // 物品技能 统御光环
        integer AIcd
        // 物品技能 辉煌光环
        integer AIba
        // 物品技能 吸血光环
        integer AIav
        // 物品技能 强击光环
        integer AIar
        // 物品技能 坚韧光环
        integer AIae
        // 物品技能 邪恶光环
        integer AIau
        // 物品技能 闪电之盾
        integer AIls
        // 物品技能 咆哮
        integer AIrr
        // 物品技能 闪避
        integer AIev
        // 物品技能 法术免疫
        integer AImx
        // 物品技能 法力值加成(最小的)
        integer AImb
        // 物品技能 法力值加成(强效)
        integer AIbm
        // 物品技能 夜视能力
        integer AIuv
        // 物品技能 永久生命值提升(+50)
        integer AImh
        // 物品技能 英雄属性加成(+1 敏捷)
        integer AIa1
        // 物品技能 英雄属性加成(+1 所有属性)
        integer AIx1
        // 物品技能 英雄属性加成(+1 力量)
        integer AIs1
        // 物品技能 英雄属性加成(+1 智力)
        integer AIi1
        // 物品技能 飞毯
        integer AIfc
        // 物品技能 治疗药膏
        integer AIrl
        // 物品技能 再生(持续恢复)
        integer BIrl
        // 物品技能 明澈药水
        integer AIpr
        // 物品技能 次级明澈药水
        integer AIpl
        // 物品技能 普通物品技能 恢复效果
        integer AIp1
        // 物品技能 明澈药水(持续恢复)
        integer BIrm
        // 物品技能 普通物品技能 恢复效果(II)
        integer AIp2
        // 物品技能 普通物品技能 恢复效果(III)
        integer AIp3
        // 物品技能 普通物品技能 恢复效果(IV)
        integer AIp4
        // 物品技能 普通物品技能 恢复效果(V)
        integer AIp5
        // 物品技能 普通物品技能 恢复效果(VI)
        integer AIp6
        // 物品技能 恢复卷轴
        integer AIsl
        // 物品技能 回春术(持续恢复)
        integer BIrg
        // 物品技能 一箱黄金
        integer AIgo
        // 物品技能 一捆木材
        integer AIlu
        // 物品技能 信号枪
        integer AIfa
        // 物品技能 暴露整张地图
        integer AIrv
        // 物品技能 连锁驱散
        integer AIdc
        // 物品技能 蛛网
        integer AIwb
        // 物品技能 怪兽诱饵
        integer AImo
        // 物品技能 怪兽诱饵
        integer BImo
        // 物品技能 随机物品
        integer AIri
        // 物品技能 放置荒芜
        integer Ablp
        // 物品技能 窃取
        integer Aste
        // 物品技能 改变一天的时间
        integer AIct
        // 物品技能 吸血药水
        integer AIpv
        // 物品技能 吸血药水
        integer BIpv
        // 物品技能 法术伤害减免
        integer AIsr
        // 物品技能 建造迷你城堡
        integer AIbl
        // 物品技能 建造迷你大厅
        integer AIbg
        // 物品技能 建造迷你哨塔
        integer AIbt
        // 物品技能 影眼魔杖
        integer Ashs
        // 物品技能 影眼魔杖
        integer Bshs
        // 物品技能 重修之书
        integer Aret
        // 物品技能 传送法杖
        integer AImt
        // 物品技能 保存法杖
        integer ANpr
        // 物品技能 机械小动物
        integer Amec
        // 物品技能 机械小动物
        integer Bmec
        // 物品技能 法术护盾(护符)
        integer ANss
        // 物品技能 法术护盾(符文)
        integer ANse
        // 物品技能 法术护盾
        integer BNss
        // 物品技能 法术书
        integer Aspb
        // 物品技能 亡者复生
        integer AIrd
        // 物品技能 庇护法杖
        integer ANsa
        // 物品技能 庇护
        integer BNsa
        // 物品技能 急速卷轴
        integer AIsa
        // 物品技能 速度符文
        integer APsa
        // 物品技能 显影之尘
        integer AItb
        // 物品技能 显影之尘
        integer Bdet
        // 物品技能 攻击减速加成
        integer AIsb
        // 物品技能 攻击闪电加成(新的)
        integer AIll
        // 物品技能 减速
        integer AIos
        // 物品技能 黑蚀箭
        integer ANbs
        // 物品技能 灵魂链接(范围)
        integer Aspp
        // 物品技能 重生
        integer AIrb
        // 物品技能 重生(这个单位已经重生过了)
        integer BIrb
        // 物品技能 黑暗召唤
        integer AUds
        // 物品技能 反魔法护罩
        integer AIxs
        // 物品技能 圣盾术
        integer AIdv
        // 物品技能 沉默
        integer AIse
        // 物品技能 净化(2)
        integer AIpg
        // 物品技能 净化(3)
        integer AIps
        // 物品技能 攻击力加成(+1)
        integer AItg
        // 物品技能 攻击力加成(+2)
        integer AIth
        // 物品技能 攻击力加成(+4)
        integer AIti
        // 物品技能 攻击力加成(+5)(在1.36中为+4,技能名称和说明未修改)
        integer AItj
        // 物品技能 攻击力加成(+7)
        integer AItk
        // 物品技能 攻击力加成(+8)
        integer AItl
        // 物品技能 攻击力加成(+10)
        integer AItn
        // 物品技能 攻击力加成(+20)
        integer AItx
        // 物品技能 最低治疗(减慢冷却时间)
        integer AIh3
        // 物品技能 兽人战旗
        integer AIfx
        // 物品技能 攻击火焰加成(古尔丹)
        integer AIgd
        // 物品技能 建造迷你列王祭坛
        integer AIbh
        // 物品技能 建造迷你铁匠铺
        integer AIbb
        // 物品技能 建造迷你伐木场
        integer AIbr
        // 物品技能 建造迷你农场
        integer AIbf
        // 物品技能 建造迷你兵营
        integer AIbs
        // 物品技能 暗影宝珠技能
        integer AIdn
        // 物品技能 复活(特别战役物品)
        integer AInd
        // 物品技能 邪恶狂热
        integer AIuf
        // 物品技能 控制魔法
        integer AIcm
        // 物品技能 死亡一指
        integer AIfz
        // 物品技能 天灾契约
        integer AIdp
        // 物品技能 防御(被动防御)
        integer AIdd
        // 物品技能 猛击
        integer AIbx
        // 物品技能 水栖奴仆
        integer AIwm
        // 物品技能 召唤猎头者
        integer AIsh
        // 物品技能 猎头者之灵
        integer BIsh
        // 物品技能 恢复光环
        integer AIgx
        // 物品技能 圣光术
        integer AIhl
        // 物品技能 减速毒药
        integer AIsz
        // 物品技能 企鹅叫
        integer AIpz
        // 物品技能 近战火焰攻击力加成
        integer AIfw
        // 物品技能 近战冰霜攻击力加成
        integer AIft
        // 物品技能 近战闪电攻击力加成
        integer AIlx
        // 物品技能 致命一击
        integer AIcs
        // 物品技能 防御
        integer AIdd
        // 物品技能 闪电链
        integer AIcl
        // 物品技能 狂暴
        integer AIxk
        // 物品技能 蛛网
        integer BIwb
        // 物品技能 传送 - 暴露
        integer Btrv
        // 物品技能 仪式匕首(瞬发治疗)
        // @version 1.30
        integer AIdg
        // 物品技能 治疗减免(降低目标单位的生命恢复速度)
        integer BIhm
        // 物品技能 战鼓
        integer AIwd
        // 物品技能 仪式匕首(持续恢复)
        // @version 1.30
        integer AIg2
        // 物品技能 暂时无敌(神圣)
        integer AIvg
        // 物品技能 攻击治疗减免加成
        integer AIf2
        // 物品技能 点金术
        integer AIts
        // 物品技能 召唤熊怪追踪者
        integer AIut
        // 物品技能 英雄属性加成(+5 敏捷)
        integer AIa5
        // 物品技能 英雄属性加成(+3 所有属性)
        integer AIx3
        // 物品技能 英雄属性加成(+4 所有属性)
        integer AIx4
        // 物品技能 英雄属性加成(+5 力量)
        integer AIs5
        // 物品技能 英雄属性加成(+5 智力)
        integer AIi5


// 魔法效果 (BUFF)


        // 魔法效果 (BUFF) 永久献祭(中立敌对1)
        integer BNpi
        // 魔法效果 (BUFF) 永久献祭(中立敌对2)
        integer Bpig
        // 魔法效果 (BUFF) 灵魂保存
        integer BNsl
        // 魔法效果 (BUFF) 群兽奔腾
        integer BNst
        // 魔法效果 (BUFF) 火焰之雨(范围)
        integer BNrf
        // 魔法效果 (BUFF) 冰冻
        integer Bfre
        // 魔法效果 (BUFF) 共享视野
        integer Bsha
        // 魔法效果 (BUFF) 龙卷风伤害
        integer Btdg
        // 魔法效果 (BUFF) 龙卷风旋转(范围)
        integer Btsa
        // 魔法效果 (BUFF) 季风
        integer ANmd
        // 魔法效果 (BUFF) 混乱之雨(效果)
        integer XErc
        // 魔法效果 (BUFF) 火焰之雨(效果)
        integer XErf
        // 魔法效果 (BUFF) 改变一天的时间(物品)
        integer XIct
        // 魔法效果 (BUFF) 季风(效果)
        integer XNmo
        // 魔法效果 (BUFF) 火山爆发(范围)
        integer BNva
        // 魔法效果 (BUFF) 火山爆发(效果)
        integer XNvc
        // 魔法效果 (BUFF) 集束火箭(效果)
        integer XNcs
        // 魔法效果 (BUFF) 治疗喷雾(效果)
        integer XNhs
        // 魔法效果 (BUFF) 焚身化骨
        integer BNic
        // 魔法效果 (BUFF) 灵魂燃烧
        integer BNso
        // 魔法效果 (BUFF) 熔岩爪牙
        integer BNlm
        // 魔法效果 (BUFF) 口袋工厂
        integer BNfy
        // 魔法效果 (BUFF) 集束火箭
        integer BNcs
        // 魔法效果 (BUFF) 工程学升级
        integer BNeg
        // 魔法效果 (BUFF) 发条地精
        integer BNcg
        // 魔法效果 (BUFF) 治疗喷雾
        integer BNhs
        // 魔法效果 (BUFF) 酸液炸弹
        integer BNab
        // 魔法效果 (BUFF) 化学狂暴
        integer BNcr
        // 魔法效果 (BUFF) 点金术
        integer BNtm
        // 魔法效果 (BUFF) 法力护盾
        integer BNms
        // 魔法效果 (BUFF) 火焰之雨
        integer BNrd
        // 魔法效果 (BUFF) 寒冰箭矢
        integer BHca
        // 魔法效果 (BUFF) 寒冰箭矢(叠加)
        integer Bcsd
        // 魔法效果 (BUFF) 寒冰箭矢(信息)
        integer Bcsi
        // 魔法效果 (BUFF) 恐惧嚎叫
        integer BNht
        // 魔法效果 (BUFF) 末日降临
        integer BNdo
        // 魔法效果 (BUFF) 末日降临(奴仆)
        integer BNdi
        // 魔法效果 (BUFF) 熊猫人元素之灵
        integer BNef
        // 魔法效果 (BUFF) 巨熊
        integer BNsg
        // 魔法效果 (BUFF) 豪猪
        integer BNsq
        // 魔法效果 (BUFF) 战鹰
        integer BNsw
        // 魔法效果 (BUFF) 心智腐烂
        integer BNmr
        // 魔法效果 (BUFF) 火焰之息
        integer BNbf
        // 魔法效果 (BUFF) 酩酊酒雾
        integer BNdh
        // 魔法效果 (BUFF) 沉默
        integer BNsi
        // 魔法效果 (BUFF) 黑蚀箭
        integer BNba
        // 魔法效果 (BUFF) 黑暗奴仆
        integer BNdm
        // 魔法效果 (BUFF) 季风
        integer BNmo
        // 魔法效果 (BUFF) 水栖奴仆
        integer BNwm
        // 魔法效果 (BUFF) 龙卷风(减速光环)
        integer Basl
        // 魔法效果 (BUFF) 龙卷风旋转(自动施放飓风)
        integer Btsp
        // 魔法效果 (BUFF) 龙卷风(时间化生命)
        integer BNto
        // 魔法效果 (BUFF) 黑暗转换
        integer BNdc
        // 魔法效果 (BUFF) 灵魂保存
        integer BNsp
        // 魔法效果 (BUFF) 眩晕
        integer Bchd
        // 魔法效果 (BUFF) 地狱火
        integer BNin
        // 魔法效果 (BUFF) 狂乱
        integer Bfzy
        // 魔法效果 (BUFF) 统御光环
        integer Boac
        // 魔法效果 (BUFF) 时间化生命
        integer Btlf
        // 魔法效果 (BUFF) 法力恢复光环
        integer Barm
        // 魔法效果 (BUFF) 冰霜吐息
        integer BCbf
        // 魔法效果 (BUFF) 砸击
        integer BCtc
        // 魔法效果 (BUFF) 战斗咆哮
        integer BNbr
        // 魔法效果 (BUFF) 寄生虫
        integer BNpm
        // 魔法效果 (BUFF) 寄生虫
        integer BNpa
        // 魔法效果 (BUFF) 被侦测到
        integer Bdet
        // 魔法效果 (BUFF) 无敌
        integer Bvul
        // 魔法效果 (BUFF) 速度加成
        integer Bspe
        // 魔法效果 (BUFF) 减速
        integer Bfro
        // 魔法效果 (BUFF) 昏迷
        integer BSTN
        // 魔法效果 (BUFF) 昏迷(暂停)
        integer BPSE
        // 魔法效果 (BUFF) 荒芜(效果)
        integer Xbli
        // 魔法效果 (BUFF) 暴露(效果)
        integer Xbdt
        // 魔法效果 (BUFF) 英雄消散(效果)
        integer Xdis
        // 魔法效果 (BUFF) 复仇之魂
        integer integer Bvng
        // 魔法效果 (BUFF) 法力闪耀
        integer integer Bmfl
        // 魔法效果 (BUFF) 法力闪耀(额外的)
        integer integer Bmfa
        // 魔法效果 (BUFF) 相位变换
        integer integer Bpsh
        // 魔法效果 (BUFF) 嘲讽
        integer integer Btau
        // 魔法效果 (BUFF) 暗影突袭
        integer integer BEsh
        // 魔法效果 (BUFF) 暗影突袭
        integer integer BEsi
        // 魔法效果 (BUFF) 复仇
        integer integer BEsv
        // 魔法效果 (BUFF) 减速毒药(不叠加)
        integer integer Bspo
        // 魔法效果 (BUFF) 减速毒药(叠加)
        integer integer Bssd
        // 魔法效果 (BUFF) 腐蚀吐息
        integer integer Bcor
        // 魔法效果 (BUFF) 献祭
        integer integer BEim
        // 魔法效果 (BUFF) 恶魔变形
        integer integer BEme
        // 魔法效果 (BUFF) 纠缠根须
        integer integer BEer
        // 魔法效果 (BUFF) 自然之力
        integer integer BEfn
        // 魔法效果 (BUFF) 荆棘光环
        integer integer BEah
        // 魔法效果 (BUFF) 斥候
        integer integer BEst
        // 魔法效果 (BUFF) 强击光环
        integer integer BEar
        // 魔法效果 (BUFF) 精灵之火
        integer integer Bfae
        // 魔法效果 (BUFF) 飓风术
        integer integer Bcyc
        // 魔法效果 (BUFF) 飓风术(额外的)
        integer integer Bcy2
        // 魔法效果 (BUFF) 回春术
        integer integer Brej
        // 魔法效果 (BUFF) 咆哮
        integer integer Broa
        // 魔法效果 (BUFF) 献祭(施法者)
        integer integer BEia
        // 魔法效果 (BUFF) 吃树
        integer integer Beat
        // 魔法效果 (BUFF) 战棍
        integer integer Bgra
        // 魔法效果 (BUFF) 减速毒药(信息)
        integer integer Bssi
        // 魔法效果 (BUFF) 树皮术
        integer integer Bbar
        // 魔法效果 (BUFF) 星辰坠落(目标)
        integer integer AEsd
        // 魔法效果 (BUFF) 宁静(目标)
        integer integer AEtr
        // 魔法效果 (BUFF) 夜视能力
        integer integer Bult
        // 魔法效果 (BUFF) 星辰坠落(效果)
        integer integer XEsf
        // 魔法效果 (BUFF) 宁静(效果)
        integer integer XEtq
        // 魔法效果 (BUFF) 哨兵(效果)
        integer integer XEsn
        // 魔法效果 (BUFF) 建筑伤害 - 暗夜精灵 小
        integer integer Xfns
        // 魔法效果 (BUFF) 建筑伤害 - 暗夜精灵 中
        integer integer Xfnm
        // 魔法效果 (BUFF) 建筑伤害 - 暗夜精灵 大
        integer integer Xfnl
        // 魔法效果 (BUFF) 空中枷锁
        integer integer Bmlt
        // 魔法效果 (BUFF) 控制魔法
        integer integer Bcmg
        // 魔法效果 (BUFF) 吸取生命和法力(附加)
        integer integer Bdbb
        // 魔法效果 (BUFF) 吸取生命(附加)
        integer integer Bdbl
        // 魔法效果 (BUFF) 法力虹吸(附加)
        integer integer Bdbm
        // 魔法效果 (BUFF) 迷雾之云
        integer integer Bclf
        // 魔法效果 (BUFF) 烈焰风暴
        integer integer BHfs
        // 魔法效果 (BUFF) 放逐
        integer integer BHbn
        // 魔法效果 (BUFF) 凤凰
        integer integer Bphx
        // 魔法效果 (BUFF) 凤凰烈焰
        integer integer Bpxf
        // 魔法效果 (BUFF) 心灵之火
        integer integer Binf
        // 魔法效果 (BUFF) 治疗术
        integer integer Bhea
        // 魔法效果 (BUFF) 中立治疗术
        integer integer BNhe
        // 魔法效果 (BUFF) 减速术
        integer integer Bslo
        // 魔法效果 (BUFF) 隐形术
        integer integer Binv
        // 魔法效果 (BUFF) 变形术
        integer integer Bply
        // 魔法效果 (BUFF) 暴风雪
        integer integer BHbd
        // 魔法效果 (BUFF) 水元素
        integer integer BHwe
        // 魔法效果 (BUFF) 辉煌光环
        integer integer BHab
        // 魔法效果 (BUFF) 风暴之锤
        integer integer BHtb
        // 魔法效果 (BUFF) 雷霆一击
        integer integer BHtc
        // 魔法效果 (BUFF) 猛击
        integer integer BHbh
        // 魔法效果 (BUFF) 天神下凡
        integer integer BHav
        // 魔法效果 (BUFF) 圣盾术
        integer integer BHds
        // 魔法效果 (BUFF) 虔诚光环
        integer integer BHad
        // 魔法效果 (BUFF) 民兵
        integer integer Bmil
        // 魔法效果 (BUFF) 暴风雪(施法者)
        integer integer BHbz
        // 魔法效果 (BUFF) 吸取生命和法力(施法者)
        integer integer Bdcb
        // 魔法效果 (BUFF) 吸取生命(施法者)
        integer integer Bdcl
        // 魔法效果 (BUFF) 吸取法力(施法者)
        integer integer Bdcm
        // 魔法效果 (BUFF) 吸取生命和法力(目标)
        integer integer Bdtb
        // 魔法效果 (BUFF) 吸取生命(目标)
        integer integer Bdtl
        // 魔法效果 (BUFF) 吸取法力(目标)
        integer integer Bdtm
        // 魔法效果 (BUFF) 空中枷锁(施法者)
        integer integer Bmlc
        // 魔法效果 (BUFF) 隐形术(额外的)
        integer integer Bivs
        // 魔法效果 (BUFF) 暴风雪 (效果)
        integer integer XHbz
        // 魔法效果 (BUFF) 烈焰风暴(效果)
        integer integer XHfs
        // 魔法效果 (BUFF) 迷雾之云(效果)
        integer integer Xclf
        // 魔法效果 (BUFF) 照明弹(效果)
        integer integer Xfla
        // 魔法效果 (BUFF) 建筑伤害 – 人类 小
        integer integer Xfhs
        // 魔法效果 (BUFF) 建筑伤害 – 人类 中
        integer integer Xfhm
        // 魔法效果 (BUFF) 建筑伤害 – 人类 大
        integer integer Xfhl
        // 魔法效果 (BUFF) 补充
        integer integer Brpb
        // 魔法效果 (BUFF) 荒芜精华
        integer integer Brpl
        // 魔法效果 (BUFF) 灵魂之触
        integer integer Brpm
        // 魔法效果 (BUFF) 荒芜光环
        integer integer Babr
        // 魔法效果 (BUFF) 穿刺
        integer integer BUim
        // 魔法效果 (BUFF) 腐尸甲虫
        integer integer BUcb
        // 魔法效果 (BUFF) 蝗虫
        integer integer BUlo
        // 魔法效果 (BUFF) 反召唤
        integer integer Buns
        // 魔法效果 (BUFF) 小蜘蛛
        integer integer Bspa
        // 魔法效果 (BUFF) 蛛网(地面)
        integer integer Bweb
        // 魔法效果 (BUFF) 蛛网(空中)
        integer integer Bwea
        // 魔法效果 (BUFF) 疾病
        integer integer Bapl
        // 魔法效果 (BUFF) 冰冻吐息
        integer integer Bfrz
        // 魔法效果 (BUFF) 骷髅奴仆
        integer integer Brai
        // 魔法效果 (BUFF) 邪恶狂热
        integer integer Buhf
        // 魔法效果 (BUFF) 反魔法护罩
        integer integer Bams
        // 魔法效果 (BUFF) 反魔法护罩(额外的)
        integer integer Bam2
        // 魔法效果 (BUFF) 占据
        integer integer Bpos
        // 魔法效果 (BUFF) 邪恶光环
        integer integer BUau
        // 魔法效果 (BUFF) 亡者再临
        integer integer BUan
        // 魔法效果 (BUFF) 沉睡
        integer integer BUsl
        // 魔法效果 (BUFF) 吸血光环
        integer integer BUav
        // 魔法效果 (BUFF) 霜甲术
        integer integer BUfa
        // 魔法效果 (BUFF) 枯萎凋零
        integer integer BUdd
        // 魔法效果 (BUFF) 诅咒
        integer integer Bcrs
        // 魔法效果 (BUFF) 残废术
        integer integer Bcri
        // 魔法效果 (BUFF) 腐臭蝠群(施法者)
        integer integer BUcs
        // 魔法效果 (BUFF) 沉睡(暂停)
        integer integer BUsp
        // 魔法效果 (BUFF) 沉睡(昏迷)
        integer integer BUst
        // 魔法效果 (BUFF) 尖刺甲壳
        integer integer BUts
        // 魔法效果 (BUFF) 疾病之云
        integer integer Bplg
        // 魔法效果 (BUFF) 亡者再临(额外的)
        integer integer BUad
        // 魔法效果 (BUFF) 占据(施法者)
        integer integer Bpoc
        // 魔法效果 (BUFF) 枯萎凋零(效果)
        integer integer XUdd
        // 魔法效果 (BUFF) 建筑伤害 – 亡灵 小
        integer integer Xfus
        // 魔法效果 (BUFF) 建筑伤害 – 亡灵 中
        integer integer Xfum
        // 魔法效果 (BUFF) 建筑伤害 – 亡灵 大
        integer integer Xful
        // 魔法效果 (BUFF) 优先攻击
        integer integer Batp
        // 魔法效果 (BUFF) 燃油
        integer integer Bbof
        // 魔法效果 (BUFF) 狂暴
        integer integer Bbsk
        // 魔法效果 (BUFF) 灵魂链接
        integer integer Bspl
        // 魔法效果 (BUFF) 妖术
        integer integer BOhx
        // 魔法效果 (BUFF) 结界
        integer integer BOwd
        // 魔法效果 (BUFF) 巫毒狂舞
        integer integer BOvd
        // 魔法效果 (BUFF) 诱捕(地面的)
        integer integer Beng
        // 魔法效果 (BUFF) 诱捕(空中的)
        integer integer Bena
        // 魔法效果 (BUFF) 吞噬
        integer integer Bdvv
        // 魔法效果 (BUFF) 净化
        integer integer Bprg
        // 魔法效果 (BUFF) 闪电之盾
        integer integer Blsh
        // 魔法效果 (BUFF) 嗜血
        integer integer Bblo
        // 魔法效果 (BUFF) 警戒结界
        integer integer Beye
        // 魔法效果 (BUFF) 静滞陷阱
        integer integer Bstt
        // 魔法效果 (BUFF) 静滞陷阱
        integer integer Bsta
        // 魔法效果 (BUFF) 治疗结界
        integer integer Bhwd
        // 魔法效果 (BUFF) 治疗结界光环
        integer integer Boar
        // 魔法效果 (BUFF) 毒素(不叠加)
        integer integer Bpoi
        // 魔法效果 (BUFF) 毒素(叠加)
        integer integer Bpsd
        // 魔法效果 (BUFF) 毒素(信息)
        integer integer Bpsi
        // 魔法效果 (BUFF) 战鼓
        integer integer Bakb
        // 魔法效果 (BUFF) 疾风步
        integer integer BOwk
        // 魔法效果 (BUFF) 镜像
        integer integer BOmi
        // 魔法效果 (BUFF) 野性之魂
        integer integer BOsf
        // 魔法效果 (BUFF) 地震术
        integer integer BOeq
        // 魔法效果 (BUFF) 坚韧光环
        integer integer BOae
        // 魔法效果 (BUFF) 战争践踏
        integer integer BOws
        // 魔法效果 (BUFF) 地震术(施法者)
        integer integer BOea
        // 魔法效果 (BUFF) 震荡波(施法者)
        integer integer BOsh
        // 魔法效果 (BUFF) 巫毒狂舞(施法者)
        integer integer BOvc
        // 魔法效果 (BUFF) 剑刃风暴(施法者)
        integer integer BOww
        // 魔法效果 (BUFF) 吞噬(施法者)
        integer integer Bdig
        // 魔法效果 (BUFF) 诱捕(一般的)
        integer integer Bens
        // 魔法效果 (BUFF) 火油瓶
        integer integer Bliq
        // 魔法效果 (BUFF) 闪电之盾(施法者)
        integer integer Blsa
        // 魔法效果 (BUFF) 地震术(效果)
        integer integer XOeq
        // 魔法效果 (BUFF) 重生(效果)
        integer integer XOre
        // 魔法效果 (BUFF) 燃油(效果)
        integer integer Xbof
        // 魔法效果 (BUFF) 建筑伤害 – 兽人 小
        integer integer Xfos
        // 魔法效果 (BUFF) 建筑伤害 – 兽人 中
        integer integer Xfom
        // 魔法效果 (BUFF) 建筑伤害 – 兽人 大
        integer integer Xfol
        // 魔法效果 (BUFF) 剧毒(不叠加)
        integer integer BIpb
        // 魔法效果 (BUFF) 剧毒(叠加)
        integer integer BIpd
        // 魔法效果 (BUFF) 剧毒 (信息)
        integer integer BIpi


// 科技

        // 人族科技

        // 科技 钢铁铸剑
        integer Rhme
        // 科技 黑火药
        integer Rhra
        // 科技 炮兵(人族)(编辑器无此科技)
        integer Rhaa
        // 科技 钢铁装甲
        integer Rhar
        // 科技 黄金(人族)(编辑器无此科技)
        integer Rhmi
        // 科技 改良石工技术
        integer Rhac
        // 科技 控制魔法
        integer Rhss
        // 科技 防御
        integer Rhde
        // 科技 坐骑作战训练
        integer Rhan
        // 科技 牧师专家级训练
        integer Rhpt
        // 科技 女巫专家级训练
        integer Rhst
        // 科技 镶钉皮甲
        integer Rhla
        // 科技 长管火枪
        integer Rhri
        // 科技 改良伐木技术
        integer Rhlh
        // 科技 魔法岗哨
        integer Rhse
        // 科技 散射(人族)(编辑器无此科技)
        integer Rhsr
        // 科技 飞行器炸弹
        integer Rhgb
        // 科技 风暴战锤
        integer Rhhb
        // 科技 控制魔法
        integer Rhss
        // 科技 破片榴弹
        integer Rhfs
        // 科技 火箭弹幕
        integer Rhrt
        // 科技 对空炮机
        integer Rhfc
        // 科技 迷雾之云
        integer Rhcd
        // 科技 裂甲之刃
        integer Rhsb
        // 科技 背包(人类)
        integer Rhpm


        // 兽族科技

        // 科技 精钢近战武器
        integer Rome
        // 科技 精钢远程武器
        integer Rora
        // 科技 火炮(兽族)(编辑器无此科技)
        integer Roaa
        // 科技 精钢护甲
        integer Roar
        // 科技 战鼓伤害强化
        integer Rwdm
        // 科技 掠夺
        integer Ropg
        // 科技 野蛮之力
        integer Robs
        // 科技 粉碎伤害强化
        integer Rows
        // 科技 诱捕(兽族)
        integer Roen
        // 科技 毒矛(兽族)
        integer Rovs
        // 科技 巫医专家级训练
        integer Rowd
        // 科技 萨满祭司专家级训练
        integer Rost
        // 科技 尖刺障碍
        integer Rosp
        // 科技 加强型防御
        integer Rorb
        // 科技 巨魔再生
        integer Rotr
        // 科技 火油瓶(兽族)
        integer Rolf
        // 科技 灵魂行者专家级训练
        integer Rowt
        // 科技 狂战士升级
        integer Robk
        // 科技 燃油(兽族)
        integer Robf
        // 科技 背包(兽人)
        integer Ropm


        // 不死族科技

        // 科技 邪恶力量
        integer Rume
        // 科技 生物攻击
        integer Rura
        // 科技 邪恶护甲
        integer Ruar
        // 科技 食尸
        integer Ruac
        // 科技 食尸鬼狂暴
        integer Rugf
        // 科技 蛛网
        integer Ruwb
        // 科技 不明科技(不死族)(编辑器无此科技)
        integer Ruab
        // 科技 石像形态
        integer Rusf
        // 科技 通灵师/亡灵男巫专家级训练
        integer Rune
        // 科技 女妖专家级训练
        integer Ruba
        // 科技 不明科技(不死族)(编辑器无此科技)
        integer Rump
        // 科技 冰冻吐息
        integer Rufb
        // 科技 骷髅持久术
        integer Rusl
        // 科技 骷髅精通
        integer Rusm
        // 科技 发掘尸体
        integer Ruex
        // 科技 牺牲(不死族)(编辑器无此科技)
        integer Rurs
        // 科技 不明科技(不死族)(编辑器无此科技)
        integer Ruax
        // 科技 生物甲壳
        integer Rucr
        // 科技 疾病之云
        integer Rupc
        // 科技 毁灭者形态
        integer Rusp
        // 科技 钻地
        integer Rubu
        // 科技 背包(亡灵)
        integer Rupm


        // 暗夜精灵族科技

        // 科技 月之力量
        integer Resm
        // 科技 野性力量
        integer Resw
        // 科技 月之护甲
        integer Rema
        // 科技 强化外皮
        integer Rerh
        // 科技 夜视能力
        integer Reuv
        // 科技 自然祝福
        integer Renb
        // 科技 哨兵
        integer Resc
        // 科技 升级月刃
        integer Remg
        // 科技 强弓
        integer Reib
        // 科技 箭术
        integer Remk
        // 科技 猛禽德鲁伊专家级训练
        integer Redt
        // 科技 利爪德鲁伊专家级训练
        integer Redc
        // 科技 驱除魔法(暗夜精灵族)
        integer Resi
        // 科技 腐蚀吐息
        integer Recb
        // 科技 角鹰兽训练
        integer Reht
        // 科技 不明科技(暗夜精灵族)(编辑器无此科技)
        integer Repd
        // 科技 利爪之印
        integer Reeb
        // 科技 猛禽之印
        integer Reec
        // 科技 硬化体肤
        integer Rehs
        // 科技 抗性体肤
        integer Rers
        // 科技 月井之春
        integer Rews
        // 科技 锐锋之刃
        integer Repb
        // 科技 背包(暗夜精灵)
        integer Repm


        // 娜迦科技

        // 科技 珊瑚鳞甲
        integer Rnam
        // 科技 珊瑚锋刃
        integer Rnat
        // 科技 驱除魔法(娜迦族)
        integer Rnsi
        // 科技 诱捕(娜迦族)
        integer Rnen
        // 科技 潜水
        integer Rnsb
        // 科技 纳迦海妖专家级训练
        integer Rnsw


        // 中立科技

        // 科技 混乱
        integer Roch
        // 科技 夜视雕文(升级)
        integer Rguv
        // 科技 强固雕文(升级1)
        integer Rgfo


// 常用可破坏物(齐)

        // 可破坏物 升降台墙
        integer DTep
        // 可破坏物 升降台1
        integer DTrf
        // 可破坏物 升降台2
        integer DTrx
        // 可破坏物 冬天树墙
        integer WTtw
        // 可破坏物 冰冠树墙
        integer ITtw
        // 可破坏物 地下树墙
        integer GTsh
        // 可破坏物 地牢树墙
        integer DTsh
        // 可破坏物 城邦冬天树墙
        integer YTwt
        // 可破坏物 城邦夏天树墙
        integer YTct
        // 可破坏物 城邦废墟树墙
        integer JTct
        // 可破坏物 城邦秋天树墙
        integer YTft
        // 可破坏物 城邦落雪树墙
        integer YTst
        // 可破坏物 夏天树墙
        integer LTlt
        // 可破坏物 外域树墙
        integer OTtw
        // 可破坏物 废墟树墙
        integer ZTtw
        // 可破坏物 村庄树墙
        integer VTlt
        // 可破坏物 灰谷树墙
        integer ATtr
        // 可破坏物 烧焦树墙
        integer Ytsc
        // 可破坏物 秋天树墙
        integer FTtw
        // 可破坏物 落雪树墙
        integer WTst
        // 可破坏物 诺森德冰树墙
        integer NTiw
        // 可破坏物 诺森德树墙
        integer NTtw
        // 可破坏物 贫瘠之地树墙
        integer BTtw
        // 可破坏物 费伍德树墙
        integer CTtr
        // 可破坏物 达拉然废墟树墙
        integer JTtw
        // 可破坏物 银月城树
        integer Yts1
        // 可破坏物 黑色城堡树墙
        integer KTtw
        // 可破坏物 冰冠巨冠树
        integer ITtc
        // 可破坏物 废墟巨冠树
        integer ZTtc
        // 可破坏物 灰谷巨冠树
        integer ATtc
        // 可破坏物 诺森德巨冠树
        integer NTtc
        // 可破坏物 贫瘠之地巨冠树
        integer BTtc
        // 可破坏物 费伍德巨冠树
        integer CTtc
        // 可破坏物 发光的传送门
        integer OTsp
        // 可破坏物 冰冠堡垒入口
        integer YTc1
        // 可破坏物 冰冠王座
        integer IOt0
        // 可破坏物 冰冠王座(对角1)
        integer IOt1
        // 可破坏物 冰冠王座(对角2)
        integer IOt2
        // 可破坏物 冰冠王座大门
        integer ITtg
        // 可破坏物 冰屋
        integer ITig
        // 可破坏物 力场墙
        integer Dofw
        // 可破坏物 力场墙
        integer Dofv
        // 可破坏物 卵囊
        integer DTes
        // 可破坏物 国王的王座
        integer XOkt
        // 可破坏物 国王的王座(对角1)
        integer XOk1
        // 可破坏物 国王的王座(对角2)
        integer XOk2
        // 可破坏物 地牢大门(垂直)
        integer DTg3
        // 可破坏物 地牢大门(对角1)
        integer DTg2
        // 可破坏物 地牢大门(对角2)
        integer DTg4
        // 可破坏物 地牢大门(水平)
        integer DTg1
        // 可破坏物 地牢尖刺
        integer DTsp
        // 可破坏物 城市入口
        integer YTce
        // 可破坏物 城市入口
        integer YTcx
        // 可破坏物 复活石
        integer BTrs
        // 可破坏物 复活石
        integer BTrx
        // 可破坏物 大门(垂直)
        integer LTg3
        // 可破坏物 大门(对角1)
        integer LTg2
        // 可破坏物 大门(对角2)
        integer LTg4
        // 可破坏物 大门(水平)
        integer LTg1
        // 可破坏物 奥格瑞玛大门
        integer YTcn
        // 可破坏物 寒冰大门(垂直)
        integer ITg3
        // 可破坏物 寒冰大门(对角1)
        integer ITg2
        // 可破坏物 寒冰大门(对角2)
        integer ITg4
        // 可破坏物 寒冰大门(水平)
        integer ITg1
        // 可破坏物 寒冰岩石
        integer ITor
        // 可破坏物 寒冰岩石大门(垂直)
        integer ITx3
        // 可破坏物 寒冰岩石大门(对角1)
        integer ITx2
        // 可破坏物 寒冰岩石大门(对角2)
        integer ITx4
        // 可破坏物 寒冰岩石大门(水平)
        integer ITx1
        // 可破坏物 巨型废墟大门(垂直)
        integer ZTsg
        // 可破坏物 巨型废墟大门(水平)
        integer ZTsx
        // 可破坏物 已完成的奥格瑞玛塔楼
        integer XTv8
        // 可破坏物 已完成的奥格瑞玛墙节
        integer XTv6
        // 可破坏物 废墟大门(垂直)
        integer ZTg3
        // 可破坏物 废墟大门(对角1)
        integer ZTg2
        // 可破坏物 废墟大门(对角2)
        integer ZTg4
        // 可破坏物 废墟大门(水平)
        integer ZTg1
        // 可破坏物 建造中的奥格瑞玛塔楼
        integer XTv7
        // 可破坏物 建造中的奥格瑞玛墙节
        integer XTv5
        // 可破坏物 恶魔大门(垂直)
        integer ATg3
        // 可破坏物 恶魔大门(对角1)
        integer ATg2
        // 可破坏物 恶魔大门(对角2)
        integer ATg4
        // 可破坏物 恶魔大门(水平)
        integer ATg1
        // 可破坏物 恶魔风暴
        integer OTds
        // 可破坏物 悬崖洞穴大门(1)
        integer DTc1
        // 可破坏物 悬崖洞穴大门(2)
        integer DTc2
        // 可破坏物 控制杆
        integer DTlv
        // 可破坏物 摇滚阿尔萨斯
        integer ITag
        // 可破坏物 支柱
        integer BTsc
        // 可破坏物 板条箱
        integer LTcr
        // 可破坏物 桶
        integer LTbr
        // 可破坏物 桶
        integer LTbx
        // 可破坏物 桶
        integer LTbs
        // 可破坏物 洛丹伦城市主建筑
        integer XTv3
        // 可破坏物 洛丹伦城市主门
        integer YTc2
        // 可破坏物 洛丹伦城市主门柱塔
        integer BTsk
        // 可破坏物 洛丹伦城市尖塔
        integer BTs4
        // 可破坏物 洛丹伦城市穹顶
        integer XTv1
        // 可破坏物 浮冰
        integer ITf1
        // 可破坏物 浮冰
        integer ITf2
        // 可破坏物 浮冰
        integer ITf3
        // 可破坏物 浮冰
        integer ITf4
        // 可破坏物 滚石之门(垂直1)
        integer ZTd2
        // 可破坏物 滚石之门(垂直1)
        integer ITd2
        // 可破坏物 滚石之门(垂直2)
        integer ITd4
        // 可破坏物 滚石之门(垂直2)
        integer ZTd4
        // 可破坏物 滚石之门(垂直3)
        integer ZTd6
        // 可破坏物 滚石之门(垂直4)
        integer ZTd8
        // 可破坏物 滚石之门(水平1)
        integer ITd1
        // 可破坏物 滚石之门(水平1)
        integer ZTd1
        // 可破坏物 滚石之门(水平2)
        integer ITd3
        // 可破坏物 滚石之门(水平2)
        integer ZTd3
        // 可破坏物 滚石之门(水平3)
        integer ZTd5
        // 可破坏物 滚石之门(水平4)
        integer ZTd7
        // 可破坏物 火山
        integer Volc
        // 可破坏物 炸药桶
        integer LTex
        // 可破坏物 牢笼
        integer LOcg
        // 可破坏物 狮子雕像
        integer BTs2
        // 可破坏物 石块
        integer DTrc
        // 可破坏物 石块
        integer LTrt
        // 可破坏物 石块
        integer LTrc
        // 可破坏物 石质墙(垂直)
        integer ZTw2
        // 可破坏物 石质墙(垂直)
        integer ITw2
        // 可破坏物 石质墙(垂直)
        integer LTw2
        // 可破坏物 石质墙(对角1)
        integer LTw3
        // 可破坏物 石质墙(对角1)
        integer ZTw3
        // 可破坏物 石质墙(对角1)
        integer ITw3
        // 可破坏物 石质墙(对角2)
        integer ZTw1
        // 可破坏物 石质墙(对角2)
        integer LTw1
        // 可破坏物 石质墙(对角2)
        integer ITw1
        // 可破坏物 石质墙(水平)
        integer ITw0
        // 可破坏物 石质墙(水平)
        integer ZTw0
        // 可破坏物 石质墙(水平)
        integer LTw0
        // 可破坏物 精灵大门(垂直)
        integer LTe3
        // 可破坏物 精灵大门(对角1)
        integer LTe2
        // 可破坏物 精灵大门(对角2)
        integer LTe4
        // 可破坏物 精灵大门(水平)
        integer LTe1
        // 可破坏物 纳迦废墟圆圈
        integer ZTnc
        // 可破坏物 船只
        integer NTbd
        // 可破坏物 被毁的洛丹伦城市主建筑
        integer XTv4
        // 可破坏物 被毁的洛丹伦城市主门
        integer YTc4
        // 可破坏物 被毁的洛丹伦城市主门柱塔
        integer BTs1
        // 可破坏物 被毁的洛丹伦城市尖塔
        integer BTs5
        // 可破坏物 被毁的洛丹伦城市穹顶
        integer XTv2
        // 可破坏物 被毁的狮子雕像
        integer BTs3
        // 可破坏物 路障
        integer LTba
        // 可破坏物 达拉然建筑
        integer XTbd
        // 可破坏物 达拉然紫罗栏城堡
        integer XTvt
        // 可破坏物 钢铁大门(垂直)
        integer DTg7
        // 可破坏物 钢铁大门(对角1)
        integer DTg6
        // 可破坏物 钢铁大门(对角2)
        integer DTg8
        // 可破坏物 钢铁大门(水平)
        integer DTg5
        // 可破坏物 魔法围栏
        integer XTmp
        // 可破坏物 魔法围栏(有角度的)
        integer XTm5
        // 可破坏物 魔法围栏墙
        integer XTmx
        // 可破坏物 魔法围栏墙(有角度的)
        integer XTx5

        // 可破坏物 视线阻断器
        integer YTlb
        // 可破坏物 视线阻断器(大)
        integer YTlc
        // 可破坏物 视线阻断器(全部)
        integer YTfb
        // 可破坏物 视线阻断器(全部)(大)
        integer YTfc
        // 可破坏物 视线阻断器(地面)
        integer YTpb
        // 可破坏物 视线阻断器(地面)(大)
        integer YTpc
        // 可破坏物 视线阻断器(空中)
        integer YTab
        // 可破坏物 视线阻断器(空中)(大)
        integer YTac

        // 可破坏物 传送门斜坡
        integer WGTR
        // 可破坏物 力场之桥(垂直)
        integer DTs0
        // 可破坏物 力场之桥(对角1)
        integer DTs1
        // 可破坏物 力场之桥(对角2)
        integer DTs3
        // 可破坏物 力场之桥(水平)
        integer DTs2
        // 可破坏物 宽天然桥(垂直)
        integer YT32
        // 可破坏物 宽天然桥(垂直)
        integer YT08
        // 可破坏物 宽天然桥(对角1)
        integer YT33
        // 可破坏物 宽天然桥(对角1)
        integer YT09
        // 可破坏物 宽天然桥(对角2)
        integer YT11
        // 可破坏物 宽天然桥(对角2)
        integer YT35
        // 可破坏物 宽天然桥(水平)
        integer YT10
        // 可破坏物 宽天然桥(水平)
        integer YT34
        // 可破坏物 宽斯坦索姆桥(垂直)
        integer YT20
        // 可破坏物 宽斯坦索姆桥(对角1)
        integer YT21
        // 可破坏物 宽斯坦索姆桥(对角2)
        integer YT23
        // 可破坏物 宽斯坦索姆桥(水平)
        integer YT22
        // 可破坏物 宽暗夜精灵木质桥(垂直)
        integer NB08
        // 可破坏物 宽暗夜精灵木质桥(对角1)
        integer NB09
        // 可破坏物 宽暗夜精灵木质桥(对角2)
        integer NB11
        // 可破坏物 宽暗夜精灵木质桥(水平)
        integer NB10
        // 可破坏物 宽木质桥(垂直)
        integer LT08
        // 可破坏物 宽木质桥(对角1)
        integer LT09
        // 可破坏物 宽木质桥(对角2)
        integer LT11
        // 可破坏物 宽木质桥(水平)
        integer LT10
        // 可破坏物 宽板条木质桥(垂直)
        integer RW08
        // 可破坏物 宽板条木质桥(对角1)
        integer RW09
        // 可破坏物 宽板条木质桥(对角2)
        integer RW11
        // 可破坏物 宽板条木质桥(水平)
        integer RW10
        // 可破坏物 宽石质桥(垂直)
        integer YT20
        // 可破坏物 宽石质桥(垂直)
        integer YT44
        // 可破坏物 宽石质桥(对角1)
        integer YT45
        // 可破坏物 宽石质桥(对角1)
        integer YT21
        // 可破坏物 宽石质桥(对角2)
        integer YT23
        // 可破坏物 宽石质桥(对角2)
        integer YT47
        // 可破坏物 宽石质桥(水平)
        integer YT22
        // 可破坏物 宽石质桥(水平)
        integer YT46
        // 可破坏物 宽精灵桥(垂直)
        integer EB08
        // 可破坏物 宽精灵桥(对角1)
        integer EB09
        // 可破坏物 宽精灵桥(对角2)
        integer EB11
        // 可破坏物 宽精灵桥(水平)
        integer EB10
        // 可破坏物 宽茂盛之桥(垂直)
        integer OG08
        // 可破坏物 宽茂盛之桥(对角1)
        integer OG09
        // 可破坏物 宽茂盛之桥(对角2)
        integer OG11
        // 可破坏物 宽茂盛之桥(水平)
        integer OG10
        // 可破坏物 寒冰之桥(垂直)
        integer ITib
        // 可破坏物 寒冰之桥(对角1)
        integer ITi2
        // 可破坏物 寒冰之桥(对角2)
        integer ITi4
        // 可破坏物 寒冰之桥(水平)
        integer ITi3
        // 可破坏物 最后希望之桥(垂直)
        integer LTtc
        // 可破坏物 最后希望之桥(水平)
        integer LTtx
        // 可破坏物 树桥(垂直)
        integer ATt1
        // 可破坏物 树桥(垂直)
        integer LTt4
        // 可破坏物 树桥(垂直)
        integer LTt2
        // 可破坏物 树桥(垂直)
        integer LTt0
        // 可破坏物 树桥(水平)
        integer LTt1
        // 可破坏物 树桥(水平)
        integer ATt0
        // 可破坏物 树桥(水平)
        integer LTt3
        // 可破坏物 树桥(水平)
        integer LTt5
        // 可破坏物 特殊寒冰之桥
        integer YT66
        // 可破坏物 短天然桥(垂直)
        integer YT24
        // 可破坏物 短天然桥(垂直)
        integer YT00
        // 可破坏物 短天然桥(对角1)
        integer YT25
        // 可破坏物 短天然桥(对角1)
        integer YT01
        // 可破坏物 短天然桥(对角2)
        integer YT27
        // 可破坏物 短天然桥(对角2)
        integer YT03
        // 可破坏物 短天然桥(水平)
        integer YT02
        // 可破坏物 短天然桥(水平)
        integer YT26
        // 可破坏物 短斯坦索姆桥(垂直)
        integer YY12
        // 可破坏物 短斯坦索姆桥(对角1)
        integer YY13
        // 可破坏物 短斯坦索姆桥(对角2)
        integer YY15
        // 可破坏物 短斯坦索姆桥(水平)
        integer YY14
        // 可破坏物 短暗夜精灵木质桥(垂直)
        integer NB00
        // 可破坏物 短暗夜精灵木质桥(对角1)
        integer NB01
        // 可破坏物 短暗夜精灵木质桥(对角2)
        integer NB03
        // 可破坏物 短暗夜精灵木质桥(水平)
        integer NB02
        // 可破坏物 短板条木质桥(垂直)
        integer RW00
        // 可破坏物 短板条木质桥(对角1)
        integer RW01
        // 可破坏物 短板条木质桥(对角2)
        integer RW03
        // 可破坏物 短板条木质桥(水平)
        integer RW02
        // 可破坏物 短石质桥(垂直)
        integer YT12
        // 可破坏物 短石质桥(垂直)
        integer YT36
        // 可破坏物 短石质桥(对角1)
        integer YT37
        // 可破坏物 短石质桥(对角1)
        integer YT13
        // 可破坏物 短石质桥(对角2)
        integer YT39
        // 可破坏物 短石质桥(对角2)
        integer YT15
        // 可破坏物 短石质桥(水平)
        integer YT38
        // 可破坏物 短石质桥(水平)
        integer YT14
        // 可破坏物 短精灵桥(垂直)
        integer EB00
        // 可破坏物 短精灵桥(对角1)
        integer EB01
        // 可破坏物 短精灵桥(对角2)
        integer EB03
        // 可破坏物 短精灵桥(水平)
        integer EB02
        // 可破坏物 短茂盛之桥(垂直)
        integer OG00
        // 可破坏物 短茂盛之桥(对角1)
        integer OG01
        // 可破坏物 短茂盛之桥(对角2)
        integer OG03
        // 可破坏物 短茂盛之桥(水平)
        integer OG02
        // 可破坏物 石质斜坡(右上)
        integer LTr3
        // 可破坏物 石质斜坡(右上)
        integer LTs3
        // 可破坏物 石质斜坡(右上2)
        integer LTs7
        // 可破坏物 石质斜坡(右上2)
        integer LTr7
        // 可破坏物 石质斜坡(右下)
        integer LTr4
        // 可破坏物 石质斜坡(右下)
        integer LTs4
        // 可破坏物 石质斜坡(右下2)
        integer LTs8
        // 可破坏物 石质斜坡(右下2)
        integer LTr8
        // 可破坏物 石质斜坡(左上 2)
        integer LTs6
        // 可破坏物 石质斜坡(左上 2)
        integer LTr6
        // 可破坏物 石质斜坡(左上)
        integer LTr2
        // 可破坏物 石质斜坡(左上)
        integer LTs2
        // 可破坏物 石质斜坡(左下)
        integer LTs1
        // 可破坏物 石质斜坡(左下)
        integer LTr1
        // 可破坏物 石质斜坡(左下2)
        integer LTs5
        // 可破坏物 石质斜坡(左下2)
        integer LTr5
        // 可破坏物 码头
        integer ATwf
        // 可破坏物 精灵桥
        integer YT67
        // 可破坏物 纳迦小斜坡(向上)
        integer ZTr1
        // 可破坏物 纳迦小斜坡(向下)
        integer ZTr3
        // 可破坏物 纳迦小斜坡(向右)
        integer ZTr2
        // 可破坏物 纳迦小斜坡(向左)
        integer ZTr0
        // 可破坏物 脚踏开关
        integer DTfx
        // 可破坏物 脚踏开关
        integer DTfp
        // 可破坏物 被毁的桥
        integer YSdb
        // 可破坏物 被毁的桥
        integer YSdc
        // 可破坏物 超宽天然桥(垂直)
        integer YT48
        // 可破坏物 超宽天然桥(对角1)
        integer YT49
        // 可破坏物 超宽天然桥(对角2)
        integer YT51
        // 可破坏物 超宽天然桥(水平)
        integer YT50
        // 可破坏物 长天然桥(垂直)
        integer YT28
        // 可破坏物 长天然桥(垂直)
        integer YT04
        // 可破坏物 长天然桥(对角1)
        integer YT05
        // 可破坏物 长天然桥(对角1)
        integer YT29
        // 可破坏物 长天然桥(对角2)
        integer YT07
        // 可破坏物 长天然桥(对角2)
        integer YT31
        // 可破坏物 长天然桥(水平)
        integer YT30
        // 可破坏物 长天然桥(水平)
        integer YT06
        // 可破坏物 长斯坦索姆桥(垂直)
        integer YY16
        // 可破坏物 长斯坦索姆桥(对角1)
        integer YY17
        // 可破坏物 长斯坦索姆桥(对角2)
        integer YY19
        // 可破坏物 长斯坦索姆桥(水平)
        integer YY18
        // 可破坏物 长暗夜精灵木质桥(垂直)
        integer NB04
        // 可破坏物 长暗夜精灵木质桥(对角1)
        integer NB05
        // 可破坏物 长暗夜精灵木质桥(对角2)
        integer NB07
        // 可破坏物 长暗夜精灵木质桥(水平)
        integer NB06
        // 可破坏物 长木质桥(垂直)
        integer LT04
        // 可破坏物 长木质桥(对角1)
        integer LT05
        // 可破坏物 长木质桥(对角2)
        integer LT07
        // 可破坏物 长木质桥(水平)
        integer LT06
        // 可破坏物 长板条木质桥(垂直)
        integer RW04
        // 可破坏物 长板条木质桥(对角1)
        integer RW05
        // 可破坏物 长板条木质桥(对角2)
        integer RW07
        // 可破坏物 长板条木质桥(水平)
        integer RW06
        // 可破坏物 长石质桥(垂直)
        integer YT16
        // 可破坏物 长石质桥(垂直)
        integer YT40
        // 可破坏物 长石质桥(对角1)
        integer YT17
        // 可破坏物 长石质桥(对角1)
        integer YT41
        // 可破坏物 长石质桥(对角2)
        integer YT43
        // 可破坏物 长石质桥(对角2)
        integer YT19
        // 可破坏物 长石质桥(水平)
        integer YT18
        // 可破坏物 长石质桥(水平)
        integer YT42
        // 可破坏物 长精灵桥(垂直)
        integer EB04
        // 可破坏物 长精灵桥(对角1)
        integer EB05
        // 可破坏物 长精灵桥(对角2)
        integer EB07
        // 可破坏物 长精灵桥(水平)
        integer EB06
        // 可破坏物 长茂盛之桥(垂直)
        integer OG04
        // 可破坏物 长茂盛之桥(对角1)
        integer OG05
        // 可破坏物 长茂盛之桥(对角2)
        integer OG07
        // 可破坏物 长茂盛之桥(水平)
        integer OG06
        // 可破坏物 隐形平台
        integer OTip
        // 可破坏物 隐形平台(小)
        integer OTis


// 补充单位/物品/技能/科技名


        // 英雄 娜迦海巫
        integer NAGA_SORCERESS
        // 英雄 兽王
        integer BEAST_MASTER
        // 英雄 黑暗游侠
        integer DARK_RANGER
        // 英雄 深渊领主
        integer NEUTRAL_PIT_LORD
        // 英雄 酒仙(熊猫)
        integer BREW_MASTER
        // 英雄 修补匠
        integer GOBLIN_TINKER
        // 英雄 火焰领主
        integer FIRELORD
        // 英雄 炼金术士
        integer ALCHEMIST

        // 科技 裂甲之刃
        integer UPG_SUN_BLADE

        // 物品 治疗药水
        integer HEALING_POTION
        // 物品 法力药水
        integer MANA_POTION
        // 物品 城镇传送卷轴/回城卷轴
        integer TOWN_PORTAL
        // 物品 象牙塔
        integer IVORY_TOWER
        // 物品 火焰宝珠
        integer ORB_OF_FIRE
        // 物品 火焰宝珠
        integer ORB_OF_FIRE_N
        // 物品 庇护法杖/避难权杖
        integer STAFF_OF_SANCTUARY
        // 物品 治疗药膏
        integer HEALING_SALVE
        // 物品 速度卷轴
        integer SCROLL_OF_SPEED
        // 物品 闪电宝珠
        integer ORB_OF_LIGHTNING
        // 物品 闪电宝珠
        integer ORB_OF_LIGHTNING_N
        // 物品 迷你大厅(兽族)
        integer TINY_GREAT_HALL
        // 物品 通灵魔棒(骷髅杖)
        integer ROD_OF_NECROMANCY
        // 物品 献祭之颅(制造腐地)
        integer SACRIFICIAL_SKULL
        // 物品 显影之尘
        integer DUST_OF_APPEARANCE
        // 物品 腐蚀宝珠
        integer ORB_OF_CORRUPTION
        // 物品 治疗卷轴
        integer SCROLL_OF_HEALING
        // 物品 月亮石
        integer MOONSTONE
        // 物品 保存法杖
        integer STAFF_OF_PRESERVATION
        // 物品 毒液宝珠
        integer ORB_OF_VENOM
        // 物品 反魔法药剂
        integer ANTI_MAGIC_POTION
        // 物品 仪式匕首
        integer RITUAL_DAGGER
        // 物品 贵族头环
        integer CIRCLET_OF_NOBILITY
        // 物品 法力护身符
        integer PERIAPT_OF_VITALITY
        // 物品 速度之靴
        integer BOOTS_OF_SPEED
        // 物品 显影之尘
        integer M_DUST_OF_APPEARANCE
        // 物品 治疗卷轴
        integer M_SCROLL_OF_HEALING
        // 物品 保护卷轴
        integer SCROLL_OF_PROTECTION
        // 物品 城镇传送卷轴/回城卷轴
        integer M_TOWN_PORTAL
        // 物品 隐形药水
        integer POTION_OF_INVISIBILITY
        // 物品 重修之书
        integer TOME_OF_RETRAINING
        // 物品 传送法杖
        integer STAFF_OF_TELEPORTATION
        // 物品 次级无敌药水
        integer POTION_OF_LESSER_INVULNERBILITY

        // 英雄技能 叉状闪电(娜迦海巫)
        integer FORKLIGHTNING
        // 英雄技能 冰霜箭(娜迦海巫)
        integer FROSTARROWS
        // 英雄技能 法力护盾(娜迦海巫)
        integer MANASHIELD
        // 英雄技能 龙卷风(娜迦海巫)
        integer TORNADO
        // 英雄技能 召唤巨熊(兽王)
        integer BEAR
        // 英雄技能 召唤豪猪(兽王)
        integer QUILBEAST
        // 英雄技能 召唤战鹰(兽王)
        integer HAWK
        // 英雄技能 群兽奔腾(兽王)
        integer STAMPEDE
        // 英雄技能 沉默(黑暗游侠)
        integer SILENCE
        // 英雄技能 黑蚀箭(黑暗游侠)
        integer BLACKARROW
        // 英雄技能 生命吸取(黑暗游侠)
        integer DRAIN
        // 英雄技能 蛊惑(黑暗游侠)
        integer CHARM
        // 英雄技能 火焰之雨(深渊领主)
        integer RAINOFFIRE
        // 英雄技能 恐惧嚎叫(深渊领主)
        integer HOWL
        // 英雄技能 顺劈斩(深渊领主)
        integer CLEAVING
        // 英雄技能 末日降临(深渊领主)
        integer DOOM
        // 英雄技能 火焰之息(熊猫)
        integer BOF
        // 英雄技能 酩酊酒雾(熊猫)
        integer HAZE
        // 英雄技能 醉拳(熊猫)
        integer BRAWLER
        // 英雄技能 风火雷电(熊猫)
        integer SEF
        // 英雄技能 口袋工厂(修补匠)
        integer POCKETFACTORY
        // 英雄技能 集束火箭(修补匠)
        integer ROCKETS
        // 英雄技能 工程学升级(修补匠)
        integer UPGRADE
        // 英雄技能 机械地基(修补匠)
        integer ROBOGOBLIN
        // 英雄技能 灵魂燃烧(火焰领主)
        integer SOUL_BURN
        // 英雄技能 召唤熔岩爪牙(火焰领主)
        integer SUMMON_LAVASPAWN
        // 英雄技能 焚身化骨(箭矢)(火焰领主)
        integer INCINERATE
        // 英雄技能 火山爆发(火焰领主)
        integer VOLCANO
        // 英雄技能 治疗喷雾(炼金术士)
        integer HEALING_SPRAY
        // 英雄技能 酸性炸弹(炼金术士)
        integer ACID_BOMB
        // 英雄技能 化学狂暴(炼金术士)
        integer CHEMICAL_RAGE
        // 英雄技能 点金术(炼金术士)
        integer TRANSMUTE


// 技能命令串或ID(命令串只有部分,ID估计全了,已去重)
// 内容主要源自百度陈年旧贴,故不含1.29及之后新技能的命令串和ID(查了一下,好像也没有新命令串,ID就不管了)

        // 技能命令串


        // 技能命令串或ID 返回工作(农民单点发起)(民兵变回农民)
        string peasant
        // 技能命令串或ID 潜水(娜迦)
        string submerga
        // 技能命令串或ID 取消潜水(娜迦)
        string unsubmerge
        // 技能命令串或ID 装载(飞艇、船、缠绕金矿等)
        string loadall
        // 技能命令串或ID 影遁
        string ambush
        // 技能命令串或ID 诱捕(网)
        string ensnare
        // 技能命令串或ID 吞噬(科多兽等)
        string devour
        // 技能命令串或ID 幻象物品(物品技能)
        string wandillusion
        // 技能命令串或ID 吸收魔法(毁灭者)
        string absorb
        // 技能命令串或ID 酸性炸弹
        string acidbomb
        // 技能命令串或ID 采集(侍僧)(黄金)
        string acolyteharvest
        // 技能命令串或ID AImove(AI移动)
        string aimove
        // 技能命令串或ID 影遁(夜晚)
        string ambush
        // 技能命令串或ID 先祖幽灵
        string ancestralspirit
        // 技能命令串或ID 先祖幽灵(目标)
        string ancestralspirittarget
        // 技能命令串或ID 操纵死尸
        string animatedead
        // 技能命令串或ID 反魔法外壳(单位技能)/具有反魔法盾的物品(物品技能)
        string antimagicshell
        // 技能命令串或ID 攻击
        string attack
        // 技能命令串或ID 攻击地面
        string attackground
        // 技能命令串或ID 攻击一次
        string attackonce
        // 技能命令串或ID 属性加成(黄点技能)
        string attributemodskill
        // 技能命令串或ID 邪恶光环
        string auraunholy
        // 技能命令串或ID 吸血光环
        string auravampiric
        // 技能命令串或ID 驱逐魔法(小鹿)
        string autodispel
        // 技能命令串或ID 取消驱逐(小鹿)
        string autodispeloff
        // 技能命令串或ID 激活驱逐(小鹿)
        string autodispelon
        // 技能命令串或ID 缠绕金矿(指定单位)
        string autoentangle
        // 技能命令串或ID 缠绕金矿(立即)(指定单位)
        string autoentangleinstant
        // 技能命令串或ID 自动采集黄金
        string autoharvestgold
        // 技能命令串或ID 自动采集木材
        string autoharvestlumber
        // 技能命令串或ID 天神下凡
        string avatar
        // 技能命令串或ID 破坏者形态
        string avengerform
        // 技能命令串或ID 唤醒
        string awaken
        // 技能命令串或ID 虚无(血法)
        string banish
        // 技能命令串或ID 硬化皮肤
        string barkskin
        // 技能命令串或ID 激活硬化皮肤
        string barkskinoff
        // 技能命令串或ID 取消硬化皮肤
        string barkskinon
        // 技能命令串或ID 战斗咆哮
        string battleroar
        // 技能命令串或ID 战斗警备(兽族地洞)
        string battlestations
        // 技能命令串或ID 变熊
        string bearform
        // 技能命令串或ID 狂战士
        string berserk
        // 技能命令串或ID 黑暗之箭
        string blackarrow
        // 技能命令串或ID 取消黑暗之箭
        string blackarrowoff
        // 技能命令串或ID 激活黑暗之箭
        string blackarrowon
        // 技能命令串或ID 荒芜(荒芜之地)
        string blight
        // 技能命令串或ID 闪烁(物品等级)(英雄技能&物品技能)
        string blink
        // 技能命令串或ID 暴风雪
        string blizzard
        // 技能命令串或ID 嗜血术
        string bloodlust
        // 技能命令串或ID 取消嗜血术
        string bloodlustoff
        // 技能命令串或ID 激活嗜血术
        string bloodluston
        // 技能命令串或ID 登船
        string board
        // 技能命令串或ID 火焰吐息
        string breathoffire
        // 技能命令串或ID 霜冻呼吸
        string breathoffrost
        // 技能命令串或ID 建筑菜单
        string build
        // 技能命令串或ID 钻地
        string burrow
        // 技能命令串或ID 吞食尸体
        string cannibalize
        // 技能命令串或ID 腐尸甲虫(指定单位)
        string carrionscarabs
        // 技能命令串或ID 召唤腐尸甲虫(无目标)
        string carrionscarabsinstant
        // 技能命令串或ID 取消腐尸甲虫
        string carrionscarabsoff
        // 技能命令串或ID 激活腐尸甲虫
        string carrionscarabson
        // 技能命令串或ID 腐臭蜂群
        string carrionswarm
        // 技能命令串或ID 闪电链
        string chainlightning
        // 技能命令串或ID 通魔
        string channel
        // 技能命令串或ID 符咒
        string charm
        // 技能命令串或ID 化学风暴
        string chemicalrage
        // 技能命令串或ID 乌云技能(单位技能&物品技能)
        string cloudoffog
        // 技能命令串或ID 火箭群
        string clusterrockets
        // 技能命令串或ID 激活霜冻之箭
        string coldarrows
        // 技能命令串或ID 霜冻之箭
        string coldarrowstarg
        // 技能命令串或ID 控制魔法
        string controlmagic
        // 技能命令串或ID 腐蚀喷吐
        string corrosivebreath
        // 技能命令串或ID 骑乘角鹰兽&搭载弓箭手
        string coupleinstant
        // 技能命令串或ID 搭载弓箭手
        string coupletarget
        // 技能命令串或ID 操纵死尸(中立)
        string creepanimatedead
        // 技能命令串或ID 吞噬(中立)
        string creepdevour
        // 技能命令串或ID 治疗(中立)
        string creepheal
        // 技能命令串或ID 取消治疗(中立)
        string creephealoff
        // 技能命令串或ID 激活治疗(中立)
        string creephealon
        // 技能命令串或ID 投石(中立)
        string creepthunderbolt
        // 技能命令串或ID 雷霆一击(中立)
        string creepthunderclap
        // 技能命令串或ID 残废
        string cripple
        // 技能命令串或ID 诅咒
        string curse
        // 技能命令串或ID 解除诅咒
        string curseoff
        // 技能命令串或ID 激活诅咒
        string curseon
        // 技能命令串或ID 飓风术(鸟德)
        string cyclone
        // 技能命令串或ID 黑暗转换
        string darkconversion
        // 技能命令串或ID 黑暗之门
        string darkportal
        // 技能命令串或ID 黑暗仪式
        string darkritual
        // 技能命令串或ID 黑暗召唤(英雄技能&物品技能)
        string darksummoning
        // 技能命令串或ID 死亡凋零
        string deathanddecay
        // 技能命令串或ID 死亡缠绕
        string deathcoil
        // 技能命令串或ID 死亡契约
        string deathpact
        // 技能命令串或ID 卸载弓箭手
        string decouple
        // 技能命令串或ID 激活防御
        string defend
        // 技能命令串或ID 显示/探测
        string detectaoe
        // 技能命令串或ID 自爆(小精灵)
        string detonate
        // 技能命令串或ID 吞噬(科多兽等)
        string devour
        // 技能命令串或ID 吞噬魔法(毁灭者)
        string devourmagic
        // 技能命令串或ID 分离
        string disassociate
        // 技能命令串或ID 消魔(白牛)
        string disenchant
        // 技能命令串或ID 取消坐骑
        string dismount
        // 技能命令串或ID 驱散(人族牧师)
        string dispel
        // 技能命令串或ID 激活神圣护甲
        string divineshield
        // 技能命令串或ID 末日审判
        string doom
        // 技能命令串或ID 生命汲取/魔法吸吮
        string drain
        // 技能命令串或ID 地狱火
        string dreadlordinferno
        // 技能命令串或ID 丢弃物品
        string dropitem
        // 技能命令串或ID 醉酒云雾
        string drunkenhaze
        // 技能命令串或ID 地震(先知)
        string earthquake
        // 技能命令串或ID 吃树(古树)
        string eattree
        // 技能命令串或ID 火土风暴
        string elementalfury
        // 技能命令串或ID 诱捕(网,非蛛网)
        string ensnare
        // 技能命令串或ID 激活诱捕(网,非蛛网)
        string ensnareoff
        // 技能命令串或ID 取消诱捕(网,非蛛网)
        string ensnareon
        // 技能命令串或ID 缠绕金矿
        string entangle
        // 技能命令串或ID 缠绕金矿(立即)
        string entangleinstant
        // 技能命令串或ID 纠缠须根
        string entanglingroots
        // 技能命令串或ID 虚无状态(白牛转换形态技能)
        string etherealform
        // 技能命令串或ID 取消虚无状态(白牛转换形态技能)
        string unetherealform
        // 技能命令串或ID 虚无状态(白牛转换形态技能)
        string uncorporealform
        // 技能命令串或ID 灵肉状态(白牛转换形态技能)
        string corporealform
        // 技能命令串或ID 岗哨守卫
        string evileye
        // 技能命令串或ID 精灵之火
        string faeriefire
        // 技能命令串或ID 取消精灵之火
        string faeriefireoff
        // 技能命令串或ID 激活精灵之火
        string faeriefireon
        // 技能命令串或ID 刀阵旋风
        string fanofknives
        // 技能命令串或ID 远视(先知)
        string farsight
        // 技能命令串或ID 死亡之指(物品)(单位技能&物品技能)
        string fingerofdeath
        // 技能命令串或ID 霹雳闪电
        string firebolt
        // 技能命令串或ID 烈焰风暴
        string flamestrike
        // 技能命令串或ID 激活灼热之箭
        string flamingarrows
        // 技能命令串或ID 灼热之箭
        string flamingarrowstarg
        // 技能命令串或ID 激活毁灭之球(毁灭者)
        string flamingattack
        // 技能命令串或ID 毁灭之球(毁灭者)
        string flamingattacktarg
        // 技能命令串或ID 照明弹
        string flare
        // 技能命令串或ID 自然之船
        string forceboard
        // 技能命令串或ID 自然之力
        string forceofnature
        // 技能命令串或ID 火土风暴
        string forkedlightning
        // 技能命令串或ID 冰冻喷吐
        string freezingbreath
        // 技能命令串或ID 狂热(中立)
        string frenzy
        // 技能命令串或ID 取消狂热
        string frenzyoff
        // 技能命令串或ID 激活狂热
        string frenzyon
        // 技能命令串或ID 霜冻护甲
        string frostarmor
        // 技能命令串或ID 取消霜冻护甲
        string frostarmoroff
        // 技能命令串或ID 激活霜冻护甲
        string frostarmoron
        // 技能命令串或ID 霜冻新星
        string frostnova
        // 技能命令串或ID 给与物品
        string getitem
        // 技能命令串或ID 黄金交换木材
        string gold2lumber
        // 技能命令串或ID 战棍(山岭巨人)
        string grabtree
        // 技能命令串或ID 采集(黄金和木材)
        string harvest
        // 技能命令串或ID 医疗喷雾
        string healingspray
        // 技能命令串或ID 治疗守卫
        string healingward
        // 技能命令串或ID 医疗波
        string healingwave
        // 技能命令串或ID 取消治疗(人族牧师)
        string healoff
        // 技能命令串或ID 激活治疗(人族牧师)
        string healon
        // 技能命令串或ID 治疗(人族牧师)
        string heal
        // 技能命令串或ID 妖术
        string hex
        // 技能命令串或ID 保持原位(技能面板)
        string holdposition
        // 技能命令串或ID 神圣之光
        string holybolt
        // 技能命令串或ID 恐怖嚎叫
        string howlofterror
        // 技能命令串或ID 人族建筑菜单
        string humanbuild
        // 技能命令串或ID 激活献祭(恶魔猎手)
        string immolation
        // 技能命令串或ID 穿刺(地穴领主)
        string impale
        // 技能命令串或ID 燃灰(箭矢)
        string incineratearrow
        // 技能命令串或ID 取消燃灰(箭矢)
        string incineratearrowoff
        // 技能命令串或ID 激活燃灰(箭矢)
        string incineratearrowon
        // 技能命令串或ID 地狱火
        string inferno
        // 技能命令串或ID 心灵之火(人族牧师)
        string innerfire
        // 技能命令串或ID 取消心灵之火(人族牧师)
        string innerfireoff
        // 技能命令串或ID 激活心灵之火(人族牧师)
        string innerfireon
        // 技能命令串或ID 召唤骷髅(无目标)
        string instant
        // 技能命令串或ID 隐形术(人族女巫)
        string invisibility
        // 技能命令串或ID 召唤炎魔
        string lavamonster
        // 技能命令串或ID 闪电护盾
        string lightningshield
        // 技能命令串或ID 搭载弓箭手
        string loadarcher 
        // 技能命令串或ID 获取尸体(绞肉车)
        string loadcorpse
        // 技能命令串或ID 获取尸体(立即)(绞肉车)
        string loadcorpseinstant
        // 技能命令串或ID 蝗虫群
        string locustswarm
        // 技能命令串或ID 木材交换黄金
        string lumber2gold
        // 技能命令串或ID 激活魔法防御
        string magicdefense
        // 技能命令串或ID 空中锁链
        string magicleash
        // 技能命令串或ID 取消魔法防御
        string magicundefense
        // 技能命令串或ID 法力燃烧
        string manaburn
        // 技能命令串或ID 停止魔力之焰(精灵龙)
        string manaflareoff
        // 技能命令串或ID 魔力之焰(精灵龙)
        string manaflareon
        // 技能命令串或ID 取消魔法盾
        string manashieldoff
        // 技能命令串或ID 激活魔法盾
        string manashieldon
        // 技能命令串或ID 群体传送/传送权杖(英雄技能&物品技能)
        string massteleport
        // 技能命令串或ID 机械类的小玩艺(物品技能)
        string mechanicalcritter
        // 技能命令串或ID 恶魔变身
        string metamorphosis
        // 技能命令串或ID 战斗号召(人族民兵)
        string militia
        // 技能命令串或ID 农民转换成民兵
        string militiaconvert
        // 技能命令串或ID 返回工作(人族民兵)
        string militiaoff
        // 技能命令串或ID 民兵转换成农民
        string militiaunconvert
        // 技能命令串或ID 心灵腐烂
        string mindrot
        // 技能命令串或ID 镜像
        string mirrorimage
        // 技能命令串或ID 季风
        string monsoon
        // 技能命令串或ID 骑乘
        string mount
        // 技能命令串或ID 骑乘角鹰兽
        string mounthippogryph
        // 技能命令串或ID 移动/跟随
        string move
        // 技能命令串或ID 娜迦建造菜单
        string nagabuild
        // 技能命令串或ID 显示(人族及中立)
        string neutraldetectaoe
        // 技能命令串或ID 选择英雄
        string neutralinteract
        // 技能命令串或ID 收费(中立)
        string neutralspell
        // 技能命令串或ID 暗夜精灵建造菜单
        string nightelfbuild
        // 技能命令串或ID 兽族建筑菜单
        string orcbuild
        // 技能命令串或ID 寄生虫(娜迦)
        string parasite
        // 技能命令串或ID 取消寄生虫(娜迦)
        string parasiteoff
        // 技能命令串或ID 激活寄生虫(娜迦)
        string parasiteon
        // 技能命令串或ID 巡逻
        string patrol
        // 技能命令串或ID 相位移动(精灵龙)
        string phaseshift
        // 技能命令串或ID 相位移动(立即)(精灵龙)
        string phaseshiftinstant
        // 技能命令串或ID 取消相位移动(精灵龙)
        string phaseshiftoff
        // 技能命令串或ID 激活相位移动(精灵龙)
        string phaseshifton
        // 技能命令串或ID 凤凰烈焰(飞行单位)
        string phoenixfire
        // 技能命令串或ID 凤凰转换形态
        string phoenixmorph
        // 技能命令串或ID 毒箭
        string poisonarrowstarg
        // 技能命令串或ID 变形术(人族女巫)
        string polymorph
        // 技能命令串或ID 占据
        string possession
        // 技能命令串或ID 保存权杖(物品技能)
        string preservation
        // 技能命令串或ID 净化/带有净化效果的物品(1)(单位技能&物品技能)
        string purge
        // 技能命令串或ID 混乱之雨
        string rainofchaos
        // 技能命令串或ID 火焰雨
        string rainoffire
        // 技能命令串或ID 召唤骷髅(指定单位)
        string raisedead
        // 技能命令串或ID 取消召唤骷髅(亡灵男巫)
        string raisedeadoff
        // 技能命令串或ID 激活召唤骷髅(亡灵男巫)
        string raisedeadon
        // 技能命令串或ID 补充(月井之春)
        string recharge
        // 技能命令串或ID 取消补充(月井之春)
        string rechargeoff
        // 技能命令串或ID 激活补充(月井之春)
        string rechargeon
        // 技能命令串或ID 回春术
        string rejuvination
        // 技能命令串或ID 修理(暗夜精灵族)
        string renew
        // 技能命令串或ID 取消修理(暗夜精灵族)
        string renewoff
        // 技能命令串或ID 激活修理(暗夜精灵族)
        string renewon
        // 技能命令串或ID 修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
        string repair
        // 技能命令串或ID 取消修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
        string repairoff
        // 技能命令串或ID 激活修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
        string repairon
        // 技能命令串或ID 枯萎精髓及灵魂触摸(十胜石雕像)
        string replenish
        // 技能命令串或ID 枯萎精髓(十胜石雕像)
        string replenishlife
        // 技能命令串或ID 取消枯萎精髓(十胜石雕像)
        string replenishlifeoff
        // 技能命令串或ID 激活枯萎精髓(十胜石雕像)
        string replenishlifeon
        // 技能命令串或ID 灵魂触摸(十胜石雕像)
        string replenishmana
        // 技能命令串或ID 取消灵魂触摸(十胜石雕像)
        string replenishmanaoff
        // 技能命令串或ID 激活灵魂触摸(十胜石雕像)
        string replenishmanaon
        // 技能命令串或ID 取消枯萎精髓及灵魂触摸(十胜石雕像)
        string replenishoff
        // 技能命令串或ID 激活枯萎精髓及灵魂触摸(十胜石雕像)
        string replenishon
        // 技能命令串或ID 请求(英雄)
        string request_hero
        // 技能命令串或ID 牺牲(侍僧)
        string requestsacrifice
        // 技能命令串或ID 修理(不死灵族)
        string restoration
        // 技能命令串或ID 取消修理(不死灵族)
        string restorationoff
        // 技能命令串或ID 激活修理(不死灵族)
        string restorationon
        // 技能命令串或ID 返还建造
        string resumebuild
        // 技能命令串或ID 返还资源
        string resumeharvesting
        // 技能命令串或ID 返还资源
        string returnresources
        // 技能命令串或ID 复活(圣骑士)
        string resurrection
        // 技能命令串或ID 复仇(中立)
        string revenge
        // 技能命令串或ID 复活英雄
        string revive
        // 技能命令串或ID 咆哮
        string roar
        // 技能命令串或ID 牺牲(深渊)(不死灵族)
        string sacrifice
        // 技能命令串或ID 避难
        string sanctuary
        // 技能命令串或ID 侦查(白虎猫头鹰)
        string scout
        // 技能命令串或ID 卡布恩(自爆工兵)
        string selfdestruct
        // 技能命令串或ID 取消卡布恩(自爆工兵)
        string selfdestructoff
        // 技能命令串或ID 激活卡布恩(自爆工兵)
        string selfdestructon
        // 技能命令串或ID 哨兵(女猎)
        string sentinel
        // 技能命令串或ID 设置集结点
        string setrally
        // 技能命令串或ID 影子权杖(物品技能)
        string shadowsight
        // 技能命令串或ID 暗影突袭
        string shadowstrike
        // 技能命令串或ID 震荡波
        string shockwave
        // 技能命令串或ID 沉默
        string silence
        // 技能命令串或ID 睡眠(恐惧魔王)
        string sleep
        // 技能命令串或ID 减速(人族女巫)
        string slow
        // 技能命令串或ID 取消减速(人族女巫)
        string slowoff
        // 技能命令串或ID 激活减速(人族女巫)
        string slowon
        // 技能命令串或ID 右键点击
        string smart
        // 技能命令串或ID 灵魂燃烧
        string soulburn
        // 技能命令串或ID 灵魂保存
        string soulpreservation
        // 技能命令串或ID 魔法护盾(物品技能)
        string spellshield
        // 技能命令串或ID 魔法护盾(AEO)
        string spellshieldaoe
        // 技能命令串或ID 魔法盗取
        string spellsteal
        // 技能命令串或ID 取消魔法盗取
        string spellstealoff
        // 技能命令串或ID 激活魔法盗取
        string spellstealon
        // 技能命令串或ID 监视(岗哨守卫)
        string spies
        // 技能命令串或ID 灵魂链接
        string spiritlink
        // 技能命令串或ID 复仇天神
        string spiritofvengeance
        // 技能命令串或ID 灵魂巨魔
        string spirittroll
        // 技能命令串或ID 野兽幽魂
        string spiritwolf
        // 技能命令串或ID 惊吓
        string stampede
        // 技能命令串或ID 卸载苦工(兽族地洞)
        string standdown
        // 技能命令串或ID 群星坠落
        string starfall
        // 技能命令串或ID 静止陷阱
        string stasistrap
        // 技能命令串或ID 盗取(物品技能)
        string steal
        // 技能命令串或ID 战争践踏
        string stomp
        // 技能命令串或ID 停止
        string stop
        // 技能命令串或ID 口袋工厂
        string summonfactory
        // 技能命令串或ID 召唤熊
        string summongrizzly
        // 技能命令串或ID 召唤凤凰
        string summonphoenix
        // 技能命令串或ID 召唤豪猪
        string summonquillbeast
        // 技能命令串或ID 召唤战鹰
        string summonwareagle
        // 技能命令串或ID 空投坦克
        string tankdroppilot
        // 技能命令串或ID 挂载坦克
        string tankloadpilot
        // 技能命令串或ID 挂载坦克形态(tankpilot)
        string tankpilot
        // 技能命令串或ID 嘲讽(山岭巨人)
        string taunt
        // 技能命令串或ID 风暴之锤
        string thunderbolt
        // 技能命令串或ID 雷霆一击
        string thunderclap
        // 技能命令串或ID 龙卷风(娜迦女海巫)
        string tornado
        // 技能命令串或ID 返回工作(城镇大厅)(townbelloff)
        string townbelloff
        // 技能命令串或ID 战斗号召(城镇大厅)(townbellon)
        string townbellon
        // 技能命令串或ID 宁静
        string tranquility
        // 技能命令串或ID 点金术
        string transmute
        // 技能命令串或ID 取消天神下凡
        string unavatar
        // 技能命令串或ID 取消破坏者形态
        string unavengerform
        // 技能命令串或ID 取消变熊
        string unbearform
        // 技能命令串或ID 取消钻地
        string unburrow
        // 技能命令串或ID 取消霜冻之箭
        string uncoldarrows
        // 技能命令串或ID 不死建造菜单
        string undeadbuild
        // 技能命令串或ID 取消防御
        string undefend
        // 技能命令串或ID 取消神圣护甲
        string undivineshield
        // 技能命令串或ID 取消灼热之箭
        string unflamingarrows
        // 技能命令串或ID 取消毁灭之球(毁灭者)
        string unflamingattack
        // 技能命令串或ID 邪恶狂热
        string unholyfrenzy
        // 技能命令串或ID 激活献祭(恶魔猎手)
        string immolation
        // 技能命令串或ID 解除献祭(恶魔猎手)
        string unimmolation
        // 技能命令串或ID 装载
        string load
        // 技能命令串或ID 卸载
        string unload
        // 技能命令串或ID 全部卸载
        string unloadall
        // 技能命令串或ID 丢弃所有尸体(绞肉车)
        string unloadallcorpses
        // 技能命令串或ID 全部卸载(立即)
        string unloadallinstant
        // 技能命令串或ID 毒箭
        string poisonarrows
        // 技能命令串或ID 取消毒箭
        string unpoisonarrows
        // 技能命令串或ID 风暴之鸦
        string ravenform
        // 技能命令串或ID 取消风暴之鸦
        string unravenform
        // 技能命令串或ID 机器人形态
        string robogoblin
        // 技能命令串或ID 取消机器人形态
        string unrobogoblin
        // 技能命令串或ID 扎根(古树)
        string root
        // 技能命令串或ID 拔根(古树)
        string unroot
        // 技能命令串或ID 不稳定化合物(自爆蝙蝠)
        string unstableconcoction
        // 技能命令串或ID 石像形态
        string stoneform
        // 技能命令串或ID 取消石像形态
        string unstoneform
        // 技能命令串或ID 反召唤(物品技能)(侍僧卖建筑)(单位技能&物品技能)
        string unsummon
        // 技能命令串或ID 取消疾风步
        string unwindwalk
        // 技能命令串或ID 复仇之魂
        string vengeance
        // 技能命令串或ID 复仇之魂(无目标)
        string vengeanceinstant
        // 技能命令串或ID 取消复仇之魂
        string vengeanceoff
        // 技能命令串或ID 激活复仇之魂
        string vengeanceon
        // 技能命令串或ID 火山爆发
        string volcano
        // 技能命令串或ID 巫毒(暗影猎手)
        string voodoo
        // 技能命令串或ID 产卵触角/毒蛇守卫
        string ward
        // 技能命令串或ID (召唤)水元素
        string waterelemental
        // 技能命令串或ID 召唤水奴
        string wateryminion
        // 技能命令串或ID 蛛网
        string web
        // 技能命令串或ID 取消蛛网
        string weboff
        // 技能命令串或ID 激活蛛网
        string webon
        // 技能命令串或ID 剑刃风暴
        string whirlwind
        // 技能命令串或ID 疾风步
        string windwalk
        // 技能命令串或ID 采集(小精灵)(黄金和木材)
        string wispharvest
        // 技能命令串或ID 加速卷轴/能暂时加快移动速度的物品(物品技能)
        string scrollofspeed
        // 技能命令串或ID 取消
        string cancel
        // 技能命令串或ID 移动物品到第一格
        string moveslot1
        // 技能命令串或ID 移动物品到第二格
        string moveslot2
        // 技能命令串或ID 移动物品到第三格
        string moveslot3
        // 技能命令串或ID 移动物品到第四格
        string moveslot4
        // 技能命令串或ID 移动物品到第五格
        string moveslot5
        // 技能命令串或ID 移动物品到第六格
        string moveslot6
        // 技能命令串或ID 使用第一格物品
        string useslot1
        // 技能命令串或ID 使用第二格物品
        string useslot2
        // 技能命令串或ID 使用第三格物品
        string useslot3
        // 技能命令串或ID 使用第四格物品
        string useslot4
        // 技能命令串或ID 使用第五格物品
        string useslot5
        // 技能命令串或ID 使用第六格物品
        string useslot6
        // 技能命令串或ID 技能菜单(技能面板)
        string skillmenu
        // 技能命令串或ID 昏迷
        string stunned
        // 技能命令串或ID 巡逻(技能面板)
        string instant1
        // 技能命令串或ID 移动(技能面板)
        string instant2
        // 技能命令串或ID 停止(技能面板)
        string instant3
        // 技能命令串或ID 采集(黄金和木材)(技能面板)
        string instant4


        // 技能ID


        // 中立技能

        // 技能命令串或ID 显示(人族及中立)
        integer 852023
        // 技能命令串或ID 卡布恩(自爆工兵)
        integer 852040
        // 技能命令串或ID 激活卡布恩(自爆工兵)
        integer 852041
        // 技能命令串或ID 取消卡布恩(自爆工兵)
        integer 852042
        // 技能命令串或ID 乌鸦形态(中立)
        integer 852155
        // 技能命令串或ID 取消乌鸦形态(中立)
        integer 852156
        // 技能命令串或ID 黑暗转换
        integer 852228
        // 技能命令串或ID 黑暗之门
        integer 852229
        // 技能命令串或ID 霹雳闪电
        integer 852231
        // 技能命令串或ID 混乱之雨
        integer 852237
        // 技能命令串或ID 火焰雨
        integer 852238
        // 技能命令串或ID 复仇(中立)
        integer 852241
        // 技能命令串或ID 灵魂保存
        integer 852242
        // 技能命令串或ID 霜冻之箭
        integer 852243
        // 技能命令串或ID 激活霜冻之箭
        integer 852244
        // 技能命令串或ID 取消霜冻之箭
        integer 852245
        // 技能命令串或ID 操纵死尸(中立)
        integer 852246
        // 技能命令串或ID 吞噬(中立)
        integer 852247
        // 技能命令串或ID 野怪医疗(中立)
        integer 852248
        // 技能命令串或ID 治疗(中立)
        integer 852248
        // 技能命令串或ID 激活治疗(中立)
        integer 852249
        // 技能命令串或ID 取消治疗(中立)
        integer 852250
        // 技能命令串或ID 投石(中立)
        integer 852252
        // 技能命令串或ID 雷霆一击(中立)
        integer 852253
        // 技能命令串或ID 毒箭
        integer 852254
        // 技能命令串或ID 激活毒箭
        integer 852255
        // 技能命令串或ID 取消毒箭
        integer 852256
        // 技能命令串或ID 生命汲取/魔法吸吮
        integer 852487
        // 技能命令串或ID 产卵触角/毒蛇守卫
        integer 852504
        // 技能命令串或ID 霜冻呼吸
        integer 852560
        // 技能命令串或ID 狂热(中立)
        integer 852561
        // 技能命令串或ID 心灵腐烂
        integer 852565
        // 技能命令串或ID 黑暗之箭
        integer 852577
        // 技能命令串或ID 激活黑暗之箭
        integer 852578
        // 技能命令串或ID 取消黑暗之箭
        integer 852579
        // 技能命令串或ID 火焰吐息
        integer 852580
        // 技能命令串或ID 符咒
        integer 852581
        // 技能命令串或ID 末日审判
        integer 852583
        // 技能命令串或ID 醉酒云雾
        integer 852585
        // 技能命令串或ID 火土风暴
        integer 852586
        // 技能命令串或ID 叉状闪电
        integer 852587
        // 技能命令串或ID 恐怖嚎叫
        integer 852588
        // 技能命令串或ID 激活魔法盾
        integer 852589
        // 技能命令串或ID 取消魔法盾
        integer 852590
        // 技能命令串或ID 季风
        integer 852591
        // 技能命令串或ID 沉默
        integer 852592
        // 技能命令串或ID 惊吓
        integer 852593
        // 技能命令串或ID 召唤熊
        integer 852594
        // 技能命令串或ID 召唤豪猪
        integer 852595
        // 技能命令串或ID 召唤战鹰
        integer 852596
        // 技能命令串或ID 龙卷风(娜迦女海巫)
        integer 852597
        // 技能命令串或ID 召唤水奴
        integer 852598
        // 技能命令串或ID 战争咆哮
        integer 852599
        // 技能命令串或ID 通魔
        integer 852600
        // 技能命令串或ID 寄生虫(娜迦)
        integer 852601
        // 技能命令串或ID 激活寄生虫(娜迦)
        integer 852602
        // 技能命令串或ID 取消寄生虫(娜迦)
        integer 852603
        // 技能命令串或ID 潜水(娜迦)
        integer 852604
        // 技能命令串或ID 取消潜水(娜迦)
        integer 852605
        // 技能命令串或ID 瓦解光线(中立)
        integer 852615
        // 技能命令串或ID 收费(中立)
        integer 852630
        // 技能命令串或ID 火箭群
        integer 852652
        // 技能命令串或ID 开启机器人形态
        integer 852656
        // 技能命令串或ID 取消机器人形态
        integer 852657
        // 技能命令串或ID 口袋工厂
        integer 852658
        // 技能命令串或ID 酸性炸弹
        integer 852662
        // 技能命令串或ID 化学风暴
        integer 852663
        // 技能命令串或ID 医疗喷雾
        integer 852664
        // 技能命令串或ID 点金术
        integer 852665
        // 技能命令串或ID 召唤炎魔
        integer 852667
        // 技能命令串或ID 灵魂燃烧
        integer 852668
        // 技能命令串或ID 火山爆发
        integer 852669
        // 技能命令串或ID 燃灰(箭矢)
        integer 852670
        // 技能命令串或ID 激活燃灰(箭矢)
        integer 852671
        // 技能命令串或ID 取消燃灰(箭矢)
        integer 852672
        // 技能命令串或ID 娜迦建造菜单
        integer 852467
        // 技能命令串或ID 魔法护盾(AEO)(spellshieldaoe)
        integer 852572
        // 技能命令串或ID 属性加成(黄点技能)
        integer 852576


        // 物品技能

        // 技能命令串或ID 群体传送/传送权杖(英雄技能&物品技能)
        integer 852093
        // 技能命令串或ID 净化/带有净化效果的物品(1)(单位技能&物品技能)
        integer 852111
        // 技能命令串或ID 反魔法外壳(单位技能)/具有反魔法盾的物品(物品技能)
        integer 852186
        // 技能命令串或ID 反召唤(物品技能)(侍僧卖建筑)(单位技能&物品技能)
        integer 852210
        // 技能命令串或ID 黑暗召唤(英雄技能&物品技能)
        integer 852220
        // 技能命令串或ID 死亡之指(物品)(单位技能&物品技能)
        integer 852230
        // 技能命令串或ID 能召唤单位的物品(物品技能)
        integer 852261
        // 技能命令串或ID 统治权杖(物品技能)
        integer 852267
        // 技能命令串或ID 能暂时加强范围内所有单位护甲的物品(物品技能)
        integer 852269
        // 技能命令串或ID 能探测一定区域的物品(物品技能)
        integer 852270
        // 技能命令串或ID 具有驱逐魔法效果的物品(物品技能)
        integer 852271
        // 技能命令串或ID 具有医疗效果的物品/最小的医疗能力(物品技能)
        integer 852272
        // 技能命令串或ID 能进行范围医疗的物品/时钟企鹅(物品技能)
        integer 852273
        // 技能命令串或ID 幻象物品(物品技能)
        integer 852274
        // 技能命令串或ID 带有净化效果的物品(1)(物品技能)
        integer 852275
        // 技能命令串或ID 能提高一定范围内所有单位魔法值的物品/神秘区域魔法恢复(物品技能)
        integer 852277
        // 技能命令串或ID 能置放地精地雷的物品(物品技能)
        integer 852278
        // 技能命令串或ID 召唤物品(物品技能)
        integer 852279
        // 技能命令串或ID 能进行医疗和增加魔法值的单位(物品技能)
        integer 852281
        // 技能命令串或ID 神秘区域生命魔法恢复/能提高一定范围内所有单位魔法值和生命值的物品(物品技能)
        integer 852282
        // 技能命令串或ID 能盗取单位灵魂的物品(物品技能)
        integer 852284
        // 技能命令串或ID 加速卷轴/能暂时加快移动速度的物品(物品技能)
        integer 852285
        // 技能命令串或ID 回城卷轴物品(物品技能)
        integer 852286
        // 技能命令串或ID 能让单位暂时隐身的物品(物品技能)
        integer 852287
        // 技能命令串或ID 能让单位暂时无敌的物品(物品技能)
        integer 852288
        // 技能命令串或ID 再训练之书(物品技能)
        integer 852471
        // 技能命令串或ID 乌云技能(单位技能&物品技能)
        integer 852473
        // 技能命令串或ID 闪烁(物品等级)(英雄技能&物品技能)
        integer 852525
        // 技能命令串或ID 机械类的小玩艺(物品技能)
        integer 852564
        // 技能命令串或ID 保存权杖(物品技能)
        integer 852568
        // 技能命令串或ID 影子权杖(物品技能)
        integer 852570
        // 技能命令串或ID 魔法护盾(物品技能)
        integer 852571
        // 技能命令串或ID 盗取(物品技能)
        integer 852574
        // 技能命令串或ID 净化药水/医疗剂/恢复卷轴/普通物品-回复效果(物品技能)
        integer 852609
        // 技能命令串或ID 能显示整个地图的物品(物品技能)
        integer 852612
        // 技能命令串或ID 带有蛛网技能的物品(物品技能)
        integer 852613
        // 技能命令串或ID 怪兽诱捕守卫(物品技能)
        integer 852614
        // 技能命令串或ID 带有锁链驱逐效果的物品(物品技能)
        integer 852615
        // 技能命令串或ID 信号枪(物品技能)
        integer 852618
        // 技能命令串或ID 建造小型的建筑(迷你建筑)(物品技能)
        integer 852619
        // 技能命令串或ID 改变一天的时间(物品技能)
        integer 852621
        // 技能命令串或ID 吸血药水(物品技能)
        integer 852623
        // 技能命令串或ID 复活死尸(物品技能)
        integer 852624
        // 技能命令串或ID 尘土之影(物品技能)
        integer 852625


        // 特殊命令类

        // 技能命令串或ID 右键点击
        integer 851971
        // 技能命令串或ID 停止
        integer 851972
        // 技能命令串或ID 昏迷
        integer 851973
        // 技能命令串或ID 中立单位静止
        integer 851974
        // 技能命令串或ID 取消
        integer 851976
        // 技能命令串或ID 设置集结点
        integer 851980
        // 技能命令串或ID 攻击
        integer 851983
        // 技能命令串或ID 攻击一次
        integer 851985
        // 技能命令串或ID 攻击地面
        integer 851984
        // 技能命令串或ID 黄金交换木材
        integer 852233
        // 技能命令串或ID 木材交换黄金
        integer 852234
        // 技能命令串或ID 巡逻(技能面板)
        integer 851991
        // 技能命令串或ID 移动(技能面板)
        integer 851987
        // 技能命令串或ID 停止(技能面板)
        integer 851975
        // 技能命令串或ID 采集(黄金和木材)(技能面板)
        integer 852019
        // 技能命令串或ID 移动/跟随
        integer 851986
        // 技能命令串或ID AImove(AI移动)
        integer 851988
        // 技能命令串或ID 保持原位(技能面板)
        integer 851993
        // 技能命令串或ID 建筑菜单
        integer 851994
        // 技能命令串或ID 巡逻
        integer 851990
        // 技能命令串或ID 技能菜单(技能面板)
        integer 852000
        // 技能命令串或ID 移动物品到第一格
        integer 852002
        // 技能命令串或ID 移动物品到第二格
        integer 852003
        // 技能命令串或ID 移动物品到第三格
        integer 852004
        // 技能命令串或ID 移动物品到第四格
        integer 852005
        // 技能命令串或ID 移动物品到第五格
        integer 852006
        // 技能命令串或ID 移动物品到第六格
        integer 852007
        // 技能命令串或ID 使用第一格物品
        integer 852008
        // 技能命令串或ID 使用第二格物品
        integer 852009
        // 技能命令串或ID 使用第三格物品
        integer 852010
        // 技能命令串或ID 使用第四格物品
        integer 852011
        // 技能命令串或ID 使用第五格物品
        integer 852012
        // 技能命令串或ID 使用第六格物品
        integer 852013
        // 技能命令串或ID 给与物品
        integer 851981
        // 技能命令串或ID 丢弃物品
        integer 852001
        // 技能命令串或ID 返还资源
        integer 852017
        // 技能命令串或ID 返还建造(resumebuild)
        integer 851999
        // 技能命令串或ID 采集(黄金和木材)
        integer 852018
        // 技能命令串或ID 自动采集黄金
        integer 852021
        // 技能命令串或ID 自动采集木材
        integer 852022
        // 技能命令串或ID 开始复活祭坛里的第一个英雄
        integer 852027
        // 技能命令串或ID 开始复活祭坛里的第二个英雄
        integer 852028
        // 技能命令串或ID 开始复活祭坛里的第三个英雄
        integer 852029
        // 技能命令串或ID 开始复活祭坛里的第四个英雄
        integer 852030
        // 技能命令串或ID 开始复活祭坛里的第五个英雄
        integer 852031
        // 技能命令串或ID 开始复活祭坛里的第六个英雄
        integer 852032
        // 技能命令串或ID 开始复活祭坛里的第七个英雄
        integer 852033
        // 技能命令串或ID 复活英雄
        integer 852039
        // 技能命令串或ID 登船
        integer 852043
        // 技能命令串或ID 全部登船
        integer 85044
        // 技能命令串或ID 装载
        integer 852046
        // 技能命令串或ID 卸载
        integer 852047
        // 技能命令串或ID 全部卸载
        integer 852048
        // 技能命令串或ID 全部卸载(立即)
        integer 852049
        // 技能命令串或ID 立即复活酒馆里的第一个英雄
        integer 852462
        // 技能命令串或ID 立即复活酒馆里的第二个英雄
        integer 852463
        // 技能命令串或ID 立即复活酒馆里的第三个英雄
        integer 852464
        // 技能命令串或ID 立即复活酒馆里的第四个英雄
        integer 852465
        // 技能命令串或ID 蝗虫随机游走
        integer 852557
        // 技能命令串或ID 蝗虫返回单位
        integer 852558
        // 技能命令串或ID 请求(英雄)(request_hero)
        integer 852239
        // 技能命令串或ID 返还资源(returnresources)
        integer 852020
        // 技能命令串或ID 选择英雄
        integer 852566


        // 暗夜精灵族技能

        // 技能命令串或ID 暗夜精灵建造菜单
        integer 851997
        // 技能命令串或ID 影遁(夜晚)
        integer 852131
        // 技能命令串或ID 驱逐魔法(小鹿)
        integer 852132
        // 技能命令串或ID 激活驱逐(小鹿)
        integer 852133
        // 技能命令串或ID 取消驱逐(小鹿)
        integer 852134
        // 技能命令串或ID 变熊
        integer 852138
        // 技能命令串或ID 取消变熊
        integer 852139
        // 技能命令串或ID 飓风术(鸟德)
        integer 852144
        // 技能命令串或ID 自爆(小精灵)
        integer 852145
        // 技能命令串或ID 吃树(古树)
        integer 852146
        // 技能命令串或ID 缠绕金矿
        integer 852147
        // 技能命令串或ID 缠绕金矿(立即)
        integer 852148
        // 技能命令串或ID 精灵之火
        integer 852149
        // 技能命令串或ID 激活精灵之火
        integer 852150
        // 技能命令串或ID 取消精灵之火
        integer 852151
        // 技能命令串或ID 风暴之鸦
        integer 852155
        // 技能命令串或ID 取消风暴之鸦
        integer 852156
        // 技能命令串或ID 补充(月井之春)
        integer 852157
        // 技能命令串或ID 激活补充(月井之春)
        integer 852158
        // 技能命令串或ID 取消补充(月井之春)
        integer 852159
        // 技能命令串或ID 回春术
        integer 852160
        // 技能命令串或ID 修理(暗夜精灵族)
        integer 852161
        // 技能命令串或ID 激活修理(暗夜精灵族)
        integer 852162
        // 技能命令串或ID 取消修理(暗夜精灵族)
        integer 852163
        // 技能命令串或ID 咆哮
        integer 852164
        // 技能命令串或ID 扎根(古树)
        integer 852165
        // 技能命令串或ID 拔根(古树)
        integer 852166
        // 技能命令串或ID 纠缠须根
        integer 852171
        // 技能命令串或ID 灼热之箭
        integer 852173
        // 技能命令串或ID 激活灼热之箭
        integer 852174
        // 技能命令串或ID 灼热之箭目标(flamingarrowstarg)
        integer 852540
        // 技能命令串或ID 取消灼热之箭
        integer 852175
        // 技能命令串或ID 自然之力
        integer 852176
        // 技能命令串或ID 自然之船(forceboard)
        integer 852044
        // 技能命令串或ID 激活献祭(恶魔猎手)
        integer 852177
        // 技能命令串或ID 解除献祭(恶魔猎手)
        integer 852178
        // 技能命令串或ID 法力燃烧
        integer 852179
        // 技能命令串或ID 恶魔变身
        integer 852180
        // 技能命令串或ID 侦查(白虎猫头鹰)
        integer 852181
        // 技能命令串或ID 哨兵(女猎)
        integer 852182
        // 技能命令串或ID 群星坠落
        integer 852183
        // 技能命令串或ID 宁静
        integer 852184
        // 技能命令串或ID 缠绕金矿(指定单位)
        integer 852505
        // 技能命令串或ID 缠绕金矿(立即)(指定单位)
        integer 852506
        // 技能命令串或ID 搭载弓箭手
        integer 852507
        // 技能命令串或ID 搭载弓箭手
        integer 852142
        // 技能命令串或ID 骑乘(mount)
        integer 852469
        // 技能命令串或ID 骑乘角鹰兽(mounthippogryph)
        integer 852143
        // 技能命令串或ID 骑乘角鹰兽&搭载弓箭手
        integer 852508
        // 技能命令串或ID 卸载弓箭手
        integer 852509
        // 技能命令串或ID 战棍(山岭巨人)
        integer 852511
        // 技能命令串或ID 魔力之焰(精灵龙)
        integer 852512
        // 技能命令串或ID 停止魔力之焰(精灵龙)
        integer 852513
        // 技能命令串或ID 相位移动(精灵龙)
        integer 852514
        // 技能命令串或ID 激活相位移动(精灵龙)
        integer 852515
        // 技能命令串或ID 取消相位移动(精灵龙)
        integer 852516
        // 技能命令串或ID 相位移动(立即)(精灵龙)
        integer 852517
        // 技能命令串或ID 嘲讽(山岭巨人)
        integer 852520
        // 技能命令串或ID 复仇之魂
        integer 852521
        // 技能命令串或ID 激活复仇之魂
        integer 852522
        // 技能命令串或ID 取消复仇之魂
        integer 852523
        // 技能命令串或ID 复仇之魂(无目标)
        integer 852524
        // 技能命令串或ID 刀阵旋风
        integer 852526
        // 技能命令串或ID 暗影突袭
        integer 852527
        // 技能命令串或ID 复仇天神
        integer 852528
        // 技能命令串或ID 硬化皮肤
        integer 852135
        // 技能命令串或ID 激活硬化皮肤
        integer 852137
        // 技能命令串或ID 取消硬化皮肤
        integer 852136
        // 技能命令串或ID 腐蚀喷吐
        integer 852140
        // 技能命令串或ID 分离(disassociate)
        integer 852240
        // 技能命令串或ID 取消坐骑(dismount)
        integer 852470
        // 技能命令串或ID 采集(小精灵)(黄金和木材)
        integer 852214


        // 不死族技能

        // 技能命令串或ID 不死建造菜单
        integer 851998
        // 技能命令串或ID 获取尸体(绞肉车)
        integer 852050
        // 技能命令串或ID 获取尸体(立即)(绞肉车)
        integer 852053
        // 技能命令串或ID 丢弃所有尸体(绞肉车)
        integer 852054
        // 技能命令串或ID 吞食尸体
        integer 852188
        // 技能命令串或ID 残废
        integer 852189
        // 技能命令串或ID 诅咒
        integer 852190
        // 技能命令串或ID 激活诅咒
        integer 852191
        // 技能命令串或ID 解除诅咒
        integer 852192
        // 技能命令串或ID 占据
        integer 852196
        // 技能命令串或ID 召唤骷髅(指定单位)
        integer 852197
        // 技能命令串或ID 激活召唤骷髅(亡灵男巫)
        integer 852198
        // 技能命令串或ID 取消召唤骷髅(亡灵男巫)
        integer 852199
        // 技能命令串或ID 召唤骷髅(无目标)
        integer 852200
        // 技能命令串或ID 牺牲(侍僧)
        integer 852201
        // 技能命令串或ID 修理(不死灵族)
        integer 852202
        // 技能命令串或ID 激活修理(不死灵族)
        integer 852203
        // 技能命令串或ID 取消修理(不死灵族)
        integer 852204
        // 技能命令串或ID 采集(侍僧)(黄金)
        integer 852185
        // 技能命令串或ID 牺牲(深渊)(不死灵族)
        integer 852205
        // 技能命令串或ID 石像形态
        integer 852206
        // 技能命令串或ID 取消石像形态
        integer 852207
        // 技能命令串或ID 邪恶狂热
        integer 852209
        // 技能命令串或ID 蛛网
        integer 852211
        // 技能命令串或ID 激活蛛网
        integer 852212
        // 技能命令串或ID 取消蛛网
        integer 852213
        // 技能命令串或ID 操纵死尸
        integer 852217
        // 技能命令串或ID 腐臭蜂群
        integer 852218
        // 技能命令串或ID 黑暗仪式
        integer 852219
        // 技能命令串或ID 死亡凋零
        integer 852221
        // 技能命令串或ID 死亡缠绕
        integer 852222
        // 技能命令串或ID 死亡契约
        integer 852223
        // 技能命令串或ID 地狱火
        integer 852224
        // 技能命令串或ID 霜冻护甲
        integer 852225
        // 技能命令串或ID 霜冻新星
        integer 852226
        // 技能命令串或ID 睡眠(恐惧魔王)
        integer 852227
        // 技能命令串或ID 激活霜冻护甲
        integer 852458
        // 技能命令串或ID 取消霜冻护甲
        integer 852459
        // 技能命令串或ID 吸收魔法(毁灭者)
        integer 852529
        // 技能命令串或ID 破坏者形态
        integer 852531
        // 技能命令串或ID 取消破坏者形态
        integer 852532
        // 技能命令串或ID 钻地
        integer 852533
        // 技能命令串或ID 取消钻地
        integer 852534
        // 技能命令串或ID 吞噬魔法(毁灭者)
        integer 852536
        // 技能命令串或ID 毁灭之球(毁灭者)
        integer 852539
        // 技能命令串或ID 激活毁灭之球(毁灭者)
        integer 852540
        // 技能命令串或ID 取消毁灭之球(毁灭者)
        integer 852541
        // 技能命令串或ID 枯萎精髓及灵魂触摸(十胜石雕像)
        integer 852542
        // 技能命令串或ID 激活枯萎精髓及灵魂触摸(十胜石雕像)
        integer 852543
        // 技能命令串或ID 取消枯萎精髓及灵魂触摸(十胜石雕像)
        integer 852544
        // 技能命令串或ID 枯萎精髓(十胜石雕像)
        integer 852545
        // 技能命令串或ID 激活枯萎精髓(十胜石雕像)
        integer 852546
        // 技能命令串或ID 取消枯萎精髓(十胜石雕像)
        integer 852547
        // 技能命令串或ID 灵魂触摸(十胜石雕像)
        integer 852548
        // 技能命令串或ID 激活灵魂触摸(十胜石雕像)
        integer 852549
        // 技能命令串或ID 取消灵魂触摸(十胜石雕像)
        integer 852550
        // 技能命令串或ID 腐尸甲虫(指定单位)
        integer 852551
        // 技能命令串或ID 激活腐尸甲虫
        integer 852552
        // 技能命令串或ID 取消腐尸甲虫
        integer 852553
        // 技能命令串或ID 召唤腐尸甲虫(无目标)
        integer 852554
        // 技能命令串或ID 穿刺(地穴领主)
        integer 852555
        // 技能命令串或ID 蝗虫群
        integer 852556
        // 技能命令串或ID 冰冻喷吐
        integer 852195
        // 技能命令串或ID 激活狂热
        integer 852562
        // 技能命令串或ID 取消狂热
        integer 852563
        // 技能命令串或ID 地狱火
        integer 852232
        // 技能命令串或ID 邪恶光环
        integer 852215
        // 技能命令串或ID 吸血光环
        integer 852216
        // 技能命令串或ID 唤醒
        integer 852466
        // 技能命令串或ID 荒芜(荒芜之地)
        integer 852187


        //兽族技能

        // 技能命令串或ID 兽族建筑菜单
        integer 851996
        // 技能命令串或ID 修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
        integer 852024
        // 技能命令串或ID 激活修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
        integer 852025
        // 技能命令串或ID 取消修理(人族、兽族、娜迦族、达拉内尔族(破碎者))
        integer 852026
        // 技能命令串或ID 战斗警备(兽族地洞)
        integer 852099
        // 技能命令串或ID 狂战士
        integer 852100
        // 技能命令串或ID 嗜血术
        integer 852101
        // 技能命令串或ID 激活嗜血术
        integer 852102
        // 技能命令串或ID 取消嗜血术
        integer 852103
        // 技能命令串或ID 吞噬(科多兽等)
        integer 852104
        // 技能命令串或ID 岗哨守卫
        integer 852105
        // 技能命令串或ID 诱捕(网,非蛛网)
        integer 852106
        // 技能命令串或ID 激活诱捕(网,非蛛网)
        integer 852108
        // 技能命令串或ID 取消诱捕(网,非蛛网)
        integer 852107
        // 技能命令串或ID 治疗守卫
        integer 852109
        // 技能命令串或ID 闪电护盾
        integer 852110
        // 技能命令串或ID 卸载苦工(兽族地洞)
        integer 852113
        // 技能命令串或ID 静止陷阱
        integer 852114
        // 技能命令串或ID 闪电链
        integer 852119
        // 技能命令串或ID 地震(先知)
        integer 852121
        // 技能命令串或ID 远视(先知)
        integer 852122
        // 技能命令串或ID 镜像
        integer 852123
        // 技能命令串或ID 震荡波
        integer 852125
        // 技能命令串或ID 野兽幽魂
        integer 852126
        // 技能命令串或ID 战争践踏
        integer 852127
        // 技能命令串或ID 剑刃风暴
        integer 852128
        // 技能命令串或ID 疾风步
        integer 852129
        // 技能命令串或ID 取消疾风步
        integer 852130
        // 技能命令串或ID 先祖幽灵
        integer 852490
        // 技能命令串或ID 先祖幽灵(目标)
        integer 852491
        // 技能命令串或ID 虚无状态(白牛转换形态技能)
        integer 852494
        // 技能命令串或ID 灵肉状态(白牛转换形态技能)
        integer 852493
        // 技能命令串或ID 虚无状态(白牛转换形态技能)
        integer 852496
        // 技能命令串或ID 取消虚无状态(白牛转换形态技能)
        integer 852497
        // 技能命令串或ID 消魔(白牛)
        integer 852495
        // 技能命令串或ID 不稳定化合物(自爆蝙蝠)
        integer 852500
        // 技能命令串或ID 医疗波
        integer 852501
        // 技能命令串或ID 妖术
        integer 852502
        // 技能命令串或ID 巫毒(暗影猎手)
        integer 852503
        // 技能命令串或ID 灵魂锁链
        integer 854299
        // 技能命令串或ID 监视(岗哨守卫)(spies)
        integer 852235
        // 技能命令串或ID 灵魂巨魔(spirittroll)
        integer 852573


        // 人族技能

        // 技能命令串或ID 人族建筑菜单
        integer 851995
        // 技能命令串或ID 激活防御
        integer 852055
        // 技能命令串或ID 取消防御
        integer 852056
        // 技能命令串或ID 驱散(人族牧师)
        integer 852057
        // 技能命令串或ID 照明弹
        integer 852060
        // 技能命令串或ID 治疗(人族牧师)
        integer 852063
        // 技能命令串或ID 激活治疗(人族牧师)
        integer 852064
        // 技能命令串或ID 取消治疗(人族牧师)
        integer 852065
        // 技能命令串或ID 心灵之火(人族牧师)
        integer 852066
        // 技能命令串或ID 激活心灵之火(人族牧师)
        integer 852067
        // 技能命令串或ID 取消心灵之火(人族牧师)
        integer 852068
        // 技能命令串或ID 隐形术(人族女巫)
        integer 852069
        // 技能命令串或ID 战斗号召(人族民兵)
        integer 852072
        // 技能命令串或ID 返回工作(人族民兵)
        integer 852073
        // 技能命令串或ID 战斗号召(城镇大厅)(townbellon)
        integer 852082
        // 技能命令串或ID 返回工作(城镇大厅)(townbelloff)
        integer 852083
        // 技能命令串或ID 农民转换成民兵
        integer 852071
        // 技能命令串或ID 民兵转换成农民
        integer 852651
        // 技能命令串或ID 变形术(人族女巫)
        integer 852074
        // 技能命令串或ID 减速(人族女巫)
        integer 852075
        // 技能命令串或ID 激活减速(人族女巫)
        integer 852076
        // 技能命令串或ID 取消减速(人族女巫)
        integer 852077
        // 技能命令串或ID 天神下凡
        integer 852086
        // 技能命令串或ID 取消天神下凡
        integer 852087
        // 技能命令串或ID 暴风雪
        integer 852089
        // 技能命令串或ID 激活神圣护甲
        integer 852090
        // 技能命令串或ID 取消神圣护甲
        integer 852091
        // 技能命令串或ID 神圣之光
        integer 852092
        // 技能命令串或ID 复活(圣骑士)
        integer 852094
        // 技能命令串或ID 风暴之锤
        integer 852095
        // 技能命令串或ID 雷霆一击
        integer 852096
        // 技能命令串或ID (召唤)水元素
        integer 852097
        // 技能命令串或ID 控制魔法
        integer 852474
        // 技能命令串或ID 激活魔法防御
        integer 852478
        // 技能命令串或ID 取消魔法防御
        integer 852479
        // 技能命令串或ID 空中锁链
        integer 852480
        // 技能命令串或ID 凤凰烈焰(飞行单位)
        integer 852481
        // 技能命令串或ID 凤凰转换形态
        integer 852482
        // 技能命令串或ID 召唤凤凰
        integer 852489
        // 技能命令串或ID 魔法盗取
        integer 852483
        // 技能命令串或ID 激活魔法盗取
        integer 852484
        // 技能命令串或ID 取消魔法盗取
        integer 852485
        // 技能命令串或ID 虚无(血法)
        integer 852486
        // 技能命令串或ID 烈焰风暴
        integer 852488
        // 技能命令串或ID 避难(sanctuary)
        integer 852569
        // 技能命令串或ID 显示/探测(detectaoe)
        integer 852015
        // 技能命令串或ID 空投坦克(tankdroppilot)
        integer 852079
        // 技能命令串或ID 挂载坦克(tankloadpilot)
        integer 852080
        // 技能命令串或ID 挂载坦克形态(tankpilot)
        integer 852081


//fdf (Frame 定义文件)/UI
// 1.32+原生UI/框架
// 源：https://www.hiveworkshop.com/threads/ui-reading-a-fdf.315850/


        // 框架类型

        // 框架类型 背景
        string BACKDROP
        // 框架类型 按钮
        string BUTTON
        // 框架类型 聊天显示框
        string CHATDISPLAY
        // 框架类型 复选框
        string CHECKBOX
        // 框架类型 控制
        string CONTROL
        // 框架类型 对话框
        string DIALOG
        // 框架类型 输入框
        string EDITBOX
        // 框架类型 框架
        string FRAME
        // 框架类型 黏合按钮
        string GLUEBUTTON
        // 框架类型 黏合复选框
        string GLUECHECKBOX
        // 框架类型 黏合输入框
        string GLUEEDITBOX
        // 框架类型 黏合弹出菜单
        string GLUEPOPUPMENU
        // 框架类型 黏合文本按钮
        string GLUETEXTBUTTON
        // 框架类型 高亮显示
        string HIGHLIGHT
        // 框架类型 列表框
        string LISTBOX
        // 框架类型 菜单
        string MENU
        // 框架类型 模型
        string MODEL
        // 框架类型 弹出菜单
        string POPUPMENU
        // 框架类型 滚动条
        string SCROLLBAR
        // 框架类型 简易按钮
        string SIMPLEBUTTON
        // 框架类型 简易复选框
        string SIMPLECHECKBOX
        // 框架类型 简易框架
        string SIMPLEFRAME
        // 框架类型 简易状态栏
        string SIMPLESTATUSBAR
        // 框架类型 聊天框
        string SLASHCHATBOX
        // 框架类型 滑块
        string SLIDER
        // 框架类型 精灵图
        string SPRITE
        // 框架类型 文本
        string TEXT
        // 框架类型 文本区域
        string TEXTAREA
        // 框架类型 文本按钮
        string TEXTBUTTON
        // 框架类型 限时文本
        string TIMERTEXT


        // FDF(框架定义)

        // FDF(框架定义) 字母模式
        // 变量类型为字符串,如(官方默认提供)
        // "ADD"  添加
        // "ALPHAKEY"  字母键
        string AlphaMode
        // FDF(框架定义) 锚点
        // 变量类型为组合,如(官方默认提供)
        // BOTTOMLEFT, -0.256, 0  左下角
        // BOTTOMRIGHT, 0, 0  右下角
        // TOPLEFT, 0.0, -0.003  左上角
        // TOPRIGHT, -0.0914, -0.003125  右上角
        string Anchor
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
        string BackdropBackground
        // FDF(框架定义) 背景插入
        // 变量类型为实数,默认值如(官方默认提供)
        // 0.0 0.0 0.01 0.0
        // 0.0 0.01 0.0 0.0
        // 0.0025 0.0025 0.0025 0.0025
        // 0.003 0.003 0.003 0.003
        string BackdropBackgroundInsets
        // FDF(框架定义) 背景大小
        // 变量类型为实数,默认值(官方默认提供),如 0.128
        string BackdropBackgroundSize
        // FDF(框架定义) 背景混合
        string BackdropBlendAll
        // FDF(框架定义) 背景底部文件
        // 变量类型为字符串,如(官方默认提供)
        // "UI\Widgets\HeavyBorderBottom.blp"  加粗底边
        // "UI\Widgets\LightBorderBottom.blp"  高亮底边
        // "UI\Widgets\ButtonCorners.blp"  按钮边框样式(怀疑是圆角方角)
        // "UI\Widgets\LightBorderCorners.blp"  高亮边框
        string BackdropBottomFile
        // FDF(框架定义) 背景边框文件
        // 变量类型为字符串,如(官方默认提供)
        // "BL|BR|B"
        // "UL|UR|T"
        string BackdropCornerFile
        // FDF(框架定义) 背景边框标志
        // 变量类型为实数,如(官方默认提供)
        // 0.0125,0.006,0.008,0.0155
        string BackdropCornerFlags
        // FDF(框架定义) 背景边框尺寸
        string BackdropCornerSize
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
        string BackdropEdgeFile
        // FDF(框架定义) 背景半侧文件
        string BackdropHalfSides
        // FDF(框架定义) 背景左侧文件
        // 变量类型为字符串,如(官方默认提供)
        // "UI\Widgets\ButtonLeft.blp"  左按钮
        string BackdropLeftFile
        // FDF(框架定义) 背景镜像
        string BackdropMirrored
        // FDF(框架定义) 背景右侧文件
        // 变量类型为字符串,如(官方默认提供)
        // "UI\Widgets\HeavyBorderRight.blp"  加粗右边框
        string BackdropRightFile
        // FDF(框架定义) 背景平铺
        string BackdropTileBackground
        // FDF(框架定义) 背景顶部文件
        // 变量类型为字符串,如(官方默认提供)
        // "UI\Widgets\ButtonTop.blp"  顶部按钮
        string BackdropTopFile
        // FDF(框架定义) 背景艺术
        // 变量类型为字符串,如(官方默认提供)
        // "UI\Glues\BattleNet\BattlenetLoginGlue\BattlenetLoginGlue.mdl"  战网登录
        // "UI\Glues\BattleNet\BattleNetTeamLevelBar\BattleNetTeamLevelBar.mdl"  战网战队等级栏
        string BackgroundArt
        // FDF(框架定义) 栏纹理
        // 变量类型为字符串,如(官方默认提供)
        // "SimpleBuildTimeIndicator"  简易建造时间指示器
        string BarTexture
        // FDF(框架定义) 按钮文本偏移(按下时)
        // 支持变量实数和带f的实数(f意义不明)
        // -0.0015f -0.0015f
        // 0.001 -0.001
        string ButtonPushedTextOffset
        // FDF(框架定义) 按钮文本
        // 变量类型为字符串,如(官方默认提供)
        // "AddFriendButtonText"  添加好友按钮文本
        // "AdvancedOptionsButtonText"  高级设置按钮文本
        string ButtonText
        // FDF(框架定义) 聊天框边框尺寸
        // 变量类型为实数,如 0.01
        string ChatDisplayBorderSize
        // FDF(框架定义) 聊天框输入框
        // 变量类型为字符串,如 "BattleNetChatDisplayEditBoxTemplate"  战网聊天框输入框模板
        string ChatDisplayEditBox
        // FDF(框架定义) 聊天框高亮
        // 变量类型为实数,如 0.01
        string ChatDisplayLineHeight
        // FDF(框架定义) 聊天框滚动条
        // 变量类型为字符串,如 "BattleNetChatDisplayScrollBarTemplate"  战网聊天框滚动条模板
        string ChatDisplayScrollBar
        // FDF(框架定义) 复选框选中高亮
        // 变量类型为字符串,如(官方默认提供)
        // "BattleNetRadioButtonHighlightTemplate"  战网单选按钮高亮模板
        // "EscMenuRadioButtonHighlightTemplate"  菜单单选按钮高亮模板
        string CheckBoxCheckHighlight
        // FDF(框架定义)禁用复选框选中高亮
        // 变量类型为字符串,如(官方默认提供)
        // "BattleNetDisabledRadioButtonHighlightTemplate"  禁用战网单选按钮选中高亮模板
        // "EscMenuDisabledCheckHighlightTemplate"  禁用菜单单选按钮选中高亮模板
        string CheckBoxDisabledCheckHighlight
        // FDF(框架定义) 选中纹理
        // 变量类型为字符串,如(官方默认提供) "ReplayCheckBoxCheck"  录像复选框选中
        string CheckedTexture
        // FDF(框架定义) 控制背景
        // 变量类型为字符串,如(官方默认提供)
        // "ActionMenuBackdrop"  活动菜单背景
        // "AdvancedPopupMenuBackdrop"  高级弹出菜单背景
        string ControlBackdrop
        // FDF(框架定义) 禁用控制背景
        // 变量类型为字符串,如(官方默认提供)
        // "BattleNetCheckBoxDisabledBackdrop"  禁用战网复选框背景
        // "BattleNetPopupMenuDisabledBackdropTemplate"  禁用战网弹出菜单背景
        string ControlDisabledBackdrop
        // FDF(框架定义) 禁用控制背景(按下时)
        string ControlDisabledPushedBackdrop
        // FDF(框架定义) 控制焦点高亮
        // 变量类型为字符串,如(官方默认提供)
        // "CampaignCameraButtonFocusHighlightTemplate"  战役镜头按钮焦点高亮模板
        // "IconicButtonFocusHighlightTemplate"  图标按钮焦点高亮模板
        string ControlFocusHighlight
        // FDF(框架定义) 控制鼠标悬停高亮
        // 变量类型为字符串,如(官方默认提供)
        // "BorderedButtonMouseOverHighlightTemplate"  背景按钮鼠标悬停高亮模板
        // "ButtonMouseOverHighlightTemplate"  按钮鼠标悬停高亮模板
        string ControlMouseOverHighlight
        // FDF(框架定义) 控制背景(按下时)
        // 变量类型为字符串,如(官方默认提供)
        // "BattleNetRadioButtonPushedBackdrop"  战网单选按钮背景(按下时)
        // "BorderedButtonPushedBackdropTemplate"  背景按钮背景模板(按下时)
        string ControlPushedBackdrop
        // FDF(框架定义) 控制快捷键
        // 变量类型为字符串,如(官方默认提供)
        // "BNET_LADDER_SHORTCUT"
        // "BNET_PASSWORD_RECOVERY_SHORTCUT"
        string ControlShortcutKey
        // FDF(框架定义) 控制尺寸
        // 变量类型为字符串,如(官方默认提供)
        // "AUTOTRACK|HIGHLIGHTONFOCUS|HIGHLIGHTONMOUSEOVER"  自动跟踪|焦点高亮|鼠标悬停高亮
        // "AUTOTRACK|HIGHLIGHTONMOUSEOVER"  自动跟踪|鼠标悬停高亮
        // "AUTOTRACK"  自动跟踪
        string ControlStyle
        // FDF(框架定义) 装饰文件名称
        string DecorateFileNames
        // FDF(框架定义) 对话框背景
        // 变量类型为字符串,如(官方默认提供)
        // "BattleNetDialogBackdropTemplate"  战网对话框背景模板
        // "CustomFilterDialogBackdrop"  自定义对话框背景
        string DialogBackdrop
        // FDF(框架定义) 禁用状态提示
        // 变量类型为字符串,如(官方默认提供)
        // "UpperButtonBarButtonDisabledTextTemplate" "ALLIES"  左上方默认按纽栏按钮禁用状态提示模板-盟友
        // "UpperButtonBarButtonDisabledTextTemplate" "CHAT"  左上方默认按纽栏按钮禁用状态提示模板-聊天
        string DisabledText
        // FDF(框架定义) 禁用状态纹理
        // 变量类型为字符串,如(官方默认提供) "UpperMenuButtonDisabledBackground"  左上方默认按纽栏按钮禁用状态背景
        string DisabledTexture
        // FDF(框架定义) 输入框尺寸
        // 变量类型为实数,如 0.009
        string EditBorderSize
        // FDF(框架定义) 输入框光标颜色
        // 变量类型为红绿蓝三色实数组,如 1.0 1.0 1.0
        string EditCursorColor
        // FDF(框架定义) 输入框文本控件
        // 变量类型为字符串,如(官方默认提供) "AccountNameEditBoxText"  账户名输入框文本
        string EditTextFrame
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
        string File
        // FDF(框架定义) 字体(似乎包含字号)
        // 变量类型为字符串,如(官方默认提供)
        // "InfoPanelTextFont", 0.0085  信息面板字体
        // "InfoPanelTextFont",0.01  信息面板字体
        // "MasterFont",0.008  大师字体
        // "MasterFont",0.01  大师字体
        string Font
        // FDF(框架定义) 字体颜色
        // 变量类型为红绿蓝三色+透明度实数组,如 0.99 0.827 0.0705 1.0
        string FontColor
        // FDF(框架定义) 字体禁用状态颜色
        // 变量类型为红绿蓝三色+透明度实数组,如 0.5 0.5 0.5 1.0
        string FontDisabledColor
        // FDF(框架定义) 字体标识(限制输入字符数或文本类型)
        // 变量类型为字符串,如(官方默认提供)
        // "FIXEDSIZE"  固定长度
        // "PASSWORDFIELD"  密码类型(输入任意字符都显示成 **)
        string FontFlags
        // FDF(框架定义) 字体高亮颜色
        // 变量类型为红绿蓝三色+透明度实数组,如 1.0 1.0 1.0 1.0
        string FontHighlightColor
        // FDF(框架定义) 字体(两端)对齐
        // JUSTIFYCENTER  居中对齐
        // JUSTIFYLEFT  左对齐
        // JUSTIFYRIGHT  右对齐
        string FontJustificationH
        // FDF(框架定义) 字体两端边距
        // 变量类型为左右两端边距实数组,如
        // 0.0 -0.001
        // 0.0 -0.002
        // 0.0 0.0
        // 0.01 0.0
        // 0.01 0.001
        string FontJustificationOffset
        // FDF(框架定义) 字体(垂直)对齐
        // JUSTIFYTOP  顶部对齐
        // JUSTIFYMIDDLE  中部对齐
        // JUSTIFYBOTTOM  底部对齐
        string FontJustificationV
        // FDF(框架定义) 字体阴影颜色
        // 变量类型为红绿蓝三色+透明度实数组,如 0.0 0.0 0.0 0.9
        string FontShadowColor
        // FDF(框架定义) 字体阴影偏移
        // 变量类型为 X Y 双向偏移量实数组,如 0.001 -0.001
        string FontShadowOffset
        // FDF(框架定义) 控件
        // 变量类型为字符串,如(官方默认提供) "GLUEBUTTON" "HeroSelectorButton"  黏合按钮 英雄选择按钮
        string Frame
        // FDF(框架定义) 控件字体(似乎包含字号)
        // "EscMenuTextFont", 0.011, ""  ESC菜单文本字体
        // "InfoPanelTextFont", 0.011, "",  信息面板字体
        // "InfoPanelTextFont", 0.013, "",  信息面板字体
        // "MasterFont", 0.007, "",  大师字体
        // "MasterFont", 0.01, "",  大师字体
        // "MasterFont", 0.011, "",  大师字体
        // "MasterFont", 0.01171, "",  大师字体
        string FrameFont
        // FDF(框架定义) 高度
        // 支持变量实数和带f的实数(f意义不明),如 0.024,0.48f
        string Height
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
        string HighlightAlphaFile
        // FDF(框架定义) 高亮字母模式
        // 变量类型为字符串,如(官方默认提供)
        // "ADD"  添加
        // "BLEND"  混合
        string HighlightAlphaMode
        // FDF(框架定义) 高亮颜色
        // 变量类型为红绿蓝三色+透明度实数组,如
        // 0.0 0.0 1.0 0.1
        // 1.0 0.0 0.0 0.2
        string HighlightColor
        // FDF(框架定义) 高亮文本
        // 变量类型为字符串,如(官方默认提供)
        // "UpperButtonBarButtonHighlightTextTemplate" "KEY_ALLIES"  左上方默认按纽栏按钮高亮文本提示模板-关键词 盟友
        // "UpperButtonBarButtonHighlightTextTemplate" "KEY_CHAT"  左上方默认按纽栏按钮高亮文本提示模板-关键词 聊天
        string HighlightText
        // FDF(框架定义) 高亮类型
        // 变量类型为字符串,如(官方默认提供)
        // "FILETEXTURE"  文件纹理
        // "SHADE"  遮罩
        string HighlightType
        // FDF(框架定义) 包含文件
        // 变量类型为字符串,如(官方默认提供) "UI\FrameDef\UI\InfoPanelTemplates.fdf"  信息面板模板文件
        string IncludeFile
        // FDF(框架定义) 层级(图层)
        string Layer
        // FDF(框架定义) 层级样式(图层样式)
        // 变量类型为字符串,如(官方默认提供)
        // "NOSHADING"  无遮蔽
        // "IGNORETRACKEVENTS"  忽略可追溯事件
        // "NOSHADING|IGNORETRACKEVENTS"  无遮蔽|忽略可追溯事件
        string LayerStyle
        // FDF(框架定义) 列表边框
        // 变量类型为实数,如 0.01
        string ListBoxBorder
        // FDF(框架定义) 列表滚动条边框
        // 变量类型为字符串,如(官方默认提供) "StandardListBoxScrollBarTemplate"  标准列表滚动条模板
        string ListBoxScrollBar
        // FDF(框架定义) 菜单边框
        // 变量类型为实数,如 0.009
        string MenuBorder
        // FDF(框架定义) 菜单项目
        // 变量类型为字符串,如(官方默认提供)
        // "NORMAL", -2  普通(-2)
        // "WINDOW_MODE_WINDOWED", -2  跟随系统(-2)
        string MenuItem
        // FDF(框架定义) 菜单项目高度
        // 变量类型为实数,如 0.0082, 0.011
        string MenuItemHeight
        // FDF(框架定义) 菜单文本高亮颜色
        // 变量类型为红绿蓝三色+透明度实数组,如 0.99 0.827 0.0705 1.0
        string MenuTextHighlightColor
        // FDF(框架定义) 普通文本
        // 变量类型为字符串,如(官方默认提供)
        // "UpperButtonBarButtonTextTemplate" "KEY_ALLIES"  左上方默认按纽栏按钮文本模板-关键词 盟友
        // "UpperButtonBarButtonTextTemplate" "KEY_MENU"  左上方默认按纽栏按钮文本模板-关键词 菜单
        string NormalText
        // FDF(框架定义) 普通纹理
        // 变量类型为字符串,如(官方默认提供) "ReplayCheckBoxNormal"  普通录像复选框
        string NormalTexture
        // FDF(框架定义) 弹出指示符
        // 变量类型为字符串,如(官方默认提供)
        // "CampaignPopupMenuArrow"  战役弹出菜单指示符
        // "CustomPopupMenuArrow"  自定义弹出菜单指示符
        string PopupArrowFrame
        // FDF(框架定义) 弹出按钮插入
        // 变量类型为实数,如 0.01, 0.015
        string PopupButtonInset
        // FDF(框架定义) 弹出按钮
        // "TeamMemberRaceMenuMenu3"  队伍成员种族菜单
        // "TextureQualityPopupMenuMenu"  纹理材质弹出菜单
        string PopupMenuFrame
        // FDF(框架定义) 弹出(菜单)标题
        // 变量类型为字符串,如(官方默认提供)
        // "EscOptionsLightsPopupMenuTitle"  ESC设置弹出菜单常亮标题
        // "PopupMenuTitle"  弹出菜单标题
        // "ReplayVisionMenuTitle"  录像查看菜单标题
        // "TeamMemberPopupMenuTitle"  队伍成员弹出菜单标题
        string PopupTitleFrame
        // FDF(框架定义) 纹理(按下时)
        // 变量类型为字符串,如(官方默认提供) "UpperMenuButtonPushedBackground"  顶部菜单按钮背景(按下时)
        string PushedTexture
        // FDF(框架定义) 滚动条下滚动按钮
        // 变量类型为字符串,如(官方默认提供) "EscMenuScrollBarDecButton"  滚动条下滚动按钮
        string ScrollBarDecButtonFrame
        // FDF(框架定义) 滚动条上滚动按钮
        // 变量类型为字符串,如(官方默认提供) "EscMenuScrollBarIncButton"  滚动条上滚动按钮
        string ScrollBarIncButtonFrame
        // FDF(框架定义) 设置所有锚点
        string SetAllPoints
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
        string SetPoint
        // FDF(框架定义) 滑块初始值
        // 变量类型为实数,如 0, 1
        string SliderInitialValue
        // FDF(框架定义) 轮播图水平布局
        string SliderLayoutHorizontal
        // FDF(框架定义) 轮播图垂直布局
        string SliderLayoutVertical
        // FDF(框架定义) 滑块最大值
        // 变量类型为实数,如 2, 4
        string SliderMaxValue
        // FDF(框架定义) 滑块最小值
        // 变量类型为实数,如 0
        string SliderMinValue
        // FDF(框架定义) 滑块滑动距离(格数)
        // 变量类型为实数,如 1
        string SliderStepSize
        // FDF(框架定义) 滑块拇指按钮
        // 变量类型为字符串,如(官方默认提供)
        // "BattleNetThumbButton"  战网滑块拇指按钮
        // "EscMenuScrollThumbButton"  ESC菜单滑块拇指按钮
        // "StandardThumbButton"  标准滑块拇指按钮
        string SliderThumbButtonFrame
        // FDF(框架定义) 字串符
        // 变量类型为字符串,如(官方默认提供) "UpperButtonBarButtonTextTemplate"  弹出按钮栏按钮文本模板
        string String
        // FDF(框架定义) 字串符列表
        string StringList
        // FDF(框架定义) 选项卡焦点(默认值)
        string TabFocusDefault
        // FDF(框架定义) 选项卡焦点-下一个
        // 变量类型为字符串,如(官方默认提供)
        // "AddProfileButton"  添加配置文件按钮
        // "BackButton"  返回按钮
        string TabFocusNext
        // FDF(框架定义) 选项卡焦点-推送
        string TabFocusPush
        // FDF(框架定义) 贴图坐标
        // 官方默认坐标如
        // 0, 0.33984375, 0, 0.125
        // 0, 1, 0.4140625, 1
        // 0.0, 0.6640625, 0.25, 0.421875
        // 0.0, 0.6640625, 0.75, 0.921875
        string TexCoord
        // FDF(框架定义) 文本
        // 变量类型为字串符,如 "30"
        string Text
        // FDF(框架定义) 文本区域插入
        // 变量类型为实数,如 0.005, 0.0
        string TextAreaInset
        // FDF(框架定义) 文本区域行间距
        // 变量类型为实数,如 0.001, 0.0015
        string TextAreaLineGap
        // FDF(框架定义) 文本区域行高度
        // 变量类型为实数,如 0.011, 0.015
        string TextAreaLineHeight
        // FDF(框架定义) 文本区域最大行数
        // 变量类型为整数,如 128, 32
        string TextAreaMaxLines
        // FDF(框架定义) 文本区域滚动条
        // 变量类型为字串符,如(官方默认提供) "ChatScrollBar"  聊天滚动条
        string TextAreaScrollBar
        // FDF(框架定义)文本长度
        // 变量类型为整数,如 8
        string TextLength
        // FDF(框架定义) 纹理
        // 继承于父类 "ResourceIconTemplate"  资源图标模板
        // 变量类型为字串符,如(官方默认提供) "InfoPanelIconAllyFoodIcon"  信息面板图标-盟友人口图标
        string Texture
        // FDF(框架定义) 使用活动上下文
        string UseActiveContext
        // FDF(框架定义) 高亮显示
        // 变量类型为字串符,如(官方默认提供) "UpperMenuButtonHighlight"  弹出菜单按钮高亮显示
        string UseHighlight
        // FDF(框架定义) 宽度
        // 支持变量实数和带f的实数(f意义不明),如 0.24, 0.417f
        string Width


// 电影滤镜纹理


        // 电影滤镜纹理 白色迷雾
        // 是blp文件，需文件名带后缀
        string White_mask.blp
        // 电影滤镜纹理 黑色迷雾
        // 是blp文件，需文件名带后缀
        string Black_mask.blp
        // 电影滤镜纹理 薄雾滤镜
        // 是blp文件，需文件名带后缀
        string HazeFilter_mask.blp
        // 电影滤镜纹理 地面迷雾
        // 是blp文件，需文件名带后缀
        string GroundFog_mask.blp
        // 电影滤镜纹理 薄雾和迷雾
        // 是blp文件，需文件名带后缀
        string HazeAndFogFilter_Mask.blp
        // 电影滤镜纹理 对角线消减
        // 是blp文件，需文件名带后缀
        string DiagonalSlash_mask.blp
        // 电影滤镜纹理 梦境(边框模糊)
        // 是blp文件，需文件名带后缀
        string DreamFilter_Mask.blp
        // 电影滤镜纹理 冰
        // 是blp文件，需文件名带后缀
        string IceFilter_Mask.blp
        // 电影滤镜纹理 范围
        // 是blp文件，需文件名带后缀
        string Scope_Mask.blp
        // 电影滤镜纹理 兵!(字图)
        // 是blp文件，需文件名带后缀
        string SpecialPowMask.blp
        // 电影滤镜纹理 溅泼声!(字图)
        // 是blp文件，需文件名带后缀
        string SpecialSplatMask.blp
        // 电影滤镜纹理 幼年熊猫!(字图)
        // 是blp文件，需文件名带后缀
        string Panda-n-Cub.blp


// 天气特效类型


        // 天气特效类型 白杨谷大雨
        string RAhr
        // 天气特效类型 白杨谷小雨
        string RAlr
        // 天气特效类型 达拉然之盾
        string MEds
        // 天气特效类型 地下城/地牢 蓝雾(厚)
        string FDbh
        // 天气特效类型 地下城/地牢 蓝雾(薄)
        string FDbl
        // 天气特效类型 地下城/地牢 绿雾(厚)
        string FDgh
        // 天气特效类型 地下城/地牢 绿雾(薄)
        string FDgl
        // 天气特效类型 地下城/地牢 红雾(厚)
        string FDrh
        // 天气特效类型 地下城/地牢 红雾(薄)
        string FDrl
        // 天气特效类型 地下城/地牢 白雾(厚)
        string FDwh
        // 天气特效类型 地下城/地牢 白雾(薄)
        string FDwl
        // 天气特效类型 洛丹伦大雨
        string RLhr
        // 天气特效类型 洛丹伦小雨
        string RLlr
        // 天气特效类型 诺森德的暴风雪
        string SNbs
        // 天气特效类型 诺森德大雪
        string SNhs
        // 天气特效类型 诺森德小雪
        string SNls
        // 天气特效类型 边缘之地大风
        string WOcw
        // 天气特效类型 边缘之地的风
        string WOlw
        // 天气特效类型 日光
        string LRaa
        // 天气特效类型 月光
        string LRma
        // 天气特效类型 大风
        string WNcw


// 闪电类型


        // 闪电类型 闪电链 - 主
        string CLPB
        // 闪电类型 闪电链 - 次
        string CLSB
        // 闪电类型 汲取
        string DRAB
        // 闪电类型 生命汲取
        string DRAL
        // 闪电类型 魔法汲取
        string DRAM
        // 闪电类型 死亡之指
        string AFOD
        // 闪电类型 叉状闪电
        string FORK
        // 闪电类型 医疗波 - 主
        string HWPB
        // 闪电类型 医疗波 - 次
        string HWSB
        // 闪电类型 闪电攻击
        string CHIM
        // 闪电类型 魔法镣铐
        string LEAS
        // 闪电类型 法力燃烧
        string MBUR
        // 闪电类型 魔力之焰
        string MFPB
        // 闪电类型 灵魂锁链
        string SPLK


// 地形设置


        // 地形设置 洛丹伦(夏)
        string LORDAERON_SUMMER
        // 地形设置 洛丹伦(秋)
        string LORDAERON_FALL
        // 地形设置 洛丹伦(冬)
        string LORDAERON_WINTER
        // 地形设置 贫瘠之地
        string BARRENS
        // 地形设置 白杨谷
        string ASHENVALE
        // 地形设置 费尔伍德
        string FELWOOD
        // 地形设置 诺森德
        string NORTHREND
        // 地形设置 城邦
        string CITYSCAPE
        // 地形设置 村庄
        string VILLAGE
        // 地形设置 村庄(秋)
        string VILLAGEFALL
        // 地形设置 地下城/地牢
        string DUNGEON
        // 地形设置 地底
        string DUNGEON2
        // 地形设置 达拉然
        string DALARAN
        // 地形设置 达拉然遗迹
        string DALARANRUINS
        // 地形设置 沉沦的遗迹
        string RUINS
        // 地形设置 冰封王座
        string ICECROWN
        // 地形设置 边缘之地
        string OUTLAND
        // 地形设置 黑色城堡
        string BLACKCITADEL
        // 地形设置 所有
        string ALL


// 地表纹理


        // 地表纹理 洛丹伦(夏) - 泥地
        string Ldrt
        // 地表纹理 洛丹伦(夏) - 烂泥地
        string Ldro
        // 地表纹理 洛丹伦(夏) - 泥草地
        string Ldrg
        // 地表纹理 洛丹伦(夏) - 岩石
        string Lrok
        // 地表纹理 洛丹伦(夏) - 草地
        string Lgrs
        // 地表纹理 洛丹伦(夏) - 黑暗草地
        string Lgrd
        // 地表纹理 洛丹伦(秋) - 泥地
        string Fdrt
        // 地表纹理 洛丹伦(秋) - 烂泥地
        string Fdro
        // 地表纹理 洛丹伦(秋) - 泥草地
        string Fdrg
        // 地表纹理 洛丹伦(秋) - 岩石
        string Frok
        // 地表纹理 洛丹伦(秋) - 草地
        string Fgrs
        // 地表纹理 洛丹伦(秋) - 黑暗草地
        string Fgrd
        // 地表纹理 洛丹伦(冬) - 泥地
        string Wdrt
        // 地表纹理 洛丹伦(冬) - 烂泥地
        string Wdro
        // 地表纹理 洛丹伦(冬) - 雪草地
        string Wsng
        // 地表纹理 洛丹伦(冬) - 岩石
        string Wrok
        // 地表纹理 洛丹伦(冬) - 草地
        string Wgrs
        // 地表纹理 洛丹伦(冬) - 雪地
        string Wsnw
        // 地表纹理 贫瘠之地 - 泥地
        string Bdrt
        // 地表纹理 贫瘠之地 - 烂泥地
        string Bdrh
        // 地表纹理 贫瘠之地 - 鹅卵石
        string Bdrr
        // 地表纹理 贫瘠之地 - 泥草地
        string Bdrg
        // 地表纹理 贫瘠之地 - 沙漠
        string Bdsr
        // 地表纹理 贫瘠之地 - 黑暗沙漠
        string Bdsd
        // 地表纹理 贫瘠之地 - 岩石
        string Bflr
        // 地表纹理 贫瘠之地 - 草地
        string Bgrr
        // 地表纹理 白杨谷 - 泥地
        string Adrt
        // 地表纹理 白杨谷 - 烂泥地
        string Adrd
        // 地表纹理 白杨谷 - 草地
        string Agrs
        // 地表纹理 白杨谷 - 岩石
        string Arck
        // 地表纹理 白杨谷 - 长草
        string Agrd
        // 地表纹理 白杨谷 - 藤蔓
        string Avin
        // 地表纹理 白杨谷 - 泥草地
        string Adrg
        // 地表纹理 白杨谷 - 树叶
        string Alvd
        // 地表纹理 费尔伍德 - 泥地
        string Cdrt
        // 地表纹理 费尔伍德 - 烂泥地
        string Cdrd
        // 地表纹理 费尔伍德 - 毒沼
        string Cpos
        // 地表纹理 费尔伍德 - 岩石
        string Crck
        // 地表纹理 费尔伍德 - 藤蔓
        string Cvin
        // 地表纹理 费尔伍德 - 草地
        string Cgrs
        // 地表纹理 费尔伍德 - 树叶
        string Clvg
        // 地表纹理 诺森德 - 泥地
        string Ndrt
        // 地表纹理 诺森德 - 暗黑泥地
        string Ndrd
        // 地表纹理 诺森德 - 岩石
        string Nrck
        // 地表纹理 诺森德 - 草地
        string Ngrs
        // 地表纹理 诺森德 - 冰
        string Nice
        // 地表纹理 诺森德 - 雪地
        string Nsnw
        // 地表纹理 诺森德 - 雪岩地
        string Nsnr
        // 地表纹理 城邦 - 泥地
        string Ydrt
        // 地表纹理 城邦 - 烂泥地
        string Ydtr
        // 地表纹理 城邦 - 黑大理石
        string Yblm
        // 地表纹理 城邦 - 砖
        string Ybtl
        // 地表纹理 城邦 - 方形地砖
        string Ysqd
        // 地表纹理 城邦 - 圆形地砖
        string Yrtl
        // 地表纹理 城邦 - 草地
        string Ygsb
        // 地表纹理 城邦 - 修剪的草地
        string Yhdg
        // 地表纹理 城邦 - 白大理石
        string Ywmb
        // 地表纹理 村庄 - 泥地
        string Vdrt
        // 地表纹理 村庄 - 烂泥地
        string Vdrr
        // 地表纹理 村庄 - 庄稼
        string Vcrp
        // 地表纹理 村庄 - 卵石路
        string Vcbp
        // 地表纹理 村庄 - 碎石路
        string Vstp
        // 地表纹理 村庄 - 矮草
        string Vgrs
        // 地表纹理 村庄 - 岩石
        string Vrck
        // 地表纹理 村庄 - 长草
        string Vgrt
        // 地表纹理 村庄(秋) - 泥地
        string Qdrt
        // 地表纹理 村庄(秋) - 烂泥地
        string Qdrr
        // 地表纹理 村庄(秋) - 庄稼
        string Qcrp
        // 地表纹理 村庄(秋) - 卵石路
        string Qcbp
        // 地表纹理 村庄(秋) - 碎石路
        string Qstp
        // 地表纹理 村庄(秋) - 矮草
        string Qgrs
        // 地表纹理 村庄(秋) - 岩石
        string Qrck
        // 地表纹理 村庄(秋) - 长草
        string Qgrt
        // 地表纹理 达拉然 - 泥地
        string Xdrt
        // 地表纹理 达拉然 - 烂泥地
        string Xdtr
        // 地表纹理 达拉然 - 黑大理石
        string Xblm
        // 地表纹理 达拉然 - 砖块
        string Xbtl
        // 地表纹理 达拉然 - 方形地砖
        string Xsqd
        // 地表纹理 达拉然 - 圆形地砖
        string Xrtl
        // 地表纹理 达拉然 - 草地
        string Xgsb
        // 地表纹理 达拉然 - 修剪的草地
        string Xhdg
        // 地表纹理 达拉然 - 白大理石
        string Xwmb
        // 地表纹理 地下城/地牢 - 泥地
        string Ddrt
        // 地表纹理 地下城/地牢 - 砖
        string Dbrk
        // 地表纹理 地下城/地牢 - 红色石头
        string Drds
        // 地表纹理 地下城/地牢 - 熔岩裂缝
        string Dlvc
        // 地表纹理 地下城/地牢 - 熔岩
        string Dlav
        // 地表纹理 地下城/地牢 - 黑暗岩石
        string Ddkr
        // 地表纹理 地下城/地牢 - 灰色石头
        string Dgrs
        // 地表纹理 地下城/地牢 - 方形地砖
        string Dsqd
        // 地表纹理 地底 - 泥地
        string Gdrt
        // 地表纹理 地底 - 砖
        string Gbrk
        // 地表纹理 地底 - 红色石头
        string Grds
        // 地表纹理 地底 - 熔岩裂缝
        string Glvc
        // 地表纹理 地底 - 熔岩
        string Glav
        // 地表纹理 地底 - 黑暗岩石
        string Gdkr
        // 地表纹理 地底 - 灰色石头
        string Ggrs
        // 地表纹理 地底 - 方形地砖
        string Gsqd
        // 地表纹理 沉沦的遗迹 - 泥地
        string Zdrt
        // 地表纹理 沉沦的遗迹 - 烂泥地
        string Zdtr
        // 地表纹理 沉沦的遗迹 - 泥草地
        string Zdrg
        // 地表纹理 沉沦的遗迹 - 碎砖
        string Zbks
        // 地表纹理 沉沦的遗迹 - 沙地
        string Zsan
        // 地表纹理 沉沦的遗迹 - 大砖块
        string Zbkl
        // 地表纹理 沉沦的遗迹 - 圆形地砖
        string Ztil
        // 地表纹理 沉沦的遗迹 - 草地
        string Zgrs
        // 地表纹理 沉沦的遗迹 - 黑暗草地
        string Zvin
        // 地表纹理 冰封王座 - 泥地
        string Idrt
        // 地表纹理 冰封王座 - 烂泥地
        string Idtr
        // 地表纹理 冰封王座 - 黑暗冰
        string Idki
        // 地表纹理 冰封王座 - 黑砖块
        string Ibkb
        // 地表纹理 冰封王座 - 刻字砖块
        string Irbk
        // 地表纹理 冰封王座 - 砖铺
        string Itbk
        // 地表纹理 冰封王座 - 冰
        string Iice
        // 地表纹理 冰封王座 - 黑方块
        string Ibsq
        // 地表纹理 冰封王座 - 雪地
        string Isnw
        // 地表纹理 边缘之地 - 泥地
        string Odrt
        // 地表纹理 边缘之地 - 轻泥地
        string Odtr
        // 地表纹理 边缘之地 - 烂泥地
        string Osmb
        // 地表纹理 边缘之地 - 干裂土地
        string Ofst
        // 地表纹理 边缘之地 - 平石头
        string Olgb
        // 地表纹理 边缘之地 - 岩石
        string Orok
        // 地表纹理 边缘之地 - 轻石头
        string Ofsl
        // 地表纹理 边缘之地 - 深谷
        string Oaby
        // 地表纹理 黑色城堡 - 泥地
        string Kdrt
        // 地表纹理 黑色城堡 - 轻泥地
        string Kfsl
        // 地表纹理 黑色城堡 - 烂泥地
        string Kdtr
        // 地表纹理 黑色城堡 - 平石头
        string Kfst
        // 地表纹理 黑色城堡 - 碎砖
        string Ksmb
        // 地表纹理 黑色城堡 - 大砖块
        string Klgb
        // 地表纹理 黑色城堡 - 方形地砖
        string Ksqt
        // 地表纹理 黑色城堡 - 黑砖块
        string Kdkt
        // 地表纹理 达拉然遗迹 - 泥地
        string Jdrt
        // 地表纹理 达拉然遗迹 - 烂泥地
        string Jdtr
        // 地表纹理 达拉然遗迹 - 黑大理石
        string Jblm
        // 地表纹理 达拉然遗迹 - 砖块
        string Jbtl
        // 地表纹理 达拉然遗迹 - 方形地砖
        string Jsqd
        // 地表纹理 达拉然遗迹 - 圆形地砖
        string Jrtl
        // 地表纹理 达拉然遗迹 - 草地
        string Jgsb
        // 地表纹理 达拉然遗迹 - 修剪的草地
        string Jhdg
        // 地表纹理 达拉然遗迹 - 白大理石
        string Jwmb
        // 地表纹理 白杨谷 - 泥土悬崖
        string cAc2
        // 地表纹理 白杨谷 - 草地悬崖
        string cAc1
        // 地表纹理 贫瘠之地 - 沙地悬崖
        string cBc2
        // 地表纹理 贫瘠之地 - 草地悬崖
        string cBc1
        // 地表纹理 黑色城堡 - 泥土悬崖
        string cKc1
        // 地表纹理 黑色城堡 - 砖砌墙壁
        string cKc2
        // 地表纹理 城邦 - 泥土悬崖
        string cYc2
        // 地表纹理 城邦 - 方砖墙壁
        string cYc1
        // 地表纹理 达拉然 - 泥土悬崖
        string cXc2
        // 地表纹理 达拉然 - 方砖墙壁
        string cXc1
        // 地表纹理 达拉然遗迹 - 泥土悬崖
        string cJc2
        // 地表纹理 达拉然遗迹 - 方砖墙壁
        string cJc1
        // 地表纹理 地下城 - 天然墙壁
        string cDc2
        // 地表纹理 地下城 - 石砖墙壁
        string cDc1
        // 地表纹理 费尔伍德 - 泥土悬崖
        string cCc2
        // 地表纹理 费尔伍德 - 草地悬崖
        string cCc1
        // 地表纹理 冰封王座 - 石砌墙壁
        string cIc2
        // 地表纹理 冰封王座 - 雪地悬崖
        string cIc1
        // 地表纹理 洛丹伦(秋) - 泥土悬崖
        string cFc2
        // 地表纹理 洛丹伦(秋) - 草地悬崖
        string cFc1
        // 地表纹理 洛丹伦(夏) - 泥土悬崖
        string cLc2
        // 地表纹理 洛丹伦(夏) - 草地悬崖
        string cLc1
        // 地表纹理 洛丹伦(冬) - 草地悬崖
        string cWc2
        // 地表纹理 洛丹伦(冬) - 雪地悬崖
        string cWc1
        // 地表纹理 诺森德- 泥土悬崖
        string cNc2
        // 地表纹理 诺森德- 雪地悬崖
        string cNc1
        // 地表纹理 边缘之地- 深渊
        string cOc1
        // 地表纹理 边缘之地- 泥土悬崖
        string cOc2
        // 地表纹理 沉沦的遗迹 - 泥土悬崖
        string cZc2
        // 地表纹理 沉沦的遗迹 - 石砌墙壁
        string cZc1
        // 地表纹理 地底 - 天然墙壁
        string cGc2
        // 地表纹理 地底 - 砖砌墙壁
        string cGc1
        // 地表纹理 村庄 - 泥土悬崖
        string cVc2
        // 地表纹理 村庄 - 厚草地悬崖
        string cVc1
        // 地表纹理 村庄(秋) - 泥土悬崖
        string cQc2
        // 地表纹理 村庄(秋) - 厚草地悬崖
        string cQc1


// 地形形状/刷子类型


        // 地形形状/刷子类型 圆形
        string CIRCLE
        // 地形形状/刷子类型 方形
        string SQUARE


// 图像类型


        // 图像类型 阴影
        string SHADOW
        // 图像类型 选择
        string SELECTION
        // 图像类型 指示器
        string INDICATOR
        // 图像类型 闭塞标志
        string OCCLUSIONMARK
        // 图像类型 地面纹理变化
        string UBERSPLAT
        // 图像类型 最顶端
        string LAST


// 地表纹理变化


        // 地表纹理变化 测试
        string TEST
        // 地表纹理变化 洛丹伦(夏)泥地小
        string LSDS
        // 地表纹理变化 洛丹伦(夏)泥地中
        string LSDM
        // 地表纹理变化 洛丹伦(夏)泥地大
        string LSDL
        // 地表纹理变化 人类弹坑
        string HCRT
        // 地表纹理变化 不死族金矿
        string UDSU
        // 地表纹理变化 中立城市小建筑(死亡)
        string DNCS
        // 地表纹理变化 群体传送
        string HMTP
        // 地表纹理变化 回城卷轴
        string SCTP
        // 地表纹理变化 召唤护身符
        string AMRC
        // 地表纹理变化 黑暗转换
        string DRKC
        // 地表纹理变化 兽族小建筑(死亡)
        string DOSB
        // 地表纹理变化 兽族中建筑(死亡)
        string DOMB
        // 地表纹理变化 兽族大建筑(死亡)
        string DOLB
        // 地表纹理变化 人类小建筑(死亡)
        string DHSB
        // 地表纹理变化 人类中建筑(死亡)
        string DHMB
        // 地表纹理变化 人类大建筑(死亡)
        string DHLB
        // 地表纹理变化 不死族小建筑(死亡)
        string DUSB
        // 地表纹理变化 不死族中建筑(死亡)
        string DUMB
        // 地表纹理变化 不死族大建筑(死亡)
        string DULB
        // 地表纹理变化 暗夜精灵小古树(死亡)
        string DNSB
        // 地表纹理变化 暗夜精灵中古树(死亡)
        string DNMB
        // 地表纹理变化 暗夜精灵小古迹(死亡)
        string DNSA
        // 地表纹理变化 暗夜精灵中古迹(死亡)
        string DNMA
        // 地表纹理变化 人类小建筑
        string HSMA
        // 地表纹理变化 人类中建筑
        string HMED
        // 地表纹理变化 人类大建筑
        string HLAR
        // 地表纹理变化 兽族小建筑
        string OSMA
        // 地表纹理变化 兽族中建筑
        string OMED
        // 地表纹理变化 兽族大建筑
        string OLAR
        // 地表纹理变化 不死族建筑
        string USMA
        // 地表纹理变化 不死族建筑
        string UMED
        // 地表纹理变化 不死族建筑
        string ULAR
        // 地表纹理变化 暗夜精灵小古树
        string ESMA
        // 地表纹理变化 暗夜精灵中古树
        string EMDA
        // 地表纹理变化 暗夜精灵小建筑
        string ESMB
        // 地表纹理变化 暗夜精灵中建筑
        string EMDB
        // 地表纹理变化 城镇大厅
        string HTOW
        // 地表纹理变化 城堡
        string HCAS
        // 地表纹理变化 金矿
        string NGOL
        // 地表纹理变化 雷霆一击
        string THND
        // 地表纹理变化 恶魔之门
        string NDGS
        // 地表纹理变化 荆棘之盾
        string CLTS
        // 地表纹理变化 烈焰风暴1
        string HFS1
        // 地表纹理变化 烈焰风暴2
        string HFS2
        // 地表纹理变化 兽族地洞
        string USBR
        // 地表纹理变化 娜迦族大建筑
        string NLAR
        // 地表纹理变化 娜迦族中建筑
        string NMED
        // 地表纹理变化 黑暗之门(面向西南)
        string DPSW
        // 地表纹理变化 黑暗之门(面向东南)
        string DPSE
        // 地表纹理变化 火山
        string NVOL
        // 地表纹理变化 火山口
        string NVCR


// 主题音乐


        // 主题音乐 阿尔塞斯的主题曲
        string ARTHAS
        // 主题音乐 血精灵的主题曲
        string BLOODELF
        // 主题音乐 伙伴的友谊
        string COMRADESHIP
        // 主题音乐 制作人员
        string CREDITS
        // 主题音乐 黑暗代言人
        string DARKAGENTS
        // 主题音乐 黑暗胜利
        string DARKVICTORY
        // 主题音乐 毁灭
        string DOOM
        // 主题音乐 英雄胜利
        string HEROIC_VICTORY
        // 主题音乐 人族1
        string HUMAN1
        // 主题音乐 人族2
        string HUMAN2
        // 主题音乐 人族3
        string HUMAN3
        // 主题音乐 人族X1
        string HUMANX1
        // 主题音乐 人族失败
        string DEFEAT_HUMAN
        // 主题音乐 人族胜利
        string VICTORY_HUMAN
        // 主题音乐 尤迪安的主题曲
        string ILLIDAN
        // 主题音乐 巫妖王的主题曲
        string LICHKING
        // 主题音乐 主要场景
        string MAINSCREEN
        // 主题音乐 主要场景X
        string MAINSCREENX
        // 主题音乐 娜迦的主题曲
        string NAGA
        // 主题音乐 暗夜精灵族1
        string NIGHTELF1
        // 主题音乐 暗夜精灵族2
        string NIGHTELF2
        // 主题音乐 暗夜精灵族3
        string NIGHTELF3
        // 主题音乐 暗夜精灵族X1
        string NIGHTELFX1
        // 主题音乐 暗夜精灵族失败
        string DEFEAT_NIGHTELF
        // 主题音乐 暗夜精灵族胜利
        string VICTORY_NIGHTELF
        // 主题音乐 兽族1
        string ORC1
        // 主题音乐 兽族2
        string ORC2
        // 主题音乐 兽族3
        string ORC3
        // 主题音乐 兽族X1
        string ORCX1
        // 主题音乐 兽族失败
        string DEFEAT_ORC
        // 主题音乐 半兽人的主题曲
        string ORC_THEME
        // 主题音乐 兽族胜利
        string VICTORY_ORC
        // 主题音乐 追击
        string PURSUIT
        // 主题音乐 神秘哀伤
        string SADMYSTERY
        // 主题音乐 紧张
        string TENSION
        // 主题音乐 悲剧降临
        string TRAGICCONFRONTATION
        // 主题音乐 不死族1
        string UNDEAD1
        // 主题音乐 不死族2
        string UNDEAD2
        // 主题音乐 不死族3
        string UNDEAD3
        // 主题音乐 不死族 X1
        string UNDEADX1
        // 主题音乐 不死族失败
        string DEFEAT_UNDEAD
        // 主题音乐 不死族胜利
        string VICTORY_UNDEAD


// 环境音效


// 白天环境音效

        // 白天环境音效 白杨谷
        string AshenvaleDay
        // 白天环境音效 贫瘠之地
        string BarrensDay
        // 白天环境音效 黑色城堡
        // 黑色城堡有两个，分别是 WESTRING_AMBIENTTHEMEDAY_K WESTRING_AMBIENTTHEMEDAY_O
        string BlackCitadelDay
        // 白天环境音效 城邦
        string CityScapeDay
        // 白天环境音效 达拉然
        string DalaranDay
        // 白天环境音效 达拉然遗迹
        string DalaranRuinsDay
        // 白天环境音效 地下城/地牢
        string DungeonDay
        // 白天环境音效 费尔伍德
        string FelwoodDay
        // 白天环境音效 冰封王座
        string IceCrownDay
        // 白天环境音效 洛丹伦(秋)
        string LordaeronFallDay
        // 白天环境音效 洛丹伦(夏)
        string LordaeronSummerDay
        // 白天环境音效 洛丹伦(冬)
        string LordaeronWinterDay
        // 白天环境音效 诺森德
        string NorthrendDay
        // 白天环境音效 沉沦的遗迹
        string SunkenRuinsDay
        // 白天环境音效 村庄
        string VillageDay
        // 白天环境音效 村庄(秋)
        string VillageFallDay
        // 白天环境音效 地底
        string DungeonCaveDay


// 夜晚环境音效

        // 夜晚环境音效 白杨谷
        string AshenvaleNight
        // 夜晚环境音效 贫瘠之地
        string BarrensNight
        // 夜晚环境音效 黑色城堡
        // 黑色城堡有两个，分别是 WESTRING_AMBIENTTHEMENIGHT_K WESTRING_AMBIENTTHEMENIGHT_O
        string BlackCitadelNight
        // 夜晚环境音效 城邦
        string CityScapeNight
        // 夜晚环境音效 达拉然
        string DalaranNight
        // 夜晚环境音效 达拉然遗迹
        string DalaranRuinsNight
        // 夜晚环境音效 地下城/地牢
        string DungeonNight
        // 夜晚环境音效 费尔伍德
        string FelwoodNight
        // 夜晚环境音效 冰封王座
        string IceCrownNight
        // 夜晚环境音效 洛丹伦(秋)
        string LordaeronFallNight
        // 夜晚环境音效 洛丹伦(夏)
        string LordaeronSummerNight
        // 夜晚环境音效 洛丹伦(冬)
        string LordaeronWinterNight
        // 夜晚环境音效 诺森德
        string NorthrendNight
        // 夜晚环境音效 沉沦的遗迹
        string SunkenRuinsNight
        // 夜晚环境音效 村庄
        string VillageNight
        // 夜晚环境音效 村庄(秋)
        string VillageFallNight
        // 夜晚环境音效 地底
        string DungeonCaveNight


endglobals