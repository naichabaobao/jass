/**
 * 统一的位置和范围类型定义
 * 整合了 jass/loc.ts 和 vjass/loc.ts 的实现
 */

/**
 * Position 类型定义（接口）
 */
export interface IPosition {
    line: number;
    position: number;
}

/**
 * Range 类型定义（接口）
 */
export interface IRange {
    start: IPosition;
    end: IPosition;
}

/**
 * Position 类实现
 */
export class Position implements IPosition {
    public line: number;
    public position: number;

    constructor(line: number = 0, position: number = 0) {
        this.line = line;
        this.position = position;
    }
}

/**
 * Range 类实现
 */
export class Range implements IRange {
    private _start: Position;
    private _end: Position;

    public get start(): Position {
        return this._start;
    }

    public get end(): Position {
        return this._end;
    }

    public set start(start: Position) {
        this._start = start;
        if (this.end.line < start.line) {
            this._end = this._start;
        } else if (this.end.line == start.line && this.end.position < start.position) {
            this._end.position = this._start.position;
        }
    }

    public set end(end: Position) {
        this._end = end;
    }

    public constructor(start: Position = new Position(), end: Position = new Position()) {
        this._start = start;
        this._end = end;
    }

    public static default(): Range {
        return new Range(new Position(0, 0), new Position(0, 0));
    }

    /**
     * @deprecated 使用from,更加贴近vscode方式
     * @param range 
     * @returns 
     */
    public setRange<T extends Range>(range: T) {
        this.start = range.start;
        this.end = range.end;
        return this;
    }

    public contains(positionOrRange: Position | IRange): boolean {
        // 空值检查
        if (!positionOrRange) {
            return false;
        }

        // 检查当前范围是否有效
        if (!this.isValid()) {
            return false;
        }

        if (positionOrRange instanceof Position) {
            return this.containsPosition(positionOrRange);
        } else {
            return this.containsRange(positionOrRange);
        }
    }

    /**
     * 检查位置是否在当前范围内
     * @param position 要检查的位置
     * @returns 如果在范围内返回 true
     */
    private containsPosition(position: Position): boolean {
        if (!position || !this.isValid()) {
            return false;
        }

        // 检查位置是否在开始之后或等于开始
        const afterStart = this.start.line < position.line || 
            (this.start.line === position.line && this.start.position <= position.position);

        // 检查位置是否在结束之前或等于结束
        const beforeEnd = this.end.line > position.line || 
            (this.end.line === position.line && this.end.position >= position.position);

        return afterStart && beforeEnd;
    }

    /**
     * 检查范围是否在当前范围内
     * @param range 要检查的范围
     * @returns 如果在范围内返回 true
     */
    private containsRange(range: IRange | Range): boolean {
        if (!range || !this.isValid()) {
            return false;
        }
        
        // 如果是 Range 实例，检查其有效性
        if (range instanceof Range && !range.isValid()) {
            return false;
        }

        // 检查范围的开始是否在当前范围内
        const startContained = this.containsPosition(range.start);
        
        // 检查范围的结束是否在当前范围内
        const endContained = this.containsPosition(range.end);

        return startContained && endContained;
    }

    /**
     * 检查当前范围是否有效
     * @returns 如果范围有效返回 true
     */
    public isValid(): boolean {
        if (!this._start || !this._end) {
            return false;
        }

        // 检查行号是否有效
        if (this._start.line < 0 || this._end.line < 0) {
            return false;
        }

        // 检查位置是否有效
        if (this._start.position < 0 || this._end.position < 0) {
            return false;
        }

        // 检查范围是否合理（end 应该在 start 之后或相等）
        if (this._end.line < this._start.line) {
            return false;
        }

        if (this._end.line === this._start.line && this._end.position < this._start.position) {
            return false;
        }

        return true;
    }

    /**
     * 检查位置是否在范围的开始边界上
     * @param position 要检查的位置
     * @returns 如果在开始边界上返回 true
     */
    public isAtStart(position: Position): boolean {
        if (!position || !this.isValid()) {
            return false;
        }

        return this._start.line === position.line && this._start.position === position.position;
    }

    /**
     * 检查位置是否在范围的结束边界上
     * @param position 要检查的位置
     * @returns 如果在结束边界上返回 true
     */
    public isAtEnd(position: Position): boolean {
        if (!position || !this.isValid()) {
            return false;
        }

        return this._end.line === position.line && this._end.position === position.position;
    }

    /**
     * 检查位置是否在范围的内部（不包括边界）
     * @param position 要检查的位置
     * @returns 如果在内部返回 true
     */
    public isInside(position: Position): boolean {
        if (!position || !this.isValid()) {
            return false;
        }

        // 检查是否在开始之后
        if (this._start.line > position.line || 
            (this._start.line === position.line && this._start.position >= position.position)) {
            return false;
        }

        // 检查是否在结束之前
        if (this._end.line < position.line || 
            (this._end.line === position.line && this._end.position <= position.position)) {
            return false;
        }

        return true;
    }

    /**
     * 检查两个范围是否重叠
     * @param other 另一个范围
     * @returns 如果重叠返回 true
     */
    public overlaps(other: IRange | Range): boolean {
        if (!other || !this.isValid()) {
            return false;
        }
        
        // 如果是 Range 实例，检查其有效性
        if (other instanceof Range && !other.isValid()) {
            return false;
        }

        // 检查是否有重叠
        return !(this._end.line < other.start.line || 
                 (this._end.line === other.start.line && this._end.position < other.start.position) ||
                 other.end.line < this._start.line || 
                 (other.end.line === this._start.line && other.end.position < this._start.position));
    }

    /**
     * 获取范围的字符串表示
     * @returns 范围的字符串表示
     */
    public toString(): string {
        if (!this.isValid()) {
            return "Invalid Range";
        }

        return `Range(${this._start.line}:${this._start.position} - ${this._end.line}:${this._end.position})`;
    }

    public from<T extends IRange>(range: T) {
        this.start = range.start;
        this.end = range.end;
        return this;
    }
}
