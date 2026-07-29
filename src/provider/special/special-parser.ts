import * as fs from 'fs';
import * as path from 'path';

/**
 * 特殊文件字面量信息
 */
export interface SpecialLiteral {
    /** 字面量内容（不包含引号） */
    content: string;
    /** 字面量类型：string（双引号）、mark（单引号）、number（数字） */
    type: 'string' | 'mark' | 'number';
    /** 文件路径 */
    filePath: string;
    /** 行号（从0开始） */
    line: number;
    /** 列号（从0开始） */
    column: number;
    /** 描述信息（注释） */
    description?: string;
    /** 是否已废弃 */
    deprecated?: boolean;
}

/**
 * 特殊文件解析器基类
 */
export abstract class SpecialParser {
    /**
     * 解析文件并提取字面量
     */
    public abstract parse(filePath: string, content: string): SpecialLiteral[];

    /**
     * 获取字面量类型
     */
    protected abstract getLiteralType(): 'string' | 'mark' | 'number';

    /**
     * 提取行注释
     */
    protected extractLineComment(line: string): string | undefined {
        const commentMatch = line.match(/\/\/(.+)$/);
        return commentMatch ? commentMatch[1].trim() : undefined;
    }

    /**
     * 提取前置注释（向上查找连续的注释行）
     * @param lines 所有行
     * @param currentLineIndex 当前行索引（字面量所在行）
     * @returns 合并后的注释文本
     */
    protected extractLeadingComments(lines: string[], currentLineIndex: number): string | undefined {
        const commentLines: string[] = [];
        
        // 从当前行的上一行开始向上查找
        for (let i = currentLineIndex - 1; i >= 0; i--) {
            const trimmedLine = lines[i].trim();
            if (trimmedLine.startsWith('//')) {
                const commentText = trimmedLine.substring(2).trim();
                if (commentText) {
                    commentLines.unshift(commentText);
                }
            } else if (trimmedLine === '') {
                // 遇到空行，如果已经收集到注释则停止（注释块结束）
                if (commentLines.length > 0) {
                    break;
                }
                // 还没收集到注释，继续向上查找（跳过前导空行）
            } else {
                // 遇到非空非注释行，停止
                break;
            }
        }

        return commentLines.length > 0 ? commentLines.join('\n') : undefined;
    }

    /**
     * 检查是否包含废弃标记
     */
    protected isDeprecated(description?: string): boolean {
        if (!description) return false;
        return /deprecated|废弃|已废弃/i.test(description);
    }
}

