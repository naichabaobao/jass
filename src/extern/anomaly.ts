import { parse, parseExpression } from "@babel/parser"
import { tokenize } from "../boot/jass/tokens";
import { Position, Range } from "../boot/jass/ast";

function parseExpressionPlus(content: string) {
    const replaceContent = content.replace(/\band\b/g, "&&").replace(/\bor\b/g, "||").replace(/\bnot\b/g, " ! ");
    
    const functionContent = replaceContent.replace(/(?<!^\s*)function\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/gm, (first, expr) => {
        return `${"".padStart(first.length, " ")}${expr}`;
    });
    
    return parseExpression(functionContent, {
        errorRecovery: true
    })
}

// 尝试性文件，旨在通过bable解析jass代码，从而找出潜在的错误，亦可能存在误判，慢慢完善

class Char {

}

class Line {
    line: number = 0;
    content: string = "";

    constructor(line: number = 0, content: string = "") {
        this.line = line;
        this.content = content;
    }


    public get end(): number {
        return this.content.length;
    }

}

class VirtualLine extends Line {
    virtualLine: number = 0;
}

class Block {
    startLine: number = 0;
    endLine: number = 0;

    contents: Line[] = [];


}

class MultiLine {
    line: number = 0;
    reference: Block = new Block();
}

function toLines(content: string): Line[] {
    let lineNumber: number = 0;
    let position: number = 0;

    let lines: Line[] = [];
    let line = new Line();
    for (let index = 0; index < content.length; index++) {
        const char = content.charAt(index);

        line.content += char;

        if (char == "\n") {
            lineNumber++;
            position = 0;

            lines.push(line);

            line = new Line();
            line.line = lineNumber;
        } else {
            position++;
        }
    }
    if (line.content.length > 0) {
        lines.push(line);
    }

    return lines;
}
/*
function prehandleTextMacro(content: string): {
    textMacros: Array<TextMacro>,
    Lines: Array<ReplaceableLine>
} {
    const textMacros: TextMacro[] = [];
    let textMacro: TextMacro | null = null;
    const texts = Lines.map(textLine => new ReplaceableLine(context, textLine)).filter((Line) => {
        const replaceText = Line.replaceText();
        if (/^\s*\/\/!\s+textmacro\b/.test(replaceText)) {
            textMacro = new TextMacro()
            textMacro.from(Line.loc);
            parseTextMacro(replaceText, textMacro);
            textMacros.push(textMacro);
            return false;
        } else if (/\/\/!\s+endtextmacro\b/.test(replaceText)) {
            if (textMacro) {
                textMacro.end = Line.loc.end;
            }
            textMacro = null;
            return false;
        } else if (textMacro) {
            textMacro.push(Line);
            textMacro.end = Line.loc.end;
            return false;
        }
        return true;
    });
    return {
        textMacros: textMacros,
        Lines: texts
    };
}*/

class TextMacro {
    startLine: number = 0;
    endLine: number = 0;

    public readonly lines: Line[] = [];
    private name: string;
    public takes: string[];

    hasCloseTag: boolean = false;

    constructor(name: string = "", takes: string[] = []) {
        this.name = name;
        this.takes = takes;
    }

    public getName(): string {
        return this.name;
    }
    public setName(name: string) {
        this.name = name;
    }

    public push(lineText: Line) {
        this.lines.push(lineText);
    }

    public remove(lineNumber: number) {
        for (let index = 0; index < this.lines.length; index++) {
            const lineText = this.lines[index];
            if (lineText.line == lineNumber) {
                this.lines.splice(index, 1);
                break;
            }
        }
    }

    public addTake(take: string) {
        this.takes.push(take);
    }

}

function parseTextMacro(text: string, textMacro: TextMacro) {
    text = text.replace(/\/\/!/, "   ");
    const tokens = tokenize(text);
    if (tokens[0].isId() && tokens[0].value == "textmacro") {
        if (tokens[1].isId()) {
            textMacro.setName(tokens[1].value)
            if (tokens[2].isId() && tokens[2].value == "takes") {
                let state = 0;
                for (let index = 3; index < tokens.length; index++) {
                    const token = tokens[index];
                    if (state == 0) {
                        if (token.isId()) {
                            textMacro.addTake(token.value)
                            state = 1;
                        } else break;
                    } else if (state == 1) {
                        if (token.isOp() && token.value == ",") {
                            state = 0;
                        } else break;
                    }
                }
            }
        }
    }
}



