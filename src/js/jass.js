let vscode = require('vscode');


// "(\\"|.)*?"|//.+
/**
 * 
 */

const GlobalsBlock = ["globals", "endglobals"];
const FunctionBlock = ["function", "endfunction"];
const Constant = "constant";
const Local = "local"

const Type = [
  "integer",
  "real",
  "string",
  "boolean",
  "code",
  "handle",
  "agent",
  "event",
  "player",
  "widget",
  "unit",
  "destructable",
  "item",
  "ability",
  "buff",
  "force",
  "group",
  "trigger",
  "triggercondition",
  "triggeraction",
  "timer",
  "location",
  "region",
  "rect",
  "boolexpr",
  "sound",
  "conditionfunc",
  "filterfunc",
  "unitpool",
  "itempool",
  "race",
  "alliancetype",
  "racepreference",
  "gamestate",
  "igamestate",
  "fgamestate",
  "playerstate",
  "playerscore",
  "playergameresult",
  "unitstate",
  "aidifficulty",
  "eventid",
  "gameevent",
  "playerevent",
  "playerunitevent",
  "unitevent",
  "limitop",
  "widgetevent",
  "dialogevent",
  "unittype",
  "gamespeed",
  "gamedifficulty",
  "gametype",
  "mapflag",
  "mapvisibility",
  "mapsetting",
  "mapdensity",
  "mapcontrol",
  "playerslotstate",
  "volumegroup",
  "camerafield",
  "camerasetup",
  "playercolor",
  "placement",
  "startlocprio",
  "raritycontrol",
  "blendmode",
  "texmapflags",
  "effect",
  "effecttype",
  "weathereffect",
  "terraindeformation",
  "fogstate",
  "fogmodifier",
  "dialog",
  "button",
  "quest",
  "questitem",
  "defeatcondition",
  "timerdialog",
  "leaderboard",
  "multiboard",
  "multiboarditem",
  "trackable",
  "gamecache",
  "version",
  "itemtype",
  "texttag",
  "attacktype",
  "damagetype",
  "weapontype",
  "soundtype",
  "lightning",
  "pathingtype",
  "image",
  "ubersplat",
  "hashtable"
];

/**
 * 變量常量
 */
class Value {
  /**
   * 
   * @param {string} name 
   * @param {string} type 
   * @param {boolean} isConstant 
   * @param {boolean} isArray 
   */
  constructor(name, type, isConstant = false, isArray = false) {
    this.name = name;
    this.isConstant = isConstant;
    this.isArray = isArray;
    this.type = type;
  }

  /**
   * 變量解析
   * 格式為 標識符 = 值,如 name = "聖騎士"
   * 修飾符可用constant local 或 無
   * canstant修飾時不能是數組，因爲jass不支持數組列表初始化
   * @requires 依賴Type
   * @param {string} text 
   * @returns {Value} 若解析失敗為null
   */
  static parse(text) {
    let content = text.trim();
    if (!text || content.length == 0) return null;

    let isConstant = content.startsWith("constant");

    // 類聲明形式 constant class,local class,class
    let typeResult = s.match(`$(?<=constant|local\\s+)(${Type.join("|")})|$(${Type.join("|")})`);
    let type = typeResult ? typeResult.shift() : null;
    if (!type) return null;

    let isArray = new RegExp(`${type}\\s+array`).test(content);

    // 標識符形式 class name, class array name
    let nameResult = content.match(`(?<=(${Type.join("|")})(\\s+array)?\\s+)[a-zA-Z]\\w*`);
    let name = nameResult.shift();
    if (!name) return null;

    return new Value(name, type, isConstant, isArray);
  }

  /**
   * 
   * @param {string} text 
   */
  static parseValues(text) {
    if (!text) return null;
    let lines = text.split(/\n/);
    return lines.map(s => Value.parse(s)).filter(s => !s)
  }
}



/**
 * jass全局塊
 */
class Globals {
  /**
   * 
   * @param {Values[]} values 
   */
  constructor(values) {
    this.values = values;
  }

  /**
   * 
   * @param {string} text globals塊文本 
   * @returns {Value[]}
   */
  static parse(text) {
    if (!text || !text.trimLeft().startsWith("globals")) return [];
    return text.split.map(s => Value.parse(s));
  }

  /**
   * 
   * @param {string} text globals塊文本 
   * @returns {Globals[]}
   */
  static parseGlobals(text) {

  }
}

/**
 * jass參數
 */
