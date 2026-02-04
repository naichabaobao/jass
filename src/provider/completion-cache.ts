import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
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
 * 负责持久化补全项缓存，由 data-enter.ts 通知更新
 * 
 * 性能优化：
 * - 使用索引机制快速查找
 * - 维护全局补全项列表，避免每次遍历
 * - 批量更新和延迟保存，减少磁盘I/O
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
    private cacheDir: string;
    private isUpdating: boolean = false;
    private updateQueue: Set<string> = new Set();
    /**
     * 延迟保存定时器
     */
    private saveTimer: NodeJS.Timeout | null = null;
    /**
     * 待保存的文件集合
     */
    private pendingSaves: Set<string> = new Set();
    /**
     * 延迟保存的时间间隔（毫秒）
     */
    private readonly SAVE_DELAY = 1000;

    private constructor() {
        this.cache = new Map();
        this.nameIndex = new Map();
        // 使用 VSCode 的全局存储目录
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            this.cacheDir = path.join(workspaceFolder.uri.fsPath, '.vscode', 'jass-cache');
        } else {
            this.cacheDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.vscode', 'jass-cache');
        }
        
        // 确保缓存目录存在
        this.ensureCacheDir();
        
        // 尝试从磁盘加载缓存
        this.loadFromDisk();
        
        // 重建索引和全局列表
        this.rebuildIndexes();
    }

    public static getInstance(): CompletionCache {
        if (!CompletionCache.instance) {
            CompletionCache.instance = new CompletionCache();
        }
        return CompletionCache.instance;
    }

    /**
     * 确保缓存目录存在
     */
    private ensureCacheDir(): void {
        try {
            if (!fs.existsSync(this.cacheDir)) {
                fs.mkdirSync(this.cacheDir, { recursive: true });
            }
        } catch (error) {
            console.error('Failed to create cache directory:', error);
        }
    }

    /**
     * 获取缓存文件路径
     */
    private getCacheFilePath(filePath: string): string {
        // 使用文件路径的哈希值作为文件名，避免路径问题
        const hash = this.hashFilePath(filePath);
        return path.join(this.cacheDir, `${hash}.json`);
    }

    /**
     * 对文件路径进行哈希
     */
    private hashFilePath(filePath: string): string {
        let hash = 0;
        for (let i = 0; i < filePath.length; i++) {
            const char = filePath.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * 从磁盘加载缓存
     */
    private loadFromDisk(): void {
        try {
            if (!fs.existsSync(this.cacheDir)) {
                return;
            }

            const files = fs.readdirSync(this.cacheDir);
            let loadedCount = 0;

            for (const file of files) {
                if (!file.endsWith('.json')) {
                    continue;
                }

                try {
                    const cacheFilePath = path.join(this.cacheDir, file);
                    const content = fs.readFileSync(cacheFilePath, 'utf-8');
                    const data = JSON.parse(content);
                    
                    if (data.filePath && Array.isArray(data.items)) {
                        // 将 JSON 数据转换回 CompletionItem
                        const items = this.deserializeItems(data.items);
                        this.cache.set(data.filePath, items);
                        loadedCount++;
                    }
                } catch (error) {
                    // 忽略损坏的缓存文件
                    console.warn(`Failed to load cache file ${file}:`, error);
                }
            }

            if (loadedCount > 0) {
                console.log(`📦 Loaded ${loadedCount} completion cache files from disk`);
            }
        } catch (error) {
            console.error('Failed to load completion cache from disk:', error);
        }
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
     * 保存缓存到磁盘（立即保存）
     */
    private saveToDisk(filePath: string, items: CustomCompletionItem<Statement>[]): void {
        try {
            const cacheFilePath = this.getCacheFilePath(filePath);
            const data = {
                filePath,
                items: this.serializeItems(items),
                timestamp: Date.now()
            };
            
            fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Failed to save completion cache for ${filePath}:`, error);
        }
    }

    /**
     * 延迟保存到磁盘（批量保存，减少I/O）
     */
    private scheduleSave(filePath: string): void {
        this.pendingSaves.add(filePath);

        // 清除之前的定时器
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        // 设置新的定时器
        this.saveTimer = setTimeout(() => {
            this.flushPendingSaves();
        }, this.SAVE_DELAY);
    }

    /**
     * 立即保存所有待保存的文件
     */
    private flushPendingSaves(): void {
        if (this.pendingSaves.size === 0) {
            return;
        }

        const filesToSave = Array.from(this.pendingSaves);
        this.pendingSaves.clear();

        for (const filePath of filesToSave) {
            const items = this.cache.get(filePath);
            if (items) {
                this.saveToDisk(filePath, items);
            }
        }

        this.saveTimer = null;
    }

    /**
     * 序列化 CustomCompletionItem 为 JSON
     */
    private serializeItems(items: CustomCompletionItem<Statement>[]): any[] {
        return items.map(item => ({
            label: item.label,
            kind: item.kind,
            detail: item.detail,
            documentation: item.documentation ? (typeof item.documentation === 'string' ? item.documentation : item.documentation.value) : undefined,
            insertText: item.insertText,
            sortText: item.sortText,
            filterText: item.filterText,
            filePath: item.filePath,
            statementType: item.statement.constructor.name
        }));
    }

    /**
     * 反序列化 JSON 为 CustomCompletionItem
     * 注意：statement 无法完全恢复，只能恢复基本信息
     */
    private deserializeItems(data: any[]): CustomCompletionItem<Statement>[] {
        return data.map(itemData => {
            // 创建一个临时的 Statement 对象用于 CustomCompletionItem
            // 由于无法完全恢复 statement，我们创建一个最小的 Statement
            const tempStatement = {
                constructor: { name: itemData.statementType || 'Statement' }
            } as Statement;
            
            const item = new CustomCompletionItem<Statement>(
                itemData.label,
                itemData.kind,
                itemData.filePath || '',
                tempStatement
            );
            
            if (itemData.detail) item.detail = itemData.detail;
            if (itemData.documentation) {
                item.documentation = new vscode.MarkdownString(itemData.documentation);
            }
            if (itemData.insertText) item.insertText = itemData.insertText;
            if (itemData.sortText) item.sortText = itemData.sortText;
            if (itemData.filterText) item.filterText = itemData.filterText;
            
            return item;
        });
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
        
        // 延迟保存到磁盘，减少I/O
        this.scheduleSave(filePath);
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
            this.pendingSaves.add(filePath);
        }

        // 批量保存
        this.scheduleSave('');
    }

    /**
     * 删除文件的补全项（由 data-enter.ts 调用）
     */
    public delete(filePath: string): void {
        const oldItems = this.cache.get(filePath) || [];
        this.cache.delete(filePath);
        
        // 从索引中移除
        this.updateIndexesForFile(filePath, oldItems, []);
        
        // 从待保存列表中移除
        this.pendingSaves.delete(filePath);
        
        // 删除磁盘上的缓存文件
        try {
            const cacheFilePath = this.getCacheFilePath(filePath);
            if (fs.existsSync(cacheFilePath)) {
                fs.unlinkSync(cacheFilePath);
            }
        } catch (error) {
            console.error(`Failed to delete cache file for ${filePath}:`, error);
        }
    }

    /**
     * 清空所有缓存
     */
    public clear(): void {
        this.cache.clear();
        this.nameIndex.clear();
        this.allItemsCache = [];
        this.pendingSaves.clear();
        
        // 清除保存定时器
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }
        
        // 清空磁盘上的缓存文件
        try {
            if (fs.existsSync(this.cacheDir)) {
                const files = fs.readdirSync(this.cacheDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        fs.unlinkSync(path.join(this.cacheDir, file));
                    }
                }
            }
        } catch (error) {
            console.error('Failed to clear cache files:', error);
        }
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
            pendingSaves: this.pendingSaves.size
        };
    }

    /**
     * 强制刷新所有待保存的文件（立即保存）
     */
    public flush(): void {
        this.flushPendingSaves();
    }
}
