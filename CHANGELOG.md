#### 1.9.19 (pre-release)
- LSP 排障能力完善：新增**状态栏指示器**——LSP 接管时显示 `✓ JASS LSP`（tooltip 列出已接管特性），启动中显示转圈，服务端不可用/崩溃回落内置实现时显示 `⚠ JASS 内置模式`（tooltip 携带回落原因），点击直达「输出 → JASS Language Server」面板，新增命令 `jass.showLspOutput`。至此「LSP 开了但感觉不对」可以按三步定位：看状态栏 → `npm run test:lsp-probe`（绕开客户端直接驱动 exe 走完整 LSP 会话，验证 initialize/诊断/hover/documentSymbol/标准库零误报）→ 看输出面板日志。
- 新增**旧版扩展共存检测**：激活时若发现旧版「Warcraft-III-VJassHelper」（`jass.warcraft-iii-vjasshelper`）仍在启用，弹出一次性警告——该扩展同样为 JASS 注册悬停/诊断等特性，与本扩展同时启用会结果重复、互相干扰（其旧版本还会因内置 `data` 目录缺失抛出 `data\blizzard.j ENOENT` 未处理异常）。仅提示不干预。
- 修复 handle 变量赋值后的「Possible null value used」误报（`set gg_trg_X = CreateTrigger()` 后每次当参数使用都被警告）：赋值路径的 mayBeNull 评估与声明处语义对齐——此前仅凭 RHS 是 handle 类型（如 `CreateTrigger()` 返回 `trigger`）就把变量重新标记为可能为 null，现仅当 RHS 是字面 `null` 或 RHS 变量本身可能为 null 时才标记；赋值链传播（`set b = a`，a 可能为 null）与「无初始化直接使用」的正确警告保留。`analyzer.test.ts` 新增 4 个回归用例，`parser-bugs.test.ts` 新增 4 组 textmacro 特殊形态覆盖（函数生成器宏占位符作函数名/返回类型+逗号前后空格、参数含空格与占位符拼接、生成 struct 成员与方法、空参数列表与 optional 调用）。
- 修复 textmacro 模板体语义误报的**解析层根因**：`parseTextMacro` 此前只匹配**第一个** `//! endtextmacro`，当宏体内嵌套定义另一个 `//! textmacro`（YDWE 允许）时，内层的 `//! endtextmacro` 会被误认为外层宏的结束标记——外层宏提前截断、真正的结束标记悬空被静默跳过、**后续所有宏定义整体错位**，其模板体以真实 `FunctionDeclaration` 形态泄漏进 AST（`$TYPE$` 被当普通标识符解析成功、parse 零错误），语义分析随即产生 `Invalid parameter type '$TYPE$'` 等必然误报。现按嵌套深度配对收集宏体，嵌套指令行重建时补回被词法层剥离的 `//!` 前缀。`parser-bugs.test.ts` 新增嵌套定义回归用例，并新增全局结构断言：任何用例顶层出现名字带 `$` 的函数声明（= 模板体泄漏）直接判失败。
- 语义层兜底（防御纵深）：名字或类型名带 `$NAME$` 占位符的函数/native 声明整体跳过语义检查（JASS 合法标识符不含 `$`，此类节点只可能来自模板体泄漏），`checkTypeValidity` 对占位符类型名直接放行。`analyzer.test.ts` 新增 2 个回归用例（正常模板不误报 + 泄漏场景不误报）。
- `jass.lsp` 简化：**移除 `jass.lsp.path` 配置项**，语言服务器路径不再支持自定义，固定使用扩展内置 `static/` 目录下与当前平台匹配的二进制——Windows `ydwe-compiler.exe`、Linux `ydwe-compiler`（同时随扩展分发）。Linux/macOS 首次启用时自动把内置二进制拷贝到扩展 globalStorage 并赋予可执行权限（VSIX 打包会丢失可执行位），内置文件更新时副本按 size+mtime 自动刷新；EACCES 场景给出明确的 chmod 提示。README（中/英/日）同步更新。
- 修复 `return null` 误报「Return type 'null' does not match function return type 'player'」（同样影响 unit/group 等所有 native handle 类型）：`isHandleType` 新增的「用户 struct/interface 不算 handle」判断里，`findSymbol` 未命中返回的是 `null`，代码却与 `undefined` 比较——恒为 true，导致任何类型都被当成用户类型，`FALLBACK_HANDLE_TYPE_NAMES` 回退集合永远失效。带 common.j 时类型能沿 `type X extends handle` 链解析所以未暴露；单文件/未加载标准库时 `return null`、`local unit u = null` 等全部误报。改回 `null` 比较。
- 修复上一条连带暴露的回归：`checkIfExpressionIsNull` 只识别 `Identifier("null")`，不识别解析器实际生成的 `NullLiteral` 节点，导致 `local unit u = null` 不再标记 mayBeNull、「空值使用」警告丢失。现两种节点都识别。
- `analyzer.test.ts` 新增回归用例：无标准库场景下 `returns player` 函数中 `return null` 不应产生任何类型错误（112 用例全绿）。
- 修复多行块注释（`/* ... */` 跨行）被「缩起来」：原 `removeComment` 在块注释状态下对非换行字符直接丢弃，导致注释体所在行被整行清空、整段长度变短、后续基于字符偏移的定位全部错位。现改为注释体内每个非换行字符替换为空格、换行保留、`*/` 替换为两空格，长度与行结构完全不变。单行块注释与字符串内 `/* */`、`//` 保护逻辑保持不变。
- 修复 vJASS `method operator` 误报错：原 `parseMethod` 仅支持 `[] []= < > == !=` 与命名运算符，导致 `method operator +` / `-` / `*` / `/` / `=` / `<=` / `>=` 全部被报 `Invalid operator name` 而解析失败——这正是结构体运算符重载（如 `operator +`、`operator =`）最常见的误报错来源。现补齐这 7 个运算符分支；报错提示同步更新。
- 新增 `src/vjass/parser-bugs.test.ts`：39 个合法复杂 vJASS 片段的「应零语法误报」回归扫描（覆盖 library/scope/struct 继承与运算符重载/module/interface/textmacro/static if/debug/注入/zinc 等），接入 `npm test`（新增 `test:bugscan`）。扫描目前全绿。
- 新增实验性配置项 `jass.lsp`（默认 `false`）：开启后由内置语言服务器（Rust 实现，`--lsp` 模式）接管**悬停提示（hover）与错误诊断（diagnostics）**，其余能力仍走扩展自带实现。新增 `src/lsp/` 模块：`takeover.ts`（接管策略表，纯函数）、`server-resolver.ts`（服务器定位 + `--lsp` 可用性探测）、`lsp-client-manager.ts`（`vscode-languageclient` 生命周期 + 能力屏蔽中间件）、`lsp-mode-controller.ts`（`FeatureRegistry` 独占注册表 + 模式切换总控）。配套 `src/lsp/README.md` 说明模块划分与「新增可接管特性」的步骤。
- 重构 `extension.ts` 的 provider 注册：可被接管的语言特性（completion / signatureHelp / documentSymbol / hover / definition / inlayHints / diagnostics）收敛为 `nativeFeatureFactories`，由 `LspModeController` 决定装原生实现还是让位给服务端——同一特性同时只有一套实现生效，避免补全重复、hover 出现两段。其余特性（关键字文档、类型定义、引用、工作区符号、实现、格式化、颜色、链接、CodeAction）保持常驻。
- 新增 `jass.lsp.trace.server`（LSP 通信日志级别）配置项与命令 `jass.restartLspServer`。服务端不可用（二进制缺失、未启用 `lsp` feature、启动失败或中途退出）时自动回落内置实现，原因写入「输出 → JASS Language Server」面板；诊断来源标签为 `ydwe-compiler`，与内置的 `jass` / `zinc` 区分。
- 依赖与引擎变更：`dependencies` 新增 `vscode-languageclient@^8.1.0`；`engines.vscode` 由 `^1.63.0` 提升到 `^1.67.0`。
- `DataEnterManager` 新增 `offConfigReload(callback)`（原先只有 `on` 无注销），供按配置动态创建/销毁的消费者使用，避免回调堆积。

