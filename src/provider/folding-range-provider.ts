import * as vscode from 'vscode';
import { language } from '../main/constant';
import { toLines } from '../main/tool';

const ifStartRegExp = new RegExp(`^\\s*if\\b`);
const ifEndStartRegExp = new RegExp(`^\\s*endif\\b`);

const loopStartRegExp = new RegExp(`^\\s*loop\\b`);
const loopEndStartRegExp = new RegExp(`^\\s*endloop\\b`);

class FoldingRangeProvider implements vscode.FoldingRangeProvider{

  provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {

    const foldings = new Array<vscode.FoldingRange>();

    const content = document.getText();
    const lines = toLines(content);
    
    let inIf = false;
    let ifLine = 0;

    let inLoop = false;
    let loopLine = 0;

    lines.forEach((line,index) => {

      if(ifStartRegExp.test(line)){
        inIf = true;
        ifLine = index;
      }else if(ifEndStartRegExp.test(line)){
        if(inIf == true){
          const folding = new vscode.FoldingRange(ifLine,index);
          foldings.push(folding);
          inIf = false;
        }
      }else if(loopStartRegExp.test(line)){
        inLoop = true;
        loopLine = index;
      }else if(loopEndStartRegExp.test(line)){
        if(inLoop == true){
          const folding = new vscode.FoldingRange(loopLine,index);
          foldings.push(folding);
          inLoop = false;
        }
      }

    });


    return foldings;
  }

}

vscode.languages.registerFoldingRangeProvider(language,new FoldingRangeProvider);