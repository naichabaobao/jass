import { Position, Range } from "../common";
import {LineText} from "./ast";
import {removeComment} from "./tool";


class LineComment extends Range{
    public readonly raw: string;

    constructor(raw: string) {
        super();
        this.raw = raw;
    }

    public lineNumber() :number {
        return this.start.line;
    }

}



class Marco extends Range{

    public readonly raw: string;

    constructor(raw: string) {
        super();
        this.raw = raw;
    }

}

const isLineCommentStartRegExp = /^\s*\/\/(?!\!)/;
function isLineComment(text: string):boolean {
    return isLineCommentStartRegExp.test(text);
}


const isMarcoStartRegExp = /^\s*#/;
function isMarco(text: string):boolean {
    return isMarcoStartRegExp.test(text);
}

function isZincStart(text: string):boolean {
    return /^\s*\/\/! zinc\b/.test(text);
}

function isZincEnd(text: string):boolean {
    return /^\s*\/\/! endzinc\b/.test(text);
}

class Scanner {
    private content: string;
    private rawLines: LineText[];

    public readonly lineCount:number;
    public readonly lineComments: LineComment[] = [];

    public readonly marcos:Marco[] = [];

    public readonly zincLines:LineText[] = [];

    public readonly jassLines:LineText[] = [];

    constructor(content: string) {
        this.content = removeComment(content);
        this.rawLines = this.content.match(/^.*$/gm)?.map((value, index) => {
            const lineText = new LineText(value);
            lineText.start = new Position(index, 0);
            lineText.end = new Position(index, value.length);
            return lineText;
        }) ?? [];
        // 清理
        Object.assign(this, {
            content: undefined
        });
        // 获取行数
        this.lineCount = this.rawLines.length;
        // 去除空行
        this.rawLines = this.rawLines.filter((lineText) => !lineText.isEmpty());
        // 获取单行注释
        this.scannerLineComments();
        // 获取宏
        // this.scannerMarcos();
        // 获取zinc
        // this.scannerZincLineText();
        // 剔除后留下的行
        this.jassLines.push(...this.rawLines);
        // 清理
        this.rawLines.length = 0;
        Object.assign(this, {
            rawLines: undefined
        });

    }

    /**
     * 从content中扫描行注释, 并移除
     */
    private scannerLineComments():void {
        this.rawLines = this.rawLines.filter((lineText) => {
            if (isLineComment(lineText.text)) {
                const lineComment = new LineComment(lineText.text);
                lineComment.setRange(lineText);
                this.lineComments.push(lineComment);
                return false;
            }
            return true;
        });
    }
   

    /**
     * 从content中扫描宏
     */
     private scannerMarcos():void {
        this.rawLines = this.rawLines.filter((lineText) => {
            if (isMarco(lineText.text)) {
                const marco = new Marco(lineText.text);
                marco.setRange(lineText);
                this.marcos.push(marco);
                return false;
            }
            return true;
        });
    }

    private scannerZincLineText(): void {
        let inZinc = false;
        this.rawLines = this.rawLines.filter((lineText) => {
            if (isZincStart(lineText.text)) {
                inZinc = true;
                return false;
            } else if (isZincEnd(lineText.text)) {
                inZinc = false;
                return false;
            } else if (inZinc){
                this.zincLines.push(lineText);
                return false;
            }
            return true;
        });
    }

    public zincContent() :string {
        let content:string = "";
        for (let index = 0; index < this.lineCount; index++) {
            const lineText = this.zincLines.find(lineText => lineText.lineNumber() == index);
            if (lineText) {
                content += `${lineText.text}\n`;
            } else {
                content += "\n";
            }
        }
        return content;
    }
}

export {Scanner, LineComment, Marco};

if (false) {
    const scanner = new Scanner(`
    a   
  b
  // a
  #define
  

  
  `);
    console.log(scanner);
    console.log(scanner.zincContent());
}



