import * as fs from "fs";
import { preprocessing } from "./preproces";
import { Document, tokenize } from "./tokenizer-common";
import { tokenize_for_vjass } from "./tokenizer-vjass";
import { parse_import, parse_runtextmacro, parse_textmacro } from "./textmacro";

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

export class Node {
    public parent:Node|null = null;
    
}

function parse_handle(document:Document) {
    document.loop((document, line) => {
        console.log("func1", line, document.lineAt(line).text);
        
    }, (document, run_text_macro, macro, line) => {
        console.log("func2", line, document.lineAt(line).text, macro.line_at(line, run_text_macro.param_values()));

    })
}

export function parse(filePath: string) {
    const content:string = fs.readFileSync(filePath, {encoding: "utf-8"});
    const document = new Document(filePath, content);
    tokenize_for_vjass(document);

    preprocessing(document);

    parse_import(document);
    parse_textmacro(document);
    parse_runtextmacro(document);

    Global.set(filePath, document);
    
    parse_handle(document);

}

