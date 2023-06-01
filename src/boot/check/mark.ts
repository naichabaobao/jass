import { isLetter } from "../tool";
import { isIdentifier, isNewLine, isNumber, readFileContent } from "./utils";

/**
 * 分词
 * @param document 
 * @returns 
 */
function lexically(document: Document) {
    const content = document.getText();

    let line: number = 0;
    let position: number = 0;
    // 记录多行注释开始位置
    let markStart: number = 0;
    let markPosition: Position = null as any;
    enum State {
        Default = 0,
        Div = 1,
        Comment = 2,
        StringStart = 3,
        StringEscape = 4,
        StringEnd = 6,
        MarkStart = 5,
        MarkEnd = 7,
        Number,
        Letter,
        RealStart,
        Real,
        ItEq,
        LuaStart,
        WaitLuaEnd,
        LuaEnd,
        GtEq,
        ZincReturn,
        Eq
    };
    let state:State = State.Default;

    const len = content.length;
    // const chars = content.split("");

    const pushError = (message: string) => {
        const err = new JassError(document, message, new Range(markPosition, new Position(line, position + 1)));
        document.errors.push(err);
        state = State.Default;
    }

    const marks:Mark[] = [];

    for (let index = 0; index < len; index++) {
        const char = content.charAt(index);
        const next_char = content.charAt(index + 1);
        const isEof = () => index == len - 1;

        const pushToken = (type: MarkType) => {
            const mark = new Mark(document, new Range(markPosition, new Position(line, position + 1)), new Fragment(markStart, index + 1), type);
            marks.push(mark);
            state = State.Default;
        };

        if (state == State.Default) {
            markStart = index;
            markPosition = new Position(line, position);
            if (char == "/") {
                if (next_char == "/") {
                    state = State.Div;
                } else {
                    pushToken("op");
                }
            }
            else if (char == "\"") {
                if (isNewLine(next_char) || isEof()) {
                    pushError("Incorrect string!"); // 错误字符串
                    pushToken("error-string");
                } else if (next_char == "\"") {
                    state = State.StringEnd;
                } else {
                    state = State.StringStart;
                }
            }
            else if (char == "'") {
                if (isNewLine(next_char) || isEof()) {
                    pushError("Incorrect mark!"); // 错误mark
                    pushToken("error-mark");
                } else if (next_char == "'") {
                    state = State.MarkEnd;
                } else {
                    state = State.MarkStart;
                }
            }
            else if (char == "<") {
                if (next_char == "=") {
                    state = State.ItEq;
                } else if (next_char == "?") {
                    state = State.LuaStart;
                } else {
                    pushToken("op");
                }
            }
            else if (char == ">") {
                if (next_char == "=") {
                    state = State.GtEq;
                } else {
                    pushToken("op");
                }
            }
            else if (char == "+" || char == "*" || char == "(" || char == ")" || char == "[" || char == "]" || char == "{" || char == "}" || char == "," ) {
                pushToken("op");
            }
            else if (char == "-") {
                if (next_char == ">") {
                    state = State.ZincReturn;
                } else {
                    pushToken("op");
                }
            }
            else if (char == "=") {
                if (next_char == "=") {
                    state = State.Eq;
                } else {
                    pushToken("op");
                }
            }
            else if (isNumber(char)) {
                if (isNumber(next_char)) {
                    state = State.Number;
                } else if (isIdentifier(next_char)) {
                    state = State.Letter;
                } else if (next_char == ".") {
                    state = State.RealStart;
                } else {
                    pushToken("int");
                }
            }
            else if (isLetter(char)) {
                if (isIdentifier(next_char) || isNumber(next_char)) {
                    state = State.Letter;
                } else {
                    pushToken("id");
                }
            }
        } else if (state == State.Div) {
            if (char == "/") {
                if (next_char == "\n") {
                    pushToken("comment");
                } else {
                    state = State.Comment;
                }
            }
        } else if (state == State.Comment) { // 注释
            if (isNewLine(next_char)) {
                pushToken("comment");
            } else if (isEof()) {
                pushToken("comment");
            }
        } else if (state == State.StringStart) {
            if (next_char == "\"") {
                state = State.StringEnd;
            } else if (isNewLine(next_char) || isEof()) {
                pushError("Incorrect string!"); // 错误字符串
                pushToken("error-string");
            } else if (next_char == "\\") {
                state = State.StringEscape;
            }
        } else if (state == State.StringEnd) {
            pushToken("string");
        } else if (state == State.StringEscape) {
            if (isNewLine(next_char) || isEof()) {
                pushError("Incorrect string!"); // 错误字符串
                pushToken("error-string");
            } else {
                state = State.StringStart;
            }
        } else if (state == State.MarkStart) {
            if (next_char == "'") {
                state = State.MarkEnd;
            } else if (isNewLine(next_char) || isEof()) {
                pushError("Incorrect mark!"); // 错误mark
                pushToken("error-mark");
            }
        } else if (state == State.MarkEnd) {
            pushToken("mark");
        } else if (state == State.Number) {
            if (isNumber(next_char)) {
            } else if (isIdentifier(next_char)) {
                state = State.Letter;
            } else if (next_char == ".") {
                state = State.RealStart;
            } else {
                pushToken("int");
            }
        } else if (state == State.Letter) {
            if (isIdentifier(next_char) || isNumber(next_char)) { 
            } else {
                pushToken("id");
            }
        } else if (state == State.RealStart) {
            if (isNumber(next_char)) {
                state = State.Real;
            } else {
                pushToken("real");
            }
        } else if (state == State.Real) {
            if (isNumber(next_char)) {
                state = State.Real;
            } else {
                pushToken("real");
            }
        } else if (state == State.ItEq) {
            pushToken("op");
        } else if (state == State.LuaStart) {
            if (next_char == "?") {
                state = State.WaitLuaEnd;
            } else if (isEof()) {
                pushError("Misdefined instruction Lua!");
            }
        } else if (state == State.WaitLuaEnd) {
            if (next_char == "?") {
            } else if (next_char == ">") {
                state = State.LuaEnd;
            } else if (isEof()) {
                pushError("Misdefined instruction Lua!");
            } else {
                state = State.LuaStart;
            }
        } else if (state == State.LuaEnd) {
            pushToken("lua")
        } else if (state == State.GtEq) {
            pushToken("op");
        } else if (state == State.ZincReturn) {
            pushToken("op");
        } else if (state == State.Eq) {
            pushToken("op");
        }
        
        if (isNewLine(char)) {
            line++;
            position = 0;
        } else {
            position++;
        }
    }

    return marks;
}

