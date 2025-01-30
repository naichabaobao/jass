import * as path from "path";
import * as fs from "fs";
import { Document, Position, Range, RunTextMacro, TextLine, TextMacro, Token} from "./tokenizer-common";

export class Context {
    private _keys: string[] = [];
    private _documents: Document[] = [];
    private handle_key(key: string): string {
        // const handle_key = key.replace(/\\+/g, "/");
        const parsed = path.parse(key);
        return path.resolve(parsed.dir, parsed.base);
    }
    public set(key: string, value: Document) {
        const handle_key = this.handle_key(key);
        const index = this._keys.indexOf(handle_key);
        if (index == -1) {
            this._keys.push(handle_key);
            this._documents.push(value);
        } else {
            this._documents[index] = value;
        }
    }
    private indexOf(key: string): number {
        return this._keys.indexOf(this.handle_key(key));
    }
    public has(key: string): boolean {
        return this.indexOf(key) != -1;
    }

    public get(key: string): Document | undefined {
        if (this.has(key)) {
            const index = this.indexOf(key);
            return this._documents[index];
        }
        return;
    }
    public delete(key: string) {
        const index = this.indexOf(key);
        if (index != -1) {
            this._keys.splice(index, 1);
            this._documents.splice(index, 1);
        }
    }

    public getAllTextMacros() {
        return this._documents.map(document => document.text_macros).flat();
    }

    public get kays():string[] {
        return this._keys;
    }

    public get_strcut_by_name(name: string):Struct[] {
        const structs:Struct[] = [];

        this._documents.forEach(document => {
            structs.push(...document.get_struct_by_name(name));
        });

        return structs;
    }

    public get_function_set_by_name(name: string):(Func|Native|Method)[] {
        const funcs:(Func|Native|Method)[] = [];

        this._documents.forEach(document => {
            funcs.push(...document.get_function_set_by_name(name));
        });

        return funcs;
    }

}

export const GlobalContext = new Context();

//#region 解析
export class LibraryRequire {
    public optional: Token | null = null;
    public name: Token | null = null;

    
    public get is_optional() : boolean {
        return this.optional !== null;
    }
    
}



export class NodeAst extends Range {
    public readonly document:Document;
    public parent: NodeAst|null = null;
    public previous: NodeAst|null = null;
    public next: NodeAst|null = null;
    public children:Array< NodeAst> = [];

    public end_tag:Token|null = null;

    constructor(document:Document) {
        super();
        this.document = document;
    }
    public get start(): Position {
        if (this.start_token) {
            return this.start_token.start;
        } else {
            return new Position(0, 0);
        }
    }
    public get end(): Position {
        if (this.end_tag) {
            return this.end_tag.end;
        } else if (this.end_token) {
            return this.end_token.end;
        } else if (this.children.length > 0) {
            return this.children[this.children.length - 1].end;
        } else if (this.next) {
            return this.next.start;
        } else {
            return new Position(0, 0);
        }
    }

    public contains(positionOrRange: Range | Position): boolean {
        return new Range(this.start, this.end).contains(positionOrRange);
    }

    public start_token:Token|null = null;
    public end_token:Token|null = null;

    public get description():string[] {
        const descs:string[] = [];

        const previous_by_previous = (node: NodeAst) => {
            if (node.previous && node.previous instanceof Comment) {
                // 反向插入
                if (!node.previous.is_deprecated && !node.previous.is_param) {
                    descs.splice(0, 0, node.previous.content);
                }

                previous_by_previous(node.previous);
            }
        };
        previous_by_previous(this);

        return descs;
    }

    public get is_deprecated():boolean {
        let is = false;
        const previous_by_previous = (node: NodeAst) => {
            if (node.previous && node.previous instanceof Comment) {
                // 反向插入
                if (is) {
                    return;
                } else if (node.previous.is_deprecated) {
                    is = true;
                }

                previous_by_previous(node.previous);
            }
        };
        previous_by_previous(this)
        return is;
    }

    public get comments():Comment[] {
        const comments:Comment[] = [];

        const previous_by_previous = (node: NodeAst) => {
            if (node.previous && node.previous instanceof Comment) {
                comments.splice(0, 0, node.previous);

                previous_by_previous(node.previous);
            }
        };
        previous_by_previous(this);

        return comments;
    }

    public add_node<T extends NodeAst>(node:T) {
        const previous = this.children[this.children.length - 1] ?? null;

        this.children.push(node);
        node.previous = previous;

        if (previous) {
            previous.next = node;
        }

        node.parent = this;
    }
}

export namespace zinc {
    export class Break extends NodeAst {
        public token:Token|null = null;

        constructor(document: Document) {
            super(document);
        }
    
        public to_string(): string {
            return this.token?.getText() ?? "";
        }
    }

    export class Call extends NodeAst {
        ref: VariableName | null = null;
    
        constructor(document: Document) {
            super(document);
        }

        to_string():string {
            return `${this.ref?.to_string() ?? "()"}`;
        }
    }

    export class Set extends NodeAst {
        name: VariableName | null = null;
        init: Zoom | null = null;
    
        public to_string(): string {
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
            return `${name} = ${init}`
        }
    }
    export class GlobalVariable extends NodeAst {
        // [public, private]
        public visible: Token | null = null;
        // [static, stub]
        public modifier: Token | null = null;
        // [constant]
        public qualifier: Token | null = null;
    
        type: Token | null = null;
        name: Token | null = null;
        array_token: Token | null = null;
    
        expr: Zoom | null = null;
    
