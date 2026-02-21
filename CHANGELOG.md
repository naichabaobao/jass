#### 1.9.7
- 数组结构（extends array）误报修复：允许静态数组成员与静态成员默认值；修复 `private static integer array xxx` 等成员解析，不再误报「cannot have array members」「cannot have default values」
- 类型查询优先级：类型语法检查按顺序解析——基本类型 → type 声明 → struct/interface → function interface → vjass type（见 docs/type-system.md）
- 新增 function interface 符号：收集 `function interface Name takes ... returns ...`，参与类型合法性判断
- 类型解析测试与调试：新增 `npm run test:type` 仅跑 type/thistype 相关测试，支持 `DEBUG_TYPE=1` 打印失败代码片段；文档补充 type 解析测试说明
- 修复「not all code paths return a value」误报：then 分支为单条嵌套 if（如 BJ 风格 if/elseif/else 内层 if）时正确识别所有路径都有返回值
- 修复「Return type 'integer' does not match function return type 'string'」误报：`+` 在 JASS 中用于字符串拼接时若任一侧为 string 则结果为 string；两侧类型均未知（如函数调用）时不再假定为 integer
- 允许 struct 的 `private method onDestroy`：按 vjass.docs.txt 仅规定模块中不能使用 private，结构体 onDestroy 可为 private
- takes 参数体验：takes 内参数名支持 hover、跳转定义；递归进入 library/scope/struct 与 NativeDeclaration 参数；completion 支持多行 takes 与 library/scope 内类型与签名
- 未声明变量：由 error 改为 warning（如 `gg_trg_xxx` 可能为其他文件全局变量，仅提示警告）

#### 1.9.6
- 修复 hint 功能性能问题：现在只处理可见范围内的代码，大幅提升大文件性能
- 修复 hint 功能取消支持：添加取消令牌检查，避免在用户快速滚动时造成性能问题
- 修复 hint 位置计算：确保 hint 位置在可见范围内，避免显示在不可见区域
- 拆分 literal 配置项：将 `jass.literal` 拆分为 `jass.literal.completion`（默认 false）和 `jass.literal.hover`（默认 true），解决用户反馈的补全提示项太乱的问题
- 添加 hint 功能开关：新增 `jass.hint` 配置项（默认 true hint 功能的启用/禁用

#### 1.9.5
- 添加字符代码 hover 支持：对 'az09' 这样的字符代码显示10进制和16进制值
- 添加 vJASS 内置常量、时间、随机数等的特殊 hover 支持，从 vjass.docs.txt 读取信息
- 完善 jass.config.json 配置加载：修复配置加载问题，现在会正确加载所有配置项（excludes, includes, parsing, standardLibraries, diagnostics）
- 完善 jass.config.json 配置使用：修复所有诊断选项（checkTypes, checkUndefined, checkUnused, checkArrayBounds）的传递和使用
- 完善 README.md：添加完整的 jass.config.json 配置说明，包括所有配置项的详细说明、默认值和注意事项

#### 1.9.4
- 修复struct一个public修饰解析错误问题
- 完善set hint功能，完善caller嵌套hint功能
- 支持所有语法情况下的caller hint（return、exitwhen、if、elseif、set、local、数组下标等）
- 支持函数对象方法调用hint（func.evaluate()、func.execute()）
- 支持方法对象方法调用hint（method.evaluate()、method.execute()）
- 完善function、native、globals的全局查找hint支持（包括library和scope中的）
- 完善嵌套调用的参数提示支持
- 修复hover，跳转跨文件bug
- 修复一些警告问题
- 添加无限循环检测：检测没有 exitwhen 的 loop 语句
- 添加方法调用链长度检测：警告过长的方法调用链（超过5个调用）
- 添加多返回值语法错误检测框架（函数声明和 return 语句）
- 修复诊断提供者：文件删除后诊断未清除的问题
- 修复诊断提供者：文件重命名后旧诊断未清除的问题
- 使用 rxjs 替代 setTimeout，改进异步事件处理

#### 1.9.3
- 修复结构体成员识别问题：方法体内的局部变量不再被误识别为结构体成员
- 修复结构体成员收集逻辑，确保只有非局部变量才被识别为结构体成员
- 修复数组成员大小检查和数组结构限制检查，避免将方法体内的变量误判为结构体成员

#### 1.9.2
- 使用 VSCode 内置的 glob 实现替代 src\extern\glob，提升兼容性
- 修复解析器无法解析 library 块中 globals 块的问题
- 完善 jass.config.json 配置文件支持，包括 excludes 和 includes 模式匹配
- 修复 vjass 关键字语法高亮问题，确保所有 vjass 关键字正确显示为 keyword 类型

#### 1.9.1
- 修复vjass格式化问题
- .zn后缀文件格式化可能还是存在BUG

#### 1.9.0
- 完整的vJass抽象语法树解析
- 使用流式词法解析，而非一次性全部解析
- 增加初版hint功能支持，也就是你输入参数时，显示的不可选取类型（Test）

#### 1.8.44
- <??>跟<?=?>预处理

#### 1.8.38
- 初步支持module
- 修复一些错误提示问题

#### 1.8.37
- 数组定义bug修复
- 修复end tag后面注释报错问题
- 增加reference方法计数

#### 1.8.31
- 修复结构体数组定义问题
- 修复布尔表达式 '&&' '||' 操作

#### 1.8.30
- 增加TypeHierarchyProvider支持,需求vscode>=1.6,提供类型层级支持
- 增加类型定义跳转
- 修复vjass数组定义
- 修复zinc局部变量不提示问题

#### 1.8.29
- 修复vjass变量数组定义

#### 1.8.29
- 修复zinc变量数组定义
- 修复关键字提示
- 重新实现mark,number,string提示，废弃jass.config.json,当创建文件名称为presets.jass、numbers.jass、strings.jass时,插件会走另一套解析。
- 从新实现type功能

#### 1.8.26
- 修复变量名称解析错误问题
  
#### 1.8.25
- 优化解析时机
- 错误检测时机更及时


