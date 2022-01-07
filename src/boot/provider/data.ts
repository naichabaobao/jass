import { Options } from "./options";
import * as fs from "fs";
import * as vscode from "vscode";

import { isAiFile, isJFile, isZincFile, resolvePaths } from "../tool";
import * as jassParse from "../jass/parse";
import * as jassAst from "../jass/ast";
import {Program} from "../jass/ast";

import * as zincParse from "../zinc/parse";
import * as zincAst from "../zinc/ast";

import * as vjassParse from "../vjass/parse";


class Pair {
  public key: string;
  public value: Program;

  constructor(key: string, value: Program) {
    this.key = key;
    this.value = value;
  }

}

class Map {
  private pairs: Pair[] = [];

  public put(key: string, value: Program) {

  }

}

const commonJProgram = jassParse.parse(fs.readFileSync(Options.commonJPath).toString(), {
  needParseNative: true
});
// new Program(Options.commonJPath, fs.readFileSync(Options.commonJPath).toString());

const commonAiProgram = jassParse.parse(fs.readFileSync(Options.commonAiPath).toString(), {
  needParseNative: false
});
// new Program(Options.commonAiPath, fs.readFileSync(Options.commonAiPath).toString());

const blizzardJProgram = jassParse.parse(fs.readFileSync(Options.blizzardJPath).toString(), {
  needParseNative: false
});
// new Program(Options.blizzardJPath, fs.readFileSync(Options.blizzardJPath).toString());


const dzApiJProgram = jassParse.parse(fs.readFileSync(Options.dzApiJPath).toString(), {
  needParseNative: true
});
// new Program(Options.dzApiJPath, fs.readFileSync(Options.dzApiJPath).toString());

// const includePrograms = Options.includes.map(path => {
//   const content = fs.readFileSync(path).toString();
//   const program = new Program(path, content);
//   return program;
// });

/* vjass块 过时
const includeMap = new Map<string, jassAst.Program>();

Options.includes.map(path => {
  const content = fs.readFileSync(path).toString();
  const program = jassParse.parse(content, {
    needParseNative: true
  });
  includeMap.set(path, program);
});

const includeJassPrograms = [...includeMap.values()];


const programs = [commonJProgram, commonAiProgram, dzApiJProgram, blizzardJProgram, ...includeJassPrograms];
const scopes = includePrograms.map(program => program.allScope).flat();
const librarys = includePrograms.map(program => program.librarys).flat();
const types = includePrograms.map(program => program.types).flat();
const structs = includePrograms.map(program => program.allStructs).flat();


const natives = programs.map(program => program.natives).flat();
const functions = programs.map(program => program.functions).flat();
const globals = programs.map(program => program.globals).flat();
*/

const JassMap = new Map<string, jassAst.Program>();
const ZincMap = new Map<string, zincAst.Program>();
const VjassMap = new Map<string, jassAst.Program>();

/**
 * 解析工作目录下所有j文件
 */
function parseWorkspaceFiles(floders = vscode.workspace.workspaceFolders) {
  if (!floders) {
    return;
  }

  floders.forEach((floder) => {

    const files = resolvePaths([floder.uri.fsPath]);

    files.forEach((filePath) => {
      const content = fs.readFileSync(filePath).toString();
      if (isJFile(filePath)) {
        const jassProgram = jassParse.parse(content, {
          needParseLocal: true
        });
        JassMap.set(filePath, jassProgram);
        const vjassProgram = vjassParse.parse(content);
        VjassMap.set(filePath, vjassProgram);
        const zincProgram: zincAst.Program = zincParse.parse(content);
        ZincMap.set(filePath, zincProgram);
      } else if (isAiFile(filePath)) {
        const jassProgram = jassParse.parse(content, {
          needParseLocal: true
        });
        JassMap.set(filePath, jassProgram);
        const vjassProgram = vjassParse.parse(content);
        VjassMap.set(filePath, vjassProgram);
        const zincProgram: zincAst.Program = zincParse.parse(content);
        ZincMap.set(filePath, zincProgram);
      } else if (isZincFile(filePath)) {
        const zincProgram: zincAst.Program = zincParse.parse(content, true);
        ZincMap.set(filePath, zincProgram);
      }

    });

  });
}
parseWorkspaceFiles();