#### 1.9.18
- 修复 `@ignore-file-errors` 整文件忽略注解：原实现仅屏蔽 error 等级诊断，现按 `error > warning > info` 等级联屏蔽（与 `jass.config.json` 的 `diagnostics.severity` 等级体系一致）；整文件注解下语法/语义错误、警告、info 级校验提示全部不再显示，仅保留最低等级 `hint`。
- 修复「仅打开单个 JASS 文件（未打开工作区文件夹）时 common.j 等标准库不显示」：单文件模式原先完全跳过 `loadStandardLibraries` / `loadStaticFiles`，导致 native 函数没有悬停/补全/跳转，语义分析还会对 native 大量误报「未定义」。现已在单文件模式下同样加载标准库与扩展 `static` 文件；并统一标准库 static 目录解析为「多候选回退」（`resolveExtensionStaticDir`），修复 `getStandardLibraryFiles` 旧的单候选路径在 dev/打包布局下解析不到内置 static 目录的问题。
- 维护：补充 `.vscodeignore`，发布包不再包含 `.vscode/`（含 jass-cache 运行缓存）、`.workbuddy/`（内部记忆笔记）、`docs/`（内部设计文档）、`*.test.js` 测试文件与 `vsc-extension-quickstart.md` 等开发期文件。
- 本版同时并入此前在 1.9.17 节中记录、但尚未随 1.9.17 发布的未提交改动（移除基于 pjass.exe 的 JASS 编译检查、special 提供器重构、static 标准库更新等）。