class Parameter {
  /**
   * 
   * @param {string} name 
   * @param {string} type 
   */
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }

}

/**
 * jass方法
 */
class Func {
  /**
   * 
   * @param {string} name 
   * @param  {Parameter[]} args 
   * @param {string} returnType 
   */
  constructor(name, args = null, returnType = null, isConstant = false, isNative = false, locals = []) {
    this.name = name;
    this.returnType = returnType;
    this.parameters = args;
    this.isConstant = isConstant;
    this.isNative = isNative;

    /**
     * 方法内部變量
     */
    this.locals = locals;
  }

  /**
   * 
   * @param {string} text 
   */
  static parse(text) {
    if (!text) return null;

    // 獲取方法名稱
    let nameResult = text.match(/(?<=^\s*function\s+)[a-zA-Z]\w+/);
    let name = nameResult ? nameResult.shift() : null;
    if (!name) return null;
    // 獲取方法參數 若空串或nothing 設置為空數組而不是null
    let argsStringResult = text.match(/(?<=takes\s+).+?(?=\s+returns)/);
    let argsString = argsStringResult ? argsStringResult.shift() : null;
    let args = Parameter.parse(argsString);
    // 獲取方法返回值 空串或nothing 設置為null
    let returnTypeResult = text.match(/(?<=returns\s+)[a-z]+/);
    let returnType = returnTypeResult ? returnTypeResult.shift() : null;
    returnType = returnType == "nothing" ? null : returnType;
    return new Func(name, args, returnType);
  }

}

class Funcs {
  /**
   * 通過j文件内容構建方法樹，[Func,Func]
   * @param {string} content 
   */
  constructor(content) {

    this.functions = this.parse(content);

  }


}

/**
 * jass
 */
class Jass {
  constructor(globals, functions, types, native) {
    this.globals = globals;
    this.functions = functions;
    this.types = types;
    this.native = native;
  }
  /**
   * 
   * @param {string} text 
   */
  static parse(text) {
    if (!text) return null;
    // 找到各個塊 再進行解析
    // globals
    let globalsResult = text.match(/(?<=$\s*globals)[\s\S]+?(?=$\s*endglobals)/gm);
    // [Globals,Globals]
    let globals = globalsResult ? globalsResult.map(s => Globals.parse(s)) : [];
    // functions
    let functionsResult = text.match(/(?<=$\s*function)[\s\S]+?(?=$\s*endfunction)/gm);
    // [Func,Func]
    let functions = functionsResult ? functionsResult.map(s => Func.parse(s)) : [];
    // type
  }
}

/**
 * 
 * @param {vscode.TextLine} textLine 
 * @param {string} value 
 */
const matchingStartWith = (textLine, value) => {
  return textLine.text.substr(textLine.firstNonWhitespaceCharacterIndex, value.length) == value
}

/**
 * @description 从文档中找到所有块
 * @param {vscode.TextDocument} document
 * @param {string} start
 * @param {string} end
 * @returns {Array<vscode.Range>}
 */
const findBlock = (document, start, end) => {
  let ranges = []
  if (!document || !start || !end) return ranges;
  let startPosition
  for (let i = 0; i < document.lineCount; i++) {
    let textLine = document.lineAt(i)
    let charIndex = textLine.firstNonWhitespaceCharacterIndex
    if (matchingStartWith(textLine, start)) {
      startPosition = new vscode.Position(textLine.lineNumber, charIndex)
    } else if (matchingStartWith(textLine, end)) {
      ranges.push(new vscode.Range(startPosition, new vscode.Position(textLine.lineNumber, charIndex + end.length)))
    }
  }
  return ranges
}

/**
 * 
 * @param {vscode.TextLine} textLine 
 * @returns {Value}
 */
const findValue = (textLine) => {

  if (matchingStartWith(textLine, Constant)) {
    let typeResult = textLine.text.match(/(?<=constant\s+)[a-z]+/)
    let type = typeResult ? typeResult.shift() : null;
    if (!type) {
      return null
    }
    let nameResult = textLine.text.match(`(?<=${type}\\s+)[a-z]\\w*`);
    let name = nameResult ? nameResult.shift() : null;
    if (!name) {
      return null
    }
    return new Value(name, type, true, false);
  } else {
    let type = Type.find(s => textLine.text.trimLeft().startsWith(s))

    if (!type) {
      return null
    }

    if (new RegExp(`(?<=${type}\\s+)array`).test(textLine.text)) {
      let nameResult = textLine.text.match(/(?<=array\s+)[a-zA-Z]\w*/);
      let name = nameResult ? nameResult.shift() : null;
      if (!name) {
        return null;
      }
      return new Value(name, type, false, true);
    } else {
      let nameResult = textLine.text.match(`(?<=${type}\\s+)[a-zA-Z]\\w*`);
      let name = nameResult ? nameResult.shift() : null;
      if (!name) {
        return null;
      }
      return new Value(name, type, false, false);
    }
  }
}