/* 不起作用，暂时不知道有什么用
function watchWorkspaceChange() {
  vscode.workspace.onDidChangeWorkspaceFolders((event) => {
    console.log("工作目录改变")
    parseWorkspaceFiles([...event.added]);
  
    event.removed.forEach((floder) => {
      const files = resolvePaths([floder.uri.fsPath]);
  
      files.forEach((file) => {
  
        workMap.delete(file);
  
      });
  
    });
  
  });
}

watchWorkspaceChange();
*/
function startWatch() {

  //#region jass and zinc
  const watcher = vscode.workspace.createFileSystemWatcher("**/*{.j,.ai,.jass}", false, false, false);
  watcher.onDidCreate((event) => {
    const content = fs.readFileSync(event.fsPath).toString();
    const program = jassParse.parse(content, {
      needParseLocal: true
    });
    JassMap.set(event.fsPath, program);
    const vjassProgram = vjassParse.parse(content);
    VjassMap.set(event.fsPath, vjassProgram);
    const zincProgram: zincAst.Program = zincParse.parse(content);
    ZincMap.set(event.fsPath, zincProgram);
  });
  watcher.onDidDelete((event) => {

    JassMap.delete(event.fsPath);
    VjassMap.delete(event.fsPath);
    ZincMap.delete(event.fsPath);
  });
  // 类似于保存，暂时未发现有其他作用
  watcher.onDidChange((event) => {

    const content = fs.readFileSync(event.fsPath).toString();
    const program = jassParse.parse(content, {
      needParseLocal: true
    });
    JassMap.set(event.fsPath, program);
    const vjassProgram = vjassParse.parse(content);
    VjassMap.set(event.fsPath, vjassProgram);
    const zincProgram: zincAst.Program = zincParse.parse(content);
    ZincMap.set(event.fsPath, zincProgram);
  });
  //#endregion
  //#region zinc
  const zincWatcher = vscode.workspace.createFileSystemWatcher("**/*.zn", false, false, false);
  zincWatcher.onDidCreate((event) => {
    const zincProgram: zincAst.Program = zincParse.parse(fs.readFileSync(event.fsPath).toString());
    ZincMap.set(event.fsPath, zincProgram);
  });
  zincWatcher.onDidDelete((event) => {
    ZincMap.delete(event.fsPath);
  });
  zincWatcher.onDidChange((event) => {
    const zincProgram: zincAst.Program = zincParse.parse(fs.readFileSync(event.fsPath).toString());
    ZincMap.set(event.fsPath, zincProgram);
  });
  //#endregion

  vscode.workspace.onDidChangeTextDocument((event) => {

  });

}
startWatch();

/**
 * 通过方法名称查询方法
 * @param name 方法名称
 * @returns 
 */
function findFunctionByName(name: string): jassAst.Native | undefined {
  return [...commonJProgram.natives, ...commonJProgram.functions,
  ...blizzardJProgram.natives, ...blizzardJProgram.functions,
  ...commonAiProgram.natives, ...commonAiProgram.functions,
  ...dzApiJProgram.natives, ...dzApiJProgram.functions,
  ...[...JassMap.values()].flatMap((program) => [...program.natives, ...program.functions]),
  ...[...VjassMap.values()].flatMap((program) => [...program.librarys.flatMap((library) => library.functions)]),
  ].find(func => func.name == name);
}

function findFunctionByLine(key:string, line:number) {
  const program = JassMap.get(key);

  if (program) {
    const func = program.functions.find((func) => func.loc.start.line < line && func.loc.end.line > line);
    if (func) {
      return func;
    }
  }
  const vprogram = VjassMap.get(key);
  if (vprogram) {
    return vprogram.librarys.flatMap((library) => library.functions).find((func) => func.loc.start.line < line && func.loc.end.line > line);
  }
}

/**
 * 找到当前行方法的takes
 * @param key 文件路径
 * @param line 
 * @returns 
 */
function findTakes(key:string, line:number) {
  return findFunctionByLine(key, line)?.takes;
}

/**
 * 找到当前行的local
 * @param key 文件路径
 * @param line 
 * @returns 
 */
function findLocals(key:string, line:number) {
  return findFunctionByLine(key, line)?.locals;
}

/**
 * 获取全局非constant修饰的
 * @returns 
 */
function getGlobalVariables() {
  const VariableFilter = (global: jassAst.Global) => {
    return !global.isConstant;
  };

  const globals:(jassAst.Global|jassAst.Global)[] = [];

  const commonJGlobals = commonJProgram.globals.filter(VariableFilter);
  const commonAiGlobals = commonAiProgram.globals.filter(VariableFilter);
  const blizzardJGlobals = blizzardJProgram.globals.filter(VariableFilter);
  const dzApiJGlobals = dzApiJProgram.globals.filter(VariableFilter);
  globals.push(...commonJGlobals, ...commonAiGlobals, ...blizzardJGlobals, ...dzApiJGlobals);

  JassMap.forEach((program, key) => {
    globals.push(...program.globals.filter(VariableFilter));
  });

  VjassMap.forEach((program, key) => {
    program.librarys.forEach((library) => {
      globals.push(...library.globals.filter(VariableFilter));
    });
  });
  return globals;
}

