import { Document, Token } from "./tokenizer-common";
import { LibraryRequire, NodeAst, Returns, Statement, Take, Takes, Value, ZincNode, parse_library, parse_line_call, parse_line_comment, parse_line_expr, parse_line_index_expr, parse_line_modifier, parse_line_name_reference, parse_line_return, parse_line_statement, parse_line_type, zinc } from "./parser-vjass";
import { Position, Range } from "./loc";



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
        } else if (
            is_start_with(zinc_object.tokens, ["private", "struct"])
            || is_start_with(zinc_object.tokens, ["public", "struct"])
            || is_start_with(zinc_object.tokens, "struct")
        ) {
            zinc_object.type = "struct";
        } else if (
            is_start_with(zinc_object.tokens, ["private", "interface"])
            || is_start_with(zinc_object.tokens, ["public", "interface"])
            || is_start_with(zinc_object.tokens, "interface")
        ) {
            zinc_object.type = "interface";
        } else if (
            is_start_with(zinc_object.tokens, ["private", "static", "method", "operator"])
            || is_start_with(zinc_object.tokens, ["public", "static", "method", "operator"])
            || is_start_with(zinc_object.tokens, ["private", "method", "operator"])
            || is_start_with(zinc_object.tokens, ["public", "method", "operator"])
            || is_start_with(zinc_object.tokens, ["method", "operator"])
        ) {
            zinc_object.type = "operator";
        } else if (
            is_start_with(zinc_object.tokens, ["private", "static", "method"])
            || is_start_with(zinc_object.tokens, ["public", "static", "method"])
            || is_start_with(zinc_object.tokens, ["private", "method"])
            || is_start_with(zinc_object.tokens, ["public", "method"])
            || is_start_with(zinc_object.tokens, "method")
        ) {
            zinc_object.type = "method";
        } else if (
            is_start_with(zinc_object.tokens, ["private", "function"])
            || is_start_with(zinc_object.tokens, ["public", "function"])
            || is_start_with(zinc_object.tokens, "function")
        ) {
            zinc_object.type = "func";
        } else if (is_start_with(zinc_object.tokens, "if")) {
            zinc_object.type = "if";
        } else if (is_start_with(zinc_object.tokens, ["static", "if"])) {
            zinc_object.type = "staticif";
        } else if (is_start_with(zinc_object.tokens, ["else", "if"])) {
            zinc_object.type = "elseif";
        } else if (is_start_with(zinc_object.tokens, "else")) {
            zinc_object.type = "else";
        } else if (is_start_with(zinc_object.tokens, "while")) {
            zinc_object.type = "while";
        } else if (is_start_with(zinc_object.tokens, "for")) {
            zinc_object.type = "for";
        } else if (is_start_with(zinc_object.tokens, "private")) {
            zinc_object.type = "private";
        } else if (is_start_with(zinc_object.tokens, "public")) {
            zinc_object.type = "public";
        } else if (is_start_with(zinc_object.tokens, "debug")) {
            zinc_object.type = "debug";
        } else {
            zinc_object.type = "other"
        }
    } else if (zinc_object instanceof ZincSegement) {
        const menber_conditions = () => {
            return [(token:Token) => token.is_identifier, (token:Token) => token.is_identifier];
        }
        if (is_start_with(zinc_object.tokens, "return")) {
            zinc_object.type = "return";
        } else if (
            is_start_with(zinc_object.tokens, ["private", "method"])
            || is_start_with(zinc_object.tokens, ["static", "method"])
            || is_start_with(zinc_object.tokens, ["private", "static", "method"])
            || is_start_with(zinc_object.tokens, ["public", "method"])
            || is_start_with(zinc_object.tokens, ["public", "static", "method"])
            || is_start_with(zinc_object.tokens, "method")
        ) {
            zinc_object.type = "method";
        } else if (is_start_with(zinc_object.tokens, "break")) {
            zinc_object.type = "break";
        } else if (is_start_with(zinc_object.tokens, "if")) {
            zinc_object.type = "if";
        } else if (is_start_with(zinc_object.tokens, ["else", "if"])) {
            zinc_object.type = "elseif";
        } else if (is_start_with(zinc_object.tokens, "else")) {
            zinc_object.type = "else";
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
 * 确认每个zinc block 和 segement 类型，供后面解析
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
    /**
     * 保存解析出来的NodeAst对象
     */
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

    public type: "library" | "struct" | "interface" | "method" | "func" | "if" | "elseif" | "else" | "for" | "while" | "debug" | "private" | "public" | "staticif" | "operator" | "other" = "other";

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

    public type: "set" | "call" | "return" | "other" | "member" | "method" | "break" | "type" | "if" | "elseif" | "else" = "other";

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
    let bluct:number = 0;
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
        bluct = 0;
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
            } else if (text == ";" && bluct == 0) {
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
                if (text == "(") {
                    bluct++;
                } else if (text == ")" && bluct > 0) {
                    bluct--;
                }
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
                if (next_token.is_asignment_operator) {
                    state = 2;
                } else {
                    document.add_token_error(token, `assignment symbol  not found`);
                    break;
                }
            } else {
                document.add_token_error(token, `assignment symbol  not found`);
                break;
            }
        } else if (state == 2) { // = += -= *= /=
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
export function parse_segement_statement(document: Document, tokens: Token[], offset_index: number, need_index_expr:0|1|-1 = -1) {
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
                    state = 2;
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
                if (tokens[index].is_asignment_operator) {
                    state = 4;
                } else if (tokens[index].getText() == ",") {
                    break;
                } else if (tokens[index].getText() == "[") {
                    state = 3;
                } else {
                    document.add_token_error(tokens[index], `expected token to be assigned a value of '=', but found '${text}'`);
                    break;
                }
            } else {
                break;
            }
        } else if (state == 3) {
            const result = parse_line_index_expr(document, tokens, index, need_index_expr);
            index = result.index;
            statement.size_expr = result.expr;
            
            statement.is_array = true;

            // if (tokens[index]) {
            //     if (tokens[index].is_identifier) {
            //         state = 2;
            //     } else {
            //         document.add_token_error(tokens[index], `wrong identifier name`);
            //         break;
            //     }
            // } else {
            //     document.add_token_error(token, `name not declared`);
            //     break;
            // }
            if (tokens[index]) {
                if (tokens[index].getText() == ",") {
                    break;
                }
            }
            state = 6;
        } else if (state == 4) {
            index++;

            if (tokens[index]) {
                if (tokens[index].getText() == ",") {
                    document.add_token_error(token, `initialization expression not found`);
                    break;
                } else {
                    state = 5;
                }
            } else {
                document.add_token_error(token, `initialization expression not found`);
                break;
            }
        } else if (state == 5) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            statement.expr = result.expr;

            break;
        } else if (state == 6) {
            index++;

            document.add_token_error(token, `error statement array expression token '${token.getText()}'`);

            if (tokens[index]) {
                if (tokens[index].getText() == ",") {
                    break;
                }
            }
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
                if (tokens[index].is_asignment_operator) {
                    state = 4;
                } else if (tokens[index].getText() == ",") {
                    break;
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
                if (tokens[index].getText() == ",") {
                    document.add_token_error(token, `initialization expression not found`);
                    break;
                } else {
                    state = 5;
                }
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
            other_member.start_token = result.expr.name;
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
    let index = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;
            if (text == "interface") {
                inter.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `interface name is undefined`);
                    break;
                }
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
            index++;
            if (token.is_identifier) {
                inter.name = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "extends") {
                        state = 3;
                    } else if (next_token_text == "[") {
                        state = 7;
                    } else if (next_token_text == "[]") {
                        state = 10;
                    } else {
                        state = 6;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal interface identifier '${text}'`);
                break;
            }
        } else if (state == 2) {
            index++;
            if (text == "interface") {
                inter.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `interface name is undefined`);
                    break;
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            index++;
  
            
            if (!inter.extends) {
                inter.extends = [];
            }

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 4;
            } else {
                document.add_token_error(token, `interface name without inheritance`);
                break;
            }
        } else if (state == 4) {
            index++;
            if (token.is_identifier) {
                inter.extends!.push(token);
                
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.getText() == ",") {
                        state = 5;
                    } else {
                        state = 6;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `inheriting illegal interface identifiers '${text}'`);
                break;
            }
        } else if (state == 5) {
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 4;
            } else {
                document.add_token_error(token, `interface name without inheritance`);
                break;
            }
        } else if (state == 6) {
            index++;
            document.add_token_error(token, `error interface token '${text}'`);
            break;
        } else if (state == 7) { // [size] ===>  '['
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "]") {
                    // 赋值一个为null的Value对象表示不声明的结构数组
                    inter.index_expr = new Value();
                    state = 9;
                } else {
                    state = 8;
                }
            } else {
                document.add_token_error(token, `no available definition for interface size`);
                break;
            }
        } else if (state == 8) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            inter.index_expr = result.expr;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "]") {
                    state = 9;
                } else {
                    document.add_token_error(token, `missing token ']'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing token ']'`);
                break;
            }
        } else if (state == 9) { // [size] ===>  ']'
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "extends") {
                    state = 3;
                } else {
                    state = 6;
                }
            } else {
                break;
            }
        } else if (state == 10) {
            index++;

            // 赋值一个为null的Value对象表示不声明的结构数组
            inter.index_expr = new Value();

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "extends") {
                    state = 3;
                } else {
                    state = 6;
                }
            } else {
                break;
            }
        }

        
    }

    return inter;
}
export function parse_block_struct(document: Document, tokens: Token[]) {
    const struct = new zinc.Struct(document);

    let state = 0;
    let index = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;
            if (text == "struct") {
                struct.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `struct name is undefined`);
                    break;
                }
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
            index++;
            if (token.is_identifier) {
                struct.name = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "extends") {
                        state = 3;
                    } else if (next_token_text == "[") {
                        state = 7;
                    } else if (next_token_text == "[]") {
                        state = 10;
                    } else {
                        state = 6;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal struct identifier '${text}'`);
                break;
            }
        } else if (state == 2) {
            index++;
            if (text == "struct") {
                struct.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `struct name is undefined`);
                    break;
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            index++;
  
            
            if (!struct.extends) {
                struct.extends = [];
            }

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 4;
            } else {
                document.add_token_error(token, `struct name without inheritance`);
                break;
            }
        } else if (state == 4) {
            index++;
            if (token.is_identifier) {
                struct.extends!.push(token);
                
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.getText() == ",") {
                        state = 5;
                    } else {
                        state = 6;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `inheriting illegal struct identifiers '${text}'`);
                break;
            }
        } else if (state == 5) {
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 4;
            } else {
                document.add_token_error(token, `struct name without inheritance`);
                break;
            }
        } else if (state == 6) {
            index++;
            document.add_token_error(token, `error struct token '${text}'`);
            break;
        } else if (state == 7) { // [size] ===>  '['
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "]") {
                    // 赋值一个为null的Value对象表示不声明的结构数组
                    struct.index_expr = new Value();
                    state = 9;
                } else {
                    state = 8;
                }
            } else {
                document.add_token_error(token, `no available definition for struct size`);
                break;
            }
        } else if (state == 8) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            struct.index_expr = result.expr;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "]") {
                    state = 9;
                } else {
                    document.add_token_error(token, `missing token ']'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing token ']'`);
                break;
            }
        } else if (state == 9) { // [size] ===>  ']'
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "extends") {
                    state = 3;
                } else {
                    state = 6;
                }
            } else {
                break;
            }
        } else if (state == 10) {
            index++;

            // 赋值一个为null的Value对象表示不声明的结构数组
            struct.index_expr = new Value();

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "extends") {
                    state = 3;
                } else {
                    state = 6;
                }
            } else {
                break;
            }
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
                } else if (next_token_text == "=") {
                    state = 6;
                } else {
                    document.add_token_error(next_token, `missing keyword '->'`);
                    break;
                }
            } else {
                // 可以省略返回值声明
                break;
            }
        } else if (state == 4) {
            const result = parse_line_returns(document, tokens, index);
            index = result.index;
            func.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "=") {
                    state = 6;
                } else {
                    state = 5;
                }
            } else {
                // 可以省略返回值声明
                break;
            }
        } else if (state == 5) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        } else if (state == 6) { // defaults
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 7;
            } else {
                document.add_token_error(token, `missing defaults value`);
                break;
            }
        } else if (state == 7) { // defaults
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            func.defaults = result.expr;

            state = 5;
        }
    }

    return func as zinc.Func;
}

