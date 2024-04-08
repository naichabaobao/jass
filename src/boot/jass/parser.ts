import { canCjassReturn } from "../jass/keyword";
import { isNewLine, isSpace } from "../tool";
import { lines } from "./tool";
import { parseZinc } from "../zinc/parse";
import { DefineMacro, Func, Global, Identifier, Library, LineComment, Local, Member, Method, Native, Program, Struct, Take, Position, Range, Type, Context, baseTypeContext, LineText, Define, GlobalObject, DefineMethod, Interface } from "./ast";
import { Token, tokenize } from "./tokens";






// import { jassParse } from "./step-parser";
// if (true) {
//     jassParse(new Context(), `
//     /*

//     */

//     function <? baba ?> ccc
//     `);
// }
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



type BlockType = "globals" | "library" | "struct" | "function" | "method" | "zinc" | "program" | "interface";
class Block extends Range {
    public type: BlockType;
    public parent: Block | null = null;
    public readonly childrens: (ReplaceableLineText | Block)[] = [];

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

function parseType(lineText: ReplaceableLineText): Type | undefined {


    const tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
        return token;
    });
    let type: Type | undefined;
    if (tokens.length >= 2) {
        if (tokens[0].isId() && tokens[0].value == "type" && tokens[1].isId()) {
            type = new Type(baseTypeContext, tokens[1].value);
            if (tokens.length >= 4) {
                if (tokens[2].isId() && tokens[2].value == "extends" && tokens[3].isId()) {
                    const extName: string = tokens[3].value;
                    const extType = Type.find(extName);
                    if (extType) {
                        type.ext = extType;
                    }
                }
            }
        }
    }
    return type;
}


function parseFunction(lineText: ReplaceableLineText, func: (Func | Native | Method | DefineMethod)) {



    const tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
        return token;
    });

    let keyword: "function" | "native" | "method" = "function";
    if (func instanceof DefineMethod) {
        keyword = "method";
    } else if (func instanceof Method) {
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
                    take = new Take(func.getContext(), token.value, "");
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
                        take.loc.end = new Position(token.line, token.end.position);
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

function parseLibrary(lineText: ReplaceableLineText, library: Library) {

    const tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
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

function parseLineComment(lineText: ReplaceableLineText, lineComment: LineComment) {
    const tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
        return token;
    });
    const lineCommentToken = tokens.find((token) => token.isComment());
    if (lineCommentToken) {
        // const lineComment = new LineComment(lineCommentToken.value);
        lineComment.setText(lineText.replaceText());
        lineComment.loc.start = new Position(lineText.lineNumber(), lineCommentToken.position);
        lineComment.loc.end = new Position(lineText.lineNumber(), lineCommentToken.end.position);
    }
}

function parseGlobal(lineText: ReplaceableLineText, global: Global) {

    let tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
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

    global.loc.from(lineText.loc);
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

// 解析interface声明
function parseInterface(lineText: ReplaceableLineText, struct: Interface) {
    let tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
        return token;
    });
    const structIndex = tokens.findIndex((token) => token.isId() && token.value == "interface");
    if (structIndex != -1 && tokens[structIndex + 1] && tokens[structIndex + 1].isId()) {
        struct.name = tokens[structIndex + 1].value;
    }
}
function parseStruct(lineText: ReplaceableLineText, struct: Struct) {
    let tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
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

function parseLocal(lineText: ReplaceableLineText, local: Local) {
    let tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
        return token;
    });

    const localIndex = tokens.findIndex((token) => token.isId() && token.value == "local");
    local.loc.from(lineText.loc);

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

