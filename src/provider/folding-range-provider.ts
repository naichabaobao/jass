import * as vscode from 'vscode';
import { language } from '../main/constant';
import { toLines } from '../main/tool';
import { Keyword } from '../main/keyword';

const globalStartRegExp = new RegExp(`^\\s*${Keyword.Globals}\\b`);
const globalEndStartRegExp = new RegExp(`^\\s*${Keyword.Endglobals}\\b`);

const functionStartRegExp = new RegExp(`^\\s*((${Keyword.keywordPrivate}|${Keyword.keywordPublic}|${Keyword.keywordStatic})\\s+)?${Keyword.Function}\\b`);
const functionEndStartRegExp = new RegExp(`^\\s*${Keyword.Endfunction}\\b`);

const libraryStartRegExp = new RegExp(`^\\s*${Keyword.keywordLibrary}\\b`);
const libraryEndStartRegExp = new RegExp(`^\\s*${Keyword.keywordEndLibrary}\\b`);

const ifStartRegExp = new RegExp(`^\\s*${Keyword.If}\\b`);
const ifEndStartRegExp = new RegExp(`^\\s*${Keyword.Endif}\\b`);

const loopStartRegExp = new RegExp(`^\\s*${Keyword.Loop}\\b`);
const loopEndStartRegExp = new RegExp(`^\\s*${Keyword.Endloop}\\b`);

class FoldingRangeProvider implements vscode.FoldingRangeProvider{

  provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {

    const foldings = new Array<vscode.FoldingRange>();

    const content = document.getText();
    const lines = toLines(content);
    
    let inGlobal = false;
    let globalLine = 0;

    let inFunction = false;
    let functionLine = 0;

    let inLibrary = false;
    let libraryLine = 0;

    let inIf = false;
    let ifLine = 0;

    let inLoop = false;
    let loopLine = 0;

    lines.forEach((line,index) => {
      // if
      if(ifStartRegExp.test(line)){
        inIf = true;
        ifLine = index;
      }else if(ifEndStartRegExp.test(line)){
        if(inIf == true){
          const folding = new vscode.FoldingRange(ifLine,index);
          foldings.push(folding);
          inIf = false;
        }
      }
      // loop
      else if(loopStartRegExp.test(line)){
        inLoop = true;
        loopLine = index;
      }else if(loopEndStartRegExp.test(line)){
        if(inLoop == true){
          const folding = new vscode.FoldingRange(loopLine,index);
          foldings.push(folding);
          inLoop = false;
        }
      }
      // global
      else if(globalStartRegExp.test(line)){
        inGlobal = true;
        globalLine = index;
      }else if(globalEndStartRegExp.test(line)){
        if(inGlobal == true){
          const folding = new vscode.FoldingRange(globalLine,index);
          foldings.push(folding);
          inGlobal = false;
        }
      }
      // function
      else if(functionStartRegExp.test(line)){
        inFunction = true;
        functionLine = index;
      }else if(functionEndStartRegExp.test(line)){
        if(inFunction == true){
          const folding = new vscode.FoldingRange(functionLine,index);
          foldings.push(folding);
          inFunction = false;
        }
      }
      // library
      else if(libraryStartRegExp.test(line)){
        inLibrary = true;
        libraryLine = index;
      }else if(libraryEndStartRegExp.test(line)){
        if(inLibrary == true){
          const folding = new vscode.FoldingRange(libraryLine,index);
          foldings.push(folding);
          inLibrary = false;
        }
      }

    });


    return foldings;
  }

}

vscode.languages.registerFoldingRangeProvider(language,new FoldingRangeProvider);