# 引用计数方案文档

## 概述

本文档描述了 JASS/vJASS/Zinc 扩展中用于管理文档信息（`vjass.docs.txt` 和 `zinc.docs.txt`）的引用计数方案。

## 背景

当前实现中，`HoverProvider` 在初始化时一次性加载并解析 `vjass.docs.txt` 文件，将解析结果缓存在内存中。这种方式存在以下问题：

1. **内存管理**：文档信息一旦加载就不会释放，即使不再需要
2. **资源浪费**：多个 Provider 可能重复加载相同的文档
3. **生命周期不明确**：无法确定何时可以安全释放资源

## 引用计数方案

### 设计目标

1. **共享资源**：多个组件可以共享同一份文档信息
2. **自动释放**：当所有引用都释放时，自动清理资源
3. **线程安全**：支持多线程环境下的引用计数操作
4. **性能优化**：避免重复加载和解析

### 核心组件

#### 1. DocumentInfoManager（文档信息管理器）

负责管理文档信息的加载、缓存和引用计数。

**主要职责：**
- 加载和解析 `vjass.docs.txt` 和 `zinc.docs.txt`
- 维护文档信息的引用计数
- 提供文档信息的访问接口
- 在引用计数为 0 时自动释放资源

**接口设计：**

```typescript
class DocumentInfoManager {
    // 获取文档信息的引用（增加引用计数）
    acquireRef(docType: 'vjass' | 'zinc'): DocumentInfo;
    
    // 释放文档信息的引用（减少引用计数）
    releaseRef(docType: 'vjass' | 'zinc'): void;
    
    // 获取当前引用计数
    getRefCount(docType: 'vjass' | 'zinc'): number;
    
    // 强制清理（用于测试或扩展停用）
    forceCleanup(): void;
    
    // 重置单例（用于测试或扩展停用后完全清理）
    static resetInstance(): void;
}
```

#### 2. DocumentInfo（文档信息）

封装解析后的文档信息。

**数据结构：**

```typescript
interface DocumentInfo {
    // 文档类型
    type: 'vjass' | 'zinc';
    
    // 解析后的信息映射
    // key: 符号名称（函数名、常量名等）
    // value: 符号信息（描述、类型、值等）
    symbols: Map<string, SymbolInfo>;
    
    // 文档原始内容（可选，用于调试）
    rawContent?: string;
    
    // 加载时间戳
    loadedAt: number;
}
```

#### 3. RefCountedResource（引用计数资源）

通用的引用计数资源包装器。

**实现要点：**
- 使用 `WeakMap` 或 `Map` 存储引用计数
- 提供 `acquire()` 和 `release()` 方法
- 在引用计数为 0 时触发清理回调

### 使用流程

#### 1. 获取文档信息

```typescript
// 在 HoverProvider 中
class HoverProvider {
    private docInfoRef?: DocumentInfo;
    
    constructor() {
        // 获取文档信息引用（增加引用计数）
        this.docInfoRef = DocumentInfoManager.getInstance().acquireRef('vjass');
    }
    
    provideHover(...) {
        // 使用文档信息
        const info = this.docInfoRef?.symbols.get(symbolName);
        // ...
    }
    
    dispose() {
        // 释放引用（减少引用计数）
        if (this.docInfoRef) {
            DocumentInfoManager.getInstance().releaseRef('vjass');
            this.docInfoRef = undefined;
        }
    }
}
```

#### 2. 引用计数生命周期

```
初始化阶段：
  Provider A: acquireRef('vjass') -> refCount = 1
  Provider B: acquireRef('vjass') -> refCount = 2
  
使用阶段：
  Provider A 和 B 共享同一份文档信息
  
清理阶段：
  Provider A: releaseRef('vjass') -> refCount = 1
  Provider B: releaseRef('vjass') -> refCount = 0 -> 自动清理
```

### 实现细节

#### 1. 单例模式

`DocumentInfoManager` 使用单例模式，确保全局只有一个实例。

```typescript
class DocumentInfoManager {
    private static instance: DocumentInfoManager | undefined;
    
    static getInstance(): DocumentInfoManager {
        if (!DocumentInfoManager.instance) {
            DocumentInfoManager.instance = new DocumentInfoManager();
        }
        return DocumentInfoManager.instance;
    }
}
```

#### 2. 延迟加载

文档信息在第一次 `acquireRef()` 调用时才加载，避免不必要的资源消耗。

```typescript
acquireRef(docType: 'vjass' | 'zinc'): DocumentInfo {
    if (!this.cache.has(docType)) {
        // 首次加载
        const info = this.loadDocument(docType);
        this.cache.set(docType, {
            info,
            refCount: 0
        });
    }
    
    const entry = this.cache.get(docType)!;
    entry.refCount++;
    return entry.info;
}
```

