/**
 * 宏定义类，用于表示C++预处理宏
 * 包含宏的类型、内容、位置信息和嵌套结构
 */
export class WaveMacro {
    // 宏的参数列表（仅用于define类型）
    private _parameters: string[] = [];
    // 宏的纯名称（不包含参数）
    private _name: string = '';

    constructor(
        // 宏的类型：define(定义)、include(包含)、ifdef(如果已定义)等
        public type: 'define' | 'include' | 'ifdef' | 'ifndef' | 'endif' | 'pragma' | 'undef' | 'error' | 'warning' | 'if' | 'elif' | 'else',
        // 宏的完整内容
        public content: string,
        // 宏所在的行号（从1开始）
        public lineNumber: number,
        // 宏的起始列位置
        public startColumn: number,
        // 宏的结束列位置
        public endColumn: number,
        // 是否为多行宏（使用\连接）
        public isMultiline: boolean = false,
        // 父宏（用于嵌套结构）
        public parent?: WaveMacro,
        // 子宏列表（用于嵌套结构）
        public children: WaveMacro[] = [],
        // 宏是否启用（用于条件编译）
        public isEnabled: boolean = true
    ) {
        // 如果是define类型，解析名称和参数
        if (this.type === 'define') {
            this._parseNameAndParameters();
        }
    }

    /**
     * 解析宏的名称和参数
     */
    private _parseNameAndParameters(): void {
        if (this.type !== 'define') return;

        // 移除开头的 #define 和空白字符
        const content = this.content.replace(/^\s*#\s*define\s+/, '');
        
        // 提取宏名称和参数，支持名称和左括号之间没有空格的情况
        const match = content.match(/^(\w+)(?:\s*\(([^)]*)\))?\s*(.*)/);
        if (match) {
            // 提取宏名称
            this._name = match[1];
            
            // 提取参数列表，处理参数中可能存在的空格
            if (match[2]) {
                this._parameters = match[2]
                    .split(',')
                    .map(p => p.trim())
                    .filter(p => p);
            } else {
                this._parameters = [];
            }
        } else {
            // 如果没有匹配到有效的宏名称，设置为空字符串
            this._name = '';
            this._parameters = [];
        }
    }

    /**
     * 获取宏的名称（不包含参数）
     * @returns 宏的名称
     */
    getName(): string {
        return this._name || '';
    }

    /**
     * 获取宏的参数列表
     * @returns 参数列表，如果不是带参数的宏则返回空数组
     */
    getParameters(): string[] {
        return this._parameters || [];
    }

