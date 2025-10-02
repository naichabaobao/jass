import { SimpleError } from "./simple-error";
import { isLegalIdentifier, isVjassKeyword } from "./id";

/**
 * 解析字符串参数，支持双引号字符串
 * 例如: "World", "User", "5", "10" -> ["World", "User", "5", "10"]
 */
function parseStringParameters(paramsString: string, lineNumber: number, collection: { errors: SimpleError[], warnings: any[] }): string[] {
    const params: string[] = [];
    let current = 0;
    const len = paramsString.length;
    
    while (current < len) {
        // 跳过空白字符
        while (current < len && /\s/.test(paramsString[current])) {
            current++;
        }
        if (current >= len) break;
        
        // 检查是否是双引号字符串
        if (paramsString[current] === '"') {
            const start = current;
            current++; // 跳过开始引号
            // 查找结束引号
            while (current < len && paramsString[current] !== '"') {
                // 处理转义字符
                if (paramsString[current] === '\\' && current + 1 < len) {
                    current += 2; // 跳过转义字符和下一个字符
                } else {
                    current++;
                }
            }
            if (current >= len) {
                collection.errors.push(new SimpleError(
                    { line: lineNumber, position: start }, 
                    { line: lineNumber, position: len }, 
                    `unterminated string literal!`, 
                    `add closing quote!`
                ));
                break;
            }
            // 提取字符串内容（去掉引号）
            const stringContent = paramsString.substring(start + 1, current);
            params.push(stringContent);
            current++; // 跳过结束引号
        } else {
            // 非字符串参数，按逗号分割
            const commaIndex = paramsString.indexOf(',', current);
            const endIndex = commaIndex === -1 ? len : commaIndex;
            const param = paramsString.substring(current, endIndex).trim();
            if (param) {
                params.push(param);
            }
            current = endIndex + 1;
        }
        
        // 跳过逗号后的空白字符
        while (current < len && /\s/.test(paramsString[current])) {
            current++;
        }
        // 如果遇到逗号，跳过它
        if (current < len && paramsString[current] === ',') {
            current++;
        }
    }
    
    return params;
}

const RunTextMacroStartWithRegExp = /^\s*\/\/!\s+runtextmacro\b/;
// 修复正则表达式：支持 optional 关键字，移除param_body捕获组，直接匹配参数列表
const RunTextMacroRegExp = /^\s*\/\/!\s+runtextmacro(?:\s+(?<optional>optional))?(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?:\(\s*(?<params>.*)\s*\))?/;

export class RunTextMacro {
    name: string;
    params: string[];
    optional: boolean;
    header: {
        lineNumber: number;
        code: string;
    };

    constructor(name: string, params: string[], lineNumber: number, code: string, optional: boolean = false) {
        this.name = name;
        this.params = params;
        this.optional = optional;
        this.header = {
            lineNumber: lineNumber,
            code: code,
        };
    }

    get lineNumber(): number {
        return this.header.lineNumber;
    }

    get code(): string {
        return this.header.code;
    }
}

export interface RunTextMacroCollection {
    runTextMacros: RunTextMacro[];
    mixLineTexts: any[];
}

