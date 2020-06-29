import { readFile, writeFile, readFileSync, writeFileSync } from "fs";
import { commonJFilePath, blizzardJFilePath, commonAiFilePath, DzAPIJFilePath } from "./path";
import { parseGlobals, Global, GlobalConstant, GlobalArray } from "./global";
import { Native, parseNatives, Function, parseFunctions, FunctionImpl } from "./function";
import { Jass } from "./jass";

// const start2 = new Date().getTime();
// let col = 0;
/**
 * jass文件内容
 */

let _commonJContent = "";
let _blizzardJContent = "";
let _commonAiContent = "";
let _dzApicommonJContent = "";

const CommonJGlobals = new Array<Global | GlobalConstant | GlobalArray>();
const BlizzardJGlobals = new Array<Global | GlobalConstant | GlobalArray>();
const CommonAiGlobals = new Array<Global | GlobalConstant | GlobalArray>();
const DzApiJGlobals = new Array<Global | GlobalConstant | GlobalArray>();

const CommonJNatives = new Array<Native>();
const BlizzardJNatives = new Array<Native>();
const CommonAiNatives = new Array<Native>();
const DzApiJNatives = new Array<Native>();

const CommonJFunctions = new Array<Function>();
const BlizzardJFunctions = new Array<Function>();
const CommonAiFunctions = new Array<Function>();
const DzApiJFunctions = new Array<Function>();

const CommonJJass = new Jass(commonJFilePath);
const BlizzardJJass = new Jass(blizzardJFilePath);
const CommonAiJJass = new Jass(commonAiFilePath);
const DzApiJJass = new Jass(DzAPIJFilePath);

readFile(commonJFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _commonJContent = data.toString("utf8");
    const globals = parseGlobals(_commonJContent);
    const natives = parseNatives(_commonJContent);
    const functions = parseFunctions(_commonJContent);


    Object.assign(CommonJGlobals, globals);
    Object.assign(CommonJNatives, natives);
    Object.assign(CommonJFunctions, functions);

    globals.forEach(global => {
      CommonJJass.putGlobal(global);
    });
    functions.forEach(func => {
      CommonJJass.putFunction(func);
    });
    CommonJJass.natives = natives;

  }
  // col += new Date().getTime() - start2;
  // console.log(col)
});
readFile(blizzardJFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _blizzardJContent = data.toString("utf8");


    const globals = parseGlobals(_blizzardJContent);
    const natives = parseNatives(_blizzardJContent);
    const functions = parseFunctions(_blizzardJContent);

    
    Object.assign(BlizzardJGlobals, globals);
    Object.assign(BlizzardJNatives, natives);
    Object.assign(BlizzardJFunctions, functions);

    globals.forEach(global => {
      BlizzardJJass.putGlobal(global);
    });
    functions.forEach(func => {
      BlizzardJJass.putFunction(func);
    });
    BlizzardJJass.natives = natives;
    
  }

  // col += new Date().getTime() - start2;
  // console.log(col)
});
readFile(commonAiFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _commonAiContent = data.toString("utf8");
    const globals = parseGlobals(_commonAiContent);
    const natives = parseNatives(_commonAiContent);
    const functions = parseFunctions(_commonAiContent);
    Object.assign(CommonAiGlobals, globals);
    Object.assign(CommonAiNatives, natives);
    Object.assign(CommonAiFunctions, functions);

    globals.forEach(global => {
      CommonAiJJass.putGlobal(global);
    });
    functions.forEach(func => {
      CommonAiJJass.putFunction(func);
    });
    CommonAiJJass.natives = natives;
  }

  // col += new Date().getTime() - start2;
  // console.log(col)
});
readFile(DzAPIJFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _dzApicommonJContent = data.toString("utf8");
    const globals = parseGlobals(_dzApicommonJContent);
    const natives = parseNatives(_dzApicommonJContent);
    const functions = parseFunctions(_dzApicommonJContent);
    Object.assign(DzApiJGlobals, globals);
    Object.assign(DzApiJNatives, natives);
    Object.assign(DzApiJFunctions, functions);

    globals.forEach(global => {
      DzApiJJass.putGlobal(global);
    });
    functions.forEach(func => {
      DzApiJJass.putFunction(func);
    });
    DzApiJJass.natives = natives;
  }

  // col += new Date().getTime() - start2;
  // console.log(col)
});

function commonJContent(): string {
  return _commonJContent;
}
function blizzardJContent(): string {
  return _blizzardJContent;
}
function commonAiContent(): string {
  return _commonAiContent;
}
function dzApiJContent(): string {
  return _dzApicommonJContent;
}

export {
  commonJContent,
  blizzardJContent,
  commonAiContent,
  dzApiJContent,

  CommonJGlobals,
  BlizzardJGlobals,
  CommonAiGlobals,
  DzApiJGlobals,

  CommonJNatives,
  BlizzardJNatives,
  CommonAiNatives,
  DzApiJNatives,

  CommonJFunctions,
  BlizzardJFunctions,
  CommonAiFunctions,
  DzApiJFunctions,

  CommonJJass,
  BlizzardJJass,
  CommonAiJJass,
  DzApiJJass,
};

// console.log("解析时间 = " + (new Date().getTime() - start2) + "毫秒");