class Position {
    public readonly line: number;
    public readonly position: number;

    public constructor(line: number, position: number) {
        this.line = line;
        this.position = position;
    }
}

class Range {
    public readonly start: Position;
    public readonly end: Position;

    public constructor(start: Position, end: Position) {
        this.start = start;
        this.end = end;
    }

}

class Fragment {
    public readonly start: number;
    public readonly end: number;

    public constructor(start: number, end: number) {
        if (end < start) {
            throw "'end' colud not less than the 'start'!";
        }
        this.start = start;
        this.end = end;
    }

    public contains(index: number): boolean {
        return index >= this.start && index < this.end;
    }
}

class JassError {

    public readonly document: Document;
    public readonly message: string;
    public readonly loc: Range;

    public constructor(document: Document, message: string, loc: Range) {
        this.document = document;
        this.message = message;
        this.loc = loc;
    }
}

class Document {
    private _filePath: string;
    private _content: string;

    public readonly errors: JassError[] = [];

    private static NewLineRegExp = new RegExp(/\n/);



    /**
     * 
     * @param filePathOrFileContent 如果fileContent为undefined，这这个为文件路径
     * @param fileContent 如果提供了filePathOrFileContent，则这个为文件内容
     */
    public constructor(filePathOrFileContent: string, fileContent?: string) {
        this._filePath = filePathOrFileContent;
        if (fileContent) {
            this._content = fileContent;
        } else {
            this._content = readFileContent(filePathOrFileContent);
        }

        this.replaceCommentEx();
    }

