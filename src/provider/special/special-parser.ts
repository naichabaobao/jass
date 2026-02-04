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
     * 检查是否包含废弃标记
     */
    protected isDeprecated(description?: string): boolean {
        if (!description) return false;
        return /deprecated|废弃|已废弃/i.test(description);
    }
}