#### 1.9.17 (pre-release)
- 补全项 detail 显示文件路径：所有跨文件可见符号（函数、native、全局变量、结构体、接口、模块、TextMacro 等）的补全 detail 均显示「类型 — 相对路径」，无需展开详情即可快速定位来源文件。
- 修复 `@since` / `@version` 注释解析换行问题：下一行非 `@xxx` 标签的文本不再被误拼接到版本号上，回归为普通描述文本；其他多标签续行（`@param` / `@deprecated` / `@example` 等）不受影响。
- 修复 signature-help-provider 中一处缩进错误，并清理 3 处残留的 `console.warn` 调试输出。
- 语义分析「未使用符号」检查补全覆盖全局变量：`globals` 块 / library / scope 内的全局变量现在也会参与未使用检查（私有全局严格检查，公开全局按跨文件可见性处理）。
- 修复文档/悬浮 Webview 语法高亮：还原 `enhanceKeywordDocHtml` 中被误改坏的单词边界正则（误写成退格符，导致关键字/类型/数字高亮失效），并修正行拆分/拼接原先使用字面量 `\n` 文本而非真实换行符的问题，使多行代码正确分行与注释着色。
- 字面量提示（悬停/转到定义）改进：以光标前引号奇偶计数判断是否真正处于未闭合的字符串/四字码字面量内，修复「数字提示受前一个引号字符影响而失效」以及「关闭 `literal.hover` 开关后代码/变量/函数仍显示提示」的问题。
- 移除基于 `pjass.exe` 的 JASS 编译检查功能（右键 `JASS` 子菜单、`jass.compiler.*` 配置及 `jass.check*` 命令）：外部 exe 语法检查性能低且不符合项目方向；后续如需语法检查将以 TypeScript 实现。
- 修复 `@ignore-file-errors` 仅屏蔽 error 等级诊断的缺陷：现按 `error > warning > info` 等级联屏蔽，与 `jass.config.json` 的 `diagnostics.severity` 等级体系保持一致。整文件注解下，语法/语义错误、警告、以及 info 级校验提示全部不再显示；仅保留最低等级 `hint`（在用户声明的等级体系之外，且历史上本就不参与屏蔽）。
- 修复「仅打开单个 JASS 文件（未打开工作区文件夹）时 common.j 等标准库不显示」：单文件模式下 `initializeWorkspace` 原先完全跳过 `loadStandardLibraries` / `loadStaticFiles`，导致 native 函数没有悬停/补全/跳转，语义分析还会对 native 大量误报「未定义」。现已在单文件模式下同样加载标准库与扩展 `static` 文件。顺带统一标准库 static 目录的解析为「多候选回退」（`resolveExtensionStaticDir`），修复 `getStandardLibraryFiles` 旧的单候选路径在 dev/打包布局下根本解析不到内置 static 目录的问题。

#### 1.9.16
- 新增 JASS 编译检查功能（基于 pjass.exe）：在 `.j/.jass/.ai` 文件编辑区右键 → `JASS` 子菜单，提供三种检查模式：
  - `编译自定义触发`：以 `common.j + blizzard.j + 目标文件` 顺序入参，检查触发器脚本。
  - `编译自定义库(Blizzard.j或common.ai)`：以 `common.j + 目标文件` 顺序入参，检查自定义库脚本。
  - `编译自定义ai脚本`：以 `common.j + common.ai + 目标文件` 顺序入参，检查 AI 脚本。
  - 检查结果输出到 `JASS 编译检查` 输出面板，支持中文路径 GBK 解码；找不到 `pjass.exe` 会给出明确提示。
