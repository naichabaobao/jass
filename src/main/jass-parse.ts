import { toLines } from "./tool"
import { Global, GlobalConstant, GlobalArray } from "./global";
import { Type } from "./type";
import { isVjassEnable } from "./configuration";

const StatementTypesRegExpString = Type.StatementTypes.map(type => type.name).join("|");

const GlobalStartRegExp = new RegExp(/^\s*globals\b/);


const GlobalEndRegExp = new RegExp(/^\s*endglobals\b/);

const GlobalRegExp = new RegExp(`${isVjassEnable ? "((?<modifier>private|public)\\s+)?" : ""}((?<isConstant>constant)\\s+)?(?<type>${StatementTypesRegExpString})\\s+((?<isArray>array)\\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);

export const parseGlobals = (content:string):Array<Global|GlobalConstant|GlobalArray> => {
  const globals = new Array<Global|GlobalConstant|GlobalArray>();
  const lines = toLines(content);
  let inGlobalBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if(!inGlobalBlock && GlobalStartRegExp.test(line)){
      console.log(inGlobalBlock)
      inGlobalBlock = true;
    }else if(inGlobalBlock && GlobalEndRegExp.test(line)){
      console.log(inGlobalBlock)
      inGlobalBlock = false;
    }else if (inGlobalBlock && GlobalRegExp.test(line)) {
      const result = GlobalRegExp.exec(line);
      if (result && result.groups) {
        var global;
        if(result.groups.isConstant){
          global = new GlobalConstant();
        }else if(result.groups.isArray){
          global = new  GlobalArray();
        }else{
          global = new  Global();
        }
        if(result.groups.type){
          global.type =  Type.getType(result.groups.type);
        }
        if(result.groups.name){
          global.name = result.groups.name;
        }
        globals.push(global);
      }
    }
  }
  return globals;
}

