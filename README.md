# VS Code JASS 扩展

语言版本: 简体中文 | [English](README.en.md) | [日本語](README.ja.md)

## 🚀 快速开始

1. 克隆项目
```sh
git clone https://github.com/naichabaobao/jass.git
npm install
```

2. 在 VS Code 中打开项目
3. 运行 `npm install` 安装依赖
4. 按 `F5` 启动调试窗口
5. 打开 `.j`、`.jass` 或 `.zn` 文件开始使用

### 从 VS Code Marketplace 安装

1. 打开 VS Code
2. 按 `Ctrl+Shift+X` (Windows/Linux) 或 `Cmd+Shift+X` (Mac) 打开扩展市场
3. 搜索 "JASS/vJass/Zinc Language Tools"
4. 点击安装

### 配置说明

扩展支持通过 `jass.config.json` 配置文件自定义各种选项。配置文件应放在工作区根目录。

#### 编辑器设置（settings.json）

除了 `jass.config.json`，也支持通过 VS Code 设置项调整补全行为：

```json
{
  "jass.apiVersion": "off"
}
```

`jass.apiVersion` 用于按魔兽常用版本偏好调整补全顺序（默认 `off`，即关闭，不改变现有习惯）。

- 当设置为具体版本（如 `1.20`、`1.24`、`1.27`、`1.28f`、`1.36`）时：
  - 会根据注释中的 `@since` 信息（兼容 `@version`）对“高于目标版本”的 API 进行降权排序。
- 没有版本标注的条目不处理（保持原样）。

> 目前标准库中的版本标注还在逐步完善中。  
> 希望有缘人一起帮忙补充 `common.j / blizzard.j / common.ai` 的 `@since`（兼容 `@version`）标注，欢迎 PR ❤️

#### 创建配置文件

可以通过以下方式创建配置文件：

1. **命令面板**：按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)，输入 `jass.createConfigFile`
2. **资源管理器**：右键点击工作区根目录，选择 "create jass.config.json"

#### 完整配置示例

```json
{
  "excludes": [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**"
  ],
  "includes": [
    "**/*.j",
    "**/*.jass",
    "**/*.ai",
    "**/*.zn"
  ],
  "parsing": {
    "enableTextMacro": true,
    "enablePreprocessor": true,
    "enableLuaBlocks": true,
    "strictMode": false
  },
  "standardLibraries": {
    "common.j": "./libs/common.j",
    "common.ai": "./libs/common.ai",
    "blizzard.j": "./libs/blizzard.j"
  },
  "diagnostics": {
    "enable": true,
    "severity": {
      "errors": "error",
      "warnings": "warning"
    },
    "checkTypes": true,
    "checkUndefined": true,
    "checkUnused": false,
    "checkArrayBounds": true
  }
}
```

#### 配置项说明

##### 1. `excludes` - 排除文件模式

指定要排除的文件或目录（使用 glob 模式）。优先级低于 `includes`。

```json
{
  "excludes": [
    "**/node_modules/**",    // 排除 node_modules 目录
    "**/.git/**",            // 排除 .git 目录
    "**/dist/**",            // 排除 dist 目录
    "**/build/**"            // 排除 build 目录
  ]
}
```

**默认值**：空数组（不排除任何文件）

##### 2. `includes` - 包含文件模式

指定要包含的文件或目录（使用 glob 模式）。优先级高于 `excludes`。

```json
{
  "includes": [
    "**/*.j",      // 包含所有 .j 文件
    "**/*.jass",   // 包含所有 .jass 文件
    "**/*.ai",     // 包含所有 .ai 文件
    "**/*.zn"      // 包含所有 .zn 文件
  ]
}
```

**默认值**：如果未指定，默认包含所有 JASS 文件（`.j`, `.jass`, `.ai`, `.zn`）

##### 3. `parsing` - 解析选项

控制解析器的行为。

```json
{
  "parsing": {
    "enableTextMacro": true,      // 启用文本宏（textmacro）支持
    "enablePreprocessor": true,   // 启用预处理器支持（如 //! import）
    "enableLuaBlocks": true,      // 启用 Lua 块支持（实验性，默认启用）
    "strictMode": false           // 启用严格模式（更严格的语法检查，尚未实现）
  }
}
```

