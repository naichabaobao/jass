import { Value } from "./value";
import { Type } from "./type";
import { Modifier, GlobalModifier } from "./modifier";
import { Origin } from "./origin";
import { Keyword } from "./keyword";
import { toLines } from "./tool";
import { isVjassSupport } from "./configuration";
import { parseComment } from "./commont";

class GlobalImpl implements Value, Description, Modifier, Origin {
  type: Type = Type.nothing;
  name: string = "";
  descript: string = "";
  modifier: GlobalModifier = GlobalModifier.Common;
  protected modifiertoString(): string {
    return this.modifier == GlobalModifier.Common ? "" : this.modifier;
  }
  public origin(): string {
    return `${this.modifiertoString()} ${this.type.name} ${this.name}`;
  }
}

class GlobalConstant extends GlobalImpl {
  public origin(): string {
    return `${this.modifiertoString()} ${Keyword.Constant} ${this.type.name} ${this.name}`;
  }
}

class GlobalArray extends GlobalImpl {
  public origin(): string {
    return `${this.modifiertoString()} ${this.type.name} ${Keyword.Array} ${this.name}`;
  }
}

class Global extends GlobalImpl {
  public origin(): string {
    return `${this.modifiertoString()} ${this.type.name} ${this.name}`;
  }
}

const StatementTypesRegExpString = Type.StatementTypes.map(type => type.name).join("|");

const GlobalStartRegExp = new RegExp(/^\s*globals\b/);


const GlobalEndRegExp = new RegExp(/^\s*endglobals\b/);

function _getModifierRegExpString() {
  return isVjassSupport() ? `((?<modifier>${Keyword.keywordPrivate}|${Keyword.keywordPublic})\\s+)?` : "";
}

const GlobalRegExp = new RegExp(`${_getModifierRegExpString()}((?<isConstant>${Keyword.Constant})\\s+)?(?<type>${StatementTypesRegExpString})\\s+((?<isArray>${Keyword.Array})\\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);

function _resolveModifier(modifier:string):GlobalModifier{
  if(!modifier || !isVjassSupport()){ // 不支持vjass时返回Common
    return GlobalModifier.Common;
  }
  return modifier == Keyword.keywordPrivate ? GlobalModifier.Private : modifier == Keyword.keywordPublic ? GlobalModifier.Public : GlobalModifier.Common;
}

/**
 * 解析全局变量
 * @param content 被解析的内容
 */
export const parseGlobals = (content: string): Array<Global | GlobalConstant | GlobalArray> => {
  const globals = new Array<Global | GlobalConstant | GlobalArray>();
  const lines = toLines(content);
  let inGlobalBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inGlobalBlock && GlobalStartRegExp.test(line)) {
      inGlobalBlock = true;
    } else if (inGlobalBlock && GlobalEndRegExp.test(line)) {
      inGlobalBlock = false;
    } else if (inGlobalBlock && GlobalRegExp.test(line)) {
      const result = GlobalRegExp.exec(line);
      if (result && result.groups) {
        var global;
        if (result.groups.isConstant) {
          global = new GlobalConstant();
        } else if (result.groups.isArray) {
          global = new GlobalArray();
        } else {
          global = new Global();
        }
        if (result.groups.modifier) {
          global.modifier = _resolveModifier(result.groups.modifier);
        }
        if (result.groups.type) {
          global.type = Type.getType(result.groups.type);
        }
        if (result.groups.name) {
          global.name = result.groups.name;
        }
        global.descript = parseComment(lines[i - 1]);
        globals.push(global);
      }
    }
  }
  return globals;
}

export { GlobalImpl,GlobalConstant, GlobalArray, Global };