import { timeStamp } from "console";

type ModifierType = "private" | "public";


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
}

interface Rangebel {
	loc: Range;
}

class Take implements Rangebel {

	public type: string;
	public name: string;
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}

	public get origin() : string {
		return `${this.type} ${this.name}`;
	}
}

class Global implements Rangebel {
	public isConstant: boolean = false;
	public isArray:boolean = false;
	public size:number = 0;
	public tag: ModifierType = "public";
	public type: string;
	public name: string;
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}

	public get origin() : string {
		if (this.isConstant && this.isArray) {
			return `${this.tag} constant ${this.type} ${this.name}[${this.size > 0 ? this.size : ""}]`;
		} else if (this.isArray) {
			return `${this.tag} ${this.type} ${this.name}[${this.size > 0 ? this.size : ""}]`;
		} else if (this.isConstant) {
			return `${this.tag} constant ${this.type} ${this.name}`;
		} else {
			return `${this.tag} ${this.type} ${this.name}`;
		}
	}
}

class Func implements Rangebel {
	public tag: ModifierType = "public";
	public name: string;
	public readonly takes: Take[];
	public returns: string | null;
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));
	public readonly locals: Local[] = [];

	constructor(name: string, takes: Take[] = [], returns: string | null = null) {
		this.name = name;
		this.takes = takes;
		this.returns = returns;
	}

	public get origin() : string {
		return `${this.tag} function ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
	}
}

class FunctionInterface {
	public readonly takes: Take[];
	public returns: string | null;

	constructor(takes: Take[] = [], returns: string | null = null) {
		this.takes = takes;
		this.returns = returns;
	}
}

/**
 * 函数指针(接口)
 */
class TypePonint {
	// 一个有单个单位参数的函数类型
	// type unitFunc extends function(unit);

	// 一个有两个整数参数并返回布尔值的函数类型
	// type evFunction extends function(integer,integer) -> boolean;

	public type: string;
	public func:FunctionInterface;
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));
	public readonly locals: Local[] = [];

	constructor(type: string, takes: Take[] = [], returns: string | null = null) {
		this.type = type;
		this.func = new FunctionInterface(takes, returns);
	}

}

class ArrayType {
	public type:string;
	public size:number;
	public max: number;

	constructor(type:string, size: number = 0, max:number = 0) {
		this.type = type;
		if (max < size) {
			max = size;
		}
		this.size = size;
		this.max = max;
	}

}

class DynamicArray {
	public type: string;
	public extendType: ArrayType;

	constructor(type:string, extend:string, size: number = 0, max:number = 0) {
		this.type = type;
		this.extendType = new ArrayType(extend, size, max)
	}

}

class Method extends Func implements Rangebel {
	public tag: ModifierType = "private";
	public isStatic: boolean = false;

	public get origin() : string {
		return `${this.tag}${this.isStatic ? " static" : ""} method ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
	}

}


class Member implements Rangebel {
	public isConstant: boolean = false;
	public tag: ModifierType = "private";
	public isStatic: boolean = false;
	public isArray:boolean = false;
	// isArray 为 true 时有效
	public size:number = 0;
	public type: string;
	public name: string;
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}

	public get origin() : string {
		return `${this.tag}${this.isStatic ? " static" : ""}${this.isConstant ? " constant" : ""} ${this.type} ${this.name}${this.isArray ? "[" + (this.size > 0 ? this.size : "") + "]" : ""};`;
	}
}

class Interface implements Rangebel {
	public tag:ModifierType = "public";
	public name: string;
	public members:Member[] = [];
	public methods: Method[] = [];
	public operators: Method[] = [];
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));

	constructor(name: string) {
		this.name = name;
	}
}

class InterfaceArray extends Interface{
	public size:number = 0;
}

class Struct extends Interface implements Rangebel {
	public extends:string|null = null;
	// constructor(name:string) {
	// 	super(name);
	// }

	public get origin() : string {
		return `${this.tag} struct ${this.name} {}`;
	}
}


class StructArray extends Struct{
	public size:number = 0;
}

class Local implements Rangebel {
	public type: string;
	public name: string;
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}
}



class Library implements Rangebel {
	public name: string;
	public requires: string[] = [];
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));
	public readonly structs: Struct[] = [];
	public readonly functions: Func[] = [];
	public readonly globals: Global[] = [];

	constructor(name: string) {
		this.name = name;
	}

	public get origin() : string {
		return `library ${this.name} {}`;
	}
}

export {
	ArrayType,
	DynamicArray,
	Func,
	FunctionInterface,
	Global,
	Interface,
	InterfaceArray,
	Library,
	Local,
	Member,
	Method,
	ModifierType,
	Position,
	Range,
	Rangebel,
	Struct,
	StructArray,
	Take,
	TypePonint
};