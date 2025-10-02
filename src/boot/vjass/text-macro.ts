import { isLegalIdentifier, isVjassKeyword } from "./id";
import { SimpleError } from "./simple-error";

const TextMacroStartWithRegExp = /^\s*\/\/!\s+textmacro\b/;
const EndTextMacroStartWithRegExp = /^\s*\/\/!\s+endtextmacro\b/;
const TextMacroRegExp = /^\s*\/\/!\s+textmacro(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?<takes>takes(?:\s+[a-zA-Z0-9_, \t]+)*)?/;

export class TextMacro {
    name: string;
    takes: string[];
    body: string[];
    header: { lineNumber: number; code: string } | null;
    endTag: { lineNumber: number; code: string } | null;
    filePath: string;

    constructor(name: string, takes: string[], filePath: string) {
        this.name = name;
        this.takes = takes;
        this.body = [];
        this.header = null;
        this.endTag = null;
        this.filePath = filePath;
    }
}

function parseTextMacroHeader(
    lineNumber: number, 
    text: string, 
    collection: { errors: SimpleError[], warnings: any[] }, 
    filePath: string
): TextMacro | null {
    const result = TextMacroRegExp.exec(text);
    if (!result || !result.groups) {
        return null;
    }
    
    const name = result.groups["name"] || "";
    const takes_string = result.groups["takes"] || "";
    const has_takes = takes_string && takes_string.trimStart().startsWith("takes");
    const new_takes_string = has_takes ? takes_string.trimStart().substring(5) : takes_string || "";
    const takes = new_takes_string?.split(",").map(take => take.trim()).filter(take => take !== "") || [];
    
    // 🔍 检查takes语法是否正确 (缺少逗号检查)
    if (has_takes && new_takes_string) {
        // 检查是否有空格分隔但没有逗号的情况，如 "takes a b c"
        const trimmed = new_takes_string.trim();
        if (trimmed.includes(' ') && !trimmed.includes(',')) {
            // 进一步检查：如果包含多个连续的标识符但没有逗号
            const words = trimmed.split(/\s+/).filter(w => w.length > 0);
            if (words.length > 1) {
                collection.errors.push(new SimpleError(
                    { line: lineNumber, position: 0 }, 
                    { line: lineNumber, position: text.length }, 
                    `malformed takes syntax! Parameters should be separated by commas.`, 
                    `change "takes ${trimmed}" to "takes ${words.join(', ')}"!`
                ));
            }
        }
    }
    
    if (!name) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `textmacro name not declared!`, 
            `declare textmacro name!`
        ));
    } else if (!isLegalIdentifier(name)) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `invalid identifier!`, 
            `use a valid identifier for textmacro name!`
        ));
    } else if (isVjassKeyword(name)) {
        collection.errors.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `textmacro name is a vjass keyword!`, 
            `rename textmacro name to a valid identifier!`
        ));
    }
    
    // 🚨 新增：textmacro名称长度检查 (>32字符警告)
    if (name && name.length > 32) {
        collection.warnings.push(new SimpleError(
            { line: lineNumber, position: 0 }, 
            { line: lineNumber, position: text.length }, 
            `textmacro name '${name}' is longer than 32 characters!`
        ));
    }
    
    if (has_takes) {
        if (takes.length === 0) {
            collection.errors.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `textmacro takes not declared!`, 
                `declare textmacro takes!`
            ));
        }
    }
    
    for (let i = 0; i < takes.length; i++) {
        const take = takes[i];
        // 🚨 新增：空参数名检查 (错误)
        if (!take || take.trim() === "") {
            collection.errors.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `empty parameter name found!`, 
                `provide valid parameter names!`
            ));
            continue; // 跳过后续检查
        }
        
        if (!isLegalIdentifier(take)) {
            collection.errors.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `invalid identifier!`, 
                `use a valid identifier for textmacro take!`
            ));
        }
        
        if (isVjassKeyword(take)) {
            collection.errors.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `textmacro take is a vjass keyword!`, 
                `rename textmacro take to a valid identifier!`
            ));
        }
        
        // 检测重复参数
        if (takes.slice(0, i).filter(t => t === take).length >= 1) {
            collection.errors.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `duplicate parameter name: ${take}!`, 
                `rename duplicate parameter ${take} to a unique name!`
            ));
        }
        
        // 🚨 新增：参数名称长度检查 (>32字符警告)
        if (take.length > 32) {
            collection.warnings.push(new SimpleError(
                { line: lineNumber, position: 0 }, 
                { line: lineNumber, position: text.length }, 
                `parameter name '${take}' is longer than 32 characters!`
            ));
        }
    }
    
    const textMacro = new TextMacro(name, takes, filePath);
    textMacro.header = {
        lineNumber: lineNumber,
        code: text,
    };
    return textMacro;
}

