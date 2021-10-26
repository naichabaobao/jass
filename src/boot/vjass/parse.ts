import {Token, tokens} from "../jass/tokens";
import {
	Library,
	Func,
	Global,
	Struct,
	Member,
	Interface,
	Program,
	VjassError,
	ModifierType,
	Method
} from "./ast";
import { Position } from "../common";
import { Local, Take } from "../jass/ast";

// type AbstractLineType = "function" | "endfunction" | "globals" | "endglobals" | "library" | "endlibrary" | "struct" | "endstruct" | "scope" | "endscope" | "module" | "endmodule" |
// "type" | "interface" | "endinterface" | "local" | "set" | "call" | "return" | "if" | "endif" | "elseif" | "else" | "loop" | "endloop" | "exitwhen" | "method" | "endmethod" | "delegate" | "implement" | "textmacro" | "endtextmacro" | "runtextmacro" | "hook";  
// ;

// function eqTokenLine(token1: Token, token2:Token) {
// 	return token1 && token2 && token1.line == token2.line;
// }

// /**
//  * 
//  */
// class AbstractLine {
// 	public readonly tag: AbstractLineType;
// 	public readonly tokens:Token[] = [];

// 	constructor(tag: AbstractLineType) {
// 		this.tag = tag;
// 	}

// 	public static parse(ts:Token []):AbstractLine[] {
// 		const als:AbstractLine[] = [];

// 		let abstract:AbstractLine|null = null;

// 		let isOriginalState = true;
// 		for (let index = 0; index < ts.length; index++) {
// 			const token = ts[index];
// 			const nextToken = ts[index + 1];
			
// 			if (isOriginalState && token.isId()) {
// 				if (token.value == "function") {

// 				} else if (token.value == "endfunction") {

// 				} else if (token.value == "endfunction") {
// 				} else if (token.value == "globals") {
// 				} else if (token.value == "endglobals") {
// 				} else if (token.value == "library") {
// 				} else if (token.value == "endlibrary") {
// 				} else if (token.value == "struct") {
// 				} else if (token.value == "endstruct") {
// 				} else if (token.value == "scope") {
// 				} else if (token.value == "endscope") {
// 				} else if (token.value == "module") {
// 				} else if (token.value == "endmodule") {
// 				} else if (token.value == "type") {
// 				} else if (token.value == "interface") {
// 				} else if (token.value == "endinterface") {
// 				} else if (token.value == "local") {
// 				} else if (token.value == "set") {
// 				} else if (token.value == "call") {
// 				} else if (token.value == "return") {
// 				} else if (token.value == "if") {
// 				} else if (token.value == "endif") {
// 				} else if (token.value == "elseif") {
// 				} else if (token.value == "else") {
// 				} else if (token.value == "loop") {
// 				} else if (token.value == "endloop") {
// 				} else if (token.value == "exitwhen") {
// 				} else if (token.value == "") {
// 				} else if (token.value == "") {
// 				} else if (token.value == "") {
// 				} else if (token.value == "") {
// 				} else if (token.value == "") {
// 				} else if (token.value == "") {
// 				} else if (token.value == "") {
// 			}

// 			if (token.isNewLine()) {
// 				isOriginalState = true;
// 				abstract = null;
// 			}
// 		}

// 		return als;
// 	}
// }

/**
 * 
 * @param content 需要去除注釋和zinc塊
 */
