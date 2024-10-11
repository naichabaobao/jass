import { Document, Token, TokenType } from "./tokenizer-common";

export function find_token_error(document:Document) {
	const handle = (tokens:Token[]) => {
		tokens.forEach(token => {
			let temp:string;
			const text = () => {
				if (!temp) {
					temp = token.getText();
				}
				return temp;
			};
			if (token.type == TokenType.Unkown) {
				document.add_token_error(token, `lexical error,unkown token '${text().substring(0, 100)}'!`);
			} else if (!token.is_complete) {
				if (token.type == TokenType.String) {
					document.add_token_error(token, `string need package in "...",error string '${text().substring(0, 100)}'!`);
				} else if (token.type == TokenType.Mark) {
					document.add_token_error(token, `integer identifier mark format is 'A' or 'AAAA',error integer identifier mark '${text().substring(0, 100)}'!`);
				} else if (token.type == TokenType.Integer) {
					document.add_token_error(token, `error integer expression '${text().substring(0, 100)}'!`);
				} else {
					document.add_token_error(token, `error expression '${text().substring(0, 100)}'!`);
				}
			} else if (token.type == TokenType.Integer) {
				if (text().startsWith("0x") && text().length > 10) {
					document.add_token_error(token, `out of range '${text()}'!`);
				} else if (text().startsWith("$") && text().length > 9) {
					document.add_token_error(token, `out of range '${text()}'!`);
				}
			}
		});
	};
	document.loop((document, line) => {
        handle(document.lineTokens(line));
    }, (document, run_text_macro, macro, line) => {
        handle(macro.lineTokens(line, run_text_macro.param_values()));
    });
}
export function find_node_error(document:Document) {
	document.foreach((node) => {
		if (!node.end_line) {
			document.add_node_error(node, `end tag not found`);
		}
	});
}
