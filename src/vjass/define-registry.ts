import { Define } from './preprocess';
import * as path from 'path';

/**
 * Define 信息接口
 */
export interface DefineInfo {
    name: string;
    value: string;
    filePath: string;
    lineNumber: number;
    code: string; // 原始代码（包含多行）
}

/**
 * Define 全局注册表（单例）
 * 管理所有文件中定义的 #define 宏
 */
export class DefineRegistry {
    private static instance: DefineRegistry;
    private defines: Map<string, DefineInfo> = new Map();
    private fileDefines: Map<string, Set<string>> = new Map(); // filePath -> Set<defineName>
    
    private constructor() {
        // 私有构造函数，确保单例
    }
    
    /**
     * 获取单例实例
     */
    static getInstance(): DefineRegistry {
        if (!DefineRegistry.instance) {
            DefineRegistry.instance = new DefineRegistry();
        }
        return DefineRegistry.instance;
    }
    
    /**
     * 注册 #define 宏
     * @param defineInfo define 信息
     */
    register(defineInfo: DefineInfo): void {
        const key = defineInfo.name.toLowerCase(); // 不区分大小写
        
        // 检查是否已存在同名宏（不同文件）
        const existing = this.defines.get(key);
        if (existing && existing.filePath !== defineInfo.filePath) {
            // 警告：不同文件中定义了同名宏，后注册的会覆盖先注册的
            console.warn(
                `#define '${defineInfo.name}' is already defined in ${existing.filePath}, ` +
                `will be overridden by ${defineInfo.filePath}`
            );
        }
        
        this.defines.set(key, defineInfo);
        
        // 记录文件到宏的映射
        if (!this.fileDefines.has(defineInfo.filePath)) {
            this.fileDefines.set(defineInfo.filePath, new Set());
        }
        this.fileDefines.get(defineInfo.filePath)!.add(defineInfo.name);
    }
    
    /**
     * 查找 #define 宏（不区分大小写）
     * @param name 宏名称
     * @returns define 信息，如果不存在则返回 null
     */
    find(name: string): DefineInfo | null {
        return this.defines.get(name.toLowerCase()) || null;
    }
    
    /**
     * 检查 #define 宏是否存在
     * @param name 宏名称
     * @returns 是否存在
     */
    has(name: string): boolean {
        return this.defines.has(name.toLowerCase());
    }
    
    /**
     * 移除文件的所有 #define 宏（文件删除时）
     * @param filePath 文件路径
     */
    unregisterFile(filePath: string): void {
        const defineNames = this.fileDefines.get(filePath);
        if (defineNames) {
            defineNames.forEach(name => {
                this.defines.delete(name.toLowerCase());
            });
            this.fileDefines.delete(filePath);
        }
    }
    
    /**
     * 更新文件的 #define 宏（文件更新时）
     * @param filePath 文件路径
     * @param defines 新的 define 列表
     */
    updateFile(filePath: string, defines: Define[]): void {
        // 先移除旧的
        this.unregisterFile(filePath);
        // 再注册新的
        defines.forEach(define => {
            this.register({
                name: define.name,
                value: define.value,
                filePath: filePath,
                lineNumber: define.lineNumber,
                code: define.code
            });
        });
    }
    
    /**
     * 获取所有 #define 宏
     * @returns 所有 define 信息数组
     */
    getAll(): DefineInfo[] {
        return Array.from(this.defines.values());
    }
    
    /**
     * 获取文件的所有 #define 宏
     * @param filePath 文件路径
     * @returns define 信息数组
     */
    getByFile(filePath: string): DefineInfo[] {
        const defineNames = this.fileDefines.get(filePath);
        if (!defineNames) {
            return [];
        }
        return Array.from(defineNames)
            .map(name => this.defines.get(name.toLowerCase()))
            .filter((define): define is DefineInfo => define !== undefined);
    }
    
    /**
     * 清空所有注册的 #define 宏
     */
    clear(): void {
        this.defines.clear();
        this.fileDefines.clear();
    }
    
    /**
     * 获取注册表统计信息
     */
    getStats(): { totalDefines: number; totalFiles: number } {
        return {
            totalDefines: this.defines.size,
            totalFiles: this.fileDefines.size
        };
    }
}
