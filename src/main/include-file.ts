import { includes, /* isVjassSupport */ } from "./configuration";
import { readFile, stat, exists, readdir } from "fs";
import { parse, resolve } from "path";
import { j, ai } from "./constant";
// import { parseLibrarys, Library } from "./library";
import * as vscode from "vscode";
import { Jass } from "./jass";
import { parseGlobals } from "./global";
import { parseFunctions,Function } from "./function";

/*
获取包含文件
判断后缀
解析globals
解析方法
lib包含处理 -》 已经去除
*/



// 保存用户的jass
const Jasss = Array<Jass>();

function parseJass(fileName: string) {

  // 处理控制符问题
  if (fileName.charCodeAt(0) == 8234) {
    fileName = fileName.substring(1);
  }
  // 保证文件存在 并且是文件 后缀必须是j或ai
  exists(fileName, exists => {
    if (exists) {
      // console.log(fileName + " 存在");
      stat(fileName, (err, stats) => {
        if (err) {
          console.error(err.message);
        } else if (stats.isFile()) {
          // console.log(fileName + " 是文件");
          const parseFile = parse(fileName);
          if (parseFile.ext == j || parseFile.ext == ai) {
            // console.log(fileName + " 后缀正确");
            readFile(fileName, (err, buffer) => {
              if (err) {
                console.error(err.message);
              } else {

                const content = buffer.toString("utf8");
                const jass = _resolveJass(fileName, content);
                  Jasss.push(jass);

              }
            });
          }
        }else if(stats.isDirectory()){
          readdir(fileName,(err,files) => {
            if(err){
              console.error(err);
              throw err.message;
            }else{
              files.forEach(file => {
                parseJass(resolve(fileName, file));
              });
            }
          });
        }
      });
    }
  });
}

function _resolveJass(fileName: string, content: string) {

  const jass = new Jass(fileName);

  // var librarys: Array<Library> | null = null;
  // if (isVjassSupport()) {
  //   librarys = parseLibrarys(content);
  // }

  // 分析globals
  const globals = parseGlobals(content);

  // if (librarys && librarys.length > 0) {
  //   globals.forEach((global) => {

  //     if(librarys != null ){
  //       const library = librarys.find(library => library.range.contains(global.range));
  //       if (library) {
  //         global.library = library;
  //       }
  //     }
      
  //     jass.putGlobal(global);

  //   });
  // } else {
  //   globals.forEach((global) => {
  //     jass.putGlobal(global);
  //   });
  // }

  globals.forEach((global) => {
    jass.putGlobal(global);
  });

  // 分析方法
  const functions = parseFunctions(content);
  // if (librarys && librarys.length > 0) {
  //   functions.forEach((func) => {
      
  //     if(librarys != null){
  //       const library = librarys.find(library => {
  //         return library.range.contains(func.range);
  //       });
  //       if (library) {
  //         func.library = library;
  //       }
  //     }

  //     jass.putFunction(func);

  //   });
  // } else {
  //   functions.forEach((func) => {
  //     jass.putFunction(func);
  //   });
  // }

  functions.forEach((func) => {
    jass.putFunction(func);
  });
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