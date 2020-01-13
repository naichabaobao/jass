import { readFile } from "fs";
import { commonJFilePath, blizzardJFilePath, commonAiFilePath, DzAPIJFilePath } from "./path";
import { parseGlobals, Global, GlobalConstant, GlobalArray } from "./global";
import { Native, parseNatives, Function, parseFunctions } from "./function";

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

const CommonJFunctions= new Array<Function>();
const BlizzardJFunctions = new Array<Function>();
const CommonAiFunctions = new Array<Function>();
const DzApiJFunctions = new Array<Function>();

readFile(commonJFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _commonJContent = data.toString("utf8");
    Object.assign(CommonJGlobals, parseGlobals(_commonJContent));
    Object.assign(CommonJNatives, parseNatives(_commonJContent));
    Object.assign(CommonJFunctions, parseFunctions(_commonJContent));
  }
});
readFile(blizzardJFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _blizzardJContent = data.toString("utf8");
    Object.assign(BlizzardJGlobals, parseGlobals(_blizzardJContent));
    Object.assign(BlizzardJNatives, parseNatives(_blizzardJContent));
    Object.assign(BlizzardJFunctions, parseFunctions(_blizzardJContent));
  }
});
readFile(commonAiFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _commonAiContent = data.toString("utf8");
    Object.assign(CommonAiGlobals, parseGlobals(_commonAiContent));
    Object.assign(CommonAiNatives, parseNatives(_commonAiContent));
    Object.assign(CommonAiFunctions, parseFunctions(_commonAiContent));
  }
});
readFile(DzAPIJFilePath, (error, data) => {
  if (error) {
    console.error(error.message);
  } else {
    _dzApicommonJContent = data.toString("utf8");
    Object.assign(DzApiJGlobals, parseGlobals(_dzApicommonJContent));
    Object.assign(DzApiJNatives, parseNatives(_dzApicommonJContent));
    Object.assign(DzApiJFunctions, parseFunctions(_dzApicommonJContent));
  }
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
function dzApicommonJContent(): string {
  return _dzApicommonJContent;
}

export {
  commonJContent,
  blizzardJContent,
  commonAiContent,
  dzApicommonJContent,

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
};
