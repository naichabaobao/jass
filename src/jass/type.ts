import { resolve } from "path";
import * as vscode from "vscode";
import {readFileSync, existsSync} from "fs";

const DefaultCommonJPath = resolve(__dirname, "../../src/resources/static/jass/common.j");

function getComsumeCommonJPath():string|null {
  return vscode.workspace.getConfiguration()?.jass?.common_j as string;
}

let comsumeCommonJPath = getComsumeCommonJPath();

vscode.workspace.onDidChangeConfiguration((e) => {
  const newPath = getComsumeCommonJPath();
  if(comsumeCommonJPath !== newPath) {
    comsumeCommonJPath = newPath;
    JassType.clear();
    parseType();
  }
});

function commonJPath(): string {
  return comsumeCommonJPath ?? DefaultCommonJPath;
}


 export class JassType{
  private static readonly baseTypes = ["boolean", "integer", "real", "string", "code", "handle"];
  private static readonly booleanType = new JassType(JassType.baseTypes[0]);
  private static readonly integerType = new JassType(JassType.baseTypes[1]);
  private static readonly realType = new JassType(JassType.baseTypes[2]);
  private static readonly stringType = new JassType(JassType.baseTypes[3]);
  private static readonly codeType = new JassType(JassType.baseTypes[4]);
  private static readonly handleType = new JassType(JassType.baseTypes[5]);
  private static _types:Map<string,JassType> = new Map<string,JassType>([
    ["boolean", JassType.booleanType],
    ["integer", JassType.integerType],
    ["real", JassType.realType],
    ["string", JassType.stringType],
    // 對象樹中允許local code name的寫法，後面通過預編譯禁止;
    ["code", JassType.codeType],
    ["handle", JassType.handleType]
  ]);

  public line:number|null = null;
  public namePosition:number|null = null;
  public nameRange:vscode.Range|null = null;

  public readonly name:string;
  public readonly extend:JassType = JassType.handleType;

  private constructor (name:string, extend?:JassType) {
    this.name = name;
    if(extend) this.extend = extend;
  }

  public parent() {
    return this.extend;
  }

  public childrens() {
    return JassType.types().filter(value => value.extend.name == this.name);
  }
  
  public static builder(name:string, extend?:JassType) {
    return this._types.get(name) ?? (() => {
      const type = new JassType(name, extend);
      this._types.set(name, type);
      return type;
    })();
  }

  public static get(name:string) {
    return this._types.get(name);
  }

  public static clear() {
    JassType._types = new Map<string,JassType>([
      ["boolean", JassType.booleanType],
      ["integer", JassType.integerType],
      ["real", JassType.realType],
      ["string", JassType.stringType],
      // 對象樹中允許local code name的寫法，後面通過預編譯禁止;
      ["code", JassType.codeType],
      ["handle", JassType.handleType]
    ]);
  }

  public static types() {
    const types = new Array<JassType>();
    for (const value of this._types.values()) {
      types.push(value);
    }
    return types;
  }

  public static typeNames() {
    return JassType.types().map(type => type.name);
  }

  
  public static isBaseType = (name:string) => {
    return JassType.baseTypes.includes(name);
  };

  public static isType = (name:string) => {
    return JassType.typeNames().includes(name);
  };

}

function parseType () {
  // 獲取文件内容
  const filePath = commonJPath();
  if(!existsSync(filePath)) {
    return;
  }
  const content = readFileSync(filePath).toString("utf8");
  
  const regexp = /^\s*type\s+(?<type_name>[a-zA-Z]+)\s+extends\s+(?<extends_name>[a-zA-Z]+)/;
  
  const lines = content.split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if(line.trimStart() == "" || /^\s*\/\//.test(line)) {
      continue;
    }else if(/^\s*type/.test(line)) {
      const result = regexp.exec(line);
      if(result && result.groups) {
        const name = result.groups.type_name;
        const extends_name = result.groups.extends_name;
        JassType.builder(name, JassType.get(extends_name));
      }
    }else{
      break;
    }
  }


}
parseType();


