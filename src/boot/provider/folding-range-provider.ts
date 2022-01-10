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
    start: "^\\s*(?:library|library_once)\\b",
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
  }

}

vscode.languages.registerFoldingRangeProvider("jass", new FoldingRangeProvider);