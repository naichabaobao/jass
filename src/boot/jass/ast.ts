
import { Token } from "./tokens";

import * as path from "path";
import { getFileContent, isSpace, isUsableFile } from "../tool";
import { lines } from "./tool";


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
			return (this.start.line < positionOrRange.start.line || (this.start.line == positionOrRange.start.line && this.start.position < positionOrRange.start.position) )
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


/**
 * @deprecated 优先使用Range
 */
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

class LineText extends Range {

    private text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    // 是否空行
    public isEmpty(): boolean {
        return this.text.trimStart() === "";
    }

    public getText(): string {
        return this.text;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public lineNumber(): number {
        return this.start.line;
    }

    // 第一个字符下标
    public firstCharacterIndex(): number {
        let index = 0;
        for (; index < this.text.length; index++) {
            const char = this.text[index];
            if (!isSpace(char)) {
                return index;
            }
        }
        return index;
    }

    public length(): number {
        return this.text.length;
    }

    public clone(): LineText {
        return Object.assign(new LineText(this.getText()), this);
    }

}



class Node implements Rangebel  { 
	public readonly loc: Range = Range.default(); 
}

type ParamAnnotation = {
	id: string,
	descript: string
};

class Declaration extends Node implements Descript {

	/**
	 * 来源文件
	 */
	public source: string = "";

	public readonly lineComments: LineComment[] = [];

	public hasDeprecated(): boolean {
		return this.lineComments.findIndex((lineComment) => new RegExp(/^\s*@deprecated\b/, "").test(lineComment.getContent())) != -1;
	}

	public getParams() : ParamAnnotation[] {
		return <ParamAnnotation[]>this.lineComments.map((lineComment) => {
			const result = new RegExp(/^\s*@params?\s+(?<id>[a-zA-Z][a-zA-Z\d_]*)(?:\s*(?<descript>.+))?/, "").exec(lineComment.getContent());
			if (result && result.groups) {
				return {
					id: result.groups["id"],
					descript: result.groups["descript"],
				};
			}
		}).filter(x => x);
	}

	public getTexts() {
		return this.lineComments.filter((lineComment) => !/^\s*@(?:deprecated|params?)\b/.test(lineComment.getContent()))
	}

	public getContents() {
		return this.getTexts().map((lineComment) => lineComment.getContent());
	}

}

type ModifierType = "private" | "public" | "default";

/**
 * 多行提示
 */
interface Descript {
	readonly lineComments: LineComment[];
}

type OriginStyle = "jass" | "vjass" | "zinc";

interface Option {
	option: {
		style: OriginStyle
	}
}

class Take extends Node {

	public type: string;
	public nameToken: Token | null = null;
	public name: string;

	constructor(type: string, name: string) {
		super();
		this.type = type;
		this.name = name;
	}

	public get origin(): string {
		return `${this.type} ${this.name}`;
	}
}

class Native extends Declaration implements Desc, Descript {
	public nameToken: Token | null = null;
	public name: string;
	public readonly takes: Take[];
	public returns: string;
	public text: string = "";
	private constant = false;
	public readonly lineComments: LineComment[] = [];

	constructor(name: string = "", takes: Take[] = [], returns: string = "nothing") {
		super();
		this.name = name;
		this.takes = takes;
		this.returns = returns;
	}


	public get origin(): string {
		return `native ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}`;
	}

	public isConstant() {
		return this.constant;
	}

	public setConstant(isConstant: boolean) {
		this.constant = isConstant;
	}

}

class Func extends Native implements Rangebel, Option {
	public option: { style: OriginStyle; } = {
		style: "vjass"
	};
	public readonly loc: Range = Range.default();

	public tag: "private" | "public" | "default" = "default";
	public defaults: string | null = null;

	public readonly locals: Local[] = [];
	public readonly tokens: Token[] = [];
	public readonly globals: Global[] = [];

