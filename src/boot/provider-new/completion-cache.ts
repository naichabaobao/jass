import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Statement, BlockStatement } from "../vjass/vjass-ast";
import { DataEnterManager } from "./data-enter";

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
 */
export class CompletionCache {
    private static instance: CompletionCache;
    /**
     * key: filePath, value: CustomCompletionItem[]
     */
    private cache: Map<string, CustomCompletionItem<Statement>[]>;
    private cacheDir: string;
    private isUpdating: boolean = false;
    private updateQueue: Set<string> = new Set();

    private constructor() {
        this.cache = new Map();
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
     * 保存缓存到磁盘
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
     */
    public getAll(): CustomCompletionItem<Statement>[] {
        const allItems: CustomCompletionItem<Statement>[] = [];
        for (const items of this.cache.values()) {
            allItems.push(...items);
        }
        return allItems;
    }

    /**
     * 更新文件的补全项（由 data-enter.ts 调用）
     */
    public update(filePath: string, items: CustomCompletionItem<Statement>[]): void {
        this.cache.set(filePath, items);
        // 异步保存到磁盘，不阻塞
        setImmediate(() => {
            this.saveToDisk(filePath, items);
        });
    }

    /**
     * 删除文件的补全项（由 data-enter.ts 调用）
     */
    public delete(filePath: string): void {
        this.cache.delete(filePath);
        
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
    public getStats(): { totalFiles: number; totalItems: number } {
        let totalItems = 0;
        for (const items of this.cache.values()) {
            totalItems += items.length;
        }
        return {
            totalFiles: this.cache.size,
            totalItems
        };
    }
}
