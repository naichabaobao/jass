import { SimpleError } from "./simple-error";

const ImportStartWithRegExp = /^\s*\/\/!\s+import\b/;
// 匹配 //! import [type] "path.j" 格式，支持可选的 jass|vjass|zinc 类型
const ImportRegExp = /\/\/!\s+import\b(?:\s+(?<type>jass|vjass|zinc))?\s+"(?<file_path>.+?)"/;

export class Import {
    lineNumber: number;
    path: string;
    type: string | null;
    code: string;

    constructor(lineNumber: number, path: string, type: string | null, code: string) {
        this.lineNumber = lineNumber;
        this.path = path;
        this.type = type;
        this.code = code;
    }
}

function parseImport(lineNumber: number, text: string, collection: { errors: SimpleError[], warnings: any[] }): Import | null {
    const result = ImportRegExp.exec(text);
    if (!result || !result.groups) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `malformed import syntax!`, 
            `use correct syntax: //! import [type] "path.j"!`
        ));
        return null;
    }
    
    const file_path = result.groups["file_path"];
    const type = result.groups["type"] || null;
    
    if (!file_path) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `import path not specified!`, 
            `provide a path for import!`
        ));
        return null;
    }
    
    return new Import(lineNumber, file_path, type, text);
}

/**
 * 解析并移除 //! import [type] "path.j" 语句
 * 支持可选的类型参数：jass、vjass、zinc
 * 将匹配的import语句替换为换行符
 *
 * @param content 要处理的代码内容
 * @param collection 错误收集器
 * @param importCollection 导入语句收集器
 * @returns 处理后的代码内容（import语句被替换为换行符）
 */
export function parseAndRemoveImports(
    content: string, 
    collection: { errors: SimpleError[], warnings: any[] }, 
    importCollection: { imports: Import[] }
): string {
    const texts = content.split("\n");
    const result_lines: string[] = [];
    
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (ImportStartWithRegExp.test(text)) {
            // 解析import语句
            const importStatement = parseImport(i, text, collection);
            if (importStatement) {
                importCollection.imports.push(importStatement);
            }
            // 将import语句替换为换行符
            result_lines.push("");
        } else {
            // 保留其他行
            result_lines.push(text);
        }
    }
    
    return result_lines.join("\n");
}

if (false) {
    const testCases = `
//! import "common.j"
//! import jass "blizzard.j"
//! import vjass "path/to/file.j"
//! import zinc "module.j"
//! import "path/to/file.j"
//! import "invalid syntax
//! import
//! import "valid.j"
    `;
    const collection = {
        errors: [],
        warnings: []
    };
    const importCollection = {
        imports: []
    };
    const result = parseAndRemoveImports(testCases, collection, importCollection);
    console.log("Original content:");
    console.log(testCases);
    console.log("\nProcessed content:");
    console.log(result);
    console.log("\nParsed imports:");
    console.log(importCollection.imports);
    console.log("\nErrors:");
    console.log(collection.errors);
}
