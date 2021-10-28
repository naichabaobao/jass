import { Range, Rangebel, Desc } from "../common";
import { isSpace } from "../tool";
import { Token } from "./tokens";


class Node extends Range{}


class Take implements Rangebel {

	public type: string;
	public nameToken:Token|null = null;
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

class Native implements Rangebel, Desc{
	public readonly loc: Range = Range.default();
	public nameToken:Token|null = null;
	public name: string;
	public readonly takes: Take[];
	public returns: string | null;
	public text:string = "";


	constructor(name: string, takes: Take[] = [], returns: string | null = null) {
		this.name = name;
		this.takes = takes;
		this.returns = returns;
	}

	public get origin() : string {
		return `native ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}`;
	}
}

class Func extends Native implements Rangebel{
	public readonly loc: Range = Range.default();

	public readonly locals: Local[] = [];
	public readonly tokens:Token[] = [];

	public get origin() : string {
		return `function ${this.name} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}`;
	}

}

class Global implements Rangebel,Desc{
	public readonly loc: Range = Range.default();

	public isConstant: boolean = false;
	public isArray:boolean = false;
	public type: string;
	public nameToken:Token|null = null;
	public name: string;
	public text:string = "";

	constructor(type: string, name: string) {
		this.type = type;
		this.name = name;
	}

	public get origin() : string {
		return `${this.isConstant ? "constant " : ""}${this.type}${this.isArray ? " array" : ""} ${this.name}`
	}
}


class Local implements Rangebel,Desc {
	public readonly loc: Range = Range.default();

	public type: string;
	public name: string;
	public isArray:boolean = false;
	public text:string = "";
	public nameToken:Token|null = null;
	/**
	 * @deprecated
	 */
	public readonly initTokens:Token[] = [];

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

class Program extends Node{

	public filePath: string = "";

	public readonly natives:Native[] = [];
	public readonly functions:Func[] = [];
	public readonly globals:Global[] = [];
	public readonly errors:JassError[] = [];

}

/**
 * 行注释
 */
class LineComment implements Rangebel {
	public readonly loc: Range = Range.default();
	public readonly text:string;

	constructor(text: string) {
		this.text = text;
	}

	public getContent() {
		return this.text.replace(/^\/\/(?:\/)?/, "");
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
	Global,
	Local,
	Program,
	JassError,
	Native,
	LineComment,
	BlockComment
};


type AstType = "Program" | "Global" | "Function" | "Library" | "Scope" | "Struct" | "Interface" | "Module" | "Type" | "Native"
| "Take" | "Local" | "TextMacro" | "RunTextMacro" | "DefineMacro"; 

class AstNode extends Range {
	protected readonly astType: AstType;

	constructor(type: AstType) {
		super();
		this.astType = type;
	}

	public getType() :AstType {
		return this.astType;
	}

}

class Declaration extends AstNode{
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

	public type: string|null = null;
	public name: string|null = null;

	constructor() {
		super("Take");
	}

	public getTakeType() {
		return this.type;
	}
}

class NativeDeclaration extends Declaration {

	public name: string|null = null;
	public takes: TakeDeclaration[] | null = null;
	public returns: string| null = null;

	constructor() {
		super("Native");
	}
}

class LocalStatement extends Statement{

	public type: string | null = null;
	public name: string | null = null;
	public array: boolean = false;
	public init: Expression | null = null;

	constructor() {
		super("Local");
	}

}

class FunctionDeclaration extends AstNode implements NativeDeclaration{

	public name: string|null = null;
	public takes: TakeDeclaration[] | null = null;
	public returns: string| null = null;
	public body: Statement[] = [];

	constructor() {
		super("Function");
	}
	
}

class LineText extends Range{

    public readonly text:string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    // 是否空行
    public isEmpty():boolean {
        return this.text.trimStart() === "";
    }

    public getText():string {
        return this.text;
    }

    public lineNumber() :number {
        return this.start.line;
    }

    // 第一个字符下标
    public firstCharacterIndex() :number {
        let index = 0;
        for (; index < this.text.length; index++) {
            const char = this.text[index];
            if (!isSpace(char)) {
                return index;
            }
        }
        return index;
    }

}

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
	public value: string|null = null;

	constructor(name: string, value: string|null = null) {
		super("DefineMacro");
		this.name = name;
		this.value = value;
	}
}

class JassCompileError extends Range{
	public readonly message: string;

	constructor(message: string) {
		super();
		this.message = message;
	}

}

export {AstNode, Declaration, TextMacro, RunTextMacro, LineText, DefineMacro, TextMacroLineText, JassCompileError, MultiLineText};
