// 通过有序传递解析尝试

import { Context, Define, Identifier, LineText, MergeToken, Node, Position, Range } from "./ast";
import { Token } from "./tokens";
import { removeComment } from "./tool";



/**
 * 移除块注释
 * @param context 
 * @param content 
 * @returns 
 */
function removeBlockComment(context:Context, content: string) {
    const nonBlockCommentContent = removeComment(content);
    context.nonBlockCommentContent = nonBlockCommentContent;
    return nonBlockCommentContent;
}

function linesByIndexOf(context:Context, content: string): LineText[] {
    const LineTexts: LineText[] = [];

    for (let index = 0; index < content.length;) {
        const newLineIndex = content.indexOf("\n", index);
        const fieldText = content.substring(index, newLineIndex == -1 ? content.length : newLineIndex + 1);

        const lineText = new LineText(context, fieldText);
        
        LineTexts.push(lineText);

        if (newLineIndex == -1) {
            break;
        } else {
            index = newLineIndex + 1;
        }
    }

    return LineTexts;
}

function toLineTexts(context:Context, content:string):LineText[] {
    const lineTexts = linesByIndexOf(context, content).map((lineText, index) => {
        lineText.loc.from(new Range(new Position(index, 0), new Position(index, lineText.getText().length)));
        return lineText;
    });
    context.lineTexts = lineTexts;
    return lineTexts;
}

function handleDefine(context:Context, lineTexts:LineText[]) {
    const defines:Define[] = [];
    const texts:LineText[] = [];

    // let inDefine = false;
    // 是否以 '\' 符号结尾
    // let isSpecial = false;

    lineTexts.forEach(lineText => {
        if (/^\s*#define\b/.test(lineText.getText())) {
            const result = /^(?<prefixSpace>\s*)#define(?<namePrefixSpace>\s+)(?<name>[\$_a-zA-Z\d]+)(?:(?<valuePrefixSpace>\s+)(?<value>.+))?\\?/.exec(lineText.getText());

            if (result && result.groups) {
                const define = new Define(context);
                const prefixSpaceLength = result.groups["prefixSpace"].length;
                define.loc.start = new Position(lineText.lineNumber(), prefixSpaceLength);
                
                const id = new Identifier(context, result.groups["name"]);
                const namePrefixSpaceLength = result.groups["namePrefixSpace"].length;
                id.loc.start = new Position(lineText.lineNumber(), prefixSpaceLength + 7 + namePrefixSpaceLength)
                id.loc.end = new Position(lineText.lineNumber(), prefixSpaceLength + 7 + namePrefixSpaceLength + id.name.length)

                define.id = id;

                if (result.groups["value"]) {
                    define.value = result.groups["value"]
                }

                define.loc.end = new Position(lineText.lineNumber(), result[0].length);
                
                defines.push(define);
            } else {
                // 错误定义
            }
            
        } else {
            texts.push(lineText);
        }
    });

    defines.forEach(define => context.addDefine(define));
    context.nonDefineLineTexts = texts;

}



function tokenWithLineTextIsSameLine(token:Token, lineText:LineText):boolean {
    return false;
}

class TokenLineText extends  Node{
    constructor(context: Context) {
        super(context);
    }

    public mergeTokens: (Token | MergeToken)[] = [];

    public isEmpty(): boolean {
        return this.mergeTokens.length == 0;
    }
    
    public lineNumber(): number {
        return this.mergeTokens[0]?.start.line ?? 0;
    }

    public length(): number {
        return this.mergeTokens.length;
    }

    
}

function handlInnerLuaTokens(context:Context, lineTexts:LineText[]) {
    let inLua = false;
    const tlts:TokenLineText[] = [];
    let newTokenLine:TokenLineText|null = null;
    let newTokens:(Token|MergeToken)[] = [];
    let ref:MergeToken = null as any;
    for (let index = 0; index < lineTexts.length;) {
        const lineText = lineTexts[index];
        const tokens = lineText.tokens;
        if (newTokenLine === null) {
            newTokenLine = new TokenLineText(context);
        }
        for (let i = 0; i < tokens.length;) {
            const currentToken = tokens[i];
            const nextToken = tokens[i + 1];
            if (inLua) {
                if (currentToken.value == "?" && nextToken && nextToken.value == ">") {
                    i += 2;
                    inLua = false;
                    ref.tokens.push(currentToken, nextToken);
                    ref = null as any;
                } else {
                    i++;
                    ref.tokens.push(currentToken);
                }
            } else {
                if (currentToken.value == "<" && nextToken && nextToken.value == "?") {
                    i += 2;
                    inLua = true;
                    ref = new MergeToken();
                    ref.tokens.push(currentToken, nextToken);
                    newTokens.push(ref);
                } else {
                    i++;
                    newTokens.push(currentToken);
                }
            }
        }
        if (!inLua) {
            newTokenLine.mergeTokens = newTokens;
            tlts.push(newTokenLine);
            newTokens = [];
            newTokenLine = null;
        }
    }

    context.xTokens = newTokens;

    return tlts;
}

interface BlockDefine {
    start: RegExp|string;
    end: RegExp|string;
}

class BlockDefineImplement implements BlockDefine {
    readonly start: string | RegExp;
    readonly end: string | RegExp;

    public is:boolean = false;

    constructor(start: string | RegExp, end: string | RegExp) {
        this.start = start;
        this.end = end;
    }
}

// const blockPresets:BlockDefineImplement[] = [
//     new BlockDefineImplement(/\/\//)
// ];

/**
 * 将文本转换为field,可以是行或者是块
 * 取决于语法
 * @param params 
 */
// function spread(context:Context, content:string, ...blockDefines:BlockDefine[])(LineText|Block)[] {
//     const lineTexts = toLineTexts(context, content);


// }

/*
0、块注释
1、define
2、inner lua
3、注释
4、行或块
5、textmacro
6、ast
7、zinc
8、cjass
*/

// work, but unseble
function lineTextsToString(lineTexts:LineText[]):string {
    let lineNumber = 0;
    let content:string = "";
    const pushLine = (num:number) => {
        for (let index = 0; index < num; index++) {
            content += "\n";
        }
    };
    lineTexts.forEach(lineText => {
        pushLine(lineText.lineNumber() - lineNumber);
        
        content += lineText.getText();

        lineNumber = lineText.lineNumber();
    });

    return content;
}



export function jassParse(context:Context, content:string) {
    const nonBlockCommentContent = removeBlockComment(context, content);
    const lineTexts = toLineTexts(context, nonBlockCommentContent);
    handleDefine(context, lineTexts);

    const tlts = handlInnerLuaTokens(context, context.nonDefineLineTexts);
    tlts.forEach((x) => {
        x.mergeTokens.forEach(mt => {
            if (mt instanceof Token) {
                console.log(mt.value);
            } else {
                // mt.tokens.forEach(t => {
                //     console.log(t.value);
                // })
                console.log(mt.tokens.map(x => x.value).join(""));
            }
        })

    });
}


