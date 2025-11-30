import { TextMacroRegistry, TextMacroInfo } from "./text-macro-registry";
import { SimpleError } from "./simple-error";
import { isLegalIdentifier, isVjassKeyword } from "./id";

/**
 * TextMacro 收集器
 * 用于从文件内容中提取 textmacro 定义
 */
export class TextMacroCollector {
    private registry: TextMacroRegistry;
    
    constructor(registry?: TextMacroRegistry) {
        this.registry = registry || TextMacroRegistry.getInstance();
    }
    
    /**
     * 从文件内容中收集所有 textmacro 定义
     * 不进行完整解析，只提取 textmacro 定义
     * @param filePath 文件路径
     * @param content 文件内容
     * @param collection 错误和警告收集器（可选）
     * @returns 收集到的 textmacro 信息数组
     */
    collectFromFile(
        filePath: string, 
        content: string,
        collection?: { errors: SimpleError[]; warnings: SimpleError[] }
    ): TextMacroInfo[] {
        const lines = content.split('\n');
        const macros: TextMacroInfo[] = [];
        let currentMacro: Partial<TextMacroInfo> | null = null;
        const errors = collection?.errors || [];
        const warnings = collection?.warnings || [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // 检查是否是 textmacro 开始
            if (/^\s*\/\/!\s+textmacro\b/i.test(line)) {
                // 如果之前有未关闭的 textmacro，报告错误
                if (currentMacro) {
                    errors.push(new SimpleError(
                        { line: i, position: 0 },
                        { line: i, position: line.length },
                        `textmacro does not support nesting!`,
                        `close previous textmacro '${currentMacro.name}' before starting a new one!`
                    ));
                }
                
                // 解析 textmacro 头部
                const match = line.match(/^\s*\/\/!\s+textmacro\s+(\w+)(?:\s+takes\s+([^]*))?/i);
                if (match) {
                    const name = match[1];
                    const takesStr = match[2] || '';
                    
                    // 验证名称
                    if (!name) {
                        errors.push(new SimpleError(
                            { line: i, position: 0 },
                            { line: i, position: line.length },
                            `textmacro name not declared!`,
                            `declare textmacro name!`
                        ));
                        continue;
                    }
                    
                    if (!isLegalIdentifier(name)) {
                        errors.push(new SimpleError(
                            { line: i, position: 0 },
                            { line: i, position: line.length },
                            `invalid identifier '${name}'!`,
                            `use a valid identifier for textmacro name!`
                        ));
                        continue;
                    }
                    
                    if (isVjassKeyword(name)) {
                        errors.push(new SimpleError(
                            { line: i, position: 0 },
                            { line: i, position: line.length },
                            `textmacro name '${name}' is a vjass keyword!`,
                            `rename textmacro name to a valid identifier!`
                        ));
                        continue;
                    }
                    
                    // 解析参数列表
                    const parameters: string[] = [];
                    if (takesStr.trim()) {
                        const hasTakes = takesStr.trimStart().startsWith("takes");
                        const newTakesStr = hasTakes 
                            ? takesStr.trimStart().substring(5).trim()
                            : takesStr.trim();
                        
                        if (newTakesStr) {
                            // 检查语法：参数应该用逗号分隔
                            if (newTakesStr.includes(' ') && !newTakesStr.includes(',')) {
                                const words = newTakesStr.split(/\s+/).filter(w => w.length > 0);
                                if (words.length > 1) {
                                    errors.push(new SimpleError(
                                        { line: i, position: 0 },
                                        { line: i, position: line.length },
                                        `malformed takes syntax! Parameters should be separated by commas.`,
                                        `change "takes ${newTakesStr}" to "takes ${words.join(', ')}"!`
                                    ));
                                }
                            }
                            
                            // 分割参数
                            const paramParts = newTakesStr.split(',').map(p => p.trim()).filter(p => p !== "");
                            parameters.push(...paramParts);
                            
                            // 验证参数
                            for (let j = 0; j < parameters.length; j++) {
                                const param = parameters[j];
                                if (!isLegalIdentifier(param)) {
                                    errors.push(new SimpleError(
                                        { line: i, position: 0 },
                                        { line: i, position: line.length },
                                        `invalid parameter identifier '${param}'!`,
                                        `use a valid identifier for textmacro parameter!`
                                    ));
                                }
                                if (isVjassKeyword(param)) {
                                    errors.push(new SimpleError(
                                        { line: i, position: 0 },
                                        { line: i, position: line.length },
                                        `parameter '${param}' is a vjass keyword!`,
                                        `rename parameter to a valid identifier!`
                                    ));
                                }
                                // 检查重复参数
                                if (parameters.slice(0, j).includes(param)) {
                                    errors.push(new SimpleError(
                                        { line: i, position: 0 },
                                        { line: i, position: line.length },
                                        `duplicate parameter name: ${param}!`,
                                        `rename duplicate parameter ${param} to a unique name!`
                                    ));
                                }
                            }
                        } else if (hasTakes) {
                            errors.push(new SimpleError(
                                { line: i, position: 0 },
                                { line: i, position: line.length },
                                `textmacro takes not declared!`,
                                `declare textmacro takes!`
                            ));
                        }
                    }
                    
                    // 警告：名称过长
                    if (name.length > 32) {
                        warnings.push(new SimpleError(
                            { line: i, position: 0 },
                            { line: i, position: line.length },
                            `textmacro name '${name}' is longer than 32 characters!`
                        ));
                    }
                    
                    currentMacro = {
                        name,
                        parameters,
                        body: [],
                        filePath,
                        start: { line: i, position: 0 },
                        end: { line: i, position: line.length }
                    };
                } else {
                    errors.push(new SimpleError(
                        { line: i, position: 0 },
                        { line: i, position: line.length },
                        `malformed //! textmacro syntax!`,
                        `use correct syntax: //! textmacro <name> [takes param1, param2, ...]!`
                    ));
                }
            }
            // 检查是否是 endtextmacro
            else if (/^\s*\/\/!\s+endtextmacro\b/i.test(line)) {
                if (currentMacro) {
                    // 检查空 body
                    if (currentMacro.body!.length === 0) {
                        warnings.push(new SimpleError(
                            { line: i, position: 0 },
                            { line: i, position: line.length },
                            `textmacro '${currentMacro.name}' has empty body!`
                        ));
                    }
                    
                    currentMacro.end = { line: i, position: line.length };
                    const macroInfo: TextMacroInfo = {
                        name: currentMacro.name!,
                        parameters: currentMacro.parameters!,
                        body: currentMacro.body!,
                        filePath: currentMacro.filePath!,
                        start: currentMacro.start!,
                        end: currentMacro.end!
                    };
                    macros.push(macroInfo);
                    this.registry.register(macroInfo);
                    currentMacro = null;
                } else {
                    errors.push(new SimpleError(
                        { line: i, position: 0 },
                        { line: i, position: line.length },
                        `illegal end tag!`,
                        `remove //! endtextmacro tag!`
                    ));
                }
            }
            // 收集 body 内容
            else if (currentMacro) {
                currentMacro.body!.push(line);
            }
        }
        
        // 检查是否有未关闭的 textmacro
        if (currentMacro) {
            errors.push(new SimpleError(
                currentMacro.start!,
                currentMacro.end || { line: lines.length - 1, position: 0 },
                `unclosed //! textmacro '${currentMacro.name}'!`,
                `add '//! endtextmacro' to close the textmacro block.`
            ));
        }
        
        return macros;
    }
    
    /**
     * 批量收集多个文件的 textmacro
     * @param files 文件列表，每个元素包含 filePath 和 content
     * @param collection 错误和警告收集器（可选）
     * @returns 所有收集到的 textmacro 信息数组
     */
    collectFromFiles(
        files: Array<{ filePath: string; content: string }>,
        collection?: { errors: SimpleError[]; warnings: SimpleError[] }
    ): TextMacroInfo[] {
        const allMacros: TextMacroInfo[] = [];
        
        for (const file of files) {
            const macros = this.collectFromFile(file.filePath, file.content, collection);
            allMacros.push(...macros);
        }
        
        return allMacros;
    }
}

