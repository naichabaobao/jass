import * as fs from "fs";
import { preprocessing } from "./preproces";
import { Document, TextLine, Token, TokenType, tokenize } from "./tokenizer-common";
import { tokenize_for_vjass } from "./tokenizer-vjass";
import { RunTextMacro, TextMacro, parse_import, parse_runtextmacro, parse_textmacro } from "./textmacro";

export class Context {
    private keys:string[] = [];
    private documents:Document[] = [];
    private handle_key(key:string):string {
        const handle_key = key.replace(/\\+/g, "/");
        return handle_key;
    }
    public set(key: string, value:Document) {
        const handle_key = this.handle_key(key);
        const index = this.keys.indexOf(handle_key);
        if (index == -1) {
            this.keys.push(handle_key);
            this.documents.push(value);
        }
    }
    private indexOf(key: string):number {
        return this.keys.indexOf( this.handle_key(key));
    }
    public has(key: string):boolean {
        return this.indexOf(key) != -1;
    }

    public get(key: string):Document|undefined {
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



//#region

class ExpendLineText {
    document:Document;
    line: number;
    run_text_macro?:RunTextMacro;
    text_macro?:TextMacro;

    constructor(document:Document, line: number, run_text_macro?:RunTextMacro, text_macro?:TextMacro) {
        this.document = document;
        this.line = line;
        this.run_text_macro = run_text_macro;
        this.text_macro = text_macro;
    }

    public text_line():TextLine {
        if (this.run_text_macro && this.text_macro) {
            return this.text_macro.lineAt(this.line, this.run_text_macro.param_values());
        } else {
            return this.document.lineAt(this.line);
        }
    }
    public tokens():Token[] {
        if (this.run_text_macro && this.text_macro) {
            return this.text_macro.lineTokens(this.line, this.run_text_macro.param_values());
        } else {
            return this.document.lineTokens(this.line);
        }
    }
}

type NodeType = "zinc"|"library"|"struct"|"interface"|"method"|"func"|"globals"|"scope"|"if"|"loop"|null;
export class Node {
    public type: NodeType;
    public parent:Node|null = null;
    public body:ExpendLineText[] = [];
    public start_line:ExpendLineText|null = null;
    public end_line:ExpendLineText|null = null;

    public readonly children:Node[] = [];

    constructor(type: NodeType) {
        this.type = type;
    }

    pattern: Pair|null = null;
}

class Pair {
    type: NodeType;
    start: RegExp;
    end: RegExp;

    // children: Pair|null = null;

    constructor( type: NodeType, start: RegExp, end: RegExp) {
        this.type = type;
        this.start = start;
        this.end = end;
    }
}

const zincPair = new Pair("zinc", new RegExp(/^\/\/! zinc\b/), new RegExp(/^\/\/! endzinc\b/));
const globalsPair = new Pair("globals", new RegExp(/^\s*globals\b/), new RegExp(/^\s*endglobals\b/));
const funcPair = new Pair("func", new RegExp(/^\s*function\b/), new RegExp(/^\s*endfunction\b/));
const libraryPair = new Pair("library", new RegExp(/^\s*library|library_once\b/), new RegExp(/^\s*endlibrary\b/));
const scopePair = new Pair("scope", new RegExp(/^\s*scope\b/), new RegExp(/^\s*endscope\b/));
const interfacePair = new Pair("interface", new RegExp(/^\s*interface\b/), new RegExp(/^\s*endinterface\b/));
const structPair = new Pair("struct", new RegExp(/^\s*struct\b/), new RegExp(/^\s*endstruct\b/));
const methodPair = new Pair("method", new RegExp(/^\s*method\b/), new RegExp(/^\s*endmethod\b/));
const ifPair = new Pair("if", new RegExp(/^\s*if\b/), new RegExp(/^\s*endif\b/));
const loopPair = new Pair("loop", new RegExp(/^\s*loop\b/), new RegExp(/^\s*endloop\b/));

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

const slice_layer_handle = (document:Document, run_text_macro:RunTextMacro|undefined, macro:TextMacro|undefined, line:number, node_stack:Node[], root_node:Node) => {

    const last_node = () => {
        return node_stack[node_stack.length - 1];
    };
    const text_line = run_text_macro && macro ? macro.lineAt(line, run_text_macro.param_values()) : document.lineAt(line);
    const success_head = () => {
        for (let index = 0; index < pairs.length; index++) {
            const pair = pairs[index];
            if (pair.start.test(text_line.text)) {
                const node = last_node();
                const new_node = new Node(pair.type);
                new_node.start_line = new ExpendLineText(document, line, run_text_macro, macro);
                new_node.pattern = pair;
                node_stack.push(new_node);
                if (node) {
                    new_node.parent = node;
                    node.children.push(new_node);
                } else {
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
                node.end_line = new ExpendLineText(document, line, run_text_macro, macro);
                node_stack.pop(); // 闭合
            } else { // 非关键行
                node.body.push(new ExpendLineText(document, line, run_text_macro, macro));
            }
        }
        return false;
    };
    if (!success_head()) {
        success_end();
    }
}
function slice_layer(document:Document) {
    const node_stack:Node[] = [];
    const root_node = new Node(null);
        
    document.loop((document, line) => {
        slice_layer_handle(document, undefined, undefined, line, node_stack, root_node);
        
    }, (document, run_text_macro, macro, line) => {
        slice_layer_handle(document, run_text_macro, macro, line, node_stack, root_node);
    });

    document.root_node = root_node;
    
}

//#endregion

export function parse(filePath: string) {
    const content:string = fs.readFileSync(filePath, {encoding: "utf-8"});
    const document = new Document(filePath, content);
    tokenize_for_vjass(document);
    
    preprocessing(document);
    
    parse_import(document);
    parse_textmacro(document);
    parse_runtextmacro(document);
    Global.set(filePath, document);
    

    slice_layer(document);

}

