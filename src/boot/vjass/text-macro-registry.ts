/**
 * TextMacro 信息接口
 */
export interface TextMacroInfo {
    name: string;
    parameters: string[];
    body: string[];
    filePath: string;
    start: { line: number; position: number };
    end: { line: number; position: number };
}

/**
 * TextMacro 全局注册表（单例）
 * 管理所有文件中定义的 textmacro
 */
export class TextMacroRegistry {
    private static instance: TextMacroRegistry;
    private macros: Map<string, TextMacroInfo> = new Map();
    private fileMacros: Map<string, Set<string>> = new Map(); // filePath -> Set<macroName>
    
    private constructor() {
        // 私有构造函数，确保单例
    }
    
    /**
     * 获取单例实例
     */
    static getInstance(): TextMacroRegistry {
        if (!TextMacroRegistry.instance) {
            TextMacroRegistry.instance = new TextMacroRegistry();
        }
        return TextMacroRegistry.instance;
    }
    
    /**
     * 注册 textmacro
     * @param macro textmacro 信息
     */
    register(macro: TextMacroInfo): void {
        const key = macro.name.toLowerCase(); // 不区分大小写
        
        // 检查是否已存在同名宏（不同文件）
        const existing = this.macros.get(key);
        if (existing && existing.filePath !== macro.filePath) {
            // 警告：不同文件中定义了同名宏，后注册的会覆盖先注册的
            console.warn(
                `TextMacro '${macro.name}' is already defined in ${existing.filePath}, ` +
                `will be overridden by ${macro.filePath}`
            );
        }
        
        this.macros.set(key, macro);
        
        // 记录文件到宏的映射
        if (!this.fileMacros.has(macro.filePath)) {
            this.fileMacros.set(macro.filePath, new Set());
        }
        this.fileMacros.get(macro.filePath)!.add(macro.name);
    }
    
    /**
     * 查找 textmacro（不区分大小写）
     * @param name 宏名称
     * @returns textmacro 信息，如果不存在则返回 null
     */
    find(name: string): TextMacroInfo | null {
        return this.macros.get(name.toLowerCase()) || null;
    }
    
    /**
     * 检查 textmacro 是否存在
     * @param name 宏名称
     * @returns 是否存在
     */
    has(name: string): boolean {
        return this.macros.has(name.toLowerCase());
    }
    
    /**
     * 移除文件的所有 textmacro（文件删除时）
     * @param filePath 文件路径
     */
    unregisterFile(filePath: string): void {
        const macroNames = this.fileMacros.get(filePath);
        if (macroNames) {
            macroNames.forEach(name => {
                this.macros.delete(name.toLowerCase());
            });
            this.fileMacros.delete(filePath);
        }
    }
    
    /**
     * 更新文件的 textmacro（文件更新时）
     * @param filePath 文件路径
     * @param macros 新的 textmacro 列表
     */
    updateFile(filePath: string, macros: TextMacroInfo[]): void {
        // 先移除旧的
        this.unregisterFile(filePath);
        // 再注册新的
        macros.forEach(macro => this.register(macro));
    }
    
    /**
     * 获取所有 textmacro
     * @returns 所有 textmacro 信息数组
     */
    getAll(): TextMacroInfo[] {
        return Array.from(this.macros.values());
    }
    
    /**
     * 获取文件的所有 textmacro
     * @param filePath 文件路径
     * @returns textmacro 信息数组
     */
    getByFile(filePath: string): TextMacroInfo[] {
        const macroNames = this.fileMacros.get(filePath);
        if (!macroNames) {
            return [];
        }
        return Array.from(macroNames)
            .map(name => this.macros.get(name.toLowerCase()))
            .filter((macro): macro is TextMacroInfo => macro !== undefined);
    }
    
    /**
     * 清空所有注册的 textmacro
     */
    clear(): void {
        this.macros.clear();
        this.fileMacros.clear();
    }
    
    /**
     * 获取注册表统计信息
     */
    getStats(): { totalMacros: number; totalFiles: number } {
        return {
            totalMacros: this.macros.size,
            totalFiles: this.fileMacros.size
        };
    }
}