function findTextMacroBlocks(block: Block) {
    const textMacros: TextMacro[] = [];
    let textMacro: TextMacro | null = null;
    const texts = block.contents.filter((line) => {
        const text = line.content;
        if (/^\s*\/\/!\s+textmacro\b/.test(text)) {
            textMacro = new TextMacro()
            textMacro.startLine = line.line;

            if (textMacro == null) {
                textMacro = new TextMacro();
                parseTextMacro(text, textMacro);
            }

            return new Line(line.line, "\n");
        } else if (/\/\/!\s+endtextmacro\b/.test(text)) {
            if (textMacro) {
                textMacro.endLine = line.line;
                textMacro.hasCloseTag = true;
            }
            textMacro = null;
            return new Line(line.line, "\n");
        } else if (textMacro) {
            textMacro.push(line);
            textMacro.endLine = line.line;
            return new Line(line.line, "\n");
        }
        return line;
    });

    return {
        texts,
        blocks: textMacros
    }
}
class Zinc extends Block {
    hasCloseTag: boolean = false;

    public push(lineText: Line) {
        this.contents.push(lineText);
    }

    public remove(lineNumber: number) {
        for (let index = 0; index < this.contents.length; index++) {
            const lineText = this.contents[index];
            if (lineText.line == lineNumber) {
                this.contents.splice(index, 1);
                break;
            }
        }
    }
}
function findZincBlocks(block: Block) {
    const zincBlcoks: Zinc[] = [];
    let zincBlock: Zinc | null = null;
    const texts = block.contents.map((line) => {
        const text = line.content;
        if (/^\s*\/\/!\s+zinc\b/.test(text)) {
            zincBlock = new Zinc()
            zincBlock.startLine = line.line;

            return new Line(line.line, "\n");
        } else if (/\/\/!\s+endzinc\b/.test(text)) {
            if (zincBlock) {
                zincBlock.endLine = line.line;
                zincBlock.hasCloseTag = true;
            }
            zincBlock = null;
            return new Line(line.line, "\n");
        } else if (zincBlock) {
            zincBlock.push(line);
            zincBlock.endLine = line.line;
            return new Line(line.line, "\n");
        }
        return line;
    });

    return {
        texts,
        blocks: zincBlcoks
    }
}
enum DiagnosticSeverity {

    /**
     * Something not allowed by the rules of a language or other means.
     */
    Error = 0,

    /**
     * Something suspicious but allowed.
     */
    Warning = 1,

    /**
     * Something to inform about but not a problem.
     */
    Information = 2,

    /**
     * Something to hint to a better way of doing it, like proposing
     * a refactoring.
     */
    Hint = 3
}
enum DiagnosticTag {
    /**
     * Unused or unnecessary code.
     *
     * Diagnostics with this tag are rendered faded out. The amount of fading
     * is controlled by the `"editorUnnecessaryCode.opacity"` theme color. For
     * example, `"editorUnnecessaryCode.opacity": "#000000c0"` will render the
     * code with 75% opacity. For high contrast themes, use the
     * `"editorUnnecessaryCode.border"` theme color to underline unnecessary code
     * instead of fading it out.
     */
    Unnecessary = 1,

    /**
     * Deprecated or obsolete code.
     *
     * Diagnostics with this tag are rendered with a strike through.
     */
    Deprecated = 2,
}

class Diagnostic {

    /**
     * The range to which this diagnostic applies.
     */
    range: Range;

    /**
     * The human-readable message.
     */
    message: string = "";

    /**
     * The severity, default is {@link DiagnosticSeverity.Error error}.
     */
    severity?: DiagnosticSeverity = DiagnosticSeverity.Error;


