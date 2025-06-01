# VS Code JASS 扩展

## 🚀 快速开始

1. 克隆项目
```sh
git clone https://github.com/naichabaobao/jass.git
npm install
```

2. 在 VS Code 中打开项目
3. 按 `F5` 启动调试窗口
4. 打开 `.j` 或 `.jass` 文件开始使用

## 📋 功能特点

- JASS 语法高亮
- 代码自动补全
- 智能代码片段
- 内置调试支持
- 完整的开发环境配置

## 📦 项目结构

```
.
├── src/                    # 源代码目录
│   ├── extension.ts       # 扩展的主要实现文件
│   ├── boot/             # 启动相关代码
│   ├── extern/           # 外部依赖和工具
│   └── temp/             # 临时文件目录
├── static/               # 静态资源目录
│   ├── images/          # 图片资源
│   ├── snippets.json    # 代码片段定义
│   ├── jass.tmLanguage.json  # JASS 语言语法定义
│   ├── common.j         # 标准 JASS 库
│   ├── blizzard.j       # 暴雪官方 JASS 库
│   └── *.jass           # 其他 JASS 相关文件
├── .vscode/             # VS Code 配置目录
├── out/                 # 编译输出目录
├── package.json         # 项目配置文件
├── tsconfig.json        # TypeScript 配置
└── README.md           # 项目说明文档
```

### 核心文件说明

- **src/extension.ts**: 扩展的主要实现文件，包含命令注册和功能实现
- **static/snippets.json**: 定义代码自动补全片段
- **static/jass.tmLanguage.json**: 定义 JASS 语言的语法高亮规则
- **static/common.j**: 包含 JASS 标准库函数定义
- **static/blizzard.j**: 包含暴雪官方 JASS 函数定义

## 💻 使用示例

### Zinc Hello World 示例

```jass
// Zinc Hello World 示例
library HelloWorld initializer Init {
    // 英雄结构体
    struct Hero {
        private string name;
        
        // 构造函数
        static method create takes string heroName returns thistype {
            thistype this = Hero.allocate();
            this.name = heroName;
            return this;
        }
        
        // 获取英雄名称
        method getName takes nothing returns string {
            return this.name;
        }
        
        // 析构函数
        method onDestroy takes nothing returns nothing {
            // 清理资源
        }
    }
    
    // 初始化函数
    private function Init takes nothing returns nothing {
        // 显示欢迎消息
        DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 60, "Hello from Zinc!");
        
        // 创建一个简单的结构体实例
        Hero hero = Hero.create("Arthas");
        DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 60, "Created hero: " + hero.getName());
        
        // 清理资源
        hero.destroy();
    }
}
```

### 基本语法

```cpp
#include  "c://dir/any.j" // WE触发器    自定义脚本区
```

### vJass 完整示例

#### 1. 基础结构示例

```jass
// 库声明
library MyLibrary initializer Init

    // 私有变量声明
    private constant real ATTACK_DAMAGE = 100.0
    private constant real ATTACK_SPEED = 1.5
    
    // 结构体定义
    struct Hero
        private string name
        private real hp
        private real mana
        
        // 构造函数
        static method create takes string heroName, real heroHp, real heroMana returns thistype
            local thistype this = thistype.allocate()
            set this.name = heroName
            set this.hp = heroHp
            set this.mana = heroMana
            return this
        endmethod
        
        // 方法定义
        method getName takes nothing returns string
            return this.name
        endmethod
        
        method getHp takes nothing returns real
            return this.hp
        endmethod
        
        method setHp takes real newHp returns nothing
            set this.hp = newHp
        endmethod
    endstruct

    // 初始化函数
    private function Init takes nothing returns nothing
        local Hero myHero = Hero.create("Arthas", 1000.0, 500.0)
        call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 60, "Hero created: " + myHero.getName())
    endfunction

endlibrary
```

#### 2. 触发器示例

