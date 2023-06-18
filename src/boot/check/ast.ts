import { Document, JassError, Mark, Position, Range, lexically } from "./mark";

enum ASTState {
    Default
}



class GlobalsOption {
    public in = false;

    public state = 0;
}
class FunctionOption {
    public in = false;

    public state = 0;

    public loc: Range = null as any;

    public reset() {
        this.in = false;
        this.state = 0;
        this.loc = null as any;
    }
}
class LibraryOption {
    public in = false;

    public state = 0;

    public loc: Range = null as any;

    public readonly functionOption:FunctionOption = new FunctionOption();

    public reset() {
        this.in = false;
        this.state = 0;
        this.loc = null as any;
    }
}

function isSameLine(range1:Range, range2:Range) {
    return range1.end.line == range2.start.line;
}

class Expr {

    private state:number = 0;
    private errors: JassError[] = [];

    public constructor(marks:Mark[]) {
        for (let index = 0; index < marks.length; index++) {
            const mark = marks[index];
            const next_mark = marks[index + 1];
            const document = mark.doc;
            const pushError = (message: string, range: Range) => {
                const err = new JassError(document, message, range);
                document.errors.push(err);
            }
            // value 1, op 2
            const isOp = (m: Mark) => {
                return (m.isOp() && (m.value() == "+" || m.value() == "-" || m.value() == "*" || m.value() == "/" || m.value() == "==")) || (m.isId() && (m.value() == "or" || m.value() == "and"));
            };
            if (this.state == 0) {
                if (isOp(mark)) {
                    if (next_mark) {
                        if (next_mark.isValue()) {
                            this.state = 1;
                        } else {
                            pushError("error expression!", mark.loc);
                            return;
                        }
                    } else {
                        pushError("error expression!", mark.loc);
                        return;
                    }
                }
                if (mark.isValue()) {
                    if (next_mark) {
                        if (next_mark.isOp()) {
                            if (next_mark.value() == "+" || next_mark.value() == "-" || next_mark.value() == "*" || next_mark.value() == "/" || next_mark.value() == "==") {
                                this.state = 1;
                            } else {
                                pushError("error expression!", mark.loc);
                                return;
                            }
                        }
                    } else {
                        return;
                    }
                }
                else if (mark.isOp()) {
                    if (next_mark && next_mark.isValue()) {
                        this.state = 0;
                    } else {
                        pushError("error expression!", mark.loc);
                        return;
                    }
                }
            } else if (this.state == 1) { // 前面是值 后面只能是 + - * / or and == 
                if (next_mark && next_mark.isValue()) {
                    this.state = 2;
                } else {
                    pushError("error expression!", mark.loc);
                    return;
                }
            }
        }
    }
}

/**
 * 
 * @param document 
 */
