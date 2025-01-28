import { Document, Token } from "./tokenizer-common";
import { LibraryRequire, NodeAst, Returns, Statement, Take, Takes, ZincNode, parse_library, parse_line_call, parse_line_comment, parse_line_expr, parse_line_modifier, parse_line_name_reference, parse_line_return, parse_line_statement, parse_line_type, zinc } from "./parser-vjass";



/**
 * 声明
 * 设置
 * 调用
 * return
 * else if
 * else
 * break
 * method
 * @param tokens 
 */
function parse_zinc_line_object(tokens:Token[]) {
    let object:any;
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        const text = token.getText();
        if (state == 0) {
            if (text == "method") {

            } else if (text == "else") {

            } else if (text == "break") {

            }
        }
    }
}



/**
 * 
 * @param tokens 
 * @param keyword 
 * @param excute_string 
 * @returns 
 */
function is_start_with(tokens: Token[], keyword: string|((token:Token) => boolean)|(string|((token:Token, index: number, tokens: Token[]) => boolean))[], excute_string: string[] = []):boolean {
    const first_index = tokens.findIndex(token => !token.is_block_comment && !excute_string.includes(token.getText()));
    if (first_index == -1) {
        return false;
    }
    
    const first_token = tokens[first_index];
    if (typeof keyword == "string") {
        return first_token.getText() == keyword;
    } else if (Array.isArray(keyword)) {
        return tokens.length >= (first_index + keyword.length) && keyword.every((k, index) => {
            return typeof k == "string" ? tokens[first_index + index].getText() == k : k(tokens[first_index + index], first_index + index, tokens);
        });
    } else {
        return keyword(first_token);
    }
}
/**
 * 通过前几个token确认zinc 块级跟行级的类型
 * @param document 
 * @param zinc_object 
 */