	public get origin(): string {
		if (this.option.style == "vjass") {
			const defaultString = this.defaults !== null ? (' defaults ' + this.defaults) : "";
			return `${this.tag == "default" ? "" : this.tag + " "}function ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}`;
		} else if (this.option.style == "zinc") {
			return `${this.tag == "default" ? "" : this.tag + " "}function ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
		}
		return `function ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}`;

	}

	public getGlobals() {
		return this.globals;
	}

}

class Method extends Func implements Rangebel {
	public tag: ModifierType = "default";
	public modifier: "default" | "static" | "stub" = "default";

	public isOperator: boolean = false;

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.tag}${this.modifier == "default" ? "" : " " + this.modifier} method ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
		} else if (this.option.style == "zinc") {
			return `${this.tag}${this.modifier == "default" ? "" : " " + this.modifier} method ${this.isOperator ? "operator " : ""}${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
		}
		return `${this.tag}${this.modifier == "default" ? "" : " " + this.modifier} method ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
	}

}

class Global extends Declaration implements Desc, Descript, Option {
	public option: { style: OriginStyle; } = {
		style: "vjass"
	};
	public readonly loc: Range = Range.default();
	public tag: ModifierType = "default";
	public isConstant: boolean = false;
	public isArray: boolean = false;
	public type: string;
	public nameToken: Token | null = null;
	public name: string;
	public text: string = "";
	public readonly lineComments: LineComment[] = [];

	public size: number = 0;

	constructor(type: string = "", name: string = "") {
		super();
		this.type = type;
		this.name = name;
	}

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.isConstant ? "constant " : ""}${this.type}${this.isArray ? " array" : ""} ${this.name}`;
		} else if (this.option.style == "zinc") {
			if (this.isConstant && this.isArray) {
				return `${this.tag == "default" ? "" : this.tag + " "}constant ${this.type} ${this.name}[${this.size > 0 ? this.size : ""}]`;
			} else if (this.isArray) {
				return `${this.tag == "default" ? "" : this.tag + " "}${this.type} ${this.name}[${this.size > 0 ? this.size : ""}]`;
			} else if (this.isConstant) {
				return `${this.tag == "default" ? "" : this.tag + " "}constant ${this.type} ${this.name}`;
			} else {
				return `${this.tag == "default" ? "" : this.tag + " "}${this.type} ${this.name}`;
			}
		}
		return `${this.isConstant ? "constant " : ""}${this.type}${this.isArray ? " array" : ""} ${this.name}`;
	}
}


class Local extends Declaration implements  Desc, Descript, Option {
	public option: { style: OriginStyle; } = {
		style: "vjass"
	};
	public readonly loc: Range = Range.default();

	public type: string;
	public name: string;
	public isArray: boolean = false;
	public text: string = "";
	public nameToken: Token | null = null;
	/**
	 * @deprecated
	 */
	public readonly initTokens: Token[] = [];
	public readonly lineComments: LineComment[] = [];

	public size: number = 0;

	constructor(type: string = "", name: string = "") {
		super();
		this.type = type;
		this.name = name;
	}

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `local ${this.type}${this.isArray ? " array" : ""} ${this.name}`;
		} else if (this.option.style == "zinc") {
			return `${this.type} ${this.name}${this.isArray ? "[]" : ""};`
		}
		return `local ${this.type}${this.isArray ? " array" : ""} ${this.name}`;
	}

}

class JassError implements Rangebel {
	public readonly message: string;
	public readonly loc: Range = Range.default();

	constructor(message: string) {
		this.message = message;
	}
}

class Member extends Declaration implements Desc, Descript, Option {
	public option: { style: OriginStyle; } = {
		style: "vjass"
	};
	public isConstant: boolean = false;
	public tag: "private" | "public" | "default" = "default";
	public isStatic: boolean = false;
	public isArray: boolean = false;
	// isArray 为 true 时有效
	public size: number = 0;
	public type: string;
	public name: string;
	public text: string = "";
	public loc: Range = Range.default();
	public readonly lineComments: LineComment[] = [];
	public nameToken: Token | null = null;
	public modifier: "default" | "static" | "stub" = "default";

