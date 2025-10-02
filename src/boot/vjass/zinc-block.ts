import { SimpleError } from "./simple-error";

const ZincStartRegExp = /^\s*\/\/!\s+zinc\b/;
const ZincEndRegExp = /^\s*\/\/!\s+endzinc\b/;

/**
 * Zinc代码块类，用于存储zinc block的信息
 */
export class ZincBlock {
    startLine: number;
    endLine: number;
    content: string[];
    code: string;

    constructor(startLine: number, endLine: number, content: string[]) {
        this.startLine = startLine;
        this.endLine = endLine;
        this.content = content;
        this.code = content.join("\n");
    }

    /**
     * 获取zinc block的完整代码（包含标记）
     */
    getFullCode(): string {
        return `//! zinc\n${this.code}\n//! endzinc`;
    }
}

export interface ZincBlockCollection {
    blocks: ZincBlock[];
}

/**
 * 解析并移除zinc块，zinc块用//! zinc和//! endzinc标记
 * @param content 输入的代码内容
 * @param errorCollection 错误和警告收集器
 * @param zincBlockCollection zinc块收集器
 * @returns 处理后的代码内容，zinc块会被空行替换以保持行号一致
 */
export function parseAndRemoveZincBlock(
    content: string, 
    errorCollection: { errors: SimpleError[], warnings: any[] }, 
    zincBlockCollection: { blocks: ZincBlock[] }
): string {
    // 处理空内容
    if (!content) {
        return content;
    }
    
    const texts = content.split("\n");
    const result_lines: string[] = [];
    let in_zinc_block = false;
    let zinc_start_line = -1;
    let zinc_content: string[] = [];
    let unclosed_zinc_start = -1;
    
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        
        if (ZincStartRegExp.test(text)) {
            if (in_zinc_block) {
                // 嵌套的zinc块错误
                errorCollection.errors.push(new SimpleError(
                    { line: i, position: 0 }, 
                    { line: i, position: text.length }, 
                    `nested //! zinc block detected!`, 
                    `close the previous zinc block (started at line ${zinc_start_line + 1}) before starting a new one!`
                ));
                // 保存之前未闭合的zinc块
                if (zinc_start_line >= 0) {
                    const block = new ZincBlock(zinc_start_line, i - 1, zinc_content);
                    zincBlockCollection.blocks.push(block);
                }
            }
            // 开始新的zinc块
            in_zinc_block = true;
            zinc_start_line = i;
            zinc_content = [];
            unclosed_zinc_start = i;
            // 替换//! zinc行为空行
            result_lines.push("");
        } else if (ZincEndRegExp.test(text)) {
            if (!in_zinc_block) {
                // 没有对应的//! zinc
                errorCollection.errors.push(new SimpleError(
                    { line: i, position: 0 }, 
                    { line: i, position: text.length }, 
                    `unexpected //! endzinc without matching //! zinc!`, 
                    `add //! zinc before this line or remove this //! endzinc!`
                ));
            } else {
                // 保存zinc块
                const block = new ZincBlock(zinc_start_line, i, zinc_content);
                zincBlockCollection.blocks.push(block);
                in_zinc_block = false;
                zinc_start_line = -1;
                zinc_content = [];
                unclosed_zinc_start = -1;
            }
            // 替换//! endzinc行为空行
            result_lines.push("");
        } else if (in_zinc_block) {
            // zinc块内容
            zinc_content.push(text);
            // 替换zinc块内容为空行
            result_lines.push("");
        } else {
            // 保留普通代码行
            result_lines.push(text);
        }
    }
    
    // 检查未闭合的zinc块
    if (in_zinc_block && unclosed_zinc_start >= 0) {
        errorCollection.errors.push(new SimpleError(
            { line: unclosed_zinc_start, position: 0 }, 
            { line: unclosed_zinc_start, position: texts[unclosed_zinc_start].length }, 
            `unclosed //! zinc block!`, 
            `add //! endzinc to close this zinc block!`
        ));
        // 保存未闭合的zinc块
        const block = new ZincBlock(zinc_start_line, texts.length - 1, zinc_content);
        zincBlockCollection.blocks.push(block);
    }
    
    return result_lines.join("\n");
}

