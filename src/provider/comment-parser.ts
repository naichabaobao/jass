/**
 * 注释解析器
 * 用于解析 statement 前面的注释，支持 JSDoc 风格的标签
 */

export interface ParsedComment {
    /** 描述文本（多行） */
    description: string[];
    /** 参数描述映射 */
    params: Map<string, string>;
    /** 返回值描述 */
    returns?: string;
    /** 是否已废弃 */
    deprecated: boolean;
}

/**
 * 解析注释文本
 * @param commentLines 注释行数组（不包含 // 前缀）
 * @returns 解析后的注释信息
 */
export function parseComment(commentLines: string[]): ParsedComment {
    const result: ParsedComment = {
        description: [],
        params: new Map(),
        returns: undefined,
        deprecated: false
    };

    for (const line of commentLines) {
        const trimmed = line.trim();
        
        // 解析 @param 标签
        const paramMatch = trimmed.match(/^@param\s+(\w+)\s+(.+)$/);
        if (paramMatch) {
            const paramName = paramMatch[1];
            const paramDesc = paramMatch[2];
            result.params.set(paramName, paramDesc);
            continue;
        }

        // 解析 @returns 标签
        const returnsMatch = trimmed.match(/^@returns?\s+(.+)$/);
        if (returnsMatch) {
            result.returns = returnsMatch[1];
            continue;
        }

        // 解析 @deprecated 标签
        if (trimmed === '@deprecated' || trimmed.startsWith('@deprecated ')) {
            result.deprecated = true;
            const deprecatedDesc = trimmed.replace(/^@deprecated\s*/, '').trim();
            if (deprecatedDesc) {
                result.description.push(`**Deprecated:** ${deprecatedDesc}`);
            } else {
                result.description.push('**Deprecated**');
            }
            continue;
        }

        // 普通描述文本
        if (trimmed) {
            result.description.push(trimmed);
        }
    }

    return result;
}

/**
 * 从文件内容中提取 statement 前面的注释
 * @param content 文件内容
 * @param statementLine 语句所在行号（0-based）
 * @returns 注释行数组（不包含 // 前缀）
 */
export function extractLeadingComments(content: string, statementLine: number): string[] {
    const lines = content.split(/\r?\n/);
    const comments: string[] = [];
    
    // 从 statement 行向上查找连续的注释
    for (let i = statementLine - 1; i >= 0; i--) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // 如果是空行，继续向上查找
        if (trimmed === '') {
            continue;
        }
        
        // 如果是单行注释，提取注释内容
        if (trimmed.startsWith('//')) {
            const commentContent = trimmed.substring(2).trim();
            // 跳过预处理器指令（//!）
            if (!commentContent.startsWith('!')) {
                comments.unshift(commentContent);
            } else {
                // 遇到预处理器指令，停止查找
                break;
            }
        } else {
            // 遇到非注释行，停止查找
            break;
        }
    }
    
    return comments;
}

/**
 * 将解析后的注释格式化为 Markdown
 * @param comment 解析后的注释
 * @returns Markdown 字符串
 */
export function formatCommentAsMarkdown(comment: ParsedComment): string {
    const parts: string[] = [];

    // 描述部分
    if (comment.description.length > 0) {
        parts.push(comment.description.join('\n\n'));
    }

    // 参数部分
    if (comment.params.size > 0) {
        const paramLines: string[] = [];
        comment.params.forEach((desc, name) => {
            paramLines.push(`- **\`${name}\`**: ${desc}`);
        });
        if (paramLines.length > 0) {
            parts.push('**Parameters:**\n' + paramLines.join('\n'));
        }
    }

    // 返回值部分
    if (comment.returns) {
        parts.push(`**Returns:** ${comment.returns}`);
    }

    return parts.join('\n\n');
}