    /**
     * A code or identifier for this diagnostic.
     * Should be used for later processing, e.g. when providing {@link CodeActionContext code actions}.
     */
    code?: string | number | {
        /**
         * A code or identifier for this diagnostic.
         * Should be used for later processing, e.g. when providing {@link CodeActionContext code actions}.
         */
        value: string | number;

        /**
         * A target URI to open with more information about the diagnostic error.
         */
        target: string;
    };

    /**
     * An array of related diagnostic information, e.g. when symbol-names within
     * a scope collide all definitions can be marked via this property.
     */
    // relatedInformation?: DiagnosticRelatedInformation[];

    /**
     * Additional metadata about the diagnostic.
     */
    tags?: DiagnosticTag[];

    /**
     * Creates a new diagnostic object.
     *
     * @param range The range to which this diagnostic applies.
     * @param message The human-readable message.
     * @param severity The severity, default is {@link DiagnosticSeverity.Error error}.
     */
    constructor(range: Range, message: string, severity?: DiagnosticSeverity) {
        this.range = range;
        this.message = message;
        this.severity = severity;
    }
}

class RunTextMacro extends Line {
    private name: string;
    private params: string[];
    private lineText: VirtualLine | null;

    constructor(name: string = "", params: string[] = [], lineText: VirtualLine | null = null) {
        super();
        this.name = name;
        this.params = params;
        this.lineText = lineText;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public addParam(param: string) {
        this.params.push(param);
    }

    public getParams(): string[] {
        return this.params.map(param => param.replace(/^"/, "").replace(/"$/, ""));
    }

    public getLineText(): VirtualLine | null {
        return this.lineText;
    }

    public getLine(): VirtualLine | null {
        return this.lineText;
    }

    public getVirtualLineNumber(): number {
        return this.lineText?.virtualLine ?? 0;
    }

}
function parseRunTextMacro(text: string, runTextMacro: RunTextMacro) {
    text = text.replace(/\/\/!/, "   ");
    const tokens = tokenize(text);
    if (tokens[0].isId() && tokens[0].value == "runtextmacro") {
        if (tokens[1].isId()) {
            runTextMacro.setName(tokens[1].value)
            if (tokens[2].isOp() && tokens[2].value == "(") {
                let state = 0;
                for (let index = 3; index < tokens.length; index++) {
                    const token = tokens[index];
                    if (state == 0) {
                        if (token.isOp() && token.value == ")") {
                            break;
                        } else if (token.isString()) {
                            runTextMacro.addParam(token.value)
                            state = 1;
                        }
                    } else if (state == 1) {
                        if (token.isOp() && token.value == ")") {
                            break;
                        } else if (token.isOp() && token.value == ",") {
                            state = 0;
                        }
                    }
                }
            }
        }
    }
}
function findRunTextMacro(block: Block) {
    const expandLineTexts: (Line | RunTextMacro)[] = [];
    block.contents.forEach(lineText => {
        const replaceText = lineText.content;
        if (/^\s*\/\/!\s+runtextmacro\b/.test(replaceText)) {
            const runTextMacro = new RunTextMacro();
            parseRunTextMacro(replaceText, runTextMacro);
            runTextMacro.line = lineText.line;
            runTextMacro.content = lineText.content;
            expandLineTexts.push(runTextMacro);


        } else {
            expandLineTexts.push(lineText);
        }
    });

    return expandLineTexts
}

function findRunTextMacroTarget(runTextMacto: RunTextMacro, textMacros: TextMacro[]): TextMacro | undefined {
    const textMacro = textMacros.find((textMacro) => textMacro.getName() == runTextMacto.getName());
    return textMacro;
}

function stream(content: string) {
    const lines = toLines(content);

    const originBlock = new Block();
    originBlock.contents.push(...lines);

    const textMacroObject = findTextMacroBlocks(originBlock);

    const removeTextMacroBlock = new Block();
    removeTextMacroBlock.contents = textMacroObject.texts;

    const zincObject = findZincBlocks(removeTextMacroBlock);

    const baseBlock = new Block();
    baseBlock.contents = zincObject.texts;

    const specialObject = findRunTextMacro(baseBlock);

    const doJassCodeToJsCode = (line: Line): {
        originLine: Line,
        resultLine: Line,
    } => {
        interface MatchDefine {
            pattern: RegExp;
            replaceText: string;
        }
        const defines: MatchDefine[] = [
            {
                pattern: / /,
                replaceText: ""
            }
        ];
        let newText = line.content;
        defines.forEach(x => {
            newText = newText.replace(x.pattern, x.replaceText);
        });

        return {
            originLine: line,
            resultLine: new Line(line.line, newText),
        };
    }

    const doRunTextMacroToLines = (runTextMacro: RunTextMacro) => {
        const textMacro = findRunTextMacroTarget(runTextMacro, textMacroObject.blocks);
        if (textMacro) {
            textMacro.lines.map((lineText) => {

                let newText = lineText.content;
                textMacro.takes.forEach((take, takeIndex) => {
                    newText = newText.replace(new RegExp(`\\$${take}\\$`, "g"), runTextMacro.getParams()[takeIndex] ?? "");
                });
                const newLine = new Line();
                newLine.line = lineText.line;
                newLine.content = newText;

                return {
                    oldLine: lineText,
                    newLine: newLine
                }
            });
        }
    }


    function parseGlobals() {

    }

    const diagnostics: Diagnostic[] = [];

    function push(range: Range, message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error) {
        diagnostics.push(new Diagnostic(range, message, severity));
    }
    let inGlobals = false;
    function check(line: Line) {


        if (/^\s*globals\b/.test(line.content)) {
            if (inGlobals) {
                // error
                push(new Range(new Position(line.line, 0), new Position(line.line, line.end)), "Error redeclaration!");
            } else {
                inGlobals = true;
            }
        } else if (/^\s*endglobals\b/.test(line.content)) {
            if (inGlobals) {
                inGlobals = false;
            } else {
                // error
                push(new Range(new Position(line.line, 0), new Position(line.line, line.end)), "Redundant closing tag!");
            }
        } else if (inGlobals) {
            // constant type array id = 
            const reg = /\s*(?<hasConst>constant\s+)?(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?<hasArray>array\s+)?(?<id>[a-zA-Z][a-zA-Z0-9_]*)\b/;
            const result = reg.exec(line.content);
            if (result) {
                if (result.groups) {
                    let text = line.content;
                    if (result.groups["hasConst"]) {
                        text = text.replace("constant", "const   ");
                    } else {
                        text = "var " + text;
                    }
                    if (result.groups["type"]) {
                        text = text.replace(result.groups["type"], "".padStart(result.groups["type"].length, " "));
                    }
                    if (result.groups["hasArray"]) {
                        text = text.replace(result.groups["hasArray"], "".padStart(result.groups["hasArray"].length, " "));
                    }
                    if (result.groups["id"]) {
                        if (result.groups["hasArray"]) {
                            text = text.replace(result.groups["id"], result.groups["id"] + "[]");
                        }
                    }
                    try {
                        console.log(text, JSON.stringify(parse(text, {
                            errorRecovery: true
                        })));
                    } catch (error) {
                        console.log(text, JSON.stringify(error));

                    }

                }
            } else {
                push(new Range(new Position(line.line, 0), new Position(line.line, line.end)), "Misdefinition!");
            }
        }
    }
    function doLine(realLine: Line, virtualLine?: Line,) {
        if (virtualLine) {
            check(virtualLine);
        } else {
            check(realLine);
        }
    }

    specialObject.forEach((em) => {
        if (em instanceof RunTextMacro) {
            const textMacro = findRunTextMacroTarget(em, textMacroObject.blocks);
            if (textMacro) {
                textMacro.lines.forEach((lineText) => {

                    let newText = lineText.content;
                    textMacro.takes.forEach((take, takeIndex) => {
                        newText = newText.replace(new RegExp(`\\$${take}\\$`, "g"), em.getParams()[takeIndex] ?? "");
                    });
                    const newLine = new Line();
                    newLine.line = lineText.line;
                    newLine.content = newText;

                    doLine(em, newLine);
                });
            }
        }
        if (em instanceof Line) {
            doLine(em);
            // return doJassCodeToJsCode(em);
        }
    });
    return diagnostics;
}

if (false) {
    stream(`
    //! textmacro aaa takes args
        integer a
    //! endtextmacro
    
    
    // constant int array aaa = 22
    globals
    
         int  aaa = 22 * a() /
    
         int aaa = 33
    endglobals
    `,)
}
function replace_range(content: string, start: number, end: number, text: string): string {
    return content.substring(0, start) + text + content.substring(end, content.length);
}

function convert(content: string): string {
    // content = content.replace(/takes\s+(?<takes>([a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*)(\s*,\s*[a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*)*\s+returns)/g, (first, expr) => {    
    content = content.replace(/takes\s+(?<takes>.+?)\s+returns/g, (first, expr: string) => {
        return `takes ${expr.split(",").map(x => x.trim()).map(x => {
            const params = x.split(/\s+/);
            return params.join("_");
        })} returns`;
    });
    content = content.replace(/\btakes\b/g, "(    ");
    // content = content.replace(/\breturns\b/g, ")     {");
    content = content.replace(/\breturns\s+(?<expr>[a-zA-Z][a-zA-Z0-9_]*)\b/g, (first, expr) => {
        return `)    {//${expr}`;
    });
    content = content.replace(/\bnothing\b/g, "       ");
    content = content.replace(/\bendfunction\b/g, "          }");
    content = content.replace(/^\s*local\s+[a-zA-Z][a-zA-Z0-9_]*(?<expr>.+)$/gm, (first, expr) => {
        return `var ${expr}`;
    });
    content = content.replace(/\bif\b/g, "if(");
    content = content.replace(/\bthen\b/g, ")    {");
    content = content.replace(/\bendif\b/g, "    }");
    content = content.replace(/\belse\b/g, "}else{");
    content = content.replace(/\belseif\b/g, "}else if(");

    content = content.replace(/\bloop\b/g, "while(true){");
    content = content.replace(/\bendloop\b/g, "      }");
    content = content.replace(/\bexitwhen\s+(?<expr>.+)\b/g, (first, expr) => {
        return `if(${expr}){return;}`;
    });
    content = content.replace(/\bset\b/g, "   ");
    content = content.replace(/\bcall\b/g, "    ");
    content = content.replace(/(?<!^\s*)function\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/gm, (first, expr) => {
        return `${"".padStart(first.length, " ")}${expr}`;
    });
    content = content.replace(/^\s*globals\b/gm, "       ");
    content = content.replace(/^\s*endglobals\b/gm, "          ");




    return content;
}

function retain(content: string): string {
    const lines = toLines(content);

    const newContent = (() => {
        let inGlobals = false;
        let inFunction = false;
        return lines.filter((line) => {
            if (/^\s*globals\b/.test(line.content)) {
                inGlobals = true;
                return true;
            } else if (/^\s*endglobals\b/.test(line.content)) {
                inGlobals = false;
                return true;
            } else if (inGlobals) {
                return true;
            } else if (/^\s*function\b/.test(line.content)) {
                inFunction = true;
                return true;
            } else if (/^\s*endfunction\b/.test(line.content)) {
                inFunction = false;
                return true;
            } else if (inFunction) {
                return true;
            }
            return false;
        }).map(line => line.content).join("");
    })();

    return newContent;
}

// function aaa takes integer a,


// console.log(convert(getFileContent("E:\\projects\\jass\\static\\blizzard.j")));
/*
try {
    console.log(parseExpressionPlus(retain(convert(`
globals
    ** + 25
endglobals
function aa takes aaa  aaa returns nothing
local integer  kkkk = 22 ( )
endfunction
`)), {
    errorRecovery: true,
    ranges: true,
}));
} catch (error) {
    console.error(error);
    
}*/

// parseExpressionPlus("var a = 22", {
//     errorRecovery: true,
//     ranges: true,
// })

interface ErrorMessage {
    message: string;
    type?: DiagnosticSeverity;
}

function checkLocal(content: string): ErrorMessage[] {
    const result = /^\s*local\s+(?<type>[a-zA-Z][a-zA-Z0-9_]*)(?<hasArray>\s+array)?\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)(\s*=\s*(?<expr>.+))?$/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (!result.groups["type"]) {
            errorMessages.push({
                message: "Error The local type is undefined!"
            });
        }
        if (!result.groups["name"]) {
            errorMessages.push({
                message: "Error The local identifier is undefined!"
            });
        }
        if (result.groups["expr"]) {
            if (result.groups["hasArray"]) {
                errorMessages.push({
                    message: "Error local array does not support initialization!"
                });
            }
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `Error local expression {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `Error local expression {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        }
    } else {
        errorMessages.push({
            message: "Error local definition!"
        });
    }

