import { TextMacroRegistry } from "./text-macro-registry";
import { SimpleError } from "./error";

/**
 * TextMacro 展开器
 * 用于展开 runtextmacro 调用
 */
export class TextMacroExpander {
    private registry: TextMacroRegistry;
    
    constructor(registry?: TextMacroRegistry) {
        this.registry = registry || TextMacroRegistry.getInstance();
    }
    
    /**
     * 展开 runtextmacro
     * @param name 宏名称
     * @param parameters 参数值列表
     * @param optional 是否为可选宏
     * @param location 调用位置（用于错误报告）
     * @returns 展开后的代码行数组，如果宏不存在且为可选则返回空数组
     * @throws 如果宏不存在且不是可选的，抛出错误
     */
    expand(
        name: string,
        parameters: string[],
        optional: boolean = false,
        location?: { line: number; position: number }
    ): string[] {
        const macro = this.registry.find(name);
        
        if (!macro) {
            if (optional) {
                return []; // 可选宏不存在时返回空
            }
            const locationStr = location 
                ? ` at line ${location.line + 1}, position ${location.position}`
                : '';
            throw new Error(`TextMacro '${name}' not found${locationStr}`);
        }
        
        // 检查参数数量
        if (parameters.length !== macro.parameters.length) {
            const locationStr = location 
                ? ` at line ${location.line + 1}, position ${location.position}`
                : '';
            throw new Error(
                `TextMacro '${name}' expects ${macro.parameters.length} parameters, ` +
                `but got ${parameters.length}${locationStr}`
            );
        }
        
        // 展开宏体：替换 $PARAM$ 为实际参数值
        return macro.body.map((line, lineIndex) => {
            let expanded = line;
            
            // 按参数顺序替换
            macro.parameters.forEach((paramName, paramIndex) => {
                const paramValue = parameters[paramIndex] || '';
                // 替换 $PARAMNAME$ 为参数值
                // 注意：使用全局替换，因为一个参数可能在行中出现多次
                const regex = new RegExp(`\\$${this.escapeRegex(paramName)}\\$`, 'g');
                expanded = expanded.replace(regex, paramValue);
            });
            
            return expanded;
        });
    }
    
    /**
     * 转义正则表达式特殊字符
     * @param str 要转义的字符串
     * @returns 转义后的字符串
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * 检查 textmacro 是否存在
     * @param name 宏名称
     * @returns 是否存在
     */
    exists(name: string): boolean {
        return this.registry.has(name);
    }
    
    /**
     * 获取 textmacro 的参数信息
     * @param name 宏名称
     * @returns 参数列表，如果宏不存在则返回 null
     */
    getParameters(name: string): string[] | null {
        const macro = this.registry.find(name);
        return macro ? macro.parameters : null;
    }
}

