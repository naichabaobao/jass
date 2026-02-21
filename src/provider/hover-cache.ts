import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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
 * 负责持久化 hover 信息缓存，由 data-enter-manager 通知更新
 * 
 * 性能优化：
 * - 使用索引机制快速查找
 * - 按符号名称索引，支持全局查找
 * - 批量更新和延迟保存，减少磁盘I/O
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
    private cacheDir: string;
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
            this.cacheDir = path.join(workspaceFolder.uri.fsPath, '.vscode', 'jass-cache', 'hover');
        } else {
            this.cacheDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.vscode', 'jass-cache', 'hover');
        }
        
        // 确保缓存目录存在
        this.ensureCacheDir();
        
        // 尝试从磁盘加载缓存
        this.loadFromDisk();
        
        // 重建索引
        this.rebuildIndexes();
    }

    public static getInstance(): HoverCache {
        if (!HoverCache.instance) {
            HoverCache.instance = new HoverCache();
        }
        return HoverCache.instance;
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
            console.error('Failed to create hover cache directory:', error);
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
                        this.cache.set(data.filePath, data.items);
                        loadedCount++;
                    }
                } catch (error) {
                    // 忽略损坏的缓存文件
                    console.warn(`Failed to load hover cache file ${file}:`, error);
                }
            }

            if (loadedCount > 0) {
                console.log(`📦 Loaded ${loadedCount} hover cache files from disk`);
            }
        } catch (error) {
            console.error('Failed to load hover cache from disk:', error);
        }
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
     * 保存缓存到磁盘（立即保存）
     */
    private saveToDisk(filePath: string, items: HoverCacheItem[]): void {
        try {
            const cacheFilePath = this.getCacheFilePath(filePath);
            const data = {
                filePath,
                items,
                timestamp: Date.now()
            };
            
            fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Failed to save hover cache for ${filePath}:`, error);
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
        
        // 延迟保存到磁盘
        this.scheduleSave(filePath);
    }

    /**
     * 清除指定文件的缓存
     */
    public clear(filePath: string): void {
        const oldItems = this.cache.get(filePath) || [];
        if (oldItems.length > 0) {
            this.cache.delete(filePath);
            this.updateIndexesForFile(filePath, oldItems, []);
            
            // 删除磁盘上的缓存文件
            try {
                const cacheFilePath = this.getCacheFilePath(filePath);
                if (fs.existsSync(cacheFilePath)) {
                    fs.unlinkSync(cacheFilePath);
                }
            } catch (error) {
                console.error(`Failed to delete hover cache file for ${filePath}:`, error);
            }
        }
    }

    /**
     * 强制立即保存所有待保存的文件
     */
    public flush(): void {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }
        this.flushPendingSaves();
    }
}