    return errorMessages;
}

function checkGlobal(content: string): ErrorMessage[] {
    const result = /^\s*(?<hasConstant>constant\s+)?(?<type>[a-zA-Z][a-zA-Z0-9_]*)(?<hasArray>\s+array)?\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)(\s*=\s*(?<expr>.+))?$/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (!result.groups["type"]) {
            errorMessages.push({
                message: "Error The global type is undefined!"
            });
        }
        if (!result.groups["name"]) {
            errorMessages.push({
                message: "Error The global identifier is undefined!"
            });
        }
        if (result.groups["expr"]) {
            if (result.groups["hasArray"]) {
                errorMessages.push({
                    message: "Error global array does not support initialization!"
                });
            }
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `Error global expression {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `Error global expression {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        } else {
            if (result.groups["hasConstant"] && !result.groups["hasArray"]) {
                errorMessages.push({
                    message: "The error global constant definition must be initialized!"
                });
            }
        }
    } else {
        errorMessages.push({
            message: "Error global definition!"
        });
    }

    return errorMessages;
}

function checkSet(content: string): ErrorMessage[] {
    const result = /^\s*set\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)(\s*\[\s*(?<indexExpr>.+?)\s*\])?\s*=\s*((?<expr>.+))?$/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (!result.groups["name"]) {
            errorMessages.push({
                message: "Error The global identifier is undefined!"
            });
        }
        if (result.groups["indexExpr"]) {
            try {
                parseExpressionPlus(result.groups["indexExpr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `Set expression index expression error {${result.groups!["indexExpr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `Set expression index expression error {${result.groups!["indexExpr"].trim()}}, ${error}!`
                });
            }
        }
        if (result.groups["expr"]) {
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `Set expression  error {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `Set expression  error {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        } else {
            errorMessages.push({
                message: "Error set no value assigned!"
            });
        }
    } else {
        errorMessages.push({
            message: "Error set expression!"
        });
    }

    return errorMessages;
}

