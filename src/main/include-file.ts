import { includes, isVjassSupport } from "./configuration";
import { GlobalImpl, parseGlobals } from "./global";
import { Native, Function, parseFunctions, FunctionImpl } from "./function";
import { readFile, stat, exists } from "fs";
import { parse } from "path";
import { j, ai } from "./constant";
import { parseLibrarys, Library } from "./library";
import * as vscode from "vscode";

/*
获取包含文件
判断后缀
解析globals
解析方法
lib包含处理
*/

/**
 * 代表一个jass文件
 */
class Jass {
  private _fileName = "";

  private _globals = new Array<GlobalImpl>();
  public readonly natives = new Array<Native>();
  private _functions = new Array<Function>();

  constructor(fileName?: string) {
    if (fileName) {
      this._fileName = fileName;
    }
  }

  /**
   * 查询global
   */
  private _findGlobal(globalName: string): GlobalImpl | undefined {
    return this._globals.find(global => global.name == globalName);
  }

  private _findGlobalIndex(globalName: string): number {
    return this._globals.findIndex(global => global.name == globalName);
  }

  public putGlobal(global: GlobalImpl) {
    // 若果名称已经存在就替换，否则添加
    const glo = this._findGlobal(global.name);
    if (glo) {
      Object.assign(glo, global);
    } else {
      this._globals.push(global);
    }
  }

  public deleteGlobal(global: GlobalImpl) {
    const index = this._findGlobalIndex(global.name);
    if (index >= 0) {
      this._globals.splice(index, 1);
    }
  }

  public getGlobal(globalName: string): GlobalImpl | undefined {
    return this._findGlobal(globalName);
  }

  public get globals(): Array<GlobalImpl> {
    return this._globals;
  }

  // ================================== native
  /**
   * 查询function
   */
  private _findFunction(functionName: string): Function | undefined {
    return this._functions.find(func => func.name == functionName);
  }

  private _findFunctionIndex(functionName: string): number {
    return this._functions.findIndex(func => func.name == functionName);
  }

  public putFunction(func: Function) {
    // 若果名称已经存在就替换，否则添加
    const _func = this._findFunction(func.name);
    if (_func) {
      Object.assign(_func, func);
    } else {
      this._functions.push(func);
    }
  }

  public deleteFunction(func: Function) {
    const index = this._findFunctionIndex(func.name);
    if (index >= 0) {
      this._functions.splice(index, 1);
    }
  }

  public getFunction(functionName: string): Function | undefined {
    return this._findFunction(functionName);
  }

  public get functions(): Array<Function> {
    return this._functions;
  }

  public get fileName(): string {
    return this._fileName;
  }


}

// 保存用户的jass
const Jasss = Array<Jass>();

function parseJass(fileName: string) {

  // 处理控制符问题
  if (fileName.charCodeAt(0) == 8234) {
    fileName = fileName.substring(1);
  }
  console.log(fileName);
  // 保证文件存在 并且是文件 后缀必须是j或ai
  exists(fileName, exists => {
    if (exists) {
      console.log(fileName + " 存在");
      stat(fileName, (err, stats) => {
        if (err) {
          console.error(err.message);
        } else if (stats.isFile) {
          console.log(fileName + " 是文件");
          const parseFile = parse(fileName);
          if (parseFile.ext == j || parseFile.ext == ai) {
            console.log(fileName + " 后缀正确");
            readFile(fileName, (err, buffer) => {
              if (err) {
                console.error(err.message);
              } else {

                const content = buffer.toString("utf8");
                try {
                  const jass = _resolveJass(fileName, content);
                  console.log(jass);
                  Jasss.push(jass);
                }
                catch (err) {
                  console.error(err);
                }

              }
            });
          }
        }
      });
    }
  });
}

function _resolveJass(fileName: string, content: string) {

  const jass = new Jass(fileName);

  var librarys: Array<Library> | null = null;
  if (isVjassSupport()) {
    librarys = parseLibrarys(content);
  }

  // 分析globals
  const globals = parseGlobals(content);

  if (librarys && librarys.length > 0) {
    globals.forEach((global) => {

      if(librarys != null ){
        const library = librarys.find(library => library.range.contains(global.range));
        if (library) {
          global.library = library;
        }
      }
      
      jass.putGlobal(global);

    });
  } else {
    globals.forEach((global) => {
      jass.putGlobal(global);
    });
  }

  // 分析方法
  const functions = parseFunctions(content);
  if (librarys && librarys.length > 0) {
    functions.forEach((func) => {
      
      if(librarys != null){
        const library = librarys.find(library => {
          return library.range.contains(func.range);
        });
        if (library) {
          func.library = library;
        }
      }

      jass.putFunction(func);

    });
  } else {
    functions.forEach((func) => {
      jass.putFunction(func);
    });
  }
  return jass;

}

function parseFiles() {
  if (Jasss.length > 0) {
    Jasss.length = 0;
  }
  includes().forEach((fileName) => {
    parseJass(fileName);
  });
}

parseFiles();

vscode.workspace.onDidChangeConfiguration(event => {
  parseFiles();
});

export {
  Jasss
}