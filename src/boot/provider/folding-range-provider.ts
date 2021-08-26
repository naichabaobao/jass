import * as vscode from 'vscode';

interface FoldingOption {
  start:string|RegExp;
  end:string|RegExp;
  kind: vscode.FoldingRangeKind;
}

const FoldingOptions:FoldingOption[] = [
  {
    start: "^\\s*//\\s*region\\b",
    end: "^\\s*//\\s*endregion\\b",
    kind: vscode.FoldingRangeKind.Region
  },
  {
    start: "^\\s*globals\\b",
    end: "^\\s*endglobals\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*((private|public|static)\\s+)?function\\b",
    end: "^\\s*endfunction\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*if\\b",
    end: "^\\s*elseif\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*if\\b",
    end: "^\\s*else\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*if\\b",
    end: "^\\s*endif\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*else\\b",
    end: "^\\s*endif\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*elseif\\b",
    end: "^\\s*else\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*elseif\\b",
    end: "^\\s*endif\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*elseif\\b",
    end: "^\\s*elseif\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*loop\\b",
    end: "^\\s*endloop\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*library\\b",
    end: "^\\s*endlibrary\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*/\\*",
    end: "^\\s*\\*/",
    kind: vscode.FoldingRangeKind.Comment
  },
  {
    start: "^\\s*//!\\s+textmacro\\b",
    end: "^\\s*//!\\s+endtextmacro\\b",
    kind: vscode.FoldingRangeKind.Comment
  },
  {
    start: "^\\s*scope\\b",
    end: "^\\s*endscope\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*module\\b",
    end: "^\\s*endmodule\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*((private|public)\\s+)?struct\\b",
    end: "^\\s*endstruct\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*((private|public)\\s+)?interface\\b",
    end: "^\\s*endinterface\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*((private|public|static|stub)\\s+)?method\\b",
    end: "^\\s*endmethod\\b",
    kind: vscode.FoldingRangeKind.Imports
  },
  {
    start: "^\\s*//!\\s+externalblock\\b",
    end: "^\\s*//!\\s+endexternalblock\\b",
    kind: vscode.FoldingRangeKind.Comment
  },
  {
    start: "^\\s*//!\\s+novjass\\b",
    end: "^\\s*//!\\s+endnovjass\\b",
    kind: vscode.FoldingRangeKind.Comment
  },
  {
    start: "^\\s*//!\\s+zinc\\b",
    end: "^\\s*//!\\s+endzinc\\b",
    kind: vscode.FoldingRangeKind.Comment
  },
  {
    start: "^\\s*//!\\s+inject\\b",
    end: "^\\s*//!\\s+endinject\\b",
    kind: vscode.FoldingRangeKind.Comment
  },
  {
    start: "{\\s*$|{\\s*//.*$",
    end: "^\\s*}",
    kind: vscode.FoldingRangeKind.Imports
  }
];


const globalStartRegExp = new RegExp(`^\\s*globals\\b`);
const globalEndRegExp = new RegExp(`^\\s*endglobals\\b`);

const functionStartRegExp = new RegExp(`^\\s*((private|public|static)\\s+)?function\\b`);
const functionEndRegExp = new RegExp(`^\\s*endfunction\\b`);

const libraryStartRegExp = new RegExp(`^\\s*library\\b`);
const libraryEndRegExp = new RegExp(`^\\s*endlibrary\\b`);

const ifStartRegExp = new RegExp(`^\\s*if\\b`);
const elseRegExp = new RegExp(`^\\s*else\\b`);
const elseIfRegExp = new RegExp(`^\\s*elseif\\b`);
const ifEndRegExp = new RegExp(`^\\s*endif\\b`);

const loopStartRegExp = new RegExp(`^\\s*loop\\b`);
const loopEndRegExp = new RegExp(`^\\s*endloop\\b`);

const regionStartRegExp = new RegExp(`^\\s*//\\s*region\\b`);
const endRegionRegExp = new RegExp(`^\\s*//\\s*endregion\\b`);

const methodStartRegExp = new RegExp(`^\\s*method\\b`);
const endMethodionRegExp = new RegExp(`^\\s*endmethod\\b`);

class ElseIf {
  public line: number;

  constructor(line: number) {
    this.line = line;
  }
}

class ElseIfArray extends Array<ElseIf>{

  public first = () => {
    return this[0];
  }

  public last = () => {
    return this[this.length - 1];
  }

}

class If {
  public line: number;
  public elseIfArray: ElseIfArray = new ElseIfArray();
  public elseLine: number | null = null;

  constructor(line: number) {
    this.line = line;
  }

}

class IfArray extends Array<If>{

  public first = () => {
    return this[0];
  }

  public last = () => {
    return this[this.length - 1];
  }

}

class Loop {
  public line:number;

  constructor(line: number) {
    this.line = line;
  }
}

class LoopArray extends Array<Loop> {
  public first = () => {
    return this[0];
  }

  public last = () => {
    return this[this.length - 1];
  }
}

class FoldingRangeProvider implements vscode.FoldingRangeProvider {

  provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {

    const foldings = new Array<vscode.FoldingRange>();

    FoldingOptions.forEach(option => {
      let wrap = false;
      let field = 0;
      let lines:number[] = [];
      for (let index = 0; index < document.lineCount; index++) {
        const TextLine = document.lineAt(index);
        if (field > 0) {
          const regExp = option.end instanceof RegExp ? option.end : new RegExp(option.end);
          if (regExp.test(TextLine.text)) {
            const folding = new vscode.FoldingRange(lines[field - 1], index - 1, option.kind);
            foldings.push(folding);
            field--;
          }
        }
        const regExp = option.start instanceof RegExp ? option.start : new RegExp(option.start);
          if (regExp.test(TextLine.text)) {
            lines[field] = index;
            field++;
          }
      }
    });

    return foldings;


    const content = document.getText();
    let lines:string[] = [];
    for (let index = 0; index < document.lineCount; index++) {
      const element = document.lineAt(index);
      lines.push(element.text);
    }

    let inGlobal = false;
    let globalLine = 0;

    let inFunction = false;
    let functionLine = 0;

    let inLibrary = false;
    let libraryLine = 0;

    const ifArray = new IfArray();

    const loopArray = new LoopArray();

    let inRegion = false;
    let regionLine = 0;

    let inMethod = false;
    let methodLine = 0;

    lines.forEach((line, index) => {
      // if
      if (ifStartRegExp.test(line)) {
        ifArray.push(new If(index));
      } else if (elseRegExp.test(line)) {
        // 第一種 if else
        // 第二種 elseif else
        if (ifArray.length > 0) {
          if (ifArray.last().elseIfArray.length > 0) { // if中含有elseif,開始行為elseif
            if (index - ifArray.last().elseIfArray.last().line > 1) {
              const folding = new vscode.FoldingRange(ifArray.last().elseIfArray.last().line, index - 1);
              foldings.push(folding);
            }
          } else { // if -> else
            if (index - ifArray.last().line > 1) {
              const folding = new vscode.FoldingRange(ifArray.last().line, index - 1);
              foldings.push(folding);
            }
          }
          ifArray.last().elseLine = index;
        }
      } else if (elseIfRegExp.test(line)) {
        if (ifArray.length > 0) {
          if (ifArray.last().elseIfArray.length > 0) {
            if (index - ifArray.last().elseIfArray.last().line > 1) {
              const folding = new vscode.FoldingRange(ifArray.last().elseIfArray.last().line, index - 1);
              foldings.push(folding);
            }
          } else {
            if (index - ifArray.last().line > 1) {
              const folding = new vscode.FoldingRange(ifArray.last().line, index - 1);
              foldings.push(folding);
            }
          }
          ifArray.last().elseIfArray.push(new ElseIf(index));
        }
      } else if (ifEndRegExp.test(line)) {
        const elseLine = ifArray.last().elseLine;
        if (elseLine) {
          if (index - elseLine > 1) {
            const folding = new vscode.FoldingRange(elseLine, index - 1);
            foldings.push(folding);
          }
        } else if (ifArray.length > 0) {
          if (ifArray.last().elseIfArray.length > 0) {
            if (index - ifArray.last().elseIfArray.last().line > 1) {
              const folding = new vscode.FoldingRange(ifArray.last().elseIfArray.last().line, index - 1);
              foldings.push(folding);
            }
          } else {
            if (index - ifArray.last().line > 1) {
              const folding = new vscode.FoldingRange(ifArray.last().line, index - 1);
              foldings.push(folding);
            }
          }
          ifArray.pop();
        }
      }

      if (loopStartRegExp.test(line)) {
        loopArray.push(new Loop(index));
      } else if (loopEndRegExp.test(line)) {
        if (loopArray.length > 0) {
          if(index - loopArray.last().line > 1) {
            const folding = new vscode.FoldingRange(loopArray.last().line, index - 1);
            foldings.push(folding);
          }
          loopArray.pop();
        }
      }
      // global
      else if (globalStartRegExp.test(line)) {
        inGlobal = true;
        globalLine = index;
      } else if (globalEndRegExp.test(line)) {
        if (inGlobal == true) {
          if(index - globalLine > 1) {
            const folding = new vscode.FoldingRange(globalLine, index - 1);
            foldings.push(folding);
            inGlobal = false;
          }
        }
      }
      // function
      else if (functionStartRegExp.test(line)) {
        inFunction = true;
        functionLine = index;
      } else if (functionEndRegExp.test(line)) {
        if (inFunction == true) {
          if (index - functionLine > 1) {
            const folding = new vscode.FoldingRange(functionLine, index);
            foldings.push(folding);
            inFunction = false;
          }
        }
      }
      // library
      else if (libraryStartRegExp.test(line)) {
        inLibrary = true;
        libraryLine = index;
      } else if (libraryEndRegExp.test(line)) {
        if (inLibrary == true) {
          if(index - libraryLine > 1) {
            const folding = new vscode.FoldingRange(libraryLine, index - 1);
            foldings.push(folding);
            inLibrary = false;
          }
        }
      }
      // region
      else if (regionStartRegExp.test(line)) {
        inRegion = true;
        regionLine = index;
      } else if (endRegionRegExp.test(line)) {
        if (inRegion == true) {
          if(index - regionLine > 1) {
            const folding = new vscode.FoldingRange(regionLine, index - 1, vscode.FoldingRangeKind.Region);
            foldings.push(folding);
            inRegion = false;
          }
        }
      }
      // method
      else if (methodStartRegExp.test(line)) {

        
        inMethod = true;
        methodLine= index;
      } else if (endMethodionRegExp.test(line)) {
        console.log("66");
        
        if (inMethod == true) {
          if(index - methodLine > 1) {
            const folding = new vscode.FoldingRange(methodLine, index - 1, vscode.FoldingRangeKind.Region);
            foldings.push(folding);
            inMethod = false;
          }
        }
      }
      
    });


    return foldings;
  }

}

vscode.languages.registerFoldingRangeProvider("jass", new FoldingRangeProvider);