function checkIf(content: string): ErrorMessage[] {
    const result = /^\s*if\s*(?<expr>.+)\s*then/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (result.groups["expr"]) {
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `If conditional expression is incorrect {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `If conditional expression is incorrect {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        } else {
            errorMessages.push({
                message: "Missing condition!"
            });
        }
    } else {
        errorMessages.push({
            message: "Error if expression!"
        });
    }

    return errorMessages;  
}

function checkElseIf(content: string): ErrorMessage[] {
    const result = /^\s*elseif\s*(?<expr>.+)\s*then/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (result.groups["expr"]) {
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `If conditional expression is incorrect {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `If conditional expression is incorrect {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        } else {
            errorMessages.push({
                message: "Missing condition!"
            });
        }
    } else {
        errorMessages.push({
            message: "Error if expression!"
        });
    }

    return errorMessages;
}

function checkExitwhen(content: string): ErrorMessage[] {
    const result = /^\s*exitwhen\s*(?<expr>.+)/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (result.groups["expr"]) {
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `Exitwhen conditional expression is incorrect {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `Exitwhen conditional expression is incorrect {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        } else {
            errorMessages.push({
                message: "Missing condition!"
            });
        }
    } else {
        errorMessages.push({
            message: "Error Exitwhen expression!"
        });
    }

    return errorMessages;
}