- 新增 `jass.compiler.*` 配置项，分离「显示注释用标准库」与「编译检查用标准库」：
  - `jass.compiler.pjassPath`：自定义 `pjass.exe` 路径，留空使用扩展内置版本（`out/extern/pjass/pjass.exe`）。
  - `jass.compiler.commonJ / blizzardJ / commonAi`：用于 hover/补全显示中文 API 注释的标准库路径，留空使用扩展内置 `static/` 版本。
  - `jass.compiler.checkCommonJ / checkBlizzardJ / checkCommonAi`：编译检查专用标准库路径，留空时回退到对应的 `jass.compiler.*` 配置，再回退到扩展内置版本。
- `jass.apiVersion` 枚举新增 `2.00`、`2.02` 两个版本选项。
- 怎么用：打开任意 JASS 文件 → 右键 → `JASS` → 选择对应检查模式；如需切换标准库来源，在 `settings.json` 配置 `jass.compiler.*` 即可。

#### 1.9.15
- 修复多个dzapi文件bug

#### 1.9.14
- 表达式错误改为在 `analyzer` 统一诊断：`parser` 容错生成无效表达式节点，减少解析阶段误伤与重复报错。
- 所有带结束标签的块（`function/method/if/loop/globals/scope/library/struct/interface/module`）统一记录结束标签 token。
- 缺失结束标签时，诊断锚定到起始关键字（如 `method`/`if`/`loop`），定位更直观。

#### 1.9.13
- 修复 method 形参在签名帮助中不提示的问题。
- vJass 解析：二元运算符缺少右操作数时在运算符处报错；表达式路径统一按「词法耗尽」处理，避免 `EndOfInput` 边界漏诊。
- 词法：`1000.` 等仅尾随小数点的实数字面量识别。
- 语义：`call` 语句不再对同一调用表达式重复检查；`this.方法名` 在结构上不存在但存在同名全局函数时，提示使用 `call 函数名(...)`。

#### 1.9.12
- 修复未使用BUG
- 关键字跳转默认关闭
- 参数未使用支持
- 支持this跳转

#### 1.9.11
- 补全跨文件索引修复：`struct/interface/module` 内成员会被完整收集，`public function/method/native` 在其他文件可正常提示。
- 修饰符语义增强：`public/private/static/stub/readonly` 在 AST、补全文档与成员提示链路中保持一致。
- `library/scope` 的 `globals` 可见性落盘修复：`private/public` 不再只解析不保存，后续诊断与补全可正确读取。
- 未使用检查按可见性优化：私有符号会严格参与检查；公开符号按可能跨文件使用处理，减少误报。

#### 1.9.10
- 未使用变量提示进一步完善：识别更准，灰显范围更克制，减少误伤。
- vJass 关键字文档补齐并统一入口，常用语法点可直接跳转查看。

#### 1.9.9
- 这版重点是“稳定 + 好用”：语法高亮更一致，跨文件跳转更稳，重命名/删除/移动后的缓存一致性明显提升。
- 增加 `jass.apiVersion` 行为策略：补全会更贴近目标版本；同时兼容 return bug 场景。
  - 常见设置：`"jass.apiVersion": "1.20"`（偏旧版本兼容）
  - 温和模式：`"jass.apiVersion": "off"`（提示更保守）
- 诊断体验继续升级：支持错误忽略注解，临时屏蔽噪音更方便。
  - 忽略整文件错误：`// @ignore-file-errors`
  - 忽略下一行语法错误：`// @ignore-next-line-syntax`
  - 也可用片段快速输入：`ignore-file` / `ignore-next-line` / `ignore`
- Quick Fix / Code Action 覆盖更全，修复更稳。看到报错后按 `Ctrl+.`（或点灯泡）直接套用建议。
- 新增关键字文档跳转：对 JASS 26 个关键字执行“转到定义”可直接打开对应 HTML 教程页面（Webview 展示，不再打开源码）。
- 文档阅读体验增强：关键字教程页支持代码块关键字高亮，示例可读性更好。
- 关键字教程补全：`function/if/loop/return` 等核心页面升级为“全而美”教程结构（语法、示例、易错点、实践建议）。

