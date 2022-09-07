import { isKeyword, Keywords, canCjassReturn } from "../provider/keyword";
import { isNewLine, isSpace } from "../tool";
import { lines } from "./tool";
import { parseZinc } from "../zinc/parse";
import { DefineMacro, Document, Func, Global, Identifier, Library, LineComment, Local, Member, Method, Native, Program, Struct, Take, Position, Range, LineText } from "./ast";
import { Token, Tokenize, tokenize, Tokenizer } from "./tokens";


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
    const handle = (newText: string, preState: BlockCommentState) => {

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

    let lastState: BlockCommentState = BlockCommentState.Default;
    let text: string = "";
    for (let index = 0; index < content.length;) {
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

class TextMacro extends Range {
    private readonly lineTexts: LineText[] = [];
    private name: string;
    private takes: string[];

    constructor(name: string = "", takes: string[] = []) {
        super();
        this.name = name;
        this.takes = takes;
    }

    public getName(): string {
        return this.name;
    }
    public setName(name: string) {
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
class Include extends Range {
    private path: string;

    constructor(path: string) {
        super();
        this.path = path;
    }

    public getPath() {
        return this.path;
    }

}

class RunTextMacro extends Range {
    private name: string;
    private params: string[];
    private lineText: LineText | null;

    constructor(name: string = "", params: string[] = [], lineText: LineText | null = null) {
        super();
        this.name = name;
        this.params = params;
        this.lineText = lineText;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public addParam(param: string) {
        this.params.push(param);
    }

    public getParams(): string[] {
        return this.params.map(param => param.replace(/^"/, "").replace(/"$/, ""));
    }

    public getLineText(): LineText | null {
        return this.lineText;
    }

}

type BlockType = "globals" | "library" | "struct" | "function" | "method" | "zinc" | "program";
class Block extends Range {
    public type: BlockType;
    public parent: Block | null = null;
    public readonly childrens: (LineText | Block)[] = [];

    constructor(type: BlockType) {
        super();
        this.type = type;
    }

}

function parseTextMacro(text: string, textMacro: TextMacro) {
    text = text.replace(/\/\/!/, "   ");
    const tokens = tokenize(text);
    if (tokens[0].isId() && tokens[0].value == "textmacro") {
        if (tokens[1].isId()) {
            textMacro.setName(tokens[1].value)
            if (tokens[2].isId() && tokens[2].value == "takes") {
                let state = 0;
                for (let index = 3; index < tokens.length; index++) {
                    const token = tokens[index];
                    if (state == 0) {
                        if (token.isId()) {
                            textMacro.addTake(token.value)
                            state = 1;
                        } else break;
                    } else if (state == 1) {
                        if (token.isOp() && token.value == ",") {
                            state = 0;
                        } else break;
                    }
                }
            }
            /*
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
            }*/
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

function parseFunction(lineText: LineText, func: (Func | Native | Method)) {

    const tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });
    
    let keyword: "function" | "native" | "method" = "function";
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
        const takesTokens = tokens.slice(takesIndex + 1);//, returnsIndex != -1 ? returnsIndex : undefined);

        let state = 0;
        let take: Take | null = null;
        for (let index = 0; index < takesTokens.length; index++) {
            const token = takesTokens[index];
            if (state == 0) {
                if (token.isId() && token.value == "returns") {
                    break;
                } else if (token.isId()) {
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
                if (token.isId() && token.value == "returns") {
                    break;
                } else if (token.isId()) {
                    if (take) {
                        take.name = token.value;
                        take.loc.end = new Position(token.line, token.end);
                        take.nameToken = token;
                        state = 2;
                    }
                } else if (token.isOp() && token.value == ",") {
                    state = 0;
                }
            } else if (state == 2) {
                if (token.isOp() && token.value == ",") {
                    state = 0;
                } else if (token.isId() && token.value == "returns") {
                    break;
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

    const libraryIndex = tokens.findIndex((token) => token.isId() && (token.value == "library" || token.value == "library_once"));
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
            let requireTokens = tokens.slice(requireIndex + 1);

            if (requireTokens[0] && requireTokens[0].isId() && requireTokens[0].value == "optional") {
                requireTokens = requireTokens.slice(1);
            }

            let state = 0;
            requireTokens.forEach((token) => {
                if (state == 0) {
                    if (token.isId() && token.value == "optional") {
                        // ignore
                    } else if (token.isId()) {
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

function parseLineComment(lineText: LineText, lineComment: LineComment) {
    const tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });
    const lineCommentToken = tokens.find((token) => token.isComment());
    if (lineCommentToken) {
        // const lineComment = new LineComment(lineCommentToken.value);
        lineComment.setText(lineText.getText());
        lineComment.loc.start = new Position(lineText.lineNumber(), lineCommentToken.position);
        lineComment.loc.end = new Position(lineText.lineNumber(), lineCommentToken.end);
    }
}

function parseGlobal(lineText: LineText, global: Global) {
    let tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });
    let index = 0;
    if (tokens[index]) {
        if (tokens[index].isId()) {
            if (tokens[index].value == "private") {
                global.tag = "private";
                index++;
            } else if (tokens[index].value == "public") {
                global.tag = "public";
                index++;
            }
        }
    }

    global.loc.from(lineText);
    if (tokens[index] && tokens[index].isId() && tokens[index].value == "constant") {
        global.isConstant = true;
        index++;
    }
    if (tokens[index] && tokens[index].isId()) {
        global.type = tokens[index].value;
        index++;
    }
    if (tokens[index] && tokens[index].isId()) {
        if (tokens[index].value == "array") {
            global.isArray = true;
            index++;
            if (tokens[index] && tokens[index].isId()) {
                global.name = tokens[index].value;
                global.nameToken = tokens[index];
            }
        } else {
            global.name = tokens[index].value;
            global.nameToken = tokens[index];
        }
    }
}

function parseStruct(lineText: LineText, struct: Struct) {
    let tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });
    const structIndex = tokens.findIndex((token) => token.isId() && token.value == "struct");
    if (structIndex != -1 && tokens[structIndex + 1] && tokens[structIndex + 1].isId()) {
        struct.name = tokens[structIndex + 1].value;
    }
    
    const extendsIndex = tokens.findIndex((token) => token.isId() && token.value == "extends");
    if (extendsIndex != -1) {
        
        const extendsTokens = tokens.slice(extendsIndex + 1);
        let state = 0;
        extendsTokens.forEach((token) => {
            if (state == 0) {
                if (token.isId()) {
                    // 
                    struct.extends.push(token.value);
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

function parseLocal(lineText: LineText, local: Local) {
    let tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });

    const localIndex = tokens.findIndex((token) => token.isId() && token.value == "local");
    local.loc.setRange(lineText);

    if (localIndex != -1) {
        local.loc.start = new Position(lineText.lineNumber(), tokens[localIndex].position);
        if (tokens[localIndex + 1] && tokens[localIndex + 1].isId()) {
            local.type = tokens[localIndex + 1].value;
        }
        
        if (tokens[localIndex + 2] && tokens[localIndex + 2].isId()) {
            if (tokens[localIndex + 2].value == "array") {
                local.isArray = true;
                if (tokens[localIndex + 3] && tokens[localIndex + 3].isId()) {
                    local.name = tokens[localIndex + 3].value;
                    local.nameToken = tokens[localIndex + 3];
                }
            } else {
                local.name = tokens[localIndex + 2].value;
                local.nameToken = tokens[localIndex + 2];
            }
        }
    }
}

function parseMember(lineText: LineText, member: Member) {
    let tokens = tokenize(lineText.getText()).map((token) => {
        token.line = lineText.lineNumber();
        return token;
    });

    member.loc.setRange(lineText);

    if (tokens[0]) {
        if (tokens[0].isId() && tokens[0].value == "private") {
            member.tag = "private";
            tokens = tokens.slice(1);
        } else if (tokens[0].isId() && tokens[0].value == "public") {
            member.tag = "public";
            tokens = tokens.slice(1);
        }
    }
    if (tokens[0]) {
        if (tokens[0].isId() && tokens[0].value == "static") {
            member.modifier = "static";
            tokens = tokens.slice(1);
        } else if (tokens[0].isId() && tokens[0].value == "stub") {
            member.modifier = "stub";
            tokens = tokens.slice(1);
        }
    }
    if (tokens[0] && tokens[0].isId()) {
        member.type = tokens[0].value;
    }

    if (tokens[1] && tokens[1].isId()) {
        if (tokens[1].value == "array") {
            member.isArray = true;
            if (tokens[2] && tokens[2].isId()) {
                member.name = tokens[2].value;
                member.nameToken = tokens[2];
            }
        } else {
            member.name = tokens[1].value;
            member.nameToken = tokens[1];
        }
    }


    const localIndex = tokens.findIndex((token) => token.isId() && token.value == "local");

    if (localIndex != -1) {
        member.loc.start = new Position(lineText.lineNumber(), tokens[localIndex].position);
        if (tokens[localIndex + 1] && tokens[localIndex + 1].isId()) {
            member.type = tokens[localIndex + 1].value;
        }
        
        if (tokens[localIndex + 2] && tokens[localIndex + 2].isId()) {
            if (tokens[localIndex + 2].value == "array") {
                member.isArray = true;
                if (tokens[localIndex + 3] && tokens[localIndex + 3].isId()) {
                    member.name = tokens[localIndex + 3].value;
                    member.nameToken = tokens[localIndex + 3];
                }
            } else {
                member.name = tokens[localIndex + 2].value;
                member.nameToken = tokens[localIndex + 2];
            }
        }
    }
}

function isLineCommentStart(lineText: LineText): boolean {
    return /^\s*\/\/(?!!)/.test(lineText.getText());
}
function isGlobalStart(lineText: LineText): boolean {
    const tokens = tokenize(lineText.getText());
    return tokens[0] && tokens[0].isId() && (tokens[0].value == "constant" || (tokens[1] && tokens[1].isId()));
}
function isLocalStart(lineText: LineText): boolean {
    return /^\s*local\b/.test(lineText.getText());
}
function isMemberStart(lineText: LineText): boolean {
    return /^\s*(?:(private|public)\s+)*(?:(static|stub)\s+)*\b/.test(lineText.getText());
}
function isNativeStart(lineText: LineText): boolean {
    return /^\s*(?:(constant)\s+)*native\b/.test(lineText.getText());
}

class ParserEvent {
    public readonly document: Document;

    constructor(document: Document) {
        this.document = document;
    }

}
type ParserHandleFunction = (event: ParserEvent) => void;

/**
 * 
 */
class Parser {
    /**
     * tokenize
     * 
     */
    private static Build = class {

        private document: Document;
        private isSupportCjass:boolean = false;
        private eventMap: Map<string, ParserHandleFunction|Array<ParserHandleFunction>> = new Map();
        private constructor(document: Document) {
            this.document = document;
        }
        public create(document: Document) {
            return new Parser.Build(document);
        }
        public supportCjass(enable: boolean) {
            this.isSupportCjass = enable;
            return this;
        }
        public addEventListener(type: string, handle: ParserHandleFunction) {
            if (this.eventMap.has(type)) {
                const handle_ = this.eventMap.get(type)!;
                if (Array.isArray(handle_)) {
                    handle_.push(handle);
                } else {
                    this.eventMap.set(type, [handle_, handle]);
                }
            } else {
                this.eventMap.set(type, handle);
            }
            return this;
        }
        private blockComment() {

        }
        public pasing() {

        }
    };

    public static create(document: Document) {
    }

    constructor(content: string, options?: {
        supportCjass: false
    }) {
        // 移除了多行注释的新文本
        const newContent = replaceBlockComment(content);
        this.lineTexts = lines(newContent);
        this.textMacros = this.findTextMacro();
        this.parseRunTextMacro();
        this.zincBlocks = this.findZincBlock();
        this.blocks = this.findOutline();
    }

    private lineTexts: (LineText)[] = [];
    private textMacros: TextMacro[] = [];
    private expandLineTexts: (LineText | RunTextMacro)[] = [];
    private zincBlocks: Block[] = [];
    // 依然保留着单行注释
    private blocks: (Block | LineText)[] = [];


    private findTextMacro(): TextMacro[] {
        const textMacros: TextMacro[] = [];
        let textMacro: TextMacro | null = null;
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
        const zincBlocks: Block[] = [];
        let zinc: Block | null = null;
        this.expandLineTexts = this.expandLineTexts.filter(x => {
            if (x instanceof LineText) {
                if (/^\s*\/\/!\s+zinc\b/.test(x.getText())) {
                    zinc = new Block("zinc");
                    zincBlocks.push(zinc);
                    return false;
                } else if (/^\s*\/\/!\s+endzinc\b/.test(x.getText())) {
                    zinc = null;
                    return false;
                } else if (zinc) {
                    zinc.childrens.push(x);
                    return false;
                } else {
                    return true;
                }
            } else if (x instanceof RunTextMacro) {
                const textMacro = this.textMacros.find((textMacro) => textMacro.getName() == x.getName());
                textMacro?.foreach((lineText) => {
                    if (/^\s*\/\/!\s+zinc\b/.test(lineText.getText())) {
                        zinc = new Block("zinc");
                        zincBlocks.push(zinc);
                    } else if (/^\s*\/\/!\s+endzinc\b/.test(lineText.getText())) {
                        zinc = null;
                    } else if (zinc) {
                        zinc.childrens.push(lineText);
                    }
                }, x.getParams());
                return true;
            }
        });
        return zincBlocks;
    }

    private findOutline() {
        const blocks: (Block | LineText)[] = [];
        let block: Block | null = null;

        function handle(lineText: LineText) {
            if (/^\s*globals\b/.test(lineText.getText())) {
                const b = new Block("globals");
                b.setRange(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endglobals\b/.test(lineText.getText())) {
                if (block && block.type == "globals") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public|static|stub)\s+)*function\b/.test(lineText.getText())) {
                const b = new Block("function");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endfunction\b/.test(lineText.getText())) {
                if (block && block.type == "function") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public|static|stub)\s+)*method\b/.test(lineText.getText())) {
                const b = new Block("method");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endmethod\b/.test(lineText.getText())) {
                if (block && block.type == "method") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public)\s+)*struct\b/.test(lineText.getText())) {
                const b = new Block("struct");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endstruct\b/.test(lineText.getText())) {
                if (block && block.type == "struct") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public)\s+)*library\b/.test(lineText.getText())) {
                const b = new Block("library");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endlibrary\b/.test(lineText.getText())) {
                if (block && block.type == "library") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (block) {
                block.childrens.push(lineText);
                block.end = lineText.end;
            } else {
                blocks.push(lineText);
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

        return blocks;
    }

    private findCjassOutline() {
        const blocks: (Block | LineText)[] = [];
        let block: Block | null = null;

        function handle(lineText: LineText) {
            if (/^\s*globals\b/.test(lineText.getText())) {
                const b = new Block("globals");
                b.setRange(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endglobals\b/.test(lineText.getText())) {
                if (block && block.type == "globals") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public|static|stub)\s+)*function\b/.test(lineText.getText())) {
                const b = new Block("function");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endfunction\b/.test(lineText.getText())) {
                if (block && block.type == "function") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public|static|stub)\s+)*method\b/.test(lineText.getText())) {
                const b = new Block("method");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endmethod\b/.test(lineText.getText())) {
                if (block && block.type == "method") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public)\s+)*struct\b/.test(lineText.getText())) {
                const b = new Block("struct");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endstruct\b/.test(lineText.getText())) {
                if (block && block.type == "struct") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public)\s+)*library\b/.test(lineText.getText())) {
                const b = new Block("library");
                b.setRange(lineText);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endlibrary\b/.test(lineText.getText())) {
                if (block && block.type == "library") {
                    block.end = lineText.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (block) {
                block.childrens.push(lineText);
                block.end = lineText.end;
            } else {
                blocks.push(lineText);
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

        return blocks;
    }

    public parsing(): Program {
        const program = new Program();

        function handleGlobalsBlock(block: Block, globals: Global[]) {
            const lineComments: LineComment[] = [];
            block.childrens.forEach((x) => {
                if (x instanceof LineText) {
                    if (isLineCommentStart(x)) {
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (isGlobalStart(x)) {
                        const global = new Global();
                        parseGlobal(x, global);
                        global.lineComments.push(...lineComments);
                        globals.push(global);
                        lineComments.length = 0;
                    } else {
                        lineComments.length = 0;
                    }
                }
            });
        }
        function handleNativeBlock(lineText: LineText, natives: Native[], lineComments: LineComment[]) {
            const native = new Native();

            native.loc.setRange(lineText);

            parseFunction(lineText, native);
            native.lineComments.push(...lineComments);
            natives.push(native);

        }
        function handleFunctionBlock(block: Block, functions: Func[], lineComments: LineComment[]) {
            const func = new Func();

            func.loc.setRange(block);
            
            parseFunction(<LineText>block.childrens[0], func);
            func.lineComments.push(...lineComments);
            functions.push(func);

            const contentBlocks = block.childrens.slice(1);
            handleFunctionBody(contentBlocks, {
                locals: func.locals,
                globals: func.getGlobals()
            });
        }
        function handleMethodsBlock(block: Block, functions: Method[], lineComments: LineComment[]) {
            const method = new Method();

            method.loc.setRange(block);

            parseFunction(<LineText>block.childrens[0], method);
            method.lineComments.push(...lineComments);
            functions.push(method);

            const contentBlocks = block.childrens.slice(1);
            handleFunctionBody(contentBlocks, {
                locals: method.locals
            });
        }
        function handleFunctionBody(blocks: (Block|LineText)[], collect: {
            locals?: Local[]|null,
            globals?: Global[]|null
        } = {
            locals: null,
            globals: null
        }) {
            const lineComments: LineComment[] = [];
            blocks.forEach((x) => {
                if (x instanceof LineText) {
                    if (isLineCommentStart(x)) { // 非vjass形式宏注释
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (collect.locals && isLocalStart(x)) {
                        const local = new Local();
                        parseLocal(x, local);
                        collect.locals.push(local);
                        lineComments.length = 0;
                    } else {
                        lineComments.length = 0;
                    }
                } else if (x instanceof Block) {
                    if (collect.globals && x.type == "globals") {
                        handleGlobalsBlock(x, collect.globals);
                    }
                    lineComments.length = 0;
                }
            });
        }
        function handleStructBody(blocks: (Block|LineText)[], collect: {
            members?: Member[]|null,
            methods?: Method[]|null
        } = {
            members: null,
            methods: null
        }) {
            const lineComments: LineComment[] = [];
            blocks.forEach((x) => {
                if (x instanceof LineText) {
                    if (isLineCommentStart(x)) { // 非vjass形式宏注释
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (collect.members && isMemberStart(x)) {
                        const member = new Member();
                        parseMember(x, member);
                        collect.members.push(member);
                        member.lineComments.push(...lineComments);
                        lineComments.length = 0;
                    } else {
                        lineComments.length = 0;
                    }
                } else if (x instanceof Block) {
                    if (collect.methods && x.type == "method") {
                        handleMethodsBlock(x, collect.methods, lineComments);
                    }
                    lineComments.length = 0;
                }
            });
        }
        function handleLibraryBlock(block: Block, librarys: Library[], lineComments: LineComment[]) {
            const library = new Library();

            library.loc.setRange(block);

            parseLibrary(<LineText>block.childrens[0], library);
            library.lineComments.push(...lineComments);
            librarys.push(library);

            const contentBlocks = block.childrens.slice(1);
            handleBlocks(contentBlocks, {
                globals: library.globals,
                functions: library.functions,
                structs: library.structs,
                natives: library.natives
            });
            
        }
        function handleStructBlock(block: Block, structs: Struct[], lineComments: LineComment[]) {
            const struct = new Struct();

            struct.loc.setRange(block);

            parseStruct(<LineText>block.childrens[0], struct);
            struct.lineComments.push(...lineComments);
            structs.push(struct);

            const contentBlocks = block.childrens.slice(1);
            handleStructBody(contentBlocks, {
                members: struct.members,
                methods: struct.methods
            });
        }
        function handleBlocks(blocks: (LineText | Block)[], collect: {
            globals?: Global[] | null,
            functions?: Func[] | null,
            librarys?: Library[] | null,
            structs?: Struct[] | null,
            natives?: Native[] | null,
        } = {
                globals: null,
                functions: null,
                librarys: null,
                structs: null,
                natives: null
            }) {
            const lineComments: LineComment[] = [];
            blocks.forEach((x) => {
                if (x instanceof LineText) {
                    if (isLineCommentStart(x)) { // 非vjass形式宏注释
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (collect.natives && isNativeStart(x)) {
                        handleNativeBlock(x, collect.natives, lineComments);
                        lineComments.length = 0;
                    } else {
                        lineComments.length = 0;
                    }
                } else if (x instanceof Block) {
                    if (collect.globals && x.type == "globals") {
                        handleGlobalsBlock(x, collect.globals);
                    } else if (collect.functions && x.type == "function") {
                        handleFunctionBlock(x, collect.functions, lineComments);
                    } else if (collect.librarys && x.type == "library") {
                        handleLibraryBlock(x, collect.librarys, lineComments);
                    } else if (collect.structs && x.type == "struct") {
                        handleStructBlock(x, collect.structs, lineComments);
                    }
                    lineComments.length = 0;
                } else {
                    // 这里不会走
                    lineComments.length = 0;
                }
            });
        }

        handleBlocks(this.blocks, {
            globals: program.globals,
            functions: program.functions,
            librarys: program.librarys,
            structs: program.structs,
            natives: program.natives
        });

        return program;
    }

    public zincing():Program {
        const tokens:Token[] = [];
        
        this.zincBlocks.forEach((block) => {
            block.childrens.forEach((children) => {
                if (children instanceof LineText) {
                    const lineTextTokens = tokenize(children.getText()).map((token) => {
                        token.line = children.lineNumber();
                        return token;
                    });
                    tokens.push(...lineTextTokens);
                }
            });
        });

        const zincProgram = parseZinc(tokens, true);
        return zincProgram;
    }

    /**
     * @deprecated 后面会移除
     * @param callback 
     */
    public foreach(callback: (lineText: LineText) => void): void {
        this.expandLineTexts.forEach(x => {
            if (x instanceof RunTextMacro) {
                const textMacro = this.textMacros.find((textMacro) => textMacro.getName() == x.getName());
                if (textMacro) {
                    textMacro.foreach((lineText) => {
                        callback(lineText);
                    }, x.getParams());
                }
            } else if (x instanceof LineText) {
                callback(x);
            }
        });
        // this.lineTexts.forEach((lineText) => {
        //     if (/^\s*\/\/!\s+runtextmacro/.test(lineText.getText())) {
        //         const runTextMacro = new RunTextMacro();
        //         parseRunTextMacro(lineText.getText(), runTextMacro);
        //         runTextMacro.setRange(lineText);


        //         const textMacro = this.textMacros.find((textMacro) => textMacro.getName() == runTextMacro.getName());
        //         if (textMacro) {
        //             textMacro.foreach((lineText) => {
        //                 callback(lineText);
        //             }, runTextMacro.getParams());
        //         } else {
        //             callback(lineText);
        //         }
        //     } else {
        //         callback(lineText);
        //     }
        // });
    }

    public getTextMacros(): TextMacro[] {
        return this.textMacros;
    }

    public getZincBlocks() {
        return this.zincBlocks;
    }

    public getBlocks() {
        return this.blocks;
    }

}

function isDefineMacroStart(text: LineText) {
    return /^\s*#?define\b/.test(text.getText());
}
function isSetDefMacroStart(text: LineText) {
    return /^\s*#setdef\b/.test(text.getText());
}
function isUnefMacroStart(text: LineText) {
    return /^\s*#undef\b/.test(text.getText());
}

function parseCjass(content: string) {
    const newContent = replaceBlockComment(content);

    const lineTexts = lines(newContent);

    const defineMacros:DefineMacro[] = [];

    let defineMacro:DefineMacro = new DefineMacro();
    let inDefine = false; 
    let state = 0;
    let field = 0;
    lineTexts.forEach((lineText) => {
        const tokens = tokenize(lineText.getText());
        for (let index = 0; index < tokens.length; index++) {
            const token = tokens[index];
            const parseMacro = (condition: boolean) => {
                if (condition && state == 0) {
                    if (token.isId()) {
                        defineMacro = new DefineMacro();
                        const id = new Identifier(token.value);
                        id.loc.start = new Position(token.line, token.position);
                        id.loc.end = new Position(token.line, token.end);
                        defineMacro.keys.push(id);
                        state = 2;
                    } else if (token.isOp() && token.value == "<") {
                        defineMacro = new DefineMacro();
                        state = 3;
                    }
                } else if (state == 2) {
                    if (token.isOp() && token.value == "=") {
                        defineMacros.push(defineMacro);
                        state = 0;
                    } else if (token.isOp() && token.value == "(") {
                        state = 10;
                    } else {
                        state = 0;
                    }
                } else if (state == 3) {
                    if (token.isId()) {
                        const id = new Identifier(token.value);
                        id.loc.start = new Position(token.line, token.position);
                        id.loc.end = new Position(token.line, token.end);
                        defineMacro.keys.push(id);
                    } else if (token.isOp() && token.value == ">") {
                        state = 4;
                    } else {
                        state = 0;
                    }
                } else if (state == 4) {
                    if (token.isOp() && token.value == "(") {
                        state = 10;
                    } else if (token.isOp() && token.value == "=") {
                        defineMacros.push(defineMacro);
                        state = 0;
                    } else {
                        state = 0;
                    }
                } else if (state == 10) {
                    if (token.isId()) {
                        defineMacro.takes.push(token.value);
                        state = 11;
                    } else if (token.isOp() && token.value == ")") {
                        state = 12;
                    } else {
                        state = 0;
                    }
                } else if (state == 11) {
                    if (token.isOp() && token.value == ",") {
                        state = 10;
                    } else if (token.isOp() && token.value == ")") {
                        state = 12;
                    } else {
                        state = 0;
                    }
                } else if (state == 12) {
                    if (token.isOp() && token.value == "=") {
                        defineMacros.push(defineMacro);
                        state = 0;
                    } else {
                        state = 0;
                    }
                }
            }
            if (field > 0 && token.isOp() && token.value == "}") {
                field--;
            }if (inDefine && token.isOp() && token.value == "{") {
                field++;
            } else if (field == 1) {
                if (inDefine) {
                    parseMacro(index == 0);
                }
            } else if (field > 1) {
                continue;
            }  else if (index == 0 && (token.isId() && token.value == "define") || token.isMacro() && token.value == "#define") {
                inDefine = true;
            } else if (inDefine) {
                parseMacro(index == 1);
            }
        }
    });
    return defineMacros;
}

/**
 * 粗略的解析cjass函数
 * 此方法可能存在跟其他冲突的可能
 * @deprecated 不知道内部实现不建议使用
 * @param content 
 */
function parseCj(content: string): Program {
    const newContent = replaceBlockComment(content);
    const lineTexts = lines(newContent);

    const cjassFuncRegExp = new RegExp(/^\s*(?:(?<tag>private|public)\s+)?(?<returns>[a-zA-Z][a-zA-Z\d_]*)\s+(?<name>[a-zA-Z][a-zA-Z\d_]*)\s*\(/);
    const program = new Program();
    lineTexts.forEach((lineText) => {
        // const result = cjassFuncRegExp.exec(lineText.getText());
        const result = lineText.getText().match(cjassFuncRegExp);
        if (result && result.groups && canCjassReturn(result.groups["returns"])) {
            // console.log(result.groups["name"], result.groups["returns"])
            
            const takesString = lineText.getText().substring(result[0].length, lineText.length());
            const takeStrings = takesString.split(new RegExp(/\s*,\s*/));
            const takes:Take[] = [];
            takeStrings.forEach((takeString) => {                
                const takeResult = takeString.match(/(?<type>[a-zA-Z][a-zA-Z\d_]*)\s+(?<name>[a-zA-Z][a-zA-Z\d_]*)/);
                if (takeResult && takeResult.groups) {
                    const take = new Take(takeResult.groups["type"], takeResult.groups["name"]);
                    takes.push(take)
                }
            });
            const func = new Func(result.groups["name"], takes, result.groups["returns"]);
            func.tag = result.groups["tag"] as 'public';
            func.loc.setRange(lineText);
            program.functions.push(func);
        }
    });
    return program;
}



export {
    replaceBlockComment,
    Parser,
    parseCjass,
    parseCj
};

// console.log(JSON.stringify(parseCjass(`
// define <bbb bbbaa>(aaa ,cccc) =
// define {
//     dianjie = aaa
//     // asas
//     xilo = 
// }
// `), null, 2));
if (false) {
    console.log(parseCjass(`
    define {
    
        aaa = {
            bbb = 12
        }
    }
    `));
    
    console.log(parseCj(`public void insdsada(aaa aaaccs fdsg,  fgdsg gfdg__)`).functions[0].takes);
    ;
}


if (false) {
    const text = `a/"\\"
    /*
    123
    */c`;
    console.log(text, "\n\n", replaceBlockComment(text));
    console.log(text.length, replaceBlockComment(text).length);

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

    new Parser(`
    //! textmacro a666(name,return_type)
    function $name$ takes nothing returns $return_type$
    endfunction
    //! endtextmacro
    //! runtextmacro a666("test_func_name", "nothing")
    `).foreach((lineText) => {
        console.log(lineText.lineNumber(), lineText.getText())
    });

    new Parser(`
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

    console.log("=================================================================")

    const blocks = new Parser(`
    struct baoji extends dontbb, a222

        method a666
        endmethod

    endstruct

    library ab
        globals
            integer a
        endglobals
        
    endlibrary

    function b 
    globals
    // jiexi
    // jiexi
    integer a
    endglobals
    endtunction

    `).parsing();
    console.info(blocks.functions[0].getGlobals());

    const zincProgram = new Parser(`

    //! zinc
    library a87878 {

    }
    //! endzinc

    `).zincing();
console.log(zincProgram.librarys[0].loc);

}

if (false) {
    const textMacro = new TextMacro();
    parseTextMacro(`//! textmacro a takes aaa`, textMacro);
    console.log(textMacro);
    
}

export function findIncludes(content:string) {
    const newContent = replaceBlockComment(content);
    const lineTexts = lines(newContent);
    const includes:Include[] = [];
    lineTexts.forEach((lineText) => {
        if (/^\s*#include\b/.test(lineText.getText())) {
            const tokens = Tokenizer.get(lineText.getText());
            if (tokens.length >= 2 && tokens[1].type == "string") {
                const filePath = tokens[1].value;
                const include = new Include(filePath);
                include.start = tokens[0].start;
                include.end = tokens[1].end;
                includes.push(include);
            }
        }
    });
    return includes;
}

