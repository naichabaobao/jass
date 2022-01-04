import {Position, Range} from "../common";
import { isNewLine, isSpace } from "../tool";
import { Func, Library, Method, Native, Take } from "./ast";
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

    public foreach(callback: (lineText: LineText) => void, params: string[] = []) {
        this.lineTexts.map((lineText) => {
            const replacedLineText = lineText.clone();
            
            let newText = lineText.getText();
            this.takes.forEach((take, takeIndex) => {
                newText = newText.replace(new RegExp(`\\$${take}\\$`, "g"), params[takeIndex] ?? "");
            })
            replacedLineText.setText(newText);
            callback(replacedLineText);
        });
    }

    public addTake(take: string) {
        this.takes.push(take);
    }

}

class RunTextMacro extends Range {
    private name: string;
    private params: string[];
    private lineText: LineText| null;

    constructor(name: string = "", params: string[] = [], lineText: LineText|null = null) {
        super();
        this.name = name;
        this.params = params;
        this.lineText = lineText;
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

    public getLineText() :LineText|null {
        return this.lineText;
    }

}

class ZincBlock extends Range {
    public readonly lineTexts: LineText[] = [];

    constructor() {
        super();
    }
}

class GlobalsBlock extends Range {
    public readonly lineTexts: LineText[] = [];

    constructor() {
        super();
    }
}

class LibraryBlock extends Range {
    public readonly lineTexts: LineText[] = [];

    constructor() {
        super();
    }
}

class StructBlock extends Range {
    public readonly lineTexts: LineText[] = [];

    constructor() {
        super();
    }
}

type BlockType = "globals" | "library" | "struct" | "function" | "method";
class Block extends Range  {
    public type:BlockType;
    public readonly lineTexts: (LineText|Block)[] = [];

    constructor(type:BlockType) {
        super();
        this.type = type;
    }

}


class MethodBlock extends Range {
    public readonly lineTexts: LineText[] = [];

    constructor() {
        super();
    }
}

class FunctionBlock extends Range {
    public readonly lineTexts: LineText[] = [];

    constructor() {
        super();
    }

    public getFunctionHeader() : LineText {
        return this.lineTexts[0];
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

function parseFunction(lineText: LineText, func: (Func|Native|Method)) {

    const tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });
    let keyword:"function"|"native"|"method" = "function";
    if (func instanceof Method) {
        keyword = "method";
    } else if (func instanceof Func) {
        keyword = "function";
    } else if (func instanceof Native) {
        keyword = "native";
    }
    const functionIndex = tokens.findIndex((token) => token.isId() && token.value == keyword);
    const takesIndex = tokens.findIndex((token) => token.isId() && token.value == "takes");
    const returnsIndex = tokens.findIndex((token) => token.isId() && token.value == "returns");

    if (functionIndex != -1) {
        if (tokens[functionIndex + 1] && tokens[functionIndex + 1].isId()) {
            func.name = tokens[functionIndex + 1].value;
            func.nameToken = tokens[functionIndex + 1];
        }
    }
    if (returnsIndex != -1) {
        if (tokens[returnsIndex + 1] && tokens[returnsIndex + 1].isId()) {
            func.returns = tokens[returnsIndex + 1].value;
        }
    }
    if (takesIndex != -1) {
        const takesTokens = tokens.slice(takesIndex + 1, returnsIndex != -1 ? returnsIndex : undefined);
        
        let state = 0;
        let take:Take|null = null;
        for (let index = 0; index < takesTokens.length; index++) {
            const token = takesTokens[index];
            if (state == 0) {
                if (token.isId()) {
                    if (token.value == "nothing") {
                        break;
                    }
                    take = new Take(token.value, "");
                    take.type = token.value;
                    take.loc.start = new Position(token.line, token.position);
                    func.takes.push(take);
                    state = 1;
                }
            } else if (state == 1) {
                if (token.isId()) {
                    if (take) {
                        take.name = token.value;
                        take.loc.end = new Position(token.line, token.end);
                        take.nameToken = token;
                        func.takes.push(take);
                        state = 2;
                    }
                } else if (token.isOp() && token.value == ",") {
                    state = 0;
                }
            } else if (state == 2) {
                if (token.isOp() && token.value == ",") {
                    state = 0;
                }
            }
        }
    }
    
