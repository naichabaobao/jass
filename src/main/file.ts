import { readFile, writeFile, readFileSync, writeFileSync } from "fs";
import { commonJFilePath, blizzardJFilePath, commonAiFilePath, DzAPIJFilePath } from "./path";
import { parseGlobals, Global, GlobalConstant, GlobalArray } from "./global";
import { Native, parseNatives, Function, parseFunctions, FunctionImpl } from "./function";
import { Jass } from "./jass";
import { resolve } from "path";

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
    writeFile(resolve(__dirname, "common"), natives.map(n => n.name).join("|"), () => { });
  }
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


/*

function test(funcs: Array<FunctionImpl>) {
  const jsonData = readFileSync("D:/javascript-workspace/jass2/War3Api.json").toString("utf8");
  const jsonObject = JSON.parse(jsonData);
  let newContent = _blizzardJContent;
  const nativeNames = funcs.filter(native => native.descript.trim() == "")
  .forEach(native => {
    
      const obj = (jsonObject as Array<any>).find(obj => obj["nameUS"] == native.name);
      if(obj){
        let title:string = obj["title"];

//         newContent = newContent.replace(new RegExp(`(constant\\s+)?(native\\s+)?${native.name}`), `// ${title}
// ${native.isConstant ? "constant native " + native.name : "native " + native.name}`);
if(title && title != "null" ){
  console.log(`${native.name} --- ${title}`)
  console.log(title)
  newContent = newContent.replace(new RegExp(`function\\s+${native.name}`), `// ${title}
  ${ "function " + native.name}`);
}


      }
  });
  writeFileSync("D:/javascript-workspace/jass2/ccc.j", newContent);
}
*/

/*
{ "nameUS": "DzTriggerRegisterMouseEventTrg",
 "title": "注册鼠标事件",
  "description": "任意玩家${key}${actionkey}时",
   "comment": "请使用“获取触发硬件事件的玩家”来获取触发玩家",
    "category": "BZ_HW",
     "categoryCH": null,
     "args": "trigger trg, integer status, integer btn",
      "returns": "nothing",
       "usPath": "BlizzardAPI.j",
        "index": 0,
         "ID": 0 }
*/

function f666() {
  let b132content = readFileSync('D:/javascript-workspace/jass2/src/resources/static/jass/blizzard-1.32.j').toString('utf8');
  const bcontent = readFileSync('D:/javascript-workspace/jass2/src/resources/static/jass/blizzard.j').toString('utf8');

const b132functions = parseFunctions(b132content)
const bfunctions = parseFunctions(bcontent)

const b132globals = parseGlobals(b132content)
const bglobals = parseGlobals(bcontent)

b132functions.forEach(func => {
  const b132func = bfunctions.find(f => f.name == func.name);
  if(b132func && b132func.descript != ""){
    b132content = b132content.replace(new RegExp(`function\\s+${func.name}`), `// ${b132func.descript}${b132func.descript.endsWith('\n') ? "" : "\n"}function ${func.name}`);
  }
 
})

writeFileSync('D:/javascript-workspace/jass2/src/resources/static/jass/blizzard-1.32-temp.j', b132content);
f777()
return;
b132globals.forEach(glo => {
  const b132glo = bglobals.find(g => g.name == glo.name);
  if(b132glo && b132glo.descript != "" && glo.descript != ''){
    
    let string = "";
    if(glo instanceof GlobalConstant){
      b132content = b132content.replace(new RegExp(`constant\\s+[a-z]+\\s+${glo.name}`), `// ${b132glo.descript}${b132glo.descript.endsWith('\n') ? "" : "\n"} constant ${glo.type.name} ${glo.name}`)
    }
    if(glo instanceof GlobalArray){
      b132content = b132content.replace(new RegExp(`[a-z]+\\s+array\\s+${glo.name}`), `// ${b132glo.descript}${b132glo.descript.endsWith('\n') ? "" : "\n"} ${glo.type.name} array ${glo.name}`)
    }
    if(glo instanceof Global){
      b132content = b132content.replace(new RegExp(`[a-z]+\\s+${glo.name}`), `// ${b132glo.descript}${b132glo.descript.endsWith('\n') ? "" : "\n"}  ${glo.type.name} ${glo.name}`)
    }

  }
 
})

// writeFileSync('D:/javascript-workspace/jass2/src/resources/static/jass/blizzard-1.32-temp.j', b132content);
}

function f777() {
  let b132content = readFileSync('D:/javascript-workspace/jass2/src/resources/static/jass/common-1.32-1.j').toString('utf8');
  const bcontent = readFileSync('D:/javascript-workspace/jass2/src/resources/static/jass/common.j').toString('utf8');

const b132functions = parseNatives(b132content)
const bfunctions = parseNatives(bcontent)

const b132globals = parseGlobals(b132content)
const bglobals = parseGlobals(bcontent)

b132functions.forEach(func => {
  const b132func = bfunctions.find(f => f.name == func.name);
  if(b132func && b132func.descript != ""){
    b132content = b132content.replace(new RegExp(`(constant\\s+)?native\\s+${func.name}`), `// ${b132func.descript}${b132func.descript.endsWith('\n') ? "" : "\n"}${func.isConstant ? "constant " : ""} native ${func.name}`);
  }
 
})



b132globals.forEach(glo => {
  const b132glo = bglobals.find(g => g.name == glo.name);
  if(b132glo && b132glo.descript != ""){
    
    if(glo instanceof GlobalConstant){
      b132content = b132content.replace(new RegExp(`constant\\s+[a-z]+\\s+${glo.name}`), `// ${b132glo.descript}${b132glo.descript.endsWith('\n') ? "" : "\n"} constant ${glo.type.name} ${glo.name}`)
    }
    if(glo instanceof GlobalArray){
      b132content = b132content.replace(new RegExp(`[a-z]+\\s+array\\s+${glo.name}`), `// ${b132glo.descript}${b132glo.descript.endsWith('\n') ? "" : "\n"} ${glo.type.name} array ${glo.name}`)
    }
    if(glo instanceof Global){
      b132content = b132content.replace(new RegExp(`[a-z]+\\s+${glo.name}`), `// ${b132glo.descript}${b132glo.descript.endsWith('\n') ? "" : "\n"}  ${glo.type.name} ${glo.name}`)
    }

  }
 
})

writeFileSync('D:/javascript-workspace/jass2/src/resources/static/jass/common-1.32-temp.j', b132content);
}