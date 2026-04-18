import { SimpleError } from "./error";
import { isLegalIdentifier } from "./id";

const DefineStartWithRegExp = /^\s*#define\b/;
// 修复正则表达式：正确解析#define name [value]
const DefineRegExp = /^\s*#define\s+(?<name>[a-zA-Z_][a-zA-Z0-9_]*)\s*(?<value>.*)?$/;
const IncludeStartWithRegExp = /^\s*#include\b/;
// #include只支持双引号格式：#include "path"
const IncludeRegExp = /^\s*#include\s+"(?<path>[^"]+)"\s*$/;
// 检测不支持的尖括号格式
const IncludeAngleBracketRegExp = /^\s*#include\s+<(?<path>[^>]+)>\s*$/;

export class Define {
    lineNumber: number;
    name: string;
    value: string;
    code: string;

    constructor(lineNumber: number, name: string, value: string, code: string) {
        this.lineNumber = lineNumber;
        this.name = name;
        this.value = value;
        this.code = code;
    }
}

export class Include {
    lineNumber: number;
    path: string;
    code: string;

    constructor(lineNumber: number, path: string, code: string) {
        this.lineNumber = lineNumber;
        this.path = path;
        this.code = code;
    }
}

function parseDefine(text: string, lineNumber: number, collection: { errors: SimpleError[], warnings: any[] }, fullText?: string): Define | null {
    // 处理多行内容：移除续行符（\）并合并行
    // fullText 包含所有续行的完整内容（已合并）
    const contentToParse = fullText || text;
    
    // 移除所有续行符（行尾的 \ 及其后的空白）
    // 将多行内容合并为单行，按照 C 预处理器规则：续行符后的内容直接连接
    const lines = contentToParse.split('\n');
    let normalizedContent = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimEnd();
        
        if (trimmed.endsWith('\\') && i < lines.length - 1) {
            // 续行：移除续行符和后面的空白，保留前面的内容
            const content = trimmed.slice(0, -1);
            // 直接追加内容（不添加额外空格）
            normalizedContent += content;
        } else {
            // 最后一行或非续行：追加内容
            normalizedContent += line;
            // 如果不是最后一行，添加一个空格（因为换行在宏定义中通常表示空格）
            if (i < lines.length - 1) {
                normalizedContent += ' ';
            }
        }
    }
    
    // 清理多余的空格（将多个连续空格合并为一个）
    normalizedContent = normalizedContent.replace(/\s+/g, ' ').trim();
    
    const result = DefineRegExp.exec(normalizedContent);
    if (!result || !result.groups) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `malformed #define syntax!`, 
            `use correct syntax: #define <name> [value]!`
        ));
        return null;
    }
    
    const name = result.groups["name"] || "";
    // 从合并后的内容中提取 value（移除续行符后的内容）
    let value = result.groups["value"]?.trim() || "";
    
    // 验证名称
    if (!name) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `#define name not declared!`, 
            `provide a name for #define!`
        ));
        return null;
    }
    
    // 检查名称是否为合法标识符
    if (!isLegalIdentifier(name)) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `invalid identifier '${name}'!`, 
            `use a valid identifier for #define name!`
        ));
    }
    
    // 警告：名称过长
    if (name.length > 32) {
        collection.warnings.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `#define name '${name}' is longer than 32 characters!`
        ));
    }
    
    // 检查名称是否以数字开头（C预处理器规则）
    if (/^\d/.test(name)) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `#define name '${name}' cannot start with a digit!`, 
            `rename #define to start with a letter or underscore!`
        ));
    }
    
    // 允许空值，不需要警告
    // 警告：值过长（可能影响可读性）
    if (value.length > 100) {
        collection.warnings.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `#define '${name}' value is very long (${value.length} characters)!`
        ));
    }
    
    // 使用原始完整文本（包含续行）作为 code
    return new Define(lineNumber, name, value, fullText || text);
}

