import { Range, Rangebel } from "../common";

class Take implements Rangebel {

	public type: string;
	public name: string;
	public loc: Range = Range.default();

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}

	public get origin() : string {
		return `${this.type} ${this.name}`;
	}
}

class Native implements Rangebel{
	public readonly loc: Range = Range.default();

	public name: string;
	public readonly takes: Take[];
	public returns: string | null;


	constructor(name: string, takes: Take[] = [], returns: string | null = null) {
		this.name = name;
		this.takes = takes;
		this.returns = returns;
	}

	public get origin() : string {
		return `native ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"} {}`;
	}
}

class Func extends Native implements Rangebel{
	public readonly loc: Range = Range.default();

	public readonly locals: Local[] = [];

	public get origin() : string {
		return `function ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"} {}`;
	}

}

class Global implements Rangebel{
	public readonly loc: Range = Range.default();

	public isConstant: boolean = false;
	public isArray:boolean = false;
	public type: string;
	public name: string;

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}
}


class Local implements Rangebel {
	public readonly loc: Range = Range.default();

	public type: string;
	public name: string;
	public isArray:boolean = false;

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}

	public get origin() : string {
		return `local ${this.type}${this.isArray ? " array" : ""} ${this.name}`
	}
	
}

class JassError implements Rangebel{
	public readonly message:string;
	public readonly loc: Range = Range.default();

	constructor(message:string) {
		this.message = message;
	}
}

class Program {

	public readonly natives:Native[] = [];
	public readonly functions:Func[] = [];
	public readonly globals:Global[] = [];
	public readonly errors:JassError[] = [];

}

export {
	Take,
	Func,
	Global,
	Local,
	Program,
	JassError,
	Native
};