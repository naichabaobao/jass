import { Function } from "./function";
import { Keyword } from "./keyword";

class Library {
  public name = "";
  public initializer:string = "";
  // 三个作用一样
  private _needs  = new Array<string>();
  private _requires  = new Array<string>();
  private _uses  = new Array<string>();

  
  public get needs() :Array<string> {
    return this._needs;
  }

  
  public set needs(needs : Array<string>) {
    this.needs = needs;
    this._requires = needs;
    this._uses = needs;
  }

  public get requires() :Array<string> {
    return this._requires;
  }

  
  public set requires(requires : Array<string>) {
    this.needs = requires;
    this._requires = requires;
    this._uses = requires;
  }

  public get uses() :Array<string> {
    return this._uses;
  }

  
  public set uses(uses : Array<string>) {
    this.needs = uses;
    this._requires = uses;
    this._uses = uses;
  }
  

}

const libraryRegExp = new RegExp(`${Keyword.keywordLibrary}\\s+(?<name>[a-zA-Z][a-zA-Z\\d]*)(\\s+${Keyword.keyworInitializer}\\s+(?<initializer>[a-zA-Z][a-zA-Z0-9_]*))?(\\s+(${Keyword.keywordRequires}|${Keyword.keywordUses}|${Keyword.keywordNeeds})\\s+(?<needs>[a-zA-Z][a-zA-Z\\]*(\\s*,\\s*[a-zA-Z][a-zA-Z\\d]*)*))?`); // library 名稱不能包含下劃綫

function parseLibrarys(content: string): Array<Library> {
  const librarys = new Array<Library>();
  if (libraryRegExp.test(content)) {
    const library = new Library;
    const result = libraryRegExp.exec(content);
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
    librarys.push(library);
  }
  return librarys;
}

export {
  Library,
};