function parseInclude(text: string, lineNumber: number, collection: { errors: SimpleError[], warnings: any[] }): Include | null {
    // 检查是否使用了不支持的尖括号格式
    const angleBracketResult = IncludeAngleBracketRegExp.exec(text);
    if (angleBracketResult) {
        const path = angleBracketResult.groups?.["path"] || "";
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `angle bracket format <${path}> is not supported!`, 
            `use double quotes: #include "${path}"!`
        ));
        return null;
    }
    
    // 解析双引号格式
    const result = IncludeRegExp.exec(text);
    if (!result || !result.groups) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `malformed #include syntax!`, 
            `use correct syntax: #include "path"!`
        ));
        return null;
    }
    
    const path = result.groups["path"] || "";
    
    // 验证路径
    if (!path) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `#include path not specified!`, 
            `provide a path for #include!`
        ));
        return null;
    }
    
    // 检查路径是否包含非法字符
    if (path.includes('\n') || path.includes('\r')) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `#include path contains line breaks!`, 
            `remove line breaks from path!`
        ));
    }
    
    // 警告：路径过长
    if (path.length > 255) {
        collection.warnings.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `#include path is very long (${path.length} characters)!`
        ));
    }
    
    // 检查路径格式建议
    if (!path.startsWith('./') && !path.startsWith('../') && !path.startsWith('/')) {
        collection.warnings.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `consider using relative path format like "./${path}"!`
        ));
    }
    
    // 检查文件扩展名
    if (!path.endsWith('.j') && !path.endsWith('.jass') && !path.endsWith('.ai')) {
        collection.warnings.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `included file "${path}" may not be a JASS file!`
        ));
    }
    
    return new Include(lineNumber, path, text);
}

/**
 * 解析并移除预处理指令，处理#define和#include，其他宏指令全部移除
 * @param content 输入的代码内容
 * @param collection 错误和警告收集器
 * @param preprocessCollection 预处理指令收集器
 * @returns 处理后的代码内容，预处理指令会被空行替换
 */
export function parseAndRemovePreprocessor(
    content: string, 
    collection: { errors: SimpleError[], warnings: any[] }, 
    preprocessCollection: { defines: Define[], includes: Include[] }
): string {
    // 处理空内容
    if (!content) {
        return content;
    }
    
    const texts = content.split("\n");
    const result_lines: string[] = [];
    // 跟踪重复的#define定义
    const define_names = new Map<string, number[]>();
    // 跟踪重复的#include
    const include_paths = new Map<string, number[]>();
    
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        
        if (DefineStartWithRegExp.test(text)) {
            // 处理多行宏定义（反斜杠续行）
            let defineText = text;
            let currentIndex = i;
            let currentLine = text;
            const MAX_MULTILINE = 1000; // 防止无限循环
            let multilineCount = 0;
            
            // 检查是否有续行（行尾有 \）
            while (currentLine.trimEnd().endsWith('\\') && currentIndex + 1 < texts.length && multilineCount < MAX_MULTILINE) {
                multilineCount++;
                currentIndex++;
                currentLine = texts[currentIndex];
                if (!currentLine) {
                    collection.errors.push(new SimpleError(
                        { line: i, position: 0 }, 
                        { line: currentIndex, position: 0 }, 
                        `Unexpected empty line in multiline #define!`
                    ));
                    break;
                }
                // 合并续行内容
                defineText += '\n' + currentLine;
            }
            
            // 如果超过最大行数限制，记录错误
            if (multilineCount >= MAX_MULTILINE) {
                collection.errors.push(new SimpleError(
                    { line: i, position: 0 }, 
                    { line: currentIndex, position: 0 }, 
                    `#define definition too long (exceeds ${MAX_MULTILINE} lines)!`
                ));
            }
            
            // 解析#define指令（传入完整的多行内容）
            const define = parseDefine(text, i, collection, defineText);
            if (define) {
                // 检查重复定义
                if (!define_names.has(define.name)) {
                    define_names.set(define.name, []);
                }
                define_names.get(define.name)!.push(i);
                const define_lines = define_names.get(define.name)!;
                if (define_lines.length > 1) {
                    collection.warnings.push(new SimpleError(
                        { line: i, position: 0 }, 
                        { line: i, position: text.length }, 
                        `duplicate #define '${define.name}' (also defined on line ${define_lines[0] + 1})!`
                    ));
                }
                preprocessCollection.defines.push(define);
            }
            
            // 替换所有续行行为空行
            for (let j = i; j <= currentIndex; j++) {
                result_lines.push("");
            }
            // 跳过已处理的续行
            i = currentIndex;
        } else if (IncludeStartWithRegExp.test(text)) {
            // 解析#include指令
            const include = parseInclude(text, i, collection);
            if (include) {
                // 检查重复包含
                if (!include_paths.has(include.path)) {
                    include_paths.set(include.path, []);
                }
                include_paths.get(include.path)!.push(i);
                const include_lines = include_paths.get(include.path)!;
                if (include_lines.length > 1) {
                    collection.warnings.push(new SimpleError(
                        { line: i, position: 0 }, 
                        { line: i, position: text.length }, 
                        `duplicate #include "${include.path}" (also included on line ${include_lines[0] + 1})!`
                    ));
                }
                preprocessCollection.includes.push(include);
            }
            // 替换#include行为空行
            result_lines.push("");
        } else if (/^\s*#.+/.test(text)) {
            // 其他宏指令（#ifdef, #ifndef, #endif, #pragma等）全部移除
            result_lines.push("");
        } else {
            // 保留普通代码行
            result_lines.push(text);
        }
    }
    
    return result_lines.join("\n");
}

