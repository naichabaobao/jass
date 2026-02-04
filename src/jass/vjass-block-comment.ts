const newLineRegExp = new RegExp(/\n/);

function is_new_line(char: string) {
	if (!char) return false;
	return newLineRegExp.test(char);
}

enum BlockCommentState {
    Default,
    Div,
    LineComment,
    BlockComment,
    BlockCommentWillBreak,
    String,
    StringEscape,
}

class BlockCommentResult {
    public readonly state: BlockCommentState;
    public readonly text: string;

    constructor(text: string, state: BlockCommentState = BlockCommentState.Default) {
        this.state = state;
        this.text = text;
    }
}

/**
 * 处理块级注释核心方法
 * @param newText 新的文本段
 * @param preState 上一次结果的状态
 * @returns 处理后的文本和最后的状态
 */
function handle(newText: string, preState: BlockCommentState): BlockCommentResult {
    const chars = newText.split("");
    let state = preState;

    for (let index = 0; index < chars.length; index++) {
        const char = chars[index];

        if (state == BlockCommentState.Default) {
            if (char == "/") {
                state = BlockCommentState.Div;
            } else if (char == "\"") {
                state = BlockCommentState.String;
            }
        } else if (state == BlockCommentState.Div) {
            if (char == "/") {
                state = BlockCommentState.LineComment;
            } else if (char == "*") {
                state = BlockCommentState.BlockComment;
                chars[index] = " ";
                chars[index - 1] = " ";
            } else {
                state = BlockCommentState.Default;
            }
        } else if (state == BlockCommentState.LineComment) {
            if (is_new_line(char)) {
                state = BlockCommentState.Default;
            }
        } else if (state == BlockCommentState.BlockComment) {
            if (char == "*") {
                state = BlockCommentState.BlockCommentWillBreak;
            }
            if (is_new_line(char)) {
                chars[index] = "\n";
            } else {
                chars[index] = " ";
            }
        } else if (state == BlockCommentState.BlockCommentWillBreak) {
            if (char == "*") {
            } else if (char == "/") {
                state = BlockCommentState.Default;
            } else {
                state = BlockCommentState.BlockComment;
            }
            if (is_new_line(char)) {
                chars[index] = "\n";
            } else {
                chars[index] = " ";
            }
        } else if (state == BlockCommentState.String) {
            if (char == "\"" || is_new_line(char)) {
                state = BlockCommentState.Default;
            } else if (char == "\\") {
                state = BlockCommentState.StringEscape;
            }
        } else if (state == BlockCommentState.StringEscape) {
            if (is_new_line(char)) {
                state = BlockCommentState.Default;
            } else {
                state = BlockCommentState.String;
            }
        }
    }

    return new BlockCommentResult(chars.join(""), state);
}

/**
 * 替换块注释为空白文本
 * 该函数会处理以下情况：
 * 1. 块注释 \/* ... *\/
 * 2. 行注释 \/\/
 * 3. 字符串中的注释符号 "\/* ... *\/"
 * 4. 转义字符串 "\\""
 * @param content 需要处理的文本内容
 * @returns 处理后的文本，块注释被替换为空白
 */
