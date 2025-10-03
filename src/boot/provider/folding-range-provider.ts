import * as vscode from 'vscode';
import { GlobalContext, NodeAst } from '../jass/parser-vjass';

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
    start: "^\\s*module\\b",
    end: "^\\s*endmodule\\b",
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
class ExFoldingRangeProvider implements vscode.FoldingRangeProvider {

  provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {

    const foldings = new Array<vscode.FoldingRange>();


    const doc = GlobalContext.get(document.uri.fsPath);
    if (doc) {
      const handing = (node:NodeAst, layer_count:number = 0) => {
        if (node.end.line - 1 > node.start.line) {
          const folding = new vscode.FoldingRange(node.start.line, node.end.line - 1);
          foldings.push(folding);
        }
        node.children.forEach(child => handing(child));
      };
      if (doc.program) {
        doc.program.children.forEach(child => {
          handing(child);
        });
      }
      if (doc.zincNodes) {
        doc.zincNodes.forEach((zinc_node: any) => {
          zinc_node.children.forEach((child: any) => {
            handing(child);
          });
        });
      }
    }

    return foldings;
  }

}

vscode.languages.registerFoldingRangeProvider("jass", new ExFoldingRangeProvider);