// 测试用例
if (false) {
    const testCases = `
#define VALID_DEFINE 100
#define InvalidName123! invalid_value
#define DUPLICATE_NAME first_value  
#define DUPLICATE_NAME second_value
#define verylongdefinenamethatexceedsthirtytwocharacters short_value
#define SHORT_NAME verylongvaluethatexceedsonehundredcharacterslimitandmightcausereadabilityissuesinthecode
#define EMPTY_VALUE
#define 123INVALID starts_with_digit
#define
#define TextDocument (a + 12) \\
* 32
#define MULTILINE_MACRO \\
    line1 \\
    line2 \\
    line3
#include "./common.j"
#include "../lib/utils.jass"
#include "duplicate.j"
#include "duplicate.j"
#include <stdio.h>
#include "malformed
#include ""
#include "verylongpathnamethatexceedstwoHundredFiftyFiveCharactersLimitAndMightCauseIssuesWithFileSystemHandlingThisIsJustATestToCheckIfTheWarningIsTriggeredCorrectlyWhenThePathLengthExceedsTheMaximumAllowedLengthForFilePathsInMostOperatingSystems.j"
#include "unknownfile.xyz"
#ifdef DEBUG
#endif
#pragma once
`;
    const collection: { errors: SimpleError[], warnings: SimpleError[] } = {
        errors: [],
        warnings: []
    };
    const preprocessCollection: { defines: Define[], includes: Include[] } = {
        defines: [],
        includes: []
    };
    console.log("Testing parseAndRemovePreprocessor:");
    const result = parseAndRemovePreprocessor(testCases, collection, preprocessCollection);
    console.log("Result:", result);
    console.log("Errors:", collection.errors);
    console.log("Warnings:", collection.warnings);
    console.log("Collected defines:", preprocessCollection.defines.map((d: Define) => ({
        name: d.name,
        value: d.value,
        line: d.lineNumber
    })));
    console.log("Collected includes:", preprocessCollection.includes);
    
    // 测试反斜杠续行
    for (const d of preprocessCollection.defines) {
        if (d.name === 'TextDocument') {
            console.log("✓ Multiline define found:", d.value);
            console.log("  Expected: (a + 12) * 32");
            console.log("  Actual:", d.value);
            break;
        }
    }
    
    for (const d of preprocessCollection.defines) {
        if (d.name === 'MULTILINE_MACRO') {
            console.log("✓ Multiline macro found:", d.value);
            break;
        }
    }
}
