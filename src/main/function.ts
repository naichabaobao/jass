import { Type } from './type';
import { Origin } from './origin';
import { Keyword } from './keyword';
import { Value } from './value';
import { toLines } from './tool';
import { isString } from 'util';
import { isVjassSupport } from './configuration';
import { parseComment } from './commont';
// import { Library } from './library';
import { Range } from './range';
import { Position } from 'vscode';
import { ModifierEnum } from './modifier';

interface JassFunction {
  name: string;
  takes: Array<Take>;
  returns: Type;
}

class Take implements Value,Origin {
  type: Type = Type.nothing;
  name: string = "";

  public origin(): string {
    return `${this.type.name} ${this.name}`;
  }
}

class FunctionImpl extends Range implements JassFunction, Origin,Description {
  descript: string = "";
  name: string = "";
  takes: Take[] = [];
  returns: Type = Type.nothing;

  /**
   * 将takes转化为参数字符串，如果长度为0则为nothing
   */
  protected takesString(){
    return this.takes.length == 0 ? Keyword.Nothing : this.takes.map(take => take.origin()).join(" ,");
  }

  public origin(): string {
    return `(${Keyword.Native}|${Keyword.Function}) ${this.name} ${Keyword.Takes} ${this.takesString()} ${Keyword.Returns} ${this.returns.name}`;
  }
}

class Native extends FunctionImpl {
  isConstant: boolean = false;

  private isConstantToString() {
    return this.isConstant ? `${Keyword.Constant} ` : "";
  }

  public origin(): string {
    return `${this.isConstantToString()}${Keyword.Native} ${this.name} ${Keyword.Takes} ${this.takesString()} ${Keyword.Returns} ${this.returns.name}`;
  }
}

class Function extends FunctionImpl {

  // public library:Library | null = null;
  public modifier:ModifierEnum = ModifierEnum.Common;
  /**
   * 拼library和方法名称
   */
  // public get libraryFunctionName(){
  //   const libname = this.library && isVjassSupport() ? `${this.library.name}_` : "";
  //   const functionName = `${libname}${this.name}`;
  //   return functionName;
  // }

  public origin(): string {
    // 当前方式实现方式有点丑，但是工作正常
    const functionOrigin = `${Keyword.Function} ${this.name} ${Keyword.Takes} ${this.takesString()} ${Keyword.Returns} ${this.returns.name}\n`;
    // const origin = isVjassSupport() && this.library ? `${Keyword.keywordLibrary} ${this.library.name}\n\t${functionOrigin}\t${Keyword.Endfunction}\n${Keyword.keywordEndLibrary}` : functionOrigin + Keyword.Endfunction;
    return functionOrigin + Keyword.Endfunction;
  }
}

const nativeRegExp = new RegExp(`^\\s*((?<isConstant>${Keyword.Constant})\\s+)?${Keyword.Native}\\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);

const TakeTypesRegExpString = Type.TakesTypes.map(type => type.name).sort((typeName1, typeName2) => typeName2.length - typeName1.length).join("|");

const takesNothingRegExp = new RegExp(`${Keyword.Takes}\\s+${Keyword.Nothing}`);
const takesRegExp = new RegExp(`${Keyword.Takes}\\s+(?<takeString>(${TakeTypesRegExpString})\\s+[a-zA-Z][a-zA-Z0-9_]*(\\s*,\\s*(${TakeTypesRegExpString})\\s+[a-zA-Z][a-zA-Z0-9_]*)*)`);

const StatementTypesRegExpString = Type.StatementTypes.map(type => type.name).sort((typeName1, typeName2) => typeName2.length - typeName1.length).join("|");

const returnsNothingRegExp = new RegExp(`${Keyword.Returns}\\s+${Keyword.Nothing}`);
const returnsRegexp = new RegExp(`${Keyword.Returns}\\s+(?<returns>${StatementTypesRegExpString})`);

/**
 * 解析native方法
 * @param content native行
 */
function parseNatives(content: string): Array<Native> {
  const natives = new Array<Native>();
  toLines(content).forEach((line,index,lines) => {
    if (nativeRegExp.test(line)) {
      let native = new Native();
      const result = nativeRegExp.exec(line);
      if (result && result.groups) {
        if (result.groups.name && Keyword.isNotKeyword(result.groups.name)) {
          native.name = result.groups.name;
          if (result.groups.isConstant) {
            native.isConstant = true;
          }
          native.takes = parseTakes(line);
          native.returns = parseReturns(line);
          native.descript = parseComment(lines[index - 1]);

          native.start = new Position(index,0);
          native.end = new Position(index,line.length);

          natives.push(native);
        }
      }
    }
  });
  return natives;
}

/**
 * 解析参数
 * @param content 带有takes的字符串
 */
function parseTakes(content: string): Array<Take> {
  let takes = new Array<Take>();
  if (takesNothingRegExp.test(content)){

  }else if (takesRegExp.test(content)) {
    const result = takesRegExp.exec(content);
    if (result && result.groups && result.groups.takeString) {
      const takeString = result.groups.takeString;
      const takesStrings = takeString.split(/\s*,\s*/);
      takesStrings.forEach(takeString => {
        const takeTypeName = takeString.trim().split(/\s+/);
        const take = new Take();
      
        take.type = Type.getType(takeTypeName[0]);
        take.name = takeTypeName[1];
        if(take.type.name != Type.nothing.name && Keyword.isNotKeyword(takeTypeName[1])){
          takes.push(take);
        }
      });
    }
  }
  return takes;
}



/**
 * 用于解析出returns后面的类型
 * @param content 方法行
 */
const parseReturns = (content: string): Type => {
  let returns = Type.nothing;
  if (!returnsNothingRegExp.test(content)) {
    if (returnsRegexp.test(content)) {
      const result = returnsRegexp.exec(content);
      if (result && result.groups && result.groups.returns) {
        returns = Type.getType(result.groups.returns);
      }
    }
  }
  return returns;
}


const FunctionRegExp = new RegExp(`^\\s*((?<modifier>${Keyword.keywordPrivate}|${Keyword.keywordPublic})\\s+)?${Keyword.Function}\\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);

/**
 * 解析function方法
 * @param content function
 */
function parseFunctions(content: string): Array<Function> {
  const functions = new Array<Function>();
  toLines(content).forEach((line,index,lines)  => {
    if (FunctionRegExp.test(line)) {
      const func = new Function();
      const result = FunctionRegExp.exec(line);
      if (result && result.groups) {
        if(result.groups.modifier){
          if(result.groups.modifier == Keyword.keywordPrivate){
            func.modifier = ModifierEnum.Private;
          }else if(result.groups.modifier == Keyword.keywordPublic){
            func.modifier = ModifierEnum.Public;
          }else{
            func.modifier = ModifierEnum.Common;
          }
        }
        if (result.groups.name && Keyword.isNotKeyword(result.groups.name)) {
          func.name = result.groups.name;
          func.takes = parseTakes(line);
          func.returns = parseReturns(line);
          func.descript = parseComment(lines[index - 1]);

          func.start = new Position(index,0);
          // 目前不解析块
          func.end = new Position(index,line.length);

          functions.push(func);
        }
      }
    }
  });
  return functions;
}

export {
  JassFunction,
  FunctionImpl,
  Take,
  Native,
  Function,
  parseNatives,
  parseTakes,
  parseReturns,
  parseFunctions
};
