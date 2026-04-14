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
    /** 版本信息 */
    version?: string;
    /** 版本信息 */
    since?: string;
    /** 参考链接/符号 */
    see: string[];
    /** 示例代码/说明 */
    examples: string[];
    /** Provider 信息（可多行） */
    providers: string[];
    /** 是否已废弃 */
    deprecated: boolean;
    /** 废弃说明 */
    deprecatedMessage?: string;
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
        version: undefined,
        since: undefined,
        see: [],
        examples: [],
        providers: [],
        deprecated: false,
        deprecatedMessage: undefined
    };

    let currentTag: 'description' | 'param' | 'returns' | 'provider' | 'deprecated' | 'example' | 'see' | 'since' | 'version' = 'description';
    let currentParamName: string | null = null;

    for (const line of commentLines) {
        const normalizedLine = normalizeCommentLine(line);
        const trimmed = normalizedLine.trim();

        if (!trimmed) {
            continue;
        }
        
        // 解析 @param 标签（兼容 JSDoc 风格：@param {type} name desc）
        const paramMatch = trimmed.match(/^@param\s+(?:\{[^}]+\}\s+)?(\w+)(?:\s*-\s*|\s+)?(.+)?$/);
        if (paramMatch) {
            const paramName = paramMatch[1];
            const paramDesc = (paramMatch[2] || '').trim();
            result.params.set(paramName, paramDesc);
            currentTag = 'param';
            currentParamName = paramName;
            continue;
        }

        // 解析 @returns 标签
        const returnsMatch = trimmed.match(/^@returns?\s+(.+)$/);
        if (returnsMatch) {
            result.returns = returnsMatch[1];
            currentTag = 'returns';
            currentParamName = null;
            continue;
        }

        // 解析 @provider 标签
        const providerMatch = trimmed.match(/^@provider\s+(.+)$/);
        if (providerMatch) {
            result.providers.push(providerMatch[1].trim());
            currentTag = 'provider';
            currentParamName = null;
            continue;
        }

        // 解析 @version 标签
        const versionMatch = trimmed.match(/^@version\s+(.+)$/);
        if (versionMatch) {
            result.version = versionMatch[1].trim();
            currentTag = 'version';
            currentParamName = null;
            continue;
        }

        // 解析 @since 标签
        const sinceMatch = trimmed.match(/^@since\s+(.+)$/);
        if (sinceMatch) {
            result.since = sinceMatch[1].trim();
            currentTag = 'since';
            currentParamName = null;
            continue;
        }

        // 解析 @see 标签
        const seeMatch = trimmed.match(/^@see\s+(.+)$/);
        if (seeMatch) {
            result.see.push(seeMatch[1].trim());
            currentTag = 'see';
            currentParamName = null;
            continue;
        }

        // 解析 @example 标签
        const exampleMatch = trimmed.match(/^@example\s*(.*)$/);
        if (exampleMatch) {
            const exampleText = (exampleMatch[1] || '').trim();
            if (exampleText) {
                result.examples.push(exampleText);
            }
            currentTag = 'example';
            currentParamName = null;
            continue;
        }

        // 解析 @deprecated 标签
        if (trimmed === '@deprecated' || trimmed.startsWith('@deprecated ')) {
            result.deprecated = true;
            const deprecatedDesc = trimmed.replace(/^@deprecated\s*/, '').trim();
            result.deprecatedMessage = deprecatedDesc || undefined;
            currentTag = 'deprecated';
            currentParamName = null;
            continue;
        }

        // 续行处理（支持 JSDoc 多行标签）
        if (currentTag === 'param' && currentParamName) {
            const prev = result.params.get(currentParamName) || '';
            result.params.set(currentParamName, prev ? `${prev} ${trimmed}` : trimmed);
            continue;
        }
        if (currentTag === 'returns') {
            result.returns = result.returns ? `${result.returns} ${trimmed}` : trimmed;
            continue;
        }
        if (currentTag === 'provider' && result.providers.length > 0) {
            const lastIndex = result.providers.length - 1;
            result.providers[lastIndex] = `${result.providers[lastIndex]} ${trimmed}`;
            continue;
        }
        if (currentTag === 'deprecated') {
            result.deprecatedMessage = result.deprecatedMessage
                ? `${result.deprecatedMessage} ${trimmed}`
                : trimmed;
            continue;
        }
        if (currentTag === 'example') {
            if (result.examples.length === 0) {
                result.examples.push(trimmed);
            } else {
                const lastIndex = result.examples.length - 1;
                result.examples[lastIndex] = `${result.examples[lastIndex]}\n${trimmed}`;
            }
            continue;
        }
        if (currentTag === 'see' && result.see.length > 0) {
            const lastIndex = result.see.length - 1;
            result.see[lastIndex] = `${result.see[lastIndex]} ${trimmed}`;
            continue;
        }
        if (currentTag === 'since') {
            result.since = result.since ? `${result.since} ${trimmed}` : trimmed;
            continue;
        }
        if (currentTag === 'version') {
            result.version = result.version ? `${result.version} ${trimmed}` : trimmed;
            continue;
        }

        // 普通描述文本
        result.description.push(trimmed);
        currentTag = 'description';
        currentParamName = null;
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
        
        // 空行会中断前导注释关联，避免跨段误绑定注释
        if (trimmed === '') {
            break;
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
        } else if (trimmed.endsWith('*/')) {
            // JSDoc/块注释：向上找到开始行
            const blockLines: string[] = [];
            let startIndex = i;
            let foundStart = false;

            for (let j = i; j >= 0; j--) {
                const blockLine = lines[j];
                blockLines.unshift(blockLine);
                startIndex = j;

                const blockTrimmed = blockLine.trim();
                if (blockTrimmed.startsWith('/**') || blockTrimmed.startsWith('/*')) {
                    foundStart = true;
                    break;
                }
            }

            if (!foundStart) {
                break;
            }

            const normalizedBlockLines = normalizeBlockCommentLines(blockLines);
            if (normalizedBlockLines.length > 0) {
                comments.unshift(...normalizedBlockLines);
            }

            i = startIndex;
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

    // 废弃信息（优先展示）
    if (comment.deprecated) {
        const deprecatedText = comment.deprecatedMessage
            ? `**Deprecated:** ${comment.deprecatedMessage}`
            : '**Deprecated**';
        parts.push(`~~${deprecatedText}~~`);
    }

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

    // since/version 兼容部分：
    // 优先使用 @since；若仅有 @version，则按 Since 展示（兼容旧写法）
    const sinceText = comment.since || comment.version;
    if (sinceText) {
        parts.push(`**Since:** ${sinceText}`);
    }

    // see 部分
    if (comment.see.length > 0) {
        const seeLines = comment.see.map((see) => `- ${see}`);
        parts.push('**See Also:**\n' + seeLines.join('\n'));
    }

    // provider 部分
    if (comment.providers.length > 0) {
        const providerLines = comment.providers.map((provider) => `- \`${provider}\``);
        parts.push('**Providers:**\n' + providerLines.join('\n'));
    }

    // example 部分
    if (comment.examples.length > 0) {
        const exampleParts = comment.examples.map((example) => {
            if (example.includes('\n')) {
                return `\`\`\`jass\n${example}\n\`\`\``;
            }
            return `\`${example}\``;
        });
        parts.push('**Examples:**\n' + exampleParts.join('\n'));
    }

    return parts.join('\n\n');
}

function normalizeCommentLine(line: string): string {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
        return trimmed.substring(2).trim();
    }
    if (trimmed.startsWith('*')) {
        return trimmed.substring(1).trim();
    }
    return trimmed;
}

function normalizeBlockCommentLines(blockLines: string[]): string[] {
    const result: string[] = [];

    for (let idx = 0; idx < blockLines.length; idx++) {
        const rawLine = blockLines[idx].trim();

        // 跳过起始和结束标记
        if (idx === 0 && (rawLine.startsWith('/**') || rawLine.startsWith('/*'))) {
            const inline = rawLine
                .replace(/^\/\*\*?/, '')
                .replace(/\*\/$/, '')
                .trim();
            if (inline) {
                result.push(normalizeCommentLine(inline));
            }
            continue;
        }
        if (idx === blockLines.length - 1 && rawLine.endsWith('*/')) {
            const inline = rawLine.replace(/\*\/$/, '').trim();
            if (inline && inline !== '*') {
                result.push(normalizeCommentLine(inline));
            }
            continue;
        }

        const normalized = normalizeCommentLine(rawLine);
        if (normalized) {
            result.push(normalized);
        }
    }

    return result;
}

