import * as vscode from 'vscode';
import { language } from '../main/constant';
import { toLines } from '../main/tool';
import { Keyword } from '../main/keyword';

const globalStartRegExp = new RegExp(`^\\s*${Keyword.Globals}\\b`);
const globalEndRegExp = new RegExp(`^\\s*${Keyword.Endglobals}\\b`);

const functionStartRegExp = new RegExp(`^\\s*((${Keyword.keywordPrivate}|${Keyword.keywordPublic}|${Keyword.keywordStatic})\\s+)?${Keyword.Function}\\b`);
const functionEndRegExp = new RegExp(`^\\s*${Keyword.Endfunction}\\b`);

const libraryStartRegExp = new RegExp(`^\\s*${Keyword.keywordLibrary}\\b`);
const libraryEndRegExp = new RegExp(`^\\s*${Keyword.keywordEndLibrary}\\b`);

const ifStartRegExp = new RegExp(`^\\s*${Keyword.If}\\b`);
const ifEndRegExp = new RegExp(`^\\s*${Keyword.Endif}\\b`);

const loopStartRegExp = new RegExp(`^\\s*${Keyword.Loop}\\b`);
const loopEndRegExp = new RegExp(`^\\s*${Keyword.Endloop}\\b`);

const regionStartRegExp = new RegExp(`^\\s*//\\s*region\\b`);
const endRegionRegExp = new RegExp(`^\\s*//\\s*endregion\\b`);

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

    let inRegion = false;
    let regionLine = 0;

    lines.forEach((line,index) => {
      // if
      if(ifStartRegExp.test(line)){
        inIf = true;
        ifLine = index;
      }else if(ifEndRegExp.test(line)){
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
      }else if(loopEndRegExp.test(line)){
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
      }else if(globalEndRegExp.test(line)){
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
      }else if(functionEndRegExp.test(line)){
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
      }else if(libraryEndRegExp.test(line)){
        if(inLibrary == true){
          const folding = new vscode.FoldingRange(libraryLine,index);
          foldings.push(folding);
          inLibrary = false;
        }
      }
      // region
      else if(regionStartRegExp.test(line)){
        inRegion = true;
        regionLine = index;
      }else if(endRegionRegExp.test(line)){
        if(inRegion == true){
          const folding = new vscode.FoldingRange(regionLine,index);
          foldings.push(folding);
          inRegion = false;
        }
      }

    });


    return foldings;
  }

}

vscode.languages.registerFoldingRangeProvider(language,new FoldingRangeProvider);