function confirm_zinc_type(zinc_object:ZincBlock|ZincSegement|ZincComment) {
    if (zinc_object instanceof ZincComment) {
    } else if (zinc_object instanceof ZincBlock) {
        if (is_start_with(zinc_object.tokens, "library")) {
            zinc_object.type = "library";
        } else if (is_start_with(zinc_object.tokens, "struct", ["public", "private"])) {
            zinc_object.type = "struct";
        } else if (is_start_with(zinc_object.tokens, "interface", ["public", "private"])) {
            zinc_object.type = "interface";
        } else if (is_start_with(zinc_object.tokens, "method", ["public", "private", "static"])) {
            zinc_object.type = "method";
        } else if (is_start_with(zinc_object.tokens, "function", ["public", "private", "static"])) {
            zinc_object.type = "func";
        } else if (is_start_with(zinc_object.tokens, "if")) {
            zinc_object.type = "if";
        } else if (is_start_with(zinc_object.tokens, "for")) {
            zinc_object.type = "for";
        } else {
            zinc_object.type = "other"
        }
    } else if (zinc_object instanceof ZincSegement) {
        const menber_conditions = () => {
            return [(token:Token) => token.is_identifier, (token:Token) => token.is_identifier];
        }
        if (is_start_with(zinc_object.tokens, "return")) {
            zinc_object.type = "return";
        } else if (is_start_with(zinc_object.tokens, ["public", "method"]) || is_start_with(zinc_object.tokens, ["private", "method"])) {
            zinc_object.type = "method";
        } else if (is_start_with(zinc_object.tokens, "break")) {
            zinc_object.type = "break";
        } else if (is_start_with(zinc_object.tokens, "type")) {
            zinc_object.type = "type";
        } else if (
            is_start_with(zinc_object.tokens, ["private",...menber_conditions()])
            || is_start_with(zinc_object.tokens, ["constant",...menber_conditions()])
            || is_start_with(zinc_object.tokens, ["static",...menber_conditions()])
            || is_start_with(zinc_object.tokens, ["private", "constant",...menber_conditions()])
            || is_start_with(zinc_object.tokens, ["private", "static",...menber_conditions()])
            || is_start_with(zinc_object.tokens, ["public",...menber_conditions()])
            || is_start_with(zinc_object.tokens, ["public", "static",...menber_conditions()])
            || is_start_with(zinc_object.tokens, ["public", "constant",...menber_conditions()])
            || is_start_with(zinc_object.tokens, menber_conditions())
            ) {
            zinc_object.type = "member";
        } else if (is_start_with(zinc_object.tokens, [(token) => token.is_identifier, (token, index, tokens) => {
            if (token.getText() == "=") {
                return true;
            } else {
                return tokens.slice(index).some(t => t.getText() == "=");
            }
        }])) {
            zinc_object.type = "set";
        } else if (is_start_with(zinc_object.tokens, [(token, index, tokens) => token.is_identifier, (token, index, tokens) => {
            if (token.getText() == "(") {
                return true;
            } else {
                for (let i = index; i < tokens.length; i++) {
                    const offset_token = tokens[i];
                    if (offset_token.is_identifier || offset_token.is_block_comment || offset_token.getText() == ".") {
                        continue;
                    } else if (offset_token.getText() == "(") {
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            }
        }])) {
            zinc_object.type = "call";
        } else {
            zinc_object.type = "other"
        }
    }
}
/**
 * 
 */
function traverse_and_confirm_zinc_type(layer_objects: (ZincBlock | ZincSegement | ZincComment)[]) {
    const handing = (object: ZincBlock | ZincSegement | ZincComment) => {
        confirm_zinc_type(object);
        if (object instanceof ZincBlock) {
            object.children.forEach(child => handing(child));
        }
    }
    layer_objects.forEach(object => handing(object));
}

class ZincData {
    public data: any = null;
    

    constructor() {
    }
}

class ZincBlock extends ZincData{
    // 前缀tokens
    public readonly tokens:Token[] = [];
    public start_token:Token|null = null;
    public end_token:Token|null = null;

    public parent:ZincBlock|null = null;
    children: (ZincBlock|ZincSegement|ZincComment)[] = [];

    public type: "library" | "struct" | "interface" | "method" | "func" | "if" | "for" | "other" = "other";

    constructor(prefix_tokens:Token[], start_token:Token|null, end_token:Token|null) {
        super();
        this.tokens = prefix_tokens;
        this.start_token = start_token;
        this.end_token = end_token;
    }
}
class ZincSegement extends ZincData {
    public readonly tokens:Token[] = [];
    public start_token:Token|null = null;
    public end_token:Token|null = null;

    public parent:ZincBlock|null = null;

    public type: "set" | "call" | "return" | "other" | "member" | "method" | "break" | "type" = "other";

    constructor(prefix_tokens:Token[], start_token:Token|null, end_token:Token|null) {
        super();
        this.tokens = prefix_tokens;
        this.start_token = start_token;
        this.end_token = end_token;
    }

    /**
     * 是否
     */
    public get has_broken() : boolean {
        return this.end_token?.getText() == ";";
    }
    
}
class ZincComment extends ZincData {
    public readonly tokens:Token[] = [];

    public parent:ZincBlock|null = null;

    constructor() {
        super();
    }
}

function zinc_slice_layer(tokens:Token[]) {
    const result:(ZincBlock|ZincSegement|ZincComment)[] = [];
    // const macros:Macro[] = [];
    // let text_macro:TextMacro|null = null;
    const stack: ZincBlock[] = [];
    let cache_tokens:Token[] = [];
    const push_block = (block_or_segement: ZincBlock|ZincSegement|ZincComment) => {
        if (stack.length > 0) {
            stack[stack.length - 1].children.push(block_or_segement);
            // 设置父block
            block_or_segement.parent = stack[stack.length - 1];
        } else {
            result.push(block_or_segement);
        }
        if (block_or_segement instanceof ZincBlock) {
            stack.push(block_or_segement);
        }
        // 清空
        cache_tokens = [];
    }
    
    const drop_block = (token:Token) => {
        if (stack.length > 0) {
            const block = stack.pop();
            if (block) {
                block.end_token = token;
            }
        }
    };
    
    
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        const text = token.getText();
        if (state == 0) {
            if (text == "{") {
                const block = new ZincBlock(cache_tokens, token, null);
                push_block(block);
            } else if (stack.length > 0 && text == "}") {
                drop_block(token);
            } else if (text == ";") {
                const segement = new ZincSegement(cache_tokens, cache_tokens.length > 0 ? cache_tokens[0] : token, token);
                push_block(segement);
            } else if (token.is_block_comment) {
                continue;
            } else if (token.is_comment) {
                if (cache_tokens.length == 0) {
                    const comment = new ZincComment();
                    comment.tokens.push(token);
                    push_block(comment);
                } else {
                    continue;
                }
            } else {
                cache_tokens.push(token);
            }
        }
        
    }
    // 把没有以 '；'结束语句也加进去
    if (cache_tokens.length > 0) {
        const segement = new ZincSegement(cache_tokens, cache_tokens[0], cache_tokens[cache_tokens.length - 1]);
        push_block(segement);
    }
    
    return result;  
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

export function parse_segement_break(document: Document, tokens: Token[]) {
    const ret = new zinc.Break(document);

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
            if (text == "break") {
                ret.start_token = token;
                ret.token = token;
                
                state = 1;
            } else {
                document.add_token_error(token, `missing keyword 'break'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `break syntax error token '${text}'`);
        }

    }

    return ret;
}

export function parse_segement_call(document: Document, tokens: Token[]) {
    const call = new zinc.Call(document);

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
            const result = parse_line_name_reference(document, tokens, index);
            call.ref = result.expr;
            index = result.index;

            state = 1;
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `call syntax error token '${text}'`);
        }
    }

    return call;
}

export function parse_segement_set(document: Document, tokens: Token[]) {
    const set = new zinc.Set(document);

    let state = 1;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 1) { // name
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

/**
 * 
 * type [array] name [=] init
 * @param document 
 * @param tokens 
 * @param offset_index 
 * @returns 
 */
export function parse_segement_statement(document: Document, tokens: Token[], offset_index: number) {
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
                document.add_token_error(token, `name not declared`);
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

            break;
        }
    }
    return {
        expr: statement,
        index,
    };
}
/**
 * 
 * type [array] name [=] init
 * @param document 
 * @param tokens 
 * @param offset_index 
 * @returns 
 */
export function parse_segement_statement_by_type(document: Document, tokens: Token[], offset_index: number, first_member: zinc.Member) {
    const statement = new Statement();
    statement.type = first_member.type;
    statement.array_token = first_member.array_token;
    statement.is_array = first_member.is_array;

    let index = offset_index;
    let state = 2;

    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 2) {
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
                document.add_token_error(token, `name not declared`);
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

            break;
        }
    }
    return {
        expr: statement,
        index,
    };
}
export function parse_segement_member(document: Document, tokens: Token[]) {
    const mem:zinc.Member = new zinc.Member(document);
    const mems:zinc.Member[] = [mem];

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
            mem.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                mem.start_token = next_token;

                state = 1;
            } else {
                document.add_token_error(token, `error variable`);
                break;
            }
        } else if (state == 1) {
            const result = parse_segement_statement(document, tokens, index);
            index = result.index;
            mem.with(result.expr);
            mem.with(result.expr);
            
            const next_token = get_next_token(tokens, index);
            if (next_token && next_token.getText() == ",") {
                state = 2;
            } else {
                state = 5;
            }
        } else if (state == 2) {
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 3;
            } else {
                document.add_token_error(token, `missing declaration statement`);
                break;
            }
        } else if (state == 3) {
            const result = parse_segement_statement_by_type(document, tokens, index, mem);
            index = result.index;
            const other_member:zinc.Member = new zinc.Member(document);
            other_member.with(result.expr);
            mems.push(other_member);
            
            const next_token = get_next_token(tokens, index);
            if (next_token && next_token.getText() == ",") {
                state = 2;
            } else {
                state = 5;
            }
        } else if (state == 5) {
            index++;
            document.add_token_error(token, `error variable token ${token.getText()}`);
            break;

        }
    }

    return mems.length > 1 ? mems : mem;
}

export function parse_block_library(document: Document, tokens: Token[]) {
    const library = new zinc.Library(document);

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
            if (text == "library") {
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
                    if (next_token_text == "requires" || next_token_text == "uses" || next_token_text == "needs") {
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

            document.add_token_error(token, `library syntax error token '${text}'`);

            break;
        }
    }

    return library;
}

export function parse_block_interface(document: Document, tokens: Token[]) {
    const inter = new zinc.Interface(document);

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
                inter.visible = token;
                state = 2;
            } else if (text == "public") {
                inter.visible = token;
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
                inter.extends!.push(token);
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
            break;
        }
    }

    return inter;
}
export function parse_block_struct(document: Document, tokens: Token[]) {
    const struct = new zinc.Struct(document);

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
                struct.visible = token;
                state = 2;
            } else if (text == "public") {
                struct.visible = token;
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
                struct.start_token = token;

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
                struct.extends!.push(token);
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
            break;
        }
    }

    return struct;
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
function parse_line_function_takes_statement(document: Document, tokens: Token[], offset_index: number, func: zinc.Func | zinc.Method) {
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
                    if (next_token_text == ",") {
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
function parse_line_function_takes(document: Document, tokens: Token[], offset_index: number, func: zinc.Func | zinc.Method) {
    let index = offset_index;
    let state = 0;
    let takes: Takes = new Takes();
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;
            if (text == "(") {
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.getText() == ")") {
                        state = 3;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `parameter declaration not found`);
                    break;
                }
            } else {
                document.add_token_error(token, `parameter definition incorrect`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_function_takes_statement(document, tokens, index, func);
            index = result.index;
            takes.takes.push(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ",") {
                    state = 2;
                } else if (next_token_text == ")") {
                    state = 3;
                } else {
                    document.add_token_error(token, `parameter definition incorrect`);
                    break;
                }
            } else {
                document.add_token_error(token, `parameter definition incorrect`);
                break;
            }
        } else if (state == 2) { // ','
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ",") {
                    document.add_token_error(token, `empty parameter declaration`);
                    state = 2;
                } else {
                    state = 1;
                }
            } else {
                document.add_token_error(token, `incomplete take parameter declaration`);
                break;
            }
        } else if (state == 3) {
            index++;
            break;
        }
    }
    return {
        index,
        expr: takes
    }
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

            if (text == "->") {

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `no declaration return type displayed`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword '->'`);
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
export function parse_block_function(document: Document, tokens: Token[], type: "function" | "method" = "function") {
    const func: zinc.Func | zinc.Method  = type == "function" ? new zinc.Func(document) : new zinc.Method(document);

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
                if (next_token_text == "(") {
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
                if (next_token_text == "(") {
                    state = 3;
                } else {
                    document.add_token_error(next_token, `missing takes '(...)'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing takes '(...)'`);
                break;
            }
        } else if (state == 3) {
            const result = parse_line_function_takes(document, tokens, index, func);
            index = result.index;
            func.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "->") {
                    state = 4;
                } else {
                    console.log(next_token.getText());
                    
                    document.add_token_error(next_token, `missing keyword '->'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword '->'`);
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

            break;
        }
    }

    return func;
}

function parse_zinc_with_type(document:Document, zinc_node: ZincNode, layer_objects: (ZincBlock | ZincSegement | ZincComment)[]) {
    const handing = <T extends NodeAst>(object: ZincBlock | ZincSegement | ZincComment, parent_node: T) => {
        if (object instanceof ZincComment) {
            const node = parse_line_comment(document, object.tokens);
            parent_node.add_node(node);
        } else if (object instanceof ZincSegement) {
            if (object.type == "break") {
                const node = parse_segement_break(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "return") {
                const node = parse_line_return(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "type") {
                const node = parse_line_type(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "call") {
                const node = parse_segement_call(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "set") {
                const node = parse_segement_set(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "member") {
                const node = parse_segement_member(document, object.tokens);
                if (Array.isArray(node)) {
                    node.forEach(x => parent_node.add_node(x));
                } else {
                    parent_node.add_node(node);
                }
            } else if (object.type == "method") {
                
            } else if (object.type == "other") {
                
            }
        } else if (object instanceof ZincBlock) {
            let node:any|null = null;
            if (object.type == "library") {
                node = parse_block_library(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "struct") {
                node = parse_block_struct(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "interface") {
                node = parse_block_interface(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "func") {
                node = parse_block_function(document, object.tokens);
                parent_node.add_node(node);
            }
            if (node) {
                object.children.forEach(child => {
                    handing(child, node);
                });
            }
        }
    };
    layer_objects.forEach(object => {
        handing(object, zinc_node);
    });
}

export function parse_zinc(document:Document, tokens:Token[]) {
    const zinc_node = new ZincNode(document);

    const layer_objects = zinc_slice_layer(tokens);
    
    traverse_and_confirm_zinc_type(layer_objects);
    
    parse_zinc_with_type(document, zinc_node, layer_objects);

    
    return zinc_node;
}

