// import * as fs from "fs";
// import * as path from "path";
// import { Global, parse } from "./parser-vjass";
// import { Document, Position, Range, TextLine, Token, TokenType } from "./tokenizer-common";
// import { tokenize_for_vjass, tokenize_for_vjass_by_content } from "./tokenizer-vjass";

// export class RunTextMacro extends Range {
//     public name: string | null = null;
//     public param_string: string | null = null;
//     public param_body_string: string | null = null;
//     public readonly document: Document;

//     public constructor(document: Document, start?: Position, end?: Position) {
//         super(start, end);
//         this.document = document;
//     }

//     /**
//      * 是否合法
//      */
//     public get is_legal(): boolean {
//         if (this.name == null || this.name.trim() == "" || this.param_body_string == null) {
//             return false;
//         }
//         return true;
//     }

//     public params(): string[] {
//         return this.param_string?.split(",").map(param => param.trim()) ?? [];
//     }
//     public param_values(): string[] {
//         return this.params().map(param => {
//             if (param.startsWith("\"")) {
//                 if (param.endsWith("\"")) {
//                     return param.substring(1, param.length - 1);
//                 } else {
//                     return param.substring(1);
//                 }
//             } else {
//                 if (param.endsWith("\"")) {
//                     return param.substring(0, param.length - 1);
//                 } else {
//                     return param;
//                 }
//             }
//         }) ?? [];
//     }

//     public loop(callback: (document: Document, run_text_macro:RunTextMacro, text_macro: TextMacro, lineNumber: number) => void) {
//         // 找到对应textmacro
//         const text_macro = Global.getAllTextMacros().find(macro => {
//             return macro.name != null && macro.name == this.name
//         });

        
//         if (text_macro) {
//             text_macro.loop((document, text_macro, lineNumber) => {
//                 callback(document, this, text_macro, lineNumber);
//             });
//         }
//     }
// }
// const RunTextMacroStartWithRegExp = /\/\/!\s+runtextmacro\b/;
// const RunTextMacroRegExp = /\/\/!\s+runtextmacro(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?<param_body>\(\s*(?<params>.+)\s*\))?/;
// export function parse_runtextmacro(document: Document) {
//     for (let index = 0; index < document.lineCount; index++) {
//         const text_macro_index = document.line_text_macro_indexs[index];
//         const import_index = document.line_import_indexs[index];
//         if (text_macro_index.text_macro_tag == 0 && import_index.is_import == false) { // 正常行
//             const tokens = document.lineTokens(index);
//             if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && RunTextMacroStartWithRegExp.test(tokens[0].getText())) {
//                 const token = tokens[0];
//                 const text = token.getText();
//                 const result = RunTextMacroRegExp.exec(text);
//                 const run_text_macro = new RunTextMacro(document, token.start, token.end);
//                 if (result && result.groups) {
//                     if (result.groups["name"]) {
                        
//                         run_text_macro.name = result.groups["name"];
//                     }
//                     if (result.groups["param_body"]) {
//                         run_text_macro.param_body_string = result.groups["param_body"];
//                     }
//                     if (result.groups["param_body"]) {
//                         run_text_macro.param_string = result.groups["params"];
//                     }
//                 }
//                 document.run_text_macros.push(run_text_macro);
//                 document.line_run_text_macro_indexs.push({
//                     line: index,
//                     is_run_text_macro: true,
//                     index: document.run_text_macros.length - 1
//                 });
//             } else {
//                 document.line_run_text_macro_indexs.push({
//                     line: index,
//                     is_run_text_macro: false,
//                     index: -1
//                 });
//             }
//         } else {
//             document.line_run_text_macro_indexs.push({
//                 line: index,
//                 is_run_text_macro: false,
//                 index: -1
//             });
//         }
//     }
// }

// export class TextMacro extends Range {
//     public name: string | null = null;
//     public takes_string: string | null = null;

//     public start_line: number = 0;
//     public end_line: number = 0;

//     public get line_number(): number {
//         return this.end_line - this.start_line;
//     }

//     public is_complete: boolean = false;

//     public readonly document: Document;

//     public constructor(document: Document, start?: Position, end?: Position) {
//         super(start, end);
//         this.document = document;
//     }

//     public takes(): string[] {
//         return this.takes_string?.split(",").map(take => take.trim()) ?? [];
//     }

//     public loop(callback: (document: Document, text_macro:TextMacro, lineNumber: number) => void) {
//         for (let index = this.start_line + 1; index < this.end_line; index++) {
//             callback(this.document, this, index);
//         }
//     }

//     public lineAt(line:number, params: string[] = []): TextLine {
//         let text = this.document.lineAt(line).text;
//         this.takes().forEach((take, index) => {
            
//             const param = params[index];
//             if (param) {
//                 text = text.replace(new RegExp(`\\$${take}\\$`, "g"), param);
//             }
//         });
//         return new TextLine(line, text);
//     }
//     public lineTokens(line:number, params: string[] = []): Token[] {
//         const text_line = this.lineAt(line, params);
//         return tokenize_for_vjass_by_content(text_line.text).map(toekn => {
//             // @ts-expect-error
//             toekn.line = line;
//             toekn.start.line = line;
//             toekn.end.line = line;
//             return toekn;
//         });
//     }
// }