/**
 * 找到排除类型以外的方法
 * @param types 
 * @returns 
 */
function findFunctionExcludeReturns(...types:(string|null)[]) {
  // types包含null值时代表排除所有返回值为nothing的方法
  const nothing = types.some((type) => type === null);
  return [...commonJProgram.natives, ...commonJProgram.functions,
    ...blizzardJProgram.natives, ...blizzardJProgram.functions,
    ...commonAiProgram.natives, ...commonAiProgram.functions,
    ...dzApiJProgram.natives, ...dzApiJProgram.functions,
    ...[...JassMap.values()].flatMap((program) => [...program.natives, ...program.functions]),
    ...[...VjassMap.values()].flatMap((program) => [...program.librarys.flatMap((library) => library.functions)]),
    ].filter(func => {
      if (nothing) {
        return func.returns !== null && !types.includes(func.returns);
      } else {
        return !types.includes(func.returns);
      }
    });
}


/**
 * 找到排除类型以外的全局量
 * @param types 
 * @returns 
 */
 function findGlobalExcludeReturns(...types:string[]) {
  return [...commonJProgram.globals,
    ...blizzardJProgram.globals,
    ...commonAiProgram.globals,
    ...dzApiJProgram.globals,
    ...[...JassMap.values()].flatMap((program) => program.globals),
    ...[...VjassMap.values()].flatMap((program) => [...program.librarys.flatMap((library) => library.globals)]),
    ].filter(func => {
      return !types.includes(func.type);
    });
}



interface GlobalSearchOption {
  modifier?: "constant" | "variable";
  array?: boolean;
  type?: string| string[];
  name?: string| string[];
  key?: string| string[];
  jass?: boolean;
  vjass?: boolean;
  zinc?: boolean;
}

interface FunctionSearchOption {
  modifier?: "private" | "public" | "default";
  returns?: string| string[];
  name?: string| string[];
  key?: string| string[];
  jass?: boolean;
  vjass?: boolean;
  zinc?: boolean;
}
class Data {
  private is:boolean = false;
  private static map = new Map<string, jassAst.Program>();

  private _programs = [
    commonJProgram,
    blizzardJProgram,
    dzApiJProgram,
    commonAiProgram,
    ...Data.map.values()
  ].flat();

  constructor() {
    if (this.is == false) {
      // this.initData();
      this.is = true;
    }
  }
  
  private initData() {
    const filePaths = [Options.commonJPath, Options.commonAiPath, Options.blizzardJPath, Options.dzApiJPath];
    filePaths.forEach((filePath) => {
      const program = jassParse.parse(fs.readFileSync(filePath).toString());
      program.filePath = filePath;
      Data.map.set(filePath, program);
    });
  }

  public findGlobalsByType(option: GlobalSearchOption) {
    const programs = option.key 
    ? Array.isArray(option.key) ? <jassAst.Program[]>option.key.map(filePath => Data.map.get(filePath)).filter(x => x) : <jassAst.Program[]>[Data.map.get(option.key)].filter(x => x)
    : [...Data.map.values()];
    const globals = programs.map(x => {
      let globals:jassAst.Global[] = [];
      if (option.jass === undefined || option) {
        globals.push(...x.globals);
      }
      /*
      if (!Options.isOnlyJass && option.vjass) {
        globals.push(...x.librarys.map(lib => lib.globals).flat());
      }
      if (!Options.isOnlyJass && Options.supportZinc && option.zinc) {
        globals.push(...x.librarys.map(lib => lib.globals).flat());
      }*/
      if (option.modifier) {
        globals = globals.filter(global => option.modifier == "constant" ? global.isConstant : !global.isConstant);
      }
      if (option.array) {
        globals = globals.filter(global => global.isArray);
      }
      if (option.type) {
        globals = globals.filter(global => global.type == option.type);
      }
      if (option.name) {
        globals = globals.filter(global => global.name == option.name);
      }
      return globals;
    }).flat();
    return globals;
  }
  /**
   * 
   * @param option 暂时无效
   */
  public findFunctionsByType(option: FunctionSearchOption) {
    const functions:(jassAst.Func|jassAst.Native)[] = [];
    JassMap.forEach((program, key) => {
      console.log(key);
      
      functions.push(...program.natives, ...program.functions);
    });
    return functions;
  }
}
const data = new Data();

export default data;

export {
  commonJProgram,
  commonAiProgram,
  blizzardJProgram,
  dzApiJProgram,
  JassMap,
  ZincMap,
  VjassMap,
  findFunctionByName,
  findTakes,
  findLocals,
  getGlobalVariables,
  findFunctionExcludeReturns,
  findGlobalExcludeReturns
};