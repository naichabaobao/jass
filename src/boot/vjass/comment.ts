import { SimpleError } from "./simple-error";

/**
 * 移除注释函数
 *
 * 使用状态机处理 JASS 代码中的注释和字符串：
 * - 支持行注释 (//)
 * - 支持块注释
 * - 保护字符串中的注释符号
 * - 处理字符串转义
 *
 * @param content 要处理的代码内容
 * @param collection 错误收集器
 * @param deleteLineComment 是否删除行注释 (默认 false，保留行注释)
 * @returns 处理后的代码内容
 */
export function removeComment(content: string, collection: { errors: SimpleError[], warnings: any[] }, deleteLineComment: boolean = false): string {
    // 状态机状态：0=正常代码, 1=行注释, 2=块注释, 4=字符串, 5=字符串转义
    let state = 0;
    // 统一换行符为 \n
    content = content.replace(/\r/g, "");
    const len = content.length;
    const chars: string[] = [];
    let lineNumber = 0;
    let position = 0;
    let blockCommentStart: { line: number, position: number } = {
        line: 0,
        position: 0
    };
    
    for (let index = 0; index < len; index++) {
        const char = content.charAt(index);
        const nextChar = index + 1 < len ? content.charAt(index + 1) : "";
        
        switch (state) {
            case 0: // 正常代码状态
                if (char === "/") {
                    if (nextChar === "/") {
                        // 检测到行注释开始 //
                        state = 1;
                        if (!deleteLineComment) {
                            chars.push("/", "/");
                        }
                        index++;
                    } else if (nextChar === "*") {
                        // 检测到块注释开始 /*
                        state = 2;
                        chars.push(" ", " ");
                        index++;
                        position++;
                        blockCommentStart = {
                            line: lineNumber,
                            position: position
                        };
                    } else {
                        // 普通除法符号
                        chars.push(char);
                    }
                } else if (char === "\"") {
                    // 检测到字符串开始
                    state = 4;
                    chars.push(char);
                } else {
                    // 普通字符
                    chars.push(char);
                }
                break;
                
            case 1: // 行注释状态
                if (!deleteLineComment) {
                    chars.push(char); // 保留注释内容
                }
                if (!nextChar || nextChar == "\n") {
                    state = 0;
                }
                break;
                
            case 2: // 块注释状态
                if (char === "*" && nextChar === "/") {
                    // 检测到块注释结束标记 */
                    state = 0;
                    index++; // 跳过下一个字符 '/'
                    position++;
                    if (blockCommentStart.line == lineNumber) {
                        console.log(position);
                        for (let c = 0; c < position - blockCommentStart.position; c++) {
                            chars.push(" ");
                        }
                    } else {
                        for (let c = 0; c < (position + 1); c++) {
                            chars.push(" ");
                        }
                    }
                } else if (char == "\n") {
                    chars.push("\n");
                }
                break;
                
            case 4: // 字符串状态
                if (char === "\"") {
                    // 字符串结束
                    state = 0;
                    chars.push(char);
                } else if (char === "\\" && nextChar === "\"") {
                    // 进入转义状态
                    chars.push(char, nextChar);
                    index++;
                    position++;
                } else if (!nextChar) {
                    // 字符串中的换行符，字符串结束
                    state = 0;
                } else if (char == "\n") {
                    state = 0;
                    chars.push("\n");
                } else {
                    chars.push(char);
                }
                break;
        }
        
        if (char == "\n") {
            lineNumber++;
            position = 0;
        } else {
            position++;
        }
    }
    
    if (state == 2) {
        collection.errors.push(new SimpleError(blockCommentStart, {
            line: lineNumber,
            position: position
        }, "block comment not closed", "you need to close the block comment"));
    }
    
    return chars.join("");
}

if (false) {
    const origin = `a/*\naaa\na*a`;
    console.log(origin, origin.length);
    const errors = {
        errors: [],
        warnings: []
    };
    const content = removeComment(origin, errors);
    console.log(content, content.length, errors);
}