        public is_array: boolean = false;
    
        
        public get is_constant() : boolean {
            return this.qualifier !== null && this.qualifier.getText() == "constant";
        }
        public get is_private():boolean {
            return !!this.visible && this.visible.getText() == "private";
        }
        public get is_public():boolean {
            return !this.is_private;
        }
        
    
        public to_string(): string {
            const visible_string = this.visible ? this.visible.getText() + " " : "";
            const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
            const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
            const type_string = this.type ? this.type.getText() + " " : "";
            const array_string = this.is_array ? "array " : "";
            const name_string = this.name ? this.name.getText() + " " : "";
            return `${visible_string}${modifier_string}${qualifier_string}${type_string}${array_string}${name_string}`;
        }
    
        public with(statement: Statement | Modifier) {
            if (statement instanceof Statement) {
                this.type = statement.type;
                this.name = statement.name;
                this.array_token = statement.array_token;
                this.is_array = this.array_token != null;
                this.expr = statement.expr;
            } else if (statement instanceof Modifier) {
                this.visible = statement.visible;
                this.modifier = statement.modifier;
                this.qualifier = statement.qualifier;
            }
        }
        
    }
    
    export class Member extends zinc.GlobalVariable {
    }
    export class Library extends NodeAst{
        public name: Token | null = null;
        public requires: LibraryRequire[] = [];
    
        to_string(): string {
            return `library ${this.name ? this.name.getText() : "(unkown)"}${this.requires.length > 0 ? " requires " + this.requires.map(x => {
                return `${x.is_optional ? "optional " : ""}${x.name ? x.name.getText() : "(unkown)"}`;
            }).join(", ") : ""}`;
        }
    }
    export class Interface extends NodeAst {
        public visible: Token | null = null;
        public name: Token | null = null;
        public extends: Token[] | null = null;
    
        public get is_private():boolean {
            return !!this.visible && this.visible.getText() == "private";
        }
        public get is_public():boolean {
            return !this.is_private;
        }
    
        to_string():string {
            return `interface ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.join(", ") : ""}`
        }
    }
    export class Struct extends Interface {
        to_string():string {
            return `struct ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.join(", ") : ""}`
        }
    }
    export class Func extends NodeAst {
        public to_string(): string {
            const visible_string = this.visible ? this.visible.getText() + " " : "";
            const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
            const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
            const name_string = this.name ? this.name.getText() + " " : "";
            const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
            const returns_string = this.returns ? this.returns.getText() : "nothing";
            return `${visible_string}${modifier_string}${qualifier_string}native ${name_string}takes ${takes_string} returns ${returns_string}`;
        }
    
        /**
         * [private, public]
         */
        public visible: Token | null = null;
        /**
         * [static, stub]
         */
        public modifier: Token | null = null;
        /**
         * [constant]
         */
        public qualifier: Token | null = null;
        public name: Token | null = null;
        public takes: Take[] | null = null;
        public returns: Token | null = null;
        public defaults: string | null = null;
    
        with<T extends Modifier | Takes | Returns>(v: T) {
            if (v instanceof Modifier) {
                this.visible = v.visible;
                this.modifier = v.modifier;
                this.qualifier = v.qualifier;
            } else if (v instanceof Takes) {
                if (v.takes.length > 0) {
                    if (this.takes == null) {
                        this.takes = [];
                    }
                    this.takes.push(...v.takes);
                } else {
                    this.takes = null;
                }
            } else if (v instanceof Returns) {
                this.returns = v.expr;
            }
        }
    
        public get is_private():boolean {
            return !!this.visible && this.visible.getText() == "private";
        }
        public get is_public():boolean {
            return !this.is_private;
        }
    
        public get is_static():boolean {
            return !!this.modifier && this.modifier.getText() == "static";
        }
        public get is_stub():boolean {
            return !!this.modifier && this.modifier.getText() == "stub";
        }
        public get is_constant():boolean {
            return !!this.qualifier && this.qualifier.getText() == "constant";
        }
    
        public get_param_descriptions() {
            const param_descs: ParamDescription[] = [];
            this.comments.forEach(comment => {
                if (comment.is_param) {
                    const result = /^\/\/\s*@[pP]arams?\s+(?<name>[\$_a-zA-Z0-9]+)\s+(?<content>.*)/.exec(comment.comment!.getText());
                    if (result && result.groups) {
                        param_descs.push(new ParamDescription(result.groups["name"], result.groups["content"]));
                    }
                }
            });
    
            return param_descs;
        }
    }
    export class Method extends Func {
        public to_string(): string {
            const visible_string = this.visible ? this.visible.getText() + " " : "";
            const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
            const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
            const name_string = this.name ? this.name.getText() + " " : "";
            const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
            const returns_string = this.returns ? this.returns.getText() : "nothing";
            return `${visible_string}${modifier_string}${qualifier_string}method ${name_string}takes ${takes_string} returns ${returns_string}`;
        }
    
        with<T extends Modifier | Takes | Returns>(v: T) {
            if (v instanceof Modifier) {
                this.visible = v.visible;
                this.modifier = v.modifier;
                this.qualifier = v.qualifier;
            } else if (v instanceof Takes) {
                if (v.takes.length > 0) {
                    if (this.takes == null) {
                        this.takes = [];
                    }
                    this.takes.push(...v.takes);
                } else {
                    this.takes = null;
                }
            } else if (v instanceof Returns) {
                this.returns = v.expr;
            }
        }
    }
    export class If extends NodeAst {
        expr: Zoom | null = null;
    }
    export class For extends If {
        expr: Zoom | null = null;
    }
    export class CFor extends For {
        init_statement:Statement|null = null;
        expr: Zoom | null = null;
        inc_statement:Statement|null = null;
    }
}