/**
 *
 * @param content 传进去的vjass代码，一般是移除块级注释后的代码
 * @param collection 错误和警告收集器
 * @param textMacroCollection 收集到的textmacro定义
 * @param filePath 文件路径
 * @returns {string} 处理后的vjass代码，textmacro会被换行符替换
 */
export function parseAndRemoveTextMacros(
    content: string, 
    collection: { errors: SimpleError[], warnings: any[] }, 
    textMacroCollection: { textMacros: TextMacro[] }, 
    filePath: string
): string {
    const texts = content.split("\n");
    const result_lines: string[] = [];
    let tempTextMacro: TextMacro | null = null;
    
    // 然后处理runtextmacro调用
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        
        if (EndTextMacroStartWithRegExp.test(text)) {
            if (tempTextMacro) {
                // 🚨 新增：空textmacro body检查 (警告)
                if (tempTextMacro.body.length === 0) {
                    collection.warnings.push(new SimpleError(
                        { line: i, position: 0 }, 
                        { line: i, position: text.length }, 
                        `textmacro '${tempTextMacro.name}' has empty body!`
                    ));
                }
                tempTextMacro.endTag = {
                    lineNumber: i,
                    code: text,
                };
                tempTextMacro = null;
            } else {
                collection.errors.push(new SimpleError(
                    { line: i, position: 0 }, 
                    { line: i, position: text.length }, 
                    `illegal end tag!`, 
                    `remove //! endtextmacro tag!`
                ));
            }
            result_lines.push("");
        } else if (TextMacroStartWithRegExp.test(text)) {
            if (tempTextMacro) {
                // 嵌套错误
                collection.errors.push(new SimpleError(
                    { line: i, position: 0 }, 
                    { line: i, position: text.length }, 
                    `textmacro does not support nesting!`, 
                    `close previous textmacro before starting a new one!`
                ));
            }
            // 收集错误保持状态
            tempTextMacro = parseTextMacroHeader(i, text, collection, filePath);
            if (tempTextMacro) {
                textMacroCollection.textMacros.push(tempTextMacro);
            }
            result_lines.push("");
        } else if (tempTextMacro) {
            // textmacro body
            tempTextMacro.body.push(text);
            result_lines.push("");
        } else {
            result_lines.push(text);
        }
    }
    
    return result_lines.join("\n");
}

if (false) {
    const testCases = `
    //! textmacro verylongtextmacronamethatexceedsthirtytwocharacters takes param
    //! endtextmacro
    
    //! textmacro test takes verylongparameternamethatexceedsthirtytwocharacters
    //! endtextmacro
    
    //! textmacro manyparams takes a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u
    //! endtextmacro
    
    //! textmacro empty
    //! endtextmacro
    
    //! textmacro emptyparams takes ,a,,b,
    //! endtextmacro
    
    //! textmacro badtakes takes a, b c d
    //! endtextmacro
    `;
    const collection = {
        errors: [],
        warnings: []
    };
    const textMacroCollection = {
        textMacros: []
    };
    console.log(parseAndRemoveTextMacros(testCases, collection, textMacroCollection, "test.jass"));
    console.log(collection, textMacroCollection.textMacros);
}