/**
 * 
 * @param {vscode.TextLine} textLine 
 * @returns {Func}
 */
const findFunction = (textLine) => {
  if (!textLine) return null;
  let nameResult = textLine.text.match(/(?<=function\s+)[a-zA-Z]\w+/);
  let name = nameResult ? nameResult.shift() : null;
  if (!name) return null;
  let argsStringResult = textLine.text.match(/(?<=takes\s+).+?(?=\s+returns)/);
  let argsString = argsStringResult ? argsStringResult.shift() : null;
  let argsArray = argsString ? argsString.split(",") : [];
  let args = argsString == "nothing" ? [] : argsArray.map(s => {
    let ptypeResult = s.match(Type.join("|"))
    let ptype = ptypeResult ? ptypeResult.shift() : null;
    let pnameResult = s.match(`(?<=${ptype}\\s+)[a-z]\\w*`);
    let pname = pnameResult.shift();
    return new Parameter(pname, ptype);
  });
  let returnTypeResult = textLine.text.match(/(?<=returns\s+)[a-z]+/);
  let returnType = returnTypeResult ? returnTypeResult.shift() : null;
  returnType = returnType == "nothing" ? null : returnType;
  return new Func(name, returnType, args);
}

/**
 * 
 * @param {vscode.TextLine} textLine 
 * @returns {Value}
 */
const findLocal = (textLine) => {
  if (!textLine || textLine.isEmptyOrWhitespace) return null;
  if (matchingStartWith(textLine, Local)) {
    let typeResult = textLine.text.match(/(?<=local\s+)[a-z]+/);
    let type = typeResult ? typeResult.shift() : null;
    if (!type) return null;
    if (new RegExp(`(?<=${type}\\s+)array`).test(textLine.text)) {
      let nameResult = textLine.text.match(/(?<=array\s+)[a-zA-Z]\w*/);
      let name = nameResult.shift();
      if (!name) return null;
      return new Value(name, type, false, true);
    } else {
      let nameResult = textLine.text.match(`(?<=${type}\\s+)[a-zA-Z]\\w*`);
      let name = nameResult ? nameResult.shift() : null;
      if (!name) return null;
      return new Value(name, type, false, false);
    }
  }
}

/**
 * 
 * @param {vscode.TextDocument} document 
 */
const parse = (document) => {
  const root = {
    globals: {},
    types: {},
    natives: {},
    functions: {}
  };
  let globals = findBlock(document, GlobalsBlock[0], GlobalsBlock[1]);
  for (let i = 0; i < globals.length; i++) {
    for (let o = globals[i].start.line; o < globals[i].end.line; o++) {
      let line = document.lineAt(o);
      let value = findValue(line);
      if (value) {
        root.globals[value.name] = value;
      }
    }
  }
  let functions = findBlock(document, FunctionBlock[0], FunctionBlock[1]);
  for (let i = 0; i < functions.length; i++) {
    let func = findFunction(document.lineAt(functions[i].start.line));

    if (!func) continue;
    for (let o = functions[i].start.line; o < functions[i].end.line; o++) {
      let line = document.lineAt(o);
      if (!line.isEmptyOrWhitespace) {
        let localValue = findLocal(line);
        if (localValue) {
          func.locals.push(localValue);
        }
      }
    }
    root.functions[func.name] = func;
  }
  return root;
}

//=============================================前面的棄用 除了 Type

const fs = require("fs");
const path = require("path");

/**
 * 
 * @param {vscode.TextDocument} document 
 * @returns {{path:string,content:string}[]}
 */
