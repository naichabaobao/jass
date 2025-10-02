import {Token, tokens} from "./tokens";
import {
	Library,
	Func,
	Global,
	Struct,
	Member,
	Interface
} from "./ast";
import { Position } from "../common";

class VjassTokenError {
	public message:string;
	public token:Token;

	constructor(token:Token, message:string) {
		this.token = token;
		this.message = message;
	}
}

class Program {
	public readonly functions:Func[] = [];
	public readonly globals:Global[] = [];
	public readonly structs:Struct[] = [];
	public readonly interfaces:Interface[] = [];

	public readonly librarys: Library[] = [];
	public readonly zincTokenErrors:VjassTokenError[] = [];
}

/**
 * 
 * @param content 需要去除注釋和zinc塊
 */
function parse(content:string) {

	const ts = tokens(content);

	const program = new Program();

	let library:Library|null = null;
	let libraryState = 0;
	let inLibrary = false;

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
		
		const parseLibrary = () => {
			if (libraryState == 0) {
				if (token.isId() && token.value == "initializer") {

				} else if (token.isId() && (token.value == "requires" || token.value == "needs" || token.value == "uses")) {

				} else if (token.isId()) {
					(<Library>library).name = token.value;
					libraryState = 1;
				}
			} else if (libraryState == 1) {
				if (token.isId() && token.value == "initializer") {
					libraryState = 2;
				} else if (token.isId() && (token.value == "requires" || token.value == "needs" || token.value == "uses")) {
					libraryState = 3;
				}
			} else if (libraryState == 2) {
				if (token.isId()) {
					(<Library>library).initializer = token.value;
				}
			}
		};

		if (token.isId() && token.value == "library") {
			reset("library");
			library = new Library("");
			library.loc.start = new Position(token.line, token.position);
			inLibrary = true;
			
		} else if (token.isId() && token.value == "scope") {

		} else if (token.isId() && token.value == "struct") {
		} else if (token.isId() && token.value == "interface") {

		} else if (token.isId() && token.value == "method") {
		} else if (token.isId() && token.value == "function") {

		} else if (token.isId() && token.value == "type") {
		} else if (token.isId() && token.value == "globals") {

		} else if (inLibrary) {
			parseLibrary();
		}

	}

	return program;
}

export {
	parse
};