    /**
     * 获取宏的定义值（不包含名称和参数）
     * @returns 宏的定义值
     */
    getValue(): string {
        if (this.type !== 'define') return '';
        
        // 移除开头的 #define 和空白字符
        const content = this.content.replace(/^\s*#\s*define\s+/, '');
        
        // 提取宏名称、参数和值，支持名称和左括号之间没有空格的情况
        const match = content.match(/^(\w+)(?:\s*\(([^)]*)\))?\s*([\s\S]*)/);
        if (match) {
            // 对于多行宏，保留所有行，去除每行末尾的反斜杠和多余空白
            if (this.isMultiline) {
                return match[3]
                    .split('\n')
                    .map(line => line.replace(/\\\s*$/, '').trimEnd())
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
            // 对于单行宏，只返回第一行
            return match[3].split('\n')[0].trim();
        }
        
        return '';
    }

    /**
     * 返回宏的原始代码
     * @returns 宏的原始代码字符串
     */
    getOriginalCode(): string {
        return this.content || '';
    }

    /**
     * 将宏转换为字符串表示
     * @param indent 缩进级别，用于格式化嵌套结构
     * @returns 格式化的字符串表示
     */
    toString(indent: number = 0): string {
        const indentStr = '  '.repeat(indent);
        const status = this.isEnabled ? '启用' : '禁用';
        const multiline = this.isMultiline ? '多行' : '单行';
        const parentInfo = this.parent ? `父宏: ${this.parent.type}@${this.parent.lineNumber}` : '无父宏';
        
        let result = `${indentStr}${this.type}@${this.lineNumber} [${status}, ${multiline}, ${parentInfo}]\n`;
        result += `${indentStr}  内容: ${this.content}\n`;
        result += `${indentStr}  位置: 第${this.lineNumber}行, 列${this.startColumn}-${this.endColumn}\n`;
        
        // 添加宏名称和参数信息
        if (this.type === 'define') {
            const name = this.getName();
            if (name) {
                result += `${indentStr}  名称: ${name}\n`;
                const params = this.getParameters();
                if (params.length > 0) {
                    result += `${indentStr}  参数: ${params.join(', ')}\n`;
                }
                const value = this.getValue();
                if (value) {
                    result += `${indentStr}  值: ${value}\n`;
                }
            }
        }
        
        // 添加子宏信息
        if (this.children.length > 0) {
            result += `${indentStr}  子宏:\n`;
            for (const child of this.children) {
                result += child.toString(indent + 2);
            }
        }
        
        return result;
    }
}

/**
 * 宏错误类，用于表示宏处理过程中的错误
 */
export class WaveMacroError {
    constructor(
        // 错误所在的行号
        public readonly line: number,
        // 错误信息
        public readonly message: string,
        // 错误所在的列位置
        public readonly column: number,
        // 错误的严重程度
        public readonly severity: 'error' | 'warning' | 'info' = 'error',
        // 错误代码
        public readonly code?: string
    ) {}
}

/**
 * 计算条件表达式的值
 * @param condition 条件表达式字符串
 * @param definedMacros 已定义的宏集合
 * @returns 条件表达式的布尔值结果
 */
function evaluateCondition(condition: string, definedMacros: Set<string>): boolean {
    if (!condition) return false;
    condition = condition.trim();
    // 处理 defined() 操作符
    condition = condition.replace(/defined\s*\(\s*(\w+)\s*\)/g, (_, macro) => {
        return definedMacros.has(macro) ? '1' : '0';
    });
    // 处理 defined 宏（不带括号）
    condition = condition.replace(/defined\s+(\w+)/g, (_, macro) => {
        return definedMacros.has(macro) ? '1' : '0';
    });
    // 替换所有宏名为 1 或 0
    condition = condition.replace(/\b(\w+)\b/g, (m, macro) => {
        if (/^(\d+)$/.test(macro)) return macro; // 保留数字
        return definedMacros.has(macro) ? '1' : '0';
    });
    try {
        // eslint-disable-next-line no-new-func
        return !!new Function(`return (${condition})`)();
    } catch {
        return false;
    }
}

/**
 * 解析和处理C++预处理宏
 * @param content 要处理的源代码内容
 * @param definedMacros 已定义的宏集合
 * @returns 处理结果，包含处理后的内容、宏列表、错误信息和根宏列表
 */
export function replace_wave_macro(content: string, definedMacros: Set<string> = new Set()): {
    content: string,
    macros: WaveMacro[],
    errors: WaveMacroError[],
    rootMacros: WaveMacro[]
} {
    // 处理空输入
    if (!content) {
        return {
            content: '',
            macros: [],
            errors: [],
            rootMacros: []
        };
    }

    // 将输入内容分割成行
    const lines = content.split('\n');
    const macros: WaveMacro[] = [];        // 存储所有找到的宏
    const errors: WaveMacroError[] = [];   // 存储处理过程中的错误
    const newLines: string[] = [];         // 存储处理后的内容
    const rootMacros: WaveMacro[] = [];    // 存储顶层的宏（没有父宏的宏）
    const macroStack: WaveMacro[] = [];    // 用于处理宏的嵌套结构

    // 支持的宏类型及其对应的正则表达式
    const macroPatterns = [
        { type: 'define', pattern: /^\s*#\s*define\b/ },      // #define 宏定义
        { type: 'include', pattern: /^\s*#\s*include\b/ },    // #include 文件包含
        { type: 'ifdef', pattern: /^\s*#\s*ifdef\b/ },        // #ifdef 如果已定义
        { type: 'ifndef', pattern: /^\s*#\s*ifndef\b/ },      // #ifndef 如果未定义
        { type: 'if', pattern: /^\s*#\s*if\b/ },              // #if 条件编译
        { type: 'elif', pattern: /^\s*#\s*elif\b/ },          // #elif 否则如果
        { type: 'else', pattern: /^\s*#\s*else\b/ },          // #else 否则
        { type: 'endif', pattern: /^\s*#\s*endif\b/ },        // #endif 结束条件编译
        { type: 'pragma', pattern: /^\s*#\s*pragma\b/ },      // #pragma 编译器指令
        { type: 'undef', pattern: /^\s*#\s*undef\b/ },        // #undef 取消宏定义
        { type: 'error', pattern: /^\s*#\s*error\b/ },        // #error 编译错误
        { type: 'warning', pattern: /^\s*#\s*warning\b/ }     // #warning 编译警告
    ];

    // 逐行处理源代码
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line) {
            newLines.push('');
            i++;
            continue;
        }
        const trimmedLine = line.trim();
        let isMacro = false;
        let isMultiline = false;
        let macroContent = trimmedLine;
        let currentIndex = i;
        let currentLine = line;
        let endColumn = line.length;

        // 添加安全检查，防止无限循环
        let multilineCount = 0;
        const MAX_MULTILINE = 1000; // 设置一个合理的最大行数限制

        // 处理多行宏（以\结尾的行）
        while (currentLine.trimEnd().endsWith('\\') && currentIndex + 1 < lines.length && multilineCount < MAX_MULTILINE) {
            isMultiline = true;
            currentIndex++;
            currentLine = lines[currentIndex];
            if (!currentLine) {
                errors.push(new WaveMacroError(
                    i + 1,
                    'Unexpected empty line in multiline macro',
                    endColumn,
                    'error',
                    'EMPTY_LINE_IN_MACRO'
                ));
                break;
            }
            macroContent += '\n' + currentLine;
            endColumn = currentLine.length;
            multilineCount++;
        }

        // 如果超过最大行数限制，记录错误并继续处理
        if (multilineCount >= MAX_MULTILINE) {
            errors.push(new WaveMacroError(
                i + 1,
                'Macro definition too long (exceeds 1000 lines)',
                line.indexOf('#'),
                'error',
                'MACRO_TOO_LONG'
            ));
            i = currentIndex;
            continue;
        }

        for (const { type, pattern } of macroPatterns) {
            if (pattern.test(line)) {
                const startColumn = line.indexOf('#');
                if (startColumn === -1) {
                    errors.push(new WaveMacroError(
                        i + 1,
                        'Invalid macro format: missing #',
                        0,
                        'error',
                        'INVALID_MACRO_FORMAT'
                    ));
                    newLines.push(line);
                    i++;
                    continue;
                }

                const macro = new WaveMacro(
                    type as any,
                    macroContent,
                    i + 1,
                    startColumn,
                    endColumn,
                    isMultiline
                );

                // 处理不同类型的宏
                try {
                    if (type === 'if' || type === 'ifdef' || type === 'ifndef') {
                        const condition = macroContent.substring(macroContent.indexOf(type) + type.length).trim();
                        if (!condition) {
                            errors.push(new WaveMacroError(
                                i + 1,
                                `Missing condition in ${type} directive`,
                                startColumn + type.length,
                                'error',
                                'MISSING_CONDITION'
                            ));
                        }
                        macro.isEnabled = evaluateCondition(condition, definedMacros);
                        if (macroStack.length > 0) {
                            const parent = macroStack[macroStack.length - 1];
                            macro.parent = parent;
                            parent.children.push(macro);
                            if (!parent.isEnabled) macro.isEnabled = false;
                        } else {
                            rootMacros.push(macro);
                        }
                        macroStack.push(macro);
                    } else if (type === 'define') {
                        const defineContent = macroContent.substring(macroContent.indexOf('define') + 6).trim();
                        if (!defineContent) {
                            errors.push(new WaveMacroError(
                                i + 1,
                                'Invalid #define: missing identifier',
                                startColumn + 7,
                                'error',
                                'MISSING_MACRO_IDENTIFIER'
                            ));
                        } else {
                            const [name] = defineContent.split(/\s+/);
                            if (name) {
                                if (definedMacros.has(name)) {
                                    errors.push(new WaveMacroError(
                                        i + 1,
                                        `Macro '${name}' is already defined`,
                                        startColumn + 7,
                                        'warning',
                                        'MACRO_REDEFINED'
                                    ));
                                }
                                definedMacros.add(name);
                                macro.isEnabled = true;
                            }
                        }
                    } else if (type === 'include') {
                        const includeContent = macroContent.substring(macroContent.indexOf('include') + 7).trim();
                        if (!includeContent) {
                            errors.push(new WaveMacroError(
                                i + 1,
                                'Invalid #include: missing filename',
                                startColumn + 8,
                                'error',
                                'MISSING_INCLUDE_FILE'
                            ));
                        } else if (!/^[<"].*[>"]$/.test(includeContent)) {
                            errors.push(new WaveMacroError(
                                i + 1,
                                'Invalid #include: filename must be enclosed in <> or ""',
                                startColumn + 8,
                                'error',
                                'INVALID_INCLUDE_FORMAT'
                            ));
                        }
                    } else if (type === 'error') {
                        const errorContent = macroContent.substring(macroContent.indexOf('error') + 5).trim();
                        errors.push(new WaveMacroError(
                            i + 1,
                            errorContent || 'Error directive',
                            startColumn + 6,
                            'error',
                            'USER_ERROR'
                        ));
                    } else if (type === 'warning') {
                        const warningContent = macroContent.substring(macroContent.indexOf('warning') + 7).trim();
                        errors.push(new WaveMacroError(
                            i + 1,
                            warningContent || 'Warning directive',
                            startColumn + 8,
                            'warning',
                            'USER_WARNING'
                        ));
                    }
                } catch (error: any) {
                    errors.push(new WaveMacroError(
                        i + 1,
                        `Error processing macro: ${error.message}`,
                        startColumn,
                        'error',
                        'MACRO_PROCESSING_ERROR'
                    ));
                }

                macros.push(macro);
                for (let j = i; j <= currentIndex; j++) newLines.push('');
                i = currentIndex;
                isMacro = true;
                break;
            }
        }
        if (!isMacro) newLines.push(line);
        i++;
    }

    // 检查是否有未闭合的if/ifdef/ifndef
    if (macroStack.length > 0) {
        const lastMacro = macroStack[macroStack.length - 1];
        if (lastMacro) {
            errors.push(new WaveMacroError(
                lastMacro.lineNumber,
                `Unclosed ${lastMacro.type} block`,
                lastMacro.startColumn,
                'error',
                'UNCLOSED_MACRO_BLOCK'
            ));
        }
    }

    return {
        content: newLines.join('\n'),
        macros,
        errors,
        rootMacros
    };
}

// 测试用例
function runTests() {
    let passed = 0;
    let failed = 0;
    const totalTests = 15;
    const totalAssertions = 62; // 总断言数

    function assert(condition: boolean, message: string) {
        if (condition) {
            console.log(`✓ ${message}`);
            passed++;
        } else {
            console.log(`✗ ${message}`);
            failed++;
        }
    }

    // 测试用例1：基本宏定义
    console.log('\n测试用例1：基本宏定义');
    const test1 = replace_wave_macro('#define MAX 100');
    assert(test1.macros.length === 1, '应该找到1个宏');
    assert(test1.macros[0].type === 'define', '宏类型应该是define');
    assert(test1.macros[0].getName() === 'MAX', '宏名称应该是MAX');
    assert(test1.macros[0].getValue() === '100', '宏值应该是100');

    // 测试用例2：多行宏
    console.log('\n测试用例2：多行宏');
    const test2 = replace_wave_macro('#define MULTILINE \\\n    line1 \\\n    line2');
    assert(test2.macros.length === 1, '应该找到1个宏');
    assert(test2.macros[0].isMultiline, '应该是多行宏');
    assert(test2.macros[0].getValue().includes('line1'), '应该包含line1');
    assert(test2.macros[0].getValue().includes('line2'), '应该包含line2');

    // 测试用例3：条件编译
    console.log('\n测试用例3：条件编译');
    const test3 = replace_wave_macro('#ifdef DEBUG\n#define LOG(x) printf(x)\n#else\n#define LOG(x)\n#endif');
    console.log('Debug - test3 macros:', test3.macros.map(m => ({
        type: m.type,
        line: m.lineNumber,
        children: m.children.length
    })));
    assert(test3.macros.length === 5, '应该找到5个宏');
    assert(test3.macros[0].type === 'ifdef', '第一个宏应该是ifdef');
    assert(test3.macros[1].type === 'define', '第二个宏应该是define');
    assert(test3.macros[2].type === 'else', '第三个宏应该是else');
    assert(test3.macros[3].type === 'define', '第四个宏应该是define');
    assert(test3.macros[4].type === 'endif', '第五个宏应该是endif');

    // 测试用例4：带空白的宏
    console.log('\n测试用例4：带空白的宏');
    const test4 = replace_wave_macro('  #define SPACED 123\n#define NORMAL 456');
    assert(test4.macros.length === 2, '应该找到2个宏');
    assert(test4.macros[0].startColumn === 2, '第一个宏应该从第2列开始');
    assert(test4.macros[1].startColumn === 0, '第二个宏应该从第0列开始');

    // 测试用例5：错误处理
    console.log('\n测试用例5：错误处理');
    const test5 = replace_wave_macro('#define\n#error Test error');
    assert(test5.errors.length === 2, '应该找到2个错误');
    assert(test5.errors[0].message.includes('missing identifier'), '第一个错误应该是缺少标识符');
    assert(test5.errors[1].message.includes('Test error'), '第二个错误应该是Test error');

    // 测试用例6：include宏
    console.log('\n测试用例6：include宏');
    const test6 = replace_wave_macro('#include <stdio.h>\n#include "test.h"');
    assert(test6.macros.length === 2, '应该找到2个宏');
    assert(test6.macros[0].type === 'include', '第一个宏应该是include');
    assert(test6.macros[1].type === 'include', '第二个宏应该是include');

    // 测试用例7：pragma宏
    console.log('\n测试用例7：pragma宏');
    const test7 = replace_wave_macro('#pragma once\n#pragma pack(1)');
    assert(test7.macros.length === 2, '应该找到2个宏');
    assert(test7.macros[0].type === 'pragma', '第一个宏应该是pragma');
    assert(test7.macros[1].type === 'pragma', '第二个宏应该是pragma');

    // 测试用例8：混合内容
    console.log('\n测试用例8：混合内容');
    const test8 = replace_wave_macro('int main() {\n#define TEST 1\n    return 0;\n#undef TEST\n}');
    assert(test8.macros.length === 2, '应该找到2个宏');
    assert(test8.macros[0].type === 'define', '第一个宏应该是define');
    assert(test8.macros[1].type === 'undef', '第二个宏应该是undef');

    // 测试用例9：嵌套宏
    console.log('\n测试用例9：嵌套宏');
    const test9 = replace_wave_macro('#ifdef DEBUG\n#define LOG(x) printf(x)\n#ifdef VERBOSE\n#define LOG_VERBOSE(x) printf("VERBOSE: " x)\n#endif\n#endif');
    console.log('Debug - test9 rootMacros:', test9.rootMacros.map(m => ({
        type: m.type,
        line: m.lineNumber,
        children: m.children.map(c => ({
            type: c.type,
            line: c.lineNumber,
            children: c.children.length
        }))
    })));
    assert(test9.rootMacros.length === 1, '应该找到1个根宏');
    assert(test9.rootMacros[0].children.length === 2, '根宏应该有2个子宏');
    assert(test9.rootMacros[0].children[0].children.length === 1, '第一个子宏应该有1个子宏');

    // 测试用例10：宏条件求值
    console.log('\n测试用例10：宏条件求值');
    const definedMacros = new Set(['DEBUG', 'TEST']);
    const test10 = replace_wave_macro('#if defined(DEBUG) && !defined(RELEASE)\n#define ACTIVE 1\n#endif', definedMacros);
    console.log('Debug - test10 macros:', test10.macros.map(m => ({
        type: m.type,
        line: m.lineNumber,
        children: m.children.length
    })));
    assert(test10.macros.length === 3, '应该找到3个宏');
    assert(test10.macros[0].isEnabled, '第一个条件应该为true');
    assert(test10.macros[1].isEnabled, '第二个宏应该启用');

    // 测试用例11：函数式宏
    console.log('\n测试用例11：函数式宏');
    const test11 = replace_wave_macro('#define CALC_SUM(a, b) ((a) + (b))');
    assert(test11.macros.length === 1, '应该找到1个宏');
    assert(test11.macros[0].getName() === 'CALC_SUM', '宏名称应该是CALC_SUM');
    assert(test11.macros[0].getParameters().length === 2, '应该有2个参数');
    assert(test11.macros[0].getParameters()[0] === 'a', '第一个参数应该是a');
    assert(test11.macros[0].getParameters()[1] === 'b', '第二个参数应该是b');
    assert(test11.macros[0].getValue() === '((a) + (b))', '宏值应该是((a) + (b))');

    // 测试用例12：多行函数式宏
    console.log('\n测试用例12：多行函数式宏');
    const test12 = replace_wave_macro('#define MULTI_LINE_FUNC(a, b) \\\n    do { \\\n        (a) = (b); \\\n    } while(0)');
    assert(test12.macros.length === 1, '应该找到1个宏');
    assert(test12.macros[0].isMultiline, '应该是多行宏');
    assert(test12.macros[0].getName() === 'MULTI_LINE_FUNC', '宏名称应该是MULTI_LINE_FUNC');
    assert(test12.macros[0].getParameters().length === 2, '应该有2个参数');
    assert(test12.macros[0].getValue().includes('do {'), '应该包含do {');

    // 测试用例13：带空格的参数
    console.log('\n测试用例13：带空格的参数');
    const test13 = replace_wave_macro('#define SPACE_PARAMS( a , b ) (a + b)');
    assert(test13.macros.length === 1, '应该找到1个宏');
    assert(test13.macros[0].getName() === 'SPACE_PARAMS', '宏名称应该是SPACE_PARAMS');
    assert(test13.macros[0].getParameters().length === 2, '应该有2个参数');
    assert(test13.macros[0].getParameters()[0] === 'a', '第一个参数应该是a');
    assert(test13.macros[0].getParameters()[1] === 'b', '第二个参数应该是b');
    assert(test13.macros[0].getValue() === '(a + b)', '宏值应该是(a + b)');

    // 测试用例14：无参数宏
    console.log('\n测试用例14：无参数宏');
    const test14 = replace_wave_macro('#define NO_PARAMS() 123');
    assert(test14.macros.length === 1, '应该找到1个宏');
    assert(test14.macros[0].getName() === 'NO_PARAMS', '宏名称应该是NO_PARAMS');
    assert(test14.macros[0].getParameters().length === 0, '应该没有参数');
    assert(test14.macros[0].getValue() === '123', '宏值应该是123');

    // 测试用例15：宏名称和左括号之间没有空格
    console.log('\n测试用例15：宏名称和左括号之间没有空格');
    const test15 = replace_wave_macro('#define NO_SPACE(a,b)(a+b)');
    assert(test15.macros.length === 1, '应该找到1个宏');
    assert(test15.macros[0].getName() === 'NO_SPACE', '宏名称应该是NO_SPACE');
    assert(test15.macros[0].getParameters().length === 2, '应该有2个参数');
    assert(test15.macros[0].getParameters()[0] === 'a', '第一个参数应该是a');
    assert(test15.macros[0].getParameters()[1] === 'b', '第二个参数应该是b');
    assert(test15.macros[0].getValue() === '(a+b)', '宏值应该是(a+b)');

    // 输出测试结果
    console.log('\n测试结果:');
    console.log(`总测试用例数: ${totalTests}`);
    console.log(`总断言数: ${totalAssertions}`);
    console.log(`通过断言数: ${passed}`);
    console.log(`失败断言数: ${failed}`);
    console.log(`通过率: ${((passed / totalAssertions) * 100).toFixed(2)}%`);
}

// 运行测试
runTests();