**默认值**：
- `enableTextMacro`: `true` - 默认启用文本宏支持
- `enablePreprocessor`: `true` - 默认启用预处理器支持
- `enableLuaBlocks`: `true` - 默认启用 Lua 块支持（实验性功能）
- `strictMode`: `false` - 默认不启用严格模式

**注意**：`strictMode` 选项目前尚未实现，保留用于未来扩展。

##### 4. `standardLibraries` - 标准库路径

指定标准库文件的自定义路径（相对于工作区根目录或绝对路径）。

```json
{
  "standardLibraries": {
    "common.j": "./libs/common.j",      // common.j 路径
    "common.ai": "./libs/common.ai",    // common.ai 路径
    "blizzard.j": "./libs/blizzard.j"   // blizzard.j 路径
  }
}
```

**查找顺序**：
1. 配置中指定的路径
2. 工作区根目录
3. 扩展的 `static` 目录

**默认值**：空对象（使用默认查找顺序）

##### 5. `diagnostics` - 诊断选项

控制错误和警告的检查行为。

```json
{
  "diagnostics": {
    "enable": true,              // 是否启用诊断
    "severity": {
      "errors": "error",         // 错误的严重程度：error | warning | information | hint
      "warnings": "warning"      // 警告的严重程度：error | warning | information | hint
    },
    "checkTypes": true,          // 检查类型兼容性（默认启用）
    "checkUndefined": true,      // 检查未定义的变量和函数（默认启用）
    "checkUnused": false,        // 检查未使用的变量（默认关闭）
    "checkArrayBounds": true,    // 检查数组越界（默认启用）
    "checkHandleLeaks": true     // 检查句柄泄漏（timer/group/force/location，默认启用）
  }
}
```

**默认值**：
- `enable`: `true`
- `severity.errors`: `"error"`
- `severity.warnings`: `"warning"`
- `checkTypes`: `true`
- `checkUndefined`: `true`
- `checkUnused`: `false`
- `checkArrayBounds`: `true`
- `checkHandleLeaks`: `true`

#### 配置文件自动重载

修改 `jass.config.json` 并保存后，扩展会自动重新加载配置，无需重启 VS Code。

#### 配置状态说明

**当前支持情况**：
- ✅ `excludes` - 完全支持，用于排除文件
- ✅ `includes` - 完全支持，用于包含文件
- ✅ `parsing.enableTextMacro` - 完全支持，控制文本宏处理
- ✅ `parsing.enablePreprocessor` - 完全支持，控制预处理器（如 `//! import`）
- ✅ `parsing.enableLuaBlocks` - 完全支持，控制 Lua 块处理
- ⚠️ `parsing.strictMode` - 已定义但尚未实现，保留用于未来扩展
- ✅ `standardLibraries` - 完全支持，自定义标准库路径
- ✅ `diagnostics` - 完全支持，所有诊断选项都已实现

#### 注意事项

1. **Glob 模式**：`excludes` 和 `includes` 使用 glob 模式，支持 `*`、`**`、`?` 等通配符
2. **优先级**：`includes` 的优先级高于 `excludes`，即如果文件同时匹配 `includes` 和 `excludes`，则会被包含
3. **相对路径**：`standardLibraries` 中的路径如果是相对路径，则相对于工作区根目录
4. **配置验证**：如果配置文件格式错误，扩展会显示警告，并使用默认配置
5. **自动重载**：修改配置文件并保存后，扩展会自动重新加载配置，无需重启 VS Code
6. **配置位置**：配置文件必须放在工作区根目录，文件名为 `jass.config.json`

#### 秒加载测试说明

1. 在 VS Code `settings.json` 中设置：
```json
{
  "jass.instantLibraryLoad": true
}
```
2. Reload Window 一次，让扩展先生成标准库缓存。
3. 再次 Reload Window，对比第二次启动日志/体感，标准库应优先从持久化加载（更快）。
4. 将系统时间快进超过 24 小时或手动清理缓存目录后重启，缓存应失效并回退到正常解析路径。

## 📋 功能特点