function isLineCommentStart(text: string): boolean {
    return /^\s*\/\//.test(text);
}
function checkCall(content: string): ErrorMessage[] {
    const result = /^\s*call\s+(?<expr>.+)/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (result.groups["expr"]) {
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `Function call error {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `Function call error {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        } else {
            errorMessages.push({
                message: "Function call error!"
            });
        }
    } else {
        errorMessages.push({
            message: "Function call error!"
        });
    }

    return errorMessages;
}
function checkReturn(content: string): ErrorMessage[] {
    const result = /^\s*return\s*(?<expr>.+)/gm.exec(content);

    const errorMessages: ErrorMessage[] = [];

    if (result && result.groups) {
        if (result.groups["expr"]) {
            try {
                parseExpressionPlus(result.groups["expr"].trim()).errors.forEach(error => {
                    errorMessages.push({
                        message: `Return error {${result.groups!["expr"].trim()}}, ${error.reasonCode}!`
                    });
                });
            } catch (error) {
                errorMessages.push({
                    message: `Return error {${result.groups!["expr"].trim()}}, ${error}!`
                });
            }
        } else {
            // 空 return
        }
    } else {
        // 空 return
    }

    return errorMessages;
}
function checkElse(content: string): ErrorMessage[] {

    const errorMessages: ErrorMessage[] = [];

    // try {
    //     parse(content).errors.forEach(error => {
    //         errorMessages.push({
    //             message: `If else expression error {${content.trim()}}, ${error.reasonCode}!`
    //         });
    //     });
    // } catch (error) {
    //     errorMessages.push({
    //         message: `If else expression error {${content.trim()}}, ${error}!`
    //     });
    // }

    return errorMessages;
}
function checkAll(content: string): {
    errors: ErrorMessage[],
    line: Line
}[] {
    const lines = toLines(content);

    const errorMessages: {
        errors: ErrorMessage[],
        line: Line
    }[] = [];

    let inGlobals = false;
    let inFunction = false;
    lines.forEach((line) => {
        if (/^\s*globals\b/.test(line.content)) {
            inGlobals = true;
        } else if (/^\s*endglobals\b/.test(line.content)) {
            inGlobals = false;
        } else if (inGlobals) {
            if (line.content.trim() == "" || isLineCommentStart(line.content)) {
                // continue;
            }  else {
                errorMessages.push({
                    errors: checkGlobal(line.content),
                    line
                });
            }
        } else if (/^\s*function\b/.test(line.content)) {
            inFunction = true;
        } else if (/^\s*endfunction\b/.test(line.content)) {
            inFunction = false;
        } else if (inFunction) {
            if (line.content.trim() == "" || isLineCommentStart(line.content)) {
                // continue;
            } else if (/^\s*local\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkLocal(line.content),
                    line
                });
            } else if (/^\s*set\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkSet(line.content),
                    line
                });
            } else if (/^\s*if\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkIf(line.content),
                    line
                });
            } else if (/^\s*elseif\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkElseIf(line.content),
                    line
                });
            } else if (/^\s*else\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkElse(line.content),
                    line
                });
            } else if (/^\s*exitwhen\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkExitwhen(line.content),
                    line
                });
            } else if (/^\s*call\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkCall(line.content),
                    line
                });
            } else if (/^\s*return\b/.test(line.content)) {
                errorMessages.push({
                    errors: checkReturn(line.content),
                    line
                });
            } else {
                /*
                try {
                    parse(line.content).errors.forEach(error => {
                        errorMessages.push({
                            errors: [{
                                message: `Error {${line.content}}, ${error.reasonCode}!`
                            }],
                            line
                        });
                    });
                } catch (error) {
                    errorMessages.push({
                        errors: [{
                            message: `Error {${line.content}}, ${error}!`
                        }],
                        line
                    });
                }
                */
            }
        }
    })


    return errorMessages;
}


if (false) {
    console.log(checkAll(`
    function
    call aaa(function  aaa)
    endfunction`));
}

export {
    checkAll
};