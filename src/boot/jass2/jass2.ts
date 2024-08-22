import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as vscode from "vscode";

function isEmptyString(text: string) {
    return text.trim().length == 0;
}
function firstNonWhitespaceCharacterIndexString(text: string) {
    const result = /^\s*(?:\b|$)/.exec(text);
    if (result) {
        return result[0].length;
    }
    return 0;
}

class Position {
    private _line: number;
    private _character: number;


    public get line(): number {
        return this._line;
    }

    public get character(): number {
        return this._character;
    }

    constructor(line: number, character: number) {
        this._line = line;
        this._character = character;
    }
    isBefore(other: Position): boolean {
        if (this._line > other._line) {
            return true;
        } else if (this._line == other._line && this._character > other._character) {
            return true;
        }
        return false;
    }
    isBeforeOrEqual(other: Position): boolean {
        if (this._line > other.line) {
            return true;
        } else if (this._line == other.line && this._character >= other.character) {
            return true;
        }
        return false;
    }
    isAfter(other: Position): boolean {
        if (this._line < other.line) {
            return true;
        } else if (this._line == other.line && this._character < other.character) {
            return true;
        }
        return false;
    }
    isAfterOrEqual(other: Position): boolean {
        if (this._line < other.line) {
            return true;
        } else if (this._line == other.line && this._character <= other.character) {
            return true;
        }
        return false;
    }
    isEqual(other: Position): boolean {
        return this._line == other.line && this._character == other.character;
    }
    compareTo(other: Position): number {
        throw new Error("Method not implemented.");
    }
    translate(lineDelta?: number | undefined, characterDelta?: number | undefined): Position {
        if (lineDelta) {
            this._line += lineDelta;
        }
        if (characterDelta) {
            this._character += characterDelta;
        }
        return this;
    }
    with(lineDelta?: number | undefined, characterDelta?: number | undefined): Position {
        let line = this._line;
        let character = this._character;
        if (lineDelta) {
            line += lineDelta;
        }
        if (characterDelta) {
            character += characterDelta;
        }
        return new Position(line, character);
    }


}

class Range {
    private _start: Position;
    private _end: Position;
    // @ts-ignore
    private _isEmpty: boolean;
    // @ts-ignore
    private _isSingleLine: boolean;


    public get start(): Position {
        return this._start;
    }
    public get end(): Position {
        return this._end;
    }
    public get isEmpty(): boolean {
        return this._isEmpty;
    }
    public get isSingleLine(): boolean {
        return this._isSingleLine;
    }


    constructor(start: Position, end: Position) {
        if (start.isAfter(end)) {
            this._start = end;
            this._end = start;
        } else {
            this._start = start;
            this._end = end;
        }

        this.clacIsEmpty();
        this.clacIsSingleLin();
    }

    private clacIsEmpty() {
        this._isEmpty = this._start.isEqual(this._end);
    }
    private clacIsSingleLin() {
        this._isSingleLine = this._start.line == this._end.line;
    }

    contains(positionOrRange: Position | Range): boolean {
        if (positionOrRange instanceof Position) {
            return this._start.isAfterOrEqual(positionOrRange) && this._end.isBeforeOrEqual(positionOrRange);
        } else {
            return this._start.isAfterOrEqual(positionOrRange.start) && this._end.isBeforeOrEqual(positionOrRange.end);
        }
    }
    isEqual(other: Range): boolean {
        return this._start.isEqual(other.start) && this._end.isEqual(other.end);
    }

    /**
     * 交集
     * Intersect `range` with this range and returns a new range or `undefined`
     * if the ranges have no overlap.
     *
     * @param range A range.
     * @returns A range of the greater start and smaller end positions. Will
     * return undefined when there is no overlap.
     */
    intersection(range: Range): Range | undefined {
        if (range.end.isBefore(this._start) || range.start.isAfter(this._start)) {
            return undefined;
        }
        const startPosition = this._start.isAfter(range.start) ? this._start : range.start;
        const endPosition = this._end.isBefore(range.end) ? this._end : range.end;
        return new Range(startPosition, endPosition);
    }
    /**
     * 并集
     * Compute the union of `other` with this range.
     *
     * @param other A range.
     * @returns A range of smaller start position and the greater end position.
     */
    union(range: Range): Range {
        const startPosition = this._start.isAfter(range.start) ? range.start : this._start;
        const endPosition = this._end.isBefore(range.end) ? range.end : this._end;
        return new Range(startPosition, endPosition);
    }


