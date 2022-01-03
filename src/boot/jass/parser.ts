import { time } from "console";
import {Position, Range} from "../common";
import { isNewLine, isSpace } from "../tool";
import { tokenize } from "./tokens";

class LineText extends Range{

    private text:string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    // 是否空行
    public isEmpty():boolean {
        return this.text.trimStart() === "";
    }

    public getText():string {
        return this.text;
    }

    public setText(text: string):void {
        this.text = text;
    }

    public lineNumber() :number {
        return this.start.line;
    }

    // 第一个字符下标
    public firstCharacterIndex() :number {
        let index = 0;
        for (; index < this.text.length; index++) {
            const char = this.text[index];
            if (!isSpace(char)) {
                return index;
            }
        }
        return index;
    }

	public length():number {
		return this.text.length;
	}

    public clone():LineText {
        return Object.assign(new LineText(this.getText()), this);
    }

}

class MultilineText extends Range {

}

/**
 * 替换块注释为空白文本
 * @param content 
 * @returns 
 */
function replaceBlockComment(content: string): string {

    enum BlockCommentState {
        Default,
        Div,
        LineComment,
        BlockComment,
        BlockCommentWillBreak,
        String,
        StringEscape,
    };

    const BlockCommentResult = class {
        public readonly state: BlockCommentState;
        public readonly text: string;

        constructor(text: string, state: BlockCommentState = BlockCommentState.Default) {
            this.state = state;
            this.text = text;
        }

    };

    /**
     * 处理块级注释核心方法
     * @param newText 新的文本段
     * @param preState 上一次结果的状态
     * @returns 处理后的文本和最后的状态
     */
    const handle = (newText:string, preState: BlockCommentState) => {

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
                if (isNewLine(char)) {
                    state = BlockCommentState.Default;
                }
            } else if (state == BlockCommentState.BlockComment) {
                if (char == "*") {
                    state = BlockCommentState.BlockCommentWillBreak;
                }
                if (isNewLine(char)) {
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
                if (isNewLine(char)) {
                    chars[index] = "\n";
                } else {
                    chars[index] = " ";
                }
            } else if (state == BlockCommentState.String) {
                if (char == "\"" || isNewLine(char)) {
                    state = BlockCommentState.Default;
                } else if (char == "\\") {
                    state = BlockCommentState.StringEscape;
                }
            } else if (state == BlockCommentState.StringEscape) {
                if (isNewLine(char)) {
                    state = BlockCommentState.Default;
                } else {
                    state = BlockCommentState.String;
                }
            }

        }

        return new BlockCommentResult(chars.join(""), state);
    };

    let lastState:BlockCommentState = BlockCommentState.Default;
    let text: string = "";
    for (let index = 0; index < content.length; ) {
        const newLineIndex = content.indexOf("\n", index);
        const fieldText = content.substring(index, newLineIndex == -1 ? content.length : newLineIndex + 1);
        
        const result = handle(fieldText, lastState);
        text += result.text;
        lastState = result.state;
        if (newLineIndex == -1) {
            break;
        } else {
            index = newLineIndex + 1;
        }
    }

    return text;
}

function linesByIndexOf(content: string): LineText[] {
    const LineTexts:LineText[] = [];

    for (let index = 0; index < content.length; ) {
        const newLineIndex = content.indexOf("\n", index);
        const fieldText = content.substring(index, newLineIndex == -1 ? content.length : newLineIndex + 1);
        
        LineTexts.push(new LineText(fieldText));

        if (newLineIndex == -1) {
            break;
        } else {
            index = newLineIndex + 1;
        }
    }

    return LineTexts;
}

function linesBySplit(content: string): LineText[] {
    const ls = content.split("\n");

    const last = ls.pop();

    const lineTexts = ls.map(x => new LineText(x + "\n"));

    if (last) {
        lineTexts.push(new LineText(last));
    }

    return lineTexts;
}

/**
 * 
 * @param content 
 * @returns 
 */