### 核心功能
- **语法高亮** - 完整的 JASS/vJASS/Zinc 语法高亮支持
- **代码补全** - 智能代码补全，支持函数、变量、类型、结构体等
- **代码片段** - 丰富的代码片段模板，快速生成常用代码
- **跳转定义** - 支持跳转到函数、变量、结构体等定义位置
- **悬停提示** - 鼠标悬停显示符号的详细信息（类型、参数、文档等）
- **错误诊断** - 实时语法检查和语义分析，显示错误和警告
- **代码格式化** - 自动格式化代码，保持代码风格一致
- **参数提示** - 函数调用时显示参数提示和签名帮助
- **内联提示** - 显示变量类型和函数参数类型的内联提示
- **查找引用** - 查找符号的所有引用位置
- **查找实现** - 查找接口的实现位置
- **工作区符号** - 快速搜索工作区中的所有符号
- **文档大纲** - 显示文件的结构和符号树

### 语言特性支持
- **JASS** - 完整的 JASS 语言支持
- **vJASS** - 支持库（library）、结构体（struct）、接口（interface）、模块（module）、委托（delegate）等特性
- **Zinc** - 支持 C-like 语法，包括类、方法、操作符重载等
- **跨文件支持** - 支持跨文件的符号查找和跳转
- **标准库支持** - 内置 common.j 和 blizzard.j 标准库定义

## 📦 项目结构

```
.
├── src/                    # 源代码目录
│   ├── extension.ts       # 扩展的主要实现文件
│   ├── boot/             # 启动相关代码
│   ├── extern/           # 外部依赖和工具
│   ├── provider/         # 语言服务提供者
│   │   ├── completion-provider.ts      # 代码补全提供者
│   │   ├── definition-provider.ts       # 跳转定义提供者
│   │   ├── hover-provider.ts           # 悬停提示提供者
│   │   ├── diagnostic-provider.ts      # 错误诊断提供者
│   │   ├── formatting-provider.ts      # 代码格式化提供者
│   │   ├── signature-help-provider.ts   # 参数提示提供者
│   │   ├── inlay-hints-provider.ts     # 内联提示提供者
│   │   ├── reference-provider.ts       # 查找引用提供者
│   │   ├── workspace-symbol-provider.ts # 工作区符号提供者
│   │   ├── data-enter-manager.ts       # 文件缓存和解析管理器
│   │   └── zinc/                        # Zinc 语言专用提供者
│   ├── vjass/            # vJASS 解析器和分析器
│   ├── jass/             # JASS 解析器
│   └── temp/             # 临时文件目录
├── static/               # 静态资源目录
│   ├── images/          # 图片资源
│   ├── snippets.json    # 代码片段定义
│   ├── jass.tmLanguage.json  # JASS 语言语法定义
│   ├── zinc.tmLanguage.json # Zinc 语言语法定义
│   ├── common.j         # 标准 JASS 库
│   ├── blizzard.j       # 暴雪官方 JASS 库
│   └── *.jass           # 其他 JASS 相关文件
├── .vscode/             # VS Code 配置目录
├── out/                 # 编译输出目录
├── dist/                # 打包输出目录
├── package.json         # 项目配置文件
├── tsconfig.json        # TypeScript 配置
└── README.md           # 项目说明文档
```

### 核心文件说明

- **src/extension.ts**: 扩展的主要实现文件，包含所有语言服务提供者的注册和初始化
- **src/provider/data-enter-manager.ts**: 文件缓存和解析管理器，负责管理所有文件的 AST 缓存
- **src/provider/completion-provider.ts**: 代码补全提供者，提供智能代码补全功能
- **src/provider/hover-provider.ts**: 悬停提示提供者，显示符号的详细信息
- **src/provider/diagnostic-provider.ts**: 错误诊断提供者，进行语法检查和语义分析
- **src/vjass/analyzer.ts**: vJASS 语义分析器，提供类型检查、未定义变量检测等功能
- **static/snippets.json**: 定义代码自动补全片段
- **static/jass.tmLanguage.json**: 定义 JASS 语言的语法高亮规则
- **static/zinc.tmLanguage.json**: 定义 Zinc 语言的语法高亮规则
- **static/common.j**: 包含 JASS 标准库函数定义
- **static/blizzard.j**: 包含暴雪官方 JASS 函数定义

## 💻 使用示例

### Zinc Hello World 示例