export class ZincNode extends NodeAst {

    constructor (document: Document) {
        super(document)
    }

}

export class Library extends NodeAst implements ExprTrict{

    public is_library_once: boolean = false;
    public name: Token | null = null;
    public initializer: Token | null = null;
    public requires: LibraryRequire[] = [];

    to_string(): string {
        return `${this.is_library_once ? "library_once" : "library"} ${this.name ? this.name.getText() : "(unkown)"}${this.initializer ? " initializer " + this.initializer.getText() : ""}${this.requires.length > 0 ? " requires " + this.requires.map(x => {
            return `${x.is_optional ? "optional " : ""}${x.name ? x.name.getText() : "(unkown)"}`;
        }).join(", ") : ""}`;
    }
}
export function parse_library(document: Document, tokens: Token[]) {
    const library = new Library(document);

    // const tokens = line_text.tokens();
    let state = 0;
    let index = 0;
    let optional:LibraryRequire|null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "library" || text == "library_once") {
                library.is_library_once = text == "library_once";

                library.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `library name is undefined`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'library'`);
                break;
            }
        } else if (state == 1) {
            index++;

            if (token.is_identifier) {
                library.name = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "initializer") {
                        state = 2;
                    } else if (next_token_text == "requires" || next_token_text == "uses" || next_token_text == "needs") {
                        state = 4;
                    } else {
                        state = 8;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal library identifier`);
                break;
            }


        } else if (state == 2) { // initializer
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 3;
            } else {
                document.add_token_error(token, `initializer function not found`);
                break;
            }
        } else if (state == 3) {
            index++;

            if (token.is_identifier) {
                library.initializer = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "requires" || next_token_text == "uses" || next_token_text == "needs") {
                        state = 4;
                    } else {
                        document.add_token_error(token, `missing keyword 'requires'、'uses' or 'needs'`);
                        break;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal initializer function identifier`);
                break;
            }
        } else if (state == 4) { // requires
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "optional") {
                    state = 6;
                } else {
                    state = 5;
                }
            } else {
                document.add_token_error(token, `requires library names not found`);
                break;
            }
        } else if (state == 5) {
            index++;

            if (token.is_identifier) {
                if (optional == null) {
                    optional = new LibraryRequire();
                } else {
                }
                optional.name = token;

                library.requires.push(optional);
                optional = null;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == ",") {
                        state = 7;
                    } else {
                        state = 8;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal initializer function identifier`);
                break;
            }
        } else if (state == 6) { // optional
            index++;
            
            optional = new LibraryRequire();
            optional.optional = token;

            const next_token = get_next_token(tokens, index);
            if (next_token && next_token.is_identifier) {
                state = 5;
            } else {
                document.add_token_error(token, `missing library reference library name`);
                break;
            }
        } else if (state == 7) { // ,
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token && next_token.is_identifier) {
                if (next_token.getText() == "optional") {
                    state = 6;
                } else {
                    state = 5;
                }
            } else {
                document.add_token_error(token, `missing library reference library name`);
                break;
            }
        } else if (state == 8) {
            index++;

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
    //         } else {ScopeLibrary
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

export class Scope extends NodeAst {
    public name: Token | null = null;

    to_string(): string {
        return `scope ${this.name ? this.name.getText() : "(unkown)"}`;
    }
}
export function parse_scope(document: Document, tokens: Token[]) {
    const scope = new Scope(document);
    // const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "scope") {
                scope.start_token = token;

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

export class Interface extends NodeAst {
    public visible: "public" | "private" | null = null;
    public name: Token | null = null;
    public extends: string[] | null = null;

    public get is_private():boolean {
        return !!this.visible && this.visible == "private";
    }
    public get is_public():boolean {
        return !this.is_private;
    }

    to_string():string {
        return `interface ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.join(", ") : ""}`
    }
}
export function parse_interface(document: Document, tokens: Token[]) {
    const inter = new Interface(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "interface") {
                inter.start_token = token;

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


    to_string():string {
        return `struct ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.join(", ") : ""}`
    }

}
export function parse_struct(document: Document, tokens: Token[]) {
    const struct = new Struct(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "struct") {
                struct.start_token = token;

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
    public type: Token | null = null;
    public name: Token | null = null;

    public to_string(): string {
        const type_string = this.type ? this.type.getText() : "(unkown_type)";
        const name_string = this.name ? this.name.getText() : "(unkown_name)";
        return `${type_string} ${name_string}`;
    }

    belong:Func|Native|Method;

    constructor(belong:Func|Native|Method) {
        this.belong = belong;
    }

    public get desciprtion():ParamDescription|null {
        const desc = this.belong.get_param_descriptions().find(desc => {
            return desc.name === this.name?.getText();
        });
        if (desc) {
            return desc;
        } else {
            return null;
        }
    }

}

class ParamDescription {
    name: string;
    content: string;

    constructor(name: string, content: string = "") {
        this.name = name;
        this.content = content;
    }
}
export class Native extends NodeAst {
    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
        const returns_string = this.returns ? this.returns.getText() : "nothing";
        return `${visible_string}${modifier_string}${qualifier_string}native ${name_string}takes ${takes_string} returns ${returns_string}`;
    }

    /**
     * [private, public]
     */
    public visible: Token | null = null;
    /**
     * [static, stub]
     */
    public modifier: Token | null = null;
    /**
     * [constant]
     */
    public qualifier: Token | null = null;
    public name: Token | null = null;
    public takes: Take[] | null = null;
    public returns: Token | null = null;
    public defaults: string | null = null;

    with<T extends Modifier | Takes | Returns>(v: T) {
        if (v instanceof Modifier) {
            this.visible = v.visible;
            this.modifier = v.modifier;
            this.qualifier = v.qualifier;
        } else if (v instanceof Takes) {
            if (v.takes.length > 0) {
                if (this.takes == null) {
                    this.takes = [];
                }
                this.takes.push(...v.takes);
            } else {
                this.takes = null;
            }
        } else if (v instanceof Returns) {
            this.returns = v.expr;
        }
    }

    public get is_private():boolean {
        return !!this.visible && this.visible.getText() == "private";
    }
    public get is_public():boolean {
        return !this.is_private;
    }

    public get is_static():boolean {
        return !!this.modifier && this.modifier.getText() == "static";
    }
    public get is_stub():boolean {
        return !!this.modifier && this.modifier.getText() == "stub";
    }
    public get is_constant():boolean {
        return !!this.qualifier && this.qualifier.getText() == "constant";
    }

    public get_param_descriptions() {
        const param_descs: ParamDescription[] = [];
        this.comments.forEach(comment => {
            if (comment.is_param) {
                const result = /^\/\/\s*@[pP]arams?\s+(?<name>[\$_a-zA-Z0-9]+)\s+(?<content>.*)/.exec(comment.comment!.getText());
                if (result && result.groups) {
                    param_descs.push(new ParamDescription(result.groups["name"], result.groups["content"]));
                }
            }
        });

        return param_descs;
    }
}
export class Func extends Native {

    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
        const returns_string = this.returns ? this.returns.getText() : "nothing";
        return `${visible_string}${modifier_string}${qualifier_string}function ${name_string}takes ${takes_string} returns ${returns_string}`;
    }
}
export class Method extends Func {
    public visible: Token | null = null;
    public modifier: Token | null = null;
    public qualifier: Token | null = null;
    public name: Token | null = null;
    public takes: Take[] | null = null;
    public returns: Token | null = null;
    public defaults: string | null = null;

    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
        const returns_string = this.returns ? this.returns.getText() : "nothing";
        return `${visible_string}${modifier_string}${qualifier_string}method ${name_string}takes ${takes_string} returns ${returns_string}`;
    }

    with<T extends Modifier | Takes | Returns>(v: T) {
        if (v instanceof Modifier) {
            this.visible = v.visible;
            this.modifier = v.modifier;
            this.qualifier = v.qualifier;
        } else if (v instanceof Takes) {
            if (v.takes.length > 0) {
                if (this.takes == null) {
                    this.takes = [];
                }
                this.takes.push(...v.takes);
            } else {
                this.takes = null;
            }
        } else if (v instanceof Returns) {
            this.returns = v.expr;
        }
    }
}
export function parse_method(document: Document, tokens: Token[]) {
    return parse_function(document, tokens, "method") as Method;
}



/**       
 * 解析参数类型与标识符
 *         |-------|
 * [takes] type name
 * @param document 
 * @param tokens 
 * @param offset_index 
 * @returns 
 */
function parse_line_function_takes_statement(document: Document, tokens: Token[], offset_index: number, func: Func | Method | Native) {
    let index = offset_index;
    let state = 0;
    let take: Take = new Take(func);
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;
            if (token.is_identifier) {
                take.type = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "returns") {
                        document.add_token_error(token, `undeclared parameter identifier`);
                        break;
                    } else if (next_token_text == ",") {
                        document.add_token_error(token, `undeclared parameter identifier`);
                        break;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `parameter declaration not found`);
                    break;
                }
            } else {
                document.add_token_error(token, `incorrect parameter type declaration '${text}'`);
                break;
            }
        } else if (state == 1) {
            index++;

            if (token.is_identifier) {
                take.name = token;
            } else {
                document.add_token_error(token, `wrong parameter identifier '${text}'`);
            }
            break;
        }
    }
    return {
        index,
        expr: take
    }
}

