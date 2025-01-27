import { Document, Token } from "./tokenizer-common";
import { NodeAst, ZincNode, parse_line_comment } from "./parser-vjass";

namespace zinc {

}

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

function parse_zinc_object(document:Document, zinc_object:ZincBlock|ZincSegement|ZincComment) {
    if (zinc_object instanceof ZincComment) {
        zinc_object.data = parse_line_comment(document, zinc_object.tokens);
    } else if (zinc_object instanceof ZincSegement) {

    }
    const obj = new NodeAst(document);

    return obj;
}


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
        if (is_start_with(zinc_object.tokens, "return")) {
            zinc_object.type = "return";
        } else if (is_start_with(zinc_object.tokens, "method", ["public", "private"])) {
            zinc_object.type = "method";
        } else if (is_start_with(zinc_object.tokens, "break")) {
            zinc_object.type = "break";
        } else if (is_start_with(zinc_object.tokens, "type")) {
            zinc_object.type = "type";
        } else if (is_start_with(zinc_object.tokens, [(token, index, tokens) => token.is_identifier, (token, index, tokens) => token.is_identifier])) {
            zinc_object.type = "member";
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
        } else if (is_start_with(zinc_object.tokens, [(token) => token.is_identifier, (token, index, tokens) => {
            if (token.getText() == "(") {
                return true;
            } else {
                return tokens.slice(index).some(t => t.getText() == "=");
            }
        }])) {
            zinc_object.type = "set";
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

    public type: "set" | "call" | "return" | "other" | "member" | "method" | "break" | "elseif" | "else" | "type" = "other";

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



export function parse_zinc(document:Document, tokens:Token[]) {
    const zinc_node = new ZincNode(document);

    const layer_objects = zinc_slice_layer(tokens);
    
    traverse_and_confirm_zinc_type(layer_objects);
    
console.log(layer_objects);

    
    return zinc_node;
}