    private isNewLine(char: string): boolean {
        return isNewLine(char);
    }

    /**
     * 替换注释
     * @deprecated 太慢
     */
    private replaceComment() {
        let line: number = 0;
        let position: number = 0;
        // 记录多行注释开始位置
        let markStart: number = 0;
        let state = 0;

        const lineCommentFragments: Fragment[] = [];
        const multiCommentFragments: Fragment[] = [];
        const len = this._content.length;

        const pushError = (message: string) => {
            const err = new JassError(this, message, new Range(new Position(line, markStart), new Position(line, position)));
            this.errors.push(err);
        }
        for (let index = 0; index < len; index++) {
            const char = this._content.charAt(index);
            const isEof = () => index == len - 1;
            const eofHandle = () => {
                if (isEof()) {
                    if (state == 2) {
                        markLineComment();
                    } else if (state == 3 || state == 4) {
                        pushError("Incorrect multi line comment!"); // 错误多行注释
                    } else if (state == 5 || state == 6) {
                        pushError("Incorrect string!"); // 错误字符串
                    }
                }
            }
            const isOver = () => {
                return this.isNewLine(char);
            }
            const markLineComment = () => {
                const frag = new Fragment(markStart, index + 1);
                lineCommentFragments.push(frag);
            }
            const markMultiLineComment = () => {
                const frag = new Fragment(markStart, index + 1);
                multiCommentFragments.push(frag);
            }

            if (state == 0) {
                if (char == "/") {
                    state = 1;
                } else if (char == "\"") {
                    state = 5;
                }
            } else if (state == 1) {
                if (char == "/") {
                    // 注释
                    state = 2;
                    markStart = index - 1;
                } else if (char == "*") {
                    // 多行注释
                    state = 3;
                    markStart = index - 1;
                } else {
                    state = 0;
                }
            } else if (state == 2) { // 注释
                if (isOver()) { // 单行注释结束,并进行标记
                    state = 0;
                    markLineComment();
                }
            } else if (state == 3) {
                if (char == "*") { // 块注释结束
                    state = 4;
                }
            } else if (state == 4) {
                if (char == "*") { // 继续遇到星号，状态保持不变
                } else if (char == "/") {
                    state = 0;
                    markMultiLineComment();
                } else {
                    state = 3;
                }
            } else if (state == 5) {
                if (char == "\"") { // 字符串结束
                    state = 0;
                } else if (char == "\\") { //字符串进入转义状态
                    state = 6;
                } else if (isOver()) { // 遇到换行符
                    state = 0;
                    pushError("Incorrect string!"); // 错误字符串
                }
            } else if (state == 6) {
                if (isOver()) {
                    state = 0;
                    pushError("Incorrect string!"); // 错误字符串
                } else {
                    state = 5;
                }
            }
            if (this.isNewLine(char)) {
                line++;
                position = 0;
            } else {
                position++;
            }
            eofHandle();
        }

        this._content = this._content.split("").map((char, index) => {
            return multiCommentFragments.find(frag => frag.contains(index)) || lineCommentFragments.find(frag => frag.contains(index)) ? " " : char;
        }).join("");
    }
    /**
     * 替换注释 跟replaceComment效果一样
     */
    private replaceCommentEx() {
        let line: number = 0;
        let position: number = 0;
        // 记录多行注释开始位置
        let markStart: number = 0;
        let markPosition: Position = null as any;
        let state = 0;

        const len = this._content.length;
        const chars = this._content.split("");

        const pushError = (message: string) => {
            const err = new JassError(this, message, new Range(markPosition, new Position(line, position + 1)));
            this.errors.push(err);
        }
        for (let index = 0; index < len; index++) {
            const char = this._content.charAt(index);
            const isEof = () => index == len - 1;
            const eofHandle = () => {
                if (isEof()) {
                    if (state == 2) {
                        markLineComment();
                    } else if (state == 3 || state == 4) {
                        pushError("Incorrect multi line comment!"); // 错误多行注释
                    } else if (state == 5 || state == 6) {
                        // pushError("Incorrect string!"); // 错误字符串
                    }
                }
            }
            const isOver = () => {
                return this.isNewLine(char);
            }
            const markLineComment = () => {
                /*
                for (let i = markStart; i < index + 1; i++) {
                    chars[i] = " ";
                }*/
            }
            const markMultiLineComment = () => {
                for (let i = markStart; i < index + 1; i++) {
                    chars[i] = " ";
                }
            }

            if (state == 0) {
                if (char == "/") {
                    state = 1;
                } else if (char == "\"") {
                    state = 5;
                }
            } else if (state == 1) {
                if (char == "/") {
                    // 注释
                    state = 2;
                    markStart = index - 1;
                    markPosition = new Position(line, position - 1);
                } else if (char == "*") {
                    // 多行注释
                    state = 3;
                    markStart = index - 1;
                    markPosition = new Position(line, position - 1);
                } else {
                    state = 0;
                }
            } else if (state == 2) { // 注释
                if (isOver()) { // 单行注释结束,并进行标记
                    state = 0;
                    markLineComment();
                }
            } else if (state == 3) {
                if (char == "*") { // 块注释结束
                    state = 4;
                }
            } else if (state == 4) {
                if (char == "*") { // 继续遇到星号，状态保持不变
                } else if (char == "/") {
                    state = 0;
                    markMultiLineComment();
                } else {
                    state = 3;
                }
            } else if (state == 5) {
                if (char == "\"") { // 字符串结束
                    state = 0;
                } else if (char == "\\") { //字符串进入转义状态
                    state = 6;
                } else if (isOver()) { // 遇到换行符
                    state = 0;
                    // pushError("Incorrect string!"); // 错误字符串
                }
            } else if (state == 6) {
                if (isOver()) {
                    state = 0;
                    // pushError("Incorrect string!"); // 错误字符串
                } else {
                    state = 5;
                }
            }
            if (this.isNewLine(char)) {
                line++;
                position = 0;
            } else {
                position++;
            }
            eofHandle();
        }

        this._content = chars.join("");
    }

