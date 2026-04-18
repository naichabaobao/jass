/**
 * 跳转信息项
 */
export interface JumpCacheItem {
    /** 符号名称 */
    symbolName: string;
    /** 跳转位置 */
    location: {
        uri: string;
        range: {
            start: { line: number; character: number };
            end: { line: number; character: number };
        };
    };
    /** 文件路径 */
    filePath: string;
    /** 符号类型（用于区分同名符号） */
    symbolType?: string;
}

/**
 * 跳转缓存管理器
 * 负责持久化跳转信息缓存，由 data-enter-manager 通知更新
 * 
 * 性能优化：
 * - 使用索引机制快速查找
 * - 按符号名称索引，支持全局查找
 * - 批量更新和延迟保存，减少磁盘I/O
 */
export class JumpCache {
    private static instance: JumpCache;
    /**
     * key: filePath, value: JumpCacheItem[]
     */
    private cache: Map<string, JumpCacheItem[]>;
    /**
     * 按符号名称索引的跳转信息映射（用于快速查找）
     * key: symbolName (string), value: JumpCacheItem[]
     */
    private nameIndex: Map<string, JumpCacheItem[]>;

    private constructor() {
        this.cache = new Map();
        this.nameIndex = new Map();
    }

    public static getInstance(): JumpCache {
        if (!JumpCache.instance) {
            JumpCache.instance = new JumpCache();
        }
        return JumpCache.instance;
    }

    /**
     * 重建索引
     * 在加载缓存后或批量更新后调用
     */
    private rebuildIndexes(): void {
        this.nameIndex.clear();

        for (const [filePath, items] of this.cache.entries()) {
            for (const item of items) {
                const symbolName = item.symbolName.toLowerCase();
                
                // 添加到名称索引
                if (!this.nameIndex.has(symbolName)) {
                    this.nameIndex.set(symbolName, []);
                }
                this.nameIndex.get(symbolName)!.push(item);
            }
        }
    }

    /**
     * 更新索引（增量更新，只更新单个文件）
     */
    private updateIndexesForFile(filePath: string, oldItems: JumpCacheItem[], newItems: JumpCacheItem[]): void {
        // 移除旧项的索引
        for (const item of oldItems) {
            const symbolName = item.symbolName.toLowerCase();
            const indexedItems = this.nameIndex.get(symbolName);
            if (indexedItems) {
                const index = indexedItems.findIndex(i => i.filePath === filePath && i.symbolName === item.symbolName);
                if (index >= 0) {
                    indexedItems.splice(index, 1);
                    if (indexedItems.length === 0) {
                        this.nameIndex.delete(symbolName);
                    }
                }
            }
        }

        // 添加新项的索引
        for (const item of newItems) {
            const symbolName = item.symbolName.toLowerCase();
            if (!this.nameIndex.has(symbolName)) {
                this.nameIndex.set(symbolName, []);
            }
            this.nameIndex.get(symbolName)!.push(item);
        }
    }

    /**
     * 获取指定文件的缓存项
     */
    public get(filePath: string): JumpCacheItem[] | undefined {
        return this.cache.get(filePath);
    }

    /**
     * 通过符号名称查找缓存项（全局查找）
     */
    public getBySymbolName(symbolName: string): JumpCacheItem[] {
        const lowerName = symbolName.toLowerCase();
        return this.nameIndex.get(lowerName) || [];
    }

    /**
     * 更新指定文件的缓存
     */
    public update(filePath: string, items: JumpCacheItem[]): void {
        const oldItems = this.cache.get(filePath) || [];
        this.cache.set(filePath, items);
        
        // 更新索引
        this.updateIndexesForFile(filePath, oldItems, items);
    }

    /**
     * 清除指定文件的缓存
     */
    public clear(filePath: string): void {
        const oldItems = this.cache.get(filePath) || [];
        if (oldItems.length > 0) {
            this.cache.delete(filePath);
            this.updateIndexesForFile(filePath, oldItems, []);
        }
    }

    /**
     * 清除“跳转目标”指向指定文件的所有缓存项
     * 例如：定义所在文件被重命名/删除时，需要把所有引用旧路径的位置清理掉
     */
    public clearByTargetFile(targetFilePath: string): void {
        for (const [sourceFilePath, items] of this.cache.entries()) {
            const filtered = items.filter(item => {
                const target = item.location?.uri || item.filePath;
                return target !== targetFilePath;
            });
            if (filtered.length === items.length) {
                continue;
            }
            this.cache.set(sourceFilePath, filtered);
            this.updateIndexesForFile(sourceFilePath, items, filtered);
        }
    }

    /**
     * 清除所有缓存（内存 + 磁盘）
     */
    public clearAll(): void {
        this.cache.clear();
        this.nameIndex.clear();
    }

    /**
     * 强制立即保存所有待保存的文件
     */
    public flush(): void {
        // 内存缓存模式下不需要落盘
    }
}