#### 3. 自动清理

当引用计数为 0 时，自动清理资源。

```typescript
releaseRef(docType: 'vjass' | 'zinc'): void {
    const entry = this.cache.get(docType);
    if (!entry) {
        return;
    }
    
    entry.refCount--;
    if (entry.refCount <= 0) {
        // 清理资源
        entry.info.symbols.clear();
        this.cache.delete(docType);
    }
}
```

#### 4. 错误处理

- 文件不存在：返回空的 `DocumentInfo`，不抛出错误
- 解析失败：记录警告日志，使用默认信息
- 并发访问：使用锁机制或原子操作保证线程安全

### 性能考虑

1. **缓存策略**：文档信息一旦加载就缓存，避免重复解析
2. **内存优化**：在引用计数为 0 时立即释放，不保留未使用的资源
3. **解析优化**：使用流式解析，避免一次性加载大文件到内存

### 扩展性

方案设计支持未来扩展：

1. **多文档类型**：可以轻松添加新的文档类型（如 `common.j.docs.txt`）
2. **增量更新**：支持文档文件的增量更新和热重载
3. **自定义解析器**：支持为不同文档类型注册自定义解析器

## 使用示例

### 基本使用

```typescript
// 1. 获取管理器实例
const manager = DocumentInfoManager.getInstance();

// 2. 获取文档信息引用
const vjassInfo = manager.acquireRef('vjass');

// 3. 使用文档信息
const symbolInfo = vjassInfo.symbols.get('GetTimeOfDay');
if (symbolInfo) {
    console.log(symbolInfo.description);
}

// 4. 释放引用
manager.releaseRef('vjass');
```

### 在 Provider 中使用

```typescript
export class HoverProvider implements vscode.HoverProvider {
    private docManager = DocumentInfoManager.getInstance();
    private vjassInfo?: DocumentInfo;
    private zincInfo?: DocumentInfo;
    
    constructor() {
        // 获取引用
        this.vjassInfo = this.docManager.acquireRef('vjass');
        this.zincInfo = this.docManager.acquireRef('zinc');
    }
    
    provideHover(...) {
        // 使用文档信息
        const info = this.vjassInfo?.symbols.get(symbolName);
        // ...
    }
    
    dispose() {
        // 释放引用
        if (this.vjassInfo) {
            this.docManager.releaseRef('vjass');
        }
        if (this.zincInfo) {
            this.docManager.releaseRef('zinc');
        }
    }
}
```

## 测试策略

1. **单元测试**：测试引用计数的增减逻辑
2. **集成测试**：测试多个 Provider 共享文档信息
3. **内存测试**：验证资源正确释放，无内存泄漏
4. **并发测试**：测试多线程环境下的安全性

## 迁移计划

### 阶段 1：实现核心功能
- [x] 创建 `DocumentInfoManager` 类
- [x] 实现引用计数逻辑
- [x] 实现文档加载和解析

### 阶段 2：集成到现有代码
- [x] 修改 `HoverProvider` 使用新的引用计数方案
- [x] 修改其他使用文档信息的 Provider（当前仅 HoverProvider 使用 vjass.docs.txt）
- [x] 添加清理逻辑到 `dispose()` 方法

### 阶段 3：优化和测试
- [x] 引用计数健壮性：防止重复 release、refCount 不低于 0
- [x] 扩展停用时强制清理并重置单例（`resetInstance()`）
- [x] 可选调试日志：配置 `jass.debug.refCount` 或环境变量 `JASS_DEBUG_REFCOUNT=1`
- [ ] 性能测试和优化
- [ ] 内存泄漏检测
- [x] 文档更新

### 调试引用计数

- **配置项**：`jass.debug.refCount`（boolean，默认 false）。启用后会在控制台输出每次 `acquireRef` / `releaseRef` 及 `forceCleanup` 的日志。
- **环境变量**：`JASS_DEBUG_REFCOUNT=1` 也可开启上述日志（便于在未打开设置时调试）。

## 注意事项

1. **线程安全**：如果扩展支持多线程，需要添加适当的同步机制
2. **错误恢复**：文档加载失败时应该有合理的降级策略
3. **向后兼容**：确保新方案不影响现有功能
4. **日志记录**：记录引用计数的变化，便于调试

## 参考

- [vJASS 文档](static/vjass.docs.txt)
- [Zinc 文档](static/zinc.docs.txt)
- [DocumentInfoManager 实现](src/provider/document-info-manager.ts)
- [HoverProvider 实现](src/provider/hover-provider.ts)
