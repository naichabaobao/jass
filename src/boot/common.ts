class Position {
	public line: number;
	public position: number;

	constructor(line: number = 0, position: number = 0) {
		this.line = line;
		this.position = position;
	}

}

class Range {
	public start: Position;
	public end: Position;

	constructor(start: Position = new Position(), end: Position = new Position()) {
		this.start = start;
		this.end = end;
	}

	public static default () :Range {
		return new Range(new Position(0,0), new Position(0,0))
	}


	public setRange<T extends Range>(range: T): void {
		this.start = range.start;
		this.end = range.end;
	}

	public contains(positionOrRange: Position | Range): boolean {
		if (positionOrRange instanceof Position) {
			return (this.start.line < positionOrRange.line || (this.start.line == positionOrRange.line && this.start.position < positionOrRange.position))
				&& 
				(this.end.line > positionOrRange.line || (this.end.line == positionOrRange.line && this.end.position > positionOrRange.position));
		} else {
			return (this.start.line < positionOrRange.start.line || (this.start.line == positionOrRange.start.line && this.start.position < positionOrRange.start.position) )
				&&
				(this.end.line > positionOrRange.end.line || (this.end.line == positionOrRange.end.line && this.end.position > positionOrRange.end.position));
		}
	}

}



interface Rangebel {
	loc: Range;

	
}

/**
 * @deprecated 采用多行形式
 */
interface Desc {
	text:string;
}


export {
	Position,
	Range,
	Rangebel,
	Desc
};