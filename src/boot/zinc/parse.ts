
import {
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
} from "./ast";
import {tokens, Token} from "./tokens";

import {ZincKeywords} from "../provider/keyword";
import {isType} from "../provider/types";

class ZincTokenError {
	public message:string;
	public token:Token;

	constructor(token:Token, message:string) {
		this.token = token;
		this.message = message;
	}
}

class Program {
	public librarys: Library[] = [];
	public zincTokenErrors:ZincTokenError[] = [];
}

function isKeyword (value:string) {
	return ZincKeywords.includes(value);
}

function parse(content:string) {
	console.time("tokens");
	const ts = tokens(content);
	console.timeEnd("tokens");

	let state = 0;

	const program = new Program();
	let library = null;
	for (let index = 0; index < 0; index++) {
		const token = ts[index];
		const pushError = (message:string) => {
			program.zincTokenErrors.push(new ZincTokenError(token, message));
		};
		// 命名和类型冲突
		const pushNamingConflictError = () => {
			program.zincTokenErrors.push(new ZincTokenError(token, `The type provided by Jass cannot be used!`));
		}
		// 关键字冲突
		const pushKeywordConflictError = () => {
			program.zincTokenErrors.push(new ZincTokenError(token, `Conflicts with the keyword ZINC!`));
		}
		// 期望字符
		const pushExpectedError = (tokenValue:string) => {
			pushError(`Expected '${tokenValue}', got token with value '${token.value}'!`);
		};
		// 非法token
		const pushErrorToken = () => {
			pushError(`Uncaught SyntaxError: Unexpected token '${token.value}'!`);
		}
		if (state == 0) {
			if (token.isId()) {
				if (token.value == "library") {
					state = 1;
					library = new Library("");
					library.loc.start = new Position(token.line, token.position);
				} else {
					// Expected Array, got String with value“”
					pushExpectedError("library");
				}
			} else {
				pushErrorToken();
			}
		} else if (state == 1) {
			if (token.isId()) {
				if (isKeyword(token.value)) {
					pushKeywordConflictError();
					if (token.value == "requires") {
						state = 3;
					}
				} else if (isType(token.value)) {
					pushNamingConflictError();
				} else {
					(<Library>library).name = token.value;
					state = 2;
				}
			} else {
				pushError("This token is not the correct library name!");
				state = 5;
			}
		} else if (state == 2) {
			if (token.isId() && token.value == "requires") {
				state = 3
			} else if (token.isOp() && token.value == "{") {
				state = 4;
			}else {
				pushExpectedError("requires or {");
				state = 5;
			}
		} else if (state == 3) {
			if (token.isId()) {
				if (isKeyword(token.value)) {
					pushKeywordConflictError();
				} else {
					(<Library>library).requires.push(token.value);
				}
				state = 6;
			} else {
				
			}
		} else if (state == 4) {

		} else if (state == 6) {
			if (token.isOp() && token.value == ",") {
				state = 3;
			} else if (token.isOp() && token.value == "{") {
				state = 4;
			} else {
				state = 5;
			}
		}

	}

	let inLibrary = false;
	let inLibraryStart = false;
	let libraryState = 0;

	let inGlobal = false;

	let inFunction = false;

	for (let index = 0; index < ts.length; index++) {
		const token = ts[index];
		
		const pushError = (message:string) => {
			program.zincTokenErrors.push(new ZincTokenError(token, message));
		};

		// 期望字符
		const pushExpectedError = (tokenValue:string) => {
			pushError(`Expected '${tokenValue}', got token with value '${token.value}'!`);
		};
		// 非法token
		const pushErrorToken = () => {
			pushError(`Uncaught SyntaxError: Unexpected token '${token.value}'!`);
		}

		if (inLibrary) {
			if (inLibraryStart) {
				if (inGlobal) {

				} else if (inFunction) {

				} else if (token.isId() && token.value == "function") {

				} else {
					pushErrorToken();
				}
			} else if (token.isOp() && token.value == "{") {
				inLibraryStart = true;
			} else if (libraryState == 0) {
				if (token.isId() && token.value == "requires") {
					libraryState = 2;
				} else if (token.isId()) {
					(<Library>library).name = token.value;
					libraryState = 1;
				} else {
					pushExpectedError("requires");
					libraryState = 4;
				}
			} else if (libraryState == 1) { // requires
				if (token.isId() && token.value == "requires") {
					libraryState = 2;
				} else {
					pushExpectedError("requires");
					libraryState = 4;
				}
			} else if (libraryState == 2) {
				if (token.isId()) {
					(<Library>library).requires.push(token.value);
					libraryState = 3;
				} else {
					pushErrorToken();
					libraryState = 2;
				}
			} else if (libraryState == 3) {
				if (token.isOp() && token.value == ",") {
					libraryState = 2;
				} else {
					pushErrorToken();
					libraryState = 3;
				}
			} else if (libraryState == 4) {
				pushErrorToken();
			}
		} else {
			if (token.isId() && token.value == "library") {
				inLibrary = true;
				libraryState = 0;
				library = new Library("");
				program.librarys.push(library);
			} else {
				pushExpectedError("library");
			}
		}

	}

	return program;

}

console.log(parse(`library aaaf a requires  ddd + , + asd, {}`));
