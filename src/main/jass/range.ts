class Range {
    /**
     * 开始行
     */
    private startLine:number = 0;
    /**
     * 开始位置
     */
    private startPosition:number = 0;
    /**
     * 结束行
     */
    private endLine:number = 0;
    /**
     * 结束位置
     */
    private endPosition:number = 0;
    public setStart(startLine:number, startPosition:number) {
        this.startLine = startLine;
        this.startPosition = startPosition;
        
        if (this.startLine > this.endLine) {
            this.endLine = this.startLine;
            this.endPosition = this.startPosition;
        } else if (this.startLine === this.endLine && this.endPosition < this.startPosition) {
            this.endLine = this.startPosition;
        }
    }
    public setEnd(endLine:number, endPosition:number) {
        if (endLine < this.startLine) {
            throw "end line cat not lt start line!";
        }
        if (endLine === this.startLine && endPosition < this.startPosition) {
            throw "end position cat not lt start position!";
        }
        this.endLine = endLine;
        this.endPosition = endPosition;
    }
    public getStartLine() {
        return this.startLine;
    }
    public getStartPosition() {
        return this.startPosition;
    }
    public getEndLine() {
        return this.endLine;
    }
    public getEndPosition() {
        return this.endPosition;
    }
}

class Location {
    public startLine:number|null = null;
    public startPosition:number|null = null;
    public endLine:number|null = null;
    public endPosition:number|null = null;
}

export {Range, Location};