	constructor(type: string = "", name: string = "") {
		super();
		this.type = type;
		this.name = name;
	}

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.tag}${this.isStatic ? " static" : ""}${this.isConstant ? " constant" : ""} ${this.type} ${this.name}${this.isArray ? "[" + (this.size > 0 ? this.size : "") + "]" : ""};`;
		} else if (this.option.style == "zinc") {
			return `${this.tag}${this.isStatic ? " static" : ""}${this.isConstant ? " constant" : ""} ${this.type} ${this.name}${this.isArray ? "[" + (this.size > 0 ? this.size : "") + "]" : ""};`;
		}
		return `${this.type}${this.isArray ? " array" : ""} ${this.name}`;
	}
}


class Interface extends Declaration implements  Descript, Option {
	public option: { style: OriginStyle; } = {
		style: "vjass"
	};
	public tag: "private" | "public" | "default" = "default";
	public name: string;
	public members: Member[] = [];
	public methods: Method[] = [];
	public operators: Method[] = [];
	public loc: Range = Range.default();
	public readonly lineComments: LineComment[] = [];

	constructor(name: string = "") {
		super();
		this.name = name;
	}

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.tag == "default" ? "" : this.tag + " "}interface ${this.name} endstruct`;
		} else if (this.option.style == "zinc") {
			return `${this.tag == "default" ? "" : this.tag + " "}interface ${this.name} {}`;
		}
		return `interface ${this.name}`;
	}
}

class Struct extends Interface {
	public text: string = "";
	// vjass只支持单继承
	public extends: string[] = [];

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.tag == "default" ? "" : this.tag + " "}struct ${this.name} endstruct`;
		} else if (this.option.style == "zinc") {
			return `${this.tag == "default" ? "" : this.tag + " "}struct ${this.name} {}`;
		}
		return `struct ${this.name}`;
	}
}

class Library extends Declaration implements  Descript, Option {
	public option: { style: OriginStyle; } = {
		style: "vjass"
	};
	public name: string;
	public initializer: string | null = null;
	public requires: string[] = [];
	public loc: Range = Range.default();
	public readonly structs: Struct[] = [];
	public readonly functions: Func[] = [];
	public readonly globals: Global[] = [];
	public readonly lineComments: LineComment[] = [];

	constructor(name: string = "") {
		super();
		this.name = name;
	}

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `library ${this.name}${this.requires.length > 0 ? " " + this.requires.join(", ") : ""} endlibrary`;
		} else if (this.option.style == "zinc") {
			return `library ${this.name} {}`;
		}
		return `library ${this.name}`;
	}


	public get needs(): string[] {
		return this.requires;
	}

	public findGlobalVariables() {
		return this.globals.filter((global) => !global.isConstant);
	}

	public findGlobalConstants() {
		return this.globals.filter((global) => !global.isConstant);
	}

}

type AstType = "Program" | "Global" | "Function" | "Library" | "Scope" | "Struct" | "Interface" | "Module" | "Type" | "Native"
	| "Take" | "Local" | "TextMacro" | "RunTextMacro" | "DefineMacro" | "ZincBlock" | "IDentifier";

class AstNode extends Range {
	protected readonly astType: AstType;

	constructor(type: AstType) {
		super();
		this.astType = type;
	}

	public getType(): AstType {
		return this.astType;
	}

}


/**
 * 行注释
 */
class LineComment implements Rangebel {
	protected text: string;
	public readonly loc: Range = Range.default();

	constructor(text: string = "") {
		this.text = text;
	}

	public getContent() {
		return this.text.replace(/^\s*\/\/(?:\/)?\s*/, "");
	}

	public setText(text: string) {
		this.text = text;
	}

	public getText(): string {
		return this.text;
	}

}

/**
 * 多行注释
 */
class BlockComment extends LineComment {

	constructor(text: string) {
		super(text);
	}

	public getContent() {
		return this.text.replace(/^\/\*|\*\/$/, "");
	}

}

class Identifier extends Node {
	public name: string;

	constructor(name: string = "") {
		super();
		this.name = name;
	}

}

class DefineMacro extends Declaration implements  Descript, Option  {

	public readonly keys: Identifier[] = [];
	public readonly takes: string[] = [];

	public readonly option: { style: OriginStyle; } = {
		style: "jass"
	};

	public get origin(): string {
		let keyString = "";
		if (this.keys.length == 1) {
			keyString = this.keys[0].name;
		} else if (this.keys.length > 1) {
			keyString = `<${this.keys.map(x => x.name).join(" ")}>`;
		}
		let takesString = "";
		if (this.takes.length > 0) {
			takesString = `(${takesString = this.takes.join(", ")})`;
		}
		return `#define ${keyString}${takesString}`;
	}
	
}


