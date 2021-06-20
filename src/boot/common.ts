class Position {
	public line: number;
	public position: number;

	constructor(line: number, position: number = 0) {
		this.line = line;
		this.position = position;
	}

}

class Range {
	public start: Position;
	public end: Position;

	constructor(start: Position, end: Position) {
		this.start = start;
		this.end = end;
	}

	public static default () :Range {
		return new Range(new Position(0,0), new Position(0,0))
	}
}

interface Rangebel {
	loc: Range;
}

interface Desc {
	text:string;
}

export {
	Position,
	Range,
	Rangebel,
	Desc
};