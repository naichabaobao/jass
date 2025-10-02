import { SimpleError } from "./simple-error";
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

function parseDefine(text: string, lineNumber: number, collection: { errors: SimpleError[], warnings: any[] }): Define | null {
    const result = DefineRegExp.exec(text);
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
    const value = result.groups["value"]?.trim() || "";
    
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
    
    return new Define(lineNumber, name, value, text);
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
            // 解析#define指令
            const define = parseDefine(text, i, collection);
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
            // 替换#define行为空行
            result_lines.push("");
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
    const collection = {
        errors: [],
        warnings: []
    };
    const preprocessCollection = {
        defines: [],
        includes: []
    };
    console.log("Testing parseAndRemovePreprocessor:");
    const result = parseAndRemovePreprocessor(testCases, collection, preprocessCollection);
    console.log("Result:", result);
    console.log("Errors:", collection.errors);
    console.log("Warnings:", collection.warnings);
    console.log("Collected defines:", preprocessCollection.defines);
    console.log("Collected includes:", preprocessCollection.includes);
}
