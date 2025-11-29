import {
	Position,
	Range
} from "../jass/loc"
import { Rangebel } from "../jass/ast"

import {Take, Local} from "../jass/ast";
import * as jass from "../jass/ast";

export type ModifierType = "private" | "public" | "default";

export class Global extends jass.Global implements Rangebel {
	public tag: ModifierType = "default";

	public get origin() : string {
		return `${this.tag} ${this.type} ${this.name}`;
	}
}

export class Func extends jass.Func implements Rangebel {
	public tag: ModifierType = "default";

	constructor(context: any, name: string, takes: Take[] = [], returns: string | null = null) {
		super(context, name, takes, returns || "nothing");
	}

	public get origin() : string {
		return `${this.tag} function ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"} {}`;
	}
}

export class FunctionInterface {
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
export class TypePonint {
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

export class ArrayType {
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

export class DynamicArray {
	public type: string;
	public extendType: ArrayType;

	constructor(type:string, extend:string, size: number = 0, max:number = 0) {
		this.type = type;
		this.extendType = new ArrayType(extend, size, max)
	}

}

export class Method extends Func implements Rangebel {
	public tag: ModifierType = "default";
	public isStatic: boolean = false;

	public get origin() : string {
		return `${this.tag}${this.isStatic ? " static" : ""} method ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
	}

}


export class Member implements Rangebel {
	public isConstant: boolean = false;
	public tag: ModifierType = "default";
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

export class Interface implements Rangebel {
	public tag:ModifierType = "default";
	public name: string;
	public members:Member[] = [];
	public methods: Method[] = [];
	public operators: Method[] = [];
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));

	constructor(name: string) {
		this.name = name;
	}
}

export class InterfaceArray extends Interface{
	public size:number = 0;
}

export class Struct extends Interface implements Rangebel {
	public extends:string|null = null;

	public get origin() : string {
		return `${this.tag} struct ${this.name} endstruct`;
	}
}


export class StructArray extends Struct{
	public size:number = 0;
}




export class Library implements Rangebel {
	public name: string;
	public initializer:string|null = null;
	public requires: string[] = [];
	public loc: Range = new Range(new Position(0, 0), new Position(0, 0));
	public readonly structs: Struct[] = [];
	public readonly functions: Func[] = [];
	public readonly globals: Global[] = [];

	constructor(name: string) {
		this.name = name;
	}

	public get origin() : string {
		return `library ${this.name}${this.requires.length > 0 ? " " + this.requires.join(", ") : ""} endlibrary`;
	}

	
	public get needs() : string[] {
		return this.requires;
	}
	

}

// 重新导出从其他模块导入的类型
export { Local, Rangebel } from "../jass/ast";
export { Position, Range } from "../jass/loc";