export {
	Take,
	Func,
	Method,
	Global,
	Local,
	Library,
	Struct,
	Member,
	Interface,
	ModifierType,

	JassError,
	Native,
	LineComment,
	BlockComment,
	DefineMacro,
	Identifier
};































/**
 * 表示一个脚本文件
 */
 class Document {
    public readonly uri: string;
    public readonly fileName: string;
    public readonly lineCount: number;
    private readonly lines: LineText[];
    lineAt(lineOrposition: number|Position): LineText {
        return lineOrposition instanceof Position ? this.lines[lineOrposition.line] : this.lines[lineOrposition];
    }
    offsetAt(position: Position): number {
        let count = 0;
        for (let index = 0; index < position.line - 1; index++) {
            const lineText = this.lines[index];
            count += lineText.length();
        }
        count += Math.min(position.position, this.lines[position.line].length());
        return count;
    }
    positionAt(offset: number): Position {
        const position = new Position();
        let count = 0;
        for (let index = 0; index < this.lines.length; index++) {
            const lineText = this.lines[index];
            if (count + lineText.length() > offset) {
                position.line = index;
                position.position = offset - count;
                return position;
            } else {
                count += lineText.length();
            }
        }
        return position;
    }
    getText(range?: Range): string {
        return this.lines
        .filter(lineText => (range ? (lineText.lineNumber() >= range.start.line && lineText.lineNumber() <= range.end.line) : true))
        .map(lineText => {
            if (lineText.lineNumber() === range?.start.line) {
                return lineText.getText().substring(range.start.position);
            } else if (lineText.lineNumber() === range?.start.line) {
                return lineText.getText().substring(0, range.end.position);
            } else {
                return lineText.getText();
            }
        })
        .join("");
    }
    /*
    getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined {
        throw new Error("Method not implemented.");
    }
    validateRange(range: Range): Range {
        throw new Error("Method not implemented.");
    }
    validatePosition(position: Position): Position {
        throw new Error("Method not implemented.");
    }*/

    public constructor(uri: string, content?:string) {
        this.uri = uri;
        if (!isUsableFile(this.uri)) {
            throw "create document fail!";
        }
        this.fileName = path.basename(this.uri);
        
        this.lines = lines(content ? content : getFileContent(this.uri));
        this.lineCount = this.lines.length;
    }
    
}



class Program extends Declaration {

	constructor() {
		super();
	}

	/**
	 * @deprecated 使用source字段代替
	 */
	public filePath: string = "";

	public readonly natives: Native[] = [];

	public readonly functions: Func[] = [];

	public readonly globals: Global[] = [];
	public readonly librarys: Library[] = [];
	public readonly structs: Struct[] = [];

	/**
	 * @deprecated
	 */
	public readonly errors: JassError[] = [];
	/**
	 * @deprecated
	 */
	public readonly body: Array<Declaration> = [];