function parseRunTextMacro(text: string, lineNumber: number, collection: { errors: SimpleError[], warnings: any[] }): RunTextMacro {
    const result = RunTextMacroRegExp.exec(text);
    if (!result || !result.groups) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `malformed runtextmacro syntax!`, 
            `use correct syntax: //! runtextmacro [optional] <name>(<params>)!`
        ));
        return new RunTextMacro("", [], lineNumber, text, false);
    }
    
    const optional = result.groups["optional"] === "optional";
    const name = result.groups["name"] || "";
    const params_string = result.groups["params"] || "";
    
    // 验证名称
    if (!name) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `runtextmacro name not declared!`, 
            `provide a name for runtextmacro!`
        ));
    } else {
        // 检查名称是否为合法标识符
        if (!isLegalIdentifier(name)) {
            collection.errors.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `invalid identifier '${name}'!`, 
                `use a valid identifier for runtextmacro name!`
            ));
        }
        // 检查名称是否为vjass关键字
        if (isVjassKeyword(name)) {
            collection.errors.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `runtextmacro name '${name}' is a vjass keyword!`, 
                `rename runtextmacro to a valid identifier!`
            ));
        }
        // 警告：名称过长
        if (name.length > 32) {
            collection.warnings.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `runtextmacro name '${name}' is longer than 32 characters!`
            ));
        }
    }
    
    // 解析参数
    let params_array: string[] = [];
    if (params_string) {
        // 使用新的字符串参数解析函数
        params_array = parseStringParameters(params_string, lineNumber, collection);
    }
    
    // 检查括号不匹配的情况
    const open_paren = text.indexOf('(');
    const close_paren = text.lastIndexOf(')');
    if (open_paren !== -1 && close_paren === -1) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `missing closing parenthesis!`, 
            `add closing parenthesis ')'!`
        ));
    } else if (open_paren === -1 && close_paren !== -1) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `missing opening parenthesis!`, 
            `add opening parenthesis '('!`
        ));
    }
    
    return new RunTextMacro(name, params_array, lineNumber, text, optional);
}

export function parseAndRemoveRunTextMacros(
    content: string, 
    collection: { errors: SimpleError[], warnings: any[] }, 
    runTextMacroCollection: { runTextMacros: RunTextMacro[], mixLineTexts: any[] }
): string {
    // 处理空内容
    if (!content) {
        return content;
    }
    
    const texts = content.split("\n");
    const result_lines: string[] = [];
    // 跟踪重复的runtextmacro调用
    const macro_calls = new Map<string, number[]>();
    
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (RunTextMacroStartWithRegExp.test(text)) {
            const runTextMacro = parseRunTextMacro(text, i, collection);
            // 检查重复调用（同名且同参数）
            if (runTextMacro.name) {
                const call_signature = `${runTextMacro.name}(${runTextMacro.params.join(',')})`;
                if (!macro_calls.has(call_signature)) {
                    macro_calls.set(call_signature, []);
                }
                macro_calls.get(call_signature)!.push(i);
                // 如果有重复调用，添加警告
                const call_lines = macro_calls.get(call_signature)!;
                if (call_lines.length > 1) {
                    collection.warnings.push(new SimpleError(
                        { line: i, position: 0 }, 
                        { line: i, position: text.length }, 
                        `duplicate runtextmacro call '${call_signature}' (also on line ${call_lines[0] + 1})!`
                    ));
                }
            }
            runTextMacroCollection.runTextMacros.push(runTextMacro);
            runTextMacroCollection.mixLineTexts.push(runTextMacro);
            result_lines.push("");
        } else {
            result_lines.push(text);
            runTextMacroCollection.mixLineTexts.push(text);
        }
    }
    
    return result_lines.join("\n");
}

// 测试用例
if (false) {
    const testCases = `
//! runtextmacro ValidMacro(param1, param2)
//! runtextmacro InvalidName123!(param)
//! runtextmacro function(param)
//! runtextmacro TestMacro(param1, param1)
//! runtextmacro EmptyParams()
//! runtextmacro MalformedParams(param1 param2 param3)
//! runtextmacro MissingParen(param1, param2
//! runtextmacro ExtraParen)param1, param2)
//! runtextmacro verylongruntextmacronamethatexceedsthirtytwocharacters(param)
//! runtextmacro TestMacro(verylongparameternamethatexceedsthirtytwocharacters)
//! runtextmacro DuplicateCall(param1, param2)
//! runtextmacro DuplicateCall(param1, param2)
//! runtextmacro EmptyParam(param1, , param3)
//! runtextmacro
`;
    const collection = {
        errors: [],
        warnings: []
    };
    const runTextMacroCollection = {
        runTextMacros: [],
        mixLineTexts: []
    };
    console.log("Testing parseAndRemoveRunTextMacros:");
    const result = parseAndRemoveRunTextMacros(testCases, collection, runTextMacroCollection);
    console.log("Errors:", collection.errors);
    console.log("Warnings:", collection.warnings);
    console.log("Collected macros:", runTextMacroCollection.runTextMacros);
}