function lines(content: string): LineText[] {
    // const funcs = [linesByIndexOf, linesBySplit];
    // return funcs[Math.floor(Math.random() * funcs.length)](content).map((lineText, index) => {
    //     lineText.start = new Position(index, 0);
    //     lineText.end = new Position(index, lineText.text.length);
    //     return lineText;
    // });
    return linesByIndexOf(content).map((lineText, index) => {
        lineText.start = new Position(index, 0);
        lineText.end = new Position(index, lineText.getText().length);
        return lineText;
    });
}

function zincLines(content: string): LineText[] {
    let inZinc = false;
    return lines(content).filter(lineText => {
        if (/^\s*\/\/!\s+zinc\b/.test(lineText.getText())) {
            inZinc = true;
            return false; 
        } else if (/^\s*\/\/!\s+endzinc\b/.test(lineText.getText())) {
            inZinc = false;
            return false; 
        } else {
            return inZinc;
        }
    })
}

interface Document {
    foreach(): void;
}

class TextMacro extends Range {
    private readonly lineTexts: LineText[] = [];
    private name:string;
    private takes:string[];

    constructor(name: string = "", takes: string[] = []) {
        super();
        this.name = name;
        this.takes = takes;
    }

    public getName() :string {
        return this.name;
    }
    public setName(name:string){
        this.name = name;
    }

    public push(lineText: LineText) {
        this.lineTexts.push(lineText);
    }
    
    public remove(lineNumber: number) {
        for (let index = 0; index < this.lineTexts.length; index++) {
            const lineText = this.lineTexts[index];
            if (lineText.lineNumber() == lineNumber) {
                this.lineTexts.splice(index, 1);
                break;
            }
        }
    }

    public foreach(callback: (lineText: LineText, index: number) => void, params: string[] = []) {
        this.lineTexts.map((lineText, textMacroIndex) => {
            const replacedLineText = lineText.clone();
            
            let newText = lineText.getText();
            this.takes.forEach((take, takeIndex) => {
                newText = newText.replace(new RegExp(`\\$${take}\\$`, "g"), params[takeIndex] ?? "");
            })
            replacedLineText.setText(newText);
            callback(replacedLineText, textMacroIndex);
        });
    }

    public addTake(take: string) {
        this.takes.push(take);
    }

}

class RunTextMacro extends Range {
    private name: string;
    private params: string[];

    constructor(name: string = "", params: string[] = []) {
        super();
        this.name = name;
        this.params = params;
    }

    public getName() :string {
        return this.name;
    }

    public setName(name: string):void {
        this.name = name;
    }

    public addParam(param: string) {
        this.params.push(param);
    }

    public getParams() :string[] {
        return this.params.map(param => param.replace(/^"/, "").replace(/"$/, ""));
    }

}

function parseTextMacro(text: string, textMacro: TextMacro) {
    text = text.replace(/\/\/!/, "   ");
    const tokens = tokenize(text);
    if (tokens[0].isId() && tokens[0].value == "textmacro") {
        if (tokens[1].isId()) {
            textMacro.setName(tokens[1].value)
            if (tokens[2].isOp() && tokens[2].value == "(") {
                let state = 0;
                for (let index = 3; index < tokens.length; index++) {
                    const token = tokens[index];
                    if (state == 0) {
                        if (token.isOp() && token.value == ")") {
                            break;
                        } else if (token.isId()) {
                            textMacro.addTake(token.value)
                            state = 1;
                        }
                    } else if (state == 1) {
                        if (token.isOp() && token.value == ")") {
                            break;
                        } else if (token.isOp() && token.value == ",") {
                            state = 0;
                        }
                    }
                }
            }
        }
    }
}

function parseRunTextMacro(text: string, runTextMacro: RunTextMacro) {
    text = text.replace(/\/\/!/, "   ");
    const tokens = tokenize(text);
    if (tokens[0].isId() && tokens[0].value == "runtextmacro") {
        if (tokens[1].isId()) {
            runTextMacro.setName(tokens[1].value)
            if (tokens[2].isOp() && tokens[2].value == "(") {
                let state = 0;
                for (let index = 3; index < tokens.length; index++) {
                    const token = tokens[index];
                    if (state == 0) {
                        if (token.isOp() && token.value == ")") {
                            break;
                        } else if (token.isString()) {
                            runTextMacro.addParam(token.value)
                            state = 1;
                        }
                    } else if (state == 1) {
                        if (token.isOp() && token.value == ")") {
                            break;
                        } else if (token.isOp() && token.value == ",") {
                            state = 0;
                        }
                    }
                }
            }
        }
    }
}

