import { Range, Rangebel, Desc, Position } from "../common";
import { isSpace } from "../tool";
import { Token } from "./tokens";


class Node extends Range { }

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

class Take implements Rangebel {

	public type: string;
	public nameToken: Token | null = null;
	public name: string;
	public loc: Range = Range.default();

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}

	public get origin(): string {
		return `${this.type} ${this.name}`;
	}
}

class Native implements Rangebel, Desc, Descript {
	public readonly loc: Range = Range.default();
	public nameToken: Token | null = null;
	public name: string;
	public readonly takes: Take[];
	public returns: string | null;
	public text: string = "";
	private constant = false;
	public readonly lineComments: LineComment[] = [];

	constructor(name: string = "", takes: Take[] = [], returns: string | null = null) {
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
	private readonly globals: Global[] = [];

	public get origin(): string {
		if (this.option.style == "vjass") {
			const defaultString = this.defaults !== null ? (' defaults ' + this.defaults) : "";
			return `${this.tag} function ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}${defaultString}`;
		} else if (this.option.style == "zinc") {
			return `${this.tag} function ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
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

	public isOperator:boolean = false;

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.tag}${this.modifier == "default" ? "" : " " + this.modifier} method ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
		} else if (this.option.style == "zinc") {
			return `${this.tag}${this.modifier == "default" ? "" : " " + this.modifier} method ${this.isOperator ? "operator " : ""}${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
		}
		return `${this.tag}${this.modifier == "default" ? "" : " " + this.modifier} method ${this.name} (${this.takes.map(take => take.origin).join(", ")}) -> ${this.returns ? this.returns : "nothing"} {}`;
	}

}

class Global implements Rangebel, Desc, Descript , Option{
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

	public size:number = 0;

	constructor(type: string = "", name: string = "") {
		this.type = type;
		this.name = name;
	}

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.isConstant ? "constant " : ""}${this.type}${this.isArray ? " array" : ""} ${this.name}`;
		} else if (this.option.style == "zinc") {
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
		return `${this.isConstant ? "constant " : ""}${this.type}${this.isArray ? " array" : ""} ${this.name}`;
	}
}


class Local implements Rangebel, Desc, Descript, Option {
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

	public size:number = 0;

	constructor(type: string = "", name: string = "") {
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

class Member implements Rangebel, Desc, Descript ,Option{
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


class Interface implements Rangebel, Descript, Option {
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
		this.name = name;
	}

	public get origin(): string {
		if (this.option.style == "vjass") {
			return `${this.tag} interface ${this.name} endstruct`;
		} else if (this.option.style == "zinc") {
			return `${this.tag} interface ${this.name} {}`;
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
			return `${this.tag} struct ${this.name} endstruct`;
		} else if (this.option.style == "zinc") {
			return `${this.tag} struct ${this.name} {}`;
		}
		return `struct ${this.name}`;
	}
}

class Library implements Rangebel, Descript, Option {
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


}

type AstType = "Program" | "Global" | "Function" | "Library" | "Scope" | "Struct" | "Interface" | "Module" | "Type" | "Native"
	| "Take" | "Local" | "TextMacro" | "RunTextMacro" | "DefineMacro" | "ZincBlock";

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
		return this.text.replace(/^\/\/(?:\/)?/, "");
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
	BlockComment
};









































class Declaration extends AstNode {

	public parent: Declaration | null = null;

	protected constructor(type: AstType) {
		super(type);
	}
}

class Statement extends AstNode {
	protected constructor(type: AstType) {
		super(type);
	}
}

class Expression extends AstNode {
	protected constructor(type: AstType) {
		super(type);
	}
}

class TypeDeclaration extends Declaration {
	constructor() {
		super("Type");
	}
}

class TakeDeclaration extends AstNode {

	public type: string | null = null;
	public name: string | null = null;

	constructor() {
		super("Take");
	}

	public getTakeType() {
		return this.type;
	}
}

class NativeDeclaration extends Declaration {

	public name: string | null = null;
	public takes: TakeDeclaration[] | null = null;
	public returns: string | null = null;

	constructor() {
		super("Native");
	}
}

class LocalStatement extends Statement {

	public type: string | null = null;
	public name: string | null = null;
	public array: boolean = false;
	public init: Expression | null = null;

	constructor() {
		super("Local");
	}

}

class FunctionDeclaration extends Declaration implements NativeDeclaration {

	public name: string | null = null;
	public takes: TakeDeclaration[] | null = null;
	public returns: string | null = null;
	public body: Statement[] = [];

	constructor() {
		super("Function");
	}

}

/**
 * @deprecated 正常版本不会使用到，测试用
 */
class LineText extends Range {

	public readonly text: string;

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

}
/**
 * @deprecated 正常版本不会使用到，测试用
 */
class MultiLineText extends Range {

	public readonly lineTexts: LineText[];

	constructor(lineTexts: LineText[] = []) {
		super();
		this.lineTexts = lineTexts;
	}

}

class TextMacroLineText extends Range {

	public readonly raw: string;
	public readonly text: string;

	constructor(raw: string, text: string) {
		super();
		this.raw = raw;
		this.text = text;
	}
}

class TextMacro extends AstNode {

	public name: string;
	public takes: string[] = [];
	public body: LineText[] = [];

	constructor(name: string, takes?: string[]) {
		super("TextMacro");
		this.name = name;
		if (takes) {
			this.takes = takes;
		}
	}
}

class RunTextMacro extends AstNode {
	public name: string;
	public takes: string[] = [];

	constructor(name: string, takes?: string[]) {
		super("RunTextMacro");
		this.name = name;
		if (takes) {
			this.takes = takes;
		}
	}
}

class DefineMacro extends AstNode {
	public name: string;
	public value: string | null = null;

	constructor(name: string, value: string | null = null) {
		super("DefineMacro");
		this.name = name;
		this.value = value;
	}
}

class JassCompileError extends Range {
	public readonly message: string;

	constructor(message: string) {
		super();
		this.message = message;
	}

}

class ZincBlock extends AstNode {

	public readonly body: LineText[] = [];

	constructor() {
		super("ZincBlock")
	}
}

class LibraryDeclaration extends Declaration {

	public readonly body: Declaration[] = [];

	constructor() {
		super("Library");
	}
}

class ModuleDeclaration extends Declaration {

	public readonly body: Declaration[] = [];

	constructor() {
		super("Module");
	}
}

class StructDeclaration extends Declaration {

	public readonly body: Declaration[] = [];

	constructor() {
		super("Struct");
	}
}

/**
 * @deprecated
 */
class ScopeDeclaration extends Declaration {


	public readonly body: Declaration[] = [];

	constructor(parent: Declaration | null = null) {
		super("Scope");
		this.parent = parent;
	}
}

class Program
	// <T extends Declaration>
	extends AstNode {

	constructor(option: {
		style: OriginStyle
	} = {
		style: "vjass"
	}) {
		super("Program");
	}

	/**
	 * @deprecated
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

	public getFunctions(options: {
		type?: string | string[] | null,
		notType?: string | string[] | null,
		position?: Position| null,
	} = {
		type: null,
		position: null,
		notType: null
	}) {
		return [...this.functions, ...this.natives]
		.filter((func) => {
			let bool = (options.type ? Array.isArray(options.type) ? options.type.length == 0 ? func.returns === null : func.returns && options.type.includes(func.returns) : func.returns && func.returns == options.type : true)
			&&
			(options.notType ? Array.isArray(options.notType) ? options.notType.length == 0 ? func.returns !== null : func.returns === null || !options.notType.includes(func.returns) : func.returns && options.notType !== func.returns : true)
			&&
			(options.position ? func.loc.contains(options.position) : true);
			return bool;
		});
	}

}

export {
	AstNode, Declaration, TextMacro, RunTextMacro, LineText, DefineMacro, TextMacroLineText, JassCompileError, MultiLineText, ZincBlock,
	Program, LibraryDeclaration, ScopeDeclaration, ModuleDeclaration, StructDeclaration

};
