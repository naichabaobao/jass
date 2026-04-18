/**
 * vjass标识符工具类
 *
 * vjass标识符规范：
 * - 只能包含字母、数字、下划线 [_a-zA-Z0-9]
 * - 必须以字母开头 [a-zA-Z]
 * - 不能为空
 * - 区分大小写
 */

/**
 * 检查字符串是否为合法的vjass标识符
 * @param identifier 要检查的字符串
 * @returns 是否为合法标识符
 */
export function isValidIdentifier(identifier: string): boolean {
    if (!identifier || identifier.length === 0) {
        return false;
    }
    // vjass标识符规则：必须以字母开头，后面可以是字母、数字、下划线
    // 根据用户要求：[_a-zA-Z0-9]+ 只能以字母开头
    return /^[a-zA-Z][_a-zA-Z0-9]*$/.test(identifier);
}

/**
 * 检查字符串是否为合法的vjass标识符（兼容旧函数名）
 * @param identifier 要检查的字符串
 * @returns 是否为合法标识符
 */
export function isLegalIdentifier(identifier: string): boolean {
    return isValidIdentifier(identifier);
}

/**
 * 检查字符是否可以作为标识符的开始字符
 * @param char 要检查的字符
 * @returns 是否可以作为标识符开始
 */
export function isIdentifierStart(char: string): boolean {
    return /[a-zA-Z]/.test(char);
}

/**
 * 检查字符是否可以作为标识符的后续字符
 * @param char 要检查的字符
 * @returns 是否可以作为标识符后续字符
 */
export function isIdentifierPart(char: string): boolean {
    return /[_a-zA-Z0-9]/.test(char);
}

/**
 * 从字符串中提取所有可能的标识符
 * @param text 要分析的文本
 * @returns 找到的标识符数组
 */
export function extractIdentifiers(text: string): string[] {
    const identifiers: string[] = [];
    const regex = /[a-zA-Z][_a-zA-Z0-9]*/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        identifiers.push(match[0]);
    }
    return identifiers;
}

/**
 * 检查标识符是否为vjass关键字
 * @param identifier 要检查的标识符
 * @returns 是否为关键字
 */
export function isVjassKeyword(identifier: string): boolean {
    const keywords = new Set([
        // jass基础关键字
        'function', 'endfunction', 'takes', 'returns', 'nothing',
        'local', 'set', 'call', 'if', 'then', 'else', 'elseif', 'endif',
        'loop', 'endloop', 'exitwhen', 'return', 'and', 'or', 'not',
        'true', 'false', 'null', 'globals', 'endglobals', 'constant',
        'native', 'type', 'extends', 'array',
        // vjass扩展关键字
        'library', 'endlibrary', 'scope', 'endscope', 'private', 'public',
        'static', 'struct', 'endstruct', 'method', 'endmethod',
        'interface', 'endinterface', 'implement', 'optional',
        'module', 'endmodule', 'implement', 'requires',
        'initializer', 'finalizer', 'uses', 'needs',
        'debug', 'hook', 'operator', 'this', 'super',
        // 预处理器关键字
        'textmacro', 'endtextmacro', 'runtextmacro',
        'zinc', 'endzinc', 'novjass', 'endnovjass',
        'inject', 'endinject'
    ]);
    return keywords.has(identifier.toLowerCase());
}

/**
 * 生成唯一的标识符名称
 * @param baseName 基础名称
 * @param existingNames 已存在的名称集合
 * @param suffix 后缀模式，默认为数字
 * @returns 唯一的标识符名称
 */
export function generateUniqueIdentifier(baseName: string, existingNames: Set<string>, suffix: 'number' | 'letter' = 'number'): string {
    if (!isValidIdentifier(baseName)) {
        throw new Error(`Invalid base name: ${baseName}`);
    }
    if (!existingNames.has(baseName)) {
        return baseName;
    }
    let counter = 1;
    let uniqueName: string;
    if (suffix === 'number') {
        do {
            uniqueName = `${baseName}${counter}`;
            counter++;
        } while (existingNames.has(uniqueName));
    } else {
        // 使用字母后缀 a, b, c, ..., z, aa, ab, ...
        let suffixStr = '';
        do {
            suffixStr = generateLetterSuffix(counter);
            uniqueName = `${baseName}${suffixStr}`;
            counter++;
        } while (existingNames.has(uniqueName));
    }
    return uniqueName;
}

/**
 * 生成字母后缀 (a, b, c, ..., z, aa, ab, ...)
 */
function generateLetterSuffix(n: number): string {
    let result = '';
    while (n > 0) {
        n--;
        result = String.fromCharCode(97 + (n % 26)) + result;
        n = Math.floor(n / 26);
    }
    return result;
}

/**
 * 规范化标识符名称（移除非法字符，确保以字母开头）
 * @param name 原始名称
 * @param prefix 如果不以字母开头时添加的前缀
 * @returns 规范化后的标识符
 */
export function normalizeIdentifier(name: string, prefix: string = 'id'): string {
    if (!name) {
        return prefix;
    }
    // 移除所有非法字符，只保留字母、数字、下划线
    let normalized = name.replace(/[^_a-zA-Z0-9]/g, '');
    // 如果为空或不以字母开头，添加前缀
    if (!normalized || !isIdentifierStart(normalized[0])) {
        normalized = prefix + normalized;
    }
    // 确保前缀本身是合法的
    if (!isValidIdentifier(prefix)) {
        throw new Error(`Invalid prefix: ${prefix}`);
    }
    return normalized;
}

/**
 * 检查两个标识符是否相等（vjass区分大小写）
 * @param id1 第一个标识符
 * @param id2 第二个标识符
 * @returns 是否相等
 */
export function identifiersEqual(id1: string, id2: string): boolean {
    return id1 === id2; // vjass区分大小写
}

/**
 * 在文本中查找标识符的所有位置
 * @param text 要搜索的文本
 * @param identifier 要查找的标识符
 * @returns 位置信息数组
 */
export function findIdentifierPositions(text: string, identifier: string): Array<{
    start: number;
    end: number;
    line: number;
    column: number;
}> {
    const positions: Array<{
        start: number;
        end: number;
        line: number;
        column: number;
    }> = [];
    if (!isValidIdentifier(identifier)) {
        return positions;
    }
    const lines = text.split('\n');
    let globalOffset = 0;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const regex = new RegExp(`\\b${escapeRegExp(identifier)}\\b`, 'g');
        let match;
        while ((match = regex.exec(line)) !== null) {
            positions.push({
                start: globalOffset + match.index,
                end: globalOffset + match.index + identifier.length,
                line: lineIndex,
                column: match.index
            });
        }
        globalOffset += line.length + 1; // +1 for newline character
    }
    return positions;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 标识符相关的常量
 */
export const IdentifierConstants = {
    /** 标识符最大长度（建议值） */
    MAX_LENGTH: 255,
    /** 标识符最小长度 */
    MIN_LENGTH: 1,
    /** 标识符正则表达式 */
    REGEX: /^[a-zA-Z][_a-zA-Z0-9]*$/,
    /** 标识符开始字符正则表达式 */
    START_CHAR_REGEX: /[a-zA-Z]/,
    /** 标识符后续字符正则表达式 */
    PART_CHAR_REGEX: /[_a-zA-Z0-9]/
};