export function parse_block_method(document: Document, tokens: Token[], type: "function" | "method" = "function") {
    return parse_block_function(document, tokens, "method") as zinc.Method;
}

export function parse_block_if(document: Document, tokens: Token[]) {
    const ifs = new zinc.If(document);

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
                    if (next_token_text == "(") {
                        state = 1;
                    } else {
                        document.add_token_error(next_token, `error if expression`);
                        break;
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
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    document.add_token_error(next_token, `if expression missing condition`);
                    state = 3;
                } else {
                    state = 2;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 2) {
            const result = parse_line_expr(document, tokens, index);
            ifs.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    state = 3;
                } else {
                    document.add_token_error(next_token, `error if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 3) {
            index++;

            state = 4;
        } else if (state == 4) {
            index++;
            document.add_token_error(token, `error if token '${text}'`);
            break;
        }

    }

    return ifs;
}
export function parse_block_static_if(document: Document, tokens: Token[]) {
    const ifs = new zinc.StaticIf(document);

    let state = -1;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == -1) {
            index++;
            if (text == "static") {
                ifs.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "if") {
                        state = 0;
                    } else {
                        document.add_token_error(next_token, `error if expression`);
                        break;
                    }
                } else {
                    document.add_token_error(token, `error if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'static'`);
                break;
            }
        } else if (state == 0) {
            index++;
            if (text == "if") {

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "(") {
                        state = 1;
                    } else {
                        document.add_token_error(next_token, `error if expression`);
                        break;
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
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    document.add_token_error(next_token, `if expression missing condition`);
                    state = 3;
                } else {
                    state = 2;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 2) {
            const result = parse_line_expr(document, tokens, index);
            ifs.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    state = 3;
                } else {
                    document.add_token_error(next_token, `error if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 3) {
            index++;

            state = 4;
        } else if (state == 4) {
            index++;
            document.add_token_error(token, `error if token '${text}'`);
            break;
        }

    }

    return ifs;
}
export function parse_block_else(document: Document, tokens: Token[]) {
    const elses = new zinc.Else(document);

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
                elses.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `missing keyword 'else'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error else token '${text}'`);
            break;
        }
    }

    return elses;
}
export function parse_block_else_if(document: Document, tokens: Token[]) {
    const elseifs = new zinc.ElseIf(document);

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
                elseifs.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "if") {
                        state = 1;
                    } else {
                        document.add_token_error(next_token, `missing keyword 'if'`);
                        break;
                    }
                } else {
                    document.add_token_error(token, `error else if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'else'`);
                break;
            }
        } else if (state == 1) {
            index++;
            if (text == "if") {

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "(") {
                        state = 2;
                    } else {
                        document.add_token_error(next_token, `error else if expression`);
                        break;
                    }
                } else {
                    document.add_token_error(token, `error else if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'if'`);
                break;
            }
        } else if (state == 2) {
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    document.add_token_error(next_token, `else if expression missing condition`);
                    state = 4;
                } else {
                    state = 3;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 3) {
            const result = parse_line_expr(document, tokens, index);
            elseifs.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    state = 4;
                } else {
                    document.add_token_error(next_token, `error else if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 4) {
            index++;

            state = 5;
        } else if (state == 5) {
            index++;
            document.add_token_error(token, `error else if token '${text}'`);
            break;
        }

    }

    return elseifs;
}
export function parse_block_while(document: Document, tokens: Token[]) {
    const whiles = new zinc.While(document);

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
            if (text == "while") {
                whiles.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "(") {
                        state = 1;
                    } else {
                        document.add_token_error(next_token, `error while expression`);
                        break;
                    }
                } else {
                    document.add_token_error(token, `error while expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'while'`);
                break;
            }
        } else if (state == 1) {
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    document.add_token_error(next_token, `while expression missing condition`);
                    state = 3;
                } else {
                    state = 2;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 2) {
            const result = parse_line_expr(document, tokens, index);
            whiles.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    state = 3;
                } else {
                    document.add_token_error(next_token, `error while expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 3) {
            index++;

            state = 4;
        } else if (state == 4) {
            index++;
            document.add_token_error(token, `error while token '${text}'`);
            break;
        }

    }

    return whiles;
}
export function parse_block_for(document: Document, tokens: Token[]) {
    let fors:zinc.For|zinc.CFor = new zinc.For(document);

    let state = 0;
    let index = 0;
    const for_tokens:Token[] = [];
    let for_start_index:number = -1, for_end_index:number = 0, deep = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "for") {
                fors.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "(") {
                        state = 1;
                    } else {
                        document.add_token_error(next_token, `error for expression`);
                        break;
                    }
                } else {
                    document.add_token_error(token, `error for expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'for'`);
                break;
            }
        } else if (state == 1) {
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == ")") {
                    document.add_token_error(next_token, `for expression missing condition`);
                    state = 3;
                } else {
                    state = 2;
                }
            } else {
                document.add_token_error(token, `missing ')' token`);
                break;
            }
        } else if (state == 2) {
            index++;
            if (text == "(") {
                deep++;
            } else if (text == ")" && deep == 0) {
                deep--;
            }
            for_tokens.push(token);
            if (deep == 0) {
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == ")") {
                        state = 3;
                    }
                }
            }
        } else if (state == 3) {
            index++;

            state = 4;
        } else if (state == 4) {
            index++;
            document.add_token_error(token, `error for token '${text}'`);
            break;
        }

    }

    if (for_tokens.length == 0) {
        document.add_token_error(fors.start_token!, `for expression missing condition`);
    } else {
        // const objects: NodeAst[] = parse_zinc(document, for_tokens).children;
        const layers = zinc_slice_layer(for_tokens).filter(x => {
            if (x instanceof ZincSegement) {
                return true;
            } else if (x instanceof ZincComment){
                return false;
            } else {
                document.add_token_error(fors.start_token!, `for expression unsupport block expression`);
                return false;
            }
        }) as ZincSegement[];
        // traverse_and_confirm_zinc_type(layers);
        
        if (layers.length == 0) {
            document.add_token_error(fors.start_token!, `for expression missing condition`);
        } else if (layers.length == 1) {
            const zoom = parse_line_expr(document, layers[0].tokens, 0).expr;
            fors.expr = zoom;
        } else if (layers.length == 3) {
            const statement1 = parse_segement_set(document, layers[0].tokens);
            const expr2 = parse_line_expr(document, layers[1].tokens, 0).expr;
            const statement3 = parse_segement_set(document, layers[2].tokens);

            (fors as zinc.CFor).expr = expr2;
            (fors as zinc.CFor).init_statement = statement1;
            (fors as zinc.CFor).inc_statement = statement3;

            fors = Object.assign(new zinc.CFor(document), fors);
        } else {
            document.add_token_error(fors.start_token!, `for condition expression is error`);
        }
    }

    return fors;
}

