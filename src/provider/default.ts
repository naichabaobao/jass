import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Program } from "../jass/ast";
import { CommonAiGlobals } from "../main/file";


// vscode.languages.registerCompletionItemProvider(language, new CompletionItemProvider);

function configuration(){
  return vscode.workspace.getConfiguration("jass");
}

function _resolvePaths(paths:Array<string>) {
  return paths.map(val => {
    const arr = new Array<string>();
    // 处理控制符问题
    // if (val.charCodeAt(0) == 8234) {
    //   val = val.substring(1);
    // }
    if(!fs.existsSync(val)) {
      return arr;
    }
    const stat = fs.statSync(val);
    if(stat.isFile()) {
      arr.push(val);
    }else if(stat.isDirectory()){
      const subPaths = fs.readdirSync(val).map(fileName => path.resolve(val, fileName));
      arr.push(..._resolvePaths(subPaths));
    }
    return arr;
  }).flat();
}

/**
 * 获取包含的所有文件,一般不适用此方法,而是使用getIncludeJPaths()
 */
function getIncludePaths() {
  const includes = configuration()["includes"] as Array<string>;
  return _resolvePaths(includes);
}

/**
 * 获取包含的.j文件
 */
function getIncludeJPaths() {
  return getIncludePaths().filter(val => isJFile(val));
}

/**
 * 获取包含的.j文件
 */
function getIncludeAiPaths() {
  return getIncludePaths().filter(val => isAiFile(val));
}

function getCommonJPath() {
  return isUsableJFile(configuration()["common_j"] as string) ? configuration()["common_j"] as string : path.resolve(__dirname, "../../src/resources/static/jass/common.j");
}

function getBlizzardJPath() {
  return isUsableJFile(configuration()["blizzard"] as string) ? configuration()["blizzard"] as string : path.resolve(__dirname, "../../src/resources/static/jass/blizzard.j");
}

function getCommonAiPath() {
  return isUsableAiFile(configuration()["common_ai"] as string) ? configuration()["common_ai"] as string : path.resolve(__dirname, "../../src/resources/static/jass/common.ai");
}

function getDzApiJPath() {
  return isUsableJFile(configuration()["dz"] as string) ? configuration()["dz"] as string : path.resolve(__dirname, "../../src/resources/static/jass/DzAPI.j");
}

function isUsableFile(filePath:string) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function isUsableJFile(filePath:string) {
  return isUsableFile(filePath) && isJFile(filePath);
}

function isUsableAiFile(filePath:string) {
  return isUsableFile(filePath) && isAiFile(filePath);
}

function isJFile(filePath:string) {
  return path.parse(filePath).ext == ".j";
}

function isAiFile(filePath:string) {
  return path.parse(filePath).ext == ".ai";
}


let commonProgram:Program = null as any;
function initCommonJPrograms() {
  commonProgram = new Program().parse(fs.readFileSync(getCommonJPath()).toString("utf8")).setFileName(getCommonJPath());
}
initCommonJPrograms();

let blizzardProgram:Program = null as any;
function initBlizzardJPrograms() {
  blizzardProgram = new Program().parse(fs.readFileSync(getBlizzardJPath()).toString("utf8")).setFileName(getBlizzardJPath());
}
initBlizzardJPrograms();

let commonAiProgram:Program = null as any;
function initCommonAiPrograms() {
  commonAiProgram = new Program().parse(fs.readFileSync(getCommonAiPath()).toString("utf8")).setFileName(getCommonAiPath());
}
initCommonAiPrograms();

let dzProgram:Program = null as any;
function initDzJPrograms() {
  dzProgram = new Program().parse(fs.readFileSync(getDzApiJPath()).toString("utf8")).setFileName(getDzApiJPath());
}
initDzJPrograms();

let includeJPrograms:Program[] = null as any;

function initIncludeJPrograms() {
  includeJPrograms = getIncludeJPaths().map(val => new Program().parse(fs.readFileSync(val).toString("utf8")).setFileName(val));
}

initIncludeJPrograms();

let includeAiPrograms:Program[] = null as any;

function initIncludeAiPrograms() {
  includeAiPrograms = getIncludeAiPaths().map(val => new Program().parse(fs.readFileSync(val).toString("utf8")).setFileName(val));
}

initIncludeAiPrograms();

// 注册includes修改时从新解析
vscode.workspace.onDidChangeConfiguration(e => {
  // 如果includes改变了
  if(e.affectsConfiguration("jass.includes")) {
    initIncludeJPrograms();
    initIncludeAiPrograms();
  }
  if(e.affectsConfiguration("jass.common_j")) {
    if(!isUsableJFile((configuration()["common_j"] as string))) {
      initCommonJPrograms();
    }
  }
  if(e.affectsConfiguration("jass.blizzard")) {
    if(!isUsableJFile((configuration()["blizzard"] as string))) {
      initBlizzardJPrograms();
    }
  }
  if(e.affectsConfiguration("jass.common_ai")) {
    if(!isUsableAiFile((configuration()["common_ai"] as string))) {
      initCommonAiPrograms();
    }
  }
  if(e.affectsConfiguration("jass.dz")) {
    if(!isUsableJFile((configuration()["dz"] as string))) {
      initDzJPrograms();
    }
  }
});



/*
2020年6月28日 5204毫秒
*/

/*
console.log(dzProgram.globalVariables().length)
console.log(dzProgram.natives().length)
console.log(dzProgram.functions().length)

includeJPrograms.forEach(val => {
  console.log(val.fileName)
  console.log(val.globalVariables().length)
  console.log(val.natives().length)
  console.log(val.functions().length)
});

*/

export{
  commonProgram,
  blizzardProgram,
  commonAiProgram,
  dzProgram,
  includeJPrograms,
  includeAiPrograms
};