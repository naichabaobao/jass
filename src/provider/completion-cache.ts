import * as vscode from "vscode";
import { Statement, BlockStatement } from "../vjass/ast";
import { DataEnterManager } from "./data-enter-manager";

export class CustomCompletionItem<T extends Statement> extends vscode.CompletionItem {
    public filePath: string;
    public statement: T;
    public constructor(label: string, kind: vscode.CompletionItemKind, filePath: string, statement: T) {
        super(label, kind);
        this.filePath = filePath;
        this.statement = statement;
    }
}

/**
 * 补全项缓存管理器
 * 负责内存补全项缓存，由 data-enter.ts 通知更新
 * 
 * 性能优化：
 * - 使用索引机制快速查找
 * - 维护全局补全项列表，避免每次遍历
 * - 纯内存缓存，避免磁盘I/O与陈旧数据
 */
export class CompletionCache {
    private static instance: CompletionCache;
    /**
     * key: filePath, value: CustomCompletionItem[]
     */
    private cache: Map<string, CustomCompletionItem<Statement>[]>;
    /**
     * 全局补全项列表（所有文件的补全项合并）
     * 用于快速获取所有补全项，避免每次遍历
     */
    private allItemsCache: CustomCompletionItem<Statement>[] | null = null;
    /**
     * 按名称索引的补全项映射（用于快速查找）
     * key: item label (string), value: CustomCompletionItem[]
     */
    private nameIndex: Map<string, CustomCompletionItem<Statement>[]>;
    private isUpdating: boolean = false;
    private updateQueue: Set<string> = new Set();

    private constructor() {
        this.cache = new Map();
        this.nameIndex = new Map();
    }

    public static getInstance(): CompletionCache {
        if (!CompletionCache.instance) {
            CompletionCache.instance = new CompletionCache();
        }
        return CompletionCache.instance;
    }

    /**
     * 重建索引和全局列表
     * 在加载缓存后或批量更新后调用
     */
    private rebuildIndexes(): void {
        this.nameIndex.clear();
        this.allItemsCache = [];

        for (const [filePath, items] of this.cache.entries()) {
            for (const item of items) {
                const label = item.label as string;
                
                // 添加到名称索引
                if (!this.nameIndex.has(label)) {
                    this.nameIndex.set(label, []);
                }
                this.nameIndex.get(label)!.push(item);
                
                // 添加到全局列表
                this.allItemsCache.push(item);
            }
        }
    }

    /**
     * 更新索引（增量更新，只更新单个文件）
     */
    private updateIndexesForFile(filePath: string, oldItems: CustomCompletionItem<Statement>[], newItems: CustomCompletionItem<Statement>[]): void {
        // 移除旧项的索引
        for (const item of oldItems) {
            const label = item.label as string;
            const indexedItems = this.nameIndex.get(label);
            if (indexedItems) {
                const index = indexedItems.findIndex(i => i.filePath === filePath);
                if (index >= 0) {
                    indexedItems.splice(index, 1);
                    if (indexedItems.length === 0) {
                        this.nameIndex.delete(label);
                    }
                }
            }
        }

        // 添加新项的索引
        for (const item of newItems) {
            const label = item.label as string;
            if (!this.nameIndex.has(label)) {
                this.nameIndex.set(label, []);
            }
            this.nameIndex.get(label)!.push(item);
        }

        // 更新全局列表（移除旧项，添加新项）
        if (this.allItemsCache) {
            // 移除旧项
            const oldItemsSet = new Set(oldItems);
            this.allItemsCache = this.allItemsCache.filter(item => !oldItemsSet.has(item));
            // 添加新项
            this.allItemsCache.push(...newItems);
        } else {
            // 如果全局列表为空，重建
            this.rebuildIndexes();
        }
    }

    /**
     * 获取文件的补全项（只读，不更新）
     */
    public get(filePath: string): CustomCompletionItem<Statement>[] {
        return this.cache.get(filePath) || [];
    }

    /**
     * 获取所有补全项（只读，不更新）
     * 使用缓存的全局列表，避免每次遍历
     */
    public getAll(): CustomCompletionItem<Statement>[] {
        if (this.allItemsCache === null) {
            // 如果全局列表为空，重建
            this.rebuildIndexes();
        }
        return this.allItemsCache || [];
    }

    /**
     * 根据名称查找补全项（使用索引，快速查找）
     * @param name 补全项名称（支持前缀匹配，不区分大小写）
     * @returns 匹配的补全项列表
     */
    public findByName(name: string): CustomCompletionItem<Statement>[] {
        const results: CustomCompletionItem<Statement>[] = [];
        const lowerName = name.toLowerCase();

        // 优化：精确匹配也应该不区分大小写
        // 检查原始大小写和小写版本
        const exactMatch = this.nameIndex.get(name) || this.nameIndex.get(name.toLowerCase());
        if (exactMatch) {
            results.push(...exactMatch);
        }

        // 前缀匹配（不区分大小写）
        for (const [label, items] of this.nameIndex.entries()) {
            const lowerLabel = label.toLowerCase();
            // 修复：使用 lowerLabel 进行比较，确保大小写不敏感
            if (lowerLabel.startsWith(lowerName) && lowerLabel !== lowerName) {
                results.push(...items);
            }
        }

        return results;
    }

    /**
     * 批量获取多个文件的补全项
     * @param filePaths 文件路径数组
     * @returns 所有文件的补全项合并
     */
    public getBatch(filePaths: string[]): CustomCompletionItem<Statement>[] {
        const results: CustomCompletionItem<Statement>[] = [];
        for (const filePath of filePaths) {
            const items = this.cache.get(filePath);
            if (items) {
                results.push(...items);
            }
        }
        return results;
    }

    /**
     * 更新文件的补全项（由 data-enter.ts 调用）
     */
    public update(filePath: string, items: CustomCompletionItem<Statement>[]): void {
        const oldItems = this.cache.get(filePath) || [];
        this.cache.set(filePath, items);
        
        // 更新索引（增量更新）
        this.updateIndexesForFile(filePath, oldItems, items);
    }

    /**
     * 批量更新多个文件的补全项
     * @param updates Map<filePath, items>
     */
    public updateBatch(updates: Map<string, CustomCompletionItem<Statement>[]>): void {
        for (const [filePath, items] of updates.entries()) {
            const oldItems = this.cache.get(filePath) || [];
            this.cache.set(filePath, items);
            this.updateIndexesForFile(filePath, oldItems, items);
        }
    }

    /**
     * 删除文件的补全项（由 data-enter.ts 调用）
     */
    public delete(filePath: string): void {
        const oldItems = this.cache.get(filePath) || [];
        this.cache.delete(filePath);
        
        // 从索引中移除
        this.updateIndexesForFile(filePath, oldItems, []);
    }

    /**
     * 清空所有缓存
     */
    public clear(): void {
        this.cache.clear();
        this.nameIndex.clear();
        this.allItemsCache = [];
    }

    /**
     * 检查文件是否有缓存
     */
    public has(filePath: string): boolean {
        return this.cache.has(filePath);
    }

    /**
     * 获取缓存统计信息
     */
    public getStats(): { totalFiles: number; totalItems: number; indexedNames: number; pendingSaves: number } {
        return {
            totalFiles: this.cache.size,
            totalItems: this.allItemsCache?.length || 0,
            indexedNames: this.nameIndex.size,
            pendingSaves: 0
        };
    }

    /**
     * 强制刷新所有待保存的文件（立即保存）
     */
    public flush(): void {
        // 纯内存缓存，不需要落盘
    }
}
