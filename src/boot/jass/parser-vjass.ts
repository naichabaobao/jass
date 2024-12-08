import * as path from "path";
import * as fs from "fs";
import { preprocessing } from "./preproces";
import { Document, TextLine, Token, TokenType } from "./tokenizer-common";
import { tokenize_for_vjass } from "./tokenizer-vjass";
import { RunTextMacro, TextMacro, parse_import, parse_runtextmacro, parse_textmacro } from "./textmacro";
import { find_node_error, find_token_error } from "./token-error";

export class Context {
    private keys: string[] = [];
    private documents: Document[] = [];
    private handle_key(key: string): string {
        // const handle_key = key.replace(/\\+/g, "/");
        const parsed = path.parse(key);
        return path.resolve(parsed.dir, parsed.base);
    }
    public set(key: string, value: Document) {
        const handle_key = this.handle_key(key);
        const index = this.keys.indexOf(handle_key);
        if (index == -1) {
            this.keys.push(handle_key);
            this.documents.push(value);
        } else {
            this.documents[index] = value;
        }
    }
    private indexOf(key: string): number {
        return this.keys.indexOf(this.handle_key(key));
    }
    public has(key: string): boolean {
        return this.indexOf(key) != -1;
    }

    public get(key: string): Document | undefined {
        if (this.has(key)) {
            const index = this.indexOf(key);
            return this.documents[index];
        }
        return;
    }
    public delete(key: string) {
        const index = this.indexOf(key);
        if (index != -1) {
            this.keys.splice(index, 1);
            this.documents.splice(index, 1);
        }
    }

    public getAllTextMacros() {
        return this.documents.map(document => document.text_macros).flat();
    }
}

export const Global = new Context();

//#region 解析

