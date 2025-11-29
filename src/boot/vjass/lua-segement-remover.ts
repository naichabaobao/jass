import { ErrorCollection, SimpleError } from "./simple-error";

class LuaSegementRange {
    public startIndex: number = 0;
    public endIndex: number = 0;
    public readonly chars: string[] = [];
    // 0 = <?code?> 1 = <?=code?>
    public type: 0 | 1 = 0;
    public start: { line: number, position: number };
    public end: { line: number, position: number };

    constructor(options: { startIndex?: number, type?: 0 | 1, start: { line: number, position: number }, end: { line: number, position: number } }) {
        if (options.startIndex) {
            this.startIndex = options.startIndex;
        }
        if (options.type) {
            this.type = options.type;
        }
        this.start = options.start;
        this.end = options.start;
    }

    public push(...chars: string[]) {
        this.chars.push(...chars);
        this.endIndex += chars.length;
    }
}

export function parseAndRemoveLuaSegement(content: string, errorCollection: ErrorCollection): string {
    let state = 0;
    let line: number = 0;
    let position: number = 0;
    const lsrs: LuaSegementRange[] = [];
    for (let index = 0; index < content.length; index++) {
        const char = content[index];

        if (state == 0) {
            if (char == "<" && content[index + 1] && content[index + 1] == "?") {
                if (content[index + 2] && content[index + 2] == "=") {
                    const lsr = new LuaSegementRange({
                        startIndex: index,
                        type: 1,
                        start: {
                            line, position
                        },
                        end: {
                            line, position: position + 3
                        }
                    });
                    lsr.push("<", "?", "=");
                    lsrs.push(lsr);
                    index += 2;
                    position += 2;
                    state = 2;
                } else {
                    const lsr = new LuaSegementRange({
                        startIndex: index,
                        type: 0,
                        start: {
                            line, position
                        },
                        end: {
                            line, position: position + 2
                        }
                    });
                    lsr.push("<", "?");
                    lsrs.push(lsr);
                    position++;
                    index++;
                    state = 1;
                }
            }
        } else if (state == 1 || state == 2) {
            if (char == "?" && content[index + 1] && content[index + 1] == ">") {
                index++;
                state = 0;
                lsrs[lsrs.length - 1].push("?", ">");
            } else {
                if (char == "\n") {
                    lsrs[lsrs.length - 1].end.line++;
                    lsrs[lsrs.length - 1].end.position = 0;
                } else {
                    lsrs[lsrs.length - 1].end.position++;
                }
                lsrs[lsrs.length - 1].push(char);
            }
        }

        if (char == "\n") {
            line++;
            position = 0;
        } else {
            position++;
        }
    }
    if (state == 1 || state == 2) {
        errorCollection.errors.push(new SimpleError(lsrs[lsrs.length - 1].start, lsrs[lsrs.length - 1].end, "Incorrect Lua code snippet!", `complete Lua fragment ${ lsrs[lsrs.length - 1].type == 0 ? "<? lua code ?>" : "<?= lua code ?>"}`))
    }
    const arr = content.split("");
    lsrs.forEach(lsr => {
        lsr.chars.forEach((char, index) => {
            if (lsr.type == 0) {
                if (arr[lsr.startIndex + index] == "\n") {
                    arr[lsr.startIndex + index] = "\n";
                } else {
                    arr[lsr.startIndex + index] = " ";
                }
            } else {
                if (index == 0 || index == lsr.chars.length - 1) {
                    arr[lsr.startIndex + index] = "\"";
                } else {
                    if (arr[lsr.startIndex + index] == "\n") {
                        arr[lsr.startIndex + index] = "\n";
                    } else {
                        arr[lsr.startIndex + index] = " ";
                    }
                }
            }
        });
    });

    return arr.join("");
}

if (false) {
    const err: ErrorCollection = {
        errors: [],
        warnings: []
    }
    const resultContent = parseAndRemoveLuaSegement(`
    local string name = <?=
    hashstring("")?>
    code1<? =""?>code2`, err);
    console.log(resultContent);
    
}
