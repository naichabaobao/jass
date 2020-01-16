import { newLine } from "./constant";
import { FunctionImpl } from "./function";
import { CommonJFunctions, BlizzardJFunctions, CommonJNatives, BlizzardJNatives, CommonAiFunctions, CommonAiNatives, DzApiJFunctions, DzApiJNatives, CommonJGlobals, BlizzardJGlobals, CommonAiGlobals, DzApiJGlobals } from "./file";
import { Jasss } from "./include-file";
import { GlobalImpl } from "./global";

export const toLines = (content:string):Array<string> => {
  return content.split(newLine).map(line => `${line}${newLine}`);
}

export function allFunctions():Array<FunctionImpl>{
  return [...CommonJFunctions,...CommonJNatives,
  ...BlizzardJFunctions,...BlizzardJNatives,
...CommonAiFunctions,...CommonAiNatives,
...DzApiJFunctions,...DzApiJNatives,
...Jasss.map(jass => jass.functions).flat()];
}

export function allGlobals():Array<GlobalImpl>{
  return [...CommonJGlobals,
  ...BlizzardJGlobals,
...CommonAiGlobals,
...DzApiJGlobals,
...Jasss.map(jass => jass.globals).flat()];
}