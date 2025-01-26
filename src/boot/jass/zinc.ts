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

class ZincData {
    public data: any = null;

    constructor() {
    }
}

class ZincBlock extends ZincData{
    public readonly prefix_tokens:Token[] = [];
    public start_token:Token|null = null;
    public end_token:Token|null = null;

    public parent:ZincBlock|null = null;
    children: (ZincBlock|ZincSegement|ZincComment)[] = [];

    constructor(prefix_tokens:Token[], start_token:Token|null, end_token:Token|null) {
        super();
        this.prefix_tokens = prefix_tokens;
        this.start_token = start_token;
        this.end_token = end_token;
    }
}
class ZincSegement extends ZincData {
    public readonly tokens:Token[] = [];
    public start_token:Token|null = null;
    public end_token:Token|null = null;

    public parent:ZincBlock|null = null;

    constructor(prefix_tokens:Token[], start_token:Token|null, end_token:Token|null) {
        super();
        this.tokens = prefix_tokens;
        this.start_token = start_token;
        this.end_token = end_token;
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
    
    return result;  
}



export function parse_zinc(document:Document, tokens:Token[]) {
    const zinc_node = new ZincNode(document);

    const layer_objects = zinc_slice_layer(tokens);
    
    const handing_layer = <T extends NodeAst>(node:(ZincBlock|ZincSegement|ZincComment)) => {
        // const object: T = parse_zinc_object(document, obj);
        // if (node.parent) {
        //   const parent:  NodeAst = node.parent.data;
        //   object.parent = parent;
        //   const index = node.parent.children.indexOf(node);
        //   if (index != -1) {
        //     const previous = node.parent.children[index - 1]?.data ?? null;
        //     object.previous = previous;
        //     const next = node.parent.children[index + 1]?.data ?? null;
        //     object.next = next;
        //   }
        // } else {
        //   const index = this.object_list.indexOf(node);
        //   if (index != -1) {
        //     const previous = this.object_list[index - 1]?.data ?? null;
        //     object.previous = previous;
        //     const next = this.object_list[index + 1]?.data ?? null;
        //     object.next = next;
        //   }
        // }
        // if (node instanceof Block) {
          
        //   node.children.forEach(child => {
        //     object.children.push(this.expand_node(child));
        //   });
        // }
    
        // return object;
    }

    for (let index = 0; index < layer_objects.length; index++) {
        const element = layer_objects[index];
        handing_layer(element);
    }
    
    return zinc_node;
}

