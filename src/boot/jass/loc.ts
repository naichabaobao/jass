export class Position {
  public line: number;
  public position: number;

  constructor(line: number = 0, position: number = 0) {
    this.line = line;
    this.position = position;
  }
}

export class Range {
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
    return new Range(new Position(0, 0), new Position(0, 0))
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

  public contains(positionOrRange: Position | Range): boolean {
    if (positionOrRange instanceof Position) {
      return (this.start.line < positionOrRange.line || (this.start.line == positionOrRange.line && this.start.position < positionOrRange.position))
        &&
        (this.end.line > positionOrRange.line || (this.end.line == positionOrRange.line && this.end.position > positionOrRange.position));
    } else {
      return (this.start.line < positionOrRange.start.line || (this.start.line == positionOrRange.start.line && this.start.position < positionOrRange.start.position))
        &&
        (this.end.line > positionOrRange.end.line || (this.end.line == positionOrRange.end.line && this.end.position > positionOrRange.end.position));
    }
  }

  public from<T extends Range>(range: T) {
    this.start = range.start;
    this.end = range.end;
    return this;
  }
}