#### 1.9.8
- 注释标签能力补强：`@param`、`@returns`、`@deprecated`、`@provider`、`@since`、`@see`、`@example` 都能被更好识别。
- `@version` 仍兼容，但展示上统一按 `Since` 处理，便于团队规范化。
- `@deprecated` 的展示更直观（hover/completion 中删除线与说明更明确）。
- 怎么用：给接口或函数补上结构化注释，例如 `// @since 1.26`、`// @provider Blizzard`、`// @deprecated use NewFoo`。

#### 1.9.7
- 类型与返回值相关误报做了重点修复：包括 `not all code paths return`、字符串拼接推断等高频问题。
- `function interface` 进入类型检查链路；takes 参数的 hover/跳转/补全体验更完整。
- 数组结构（extends array）相关误报减少，`private static integer array xxx` 这类写法更稳。
- 怎么用：类型问题排查建议先跑 `npm run test:type`，再配合编辑器里的 hover 与跳转快速定位。

#### 1.9.6
- hint 性能优化，主要针对大文件与滚动场景：可见区优先、噪音更低。
- 配置拆分为 `jass.literal.completion` / `jass.literal.hover`，并新增 `jass.hint` 开关。
- 怎么用：如果提示过多，先关补全提示保留悬停提示，例如：
  - `"jass.hint": true`
  - `"jass.literal.completion": false`
  - `"jass.literal.hover": true`

#### 1.9.5
- hover 信息更实用：字符码（如 `'az09'`）可直接看到数值解释，常见 vJASS 内置信息补全。
- `jass.config.json` 的加载与生效链路更稳定，诊断配置更容易按预期工作。
- 怎么用：悬停字符码或常见内置符号即可查看说明；调整 `diagnostics.*` 后保存配置会自动重载。

#### 1.9.4
- hint 与参数提示覆盖更多语法场景（包含 caller 嵌套、return/if/loop 等常见分支）。
- 跨文件 hover/跳转修复一批稳定性问题；并加入更多流程诊断（如无 `exitwhen` 的 loop）。
- 怎么用：调用函数时直接看参数提示；收到流程类诊断后按提示先补 `exitwhen` 或拆分调用链。

#### 1.9.3
- 结构体成员识别逻辑修正，方法体局部变量不再误判为成员。
- 怎么用：若旧工程曾出现这类误报，升级后保存一次文件触发重诊断即可验证。

#### 1.9.2
- 文件匹配与解析兼容性提升，library 中 globals 解析问题修复，关键字高亮更准。
- 怎么用：在 `jass.config.json` 用 `includes/excludes` 控制扫描范围，混合 library/globals 场景可直接写。

#### 1.9.1
- 格式化稳定性修复（`.zn` 仍有少量边界样例待持续优化）。
- 怎么用：在 `.j/.jass/.zn` 文件直接执行格式化；若异常，建议反馈最小复现代码片段。

#### 1.9.0
- 上线 vJASS AST + 流式词法解析，初版 hint 可用。
- 怎么用：函数调用输入参数时可见基础提示；大型工程建议配合 `jass.config.json` 使用。

#### 1.8.44
- 增加预处理表达式支持（`<??>`、`<?=?>`）。
- 怎么用：在脚本预处理插值场景直接使用上述语法。

#### 1.8.38
- 初步支持 module，并修复一批错误提示。
- 怎么用：vJASS 里声明 `module` 后可获得基础语法识别与提示。

#### 1.8.37
- 修复数组定义与 `end` 后注释误报，增加 reference 计数能力。
- 怎么用：相关场景可按标准写法直接使用，误报相较此前明显减少。

#### 1.8.31
- 修复结构体数组定义与布尔表达式 `&&` / `||` 的处理问题。
- 怎么用：复杂条件可直接组合使用 `&&` 与 `||`。

#### 1.8.30
- 新增类型层级与类型定义跳转，修复 vjass 数组与 zinc 局部变量提示问题。
- 怎么用：在符号上使用“转到类型定义 / 类型层级”追踪关系。

#### 1.8.29
- 修复 vjass 变量数组定义；同阶段也包含 zinc 数组与关键字提示优化。
- 怎么用：数组变量按标准声明后，结合补全与诊断确认是否符合预期。

#### 1.8.26
- 修复变量名称解析错误。
- 怎么用：旧项目中的命名边界场景，建议重新触发一次诊断确认。

#### 1.8.25
- 优化解析与错误检测时机。
- 怎么用：保存后可更快看到语法/语义反馈。