function parse(content:string) {

	const comments:Token[] = [];
	const matchText = (line:number) => {
		const texts: string[] = [];
		for (let index = line; index > 0; index--) {
			let comment:Token|undefined = undefined;
			if ((comment = comments.find((token) => token.line == index - 1))) {
				const text = comment.value.replace("//", "");
				texts.push(text);
			} else {
				break;
			}
		}
		return texts.join("\n");
		// return comments.find((token) => token.line == line - 1)?.value.replace("//", "") ?? "";
	};
	let isInZinc = false;
	let isInLibrary = false;
	let isInStruct = false;
	let scopeFieldState = 0;
	let isInModule = false;
	let isInTextMacro = false;
	let isInInterface = false;
	const ts = tokens(content)
	// 去除块注释
	.filter((token) => !token.isBlockComment())
	// 去除zinc块
	.filter(token => {
		if (token.isComment() && /\/\/![ \t]+zinc\b/.test(token.value)) {
			isInZinc = true;
			return false;
		} else if (token.isComment() && /\/\/![ \t]+endzinc\b/.test(token.value)) {
			isInZinc = false;
			return false;
		} else {
			return !isInZinc;
		}
	})
	.filter((token) => {
		// 去除单行注释
		if (token.isComment()) {
			comments.push(token);
			return false;
		}
		return true;
	});


	const program = new Program();

	let library:Library|null = null;
	let libraryState = 0;
	let inLibrary = false;
	let inLibraryStart = false;
	const resetLibrary = () => {
		library = null;
		libraryState = 0;
		inLibrary = false;
		inLibraryStart = false;
	};

	let struct:Struct|null = null;
	let structState = 0;
	let inStruct = false;
	let inStructStart = false;
	const resetStruct = () => {
		struct = null;
		structState = 0;
		inStruct = false;
		inStructStart = false;
	};

	let func:Func|null = null;
	let funcState = 0;
	let inFunc = false;
	let inFuncStart = false;
	const resetFunc = () => {
		func = null;
		funcState = 0;
		inFunc = false;
		inFuncStart = false;
	};

	let local: Local | null = null;
	let inLocal = false;
	let localState = 0;
	const resetLocal = () => {
		inLocal = false;
		localState = 0;
		local = null;
	};

	let inGlobals = false;
	let global:Global|null= null;
	let globalState = 0;
	let isConstant = false;
	const resetGlobals = () => {
		inGlobals = false;
	};
	const resetGlobal = () => {
		globalState = 0;
		global = null;
	};

	let take: Take | null = null;
	let isSingleTake = false;

	let modifierType:ModifierType = "default";

	const reset = (type:"library") => {
		const resetLibrary = () => {
			library = null;
			libraryState = 0;
		};
		if (type == "library") {
			resetLibrary();
		}
	};

	for (let index = 0; index < ts.length; index++) {
		const token = ts[index];

		const parseGlobal = () => {
			if (token.isNewLine()) {
				if (global) {
					global.loc.end = new Position(token.line, token.end);
				}
			} else if (token.isId() && (token.value == "private" || token.value == "public")) {
				modifierType = token.value;
			} else if (token.isId() && token.value == "constant") {
				if (globalState == 0) {
					isConstant = true;
				}
			} else if (globalState == 0) {
				resetGlobal();
				if (token.isId()) {
					global = new Global(token.value, "");
					global.tag = modifierType;
					global.isConstant = isConstant;
					global.text = matchText(token.line);
					global.loc.start = new Position(token.line, token.position);
					globalState = 1;
				}
			} else if (globalState == 1) {
				if (token.isId() && token.value == "array") {
					if ((<Global>global).isArray) {

					} else {
						(<Global>global).isArray = true;
					}
				} else if (token.isId()) {
					if ((<Global>global).name == "") {
						(<Global>global).name = token.value;
						(<Global>global).nameToken = token;
						(<Library>library).globals.push((<Global>global));
					} else {
					}
				} else {

				}
			}

			if (isConstant && !(token.value == "constant")) {
				isConstant = false;
			}
			if (!(token.value == "private" || token.value == "public")) {
				modifierType = "default";
			}
		};
		const parseGlobals = () => {
			if (token.isId() && token.value == "endglobals") {
				inGlobals = false;
			} else {
				parseGlobal();
			}
		};
		const parseLocal = (expr:Method|Func) => {
			if (token.isNewLine()) {
				(<Local>local).loc.end = new Position(token.line, token.end);
				expr.locals.push((<Local>local));
			} else if (token.isOp() && token.value == "=") {

			} else if (localState == 0) {
				if (token.isId()) {
					(<Local>local).type = token.value;
					localState = 1;
				} else {

				}
			} else if (localState == 1) {
				if (token.isId() && token.value == "array") {
					if ((<Local>local).isArray) {

					} else {
						(<Local>local).isArray = true;
					}
				} else if (token.isId()) {
					if ((<Local>local).name == "") {
						(<Local>local).name = token.value;
						(<Local>local).nameToken = token;
					} else {
					}
				} else {

				}
			}
		};
		const parseFuncBody = () => {
			if (token.isId() && token.value == "endfunction") {
				(<Func>func).loc.end = new Position(token.line, token.position);
				resetFunc();
				return;
			} else if (token.isId() && token.value == "local") {
				resetLocal();
				local = new Local("", "");
				local.loc.start = new Position(token.line, token.position);
				local.text = matchText(token.line);
				inLocal = true;
			} else if (inLocal) {
				parseLocal((<Func>func));
			}
			(<Func>func).tokens.push(token);
		};
		const parseFunc = () => {
			if (inFuncStart) {
				parseFuncBody();
			} else if (token.isNewLine()) {
				(<Func>func).loc.end = new Position(token.line, token.position);
				inFuncStart = true;
			} else if (token.isId() && token.value == "takes") {
				funcState = 1;
			} else if (token.isId() && token.value == "returns") {
				funcState = 4;
			} else if (token.isId() && token.value == "defaults") {
				funcState = 5;
			} else if (funcState == 0) {
				if (token.isId()) {
					if ((<Func>func).name == "") {
						(<Func>func).name = token.value;
						(<Func>func).nameToken = token;
					} else {

					}
				} else {

				}
			} else if (funcState == 1) {
				if (token.isId()) {
					take = new Take(token.value, "");
					take.loc.start = new Position(token.line, token.position);
					funcState = 2;
				} else if (token.isOp() && token.value == ",") {

				} else {

				}
			} else if (funcState == 2) {
				if (token.isId()) {
					(<Take>take).name = token.value;
					(<Take>take).nameToken = token;
					(<Take>take).loc.end = new Position(token.line, token.end);
					(<Func>func).takes.push((<Take>take));
					funcState = 3;
				} else if (token.isOp() && token.value == ",") {
					funcState = 1;
				} else {

				}
			} else if (funcState == 3) {
				if (token.isOp() && token.value == ",") {
					funcState = 1;
				} else {

				}
			} else if (funcState == 4) {
				if (token.isId()) {
					if ((<Func>func).returns) {

					} else {
						if (token.value == "nothing") {

						} else {
							(<Func>func).returns = token.value;
						}
					}
				} else {

				}
			} else if (funcState == 5) {
				if (token.isId() || token.isInt() || token.isString() || token.isMark() || token.isReal()) {
					if ((<Func>func).defaults) {

					} else {
						(<Func>func).defaults = token.value;
					}
				} else {

				}
			}
		};
		const parseStruct = () => {

		};
		const parseLibraryBody = () => {
			if (token.isId() && token.value == "endlibrary") {
				(<Library>library).loc.end = new Position(token.line, token.position);
				resetLibrary();
			} else if (token.isId() && token.value == "struct") {
				resetStruct();
				if (inFunc) {
					resetFunc();
				}
				struct = new Struct("");
				struct.text = matchText(token.line);
				struct.loc.start = new Position(token.line, token.position);
				(<Library>library).structs.push(struct);
				inStruct = true;
			} else if (inFunc) {
				parseFunc();
			}  else if (token.isId() && token.value == "function") {
				resetFunc();
				if (inStruct) {
					resetStruct();
				}
				func = new Func("");
				func.tag = modifierType;
				func.text = matchText(token.line);
				func.loc.start = new Position(token.line, token.position);
				(<Library>library).functions.push(func);
				inFunc = true;
			} else if (inStruct) {
				
			} else if (token.isId() && token.value == "globals") {
				inGlobals = true;
			} else if (inGlobals) {
				parseGlobals();
			} else if (token.isId() && (token.value == "private" || token.value == "public")) {
				modifierType = token.value;
			}

			if (!(token.value == "private" || token.value == "public")) {
				modifierType = "default";
			}
		};
		const parseLibrary = () => {
			if (inLibraryStart) {
				parseLibraryBody();
			} else if (token.isNewLine()) {
				inLibraryStart = true;
			} else if (token.isId() && token.value == "initializer") {
				libraryState = 1;
			} else if (token.isId() && (token.value == "requires" || token.value == "needs" || token.value == "uses")) {
				libraryState = 2;
			} else if (libraryState == 0) {
				if (token.isId()) {
					if ((<Library>library).name == "") {
						(<Library>library).name = token.value;
					} else {

					}
				} else {

				}
			} else if (libraryState == 1) {
				if (token.isId()) {
					if ((<Library>library).initializer) {

					} else {
						(<Library>library).initializer = token.value;
					}
				}
			} else if (libraryState == 2) {
				if (token.isId()) {
					(<Library>library).requires.push(token.value);
					libraryState = 3;
				} else if (token.isOp() && token.value == ",") {

				} else {

				}
			} else if (libraryState == 3) {
				if (token.isOp() && token.value == ",") {
					libraryState = 2;
				} else {

				}
			}
		};

		if (token.isId() && token.value == "library") {
			resetLibrary();
			library = new Library("");
			library.loc.start = new Position(token.line, token.position);
			program.librarys.push(library);
			inLibrary = true;
		} else if (inLibrary) {
			parseLibrary();
		} else if (token.isId() && token.value == "scope") {

		} else if (token.isId() && token.value == "struct") {
		} else if (token.isId() && token.value == "interface") {

		} else if (token.isId() && token.value == "method") {
		} else if (token.isId() && token.value == "function") {

		} else if (token.isId() && token.value == "type") {
		} else if (token.isId() && token.value == "globals") {

		}

	}

	return program;
}

export {
	parse
};

if (false) {
	const program = parse(`
	library a initializer baobao a needs haha,  a555  ,asfas 
	// 介绍
	public function as takes nothing returns string defaults code
	local integer array aaaa
	set aaaa = 12
endfunction
	globals
		integer aaa
	endglobals
	`);
	// console.log(JSON.stringify(program, null , 4));
}