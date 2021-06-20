import { Options } from "./options";
import * as fs from "fs";
import * as vscode from "vscode";

import { Program } from "./jass-parse";
import { isAiFile, isJFile, resolvePaths } from "../tool";
import { parse } from "../jass/parse";
import * as jass from "../jass/ast";


const commonJProgram = parse(fs.readFileSync(Options.commonJPath).toString(), {
  needParseNative: true
});
// new Program(Options.commonJPath, fs.readFileSync(Options.commonJPath).toString());

const commonAiProgram = parse(fs.readFileSync(Options.commonAiPath).toString(), {
  needParseNative: true
});
// new Program(Options.commonAiPath, fs.readFileSync(Options.commonAiPath).toString());

const blizzardJProgram = parse(fs.readFileSync(Options.blizzardJPath).toString(), {
  needParseNative: true
});
// new Program(Options.blizzardJPath, fs.readFileSync(Options.blizzardJPath).toString());


const dzApiJProgram = parse(fs.readFileSync(Options.dzApiJPath).toString(), {
  needParseNative: true
});
// new Program(Options.dzApiJPath, fs.readFileSync(Options.dzApiJPath).toString());

const includePrograms = Options.includes.map(path => {
  const content = fs.readFileSync(path).toString();
  const program = new Program(path, content);
  return program;
});


const includeMap = new Map<string, jass.Program>();

Options.includes.map(path => {
  const content = fs.readFileSync(path).toString();
  const program = parse(content, {
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

const workMap = new Map<string, jass.Program>();

/**
 * 解析工作目录下所有j文件
 */
function parseWorkspaceFiles(floders = vscode.workspace.workspaceFolders) {
  if (!floders) {
    return;
  }

  floders.forEach((floder) => {
    console.time("workspace");
    const files = resolvePaths([floder.uri.fsPath]);
    console.timeEnd("workspace");
    files.forEach((file) => {

      if (isJFile(file)) {
        const program = parse(fs.readFileSync(file).toString(), {
          needParseLocal: true
        });
        workMap.set(file, program);
      } else if (isAiFile(file)) {
        fs.readFile(file, {
          encoding: "utf-8"
        }, (err, data) => {
          const program = parse(data, {
            needParseLocal: true
          });
          workMap.set(file, program);
        });
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

  const watcher = vscode.workspace.createFileSystemWatcher("**/*.j", false, false, false);
  watcher.onDidCreate((event) => {
    console.log("onDidCreate " + event.fsPath);
    const program = parse(fs.readFileSync(event.fsPath).toString(), {
      needParseLocal: true
    });
    workMap.set(event.fsPath, program);

  });
  watcher.onDidDelete((event) => {
    console.log("onDidDelete " + event.fsPath);
    workMap.delete(event.fsPath);
  });
  // 类似于保存，暂时未发现有其他作用
  watcher.onDidChange((event) => {
    console.log("onDidChange " + event.fsPath);
    
    const program = parse(fs.readFileSync(event.fsPath).toString(), {
      needParseLocal: true
    });
    workMap.set(event.fsPath, program);

  });


  vscode.workspace.onDidChangeTextDocument((event) => {
    console.log("change")
  });

}
startWatch();
/**
 * 获取工作目录下已经解析完的jass文件
 * @returns 
 */
function getWorkspaceFiles() {
  const programs: jass.Program[] = [];

  for (const key in workMap) {
    if (workMap.has(key)) {
      const program = <jass.Program>workMap.get(key)
      programs.push(program);
    }
  }

  return programs;
}

function getWorkspaceJson() {
  let obj:any = {};
  for (let[k,v] of workMap) {
      obj[k] = v;
  }
  return obj;
}

export {
  commonJProgram,
  commonAiProgram,
  blizzardJProgram,
  dzApiJProgram,
  includePrograms,
  programs,
  types,
  natives,
  functions,
  globals,
  structs,
  scopes,
  librarys,
  workMap,
  includeJassPrograms,
  includeMap
};