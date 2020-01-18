import { Value } from "./value";
import {Type} from './type';
import { Keyword } from "./keyword";
import { Origin } from "./origin";
class Local implements Value,Origin{

  type: Type = Type.nothing;
  name: string = "";

  origin(): string {
    return `${Keyword.Local} ${this.type.name} ${this.name}`;
  }
}
const StatementTypesRegExpString = Type.StatementTypes.map(type => type.name).join("|");
const localRegExp = new RegExp(`${Keyword.Local}\\s+(?<type>${StatementTypesRegExpString})\\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);

/**
 * 
 * @param line 需要解析的local行
 * @returns 解析成功返回local 否则返回undefined
 */
function parseLocal(line:string): Local|undefined{
  if(localRegExp.test(line)){
    const result = localRegExp.exec(line);
    if(result && result.groups){
      const local = new Local();
      if(result.groups.type){
        local.type = Type.getType(result.groups.type);
      }
      if(result.groups.name){
        local.name = result.groups.name;
      }
      return local;
    }
  }
}

export {
  Local,
  parseLocal
};