// const TextMacroStartWithRegExp = /\/\/!\s+textmacro\b/;
// const EndTextMacroStartWithRegExp = /\/\/!\s+endtextmacro\b/;
// // const TextMacroRegExp = /\/\/!\s+textmacro(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?:takes\s*(?<params>([a-zA-Z_0-9]+)(?:\s*,\s*[a-zA-Z_0-9]+)*))?/;
// const TextMacroRegExp = /\/\/!\s+textmacro(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?:takes\s+(?<takes>.+))?/;



// /**
//  * 找到范围并解析
//  * @param document 
//  */
// export function parse_textmacro(document: Document) {
//     // const macros:Macro[] = [];
//     let text_macro: TextMacro | null = null;
//     for (let index = 0; index < document.lineCount; index++) {
//         const macro_index = document.macro_indexs[index];
//         const tokens = document.lineTokens(index);
//         if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && TextMacroStartWithRegExp.test(tokens[0].getText())) {
//             const token = tokens[0];
//             const text = token.getText();
//             const result = TextMacroRegExp.exec(text);

//             text_macro = new TextMacro(document, token.start, token.end);
//             text_macro.start_line = index;
//             text_macro.end_line = index;
//             if (result && result.groups) {
//                 if (result.groups["name"]) {
//                     text_macro.name = result.groups["name"];
//                 }
//                 if (result.groups["takes"]) {
//                     text_macro.takes_string = result.groups["takes"];
//                 }
//             }
//             document.text_macros.push(text_macro);
//             document.line_text_macro_indexs.push({
//                 line: index,
//                 text_macro_tag: 1,
//                 index: document.text_macros.length - 1
//             });
//         } else if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && EndTextMacroStartWithRegExp.test(tokens[0].getText())) {
//             if (text_macro) {
//                 text_macro.is_complete = true;
//                 document.line_text_macro_indexs.push({
//                     line: index,
//                     text_macro_tag: 2,
//                     index: 0
//                 });
//                 text_macro.end_line = index;
//             } else {
//                 // 错误
//                 document.line_text_macro_indexs.push({
//                     line: index,
//                     text_macro_tag: -1,
//                     index: 0
//                 });
//             }
//             text_macro = null;

//         } else if (text_macro && macro_index.is_macro == false) {
//             document.line_text_macro_indexs.push({
//                 line: index,
//                 text_macro_tag: 3,
//                 index: 0
//             });
//             text_macro.end_line = index;
//         } else {
//             document.line_text_macro_indexs.push({
//                 line: index,
//                 text_macro_tag: 0,
//                 index: 0
//             });
//         }
//     }
// }

// export class Import extends Range {
//     public filePath: string | null = null;
//     public type: "jass" | "vjass" | "zinc" | null = null;
//     public readonly parent_document: Document;
//     constructor(parent_document: Document, start?: Position, end?: Position) {
//         super(start, end);

//         this.parent_document = parent_document;
//     }

//     /**
//      * 是否合法
//      */
//     public get is_legal(): boolean {
//         const abs_path = this.abs_path;
//         if (abs_path) {
//             return fs.existsSync(abs_path);
//         }
//         return false;
//     }

//     public get abs_path(): string | null {
//         if (!this.filePath) {
//             return null;
//         }
//         return path.isAbsolute(this.filePath) ? this.filePath : path.resolve(path.parse(this.parent_document.filePath).dir, this.filePath);
//     }

//     public get document(): Document | undefined {
//         if (this.is_legal) {
//             if (!Global.has(this.abs_path!)) {
//                 parse(this.abs_path!);
//             }
//             return Global.get(this.abs_path!);
//         }
//         return;
//     }

// }

// const ImportStartWithRegExp = /\/\/!\s+import\b/;
// const ImportRegExp = /\/\/!\s+import\b(?:\s+(?<type>jass|vjass|zinc))?/;
// const ImportPathRegExp = /"(?<file_path>.+?)"/;
// export function parse_import(document: Document) {
//     ;
//     for (let index = 0; index < document.lineCount; index++) {
//         const tokens = document.lineTokens(index);
//         if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && ImportStartWithRegExp.test(tokens[0].getText())) {
//             const token = tokens[0];
//             const text = token.getText();
//             const result = ImportRegExp.exec(text);
//             const vjass_import = new Import(document, token.start, token.end);
//             document.imports.push(vjass_import);
//             if (result) {
//                 if (result.groups && result.groups["type"]) {
//                     // @ts-expect-error
//                     vjass_import.type = result.groups["type"];
//                 }
//                 const filePathResult = ImportPathRegExp.exec(text);
//                 if (filePathResult && filePathResult.groups && filePathResult.groups["file_path"]) {
//                     vjass_import.filePath = filePathResult.groups["file_path"];
//                 }
//             }
//             document.line_import_indexs.push({
//                 line: index,
//                 is_import: true,
//                 index: document.imports.length - 1
//             });
//         } else {
//             document.line_import_indexs.push({
//                 line: index,
//                 is_import: false,
//                 index: -1
//             });
//         }
//     }
// }