class TextDocument {

    constructor(content: string) {
        // 移除了多行注释的新文本
        const newContent = replaceBlockComment(content);
        this.lineTexts = lines(newContent);
        this.textMacros = this.findTextMacro(this.lineTexts);
        // this.handleTextMacro(lineTexts);
    }

    private lineTexts:LineText[] = [];
    private textMacros: TextMacro[] = [];

    private findTextMacro(lineTexts: LineText[]): TextMacro[] {
        const textMacros: TextMacro[] = [];
        let textMacro:TextMacro|null = null;
        this.lineTexts = this.lineTexts.filter((lineText) => {
            if (/^\s*\/\/!\s+textmacro/.test(lineText.getText())) {
                textMacro = new TextMacro()
                textMacro.setRange(lineText);
                parseTextMacro(lineText.getText(), textMacro);
                textMacros.push(textMacro);
                return false;
            } else if (/\/\/!\s+endtextmacro/.test(lineText.getText())) {
                if (textMacro) {
                    textMacro.end = lineText.end;
                }
                textMacro = null;
                return false;
            } else if (textMacro) {
                textMacro.push(lineText);
                textMacro.end = lineText.end;
                return false;
            }
            return true;
        });
        return textMacros;
    }

    private handleTextMacro(lineTexts: LineText[]) {

        console.log(this.findTextMacro(lineTexts));
        this.findTextMacro(lineTexts).forEach((textMacro, index) => {
            textMacro.foreach((lineText, lineTextIndex) => {
                console.log(lineText.getText());
            }, ["物质", "只能"]);
        })
        

        for (let index = 0; index < lineTexts.length; index++) {
            const lineText = lineTexts[index];
            if (/\/\/!\s+runtextmacro/.test(lineText.getText())) {

            }
        }
    }

    public foreach(callback: (lineText: LineText, index: number) => void): void {
        this.lineTexts.forEach((lineText) => {
            if (/^\s*\/\/!\s+runtextmacro/.test(lineText.getText())) {
                const runTextMacro = new RunTextMacro();
                parseRunTextMacro(lineText.getText(), runTextMacro);
                runTextMacro.setRange(lineText);
            }
        });
    }

    public getTextMacros() :TextMacro[] {
        return this.textMacros;
    }
}

export {
    replaceBlockComment,
    lines
};

if (true) {
    const text = `a/"\\"
    /*
    123
    */c`;
    console.log(text, "\n\n", replaceBlockComment(text));
    console.log(text.length, replaceBlockComment(text).length);


    console.log("===============================================");
    console.log(linesByIndexOf(`111
    222
    333`));
    console.log("===============================================");
    console.log(linesBySplit(`111
    222
    333`));

    const count = 10000;

    // 不同实现耗时
    console.time("linesByIndexOf");
    for (let index = 0; index < count; index++) {
        linesByIndexOf(`111
        222
        333`)
    }
    console.timeEnd("linesByIndexOf");
    console.time("linesBySplit");
    for (let index = 0; index < count; index++) {
        linesBySplit(`111
        222
        333`)
    }
    console.timeEnd("linesBySplit");

    console.time("lines");
    for (let index = 0; index < count; index++) {
        lines(`111
        222
        333`)
    }
    console.timeEnd("lines");
    
    // zinc
    console.log("zinc 内容");
    console.log(zincLines(`aaa
    //! zinc
    bbb
    //! endzinc
    //! zinc
    ccc
    //! endzinc
    ddd`));
    console.log("parse=======================");
    
    new TextDocument(`
    //! textmacro a666(aa,bb)
    ???$aa$ $bb$
    //! endtextmacro
    `)

}


