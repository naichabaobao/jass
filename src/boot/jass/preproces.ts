
import { Document, Position, Range } from "./tokenizer-common";


export class Macro extends Range{
    public readonly type: string;
    public key?:string;
    public value?: string;

    constructor(type: string, start?:Position, end?:Position) {
        super(start, end);
        this.type = type;
    }
}

const DefineRegExp = /(?<type>#[a-zA-Z_$][a-zA-Z_0-9]*)(?:\s+(?<key>\b[a-zA-Z_$][a-zA-Z_0-9]*\b)(?:\s+(?<value>.+))?)?/;

/**
 * 预处理，只找出来不替换
 * @param document 
 */
export function preprocessing(document:Document) {
    // const macros:Macro[] = [];
    let last_macro:Macro|null = null;
    for (let index = 0; index < document.lineCount; index++) {
        const textLine = document.lineAt(index);
        const text = textLine.text.replace("\n", "");
        if (last_macro) {
            if (text.endsWith("\\")) {
                last_macro.value += text.slice(0, text.length - 1);
                document.macro_indexs.push({
                    line:index,
                    is_macro: true,
                    index: document.macros.length - 1
                });
            } else {
                last_macro.value += text;
                last_macro = null;

                document.macro_indexs.push({
                    line:index,
                    is_macro: false,
                    index: -1
                });
            }
        } else {
            if (text.trimStart().startsWith("#")) {
                const result = DefineRegExp.exec(text);
                if (result?.groups) {
                    const macro = new Macro(result.groups["type"], new Position(textLine.lineNumber, text.indexOf("#")), new Position(textLine.lineNumber, text.length));
                    document.macros.push(macro);
                    if (result.groups["key"]) {
                        macro.key = result.groups["key"];
                    }
                    const value = result.groups["value"];
                    if (value) {
                        if (value.endsWith("\\")) {
                            macro.value = value.slice(0, value.length - 1);
                            last_macro = macro;
                        } else {
                            macro.value = value;
                        }
                    }
                }
                document.macro_indexs.push({
                    line:index,
                    is_macro: true,
                    index: document.macros.length - 1
                });
            } else {
                document.macro_indexs.push({
                    line:index,
                    is_macro: false,
                    index: -1
                });
            }
        }
    } 
}
