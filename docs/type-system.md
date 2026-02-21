# JASS / vJASS 类型体系统一说明

本扩展在语义分析时统一处理 JASS 原生类型与 vJASS 的 `type X extends Y`，与 [vJass 教程](https://www.gamesdeity.com) 及 `static/vjass.docs.txt` 中的类型语义一致。

## 根类型解析

- 所有「是否为合法类型」「是否为 handle 类型」等判断，都先按 **type 声明链** 解析到 **根类型**：
  - `type race extends handle` → 根类型为 `handle`
  - `type xxx extends integer array [5]` → 根类型为 `integer`（不会当作 handle）
- 实现：`resolveTypeRoot(typeName)` 沿 `type X extends Y` 递归解析，并用 `visited` 防止循环 type 定义；根类型即 JASS 中的基础类型（`handle`、`integer`、`real`、`string`、`boolean`、`code` 等）。

## Handle 类型判断

- **先按声明解析**：若某类型在符号表或外部符号表中声明为 `type X extends handle`（或链式 extends 到 handle），则判为 handle。
- **回退仅用于未声明**：仅当该类型 **未在当前工程或外部符号表中声明** 时，才使用 `FALLBACK_HANDLE_TYPE_NAMES`（与 common.j 对齐的 handle 类型名集合）判断，用于单独解析如 `blizzard.j` 而未加载 `common.j` 时避免误报。
- 因此自定义 `type myhandle extends handle` 会正确判为 handle；自定义 `type xxx extends integer array [5]` 会解析到 `integer`，不会误判为 handle。

## 类型合法性（isValidType）与查询优先级

类型语法检查时按以下**优先级**解析类型名（先匹配先通过）：

1. **基本类型**：`integer`、`real`、`string`、`boolean`、`code`、`handle`，以及 `key`、`nothing`、`thistype`。
2. **type 声明**：`type X extends Y` 在符号表中的 TYPE 符号。
3. **struct / interface**：结构体与接口名。
4. **function interface**：`function interface Name takes ... returns ...` 声明的函数接口名。
5. **vjass type**：沿 type 链解析到根类型、handle 子类型及回退集合、外部符号表中的 TYPE/STRUCT/INTERFACE/FUNCTION_INTERFACE。

实现上先查当前符号表（按 2→3→4 顺序），再通过 `resolveTypeRoot` / `isHandleType` 与外部符号表做第 5 步。

## null 与 handle

- 在 JASS 中，`null` 可赋给任意 handle 类型、也可作为返回 handle 的函数的返回值。分析器在类型兼容性检查中允许 `null` 与任意 handle 类型兼容。

## 分析中的使用点（便于维护）

- **resolveTypeRoot**：类型合法性、handle 判断、类型兼容性的基础。
- **isHandleType**：变量/参数/返回值的 mayBeNull、`null` 赋值与返回值兼容、`checkNullUsage`、赋值后 mayBeNull 更新。
- **isTypeCompatible**：实参与形参、返回值、赋值、struct/interface 方法签名兼容。
- **FALLBACK_HANDLE_TYPE_NAMES**：仅当类型未在符号表/外部符号表声明时用于 isHandleType，与 common.j 的 handle 类型名对齐。

## 与 vjass.docs 的对应关系

- vJASS 的 `type NewType extends BaseType` / `type NewType extends BaseType array[Size]` 在语义上即「为 JASS 的 BaseType 起别名或扩展」；本扩展用根类型统一为 JASS 基础类型，与之一致。

## type 解析测试与调试

- **仅运行 type/thistype 相关语义测试**：`npm run test:type`（需先 `npm run compile`）。会执行名称包含 thistype、handle 类型、类型兼容、extends 等的用例。
- **失败时打印代码片段**：`DEBUG_TYPE=1 npm run test:type`（Windows: `set DEBUG_TYPE=1 && npm run test:type`），失败用例会输出前 12 行代码便于对照。
- **Parser 层 type 声明解析**：`npm run test:parser` 中的「测试 24: JASS type 声明解析测试」覆盖 `type X extends Y`、`type X extends Y array[N]` 等解析。
- 语义层 type 解析（`resolveTypeRoot`、`isValidType`、`isHandleType`）由 `src/vjass/analyzer.ts` 实现，对应单测在 `src/vjass/analyzer.test.ts` 的 thistype 与类型兼容相关用例中。