export class Takes {
    takes: Take[] = [];
}
function parse_line_function_takes(document: Document, tokens: Token[], offset_index: number, func: Func | Method | Native) {
    let index = offset_index;
    let state = 0;
    let takes: Takes = new Takes();
    // 匹配第一个'nothing'关键字
    let is_first = true;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;
            if (text == "takes") {
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.getText() == "returns") {
                        document.add_token_error(token, `non parametric declaration requires the use of the keyword 'nothing'`);
                        break;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `parameter declaration not found`);
                    break;
                }
            } else {
                document.add_token_error(token, `parameter declaration requires' takes'`);
                break;
            }
        } else if (state == 1) {
            if (is_first && text == "nothing") {
                index++;
                break
            } else {
                const result = parse_line_function_takes_statement(document, tokens, index, func);
                index = result.index;
                takes.takes.push(result.expr);

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "returns") {
                        break;
                    } else if (next_token_text == ",") {
                        state = 2;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            if (is_first) {
                is_first = false;
            }
        } else if (state == 2) { // ','
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "returns") {
                    break;
                } else if (next_token_text == ",") {
                    document.add_token_error(token, `empty parameter declaration`);
                    state = 2;
                } else {
                    state = 1;
                }
            } else {
                document.add_token_error(token, `incomplete take parameter declaration`);
                break;
            }
        }
    }
    return {
        index,
        expr: takes
    }
}
class Modifier {
    // [public, private]
    public visible: Token | null = null;
    // [static, stub]
    public modifier: Token | null = null;
    // [constant]
    public qualifier: Token | null = null;
}
export function parse_line_modifier(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let modifier: Modifier = new Modifier();
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "private" || text == "public") {
                index++;
                modifier.visible = token;
            } else if (text == "static" || text == "stub") {
                index++;
                modifier.modifier = token;
            } else if (text == "constant") {
                index++;
                modifier.qualifier = token;
            } else {
                break;
            }
        }
    }
    return {
        index,
        expr: modifier
    }
}
export class Returns {
    expr: Token | null = null;
}
function parse_line_returns(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let returns: Returns = new Returns();
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;

            if (text == "returns") {

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `no declaration return type displayed`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'returns'`);
                break;
            }
        } else if (state == 1) {
            index++;
            returns.expr = token;

            if (!token.is_identifier) {
                document.add_token_error(token, `wrong return type`);
            }

            break;
        }
    }
    return {
        index,
        expr: returns
    }
}


export function parse_function(document: Document, tokens: Token[], type: "function" | "method" | "native" = "function") {
    const func: Func | Method | Native = type == "function" ? new Func(document) : type == "method" ? new Method(document) : new Native(document);

    let state = 0;
    let index = 0;
    const keyword = type;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            const result = parse_line_modifier(document, tokens, index);
            index = result.index;
            func.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == keyword) {
                    state = 1;
                } else {
                    document.add_token_error(token, `error ${keyword}`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword ${keyword}`);
                break;
            }
        } else if (state == 1) {
            index++;

            func.start_token = token;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "takes") {
                    document.add_token_error(token, `missing ${keyword} name`);
                    state = 3;
                } else if (next_token.is_identifier) {
                    state = 2;
                } else {
                    document.add_token_error(next_token, `wrong ${keyword} name '${next_token_text}'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing ${keyword} name`);
                break;
            }
        } else if (state == 2) {
            index++;
            func.name = token;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "takes") {
                    state = 3;
                } else if (next_token_text == "returns") {
                    document.add_token_error(next_token, `missing keyword 'returns'`);
                    state = 4;
                } else if (next_token_text == "defaults") {
                    document.add_token_error(next_token, `missing keyword 'defaults'`);
                    state = 5;
                } else {
                    document.add_token_error(next_token, `missing keyword 'takes'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'takes'`);
                break;
            }
        } else if (state == 3) {
            const result = parse_line_function_takes(document, tokens, index, func);
            index = result.index;
            func.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "returns") {
                    state = 4;
                } else if (next_token_text == "defaults") {
                    document.add_token_error(next_token, `missing keyword 'defaults'`);
                    state = 5;
                } else {
                    document.add_token_error(next_token, `missing keyword 'returns'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'returns'`);
                break;
            }
        } else if (state == 4) {
            const result = parse_line_returns(document, tokens, index);
            index = result.index;
            func.with(result.expr);

            state = 5;
        } else if (state == 5) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return func;
}
export class Globals extends NodeAst {
}