```jass
library HeroSystem initializer Init

    // 常量定义
    private constant real DAMAGE_INTERVAL = 1.0
    private constant real DAMAGE_AMOUNT = 50.0
    
    // 结构体定义
    struct HeroSystem
        private unit hero
        private timer damageTimer
        
        // 构造函数
        static method create takes unit whichHero returns thistype
            local thistype this = thistype.allocate()
            set this.hero = whichHero
            set this.damageTimer = CreateTimer()
            return this
        endmethod
        
        // 启动伤害系统
        method startDamageSystem takes nothing returns nothing
            call TimerStart(this.damageTimer, DAMAGE_INTERVAL, true, function thistype.onDamage)
        endmethod
        
        // 停止伤害系统
        method stopDamageSystem takes nothing returns nothing
            call PauseTimer(this.damageTimer)
        endmethod
        
        // 伤害回调
        private static method onDamage takes nothing returns nothing
            local thistype this = GetTimerData(GetExpiredTimer())
            call UnitDamageTarget(this.hero, this.hero, DAMAGE_AMOUNT, true, false, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_NORMAL, null)
        endmethod
    endstruct

    // 初始化函数
    private function Init takes nothing returns nothing
        local trigger t = CreateTrigger()
        call TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_SPELL_EFFECT)
        call TriggerAddAction(t, function OnSpellCast)
    endfunction
    
    // 技能施放回调
    private function OnSpellCast takes nothing returns nothing
        local unit caster = GetTriggerUnit()
        local HeroSystem system = HeroSystem.create(caster)
        call system.startDamageSystem()
    endfunction

endlibrary
```

#### 3. 接口示例

```jass
// 接口定义
interface IHero
    method getName takes nothing returns string
    method getLevel takes nothing returns integer
    method levelUp takes nothing returns nothing
endinterface

// 实现接口的结构体
struct Paladin implements IHero
    private string name
    private integer level
    
    // 构造函数
    static method create takes string heroName returns thistype
        local thistype this = thistype.allocate()
        set this.name = heroName
        set this.level = 1
        return this
    endmethod
    
    // 实现接口方法
    method getName takes nothing returns string
        return this.name
    endmethod
    
    method getLevel takes nothing returns integer
        return this.level
    endmethod
    
    method levelUp takes nothing returns nothing
        set this.level = this.level + 1
        call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 60, this.name + " leveled up to " + I2S(this.level))
    endmethod
endstruct
```

### 使用说明

1. **库的使用**
   - 使用 `library` 关键字声明库
   - 使用 `initializer` 指定初始化函数
   - 使用 `private` 关键字声明私有成员

2. **结构体的使用**
   - 使用 `struct` 关键字定义结构体
   - 使用 `static method` 定义静态方法
   - 使用 `method` 定义实例方法
   - 使用 `allocate()` 创建实例
   - 使用 `deallocate()` 释放实例

3. **接口的使用**
   - 使用 `interface` 关键字定义接口
   - 使用 `implements` 关键字实现接口
   - 必须实现接口中定义的所有方法

4. **最佳实践**
   - 使用常量定义固定值
   - 使用私有成员保护数据
   - 使用构造函数初始化对象
   - 及时释放不再使用的对象

## 🛠️ 开发指南

### 环境要求

- Node.js
- Visual Studio Code
- TypeScript

### 调试技巧

- 在 `src/extension.ts` 中设置断点
- 在调试控制台查看输出
- 修改代码后可以重新加载窗口（`Ctrl+R` 或 `Cmd+R`）

### 测试

1. 打开调试视图（`Ctrl+Shift+D` 或 `Cmd+Shift+D`）
2. 从启动配置下拉菜单中选择 "Extension Tests"
3. 按 `F5` 运行测试
4. 在调试控制台查看测试结果

## 📚 相关资源

- [VS Code API 文档](https://code.visualstudio.com/api)
- [JASS 文档](https://www.hiveworkshop.com/threads/jass-manual.239794/)
- [贴吧讨论](https://tieba.baidu.com/p/6235060595)

## 📝 版本信息

- VS Code 版本要求: 1.63+
- common.j 版本: 1.33
- 物编数据版本: 2.02+

## 🤝 贡献指南

欢迎提交 Pull Request 或创建 Issue 来帮助改进这个项目！

## 💖 支持项目

<div align="center">
  <h3>请我喝杯奶茶 ☕</h3>
  <img src="https://user-images.githubusercontent.com/38098031/190127376-c47656c3-8b28-4ff2-a242-78bb28a3652e.png" alt="赞助二维码" width="300"/>
  
  <h3>一起出份力赞助我开发吧！❤️</h3>
  <img src="https://user-images.githubusercontent.com/38098031/189883735-7bbdb474-259a-4bc7-8a6b-09707aa013a4.png" alt="赞助说明" width="500"/>
</div>

<div align="center">
  <h3>⭐ 如果这个项目对你有帮助，请给我们一个 star！</h3>
</div>

![冰封王座巫妖王](https://github.com/naichabaobao/jass/blob/master/static/images/blizzard-nova.jpg?raw=true)
