# Provider New - 基于新 AST 系统的语言服务提供者

## 概述

这个目录包含基于新 AST 系统（`ast.ts`）的语言服务提供者，使用 `DataEnterManager` 管理文件缓存和解析。

## 文件结构

- `data-enter-manager.ts`: 文件缓存和解析管理器
- `streaming-parser.ts`: 流式解析函数（预处理 + 解析）
- `completion-provider.ts`: 代码补全提供者

## 使用示例

### 1. 初始化 DataEnterManager

```typescript
import { DataEnterManager } from './provider/data-enter-manager';

const dataEnterManager = new DataEnterManager({
    ignoreConfig: false,
    debounceDelay: 300,
    enableFileWatcher: true
});

// 初始化工作区
await dataEnterManager.initializeWorkspace();
```

### 2. 注册 Completion Provider

```typescript
import * as vscode from 'vscode';
import { CompletionProvider } from './provider/completion-provider';
import { DataEnterManager } from './provider/data-enter-manager';

// 创建 DataEnterManager 实例
const dataEnterManager = new DataEnterManager();
await dataEnterManager.initializeWorkspace();

// 创建 Completion Provider
const completionProvider = new CompletionProvider(dataEnterManager);

// 注册提供者
const jassSelector = { scheme: 'file', language: 'jass' };
context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
        jassSelector,
        completionProvider,
        ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789_.".split("")
    )
);
```

## Completion Provider 功能

### 支持的补全项类型

1. **关键字**: 所有 JASS/vJASS/Zinc 关键字
2. **函数**: 从所有缓存文件中提取的函数声明
3. **函数接口**: 函数接口声明
4. **全局变量**: 全局变量声明
5. **类型**: 类型别名声明
6. **结构体**: 结构体声明
7. **接口**: 接口声明
8. **模块**: 模块声明
9. **委托**: 委托声明
10. **TextMacro**: 文本宏定义
11. **局部变量**: 当前作用域内的局部变量和参数

### 作用域感知

- 自动识别当前作用域
- 只提供在当前作用域内可见的局部变量
- 只提供在当前位置之前声明的局部变量

## 特性

### 1. 多文件支持

Completion Provider 会从所有缓存的文件中提取补全项，包括：
- 标准库文件（common.j, common.ai, blizzard.j）
- static 目录下的文件
- 工作区文件

### 2. 实时更新

当文件更新时，`DataEnterManager` 会自动更新缓存，Completion Provider 会立即反映这些更改。

### 3. 位置感知

Completion Provider 会根据光标位置智能过滤补全项：
- 只显示在当前作用域内可见的变量
- 只显示在当前位置之前声明的局部变量

## 扩展

### 添加新的补全项类型

在 `extractFromStatement` 方法中添加新的语句类型处理：

```typescript
else if (stmt instanceof YourNewStatementType) {
    if (stmt.name) {
        const item = new vscode.CompletionItem(
            stmt.name.name,
            vscode.CompletionItemKind.YourKind
        );
        item.detail = 'Your Detail';
        item.documentation = 'Your Documentation';
        items.push(item);
    }
}
```

### 自定义过滤逻辑

可以重写 `provideCompletionItems` 方法，添加自定义过滤逻辑：

```typescript
provideCompletionItems(document, position, token, context) {
    const items = super.provideCompletionItems(document, position, token, context);
    // 自定义过滤逻辑
    return items.filter(item => /* your condition */);
}
```

## 注意事项

1. **性能**: Completion Provider 会遍历所有缓存的文件，对于大型项目可能会有性能影响。可以考虑添加缓存机制。

2. **作用域**: 当前的作用域检测是简单的基于位置的方法，对于复杂的嵌套作用域可能需要更复杂的逻辑。

3. **错误处理**: 如果文件解析失败，Completion Provider 会跳过该文件，不会影响其他文件的补全。

## 未来改进

- [ ] 添加补全项缓存机制
- [ ] 改进作用域检测逻辑
- [ ] 支持结构体成员补全
- [ ] 支持方法链补全
- [ ] 添加补全项排序和优先级