    public getFilePath(): string {
        return this._filePath;
    }

    public getText() {
        return this._content;
    }
}

type MarkType = "real" | "int" | "string" | "mark" | "id" | "comment" | "op" | "macro" | "comment" | "error-string" | "error-mark" | "lua";

class Mark {

    private readonly document:Document;
    private readonly range:Range;
    private readonly fragment: Fragment;
    private type: MarkType;

    public constructor(document: Document, range: Range, fragment: Fragment, type: MarkType) {
        this.document = document;
        this.range = range;
        this.fragment = fragment;
        this.type = type;
    }

    public getType() : string {
        return this.type;
    }

    public isId() {
        return this.type == "id";
    }
    public isInt() {
        return this.type == "int";
    }
    public isReal() {
        return this.type == "real";
    }
    public isString() {
        return this.type == "string" || this.type == "error-string";
    }
    public isComment() {
        return this.type == "comment";
    }
    public isMark() {
        return this.type == "mark";
    }
    public isOp() {
        return this.type == "op";
    }
    public isMacro() {
        return this.type == "macro";
    }    
    public isLua() {
        return this.type == "lua";
    }

    public value():string {
        return this.document.getText().substring(this.fragment.start, this.fragment.end);
    }

    public get loc():Range {
        return this.range;
    }
}

export {
    Document,
    lexically,
    Range,
    Position,
    JassError
}

if (false) {
    const document = new Document(`E:/projects/jass/static/common.j`, `
    // babab
    2+6.5 ->==`);
    console.log(document);
    console.log(lexically(document).map(mark => mark.value()));
}