function flow(document: Document) {
    const marks = lexically(document);



    const pushError = (message: string, range: Range) => {
        const err = new JassError(document, message, range);
        document.errors.push(err);
    }
    /*
    // 不可用，会导致0x 十六进制误判
    for (let index = 0; index < marks.length; index++) {
        const mark = marks[index];
        if (mark.isId()) {
            if (/^[\d_]/.test(mark.value())) {
                pushError("Error identifier!", mark.loc);
            }
        } else if (mark.isMark()) {
            if (!/'[\da-zA-Z]{4,4}'/.test(mark.value())) {
                pushError("Error mark!", mark.loc);
            }
        }
    }
    */
    const libraryOption:LibraryOption = new LibraryOption();
    const functionOption: FunctionOption = new FunctionOption();

    for (let index = 0; index < marks.length; index++) {
        const pre_mark = marks[index - 1];
        const mark = marks[index];
        const next_mark = marks[index + 1];
        const isEof = () => index == marks.length - 1;
        // 当前跟下一个是不是同一行
        const isSameLineWithNext = () => isSameLine(mark.loc, next_mark.loc);
        // 当前跟前一个是不是同一行
        const isSameLineWithPre = () => {
            if (!pre_mark) return true;
            return isSameLine(mark.loc, pre_mark.loc);
        };
        let flowExpression:Function;
        enum ExpressionState {
            LeftBor,
            RightBor,
            Op, Value
        };
        flowExpression = (mks:Mark[]) => {
            
        };
        // 
        const flowFunction = () => {
            if (isEof() && mark.value() != "endfunction") {
                pushError("Incomplete 'function'!", functionOption.loc);
            }
            else if (mark.value() == "endfunction") {
                if (isSameLineWithPre()) {
                    pushError("Please mark 'endfunction' on the new line!", mark.loc);
                }
                functionOption.reset();
            }
            else if (functionOption.state == 1) {
                if (next_mark) {
                    if (next_mark.isId() && next_mark.value() == "takes") {
                        functionOption.state = 2;
                    } else {
                        pushError("Expecting 'takes'!", next_mark.loc);
                        functionOption.state = 9;
                    }
                } else {
                    pushError("Incomplete 'function'!", mark.loc);
                    functionOption.state = 9;
                }
            }
            else if (functionOption.state == 2) {
                if (next_mark) {
                    if (next_mark.isId()) {
                        if (next_mark.value() == "nothing") {
                            functionOption.state = 8;
                        } else {
                            functionOption.state = 3;
                        }
                    } else {
                        pushError("Wrong parameter definition!", next_mark.loc);
                        functionOption.state = 9;
                    }
                } else {
                    pushError("Incomplete 'function'!", mark.loc);
                    functionOption.state = 9;
                }
            }
            else if (functionOption.state == 3) { // 参数类型
                if (next_mark) {
                    if (next_mark.isId()) {
                        functionOption.state = 4;
                    } else {
                        pushError("Wrong parameter definition!", next_mark.loc);
                        functionOption.state = 9;
                    }
                } else {
                    pushError("Incomplete 'function'!", mark.loc);
                    functionOption.state = 9;
                }
            }
            else if (functionOption.state == 4) { // 参数标识符
                if (next_mark) {
                    if (next_mark.isId() && next_mark.value() == "returns") {
                        functionOption.state = 6;
                    } else if (next_mark.isOp() && next_mark.value() == ",") {
                        functionOption.state = 5;
                    } else {
                        pushError("Wrong parameter definition!", next_mark.loc);
                        functionOption.state = 9;
                    }
                } else {
                    pushError("Incomplete 'function'!", mark.loc);
                    functionOption.state = 9;
                }
            }
            else if (functionOption.state == 5) { // 参数分隔符
                if (next_mark) {
                    if (next_mark.isId()) {
                        functionOption.state = 3;
                    } else {
                        pushError("Wrong parameter definition!", next_mark.loc);
                        functionOption.state = 9;
                    }
                } else {
                    pushError("Incomplete 'function'!", mark.loc);
                    functionOption.state = 9;
                }
            }
            else if (functionOption.state == 6) { // returns
                if (next_mark) {
                    if (next_mark.isId()) {
                        functionOption.state = 7;
                    } else {
                        pushError("Undefined return value!", next_mark.loc);
                        functionOption.state = 9;
                    }
                } else {
                    pushError("Incomplete 'function'!", mark.loc);
                    functionOption.state = 9;
                }
            }
            else if (functionOption.state == 7) { // returns type
                functionOption.state = 9;
            }
            else if (functionOption.state == 8) { // takes nothing
                if (next_mark) {
                    if (next_mark.isId() && next_mark.value() == "returns") {
                        functionOption.state = 6;
                    } else {
                        pushError("Expecting 'returns'!", next_mark.loc);
                        functionOption.state = 9;
                    }
                } else {
                    pushError("Incomplete 'function'!", mark.loc);
                    functionOption.state = 9;
                }
            }
        };
        if (libraryOption.in) {
            if (isEof() && mark.value() != "endlibrary") {
                pushError("Incomplete 'library'!", libraryOption.loc);
                if (functionOption.in) {
                    pushError("Incomplete 'function'!", functionOption.loc);
                    functionOption.reset();
                }
            }
            else if (mark.value() == "endlibrary") {
                if (pre_mark && isSameLine(mark.loc, pre_mark.loc)) {
                    pushError("Please mark 'endlibrary' on the new line!", mark.loc);
                }
                if (functionOption.in) {
                    pushError("Incomplete 'function'!", functionOption.loc);
                    functionOption.reset();
                }
                libraryOption.reset();
            }
            else if (libraryOption.state == 1) {
                if (mark.isId()) {
                    libraryOption.state = 2;
                    if (!next_mark || !isSameLineWithNext()) {
                        pushError("Expecting 'initializer', 'needs',' uses', or 'requires'!", mark.loc);
                        libraryOption.state = 7;
                    }
                } else {
                    pushError("Library unnamed!", mark.loc);
                    libraryOption.state = 7;
                }
            }
            else if (libraryOption.state == 2) {
                if (mark.isId()) {
                    if (mark.value() == "initializer") {
                        libraryOption.state = 3;
                        if (!next_mark || !isSameLineWithNext()) {
                            pushError("The library initializer needs to provide an internal function name!", mark.loc);
                            libraryOption.state = 7;
                        }
                    } else if (mark.value() == "needs" || mark.value() == "uses" || mark.value() == "requires") {
                        libraryOption.state = 5;
                    } else {
                        pushError("Expecting 'initializer', 'needs',' uses', or 'requires'!", mark.loc);
                        libraryOption.state = 7;
                    }
                } else {
                    pushError("Expecting 'initializer', 'needs',' uses', or 'requires'!", mark.loc);
                    libraryOption.state = 7;
                }
            }
            else if (libraryOption.state == 3) {
                if (mark.isId()) {
                    if (next_mark) {
                        if (isSameLineWithNext()) {
                            libraryOption.state = 4;
                        } else {
                            libraryOption.state = 7;
                        }
                    } else {
                        libraryOption.state = 7;
                    }
                } else {
                    pushError("The library initializer needs to provide an internal function name!", mark.loc);
                    libraryOption.state = 7;
                }
            }
            else if (libraryOption.state == 4) {
                if (mark.isId()) {
                    if (mark.value() == "needs" || mark.value() == "uses" || mark.value() == "requires") {
                        libraryOption.state = 5;
                        if (!next_mark || !isSameLine(mark.loc, next_mark.loc)) {
                            pushError("Missing dependent library name!", mark.loc);
                            libraryOption.state = 7;
                        }
                    } else {
                        pushError("Expecting 'needs',' uses', or 'requires'!", mark.loc);
                        libraryOption.state = 7;
                    }
                } else {
                    pushError("Expecting 'needs',' uses', or 'requires'!", mark.loc);
                    libraryOption.state = 7;
                }
            }
            else if (libraryOption.state == 5) {
                if (mark.isId()) {
                    if (!next_mark || isSameLine(mark.loc, next_mark.loc)) {
                        libraryOption.state = 6;
                    } else {
                        libraryOption.state = 7;
                    }
                } else {
                    pushError("Missing dependent library name!", mark.loc);
                    libraryOption.state = 7;
                }
            }
            else if (libraryOption.state == 6) {
                if (mark.isOp()) {
                    if (mark.value() == ",") {
                        libraryOption.state = 5;
                    }
                    if (!next_mark || !isSameLine(mark.loc, next_mark.loc)) {
                        pushError("Missing dependent library name!", mark.loc);
                        libraryOption.state = 7;
                    }
                }
            }
            else if (libraryOption.state == 7) { // library function
                if (functionOption.in) {
                    flowFunction();
                }else if (mark.value() == "function") {
                    if (functionOption.in) {
                        pushError("Missing 'endfunction'!", functionOption.loc);
                    }
                    functionOption.in = true;
                    functionOption.loc = mark.loc;
                    if (next_mark) {
                        if (!isSameLineWithNext()) {
                            pushError("Missing 'function' name!", next_mark.loc);
                            functionOption.state = 9;
                        } else if (next_mark.isId()) {
                            functionOption.state = 1;
                        } else {
                            pushError("function unnamed!", next_mark.loc);
                            functionOption.state = 9;
                        }
                    } else {
                        pushError("Incomplete 'function'!", functionOption.loc);
                    }
                }
            }
        } else if (mark.value() == "library") {
            if (libraryOption.in) {
                pushError("Missing 'endlibrary'!", libraryOption.loc);
            }
            if (functionOption.in) {
                pushError("Incomplete 'function'!", functionOption.loc);
                functionOption.reset();
            }
            libraryOption.in = true;
            libraryOption.state = 1;
            libraryOption.loc = mark.loc;
            if (next_mark) {
                if (!isSameLine(mark.loc, next_mark.loc)) {
                    pushError("Missing 'library' name!", mark.loc);
                    libraryOption.state = 7;
                }
            } else {
                pushError("Incomplete 'library'!", libraryOption.loc);
            }
            
        } else if (functionOption.in) {
            flowFunction();
        } else if (mark.value() == "function") {
            if (functionOption.in) {
                pushError("Missing 'endfunction'!", functionOption.loc);
            }
            functionOption.in = true;
            functionOption.loc = mark.loc;
            if (next_mark) {
                if (!isSameLineWithNext()) {
                    pushError("Missing 'function' name!", next_mark.loc);
                    functionOption.state = 9;
                } else if (next_mark.isId()) {
                    functionOption.state = 1;
                } else {
                    pushError("function unnamed!", next_mark.loc);
                    functionOption.state = 9;
                }
            } else {
                pushError("Incomplete 'function'!", functionOption.loc);
            } 
        }
    }
}

export {
    flow
}

if (false) {
    const document = new Document(`E:/projects/jass/static/common.j`, `
    functi
    library a56 initializer sas requires a51ss  ,fd5
    endlibrary
"aaaa"

    `);
    flow(document);

    // console.log(document)
    console.log(document.errors)
}
