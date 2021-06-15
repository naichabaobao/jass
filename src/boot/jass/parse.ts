import { Position } from "../common";
import {Func, Global, JassError, Program, Native, Take} from "./ast";
import {Token, tokens} from "./tokens";



/**
 * 仅解析jass原生语法
 * @param content 
 */
function parse(content: string): Program {
	const program = new Program();

	const ts = tokens(content).filter(token => !token.isBlockComment()); // 去除所有块级注释

	program.errors.push(...ts.filter(token => token.isError()).map((token) => {
		const err = new JassError(`Unexpected token '${token.value}'`);
		err.loc.start = new Position(token.line, token.position);
		err.loc.end = new Position(token.line, token.end);
		return err;
	}));


	let state = 0;
	let expr:Func|Global|Native|null = null;

	let inFunc = false;
	let inFuncStart = false;
	let funcState = 0;

	let takeState = 0;
	let take:Take|null = null;

	for (let index = 0; index < ts.length; index++) {
		const token = ts[index];

		const pushError = (message:string) => {
			const err = new JassError(message);
			err.loc.start = new Position(token.line, token.position);
			err.loc.end = new Position(token.line, token.end);
			program.errors.push(err);
		};
		const parseTakes = () => {
			if (takeState == 0) {
				if (token.isId()) {
					take = new Take(token.value, "");
					(<Func|Native>expr).takes.push(take);
					takeState = 1;
				} else {
					pushError("Parameter type error");
				}
			} else if (takeState == 1) {
				if (token.isId()) {
					(<Take>take).name = token.value;
					takeState = 2;
				} else {
					pushError("Identifier error");
				}
			} else if (takeState == 2) {
				if (token.isOp() && token.value == ",") {
					takeState = 0;
				} else {
					pushError("The takes divider is ','");
				}
			}
		}

		if (token.isId() && token.value == "function") {
			inFunc = true;
			expr = new Func("");
			program.functions.push((<Func>expr));
			funcState = 1;
		} else if (inFunc) {
			if (inFuncStart == false && token.isNewLine()) {
				inFuncStart = true;
			} else if (inFuncStart) {

			} else if (token.isId() &&  token.value == "returns") {

			} else if (token.isId() &&  token.value == "takes") {
				funcState = 3;
			} else if (funcState == 1) {
				if (token.isId()) {
					(<Func>expr).name = token.value;
					funcState = 2;
				} else {
					pushError("Function unnamed");
				}
			} else if (funcState == 2) {
				if (token.isId() && token.value == "takes") {
					funcState = 3;
				} else {
					pushError("The expected value is takes");
					funcState = 6;
				}
			} else if (funcState == 3) {
				if (token.isId() && token.value == "nothing") {
					funcState = 6;
				} else if (token.isId() && token.value == "returns") {
					pushError("Incomplete takes");
				} else if (token.isId()) {
					take = new Take(token.value, "");
					(<Func>expr).takes.push(take);
					funcState = 4;
				}
			} else if (funcState == 4) {
				if (token.isId() && token.value == "returns") {
					pushError("Missing parameter naming");
				} else if (token.isId()) {
					(<Take>take).name = token.value;
					funcState = 5;
				} else {
					pushError("lost");
					funcState = 8;
				}
			} else if (funcState == 5) {
				if (token.isId() && token.value == "returns") {
					funcState = 7;
				} else if (token.isOp() && token.value == ",") {
					funcState = 3;
				} else {
					pushError("lost");
					funcState = 8;
				}
			} else if (funcState == 6) {
				if (token.isId() && token.value == "returns") {
					funcState = 7;
				} else {
					pushError("lost");
					funcState = 8;
				}
			} else if (funcState == 7) {
				if (token.isId() && token.value == "nothing") {
				} else if (token.isId()) {
					(<Func>expr).returns = token.value;
				} else {
					pushError("Return type error");
				}
				funcState = 8;
			} else if (funcState == 8) {
				// 结束,等待换行符
				pushError("unnecessary");
			}
		}
	}

	return program;
}

export {
	parse
};