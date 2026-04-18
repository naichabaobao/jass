import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * 符号信息（函数、常量等）
 */
export interface SymbolInfo {
    description: string;
    type: string;
    value?: string;
}

/**
 * 文档信息（解析后的 vjass.docs.txt 或 zinc.docs.txt）
 */
export interface DocumentInfo {
    type: 'vjass' | 'zinc';
    symbols: Map<string, SymbolInfo>;
    rawContent?: string;
    loadedAt: number;
}

interface CacheEntry {
    info: DocumentInfo;
    refCount: number;
}

/**
 * 文档信息管理器 - 负责 vjass.docs.txt 和 zinc.docs.txt 的加载、缓存和引用计数
 */
export class DocumentInfoManager {
    private static instance: DocumentInfoManager | undefined;
    private cache = new Map<'vjass' | 'zinc', CacheEntry>();
    private basePath: string;

    private constructor() {
        // 解析时 __dirname 指向编译后的 dist 目录
        this.basePath = path.resolve(__dirname, '../../static');
    }

    static getInstance(): DocumentInfoManager {
        if (!DocumentInfoManager.instance) {
            DocumentInfoManager.instance = new DocumentInfoManager();
        }
        return DocumentInfoManager.instance;
    }

    /**
     * 重置单例（用于扩展 deactivate 或测试），下次 getInstance 将创建新实例
     */
    static resetInstance(): void {
        if (DocumentInfoManager.instance) {
            DocumentInfoManager.instance.forceCleanup();
            DocumentInfoManager.instance = undefined;
        }
    }

    /**
     * 获取文档信息的引用（增加引用计数）
     */
    acquireRef(docType: 'vjass' | 'zinc'): DocumentInfo {
        if (!this.cache.has(docType)) {
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

    /**
     * 释放文档信息的引用（减少引用计数）
     */
    releaseRef(docType: 'vjass' | 'zinc'): void {
        const entry = this.cache.get(docType);
        if (!entry) {
            return;
        }

        entry.refCount--;
        if (entry.refCount <= 0) {
            entry.info.symbols.clear();
            this.cache.delete(docType);
        }
    }

    /**
     * 获取当前引用计数
     */
    getRefCount(docType: 'vjass' | 'zinc'): number {
        const entry = this.cache.get(docType);
        return entry ? entry.refCount : 0;
    }

    /**
     * 强制清理（用于测试或特殊情况）
     */
    forceCleanup(): void {
        for (const [docType, entry] of this.cache.entries()) {
            entry.info.symbols.clear();
        }
        this.cache.clear();
    }

    /**
     * 加载并解析文档
     */
    private loadDocument(docType: 'vjass' | 'zinc'): DocumentInfo {
        const symbols = new Map<string, SymbolInfo>();
        const fileName = docType === 'vjass' ? 'vjass.docs.txt' : 'zinc.docs.txt';

        // 默认内置信息（作为后备）
        const defaultBuiltinInfo: { [key: string]: SymbolInfo } = docType === 'vjass' ? {
            'GetTimeOfDay': { description: '获取当前游戏时间（0.00-24.00）', type: 'real' },
            'SetTimeOfDay': { description: '设置游戏时间', type: 'function' },
            'GetRandomInt': { description: '获取指定范围内的随机整数', type: 'function' },
            'GetRandomReal': { description: '获取指定范围内的随机实数', type: 'function' },
            'PI': { description: '圆周率 π (3.14159...)', type: 'real', value: '3.14159' },
            'E': { description: '自然常数 e (2.71828...)', type: 'real', value: '2.71828' },
            'BJDebugMsg': { description: '调试消息输出函数', type: 'function' },
            'DEBUG_MODE': { description: '调试模式常量（布尔值）', type: 'boolean' },
            'MAX_PLAYERS': { description: '最大玩家数', type: 'integer', value: '16' },
            'MAX_PLAYER_SLOTS': { description: '最大玩家槽位数', type: 'integer', value: '24' }
        } : {};

        for (const [key, value] of Object.entries(defaultBuiltinInfo)) {
            symbols.set(key, value);
        }

        // 尝试从文件读取
        const possiblePaths = [
            path.join(this.basePath, fileName),
            path.resolve(__dirname, `../../../static/${fileName}`),
            path.resolve(__dirname, `../../../../static/${fileName}`),
            path.resolve(__dirname, `../../static/${fileName}`)
        ];

        try {
            for (const docPath of possiblePaths) {
                if (fs.existsSync(docPath)) {
                    const content = fs.readFileSync(docPath, 'utf-8');
                    if (docType === 'vjass') {
                        this.parseVjassDocs(content, symbols);
                    } else {
                        this.parseZincDocs(content, symbols);
                    }
                    break;
                }
            }
        } catch (error) {
            console.warn(`Failed to load ${fileName}:`, error);
        }

        return {
            type: docType,
            symbols,
            loadedAt: Date.now()
        };
    }

    /**
     * 解析 vjass.docs.txt 文件内容
     */
    private parseVjassDocs(content: string, symbols: Map<string, SymbolInfo>): void {
        const lines = content.split('\n');
        const functionPattern = /(GetTimeOfDay|SetTimeOfDay|GetRandomInt|GetRandomReal|BJDebugMsg)/i;
        const constantPattern = /(PI|E|DEBUG_MODE|MAX_PLAYERS|MAX_PLAYER_SLOTS)/i;

        for (const line of lines) {
            const trimmed = line.trim();
            const funcMatch = trimmed.match(functionPattern);
            const constMatch = trimmed.match(constantPattern);

            if (funcMatch && !symbols.has(funcMatch[1])) {
                symbols.set(funcMatch[1], {
                    description: 'vJASS 内置函数（来自 vjass.docs.txt）',
                    type: 'function'
                });
            }
            if (constMatch && !symbols.has(constMatch[1])) {
                symbols.set(constMatch[1], {
                    description: 'vJASS 内置常量（来自 vjass.docs.txt）',
                    type: 'constant'
                });
            }
        }
    }

    /**
     * 解析 zinc.docs.txt 文件内容（预留扩展）
     */
    private parseZincDocs(content: string, symbols: Map<string, SymbolInfo>): void {
        // zinc.docs.txt 目前暂无结构化符号解析，保留扩展点
        void content;
        void symbols;
    }
}
