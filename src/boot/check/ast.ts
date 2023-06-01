import { Document, JassError, Position, Range, lexically } from "./mark";

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
}
class LibraryOption {
    public in = false;

    public state = 0;

    public loc: Range = null as any;

    public readonly functionOption:FunctionOption = new FunctionOption();
}

function isSameLine(range1:Range, range2:Range) {
    return range1.end.line == range2.start.line;
}

function flow(document: Document) {
    const marks = lexically(document);



    const pushError = (message: string, range: Range) => {
        const err = new JassError(document, message, range);
        document.errors.push(err);
    }

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

    const libraryOption:LibraryOption = new LibraryOption();

    for (let index = 0; index < marks.length; index++) {
        const pre_mark = marks[index - 1];
        const mark = marks[index];
        const next_mark = marks[index + 1];
        const isEof = () => index == marks.length - 1;
        if (libraryOption.in) {
            if (isEof() && mark.value() != "endlibrary") {
                pushError("Incomplete 'library'!", libraryOption.loc);
            }
            else if (mark.value() == "endlibrary") {
                if (pre_mark && isSameLine(mark.loc, pre_mark.loc)) {
                    pushError("Please mark 'endlibrary' on the new line!", mark.loc);
                }
                libraryOption.in = false;
                libraryOption.state = 0;
                libraryOption.loc = null as any;
            }
            else if (libraryOption.state == 1) {
                if (mark.isId()) {
                    libraryOption.state = 2;
                    if (!next_mark || !isSameLine(mark.loc, next_mark.loc)) {
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
                        if (!next_mark || !isSameLine(mark.loc, next_mark.loc)) {
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
                        if (isSameLine(mark.loc, next_mark.loc)) {
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
            else if (libraryOption.state == 7) { // library内部
                
            }
        } else if (mark.value() == "library") {
            if (libraryOption.in) {
                pushError("Missing 'endlibrary'!", libraryOption.loc);
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
