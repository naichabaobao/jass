import * as vscode from 'vscode';

import * as fs from "fs";

import { AllKeywords } from './keyword';
import { Types } from './types';
import { Options } from './options';
// import { commonJFile, commonAiFile, blizzardJFile, dzApiJFile, includeFiles } from "./data";

function _isNewLine(char: string) {
  return char == "\n";
}

/**
 * 替换注释保留换行符
 * @param text 
 * @param startIndex 
 * @param endIndex 
 * @param char 
 * @returns 
 */
function _replace(text: string, startIndex: number, endIndex: number, char: string = " ") {
  if (endIndex <= startIndex) {
    throw "endIndex <= startIndex";
  }
  function replaceContent(content: string) {
    if (content.length == 0) {
      return content;
    }
    return content.split("\n").map(x => "".padStart(x.length, char)).join("\n");
  }
  let preText = text.substring(0, startIndex) + replaceContent(text.substring(startIndex, endIndex + 1));
  if (endIndex + 1 < text.length) {
    preText += text.substring(endIndex + 1, text.length);
  }
  return preText;
}

/**
 * 移除块注释和单行注释（不支持嵌套的块注释识别）
 * 有用的单行注释会保存在_usefulLineComments
 * @param content 
 * @returns 
 */
function _removeBlockComment(content: string) {
  let status = 0;
  let blockStart = 0;

  let line = 0;

  const lineCommentOver = (start: number, end: number) => {
    content = _replace(content, start, end);
  }
  for (let index = 0; index < content.length; index++) {
    const char = content[index];
    if (status == 0) {
      if (char == "/") {
        status = 1;
        blockStart = index;
      } else if (char == "\"") {
        status = 5;
      }
    } else if (status == 1) {
      if (char == "*") {
        status = 2;
      } else if (char == "/") {
        status = 3;
      } else {
        status = 0;
      }
    } else if (status == 2) {
      if (char == "*") {
        status = 4;
      }
    } else if (status == 3) {
      if (_isNewLine(char)) { // 行注释结束
        status = 0;
        lineCommentOver(blockStart, index);
      }
    } else if (status == 4) {
      if (char == "/") { // 块注释结束
        status = 0;
        content = _replace(content, blockStart, index);
      } else {
        status = 2;
      }
    } else if (status == 5) {
      if (char == "\"") { // 字符串结束
        status = 0;
      } else if (char == "\\") { //字符串进入转义状态
        status = 6;
      } else if (_isNewLine(char)) { // 字符串结束
        status = 0;
      }
    } else if (status == 6) {
      if (_isNewLine(char)) { // 字符串结束
        status = 0;
      } else { // 从新回到字符串状态
        status = 5;
      }
    }
    if (_isNewLine(char)) {
      line++;
    }
  }
  if (status == 2 || status == 4) { // 未闭合块注释
    content = _replace(content, blockStart, content.length - 1);
  } if (status == 3) { // 行注释结束
    lineCommentOver(blockStart, content.length - 1);
  }
  return content;
}



function findLocations(x: { path: string, content: string }, key: string): vscode.Location[] {
  const locations = new Array<vscode.Location>();

  const lines = _removeBlockComment(x.content).split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (new RegExp(`^\\s*(?:(?:private\\s+|public\\s+)?(?:static\\s+)?(?:function|method)|(?:constant\\s+)?native|(?:private\\s+|public\\s+)?(?:static\\s+)?(?:constant|local\\s+)?(?:\\w+)(?:\\s+array)?|(?:private\\s+|public\\s+)?(?:struct|interfaces))\\s+${key}\\b`).test(line)) {
      const location = new vscode.Location(vscode.Uri.file(x.path), new vscode.Position(index, line.indexOf(key)));
      locations.push(location);
    }
  }

  return locations;
}

vscode.languages.registerDefinitionProvider("jass", new class NewDefinitionProvider implements vscode.DefinitionProvider {

  private _maxLength = 255;

  private isNumber = function (val: string) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
      return true;
    } else {
      return false;
    }
  }



  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    let key = document.getText(document.getWordRangeAtPosition(position));

    if (key.length > this._maxLength) {
      return null;
    }

    if (this.isNumber(key)) {
      return null;
    }

    if (AllKeywords.includes(key)) {
      return null;
    }

    const type = Types.find(type => type === key);
    if (type) {
      return null;
    }
    const locations = new Array<vscode.Location>();
    // fs.readFileSync(Options.commonJPath).toString()
    // fs.readFileSync(Options.commonAiPath).toString()
    // fs.readFileSync(Options.blizzardJPath).toString()
    // fs.readFileSync(Options.dzApiJPath).toString()
    const ls = findLocations({path: document.uri.fsPath, content: document.getText()}, key).filter(x => x.range.start.line != position.line);
    locations.push(...ls);
    [Options.commonJPath, Options.commonAiPath, Options.blizzardJPath, Options.dzApiJPath, ...Options.includes].forEach(path => {
      const content = fs.readFileSync(path).toString();
      const ls = findLocations({path, content}, key);
      locations.push(...ls);
    });
    
    
    // .forEach(path => {
    //   const content = fs.readFileSync(path).toString();
    //   locations.push(...findLocations({
    //     path,
    //     content
    //   }, key));


    return locations;
  }

}());