function parseMember(lineText: ReplaceableLineText, member: Member) {
    let tokens = tokenize(lineText.replaceText()).map((token) => {
        token.start.line = lineText.lineNumber();
        return token;
    });

    member.loc.from(lineText.loc);

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

function isLineCommentStart(lineText: ReplaceableLineText): boolean {
    return /^\s*\/\/(?!!)/.test(lineText.replaceText());
}
function isGlobalStart(lineText: ReplaceableLineText): boolean {
    const tokens = tokenize(lineText.replaceText());
    return tokens[0] && tokens[0].isId() && (tokens[0].value == "constant" || (tokens[1] && tokens[1].isId()));
}
function isLocalStart(lineText: ReplaceableLineText): boolean {
    return /^\s*local\b/.test(lineText.replaceText());
}
function isMemberStart(lineText: ReplaceableLineText): boolean {
    return /^\s*(?:(private|public)\s+)*(?:(static|stub)\s+)*\b/.test(lineText.replaceText());
}
function isNativeStart(lineText: ReplaceableLineText): boolean {
    return /^\s*(?:(constant)\s+)*native\b/.test(lineText.replaceText());
}
function isMethodStart(lineText: ReplaceableLineText): boolean {
    return /^\s*(?:(private|public)\s+)*method\b/.test(lineText.replaceText());
}

function isTypeStart(lineText: ReplaceableLineText): boolean {
    return /^\s*type\b/.test(lineText.replaceText());
}

interface ParserConfig {
    // public parseMacro:boolean = false;
    // 预设的文本宏
    textMacros?: Array<TextMacro>;
}

function lastLineDefine(lastLine: number, defines: Define[]) {
    return defines.filter(define => define.loc.start.line <= lastLine);
}

/*
class LineText extends Range {

    private text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    // 是否空行
    public isEmpty(): boolean {
        return this.text.trimStart() === "";
    }

    public getText(): string {
        return this.text;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public lineNumber(): number {
        return this.start.line;
    }

    // 第一个字符下标
    public firstCharacterIndex(): number {
        let index = 0;
        for (; index < this.text.length; index++) {
            const char = this.text[index];
            if (!isSpace(char)) {
                return index;
            }
        }
        return index;
    }

    public length(): number {
        return this.text.length;
    }

    public clone(): LineText {
        return Object.assign(new LineText(this.getText()), this);
    }

}*/

class ReplaceableLineText extends LineText {
    private realacedText: string = "";

    // private tokens:Token[] = [];
    // private defines:TextMacroDefine[] = [];

    constructor(context: Context, lineText: LineText) {
        super(context, lineText.getText());
        // this.from(lineText);
        this.loc.from(lineText.loc)

        // const tokens = tokenize(lineText.getText());

        // this.defines = lastLineDefine(lineText.lineNumber(), defines ?? []);


        // this.realacedText = this.tokensToString(tokens, this.defines);
        this.realacedText = this.replaceTextByRegExp(this.getText());
    }

    private replaceTextByRegExp(text: string) {
        GlobalObject.DEFINES.forEach(define => {
            text = text.replace(new RegExp(`\\b${define.name()}\\b`, "g"), define.value);
        });
        return text;
    }

    // 宏替换后的字符串
    public replaceText(): string {
        // return this.tokensToString(this.tokens, this.defines);
        return this.realacedText;
    }

    private pushSpace(origin: string, count: number, char: string): string {
        for (let index = 0; index < count; index++) {
            origin += char;
        }
        return origin;
    }

    public clone(): ReplaceableLineText {
        const lineText = new LineText(this.context, this.getText());
        lineText.loc.from(this.loc);
        return new ReplaceableLineText(this.context, lineText)
        // return new ReplaceableLineText(this, this.defines);
    }

    public setReplaceText(text: string): void {
        this.realacedText = text;
    }
}

class TextMacro extends Range {
    private readonly lineTexts: ReplaceableLineText[] = [];
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

    public push(lineText: ReplaceableLineText) {
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

    public foreach(callback: (lineText: ReplaceableLineText) => void, params: string[] = []) {
        this.lineTexts.map((lineText) => {
            const replacedLineText = lineText.clone();

            let newText = lineText.replaceText();
            this.takes.forEach((take, takeIndex) => {
                newText = newText.replace(new RegExp(`\\$${take}\\$`, "g"), params[takeIndex] ?? "");
            });
            replacedLineText.setReplaceText(newText);
            callback(replacedLineText);

        });
    }

    public addTake(take: string) {
        this.takes.push(take);
    }

    public get origin(): string {
        const content = (() => {
            const maxLine = 5;
            let result = "";
            if (this.lineTexts.length > 0) {
                result = this.lineTexts.slice(0, maxLine).map(lineText => {
                    return lineText.replaceText();
                }).join("\n");
            }
            if (this.lineTexts.length > maxLine) {
                result += "\n..."
            }
            return result;
        })();
        return `//!textmacro ${this.name}${this.takes.length > 0 ? ` takes ${this.takes.join(", ")}` : ""}\n${content}\n//!endtextmacro`;
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
    private lineText: ReplaceableLineText | null;

    constructor(name: string = "", params: string[] = [], lineText: ReplaceableLineText | null = null) {
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

    public getLineText(): ReplaceableLineText | null {
        return this.lineText;
    }

    public getReplaceableLineText(): ReplaceableLineText | null {
        return this.lineText;
    }



}



/**
 * 
 */
class Parser {

    private readonly context: Context;
    private jassProgram: Program;
    // private zincProgram: Program = new Program();

    private get _context() {
        return this.context;
    }

    constructor(context: Context, content: string, config?: ParserConfig) {
        this.context = context;
        this.jassProgram = new Program(this.context);
        // 移除了多行注释的新文本
        const newContent = replaceBlockComment(content);
        // this.lineTexts = lines(newContent);


        let lineTexts: LineText[] = lines(context, newContent);
        const containDefineObject = this.prehandleDefine(context, lineTexts);
        lineTexts = containDefineObject.lineTexts;
        const defines = containDefineObject.defines;
        GlobalObject.addDefine(...defines);


        const containTextMacroObject = this.prehandleTextMacro(context, lineTexts);
        const replacesbleLineTexts = containTextMacroObject.lineTexts;
        const textMacros = containTextMacroObject.textMacros;
        this.textMacros = textMacros;

        const withRunTextMacroLineTexts = this.parseRunTextMacro(replacesbleLineTexts);

        const zincObject = this.findZincBlock(withRunTextMacroLineTexts, textMacros);
        const zincBlocks = zincObject.blocks;
        this.zincBlocks = zincBlocks;

        // 处理zinc块后留下的
        const processingZincWithRunTextMacroLineTexts = zincObject.withRunTextMacroLineTexts;


        const outLineObject = this.findOutline(processingZincWithRunTextMacroLineTexts, textMacros);
        const outLines = outLineObject.outLines;

        // this.jassProgram.defines.push(...defines);
        this.jassProgram.textMacros.push(...textMacros);
        this.jassProgram.runTextMacros = <RunTextMacro[]>withRunTextMacroLineTexts.filter(x => x instanceof RunTextMacro);





        this.blocks = outLines;

        if (config?.textMacros && config.textMacros) {
            this.textMacros.push(...config.textMacros)
        }
    }


    private textMacros: TextMacro[] = [];

    private zincBlocks: Block[] = [];
    // 依然保留着单行注释
    private blocks: (Block | ReplaceableLineText)[] = [];

    // 返回当前文件的vjass文本宏，可以在parsing前获得，因此可以在解析前把文本宏传递过去其他文件中
    public getTextMacros(): Array<TextMacro> {
        return this.jassProgram.textMacros;
    }

    private prehandleDefine(context: Context, lineTexts: LineText[]): {
        defines: Array<Define>,
        lineTexts: Array<LineText>
    } {
        const defines: Define[] = [];
        const texts: LineText[] = [];

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

        return {
            defines,
            lineTexts: texts
        };
    }

    private prehandleTextMacro(context: Context, lineTexts: Array<LineText>): {
        textMacros: Array<TextMacro>,
        lineTexts: Array<ReplaceableLineText>
    } {
        const textMacros: TextMacro[] = [];
        let textMacro: TextMacro | null = null;
        const texts = lineTexts.map(textLine => new ReplaceableLineText(context, textLine)).filter((lineText) => {
            const replaceText = lineText.replaceText();
            if (/^\s*\/\/!\s+textmacro\b/.test(replaceText)) {
                textMacro = new TextMacro()
                textMacro.from(lineText.loc);
                parseTextMacro(replaceText, textMacro);
                textMacros.push(textMacro);
                return false;
            } else if (/\/\/!\s+endtextmacro\b/.test(replaceText)) {
                if (textMacro) {
                    textMacro.end = lineText.loc.end;
                }
                textMacro = null;
                return false;
            } else if (textMacro) {
                textMacro.push(lineText);
                textMacro.end = lineText.loc.end;
                return false;
            }
            return true;
        });
        return {
            textMacros: textMacros,
            lineTexts: texts
        };
    }

    private parseRunTextMacro(lineTexts: Array<ReplaceableLineText>): (ReplaceableLineText | RunTextMacro)[] {
        const expandLineTexts: (ReplaceableLineText | RunTextMacro)[] = [];
        lineTexts.forEach(lineText => {
            const replaceText = lineText.replaceText();
            if (/^\s*\/\/!\s+runtextmacro\b/.test(replaceText)) {
                const runTextMacro = new RunTextMacro();
                parseRunTextMacro(replaceText, runTextMacro);
                runTextMacro.from(lineText.loc);
                expandLineTexts.push(runTextMacro);


            } else {
                expandLineTexts.push(lineText);
            }
        });

        return expandLineTexts
    }

    private findZincBlock(expandLineTexts: (ReplaceableLineText | RunTextMacro)[], textMacros: Array<TextMacro>): {
        blocks: Array<Block>,
        withRunTextMacroLineTexts: Array<ReplaceableLineText | RunTextMacro>
    } {
        const zincBlocks: Block[] = [];
        let zinc: Block | null = null;
        // 出去zinc块后剩下的
        const restExpandLineTexts = expandLineTexts.filter(x => {
            if (x instanceof ReplaceableLineText) {
                const replaceText = x.replaceText();
                if (/^\s*\/\/!\s+zinc\b/.test(replaceText)) {
                    zinc = new Block("zinc");
                    zincBlocks.push(zinc);
                    return false;
                } else if (/^\s*\/\/!\s+endzinc\b/.test(replaceText)) {
                    zinc = null;
                    return false;
                } else if (zinc) {
                    zinc.childrens.push(x);
                    return false;
                } else {
                    return true;
                }
            } else if (x instanceof RunTextMacro) {
                const textMacro = textMacros.find((textMacro) => textMacro.getName() == x.getName());
                textMacro?.foreach((lineText) => {
                    const replaceText = lineText.replaceText();
                    if (/^\s*\/\/!\s+zinc\b/.test(replaceText)) {
                        zinc = new Block("zinc");
                        zincBlocks.push(zinc);
                    } else if (/^\s*\/\/!\s+endzinc\b/.test(replaceText)) {
                        zinc = null;
                    } else if (zinc) {
                        zinc.childrens.push(lineText);
                    }
                }, x.getParams());
                return true;
            }
        });
        return {
            blocks: zincBlocks,
            withRunTextMacroLineTexts: restExpandLineTexts
        };
    }

    private findOutline(lineTexts: (ReplaceableLineText | RunTextMacro)[], textMacros: Array<TextMacro>): {
        outLines: Array<Block | ReplaceableLineText>,
        withRunTextMacroLineTexts: Array<ReplaceableLineText | RunTextMacro>
    } {
        const blocks: (Block | ReplaceableLineText)[] = [];
        let block: Block | null = null;
        // 避免解析method为block
        let isInInterface = false;
        function handle(lineText: ReplaceableLineText) {
            const replaceText = lineText.replaceText();
            if (/^\s*globals\b/.test(replaceText)) {
                const b = new Block("globals");
                b.from(lineText.loc);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endglobals\b/.test(replaceText)) {
                if (block && block.type == "globals") {
                    block.end = lineText.loc.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public|static|stub)\s+)*function\b/.test(replaceText)) {
                const b = new Block("function");
                b.from(lineText.loc);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endfunction\b/.test(replaceText)) {
                if (block && block.type == "function") {
                    block.end = lineText.loc.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (isInInterface == false && /^\s*(?:(?:private|public|static|stub)\s+)*method\b/.test(replaceText)) {
                const b = new Block("method");
                b.from(lineText.loc);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endmethod\b/.test(replaceText)) {
                if (block && block.type == "method") {
                    block.end = lineText.loc.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public)\s+)*struct\b/.test(replaceText)) {
                const b = new Block("struct");
                b.from(lineText.loc);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endstruct\b/.test(replaceText)) {
                if (block && block.type == "struct") {
                    block.end = lineText.loc.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (/^\s*(?:(?:private|public)\s+)*interface\b/.test(replaceText)) {
                const b = new Block("interface");
                b.from(lineText.loc);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }

                isInInterface = true;
            } else if (/^\s*endinterface\b/.test(replaceText)) {
                if (block && block.type == "interface") {
                    block.end = lineText.loc.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                    isInInterface = false;
                }
            } else if (/^\s*(?:(?:private|public)\s+)*library\b/.test(replaceText)) {
                const b = new Block("library");
                b.from(lineText.loc);
                b.childrens.push(lineText);
                if (block) {
                    b.parent = block;
                    block.childrens.push(b);
                    block = b;
                } else {
                    blocks.push(b);
                    block = b;
                }
            } else if (/^\s*endlibrary\b/.test(replaceText)) {
                if (block && block.type == "library") {
                    block.end = lineText.loc.end;
                    if (block.parent) {
                        block = block.parent;
                    } else {
                        block = null;
                    }
                }
            } else if (block) {
                block.childrens.push(lineText);
                block.end = lineText.loc.end;
            } else {
                blocks.push(lineText);
            }
        }
        const restLineTexts: (ReplaceableLineText | RunTextMacro)[] = [];
        lineTexts.forEach(x => {
            if (x instanceof RunTextMacro) {
                const textMacro = textMacros.find((textMacro) => textMacro.getName() == x.getName());
                if (textMacro) {
                    textMacro.foreach((lineText) => {
                        handle(lineText);
                    }, x.getParams());
                }
            } else if (x instanceof ReplaceableLineText) {
                handle(x);
            }
        });

        return {
            outLines: blocks,
            withRunTextMacroLineTexts: restLineTexts
        };
    }

    public parsing(): Program {

        const handleGlobalsBlock = (block: Block, globals: Global[]) => {
            const lineComments: LineComment[] = [];
            block.childrens.forEach((x) => {
                if (x instanceof ReplaceableLineText) {
                    if (isLineCommentStart(x)) {
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (isGlobalStart(x)) {
                        const global = new Global(this._context);
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
        function handleTypeBlock(lineText: ReplaceableLineText, types: Type[], lineComments: LineComment[]) {
            const type = parseType(lineText);

            if (type) {
                type.loc.from(lineText.loc);

                type.lineComments.push(...lineComments);
                types.push(type);
            }

        }
        const handleNativeBlock = (lineText: ReplaceableLineText, natives: Native[], lineComments: LineComment[]) => {
            const native = new Native(this._context);

            native.loc.from(lineText.loc);

            parseFunction(lineText, native);
            native.lineComments.push(...lineComments);
            natives.push(native);

        }
        const handleFunctionBlock = (block: Block, functions: Func[], lineComments: LineComment[]) => {
            const func = new Func(this._context);

            func.loc.from(block);

            parseFunction(<ReplaceableLineText>block.childrens[0], func);
            func.lineComments.push(...lineComments);
            functions.push(func);

            const contentBlocks = block.childrens.slice(1);
            handleFunctionBody(contentBlocks, {
                locals: func.locals,
                globals: func.getGlobals()
            });
        }

        const handleMethodsBlock = (block: Block, functions: Method[], lineComments: LineComment[]) => {
            const method = new Method(this._context);

            method.loc.from(block);

            parseFunction(<ReplaceableLineText>block.childrens[0], method);
            method.lineComments.push(...lineComments);
            functions.push(method);

            const contentBlocks = block.childrens.slice(1);
            handleFunctionBody(contentBlocks, {
                locals: method.locals
            });
        }
        const handleFunctionBody = (blocks: (Block | ReplaceableLineText)[], collect: {
            locals?: Local[] | null,
            globals?: Global[] | null
        } = {
                locals: null,
                globals: null
            }) => {
            const lineComments: LineComment[] = [];
            blocks.forEach((x) => {
                if (x instanceof ReplaceableLineText) {
                    if (isLineCommentStart(x)) { // 非vjass形式宏注释
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (collect.locals && isLocalStart(x)) {
                        const local = new Local(this._context);
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
        // 目前仅支持interface method解析，不支持成员
        const handleInterfaceBody = (blocks: (Block | ReplaceableLineText)[], collect: {
            methods?: DefineMethod[] | null
        } = {
                methods: null
            }) => {
                
                
            const lineComments: LineComment[] = [];
            blocks.forEach((x) => {
                if (x instanceof ReplaceableLineText) {
                    if (isLineCommentStart(x)) { // 非vjass形式宏注释
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (collect.methods && isMethodStart(x)) {
                        const method = new DefineMethod(this._context);

                        // 解析interface内部method
                        method.loc.start = x.loc.start;
                        method.loc.end = x.loc.end;

                        parseFunction(x, method);
                        method.lineComments.push(...lineComments);

                        collect.methods.push(method);
                        lineComments.length = 0;
                    } else {
                        lineComments.length = 0;
                    }
                } else if (x instanceof Block) {
                    // 略过，interface不支持函数体
                    // if (collect.methods && x.type == "method") {
                    //     handleMethodsBlock(x, collect.methods, lineComments);
                    // }
                    lineComments.length = 0;
                }
            });
        }
        const handleStructBody = (blocks: (Block | ReplaceableLineText)[], collect: {
            members?: Member[] | null,
            methods?: Method[] | null
        } = {
                members: null,
                methods: null
            }) => {
            const lineComments: LineComment[] = [];
            blocks.forEach((x) => {
                if (x instanceof ReplaceableLineText) {
                    if (isLineCommentStart(x)) { // 非vjass形式宏注释
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (collect.members && isMemberStart(x)) {
                        const member = new Member(this._context);
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
        const handleLibraryBlock = (block: Block, librarys: Library[], lineComments: LineComment[]) => {
            const library = new Library(this._context);

            library.loc.from(block);

            parseLibrary(<ReplaceableLineText>block.childrens[0], library);
            library.lineComments.push(...lineComments);
            librarys.push(library);

            const contentBlocks = block.childrens.slice(1);
            handleBlocks(contentBlocks, {
                globals: library.globals,
                functions: library.functions,
                structs: library.structs,
                natives: library.natives,
                interfaces: library.interfaces
            });

        }
        const handleInterfaceBlock = (block: Block, interfaces: Interface[], lineComments: LineComment[]) => {
            const inter = new Interface(this._context);

            inter.loc.from(block);

            parseInterface(<ReplaceableLineText>block.childrens[0], inter);
            inter.lineComments.push(...lineComments);
            interfaces.push(inter);

            const contentBlocks = block.childrens.slice(1);
            handleInterfaceBody(contentBlocks, {
                methods: inter.methods
            });
        }
        const handleStructBlock = (block: Block, structs: Struct[], lineComments: LineComment[]) => {
            const struct = new Struct(this._context);

            struct.loc.from(block);

            parseStruct(<ReplaceableLineText>block.childrens[0], struct);
            struct.lineComments.push(...lineComments);
            structs.push(struct);

            const contentBlocks = block.childrens.slice(1);
            handleStructBody(contentBlocks, {
                members: struct.members,
                methods: struct.methods
            });
        }
        function handleBlocks(blocks: (ReplaceableLineText | Block)[], collect: {
            globals?: Global[] | null,
            functions?: Func[] | null,
            librarys?: Library[] | null,
            structs?: Struct[] | null,
            natives?: Native[] | null,
            types?: Type[] | null,
            interfaces?: Interface[] | null,
        } = {
                globals: null,
                functions: null,
                librarys: null,
                structs: null,
                natives: null,
                types: null,
                interfaces: null,
            }) {
            const lineComments: LineComment[] = [];
            blocks.forEach((x) => {
                if (x instanceof ReplaceableLineText) {
                    if (isLineCommentStart(x)) { // 非vjass形式宏注释
                        const lineComment = new LineComment();
                        parseLineComment(x, lineComment);
                        lineComments.push(lineComment);
                    } else if (collect.natives && isNativeStart(x)) {
                        handleNativeBlock(x, collect.natives, lineComments);
                        lineComments.length = 0;
                    } else if (collect.types && isTypeStart(x)) {
                        handleTypeBlock(x, collect.types, lineComments);
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
                    } else if (collect.interfaces && x.type == "interface") {
                        handleInterfaceBlock(x, collect.interfaces, lineComments);
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
            globals: this.jassProgram.globals,
            functions: this.jassProgram.functions,
            librarys: this.jassProgram.librarys,
            structs: this.jassProgram.structs,
            natives: this.jassProgram.natives,
            types: this.jassProgram.types,
            interfaces: this.jassProgram.interfaces,
        });

        return this.jassProgram;
    }

    public zincing(): Program {
        const tokens: Token[] = [];

        this.zincBlocks.forEach((block) => {
            block.childrens.forEach((children) => {
                if (children instanceof ReplaceableLineText) {
                    const replaceText = children.replaceText()
                    const lineTextTokens = tokenize(replaceText).map((token) => {
                        token.start.line = children.lineNumber();
                        return token;
                    });
                    tokens.push(...lineTextTokens);
                }
            });
        });

        const zincProgram = parseZinc(this.context, tokens, true);

        return zincProgram;
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

function parseCjass(context: Context, content: string) {
    const newContent = replaceBlockComment(content);

    const lineTexts = lines(context, newContent);

    const defineMacros: DefineMacro[] = [];

    let defineMacro: DefineMacro = new DefineMacro(context);
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
                        defineMacro = new DefineMacro(context);
                        const id = new Identifier(context, token.value);
                        id.loc.start = new Position(token.start.line, token.start.position);
                        id.loc.end = new Position(token.end.line, token.end.position);
                        defineMacro.keys.push(id);
                        state = 2;
                    } else if (token.isOp() && token.value == "<") {
                        defineMacro = new DefineMacro(context);
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
                        const id = new Identifier(context, token.value);
                        id.loc.start = new Position(token.start.line, token.start.position);
                        id.loc.end = new Position(token.end.line, token.end.position);
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
            } if (inDefine && token.isOp() && token.value == "{") {
                field++;
            } else if (field == 1) {
                if (inDefine) {
                    parseMacro(index == 0);
                }
            } else if (field > 1) {
                continue;
            } else if (index == 0 && (token.isId() && token.value == "define") || token.isMacro() && token.value == "#define") {
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
function parseCj(context: Context, content: string): Program {
    const newContent = replaceBlockComment(content);
    const lineTexts = lines(context, newContent);

    const cjassFuncRegExp = new RegExp(/^\s*(?:(?<tag>private|public)\s+)?(?<returns>[a-zA-Z][a-zA-Z\d_]*)\s+(?<name>[a-zA-Z][a-zA-Z\d_]*)\s*\(/);
    const program = new Program(context);
    lineTexts.forEach((lineText) => {
        // const result = cjassFuncRegExp.exec(lineText.getText());
        const result = lineText.getText().match(cjassFuncRegExp);
        if (result && result.groups && canCjassReturn(result.groups["returns"])) {
            const takesString = lineText.getText().substring(result[0].length, lineText.length());
            const takeStrings = takesString.split(new RegExp(/\s*,\s*/));
            const takes: Take[] = [];
            takeStrings.forEach((takeString: string) => {
                const takeResult = takeString.match(/(?<type>[a-zA-Z][a-zA-Z\d_]*)\s+(?<name>[a-zA-Z][a-zA-Z\d_]*)/);
                if (takeResult && takeResult.groups) {
                    const take = new Take(context, takeResult.groups["type"], takeResult.groups["name"]);
                    takes.push(take)
                }
            });
            const func = new Func(context, result.groups["name"], takes, result.groups["returns"]);
            func.tag = result.groups["tag"] as 'default' || 'default';
            func.loc.from(lineText.loc);
            program.functions.push(func);
        }
    });
    return program;
}



export {
    replaceBlockComment,
    Parser,
    parseCjass,
    parseCj,
    TextMacro, RunTextMacro, Include, LineText, ReplaceableLineText
};

// console.log(JSON.stringify(parseCjass(`
// define <bbb bbbaa>(aaa ,cccc) =
// define {
//     dianjie = aaa
//     // asas
//     xilo = 
// }
// `), null, 2));


export function findIncludes(context: Context, content: string) {
    const newContent = replaceBlockComment(content);
    const lineTexts = lines(context, newContent);
    const includes: Include[] = [];
    lineTexts.forEach((lineText) => {
        if (/^\s*#include\b/.test(lineText.getText())) {
            const tokens = tokenize(lineText.getText());
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

if (true) {
    const program = new Parser(new Context(), `
    library NFLSNFL initializer init_function requires require_libs

    interface AAAA
        method method_name takes nothing returns nothing
    endinterface
endlibrary
    `).parsing();

    // console.log(program.defines);
    console.log(program.librarys[0].interfaces[0].methods);

}

