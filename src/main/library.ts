import { Keyword } from "./keyword";
import { Origin } from "./origin";
import * as vscode from 'vscode';
import { toLines } from "./tool";
import { Range } from "./range";
import { GlobalImpl } from "./global";
import { Function } from "./function";



class Library extends Range implements Origin, Description {

  public descript: string = "";
  public name = "";
  public initializer: string = "";
  // 三个作用一样
  private _needs = new Array<string>();
  private _requires = new Array<string>();
  private _uses = new Array<string>();

  public get needs(): Array<string> {
    return this._needs;
  }


  public set needs(needs: Array<string>) {
    this.needs = needs;
    this._requires = needs;
    this._uses = needs;
  }

  public get requires(): Array<string> {
    return this._requires;
  }


  public set requires(requires: Array<string>) {
    this.needs = requires;
    this._requires = requires;
    this._uses = requires;
  }

  public get uses(): Array<string> {
    return this._uses;
  }


  public set uses(uses: Array<string>) {
    this.needs = uses;
    this._requires = uses;
    this._uses = uses;
  }

  origin(): string {
    return `${Keyword.keywordLibrary} ${this.name} ${Keyword.keyworInitializer} ${this.initializer} ${Keyword.keywordUses} ${this.uses.join(", ")} 
${Keyword.keywordEndLibrary}`;
  }

}

const libraryRegExp = new RegExp(`${Keyword.keywordLibrary}\\s+(?<name>[a-zA-Z][a-zA-Z\\d]*)(\\s+${Keyword.keyworInitializer}\\s+(?<initializer>[a-zA-Z][a-zA-Z0-9_]*))?(\\s+(${Keyword.keywordRequires}|${Keyword.keywordUses}|${Keyword.keywordNeeds})\\s+(?<needs>[a-zA-Z][a-zA-Z\\d]*(\\s*,\\s*[a-zA-Z][a-zA-Z\\d]*)*))?`); // library 名稱不能包含下劃綫

// 库结束正则
const endLibraryRegExp = new RegExp(`^\\s*${Keyword.keywordEndLibrary}\\b`);

function parseLibrarys(content: string): Array<Library> {
  const librarys = new Array<Library>();
  const lines = toLines(content);
  // 最后的library引用
  let endLibrary: Library;
  lines.forEach((line, index, _lines) => {
    if (libraryRegExp.test(line)) {
      const library = new Library;
      const result = libraryRegExp.exec(line);
      if (result && result.groups) {
        if (result.groups.name && Keyword.isNotKeyword(result.groups.name)) {
          library.name = result.groups.name;
        }
        if (result.groups.initializer && Keyword.isNotKeyword(result.groups.initializer)) {
          library.initializer = result.groups.initializer;
        }
        if (result.groups.needs) {
          const uses = result.groups.needs.split(/\s*,\s*/);
          library.needs = uses.filter(lib => Keyword.isNotKeyword(lib));
        }
      }

      // 设置开始行
      const position = new vscode.Position(index, 0)
      library.start = position;

      endLibrary = library;

      librarys.push(library);
    } else if (endLibraryRegExp.test(line)) {
      if(endLibrary){
        endLibrary.end = new vscode.Position(index, 0);
      }
      
    }
  });
  return librarys;
}

/**
 * 对全局变量做lib前缀处理
 * @param librarys 
 * @param globals 
 */
function resolveGlobal(librarys:Array<Library>, globals:Array<GlobalImpl>) {

  if (librarys.length > 0) {
    globals.forEach((global) => {

      if(librarys != null ){
        const library = librarys.find(library => library.range.contains(global.range));
        if (library) {
          if(global.library){
            Object.assign(global.library, library);
          }else {
            global.library = library;
          }
        }
      }

    });
  }

  return globals;
}

/**
 * 对方法做lib前缀处理
 * @param librarys 
 * @param globals 
 */
function resolveFunction(librarys:Array<Library>, functions:Array<Function>) {

  if (librarys.length > 0) {
    functions.forEach((func) => {

      if(librarys != null ){
        const library = librarys.find(library => library.range.contains(func.range));
        if (library) {
          if(func.library){
            Object.assign(func.library, library);
          }else{
            func.library = library;
          }
        }
      }

    });
  }

  return functions;

}

export {
  Library,
  parseLibrarys,
  resolveGlobal,
  resolveFunction,
};