const parseImport = (document) => {
  if (!document) return null;
  // 匹配非中文路徑
  const importRegExp = /^\s*\/\/!\s+import\s+"[^\u4e00-\u9fa5]+?"/gm;
  let importResult = importRegExp.exec(document.getText());
  return importResult ? importResult.map(importPath => {
    let pathResult = importPath.match(/(?<=")[^\u4e00-\u9fa5]+?(?=")/);
    if (!pathResult) return null;
    let jpath = pathResult.shift();

    let jabsPath = path.isAbsolute(jpath) ? jpath : path.resolve(path.dirname(document.fileName), jpath);
    // console.log(jabsPath)
    // console.log(document.fileName)
    // console.log(jabsPath.trim().length)
    // console.log(document.fileName.length)
    // console.log(document.fileName == jabsPath)
    // console.log(fs.existsSync(jabsPath))
    if (!fs.existsSync(jabsPath)) return null;
    let content = fs.readFileSync(jabsPath).toString();
    return { path: jabsPath, content };
  }).filter(s => s) : [];
}

const parseGlobals = (content) => {
  if (!content) return [];

  // 找到所有function塊
  let globalsResult = content.match(/globals[\s\S]+?endglobals/gm);
  if (!globalsResult) return [];
  let globals = globalsResult.map(text => {

    return text.split("\n").map(s => {
      if (!s || s.trim() == "") return null;

      let isConstant = /^\s*constant/.test(s);

      // 類聲明形式 constant class,local class,class
      let typeResult = s.match(`(?<=^\\s*constant\\s+)(${Type.join("|")})|(?<=^\\s*)(${Type.join("|")})`);
      let type = typeResult ? typeResult.shift() : null;
      if (!type) return null;

      let isArray = new RegExp(`${type}\\s+array`).test(content);

      // 標識符形式 class name, class array name
      let nameResult = content.match(isArray ? `(?<=${type}\\s+array\\s+)[a-zA-Z]\\w*` : `(?<=${type}\\s+)[a-zA-Z]\\w*`);
      let name = nameResult.shift();
      if (!name) return null;

      return { name, type, isConstant, isArray };
    }).filter(s => s);
  });
  return globals;
}

/**
  * 解析所有方法
  * @param {strig} content
  */
const parseFunctions = (content) => {
  if (!content) return [];
  // 找到所有function塊
  let functionsResult = content.match(/function[\s\S]+?endfunction/gm);
  if (!functionsResult) return [];
  let functions = functionsResult.map(text => {
    // 獲取方法名稱
    const nameResult = text.match(/(?<=^\s*function\s+)[a-zA-Z]\w+/);
    let name = nameResult ? nameResult.shift() : null;
    if (!name) return null;

    // 獲取方法參數 若空串或nothing 設置為空數組而不是null
    let argsStringResult = text.match(/(?<=takes\s+).+?(?=\s+returns)/);
    let argsString = argsStringResult ? argsStringResult.shift() : "nothing";
    let args = argsString == "nothing" ? [] : argsString.split(",").map(s => {
      // 無法接受只有類而沒有類名 亦不能接受只有類名而無類 如 takes integer , u1 returns
      let ptypeResult = s.match(Type.join("|"));
      if (!ptypeResult) return null;
      let ptype = ptypeResult ? ptypeResult.shift() : null;
      if (!ptype) return null;
      let pnameResult = s.match(`(?<=${ptype}\\s+)[a-z]\\w*`);
      if (!pnameResult) return null;
      let pname = pnameResult.shift();
      if (!pname) return null;
      return { name: pname, type: ptype };
    }).filter(s => s)

    // 獲取方法返回值 空串或nothing 設置為null
    let returnTypeResult = text.match(/(?<=returns\s+)[a-z]+/);
    let returnType = returnTypeResult ? returnTypeResult.shift() : "nothing";
    returnType = returnType == "nothing" ? null : returnType;

    // 獲取方法内部local變量
    /*
    let locals = text.split("\n").filter(s => /^\s*local/.test(s)).map(s => {
      // 類聲明形式 local class
      let typeResult = s.match(`(?<=^\\s*local\\s+)(${Type.join("|")})`);
      if (!typeResult) return null;
      let type = typeResult ? typeResult.shift() : null;
      if (!type) return null;

      let isArray = new RegExp(`${type}\\s+array`).test(s);
      // 標識符形式 class name, class array name
      let nameResult = s.match(isArray ? `(?<=${type}\\s+array\\s+)[a-zA-Z]\\w*` : `(?<=${type}\\s+)[a-zA-Z]\\w*`);
      if (!nameResult) return null;
      let name = nameResult.shift();
      if (!name) return null;

      return { name, type, isArray };
    }).filter(s => s);
  */
    return { name, parameters: args, returnType };
  }).filter(s => s);
  return functions;
}

module.exports = {
  parseFunctions, parseGlobals, parseImport
}