export function parse_globals(document: Document, tokens: Token[]) {
    const globals = new Globals(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (text == "globals") {
                globals.start_token = token;

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

export class If extends NodeAst {
    expr: Zoom | null = null;
}
export class Loop extends NodeAst { }

export function parse_if(document: Document, tokens: Token[]) {
    const ifs = new If(document);

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
            if (text == "if") {
                ifs.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "then") {
                        document.add_token_error(next_token, `missing boolean expression`);
                        state = 2;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `error if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'if'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ifs.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 2;
            } else {
                document.add_token_error(token, `missing keyword 'then'`);
                break;
            }
        } else if (state == 2) {
            index++;

            if (text == "then") {
                state = 3;
            }
            else {
                document.add_token_error(token, `'if' statement needs to end with the keyword 'then'`);
                break;
            }
        } else if (state == 3) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }

    }

    return ifs;
}
export function parse_loop(document: Document, tokens: Token[]) {
    const loop = new Loop(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (text == "loop") {
                loop.start_token = token;

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

export class Comment extends NodeAst {
    comment: Token | null = null;

    public get content():string {
        if (this.comment) {
            const text = this.comment.getText().replace(/^\/\//, "");
            return text;
        }
        return "";
    }

    public get is_deprecated():boolean {
        if (this.comment) {
            return /^\/\/\s*@[dD]eprecated\b/.test(this.comment.getText());
        }
        return false;
    }

    public get is_param():boolean {
        if (this.comment) {
            return /^\/\/\s*@[pP]arams?\b/.test(this.comment.getText());
        }
        return false;
    }
}

export function parse_line_comment(document: Document, tokens: Token[]) {
    const comment = new Comment(document);

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

                comment.start_token = token;

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




export class GlobalVariable extends NodeAst {
    // [public, private]
    public visible: Token | null = null;
    // [static, stub]
    public modifier: Token | null = null;
    // [constant]
    public qualifier: Token | null = null;

    type: Token | null = null;
    name: Token | null = null;
    array_token: Token | null = null;

    expr: Zoom | null = null;

    public is_array: boolean = false;

    
    public get is_constant() : boolean {
        return this.qualifier !== null && this.qualifier.getText() == "constant";
    }
    public get is_private():boolean {
        return !!this.visible && this.visible.getText() == "private";
    }
    public get is_public():boolean {
        return !this.is_private;
    }
    

    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const type_string = this.type ? this.type.getText() + " " : "";
        const array_string = this.is_array ? "array " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        return `${visible_string}${modifier_string}${qualifier_string}${type_string}${array_string}${name_string}`;
    }

    public with(statement: Statement | Modifier) {
        if (statement instanceof Statement) {
            this.type = statement.type;
            this.name = statement.name;
            this.array_token = statement.array_token;
            this.is_array = this.array_token != null;
            this.expr = statement.expr;
        } else if (statement instanceof Modifier) {
            this.visible = statement.visible;
            this.modifier = statement.modifier;
            this.qualifier = statement.qualifier;
        }
    }
}

export class Member extends GlobalVariable {
}
export class Local extends GlobalVariable {
}
type Zoom = BinaryExpr | UnaryExpr | Value | VariableName | PriorityExpr | FunctionExpr;

export interface ExprTrict {
    to_string(): string;
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

    public value: Token | null = null;
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
    left: Zoom | null = null;
    right: Zoom | null = null;
    op: Token | null = null;

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
    op: Token | null = null;
    value: Zoom | null = null;

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
    expr: Zoom | null = null;

    to_string(): string {
        return `[${this.expr?.to_string() ?? "unkown"}]`;
    }
}
export class PriorityExpr extends Expr implements ExprTrict {
    expr: Zoom | null = null;

    to_string(): string {
        if (this.expr) {
            return `(${this.expr.to_string()})`;
        }
        return "unkown";
    }
}
export class MenberReference {
    current: Token | null = null;
    parent: MenberReference | null = null;
    child: MenberReference | null = null;

    index_expr: IndexExpr | null = null;

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
export class Id implements ExprTrict {
    public expr: Token | null = null;

    public to_string() {
        if (this.expr) {
            return this.expr.getText();
        } else {
            return "unkown";
        }
    }

    public to<T extends Params | IndexExpr | null>(document:Document, v: T) {
        if (v instanceof Params) {
            const caller = new Caller();
            caller.name = this;
            caller.params = v;
            return caller;
        } else if (v instanceof IndexExpr) {
            const expr = new IdIndex();
            expr.name = this;
            expr.index_expr = v;
            return expr;
        } else {
            return this as Id;
        }
    }
}
class Caller implements ExprTrict {
    public name: Id | null = null;
    public params: Params | null = null;

    public to_string(): string {
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
export class IdIndex implements ExprTrict {
    public name: Id | null = null;
    public index_expr: IndexExpr | null = null;

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
    public names: (Id | Caller | IdIndex | null)[] = [];



    public to_string() {
        if (this.names.length > 0) {
            return this.names.map(name => name ? name.to_string() : " ").join(".");
        } else {
            return "unkown";
        }
    }

    public get_start_line_number(): number {
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
    public get_end_line_number(): number {
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
    public get_start_line_position(): number {
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
    public get_end_line_position(): number {
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
    name: VariableName | null = null;

    public to_string() {
        if (this.name) {
            return `function ${this.name.to_string()}`;
        }
        return "function unkown";
    }
}
export class Params implements ExprTrict {
    public args: (Zoom | null)[] = [];

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


export class Set extends NodeAst {
    name: VariableName | null = null;
    init: Zoom | null = null;

    public to_string(): string {
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
export class Type extends NodeAst {
    name: Token | null = null;
    extends: Token | null = null;
}
export class Call extends NodeAst {
    ref: VariableName | null = null;

    constructor(document: Document) {
        super(document);
    }

    to_string():string {
        return `call ${this.ref?.to_string() ?? "()"}`;
    }
}
export class Return extends NodeAst {
    expr: Zoom | null = null;
}


export function parse_line_global(document: Document, tokens: Token[]) {
    const global = new GlobalVariable(document);

    let index = 0;
    let state = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            const result = parse_line_modifier(document, tokens, index);
            index = result.index;
            global.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 1
            } else {
                document.add_token_error(token, `error global variable`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_statement(document, tokens, index);
            index = result.index;
            global.with(result.expr);
            break;
        }
    }
    return global;
}
export function parse_line_local(document: Document, tokens: Token[]) {
    const local = new Local(document);

    let index = 0;
    let state = 0;
    let unary_expr: UnaryExpr | null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;

            if (text == "local") {
                local.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.is_identifier) {
                        state = 1;
                    } else {
                        document.add_token_error(next_token, `error type`);
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
            const result = parse_line_statement(document, tokens, index);
            index = result.index;
            local.with(result.expr);
            break;
        }
    }
    return local;
}

class Expr_ {
    expr: Zoom | null = null;
    op: Token | null = null;

    public to_expr(right_value: Zoom | null) {
        const expr = new BinaryExpr();
        expr.left = this.expr;
        expr.op = this.op;
        expr.right = right_value;

        return expr;
    }
}


const is_op = (token: Token) => {
    const text = token.getText();
    return text == "+" || text == "-" || text == "*" || text == "/" || text == "==" || text == ">" || text == "<" || text == ">=" || text == "<=" || text == "!=" || text == "or" || text == "and" || text == "%";
};
const is_unary_op = (token: Token) => {
    const text = token.getText();
    return text == "+" || text == "-" || text == "not" || text == "!";
};

function parse_line_unary_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let unary_expr: UnaryExpr | null = null;
    while (index < tokens.length) {
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
function parse_line_function_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let zoom: FunctionExpr | null = new FunctionExpr;
    while (index < tokens.length) {
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

function parse_line_priority_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let expr: PriorityExpr | null = null;
    while (index < tokens.length) {
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
export function parse_line_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let zoom: Zoom | Expr_ | null = null;
    while (index < tokens.length) {
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
                expr: Zoom | null,
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

function parse_line_call_params(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let params: Params | null = null;
    while (index < tokens.length) {
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
function parse_line_index_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let index_expr: IndexExpr | null = null;
    while (index < tokens.length) {
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
function parse_line_id(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let variable: Id | Caller | IdIndex | null = null;
    while (index < tokens.length) {
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
            variable = (<Id>variable).to(document, result.expr);
            // 如果方法没有参数列表,一般不用，因为程序解析不到相应符号会添加相应的错误提示
            // if (result.expr) {
            // } else {
            //     document.add_token_error(token, `error args`);
            // }
            break;
        } else if (state == 2) {
            const result = parse_line_index_expr(document, tokens, index);
            index = result.index;
            variable = (<Id>variable).to(document, result.expr);
            break;
        }
    }

    return {
        index,
        expr: variable
    };
}
export function parse_line_name_reference(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let variable: VariableName = new VariableName();
    while (index < tokens.length) {
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
function get_next_token(tokens: Token[], i: number): Token | null {
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

export class Statement {

    type: Token | null = null;
    name: Token | null = null;

    expr: Zoom | null = null;

    array_token: Token | null = null;

    public is_array: boolean = false;

    public to_string(): string {
        const type_string = this.type ? this.type.getText() + " " : "unkown_type ";
        const array_string = this.is_array ? "array " : "";
        const name_string = this.name ? this.name.getText() + " " : "unkown_name ";
        return `${type_string}${array_string}${name_string}`;
    }
}

/**
 * 
 * type [array] name [=] init
 * @param document 
 * @param tokens 
 * @param offset_index 
 * @returns 
 */
export function parse_line_statement(document: Document, tokens: Token[], offset_index: number) {
    const statement = new Statement();
    let index = offset_index;
    let state = 1;

    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 1) {

            index++;
            statement.type = token;

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
                document.add_token_error(token, `name not declared`);
                break;
            }
        } else if (state == 2) {
            index++;
            statement.name = token;

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
            statement.array_token = token;
            statement.is_array = true;

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
                document.add_token_error(token, `initialization expression not found`);
                break;
            }
        } else if (state == 5) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            statement.expr = result.expr;

            state = 6;
        } else if (state == 6) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }
    return {
        expr: statement,
        index,
    };
}

export function parse_line_set(document: Document, tokens: Token[]) {
    const set = new Set(document);

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
                set.start_token = token;

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
export function parse_line_call(document: Document, tokens: Token[]) {
    const call = new Call(document);

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
            if (text == "call") {
                call.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_name_reference(document, tokens, index);
            call.ref = result.expr;
            index = result.index;

            state = 2;
        } else if (state == 2) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return call;
}
export function parse_line_return(document: Document, tokens: Token[]) {
    const ret = new Return(document);

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
            if (text == "return") {
                ret.start_token = token;

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
export class ExitWhen extends NodeAst {
    expr: Zoom | null = null;
}
export function parse_line_exitwhen(document: Document, tokens: Token[]) {
    const ret = new ExitWhen(document);

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
                ret.start_token = token;

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
export class ElseIf extends NodeAst {
    expr: Zoom | null = null;
}
export function parse_line_else_if(document: Document, tokens: Token[]) {
    const ret = new ElseIf(document);

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
            if (text == "elseif") {
                ret.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "then") {
                        document.add_token_error(next_token, `missing boolean expression`);
                        state = 2;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `error elseif expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'elseif'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ret.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 2;
            } else {
                document.add_token_error(token, `missing keyword 'then'`);
                break;
            }
        } else if (state == 2) {
            index++;

            if (text == "then") {
                state = 3;
            }
            else {
                document.add_token_error(token, `'elseif' statement needs to end with the keyword 'then'`);
                break;
            }
        } else if (state == 3) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }

    }

    return ret;
}
export class Else extends NodeAst {
    expr: Zoom | null = null;
}
export function parse_line_else(document: Document, tokens: Token[]) {
    const ret = new Else(document);

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
            if (text == "else") {
                ret.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `missing keyword 'else'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }

    }

    return ret;
}
export function parse_line_type(document: Document, tokens: Token[]) {
    const ret = new Type(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (text == "type") {
                ret.start_token = token;

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

export function parse_line_native(document: Document, tokens: Token[]) {
    return parse_function(document, tokens, "native") as Native;
}
export function parse_line_method(document: Document, tokens: Token[]) {
    return parse_function(document, tokens, "method") as Method;
}
export function parse_line_member(document: Document, tokens: Token[]) {
    const member = new Member(document);

    let index = 0;
    let state = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            const result = parse_line_modifier(document, tokens, index);
            index = result.index;
            member.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                member.start_token = next_token;

                state = 1;
            } else {
                document.add_token_error(token, `error global variable`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_statement(document, tokens, index);
            index = result.index;
            member.with(result.expr);
            break;
        }
    }

    return member;
}

export class Other extends NodeAst { }

export function parse_line_end_tag(document: Document, tokens:Token[], object: NodeAst, end_tag: string) {
    let token:Token|null = null;

    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == end_tag) {
                state = 1;
                object.end_token = token;

                object.end_tag = token;
            } else {
                document.add_token_error(token, `missing end tag keyword '${end_tag}'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }

    }

    return token;
}
/*
export function parse_node(document: Document) {
    // @ts-ignore
    const root_node = document.root_node;
    if (!root_node) {
        return;
    }
    const nodes = root_node.children;

    const for_node = (node: Node) => {

        // 解析头
        if (node.type == "library") {
            const library = parse_library(document, node.start_line!);
            library.end_tag = parse_line_end_tag(document, node.end_line, library, "endlibrary");

            node.data = library;
        }
        else if (node.type == "scope") {
            const scope = parse_scope(document, node.start_line!);
            scope.end_tag = parse_line_end_tag(document, node.end_line, scope, "endscope");
            node.data = scope;
        }
        else if (node.type == "interface") {
            const inter = parse_interface(document, node.start_line!);
            inter.end_tag = parse_line_end_tag(document, node.end_line, inter, "endinterface");
            node.data = inter;
        }
        else if (node.type == "struct") {
            const struct = parse_struct(document, node.start_line!);
            struct.end_tag = parse_line_end_tag(document, node.end_line, struct, "endstruct");
            node.data = struct;
        }
        else if (node.type == "method") {
            const method = parse_method(document, node.start_line!); // ok
            method.end_tag = parse_line_end_tag(document, node.end_line, method, "endmethod");
            node.data = method;
        }
        else if (node.type == "func") {
            const func = parse_function(document, node.start_line!); // ok
            func.end_tag = parse_line_end_tag(document, node.end_line, func, "endfunction");
            node.data = func;
        } else if (node.type == "globals") {
            const globals = parse_globals(document, node.start_line!); // ok
            globals.end_tag = parse_line_end_tag(document, node.end_line, globals, "endglobals");
            node.data = globals;
        } else if (node.type == "if") {
            const ifs = parse_if(document, node.start_line!);
            ifs.end_tag = parse_line_end_tag(document, node.end_line, ifs, "endif");
            node.data = ifs;
        } else if (node.type == "loop") {
            const loop = parse_loop(document, node.start_line!);
            loop.end_tag = parse_line_end_tag(document, node.end_line, loop, "endloop");
            node.data = loop;
        }

        node.body.forEach(value => {
            if (value.type == "empty") {
                ;;
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
                const other = new Other(document);
                const tokens = value.line.tokens();
                other.start_token = tokens[tokens.length - 1];
                node.body_datas.push(other);
            }

        });

        node.children.forEach(child => {
            for_node(child);
        });
    };

    for_node(root_node);
}
*/
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