export function parse_block_private(document: Document, tokens: Token[]) {
    const privates = new zinc.Private(document);

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
            if (text == "private") {
                privates.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `missing keyword 'private'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error private token '${text}'`);
            break;
        }

    }

    return privates;
}
export function parse_block_public(document: Document, tokens: Token[]) {
    const publics = new zinc.Public(document);

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
            if (text == "public") {
                publics.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `missing keyword 'public'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error public token '${text}'`);
            break;
        }

    }

    return publics;
}
export function parse_block_debug(document: Document, tokens: Token[]) {
    const debug = new zinc.Debug(document);

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
            if (text == "debug") {
                debug.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `missing keyword 'debug'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error debug token '${text}'`);
            break;
        }

    }

    return debug;
}

function parse_zinc_with_type(document:Document, zinc_node: ZincNode, layer_objects: (ZincBlock | ZincSegement | ZincComment)[]) {
    const handing = <T extends NodeAst>(object: ZincBlock | ZincSegement | ZincComment, parent_node: T) => {
        if (object instanceof ZincComment) {
            const node = parse_line_comment(document, object.tokens);
            parent_node.add_node(node);
            node.end_token = node.start_token;
        } else if (object instanceof ZincSegement) {
            if (object.type == "break") {
                const node = parse_segement_break(document, object.tokens);
                parent_node.add_node(node);
                node.end_token = object.end_token;
            } else if (object.type == "return") {
                const node = parse_line_return(document, object.tokens);
                parent_node.add_node(node);
                node.end_token = object.end_token;
            } else if (object.type == "type") {
                const node = parse_line_type(document, object.tokens);
                parent_node.add_node(node);
                node.end_token = object.end_token;
            } else if (object.type == "call") {
                const node = parse_segement_call(document, object.tokens);
                parent_node.add_node(node);
                node.end_token = object.end_token;
            } else if (object.type == "set") {
                const node = parse_segement_set(document, object.tokens);
                parent_node.add_node(node);
                node.end_token = object.end_token;
            } else if (object.type == "member") {
                const node = parse_segement_member(document, object.tokens);
                if (Array.isArray(node)) {
                    node.forEach(x => {
                        parent_node.add_node(x);
                        x.end_token = object.end_token;
                    });
                } else {
                    parent_node.add_node(node);
                    node.end_token = object.end_token;
                }
            } else if (object.type == "method") {
                const node = parse_block_method(document, object.tokens);
                parent_node.add_node(node);
                node.end_token = object.end_token;
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
            } else if (object.type == "method") {
                node = parse_block_method(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "staticif") {
                node = parse_block_static_if(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "if") {
                node = parse_block_if(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "elseif") {
                node = parse_block_else_if(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "else") {
                node = parse_block_else(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "for") {
                node = parse_block_for(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "while") {
                node = parse_block_while(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "private") {
                node = parse_block_private(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "public") {
                node = parse_block_public(document, object.tokens);
                parent_node.add_node(node);
            } else if (object.type == "debug") {
                node = parse_block_debug(document, object.tokens);
                parent_node.add_node(node);
            }
            if (node) {
                node.end_token = object.end_token;
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