    /**
     * 可能有bug
     * @param start 
     * @param end 
     * @returns 
     */
    with(start?: Position | undefined, end?: Position | undefined): Range {
        if (start) {
            this._start.with(start.line, start.character);
        }
        if (end) {
            this._end.with(end.line, end.character);
        }
        this.clacIsEmpty();
        this.clacIsSingleLin();
        return this;
    }

}

class TextLine {
    readonly lineNumber: number;
    readonly text: string;
    readonly range: Range;
    readonly rangeIncludingLineBreak: Range;
    readonly firstNonWhitespaceCharacterIndex: number;
    readonly isEmptyOrWhitespace: boolean;


    constructor(line: number, text: string) {
        this.lineNumber = line;
        this.text = text;

        this.range = new Range(new Position(line, 0), new Position(line, text.trimEnd().length));
        this.rangeIncludingLineBreak = new Range(new Position(line, 0), new Position(line, text.length));

        this.firstNonWhitespaceCharacterIndex = firstNonWhitespaceCharacterIndexString(text);
        this.isEmptyOrWhitespace = isEmptyString(text);
    }
}

enum EndOfLine {
    /**
     * The line feed `\n` character.
     */
    LF = 1,
    /**
     * The carriage return line feed `\r\n` sequence.
     */
    CRLF = 2
}

class Uri {
    private _data: path.ParsedPath;

    public get dir(): string {
        return this._data.dir;
    }
    public get base(): string {
        return this._data.base;
    }
    public get name(): string {
        return this._data.name;
    }

    public get fsPath(): string {
        return this.toString();
    }


    constructor(filePath: string) {
        this._data = path.parse(filePath);
    }

    toString(skipEncoding?: boolean | undefined): string {
        return path.resolve(this._data.dir, this._data.base);
    }
    toJSON() {
        return JSON.stringify(this._data);
    }

    isJFile(): boolean {
        return this._data.ext == ".j" || this._data.ext == ".jass";
    }
    isAiFile(): boolean {
        return this._data.ext == ".ai";
    }
    isLuaFile(): boolean {
        return this._data.ext == ".lua";
    }
    isVjassFile(): boolean {
        return this._data.ext == ".jass" || this._data.ext == ".vjass";
    }
    isZincFile(): boolean {
        return this._data.ext == ".zn" || this._data.ext == ".zinc";
    }
    isCjassFile(): boolean {
        return this._data.ext == ".cjass" || this._data.ext == ".cj";
    }

    isEquels(filePathOrUri: string | Uri): boolean {
        if (typeof filePathOrUri == "string") {
            return this.isEquels(new Uri(filePathOrUri));
        } else {
            return this._data.dir == filePathOrUri.dir && this._data.base == filePathOrUri.base;
        }
    }
}

class Document {
    readonly uri: Uri;
    readonly fileName: string;
    readonly languageId: string = "";
    // 无用项
    readonly version: "1.2"|"1.24"|"1.27"|"1.29"|"1.3+" = "1.3+";
    
    readonly lineCount: number;
    
    private readonly lines:TextLine[] = [];
    constructor(filePath: string) {
        this.uri = new Uri(filePath);
        this.fileName = this.uri.name;
        if (this.uri.isJFile()) {
            this.languageId = "jass";
        } else if (this.uri.isLuaFile()) {
            this.languageId = "lua";
        } else if (this.uri.isZincFile()) {
            this.languageId = "zinc";
        }

        const stream = fs.createReadStream(filePath);
        const streamInterface = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });

        let index = 0;
        streamInterface.on("line", (input) => {
            this.lines.push(new TextLine(index, input));
            index++;
        });

        this.lineCount = index;
    }

    lineAt(line: number|Position): TextLine {
        return this.lines[typeof line == "number" ? line : line.line];
    }
    /**
     * validatePosition 并未依赖
     * @param position 
     * @returns 
     */
    offsetAt(position: vscode.Position): number {
        let index = 0;
        const prelines = this.lines.slice(0, position.line - 1);
        prelines.forEach(line => {
            index += line.text.length;
        });
        index += position.character;
        return index;
    }
    positionAt(offset: number): vscode.Position {
        throw new Error("Method not implemented.");
    }
    getText(range?: vscode.Range | undefined): string {
        throw new Error("Method not implemented.");
    }
    getWordRangeAtPosition(position: vscode.Position, regex?: RegExp | undefined): vscode.Range | undefined {
        throw new Error("Method not implemented.");
    }
    validateRange(range: vscode.Range): vscode.Range {
        throw new Error("Method not implemented.");
    }
    validatePosition(position: vscode.Position): vscode.Position {
        throw new Error("Method not implemented.");
    }

}

new Document("E:/projects/jass/static/AIScripts.ai")


class Token extends Range {

}

class J {
    // public static tokens(content: string): Token[] {

    // }
}