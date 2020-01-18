/*
整合所有jass文件
改变情况：用户输入，保存文件
*/

import * as vscode from 'vscode';
import { readFile, exists, stat, watch, FSWatcher } from 'fs';
import { GlobalImpl, parseGlobals } from './global';
import { Native, parseFunctions,Function, parseNatives } from './function';
import { parse } from 'path';
import { j, ai } from './constant';
import { isVjassSupport } from './configuration';
import { resolveGlobal, parseLibrarys, Library, resolveFunction } from './library';

/**
 * 比对两个路径指向的文件是否同一个
 * @param path1 
 * @param path2 
 */
function eq(path1:string,path2:string):boolean{
  return vscode.Uri.file(path1).fsPath == vscode.Uri.file(path1).fsPath;
}

class Jass {
  private _filePath:string = "";
  private _content:string = "";

  // 是否分析globals
  private _parseGlobals:boolean = true;
  // 是否分析function
  private _parseFunction:boolean = true;
  // 是否分析native
  private _parseNative:boolean = false;
  // 是否监听文件变化
  private _watchFile = false;
  private fSWatcher:FSWatcher|null =  null;

  private readonly globals = new Array<GlobalImpl>();
  public readonly natives = new Array<Native>();
  private readonly functions = new Array<Function>();
  
  public constructor(filePath:string,watchFile = false,parseGlobals = true,parseFunction = true, parseNative = false){
    this._parseGlobals = parseGlobals;
    this._parseFunction = parseFunction,
    this._parseNative = parseNative;
    this._watchFile = watchFile;
    this.init(filePath);
  }

  private init(filePath:string){
    exists(filePath, exists => {
      if (exists) {
        console.log(filePath + " 存在");
        stat(filePath, (err, stats) => {
          if (err) {
            console.error(err.message);
            throw err.message;
          } else if (stats.isFile) {
            console.log(filePath + " 是文件");
            const parseFile = parse(filePath);
            if (parseFile.ext == j || parseFile.ext == ai) {
              console.log(filePath + " 后缀正确");
              readFile(filePath, (err, buffer) => {
                if (err) {
                  console.error(err.message);
                  throw err.message;
                } else {
                  /// 分析文件
                  this._filePath = vscode.Uri.file(filePath).fsPath;
                  this._content = buffer.toString("utf8");
                  this._parse();
                  this._initEvent();
                }
              });
            }
          }
        });
      }else{
        throw `${filePath}不存在`;
      }
    });
  }

  /**
   * 根据条件分析文件
   */
  private _parse(){

    const vjassSupport = isVjassSupport();

    var librarys: Array<Library> = vjassSupport ? parseLibrarys(this._content) : new Array<Library>();

    if(this._parseGlobals){
      this.globals.length = 0;
      if(vjassSupport){
        resolveGlobal(librarys, parseGlobals(this._content)).forEach(global => {
          this.globals.push(global);
        });
      }else{
        parseGlobals(this._content).forEach(global => {
          this.globals.push(global);
        });
      }
    }

    if(this._parseFunction){
      this.functions.length = 0;
      if(vjassSupport){
        resolveFunction(librarys, parseFunctions(this._content)).forEach(func => {
          this.functions.push(func);
        });
      }else{
        parseFunctions(this._content).forEach(func => {
          this.functions.push(func);
        });
      }
    }

    if(this._parseNative){
      this.natives.length = 0;
      parseNatives(this._content).forEach(native => {
        this.natives.push(native);
      });
    }

  }

  private _initEvent(){
    if(this._watchFile){
      this.fSWatcher = watch(this.filePath,{
       encoding: "utf8" 
      },(content:string,fileName:string)=>{
        // 比对文件内容是否发生变化
        if(this._content != content){
          this._content = content;
          this._parse();
        }
      });
    }
  }

  public get filePath() : string {
    return this._filePath;
  }
  
  public get needParseGlobals() : boolean {
    return this._parseGlobals;
  }
  
  public set needParseGlobals(need : boolean) {
    this._parseGlobals = need;
  }
  
  public get needParseFunction() : boolean {
    return this._parseFunction;
  }

  public set needParseFunction(need : boolean) {
    this._parseFunction = need;
  }

  public get needParseNative() : boolean {
    return this._parseNative;
  }

  public set needParseNative(need : boolean) {
    this._parseNative = need;
  }

  /**
   * 开启或关闭监听文件
   * @param watch 
   */
  public resetWatch(watchFile:boolean){
    if(this._watchFile != watchFile){
      this._watchFile = watchFile;
      if(this._watchFile){
        if(!this.fSWatcher){
          this._initEvent();
        }
      }else{
        this.fSWatcher?.close();
      }
    }
  }

  public static eq(jass1:Jass,jass2:Jass):boolean{
    return jass1.filePath == jass2.filePath;
  }

}

export {
  Jass
};