	public findFunctions(options: {
		type?: string | string[] | null,
		position?: Position | null,
		name?: string | null
	} = {
			type: null,
			position: null
		}) {
		const funcs = [...this.functions, ...this.natives];
		if (options.position) {
			const requireStrings: string[] = [];
			const pushRequire = (...requires: string[]) => {
				requires.forEach((require) => {
					if (!requireStrings.includes(require)) {
						requireStrings.push(require);
					}
				});
			}
			this.librarys.forEach((library) => {
				if (library.loc.contains(options.position!)) {
					pushRequire(...library.requires);
					funcs.push(...library.functions);
				} else if (requireStrings.includes(library.name)) {
					funcs.push(...library.functions.filter((func) => {
						return func.tag != "private";
					}));
				}
			});
		}
		
		return funcs.filter((func) => {
			return options.type ? Array.isArray(options.type) ? options.type.includes(func.returns) : func.returns === options.type : true;
		});
	}

	public findFunctionByName(...name: string[]) {
		this.functions.filter((func) => name.includes(func.name));
	}

	public findLibraryByName(...name: string[]) {
		this.librarys.filter((library) => name.includes(library.name));
	}

	public findLibrarys(options: {
		position?: Position | null,
		name?: string | string[] | null,
		and?: boolean | null
	} = {
			position: null,
			name: null,
			and: true
		}) {
		return this.librarys.filter((library) => {
			const positionBool = (options.position ? library.loc.contains(options.position) : true);
			const nameBool = (options.name ? Array.isArray(options.name) ? options.name.includes(library.name) : options.name == library.name : true);
			return options.and === false ? positionBool || nameBool : positionBool && nameBool;
		});
	}

	public libraryFunctions() {
		return this.librarys.map((lib) => lib.functions).flat();
	}

	public libraryStructs() {
		return this.librarys.map((lib) => lib.structs).flat();
	}

	public allFunctions(containNative: boolean = true, containPrivate: boolean = false) {
		let funcs:Array<Native|Func> = [...this.functions, ...this.librarys.map((library) => library.functions).flat()];

		if (!containPrivate) {
			funcs = funcs.filter((func) => (<Func>func).tag != "private");
		}
		
		if (containNative) {
			funcs.push(...this.natives);
		}

		return funcs;
	}
	public allGlobals(containPrivate: boolean = false) {
		let globals = [...this.globals, ...this.librarys.map((library) => library.globals).flat(), ...this.allFunctions(false, containPrivate).map((func) => (<Func>func).globals).flat()];
		if (!containPrivate) {
			globals = globals.filter((global) => global.tag != "private");
		}
		return globals;
	}
	public allStructs(containPrivate: boolean = false) {
		let structs =  [...this.structs, ...this.librarys.map((library) => library.structs).flat()];
		if (!containPrivate) {
			structs = structs.filter((struct) => struct.tag != "private");
		}
		return structs;
	}
	public allLibrarys(containPrivate: boolean = false) {
		let librarys =  this.librarys;
		// if (containPrivate) {
		// 	librarys = librarys.filter((struct) => struct.tag != "private");
		// }
		return librarys;
	}

	public getPositionFunction(position: Position):Func|null {
		const func = this.allFunctions(false, true).find((func) => func.loc.contains(position));
		return func ? <Func>func : null;
	}

	public getPositionStruct(position: Position):Struct|null {
		const struct = this.allStructs(true).find((struct) => struct.loc.contains(position));
		return struct ? struct : null;
	}

	public allMethods(containPrivate: boolean = false) {
		let methods:Array<Method> = this.allStructs(containPrivate).map((struct) => struct.methods).flat();

		if (!containPrivate) {
			methods = methods.filter((func) => (<Func>func).tag != "private");
		}

		return methods;
	}

	public allMembers(containPrivate: boolean = false) {
		let members:Array<Member> = this.allStructs(containPrivate).map((struct) => struct.members).flat();

		if (!containPrivate) {
			members = members.filter((member) => (<Member>member).tag != "private");
		}

		return members;
	}

	public getPositionMethod(position: Position):Method|null {
		const method = this.allMethods(true).find((method) => method.loc.contains(position));
		return method ? method : null;
	}
}

export {
	AstNode, Declaration, Program, Document, LineText
};