export class Library {
    public is_library_once: boolean = false;
    public name: Token | null = null;
    public initializer: Token | null = null;
    public requires: string[] = [];
    public is_optional: boolean = false;
}
function parse_library(document: Document, line_text: ExpendLineText) {
    const library = new Library();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "library") {
                library.is_library_once = false;
                state = 1;
            } else if (text == "library_once") {
                library.is_library_once = true;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                library.name = token;
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "initializer") {
                state = 3;
            } else if (text == "requires" || text == "uses" || text == "needs") {
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (token.is_identifier) {
                library.initializer = token;
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (text == "requires" || text == "uses" || text == "needs") {
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == "optional") {
                library.is_optional = true;
                state = 6;
            } else if (token.is_identifier) {
                library.requires.push(text);
                state = 7;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 6) {
            if (token.is_identifier) {
                library.requires.push(text);
                state = 7;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 7) {
            if (text == ",") {
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 8) {
            if (token.is_identifier) {
                library.requires.push(text);
                state = 7;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return library;

    // let index = 0;
    // let token = tokens[index];
    // let text = token.getText();
    // const next = () => {
    //     index++;
    //     token = tokens[index];
    //     if (token.type == TokenType.BlockComment) {
    //         next();
    //     }
    //     if (token) {
    //         text = token.getText();
    //         return true
    //     }
    //     return false;
    // }

    // if (text == "library") {
    //     library.is_library_once = false;
    // } else if (text == "library_once") {
    //     library.is_library_once = true;
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (token.type == TokenType.Identifier) {
    //     library.name = text;
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // //@ts-expect-error
    // if (text == "initializer") {
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (token.type == TokenType.Identifier) {
    //     library.initializer = text;
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (text == "requires" || text == "uses" || text == "needs") {
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (text == "optional") {
    //     library.is_optional = true;

    //     if (next() == false) return library;
    // }

    // if (token.type == TokenType.Identifier) {
    //     library.requires.push(text);
    // } else {
    //     return library;
    // }
    // // if (next() == false) return library;


    // let state = 0;
    // for (let i = index + 1; i < tokens.length; i++) {
    //     const token = tokens[i];
    //     if (!token) {
    //         return library;
    //     }
    //     if (token.type == TokenType.BlockComment) {
    //         continue;
    //     }
    //     const text = token.getText();
    //     if (state == 0) {
    //         if (text == ",") {
    //             state = 1;
    //         } else {
    //             break;
    //         }
    //     } else if (state == 1) {
    //         if (token.type == TokenType.Identifier) {
    //             library.requires.push(text);
    //             state = 0;
    //         } else {
    //             break;
    //         }
    //     }
    // }

    return library;
}

export class Scope {
    public name: Token | null = null;
}
function parse_scope(document: Document, line_text: ExpendLineText) {
    const scope = new Scope();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "scope") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                scope.name = token;
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return scope;
}

export class Interface {
    public visible:"public"|"private"|null = null;
    public name: Token | null = null;
    public extends: string[]|null = null;
}
function parse_interface(document: Document, line_text: ExpendLineText) {
    const inter = new Interface();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "interface") {
                state = 1;
            } else if (text == "private") {
                inter.visible = "private";
                state = 2;
            } else if (text == "public") {
                inter.visible = "public";
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                inter.name = token;
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "interface") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "extends") {
                state = 4;
                if (!inter.extends) {
                    inter.extends = [];
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (token.is_identifier) {
                inter.extends!.push(text);
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == ",") {
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return inter;
}

export class Struct extends Interface {   
}
function parse_struct(document: Document, line_text: ExpendLineText) {
    const struct = new Struct();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "struct") {
                state = 1;
            } else if (text == "private") {
                struct.visible = "private";
                state = 2;
            } else if (text == "public") {
                struct.visible = "public";
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                struct.name = token;
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "struct") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "extends") {
                state = 4;
                if (!struct.extends) {
                    struct.extends = [];
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (token.is_identifier) {
                struct.extends!.push(text);
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == ",") {
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return struct;
}


export class Take {
    public type: string|null = null;
    public name: string|null = null;
}
export class Method {
    public visible:"public"|"private"|null = null;
    public modifier:"static"|"stub"|null = null;
    public qualifier:"constant"|null = null;
    public name: Token | null = null;
    public takes: Take[]|null = null;
    public returns: string|null = null;
    public defaults: string|null = null;

    public to_string():string {
        const visible_string = this.visible ? this.visible + " " : "";
        const modifier_string = this.modifier ? this.modifier + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier + " " : "";
        const name_string = this.name ? this.name + " " : "";
        const takes_string = this.takes ? (this.takes.length == 0 ? this.takes.map(take => `${take.type ? take.type : ""} ${take.name ? take.name : ""}`).join(",") : "nothing") : "nothing ";
        return `${visible_string}${modifier_string}${qualifier_string}method ${name_string}takes ${takes_string} returns${name_string}`;
    }
}
function parse_method(document: Document, line_text: ExpendLineText) {
    const method = new Method();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "method") {
                state = 1;
            } else if (text == "private") {
                method.visible = "private";
                state = 2;
            } else if (text == "public") {
                method.visible = "public";
                state = 2;
            } else if (text == "static") {
                method.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                method.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                method.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                method.name = token;
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "method") {
                state = 1;
            } else if (text == "static") {
                method.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                method.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                method.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "method") {
                state = 1;
            } else if (text == "constant") {
                method.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (text == "method") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == "takes") {
                state = 6;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 6) {
            if (text == "nothing") {
                method.takes = null;
                state = 11;
            } else if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!method.takes) {
                    method.takes = [];
                }
                method.takes.push(take);
                state = 7;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 7) {
            if (token.is_identifier) {
                const takes = method.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 8) {
            if (text == "returns") {
                state = 12;
            } else if (text == ",") {
                state = 9;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 9) {
            if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!method.takes) {
                    method.takes = [];
                }
                method.takes.push(take);
                state = 10;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 10) {
            if (token.is_identifier) {
                const takes = method.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 11) {
            if (text == "returns") {
                state = 12;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 12) {
            if (token.is_identifier) {
                method.returns = text;
                state = 13;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 13) {
            if (text == "defaults") {
                state = 14;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 14) {
            if (token.is_identifier) {
                method.defaults = text;
                state = 15;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return method;
}

export class Func extends Method {
}

function parse_function(document: Document, line_text: ExpendLineText) {
    const func = new Func();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "function") {
                state = 1;
            } else if (text == "private") {
                func.visible = "private";
                state = 2;
            } else if (text == "public") {
                func.visible = "public";
                state = 2;
            } else if (text == "static") {
                func.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                func.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                func.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                func.name = token;
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "function") {
                state = 1;
            } else if (text == "static") {
                func.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                func.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                func.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "function") {
                state = 1;
            } else if (text == "constant") {
                func.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (text == "function") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == "takes") {
                state = 6;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 6) {
            if (text == "nothing") {
                func.takes = null;
                state = 11;
            } else if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!func.takes) {
                    func.takes = [];
                }
                func.takes.push(take);
                state = 7;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 7) {
            if (token.is_identifier) {
                const takes = func.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 8) {
            if (text == "returns") {
                state = 12;
            } else if (text == ",") {
                state = 9;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 9) {
            if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!func.takes) {
                    func.takes = [];
                }
                func.takes.push(take);
                state = 10;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 10) {
            if (token.is_identifier) {
                const takes = func.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 11) {
            if (text == "returns") {
                state = 12;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 12) {
            if (token.is_identifier) {
                func.returns = text;
                state = 13;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 13) {
            if (text == "defaults") {
                state = 14;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 14) {
            if (token.is_identifier) {
                func.defaults = text;
                state = 15;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return func;
}
export class Globals {
}

function parse_globals(document: Document, line_text: ExpendLineText) {
    const globals = new Globals();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "globals") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return globals;
}

export class If {
    expr: Zoom|null = null;
}
export class Loop {}

function parse_if(document: Document, line_text: ExpendLineText) {
    const ifs = new If();

    const tokens = line_text.tokens();
    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index];
        
        if (state == 0) {
            index++;
            if (text == "if") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ifs.expr = result.expr;
            index = result.index;

            state = 2;
        } else if (state == 2) {
            index++;
            
            if (text == "then") {
                state = 3;
            }
            else {
                document.add_token_error(tokens[0], `'if' statement needs to end with the keyword 'then'`);
            }
        } else if (state == 3) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
        
    }

    if (state != 3) {
        document.add_token_error(tokens[0], `'if' statement needs to end with the keyword 'then'`);
    }

    return ifs;
}
function parse_loop(document: Document, line_text: ExpendLineText) {
    const loop = new Loop();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "loop") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return loop;
}

export class Comment {
    comment:Token|null = null;
}

export function parse_line_comment(document: Document, line_text: ExpendLineText) {
    const comment = new Comment();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (token.is_comment) {
                comment.comment = token;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return comment;
}

export class Empty {
}
export function parse_line_empty(document: Document, line_text: ExpendLineText) {
    return new Empty();
}

export class GlobalVariable {
    public visible:"public"|"private"|null = null;
    public modifier:"static"|"stub"|null = null;
    public qualifier:"constant"|null = null;

    type: Token|null = null;
    name: Token|null = null;

    expr: Zoom|null = null;

    public is_array:boolean = false;

    public to_string():string {
        const visible_string = this.visible ? this.visible + " " : "";
        const modifier_string = this.modifier ? this.modifier + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier + " " : "";
        const type_string = this.type ? this.type.getText() + " " : "";
        const array_string = this.is_array ? "array " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        return `${visible_string}${modifier_string}${qualifier_string}${type_string}${array_string}${name_string}`;
    }
}

export class Member extends GlobalVariable {
}
export class Local extends GlobalVariable {
}
type Zoom = BinaryExpr|UnaryExpr|Value|VariableName|PriorityExpr|FunctionExpr;

export interface ExprTrict {
    to_string():string;
}

export class Expr {
    public convert_to_binary_expr(F: UnaryExpr) {
        const expr = new BinaryExpr();
        expr.left = <any>this;
        expr.right = F.value;
        expr.op = F.op;
        return expr;
    }


}
export class Value implements ExprTrict {

    public value:Token|null = null;
    public convert_to_binary_expr(F: UnaryExpr) {
        const expr = new BinaryExpr();
        expr.left = this;
        expr.right = F.value;
        expr.op = F.op;
        return expr;
    }

    to_string(): string {
        let expr = "unkown";
        if (this.value) {
            expr = this.value.getText();
        }
        return expr;
    }
}

export class BinaryExpr extends Expr implements ExprTrict {
    left: Zoom|null = null;
    right: Zoom|null = null;
    op: Token|null = null;
    
    to_string(): string {
        let expr = "unkown";
        if (this.left) {
            expr = this.left.to_string();
        }
        if (this.op) {
            expr += ` ${this.op.getText()} `;
        }
        if (this.right) {
            expr = this.right.to_string();
        }
        return `${this.left?.to_string() ?? "unkown"} ${this.op?.getText() ?? "unkown"} ${this.right?.to_string() ?? "unkown"}`;
    }
}
export class UnaryExpr extends Expr implements ExprTrict {
    op: Token|null = null;
    value: Zoom|null = null;

    public convert_to_binary_expr(F: UnaryExpr) {
        const expr = new BinaryExpr();
        expr.left = this;
        expr.right = F.value;
        expr.op = F.op;
        return expr;
    }

    to_string(): string {
        return `${this.op?.getText() ?? "+"}${this.value?.to_string() ?? "unkown"}`;
    }
}
export class IndexExpr implements ExprTrict {
    expr: Zoom|null = null;

    to_string(): string {
        return `[${this.expr?.to_string() ?? "unkown"}]`;
    }
}
export class PriorityExpr extends Expr implements ExprTrict {
    expr: Zoom|null = null;

    to_string(): string {
        if (this.expr) {
            return `(${this.expr.to_string()})`;
        }
        return "unkown";
    }
}
export class MenberReference {
    current: Token|null = null;
    parent: MenberReference|null = null;
    child: MenberReference|null = null;

    index_expr:IndexExpr|null = null;

    public to_string() {
        let name = "";
        if (this.current) {
            name += this.current.getText();
            if (this.child) {
                name += ".";
                name += this.child.to_string();
            }
        }
        if (this.index_expr) {
            name += `[]`;
        }
        return name;
    }
}
export class Id  implements ExprTrict {
    public expr:Token|null = null;

    public to_string() {
        if (this.expr) {
            return this.expr.getText();
        } else {
            return "unkown";
        }
    }

    public to<T extends Params|IndexExpr|null>(v:T) {
        if (v instanceof Params) {
            const caller = new Caller();
            caller.name = this;
            caller.params = v;
            return caller;
        } else if (v instanceof IndexExpr){
            const expr = new IdIndex();
            expr.name = this;
            expr.index_expr = v;
            return expr;
        } else {
            return this as Id;
        }
    }
}
export class Caller implements ExprTrict {
    public name: Id|null = null;
    public params:Params|null = null;

    public to_string():string {
        if (this.name) {
            if (this.params) {
                return `${this.name.to_string()}${this.params.to_string()}`;
            } else {
                return `${this.name.to_string()}'('missing')'`;
            }
        } else {
            return "unkown";
        }
    }

}
export class IdIndex implements ExprTrict{
    public name: Id|null = null;
    public index_expr:IndexExpr|null = null;

    public to_string() {
        if (this.name) {
            if (this.index_expr) {
                return `${this.name.to_string()}${this.index_expr.to_string()}`;
            } else {
                return `${this.name.to_string()}'['missing']'`;
            }
        } else {
            return "unkown";
        }
    }
}
export class VariableName extends Expr implements ExprTrict {
    public names:(Id|Caller|IdIndex|null)[] = [];



    public to_string() {
        if (this.names.length > 0) {
            return this.names.map(name => name ? name.to_string() : " ").join(".");
        } else {
            return "unkown";
        }
    }

    public get_start_line_number():number {
        if (this.names.length > 0) {
            const ref = this.names[0];
            if (ref instanceof Id) {
                return ref.expr?.start.line ?? 0;
            } else if (ref instanceof Caller) {
                return ref.name?.expr?.start.line ?? 0;
            } else if (ref instanceof IdIndex) {
                return ref.name?.expr?.start.line ?? 0;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
    public get_end_line_number():number {
        if (this.names.length > 0) {
            const ref = this.names[this.names.length - 1];
            if (ref instanceof Id) {
                return ref.expr?.start.line ?? 0;
            } else if (ref instanceof Caller) {
                return ref.name?.expr?.start.line ?? 0;
            } else if (ref instanceof IdIndex) {
                return ref.name?.expr?.start.line ?? 0;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
    public get_start_line_position():number {
        if (this.names.length > 0) {
            const ref = this.names[0];
            if (ref instanceof Id) {
                return ref.expr?.start.position ?? 0;
            } else if (ref instanceof Caller) {
                return ref.name?.expr?.start.position ?? 0;
            } else if (ref instanceof IdIndex) {
                return ref.name?.expr?.start.line ?? 0;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
    public get_end_line_position():number {
        if (this.names.length > 0) {
            const ref = this.names[this.names.length - 1];
            if (ref instanceof Id) {
                return ref.expr?.start.position ?? 0;
            } else if (ref instanceof Caller) {
                return ref.name?.expr?.start.position ?? 0;
            } else if (ref instanceof IdIndex) {
                return ref.name?.expr?.start.line ?? 0;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
    
}
export class FunctionExpr implements ExprTrict {
    name: VariableName|null = null;

    public to_string() {
        if (this.name) {
            return `function ${this.name.to_string()}`;
        }
        return "function unkown";
    }
}
export class Params implements ExprTrict {
    public args:(Zoom|null)[] = [];

    public to_string() {
        let name = this.args.map(arg => {
            if (arg) {
                return arg.to_string();
            } else {
                return "(unkown)";
            }
        }).join(", ");
        return `(${name})`;
    }
}
// export class VariableCall extends VariableName implements ExprTrict {
//     public params:Params|null = null;

//     // public to_string() {
//     //     let name = "";
//     //     if (this.current) {
//     //         name += this.current.getText();
//     //         if (this.child) {
//     //             name += ".";
//     //             name += this.child.to_string();
//     //         }
//     //     }
//     //     if (this.index_expr) {
//     //         name += `[]`;
//     //     }
//     //     return name;
//     // }

//     public static from(var_name:VariableName) {
//         const self = new VariableCall();
//         self.names = [...var_name.names];
//         self.index_expr = var_name.index_expr;

//         return self;
//     }

//     public to_string() {
//         let name = super.to_string() as string;
//         if (this.params) {
//             name += this.params.to_string();
//         } else {
//             name += "()";
//         }
//         return name;
//     }
// }


export class Set {
    name: VariableName|null = null;
    init: Zoom|null = null;

    public to_string():string {
        let name = "";
        if (this.name) {
            name += this.name.to_string();
            // if (this.name.index_expr) {
            //     if (this.name.index_expr) {
            //         name += this.name.index_expr.to_string();
            //     }
            // }
        }
        let init = "unkown";
        if (this.init) {
            init = this.init.to_string();
        }
        return `set ${name} = ${init}`
    }
}
export class Type {
    name:Token|null = null;
    extends:Token|null = null;
}
export class Call {
    ref: VariableName|null = null;
}
export class Ret {
    expr: Zoom|null = null;
}
export class Native extends Func {
}

export function parse_line_local(document: Document, line_text: ExpendLineText) {
    const local = new Local();
    const tokens = line_text.tokens();
    let index = 0;
    let state = 0;
    let unary_expr:UnaryExpr|null = null;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;

            if (text == "local") {
                if (tokens[index]) {
                    if (tokens[index].is_identifier) {
                        state = 1;
                    } else {
                        document.add_token_error(tokens[index], `error type`);
                        break;
                    }
                } else {
                    document.add_token_error(token, `incomplete local expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            index++;
            local.type = token;
            
            if (tokens[index]) {
                if (tokens[index].is_identifier) {
                    if (tokens[index].getText() == "array") {
                        state = 3;
                    } else {
                        state = 2;
                    }
                } else {
                    document.add_token_error(tokens[index], `wrong identifier name`);
                    break;
                }
            } else {
                document.add_token_error(token, `local name not declared`);
                break;
            }
        } else if (state == 2) {
            index++;
            local.name = token;

            if (tokens[index]) {
                if (tokens[index].getText() == "=") {
                    state = 4;
                } else {
                    document.add_token_error(tokens[index], `expected token to be assigned a value of '=', but found '${text}'`);
                    break;
                }
            } else {
                break;
            }
        } else if (state == 3) {
            index++;
            local.is_array = true;
            
            if (tokens[index]) {
                if (tokens[index].is_identifier) {
                    state = 2;
                } else {
                    document.add_token_error(tokens[index], `wrong identifier name`);
                    break;
                }
            } else {
                document.add_token_error(token, `local name not declared`);
                break;
            }
        } else if (state == 4) {
            index++;

            if (tokens[index]) {
                state = 5;
            } else {
                console.log("fjaspfjpsfsp");
                
                document.add_token_error(token, `initialization expression not found`);
                break;
            }
        } else if (state == 5) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            local.expr = result.expr;

            state = 6;
        } else if (state == 6) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }
    return local;
}

class Expr_ {
    expr:Zoom|null = null;
    op: Token|null = null;

    public to_expr(right_value: Zoom|null) {
        const expr = new BinaryExpr();
        expr.left = this.expr;
        expr.op = this.op;
        expr.right = right_value;

        return expr;
    }
}


const is_op = (token:Token) => {
    const text = token.getText();
    return text == "+" || text == "-" || text == "*" || text == "/" || text == "==" || text == ">" || text == "<" || text == ">=" || text == "<=" || text == "!=" || text == "or" || text == "and" || text == "%";
};
const is_unary_op = (token:Token) => {
    const text = token.getText();
    return text == "+" || text == "-" || text == "not" || text == "!";
};

function parse_line_unary_expr(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let unary_expr:UnaryExpr|null = null;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        // const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;

            if (is_unary_op(token)) {
                unary_expr = new UnaryExpr();
                unary_expr.op = token;

                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `wrong unary expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `wrong unary expression`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            unary_expr!.value = result.expr;
            
            break;
        }
    }

    return {
        index,
        expr: unary_expr
    };
}
function parse_line_function_expr(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let zoom:FunctionExpr|null = new FunctionExpr;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;
            if (text == "function") {
                state = 1;
            } else {
                document.add_token_error(token, `function references need to start with the 'function' keyword`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_name_reference(document, tokens, index);
            index = result.index;
            if (result.expr) {
                zoom.name = result.expr;
            } else {
                document.add_token_error(token, `no function reference found`);
            }
            break;
        }
    }

    return {
        index,
        expr: zoom
    }
}

function parse_line_priority_expr(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let expr:PriorityExpr|null = null;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;

            if (text == "(") {
                if (expr == null) {
                    expr = new PriorityExpr();
                }

                state = 1;
            } else {
                document.add_token_error(token, `the priority expression should start with '(', but what was actually found was '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (text == ")") {
                index++;
                document.add_token_error(token, `the expression cannot be empty`);
                break;
            } else {
                const result = parse_line_expr(document, tokens, index);
                // params!.expr = result.expr;
                expr!.expr = result.expr;
                index = result.index;
                state = 2;
            }
        } else if (state == 2) {
            index++;
            if (text == ")") {
            } else {
                document.add_token_error(token, `priority expression not found ')' End token`);
            }
            break;
        }
    }

    return {
        index,
        expr: expr
    }
}
function parse_line_expr(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let zoom:Zoom|Expr_|null = null;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            let result!: {
                index: number,
                expr:Zoom|null,
            };
            if (token.is_identifier) {
                if (text == "function") {
                    result = parse_line_function_expr(document, tokens, index);
                    index = result.index;
                } else if (text == "not") {
                    result = parse_line_unary_expr(document, tokens, index);
                    index = result.index;
                } else {
                    result = parse_line_name_reference(document, tokens, index);
                    index = result.index;
                }
            } else if (token.is_value()) {
                const value = new Value();
                value.value = token;

                result = {
                    index: index + 1,
                    expr: value,
                };

                index = result.index;
            } else if (is_unary_op(token)) {
                result = parse_line_unary_expr(document, tokens, index);
                index = result.index;
            } else if (text == "(") {
                result = parse_line_priority_expr(document, tokens, index);
                index = result.index;
            } else {
                break;
            }

            if (zoom) {
                if (zoom instanceof Expr_) {
                    zoom = (<Expr_>zoom).to_expr(result.expr);
                } else {
                    document.add_token_error(token, `missing operator`);
                    break;
                }
            } else {
                zoom = result.expr;
            }

            if (tokens[index] && is_op(tokens[index])) {
                state = 1;
            } else {
                break;
            }
        } else if (state == 1) {
            index++;
            if (zoom) {
                if (zoom instanceof Expr_) {
                    document.add_token_error(token, `operators cannot operate on operators`);
                    break;
                } else {
                    const expr = new Expr_();
                    expr.expr = zoom;
                    expr.op = token;

                    zoom = expr;

                    state = 0;
                }
                state = 0;
            } else {
                document.add_token_error(token, `missing left value`);
                break;
            }
            // if (is_op(token)) {
            // } else {
            //     document.add_token_error(token, `not jass support operator`);
            //     break;
            // }
        }
    }
    return {
        index,
        expr: zoom instanceof Expr_ ? (<Expr_>zoom).expr : zoom
    }
}

function parse_line_call_params(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let params:Params|null = null;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;

            if (text == "(") {
                if (params == null) {
                    params = new Params();
                }

                state = 1;
            } else {
                document.add_token_error(token, `The function or method parameter list needs to start with '(', but the token found is '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (text == ")") {
                index++;

                break;
            } else {
                const result = parse_line_expr(document, tokens, index);
                // params!.expr = result.expr;
                params!.args.push(result.expr);
                index = result.index;
                state = 2;
            }
        } else if (state == 2) {
            index++;
            if (text == ")") {
                break;
            } else if (text == ",") {
                state = 3;
            } else {
                document.add_token_error(token, `needs ',' or ')'`);
            }
        } else if (state == 3) {
            const result = parse_line_expr(document, tokens, index);
            params!.args.push(result.expr);
            index = result.index;

            state = 2;
        }
    }

    return {
        index,
        expr: params
    }
}
/**
 *     |---------|
 * 获取 [...exprs] 之间的tokens给parse_line_expr解析
 * @param document 
 * @param tokens 
 * @param offset_index 
 */
function parse_line_index_expr(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let index_expr:IndexExpr|null = null;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;
            
            if (text == "[") {
                if (index_expr == null) {
                    index_expr = new IndexExpr();
                }
                
                
                state = 1;
            } else {
                document.add_token_error(token, `'['`);
                break;
            }
        } else if (state == 1) {
            if (text == "]") {
                index++;

                document.add_token_error(token, `missing index expression`);

                break;
            } else {
                const result = parse_line_expr(document, tokens, index);
                index_expr!.expr = result.expr;
                index = result.index;
                state = 2;
            }
        } else if (state == 2) {
            index++;
            if (text == "]") {
            } else {
                document.add_token_error(token, `']'`);
            }
            break;
        }
    }

    return {
        index,
        expr: index_expr
    }
}

// function parse_line_caller(document: Document, tokens:Token[], offset_index: number) {
//     let index = offset_index;
//     let state = 0;
//     let variable:VariableCall|null = null;
//     while(index < tokens.length) {
//         const token = tokens[index];
//         if (token.is_block_comment || token.is_comment) {
//             index++;
//             continue;
//         }
//         if (state == 0) {
//             const result = parse_line_name(document, tokens, index);

//             index = result.index;
//             if (result.expr) {
//                 variable = VariableCall.from(result.expr);
//                 state = 1;
//             } else {
//                 document.add_token_error(token, `error function name`);
//                 break;
//             }
//         } else if (state == 1) {
//             const result = parse_line_call_params(document, tokens, index);
//             index = result.index;
//             if (result.expr) {
//                 variable!.params = result.expr;
//             } else {
//                 document.add_token_error(token, `error function params list`);
//             }
//             break;
//         }
//     }

//     return {
//         index,
//         expr: variable
//     }
// }
// function parse_line_name(document: Document, tokens:Token[], offset_index: number) {
//     let index = offset_index;
//     let state = 0;
//     let variable:VariableName|null = null;
    
//     while(index < tokens.length) {
//         const token = tokens[index];
//         if (token.is_block_comment || token.is_comment) {
//             index++;
//             continue;
//         }
//         const text = token.getText();
//         const next_token = tokens[index + 1];
//         if (state == 0) {
//             index++;
            
//             if (variable == null) {
//                 variable = new VariableName();
//             }
            
//             const result = parse_line_name_reference(document, tokens, index);
//             index = result.index;
//             if (result.expr) {
//                 if (result.expr instanceof VariableCall) {
//                     variable.names.push(result.expr);
//                 } else {
//                     variable.names.push(...result.expr.names);
//                 }
                
//                 const next_token = get_next_token(tokens, index);
//                 if (next_token) {
//                     if (next_token.getText() == ".") {
//                         state = 1;
//                     } else if (next_token.getText() == "[") {
//                         state = 2;
//                     } else {
//                         break;
//                     }
//                 } else {
//                     break;
//                 }
//             } else {
//                 document.add_token_error(token, `error member name '${text}'`);
//                 break; 
//             }



//             // if (next_token) {
//             //     if (next_token.getText() == ".") {
//             //         state = 1;
//             //     } else if (next_token.getText() == "[") {
//             //         state = 2;
//             //     } else {
//             //         break;
//             //     }
//             // } else {
//             //     break;
//             // }
//             // if (token.is_identifier) {
//             // } else {
//             //     document.add_token_error(token, `error member name '${text}'`);
//             //     break; 
//             // }
//         } else if (state == 1) {
//             index++;

//             if (next_token && next_token.is_identifier) {
//                 state = 0;
//             } else {
//                 document.add_token_error(token, `incorrect member name reference '${text}'`);
//                 break;
//             }
//         } else if (state == 2) {
//             const result = parse_line_index_expr(document, tokens, index);
//             variable!.index_expr = result.expr;
//             index = result.index;

//             break;
//         }
//     }

//     return {
//         index,
//         expr: variable
//     };
// }
function parse_line_id(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let variable:Id|Caller|IdIndex|null = null;
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        if (state == 0) {
            index++;
            if (token.is_identifier) {
                variable = new Id();
                variable.expr = token;
                
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();

                    if (next_token_text == "(") {
                        state = 1;
                    } else if (next_token_text == "[") {
                        state = 2;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `error identifier '${token.getText()}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_call_params(document, tokens, index);
            index = result.index;
            variable = (<Id>variable).to(result.expr);
            // 如果方法没有参数列表,一般不用，因为程序解析不到相应符号会添加相应的错误提示
            // if (result.expr) {
            // } else {
            //     document.add_token_error(token, `error args`);
            // }
            break;
        } else if (state == 2) {
            const result = parse_line_index_expr(document, tokens, index);
            index = result.index;
            variable = (<Id>variable).to(result.expr);
            break;
        }
    }

    return {
        index,
        expr: variable
    };
}
function parse_line_name_reference(document: Document, tokens:Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let variable:VariableName = new VariableName();
    while(index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        if (state == 0) {
            const result = parse_line_id(document, tokens, index);

            index = result.index;
            variable.names.push(result.expr);
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();

                if (next_token_text == ".") {
                    state = 1;
                } else {
                    break;
                }
            } else {
                break;
            }

        } else if (state == 1) { // '.'操作符
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.is_identifier) {
                    state = 0;
                } else {
                    document.add_token_error(token, `no sub identifier reference found`);
                    break;
                }
            } else {
                document.add_token_error(token, `error identifier '${token.getText()}'`);
                break;
            }
        }
    }

    return {
        index,
        expr: variable
    };
}

// 跳过注释向前获取下一个token
function get_next_token(tokens:Token[], i: number):Token|null {
    for (let index = i; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        } else {
            return token;
        }
    }
    return null;
}

export function parse_line_set(document: Document, line_text: ExpendLineText) {
    const set = new Set();
    const tokens = line_text.tokens();
    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            index++;
            if (text == "set") {
                state = 1;
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.is_identifier) {
                        state = 1;
                    } else if (next_token.getText() == "=") {
                        state = 2;
                    } else {
                        state = 4;
                    }
                } else {
                    document.add_token_error(token, `incomplete set expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) { // name
            const result = parse_line_name_reference(document, tokens, index);
            set.name = result.expr;
            index = result.index;
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "=") {
                    state = 2;
                } else {
                    document.add_token_error(token, `assignment symbol '=' not found`);
                    break;
                }
            } else {
                document.add_token_error(token, `assignment symbol '=' not found`);
                break;
            }
        } else if (state == 2) { // =
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 3;
            } else {
                document.add_token_error(token, `not assigned a value to the set syntax`);
                break;
            }
        } else if (state == 3) { // expr
            const result = parse_line_expr(document, tokens, index);
            set.init = result.expr;
            index = result.index;

            state = 4;
        } else if (state == 4) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return set;
}
export function parse_line_call(document: Document, line_text: ExpendLineText) {
    const call = new Call();
    const tokens = line_text.tokens();
    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index];
        
        if (state == 0) {
            index++;
            if (text == "call") {

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_name_reference(document, tokens, index);
            call.ref = result.expr;
            index = result.index;
            
            break;
        }
    }

    return call;
}
export function parse_line_return(document: Document, line_text: ExpendLineText) {
    const ret = new Ret();
    const tokens = line_text.tokens();
    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index];
        
        if (state == 0) {
            index++;
            if (text == "return") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ret.expr = result.expr;
            index = result.index;

            state = 2;
        } else if (state == 2) { // =
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return ret;
}
export class ExitWhen {
    expr:Zoom|null = null;
}
export function parse_line_exitwhen(document: Document, line_text: ExpendLineText) {
    const ret = new ExitWhen();
    const tokens = line_text.tokens();
    let state = 0;
    let index = 0;
    
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index];
        
        if (state == 0) {
            index++;
            if (text == "exitwhen") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ret.expr = result.expr;
            index = result.index;
            
            state = 2;
        } else if (state == 2) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return ret;
}
export class ElseIf {
    expr:Zoom|null = null;
}
export function parse_line_else_if(document: Document, line_text: ExpendLineText) {
    const ret = new ElseIf();

    return ret;
}
export class Else {
    expr:Zoom|null = null;
}
export function parse_line_else(document: Document, line_text: ExpendLineText) {
    const ret = new Else();

    return ret;
}
export function parse_line_type(document: Document, line_text: ExpendLineText) {
    const ret = new Type();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "type") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                ret.name = token;
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "extends") {
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (token.is_identifier) {
                ret.extends = token;
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        }
    }

    return ret;
}

function parse_line_native(document: Document, line_text: ExpendLineText) {
    const native = new Native();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "function") {
                state = 1;
            } else if (text == "private") {
                native.visible = "private";
                state = 2;
            } else if (text == "public") {
                native.visible = "public";
                state = 2;
            } else if (text == "static") {
                native.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                native.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                native.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                native.name = token;
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "function") {
                state = 1;
            } else if (text == "static") {
                native.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                native.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                native.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "function") {
                state = 1;
            } else if (text == "constant") {
                native.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (text == "function") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == "takes") {
                state = 6;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 6) {
            if (text == "nothing") {
                native.takes = null;
                state = 11;
            } else if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!native.takes) {
                    native.takes = [];
                }
                native.takes.push(take);
                state = 7;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 7) {
            if (token.is_identifier) {
                const takes = native.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 8) {
            if (text == "returns") {
                state = 12;
            } else if (text == ",") {
                state = 9;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 9) {
            if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!native.takes) {
                    native.takes = [];
                }
                native.takes.push(take);
                state = 10;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 10) {
            if (token.is_identifier) {
                const takes = native.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 11) {
            if (text == "returns") {
                state = 12;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 12) {
            if (token.is_identifier) {
                native.returns = text;
                state = 13;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 13) {
            if (text == "defaults") {
                state = 14;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 14) {
            if (token.is_identifier) {
                native.defaults = text;
                state = 15;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return native;
}
function parse_line_method(document: Document, line_text: ExpendLineText) {
    const method = new Method();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "method") {
                state = 1;
            } else if (text == "private") {
                method.visible = "private";
                state = 2;
            } else if (text == "public") {
                method.visible = "public";
                state = 2;
            } else if (text == "static") {
                method.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                method.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                method.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                method.name = token;
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "method") {
                state = 1;
            } else if (text == "static") {
                method.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                method.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                method.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "method") {
                state = 1;
            } else if (text == "constant") {
                method.qualifier = "constant";
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (text == "method") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == "takes") {
                state = 6;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 6) {
            if (text == "nothing") {
                method.takes = null;
                state = 11;
            } else if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!method.takes) {
                    method.takes = [];
                }
                method.takes.push(take);
                state = 7;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 7) {
            if (token.is_identifier) {
                const takes = method.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 8) {
            if (text == "returns") {
                state = 12;
            } else if (text == ",") {
                state = 9;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 9) {
            if (token.is_identifier) {
                const take = new Take();
                take.type = text;
                if (!method.takes) {
                    method.takes = [];
                }
                method.takes.push(take);
                state = 10;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 10) {
            if (token.is_identifier) {
                const takes = method.takes;
                if (takes) {
                    const take = takes[takes.length - 1];
                    take.name = text;
                }
                state = 8;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 11) {
            if (text == "returns") {
                state = 12;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 12) {
            if (token.is_identifier) {
                method.returns = text;
                state = 13;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 13) {
            if (text == "defaults") {
                state = 14;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 14) {
            if (token.is_identifier) {
                method.defaults = text;
                state = 15;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return method;
}
function parse_line_member(document: Document, line_text: ExpendLineText) {
    const member = new Member();
    const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "private") {
                member.visible = "private";
                state = 2;
            } else if (text == "public") {
                member.visible = "public";
                state = 2;
            } else if (text == "static") {
                member.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                member.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                member.qualifier = "constant";
                state = 4;
            } else if (token.is_identifier) {
                member.type = token;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (text == "array") {
                member.is_array = true;
                state = 6;
            } else if (token.is_identifier) {
                member.name = token;
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "static") {
                member.modifier = "static";
                state = 3;
            } else if (text == "stub") {
                member.modifier = "stub";
                state = 3;
            } else if (text == "constant") {
                member.qualifier = "constant";
                state = 4;
            } else if (token.is_identifier) {
                member.type = token;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "constant") {
                member.qualifier = "constant";
                state = 4;
            } else if (token.is_identifier) {
                member.type = token;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (token.is_identifier) {
                member.type = token;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            // =
        } else if (state == 6) {
            if (token.is_identifier) {
                member.name = token;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        }
    }

    return member;
}

export class Other {}



function parse_node(document: Document) {
    const root_node = document.root_node;
    if (!root_node) {
        return;
    }
    const nodes = root_node.children;

    const for_node = (node: Node) => {

        // 解析头
        if (node.type == "library") {
            const library = parse_library(document, node.start_line!);

            node.data = library;
        }
        else if (node.type == "scope") {
            const scope = parse_scope(document, node.start_line!);
            
            node.data = scope;
        }
        else if (node.type == "interface") {
            const inter = parse_interface(document, node.start_line!);
            
            node.data = inter;
        }
        else if (node.type == "struct") {
            const struct = parse_struct(document, node.start_line!);
            
            node.data = struct;
        }
        else if (node.type == "method") {
            const method = parse_method(document, node.start_line!);
            
            node.data = method;
        }
        else if (node.type == "func") {
            const func = parse_function(document, node.start_line!);
            
            node.data = func;
        } else if (node.type == "globals") {
            const globals = parse_globals(document, node.start_line!);

            node.data = globals;
        } else if (node.type == "if") {
            const ifs = parse_if(document, node.start_line!);

            node.data = ifs;
        } else if (node.type == "loop") {
            const loop = parse_loop(document, node.start_line!);

            node.data = loop;
        }

        node.body.forEach(value => {
            if (value.type == "empty") {
                const empty = parse_line_empty(document, value.line);
                node.body_datas.push(empty);
            } else if (value.type == "comment") {
                const comment = parse_line_comment(document, value.line);

                node.body_datas.push(comment);
            } else if (value.type == "local") {
                const local = parse_line_local(document, value.line);

                node.body_datas.push(local);
            } else if (value.type == "set") {
                const set = parse_line_set(document, value.line);

                node.body_datas.push(set);
            } else if (value.type == "call") {
                const call = parse_line_call(document, value.line);

                node.body_datas.push(call);
            } else if (value.type == "return") {
                const ret = parse_line_return(document, value.line);

                node.body_datas.push(ret);
            } else if (value.type == "native") {
                const native = parse_line_native(document, value.line);

                node.body_datas.push(native);
            } else if (value.type == "method") {
                const method = parse_line_method(document, value.line);

                node.body_datas.push(method);
            } else if (value.type == "member") {
                const member = parse_line_member(document, value.line);
                
                node.body_datas.push(member);
            } else if (value.type == "exitwhen") {
                const exitwhen = parse_line_exitwhen(document, value.line);
                
                node.body_datas.push(exitwhen);
            } else if (value.type == "elseif") {
                const elseif = parse_line_else_if(document, value.line);
                
                node.body_datas.push(elseif);
            } else if (value.type == "else") {
                const el = parse_line_else(document, value.line);
                
                node.body_datas.push(el);
            } else if (value.type == "type") {
                const el = parse_line_type(document, value.line);
                
                node.body_datas.push(el);
            } else if (value.type == "other") {
                node.body_datas.push(new Other());
            }
            
        });

        node.children.forEach(child => {
            for_node(child);
        });
    };

    for_node(root_node);
}

//#endregion

//#region 展开

class ExpendLineText {
    document: Document;
    line: number;
    run_text_macro?: RunTextMacro;
    text_macro?: TextMacro;

    constructor(document: Document, line: number, run_text_macro?: RunTextMacro, text_macro?: TextMacro) {
        this.document = document;
        this.line = line;
        this.run_text_macro = run_text_macro;
        this.text_macro = text_macro;
    }

    public text_line(): TextLine {
        if (this.run_text_macro && this.text_macro) {
            return this.text_macro.lineAt(this.line, this.run_text_macro.param_values());
        } else {
            return this.document.lineAt(this.line);
        }
    }
    public tokens(): Token[] {
        if (this.run_text_macro && this.text_macro) {
            return this.text_macro.lineTokens(this.line, this.run_text_macro.param_values());
        } else {
            return this.document.lineTokens(this.line);
        }
    }
}

type NodeType = "zinc" | "library" | "struct" | "interface" | "method" | "func" | "globals" | "scope" | "if" | "loop" | null;


type DataType = Library|Struct|Interface|Method|Func|Globals|Scope|If|Loop;
export class Node {
    public data: any;

    public type: NodeType;
    public parent: Node | null = null;
    public body: {
        type: "local"|"set"|"call"|"return"|"comment"|"empty"|"other"|"member"|"native"|"method"|"exitwhen"|"elseif"|"else"|"type",
        line: ExpendLineText
    }[] = [];
    public start_line: ExpendLineText | null = null;
    public end_line: ExpendLineText | null = null;

    public body_datas: any[] = [];

    public readonly children: Node[] = [];

    constructor(type: NodeType) {
        this.type = type;
    }

    pattern: Pair | null = null;


}

class Pair {
    type: NodeType;
    start: RegExp;
    end: RegExp;

    // children: Pair|null = null;

    constructor(type: NodeType, start: RegExp, end: RegExp) {
        this.type = type;
        this.start = start;
        this.end = end;
    }
}

const zincPair = new Pair("zinc", new RegExp(/^\/\/!\s+zinc\b/), new RegExp(/^\/\/!\s+endzinc\b/));
const globalsPair = new Pair("globals", new RegExp(/^\s*globals\b/), new RegExp(/^\s*endglobals\b/));
const funcPair = new Pair("func", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?function\b/), new RegExp(/^\s*endfunction\b/));
const libraryPair = new Pair("library", new RegExp(/^\s*(?:library|library_once)\b/), new RegExp(/^\s*endlibrary\b/));
const scopePair = new Pair("scope", new RegExp(/^\s*scope\b/), new RegExp(/^\s*endscope\b/));
const interfacePair = new Pair("interface", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?interface\b/), new RegExp(/^\s*endinterface\b/));
const structPair = new Pair("struct", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?struct\b/), new RegExp(/^\s*endstruct\b/));
// const methodPair = new Pair("method", new RegExp(/^\s*(?<mod>(?:public|private)(?:\s+(?<still>(?:static|stub)(?:\s+(?<constant>constant))?))?)\b/), new RegExp(/^\s*endmethod\b/));
const methodPair = new Pair("method", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?method\b/), new RegExp(/^\s*endmethod\b/));
const ifPair = new Pair("if", new RegExp(/^\s*if\b/), new RegExp(/^\s*endif\b/));
const loopPair = new Pair("loop", new RegExp(/^\s*loop\b/), new RegExp(/^\s*endloop\b/));

const localRegExp = /^\s*local\b/;
const setRegExp = /^\s*set\b/;
const callRegExp = /^\s*call\b/;
const returnRegExp = /^\s*return\b/;
const exitwhenRegExp = /^\s*exitwhen\b/;
const elseifRegExp = /^\s*elseif\b/;
const elseRegExp = /^\s*else\b/;
const nativeRegExp = /^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?native\b/;
const memberRegExp = /^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?[a-zA-Z0-9_]+\b/;
const methodRegExp = /^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?method\b/;
const typeRegExp = /^\s*type\b/;


const pairs = [
    zincPair,
    libraryPair,
    scopePair,
    funcPair,
    interfacePair,
    structPair,
    methodPair,
    ifPair,
    loopPair,
    globalsPair,
];
const non_method_pairs = pairs.filter(pair => pair.type != "method");

const slice_layer_handle = (document: Document, run_text_macro: RunTextMacro | undefined, macro: TextMacro | undefined, line: number, node_stack: Node[], root_node: Node, in_interface:boolean) => {

    const last_node = () => {
        return node_stack[node_stack.length - 1];
    };
    const text_line = run_text_macro && macro ? macro.lineAt(line, run_text_macro.param_values()) : document.lineAt(line);

    const success_head = () => {
        const filter_pairs = in_interface ? non_method_pairs : pairs;
        for (let index = 0; index < filter_pairs.length; index++) {
            const pair = filter_pairs[index];
            if (pair.start.test(text_line.text)) {
                if (pair.type == "interface") {
                    in_interface = true;
                }
                const node = last_node();
                const new_node = new Node(pair.type);
                new_node.start_line = new ExpendLineText(document, line, run_text_macro, macro);
                new_node.pattern = pair;
                node_stack.push(new_node);
                if (node) {
                    new_node.parent = node;
                    node.children.push(new_node);
                } else {
                    new_node.parent = root_node;
                    root_node.children.push(new_node);
                }
                return true;
            }
        }
        return false;
    };
    const success_end = () => {
        const node = last_node();
        if (node) {
            if (node.pattern && node.pattern.end.test(text_line.text)) {
                if (node.type == "interface") {
                    in_interface = false;
                }
                node.end_line = new ExpendLineText(document, line, run_text_macro, macro);
                node_stack.pop(); // 闭合
            } else { // 非关键行
                const e_line = new ExpendLineText(document, line, run_text_macro, macro);
                if (node.type == "zinc") {
                    node.body.push({
                        type: "other",
                        line: e_line
                    });
                } else {
                    if (nativeRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "native",
                            line: e_line
                        });
                    } else if (localRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "local",
                            line: e_line
                        });
                    } else if (setRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "set",
                            line: e_line
                        });
                    } else if (callRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "call",
                            line: e_line
                        });
                    } else if (returnRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "return",
                            line: e_line
                        });
                    } else if (e_line.tokens().length == 0) {
                        node.body.push({
                            type: "empty",
                            line: e_line
                        });
                    } else if (e_line.tokens()[0].is_comment) {
                        node.body.push({
                            type: "comment",
                            line: e_line
                        });
                    } else if (methodRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "method",
                            line: e_line
                        });
                    } else if (exitwhenRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "exitwhen",
                            line: e_line
                        });
                    } else if (elseifRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "elseif",
                            line: e_line
                        });
                    } else if (elseRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "else",
                            line: e_line
                        });
                    } else if (typeRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "type",
                            line: e_line
                        });
                    } else if (memberRegExp.test(text_line.text)) {
                        node.body.push({
                            type: "member",
                            line: e_line
                        });
                    } else {
                        node.body.push({
                            type: "other",
                            line: e_line
                        });
                    }
                }
            }
        } else {
            const e_line = new ExpendLineText(document, line, run_text_macro, macro);
            if (nativeRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "native",
                    line: e_line
                });
            } else if (localRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "local",
                    line: e_line
                });
            } else if (setRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "set",
                    line: e_line
                });
            } else if (callRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "call",
                    line: e_line
                });
            } else if (returnRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "return",
                    line: e_line
                });
            } else if (e_line.tokens().length == 0) {
                root_node.body.push({
                    type: "empty",
                    line: e_line
                });
            } else if (e_line.tokens()[0].is_comment) {
                root_node.body.push({
                    type: "comment",
                    line: e_line
                });
            } else if (methodRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "method",
                    line: e_line
                });
            } else if (exitwhenRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "exitwhen",
                    line: e_line
                });
            } else if (elseifRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "elseif",
                    line: e_line
                });
            } else if (elseRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "else",
                    line: e_line
                });
            } else if (typeRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "type",
                    line: e_line
                });
            } else if (memberRegExp.test(text_line.text)) {
                root_node.body.push({
                    type: "member",
                    line: e_line
                });
            } else {
                root_node.body.push({
                    type: "other",
                    line: e_line
                });
            }

        }
        return false;
    };
    if (!success_head()) {
        success_end();
    }

    return {
        in_interface
    };
}
function slice_layer(document: Document) {
    const node_stack: Node[] = [];
    const root_node = new Node(null);
    let in_interface = false;
    document.loop((document, line) => {
        in_interface = slice_layer_handle(document, undefined, undefined, line, node_stack, root_node, in_interface).in_interface;

    }, (document, run_text_macro, macro, line) => {
        in_interface = slice_layer_handle(document, run_text_macro, macro, line, node_stack, root_node, in_interface).in_interface;
    });

    document.root_node = root_node;

}

