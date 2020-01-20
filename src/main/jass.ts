import { GlobalImpl } from "./global";
import { Native,Function } from "./function";

/**
 * 代表一个jass文件
 */
export class Jass {
  private _fileName = "";

  private _globals = new Array<GlobalImpl>();
  public  natives = new Array<Native>();
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