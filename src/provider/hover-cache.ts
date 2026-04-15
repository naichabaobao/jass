import * as vscode from "vscode";

/**
 * Hover 信息项
 */
export interface HoverCacheItem {
    /** 符号名称 */
    symbolName: string;
    /** 文件路径 */
    filePath: string;
    /** Hover 内容（Markdown 字符串） */
    content: string;
    /** 符号类型（用于区分同名符号） */
    symbolType?: string;
}

/**
 * Hover 缓存管理器
 * 负责内存 hover 信息缓存，由 data-enter-manager 通知更新
 * 
 * 性能优化：
 * - 使用索引机制快速查找
 * - 按符号名称索引，支持全局查找
 * - 纯内存缓存，避免磁盘I/O带来的陈旧数据问题
 */
export class HoverCache {
    private static instance: HoverCache;
    /**
     * key: filePath, value: HoverCacheItem[]
     */
    private cache: Map<string, HoverCacheItem[]>;
    /**
     * 按符号名称索引的 hover 信息映射（用于快速查找）
     * key: symbolName (string), value: HoverCacheItem[]
     */
    private nameIndex: Map<string, HoverCacheItem[]>;

    private constructor() {
        this.cache = new Map();
        this.nameIndex = new Map();
    }

    public static getInstance(): HoverCache {
        if (!HoverCache.instance) {
            HoverCache.instance = new HoverCache();
        }
        return HoverCache.instance;
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
    private updateIndexesForFile(filePath: string, oldItems: HoverCacheItem[], newItems: HoverCacheItem[]): void {
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
    public get(filePath: string): HoverCacheItem[] | undefined {
        return this.cache.get(filePath);
    }

    /**
     * 通过符号名称查找缓存项（全局查找）
     */
    public getBySymbolName(symbolName: string): HoverCacheItem[] {
        const lowerName = symbolName.toLowerCase();
        return this.nameIndex.get(lowerName) || [];
    }

    /**
     * 更新指定文件的缓存
     */
    public update(filePath: string, items: HoverCacheItem[]): void {
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
     * 清除所有缓存
     */
    public clearAll(): void {
        this.cache.clear();
        this.nameIndex.clear();
    }

    /**
     * 强制立即保存所有待保存的文件
     */
    public flush(): void {
        // 纯内存缓存，不需要落盘
    }
}