    if (functionIndex != -1) {
        const modTokens = tokens.slice(0, functionIndex);

        if (func instanceof Native) {
            modTokens.forEach((token) => {
                if (token.isId() && token.value == "constant") {
                    func.setConstant(true);
                }
            });
        }
        if (func instanceof Func) {
            modTokens.forEach((token) => {
                if (token.isId() && token.value == "private") {
                    func.tag = "private";
                } else if (token.isId() && token.value == "public") {
                    func.tag = "public";
                }
            });
        }
        if (func instanceof Method) {
            modTokens.forEach((token) => {
                if (token.isId() && token.value == "private") {
                    func.tag = "private";
                } else if (token.isId() && token.value == "public") {
                    func.tag = "public";
                }
                if (token.isId() && token.value == "static") {
                    func.modifier = "static";
                } else if (token.isId() && token.value == "stub") {
                    func.modifier = "stub";
                }
            });
        }
    }
}

function parseLibrary(lineText: LineText, library: Library) {

    const tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });

    const libraryIndex = tokens.findIndex((token) => token.isId() && token.value == "library");

    if (libraryIndex != -1) {
        library.name = tokens[libraryIndex + 1].value;
        library.loc.start = new Position(tokens[libraryIndex].line, tokens[libraryIndex].position);
        const initializerIndex = tokens.findIndex((token) => token.isId() && token.value == "initializer");
        if (initializerIndex != -1) {
            if (tokens[initializerIndex + 1] && tokens[initializerIndex + 1].isId()) {
                library.initializer = tokens[initializerIndex + 1].value;
            }
        }
        
        const requireIndex = tokens.findIndex((token) => token.isId() && (token.value == "requires" || token.value == "needs" || token.value == "uses"));
        if (requireIndex != -1) {
            const requireTokens = tokens.slice(requireIndex + 1);
            
            let state = 0;
            requireTokens.forEach((token) => {
                if (state == 0) {
                    if (token.isId()) {
                        library.requires.push(token.value);
                        state = 1;
                    }
                } else if (state == 1) {
                    if (token.isOp() && token.value == ",") {
                        state = 0;
                    }
                }
            });
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
        this.textMacros = this.findTextMacro();
        this.parseRunTextMacro();
        this.zincBlocks = this.findZincBlock();
        this.parseOutline();
    }

    private lineTexts:(LineText)[] = [];
    private textMacros: TextMacro[] = [];
    private expandLineTexts:(LineText|RunTextMacro)[] = [];
    private zincBlocks:ZincBlock[] = [];

    private findTextMacro(): TextMacro[] {
        const textMacros: TextMacro[] = [];
        let textMacro:TextMacro|null = null;
        this.lineTexts = this.lineTexts.filter((lineText) => {
            if (/^\s*\/\/!\s+textmacro\b/.test(lineText.getText())) {
                textMacro = new TextMacro()
                textMacro.setRange(lineText);
                parseTextMacro(lineText.getText(), textMacro);
                textMacros.push(textMacro);
                return false;
            } else if (/\/\/!\s+endtextmacro\b/.test(lineText.getText())) {
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

    private parseRunTextMacro() {
        this.lineTexts.forEach(lineText => {
            if (/^\s*\/\/!\s+runtextmacro\b/.test(lineText.getText())) {
                const runTextMacro = new RunTextMacro();
                parseRunTextMacro(lineText.getText(), runTextMacro);
                runTextMacro.setRange(lineText);
                this.expandLineTexts.push(runTextMacro);

                // const textMacro = this.textMacros.find((textMacro) => textMacro.getName() == runTextMacro.getName());
            } else {
                this.expandLineTexts.push(lineText);
            }
        })
    }

    private findZincBlock() {
        const zincBlocks:ZincBlock[] = [];
        let zinc:ZincBlock|null = null;
        this.expandLineTexts = this.expandLineTexts.filter(x => {
            if (x instanceof LineText) {
                if (/^\s*\/\/!\s+zinc\b/.test(x.getText())) {
                    zinc = new ZincBlock();
                    zincBlocks.push(zinc);
                    return false;
                } else if (/^\s*\/\/!\s+endzinc\b/.test(x.getText())) {
                    zinc = null;
                    return false;
                } else if (zinc) {
                    zinc.lineTexts.push(x);
                    return false;
                } else {
                    return true;
                }
            } else if(x instanceof RunTextMacro) {
                const textMacro = this.textMacros.find((textMacro) => textMacro.getName() == x.getName());
                textMacro?.foreach((lineText) => {
                    if (/^\s*\/\/!\s+zinc\b/.test(lineText.getText())) {
                        zinc = new ZincBlock();
                        zincBlocks.push(zinc);
                    } else if (/^\s*\/\/!\s+endzinc\b/.test(lineText.getText())) {
                        zinc = null;
                    } else if (zinc) {
                        zinc.getLineTexts().push(lineText);
                    }
                }, x.getParams());
                return true;
            }
        });
        return zincBlocks;
    }

    private parseOutline() {
        let globalsBlock:GlobalsBlock|null = null;
        let functionBlock:FunctionBlock|null = null;
        let libraryBlock:LibraryBlock|null = null;
        function handle(lineText: LineText) {
            if (/^\s*globals\b/.test(lineText.getText())) {
                globalsBlock = new GlobalsBlock();
                globalsBlock.setRange(lineText);
            } else if (/^\s*endglobals\b/.test(lineText.getText())) {
                if (globalsBlock) {
                    globalsBlock.end = lineText.end;
                    globalsBlock = null;
                }
            } else if (globalsBlock) {
                globalsBlock.lineTexts.push(lineText);
                globalsBlock.end = lineText.end;
            } else if (/^\s*function\b/.test(lineText.getText())) {
                functionBlock = new FunctionBlock();
                functionBlock.setRange(lineText);
                functionBlock.lineTexts.push(lineText);
            } else if (/^\s*endfunction\b/.test(lineText.getText())) {
                if (functionBlock) {
                    functionBlock.end = lineText.end;
                    functionBlock = null;
                }
            } else if (functionBlock) {
                functionBlock.lineTexts.push(lineText);
                functionBlock.end = lineText.end;
            } else if (/^\s*library\b/.test(lineText.getText())) {
                libraryBlock = new LibraryBlock();
                libraryBlock.setRange(lineText);
                libraryBlock.lineTexts.push(lineText);
            } else if (/^\s*endlibrary\b/.test(lineText.getText())) {
                if (libraryBlock) {
                    libraryBlock.end = lineText.end;
                    libraryBlock = null;
                }
            } else if (libraryBlock) {
                libraryBlock.lineTexts.push(lineText);
                libraryBlock.end = lineText.end;
            }
        }
        this.expandLineTexts.forEach(x => {
            if (x instanceof RunTextMacro) {
                const textMacro = this.textMacros.find((textMacro) => textMacro.getName() == x.getName());
                if (textMacro) {
                    textMacro.foreach((lineText) => {
                        handle(lineText);
                    }, x.getParams());
                }
            } else if (x instanceof LineText) {
                handle(x);
            }
        });
    }

    /**
     * @deprecated 后面会移除
     * @param callback 
     */
    public foreach(callback: (lineText: LineText) => void): void {
        this.lineTexts.forEach((lineText) => {
            if (/^\s*\/\/!\s+runtextmacro/.test(lineText.getText())) {
                const runTextMacro = new RunTextMacro();
                parseRunTextMacro(lineText.getText(), runTextMacro);
                runTextMacro.setRange(lineText);
                

                const textMacro = this.textMacros.find((textMacro) => textMacro.getName() == runTextMacro.getName());
                if (textMacro) {
                    textMacro.foreach((lineText) => {
                        callback(lineText);
                    }, runTextMacro.getParams());
                } else {
                    callback(lineText);
                }
            } else {
                callback(lineText);
            }
        });
    }

    public getTextMacros() :TextMacro[] {
        return this.textMacros;
    }

    public getZincBlocks() {
        return this.zincBlocks;
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
    //! textmacro a666(name,return_type)
    function $name$ takes nothing returns $return_type$
    endfunction
    //! endtextmacro
    //! runtextmacro a666("test_func_name", "nothing")
    `).foreach((lineText) => {
        console.log(lineText.lineNumber(), lineText.getText())
    });

    new TextDocument(`
    //! textmacro start_zinc()
    wuyong
    //! zinc
    youyong
    //! endtextmacro

    //! textmacro end_zinc(end)
    $end$
    //! endzinc
    //! endtextmacro

    //! runtextmacro start_zinc()

    zinccontent

    //! runtextmacro end_zinc("canshu")

    `).getZincBlocks().forEach(x => {
        console.log(x);
        
    })
    

    const func = new Func("");
    const lineText = new LineText("private function func_name takes string , integer anan");
    parseFunction(lineText, func);
    console.log(func);
    

    const lib = new Library("");
    const libLineText = new LineText("library dianjie initializer ifunc requires bbb, ccc, eee");
    parseLibrary(libLineText, lib);
    console.log(lib);

}


