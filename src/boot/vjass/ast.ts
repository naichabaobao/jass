import {
	Desc,
	Position,
	Range,
	Rangebel
} from "../common"

import {Take, Local} from "../jass/ast";
import * as jass from "../jass/ast";

type ModifierType = "private" | "public" | "default";

class Global extends jass.Global implements Rangebel {
	public tag: ModifierType = "default";

	public get origin() : string {
		return `${this.tag == "default" ? "" : this.tag + " "}${this.isConstant ? "constant " : ""}${this.type} ${this.isArray ? "array " : ""}${this.name}`;
	}
}

class Func extends jass.Func implements Rangebel {
	public tag: ModifierType = "default";
	public defaults:string | null = null;

	constructor(name: string, takes: Take[] = [], returns: string) {
		super(name, takes, returns);
	}

	public get origin() : string {
		const defaultString = this.defaults !== null ? (' defaults ' + this.defaults) : "";
		return `${this.tag} function ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}${defaultString}`;
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
	public tag: ModifierType = "default";
	public isStatic: boolean = false;

	public get origin() : string {
		return `${this.tag}${this.isStatic ? " static" : ""} method ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
	}

}










class VjassError extends jass.JassError {

	constructor(message:string) {
		super(message);
	}

}
