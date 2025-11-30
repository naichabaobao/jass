# TextMacro 系统实现文档

## 概述

实现了完整的 TextMacro 系统，支持多文件 textmacro 定义和 runtextmacro 展开。

## 架构设计

### 两阶段解析流程

```
阶段1：收集阶段（Collect Phase）
├── 扫描所有文件（标准库、static目录、工作区文件）
├── 提取所有 textmacro 定义
└── 存储到全局 TextMacroRegistry

阶段2：解析阶段（Parse Phase）
├── 解析文件时遇到 runtextmacro
├── 从 TextMacroRegistry 查找对应定义
├── 展开宏体（替换 $PARAM$）
└── 将展开后的代码插入 AST
```

## 核心组件

### 1. TextMacroRegistry（单例）

**文件**: `src/boot/vjass/text-macro-registry.ts`

**功能**:
- 全局 textmacro 注册表（单例模式）
- 管理所有文件中定义的 textmacro
- 支持按文件路径管理宏
- 提供查找、注册、更新、删除功能

**主要方法**:
- `getInstance()`: 获取单例实例
- `register(macro)`: 注册 textmacro
- `find(name)`: 查找 textmacro（不区分大小写）
- `has(name)`: 检查是否存在
- `updateFile(filePath, macros)`: 更新文件的 textmacro
- `unregisterFile(filePath)`: 移除文件的所有 textmacro
- `getStats()`: 获取统计信息

### 2. TextMacroCollector（收集器）

**文件**: `src/boot/vjass/text-macro-collector.ts`

**功能**:
- 从文件内容中提取 textmacro 定义
- 不进行完整解析，只提取 textmacro 相关信息
- 验证语法和参数
- 自动注册到 TextMacroRegistry

**主要方法**:
- `collectFromFile(filePath, content, collection?)`: 从单个文件收集
- `collectFromFiles(files, collection?)`: 批量收集

### 3. TextMacroExpander（展开器）

**文件**: `src/boot/vjass/text-macro-expander.ts`

**功能**:
- 展开 runtextmacro 调用
- 替换宏体中的 `$PARAM$` 为实际参数值
- 支持可选宏（optional）
- 参数验证

**主要方法**:
- `expand(name, parameters, optional?, location?)`: 展开宏
- `exists(name)`: 检查宏是否存在
- `getParameters(name)`: 获取宏的参数列表

## 集成点

### 1. DataEnterManager 修改

**文件**: `src/boot/provider-new/data-enter.ts`

**主要修改**:
- 添加 TextMacro 组件初始化
- 实现两阶段解析流程
- 添加 `collectAllTextMacros()` 方法
- 修改 `handleFileUpdate()` 以更新 textmacro 注册表
- 修改 `handleFileDelete()` 以移除 textmacro
- 修改 `handleFileRename()` 以更新 textmacro 路径
- 修改 `parseFile()` 以传递 TextMacroExpander 给 Parser

**关键流程**:
```typescript
// 阶段1：收集所有 textmacro
await this.collectAllTextMacros(workspaceRoot);

// 阶段2：解析文件（此时可以使用 textmacro）
await this.loadStandardLibraries(workspaceRoot);
await this.loadStaticFiles(workspaceRoot);
await this.loadWorkspaceFiles(workspaceRoot);
```

### 2. Parser 修改

**文件**: `src/boot/vjass/parser.ts`

**主要修改**:
- 构造函数添加 `textMacroExpander` 参数
- 修改 `parseRunTextMacro()` 方法以展开宏
- 展开后的代码解析为 BlockStatement 并插入 AST

**展开流程**:
1. 解析 runtextmacro 指令
2. 从 TextMacroExpander 展开宏
3. 将展开后的代码创建新的 Parser 解析
4. 返回包含展开语句的 BlockStatement

### 3. AST 节点

**文件**: `src/boot/vjass/vjass-ast.ts`

**新增节点**:
- `TextMacroStatement`: 表示 textmacro 定义
- `RunTextMacroStatement`: 表示 runtextmacro 调用（未展开时）

## 使用示例

### 定义 textmacro

```jass
//! textmacro Increase takes TYPEWORD
function IncreaseStored$TYPEWORD$ takes gamecache g, string m, string l returns nothing
    call Store$TYPEWORD$(g,m,l,GetStored$TYPEWORD$(g,m,l)+1)
endfunction
//! endtextmacro
```

### 调用 runtextmacro

```jass
//! runtextmacro Increase("Integer")
//! runtextmacro Increase("Real")
```

### 可选宏

```jass
//! runtextmacro optional OptionalMacro("param")
```

## 文件更新处理

当文件更新时：
1. 先更新 textmacro 注册表（收集阶段）
2. 然后重新解析文件（解析阶段，可以使用更新后的 textmacro）

当文件删除时：
- 自动从注册表中移除该文件的所有 textmacro

当文件重命名时：
- 更新注册表中相关 textmacro 的文件路径

## 错误处理

- **宏不存在**: 如果宏不存在且不是可选的，报告错误
- **参数数量不匹配**: 检查参数数量是否匹配
- **语法错误**: 在收集阶段验证 textmacro 语法
- **嵌套错误**: 检测 textmacro 嵌套（不支持）

## 验证和调试

### 测试文件

创建了 `src/boot/vjass/text-macro-test.ts` 用于测试。

### 调试信息

- 收集阶段会输出收集到的 textmacro 数量
- 解析阶段会输出解析进度
- 错误和警告会记录到 Parser 的 errors 集合中

## 注意事项

1. **解析顺序**: 必须先收集所有 textmacro，再解析文件
2. **文件扫描**: 收集阶段会递归扫描所有目录
3. **位置信息**: 展开后的代码位置信息会保留原始 runtextmacro 的位置
4. **错误合并**: 展开后的代码解析错误会合并到主 Parser 的错误集合中

## 后续优化建议

1. 支持 textmacro_once（类似 library_once）
2. 支持嵌套 runtextmacro（宏体中调用其他宏）
3. 优化展开后的代码位置信息
4. 添加 textmacro 定义跳转和补全功能

