import { newLine } from "./constant";
import { FunctionImpl, Function } from "./function";
import { CommonJFunctions, BlizzardJFunctions, CommonJNatives, BlizzardJNatives, CommonAiFunctions, CommonAiNatives, DzApiJFunctions, DzApiJNatives, CommonJGlobals, BlizzardJGlobals, CommonAiGlobals, DzApiJGlobals } from "./file";
import { Jasss } from "./include-file";
import { GlobalImpl } from "./global";

export const toLines = (content:string):Array<string> => {
  return content.split(newLine).map(line => `${line}${newLine}`);
}

export function allFunctionImpls():Array<FunctionImpl>{
  return [...CommonJFunctions,...CommonJNatives,
  ...BlizzardJFunctions,...BlizzardJNatives,
...CommonAiFunctions,...CommonAiNatives,
...DzApiJFunctions,...DzApiJNatives,
...Jasss.map(jass => jass.functions).flat()];
}

export function allFunctions():Array<Function>{
  return [...CommonJFunctions,
  ...BlizzardJFunctions,
...CommonAiFunctions,
...DzApiJFunctions,
...Jasss.map(jass => jass.functions).flat()];
}

export function allGlobals():Array<GlobalImpl>{
  return [...CommonJGlobals,
  ...BlizzardJGlobals,
...CommonAiGlobals,
...DzApiJGlobals,
...Jasss.map(jass => jass.globals).flat()];
}

export function isSpace(char:string): boolean {
  switch(char){
    case ' ':
    case '\t':
      return true;
    default:
      return false;
  }
}

export function isNewLine(char:string): boolean {
  switch(char){
    case '\r\n':
    case '\n':
      return true;
    default:
      return false;
  }
}

export function isLowLetter(char:string): boolean {
  switch(char){
    case 'a':
      case 'b':
      case 'c':
      case 'd':
      case 'e':
      case 'f':
      case 'g':
      case 'h':
      case 'i':
      case 'j':
      case 'k':
      case 'l':
      case 'm':
      case 'n':
      case 'o':
      case 'p':
      case 'q':
      case 'r':
      case 's':
      case 't':
      case 'u':
      case 'v':
      case 'w':
      case 'x':
      case 'y':
      case 'z':
      return true;
    default:
      return false;
  }
}

export function isUpLetter(char:string): boolean {
  switch(char){
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
    case 'F':
    case 'G':
    case 'H':
    case 'I':
    case 'J':
    case 'K':
    case 'L':
    case 'M':
    case 'N':
    case 'O':
    case 'P':
    case 'Q':
    case 'R':
    case 'S':
    case 'T':
    case 'U':
    case 'V':
    case 'W':
    case 'X':
    case 'Y':
    case 'Z':
      return true;
    default:
      return false;
  }
}

export function isLetter(char:string): boolean {
  if(isLowLetter(char) || isUpLetter(char)) {
    return true;
  }
  return false;
}