//#endregion

export function parse(filePath: string, i_content?: string) {
    const content: string = i_content ? i_content : fs.readFileSync(filePath, { encoding: "utf-8" });
    const document = new Document(filePath, content);
    tokenize_for_vjass(document);

    

    preprocessing(document);

    parse_import(document);
    parse_textmacro(document);
    parse_runtextmacro(document);
    find_token_error(document);
    Global.set(filePath, document);


    slice_layer(document);
    parse_node(document);

    find_node_error(document);
}

if (false) {
    parse("a/b", `
        function a takes nothing returns nothing
         set k = (a.GetRectMinX(r) <= x) and(x <= GetRectMaxX(r)) and(GetRectMinY(r) <= y) and(y <= GetRectMaxY(r)) + -3 * this.name(8 * 9 >= 16 + function aaa.ccc))=
call a.c()
call a()
if 5== a then
endif
        endfunction 
        kkk
        `)
    // const s = (<Set>Global.get("a/b")?.root_node?.children[0].body_datas[0]);
    const document = Global.get("a/b");
    const s = (<Set>Global.get("a/b")?.root_node?.children[0].body_datas[0]);
    console.log(s, document?.token_errors.map(err => `${err.token.line} ${err.token.start.position} ${err.message}`), s.to_string());
    const c = (<Set>Global.get("a/b")?.root_node?.children[0].body_datas[1]);
    // @ts-ignore
    console.log(c.ref.params.args[0], document?.token_errors.map(err => `${err.token.line} ${err.token.start.position} ${err.message}`));
    const d = (<Ret>Global.get("a/b")?.root_node?.children[0].children[0].data);
    console.log(d);
    
    console.log(d, document?.token_errors.map(err => `${err.token.line} ${err.token.start.position} ${err.message}`));
    // @ts-ignore
    // const expr = parse_line_expr(document, document?.lineTokens(4), 0);
    // console.log(expr.expr.left.value.getText(), expr.expr.op.getText(),expr.expr.right.value.getText());
    // console.log(document?.token_errors.map(err => err.message));
    // @ts-ignore
    // console.log(expr.expr);
    // console.log(.ref?.to_string());
    
}