```jass
library Bottles99
{
    /* 99 Bottles of beer sample,
        prints the lyrics at: http://99-bottles-of-beer.net/lyrics.html
    */
    function onInit()
    {
        string bot = "99 bottles";
        integer i=99;
        while (i>=0)
        {
            BJDebugMsg(bot+" of beer on the wall, "+bot+" of beer");
            i=i-1;
            if      (i== 1) bot = "1 bottle";
            else if (i== 0) bot = "No more bottles";
            else            bot = I2S(i)+" bottles";
            //Lazyness = "No more" is always capitalized.

            if(i>=0)
            {
                BJDebugMsg("Take one down and pass it around, "+bot+" of beer on the wall.\n");
            }
        }
        BJDebugMsg("Go to the store and buy some more, 99 bottles of beer on the wall.");
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
- [vJASS 文档](https://www.hiveworkshop.com/threads/vjass-manual.165320/)
- [Zinc 文档](https://www.hiveworkshop.com/threads/zinc-manual.165321/)
- [GitHub 仓库](https://github.com/naichabaobao/jass)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jass.jass)
- [QQ 群](https://qm.qq.com/q/786204376): 786204376

## 📝 版本信息

- **当前版本**: 1.9.7
- **VS Code 版本要求**: 1.63+
- **common.j 版本**: 2.03
- **物编数据版本**: 2.03

### 最新更新 (v1.9.7)

- 类型查询优先级与 function interface 符号支持（见 docs/type-system.md）
- 修复「not all code paths return a value」与返回类型 string 误报
- 允许 struct 的 `private method onDestroy`
- takes 参数 hover/跳转/补全体验优化
- 未声明变量由 error 改为 warning
- 修复数组结构（extends array）误报：允许静态数组成员、静态成员默认值；修复 `private static integer array xxx` 解析

### 历史更新 (v1.9.6)

- 修复 hint 功能性能问题，现在只处理可见范围内的代码
- 拆分 literal 配置项，解决补全提示项太乱的问题
- 添加 hint 功能开关，允许用户控制 hint 功能的启用/禁用

### 历史更新 (v1.9.5)

- 添加字符代码 hover 支持：对 'az09' 这样的字符代码显示10进制和16进制值
- 添加 vJASS 内置常量、时间、随机数等的特殊 hover 支持
- 完善 jass.config.json 配置加载和使用，修复配置相关问题

### 历史更新 (v1.9.4)

- 修复 struct 一个 public 修饰解析错误问题
- 完善 set hint 功能，完善 caller 嵌套 hint 功能
- 支持所有语法情况下的 caller hint（return、exitwhen、if、elseif、set、local、数组下标等）
- 支持函数对象方法调用 hint（func.evaluate()、func.execute()）
- 支持方法对象方法调用 hint（method.evaluate()、method.execute()）
- 完善 function、native、globals 的全局查找 hint 支持（包括 library 和 scope 中的）
- 完善嵌套调用的参数提示支持
- 修复 hover、跳转跨文件 bug
- 修复一些警告问题
- 添加无限循环检测：检测没有 exitwhen 的 loop 语句
- 添加方法调用链长度检测：警告过长的方法调用链（超过5个调用）
- 添加多返回值语法错误检测框架（函数声明和 return 语句）
- 修复诊断提供者：文件删除后诊断未清除的问题
- 修复诊断提供者：文件重命名后旧诊断未清除的问题
- 使用 rxjs 替代 setTimeout，改进异步事件处理

查看完整的更新日志，请参考 [CHANGELOG.md](CHANGELOG.md)

## 🤝 贡献指南

欢迎提交 Pull Request 或创建 Issue 来帮助改进这个项目！

## 💖 支持项目

| 请我喝杯奶茶 ☕ | 一起出份力赞助我开发吧！❤️ |
| --- | --- |
| <img src="https://user-images.githubusercontent.com/38098031/190127376-c47656c3-8b28-4ff2-a242-78bb28a3652e.png" alt="赞助二维码" width="280"/> | <img src="https://user-images.githubusercontent.com/38098031/189883735-7bbdb474-259a-4bc7-8a6b-09707aa013a4.png" alt="赞助说明" width="420"/> |

<div align="center">
  <h3>⭐ 如果这个项目对你有帮助，请给我们一个 star！</h3>
</div>

![冰封王座巫妖王](https://github.com/naichabaobao/jass/blob/master/static/images/blizzard-nova.jpg?raw=true)