type DataType = Library | Struct | Interface | Method | Func | Globals | Scope | If | Loop;


export class Node {
    public data: any;
    public readonly children: (Node)[] = [];

    public type: NodeType;
    public parent: Node | null = null;

    public body: {
        type: "local" | "set" | "call" | "return" | "comment" | "empty" | "other" | "member" | "native" | "method" | "exitwhen" | "elseif" | "else" | "type",
        line: ExpendLineText
    }[] = [];
    public start_line: ExpendLineText | null = null;
    public end_line: ExpendLineText | null = null;



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

const slice_layer_handle = (document: Document, run_text_macro: RunTextMacro | undefined, macro: TextMacro | undefined, line: number, node_stack: Node[], root_node: Node, in_interface: boolean) => {

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
export function slice_layer(document: Document) {
    const node_stack: Node[] = [];
    const root_node = new Node(null);
    let in_interface = false;
    // 遍历行
    document.loop_uncontain_macro((document, line) => {
        in_interface = slice_layer_handle(document, undefined, undefined, line, node_stack, root_node, in_interface).in_interface;

    }, (document, run_text_macro, macro, line) => {
        in_interface = slice_layer_handle(document, run_text_macro, macro, line, node_stack, root_node, in_interface).in_interface;
    });
    // @ts-ignore
    document.root_node = root_node;

}

//#endregion

export function parse(filePath: string, i_content?: string) {
    const content: string = i_content ? i_content : fs.readFileSync(filePath, { encoding: "utf-8" });
    const document = new Document(filePath, content);
    // tokenize_for_vjass(document);



    // preprocessing(document);

    // parse_import(document);
    // parse_textmacro(document);
    // parse_runtextmacro(document);
    // find_token_error(document);
    // Global.set(filePath, document);


    // slice_layer(document);
    // parse_node(document);

    // find_node_error(document);

    return document;
}

if (false) {
//     parse("a/b", `
//         function a takes nothing returns nothing
//          set k = (a.GetRectMinX(r) <= x) and(x <= GetRectMaxX(r)) and(GetRectMinY(r) <= y) and(y <= GetRectMaxY(r)) + -3 * this.name(8 * 9 >= 16 + function aaa.ccc))=
// call a.c()
// call a()
// if 5== a then
// endif
//         endfunction 
//         kkk
//         `)
//     // const s = (<Set>Global.get("a/b")?.root_node?.children[0].body_datas[0]);
//     const document = Global.get("a/b");
//     const s = (<Set>Global.get("a/b")?.root_node?.children[0].body_datas[0]);
//     console.log(s, document?.token_errors.map(err => `${err.token.line} ${err.token.start.position} ${err.message}`), s.to_string());
//     const c = (<Set>Global.get("a/b")?.root_node?.children[0].body_datas[1]);
//     // @ts-ignore
//     console.log(c.ref.params.args[0], document?.token_errors.map(err => `${err.token.line} ${err.token.start.position} ${err.message}`));
//     const d = (<Return>Global.get("a/b")?.root_node?.children[0].children[0].data);
//     console.log(d);

//     console.log(d, document?.token_errors.map(err => `${err.token.line} ${err.token.start.position} ${err.message}`));
//     // @ts-ignore
//     // const expr = parse_line_expr(document, document?.lineTokens(4), 0);
//     // console.log(expr.expr.left.value.getText(), expr.expr.op.getText(),expr.expr.right.value.getText());
//     // console.log(document?.token_errors.map(err => err.message));
//     // @ts-ignore
//     // console.log(expr.expr);
//     // console.log(.ref?.to_string());
//     console.log(document?.program);
    

}