function replace_block_comment(content: string): string {
    // 使用状态机处理文本
    let state = BlockCommentState.Default;
    let buffer = '';
    
    // 逐字符处理
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = i < content.length - 1 ? content[i + 1] : '';
        
        switch (state) {
            case BlockCommentState.Default:
                if (char === '/' && nextChar === '/') {
                    // 行注释开始
                    buffer += '//';
                    i++; // 跳过下一个 '/'
                    state = BlockCommentState.LineComment;
                } else if (char === '/' && nextChar === '*') {
                    // 块注释开始
                    buffer += '  ';
                    i++; // 跳过 '*'
                    state = BlockCommentState.BlockComment;
                } else if (char === '"') {
                    // 字符串开始
                    buffer += '"';
                    state = BlockCommentState.String;
                } else {
                    buffer += char;
                }
                break;
                
            case BlockCommentState.LineComment:
                if (is_new_line(char)) {
                    // 行注释结束
                    buffer += char;
                    state = BlockCommentState.Default;
                } else {
                    buffer += char;
                }
                break;
                
            case BlockCommentState.BlockComment:
                if (char === '*' && nextChar === '/') {
                    // 块注释结束
                    buffer += '  ';
                    i++; // 跳过 '/'
                    state = BlockCommentState.Default;
                } else if (is_new_line(char)) {
                    // 保留换行符
                    buffer += '\n';
                } else {
                    // 替换块注释内容为空格
                    buffer += ' ';
                }
                break;
                
            case BlockCommentState.String:
                if (char === '\\') {
                    // 处理转义字符
                    buffer += '\\';
                    state = BlockCommentState.StringEscape;
                } else if (char === '"') {
                    // 字符串结束
                    buffer += '"';
                    state = BlockCommentState.Default;
                } else {
                    buffer += char;
                }
                break;
                
            case BlockCommentState.StringEscape:
                // 处理转义后的字符
                buffer += char;
                state = BlockCommentState.String;
                break;
        }
    }
    
    // 处理未闭合的块注释
    if (state === BlockCommentState.BlockComment) {
        // 如果块注释未闭合，保持原样
        return content;
    }
    
    return buffer;
}

if (false) {
    console.log("=== 块注释测试 ===");
    
    // 辅助函数：比较结果与期望值
    function assertTest(actual: string, expected: string, testName: string): void {
        const normalizedActual = actual.replace(/\s+/g, ' ').trim();
        const normalizedExpected = expected.replace(/\s+/g, ' ').trim();
        const passed = normalizedActual === normalizedExpected;
        console.log(`测试${testName} - ${passed ? '通过 ✓' : '失败 ✗'}`);
        if (!passed) {
            console.log(`  实际: "${actual}"`);
            console.log(`  期望: "${expected}"`);
        }
    }
    
    // 测试1: 基本块注释
    console.log("\n测试1 - 基本块注释:");
    const test1Result = replace_block_comment(`a/*注释内容*/b`);
    const test1Expected = `a            b`;
    assertTest(test1Result, test1Expected, "1");
    
    // 测试2: 多行块注释
    console.log("\n测试2 - 多行块注释:");
    const test2Result = replace_block_comment(`a/*
        多行注释
        */a`);
    const test2Expected = `a  
        
          a`;
    assertTest(test2Result, test2Expected, "2");
    
    // 测试3: 行注释
    console.log("\n测试3 - 行注释:");
    const test3Result = replace_block_comment(`a//行注释
b`);
    const test3Expected = `a//行注释
b`;
    assertTest(test3Result, test3Expected, "3");
    
    // 测试4: 字符串中的注释符号
    console.log("\n测试4 - 字符串中的注释符号:");
    const test4Result = replace_block_comment(`"/*这不是注释*/"/*这是注释*/`);
    const test4Expected = `"/*这不是注释*/"            `;
    assertTest(test4Result, test4Expected, "4");
    
    // 测试5: 嵌套的星号
    console.log("\n测试5 - 嵌套的星号:");
    const test5Result = replace_block_comment(`a/*b**c*/d`);
    const test5Expected = `a        d`;
    assertTest(test5Result, test5Expected, "5");
    
    // 测试6: 转义字符串
    console.log("\n测试6 - 转义字符串:");
    const test6Result = replace_block_comment(`"\\"/*注释*/`);
    const test6Expected = `"\\"        `;
    assertTest(test6Result, test6Expected, "6");
    
    // 测试7: 混合场景
    console.log("\n测试7 - 混合场景:");
    const test7Result = replace_block_comment(`code1 /* 块注释 */ code2 // 行注释
code3 "/* 字符串 */" code4`);
    const test7Expected = `code1            code2 // 行注释
code3 "/* 字符串 */" code4`;
    assertTest(test7Result, test7Expected, "7");
}