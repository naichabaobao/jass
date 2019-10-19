const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class Type {
  constructor(type, ext) {
    this.super = ext;
    this.type = type;
    this.fileName = null;
    this.original = null;
    this.range = null;
    this.typeRange = null;
    this.superRange = null;
  }
}

class Global {
  constructor(type, name) {
    this.isConstant = false;
    this.isArray = false;
    this.type = type;
    this.name = name;
    this.fileName = null;
    this.original = null;
    this.range = null;
    this.typeRange = null;
    this.nameRange = null;
  }
}

class Parameter {
  constructor(type, name) {
    this.type = type;
    this.name = name;
    this.range = null;
    this.typeRange = null;
    this.nameRange = null;
  }
}

class Func {
  constructor(name) {
    this.name = name;
    this.parameters = [];
    this.returnType = null;
    this.fileName = null;
    this.original = null;
    this.range = null;
    this.nameRange = null;
    this.returnTypeRange = null;
  }
}

const CommonJFileName = "common.j";
const BlizzardJFileName = "blizzard.j";
const CommonAiFileName = "common.ai";

/**
 * common.j文件所在的路徑
 */
const CommonJFilePath = path.resolve(__dirname, "../../resources/jass/", CommonJFileName);
/**
 * common.j文件的内容
 */
const CommonJContent = fs.readFileSync(CommonJFilePath).toString("utf8");

// 1,找到類型
const Types = [];
const KeywordType = "type";
const KeywordExtends = "extends";
const TypeMatchRegExp = new RegExp(/type\s+(?<type>[a-zA-Z]+)\s+extends\s+(?<super>[a-zA-Z]+)/);
CommonJContent.split("\n").forEach((value, index) => {
  if (TypeMatchRegExp.test(value)) {
    const typeContent = TypeMatchRegExp.exec(value);
    const result = typeContent.shift();
    const Groups = typeContent.groups;
    const type = new Type(Groups.type, Groups.super);
    type.original = `type ${Groups.type} extends ${Groups.super}`;
    type.range = new vscode.Range(index, typeContent.index, index, typeContent.index + result.length);
    type.typeRange = new vscode.Range(index, typeContent.index + result.indexOf(Groups.type), index, typeContent.index + result.indexOf(Groups.type) + Groups.type.length);
    type.superRange = new vscode.Range(index, typeContent.index + result.indexOf(Groups.super), index, typeContent.index + result.indexOf(Groups.super) + Groups.super.length);
    type.fileName = CommonJFilePath;
    Types.push(type);
  }
});
console.log(Types)
const StatementTypeRegExpString = ["integer", "real", "string", "boolean", "handle", ...Types.map(type => type.type)].join("|");

// 2,找到全局變量
const Globals = [];
/**
 * common.ai文件所在的路徑
 */
const CommonAiFilePath = path.resolve(__dirname, "../../resources/jass/", CommonAiFileName);
/**
 * blizzard.j文件所在的路徑
 */
const BlizzardJFilePath = path.resolve(__dirname, "../../resources/jass/", BlizzardJFileName);
const GlobalValueRegExp = new RegExp(`^\\s*((?<isConstant>constant)\\s+)?(?<type>${StatementTypeRegExpString})(\\s+(?<isArray>array))?\\s+(?<name>[a-zA-Z]\\w*)`);
const KeywordConstant = "constant";
const KeywordArray = "array";
[CommonJFilePath, CommonAiFilePath, BlizzardJFilePath].forEach(filePath => {
  const FileContent = fs.readFileSync(filePath).toString("utf8");
  let inGlobal = false; //記錄是否進入globals塊
  FileContent.split("\n").forEach((value, index) => {
    if (!inGlobal && /^\s*globals/.test(value)) {
      inGlobal = true;
    } else if (inGlobal && /^\s*endglobals/.test(value)) {
      inGlobal = false;
    } else if (inGlobal && GlobalValueRegExp.test(value)) {
      const globalValueContent = GlobalValueRegExp.exec(value);
      const result = globalValueContent.shift();
      const groups = globalValueContent.groups;
      const isConstant = !!groups.isConstant;
      const isArray = !!groups.isArray;
      const type = groups.type;
      const name = groups.name;
      const global = new Global(type, name);
      global.fileName = filePath;
      global.isConstant = isConstant;
      global.isArray = isArray;
      global.original = `${isConstant ? KeywordConstant + " " : ""}${type} ${isArray ? KeywordArray + " " : ""}${name}`;
      const contentIndex = globalValueContent.index;
      global.range = new vscode.Range(index, contentIndex, index, contentIndex + result.length);
      global.type = type;
      global.name = name;
      global.typeRange = new vscode.Range(index, contentIndex + result.indexOf(type), index, contentIndex + result.indexOf(type) + type.length);
      global.nameRange = new vscode.Range(index, contentIndex + result.indexOf(name), index, contentIndex + result.indexOf(name) + name.length);
      Globals.push(global);
    }
  });
});
console.log(Globals.slice(0, 20))

// 3,找到方法
const Funcs = [];
const DzApiFileName = "DzAPI.j";
/**
 * dzApi文件路徑
 */
const DzApiFilePath = path.resolve(__dirname, "../../resources/jass/", DzApiFileName);
const FuncRegExp = new RegExp(`^\\s*(function|(constant\\s+)?native)\\s+(?<name>[a-zA-Z]\\w*)(\\s+takes\\s+(nothing|(?<parameters>((${StatementTypeRegExpString + "|code"})\\s+[a-zA-Z]\\w*(\\s*,\\s*(${StatementTypeRegExpString + "|code"})\\s+[a-zA-Z]\\w*)*))))?(\\s+returns\\s+(nothing|(?<returnType>${StatementTypeRegExpString})))?`);
// const ArgsRegExp = new RegExp()
[CommonJFilePath, CommonAiFilePath, BlizzardJFilePath, DzApiFilePath].forEach((filePath) => {
  const FileContent = fs.readFileSync(filePath).toString("utf8");
  FileContent.split("\n").forEach((line, lineIndex) => {
    if (FuncRegExp.test(line)) {
      const FuncContent = FuncRegExp.exec(line);
      const result = FuncContent.shift();
      const groups = FuncContent.groups;
      const func = new Func();
      const name = groups.name;
      const parameterStrings = groups.parameters;
      const parameters = parameterStrings ? parameterStrings.split(/\s*,\s*/).map((parameterString) => {
        const paramArr = parameterString.split(/\s+/);
        const parameter = new Parameter(paramArr[0], paramArr[1]);
        parameter.range = new vscode.Range(lineIndex, result.indexOf(parameterString), lineIndex, result.indexOf(parameterString) + parameterString.length);
        parameter.typeRange = new vscode.Range(lineIndex, result.indexOf(parameterString), lineIndex, result.indexOf(parameterString) + paramArr[0].length);
        parameter.nameRange = new vscode.Range(lineIndex, result.indexOf(parameterString) + parameterString.length - paramArr[1].length, lineIndex, result.indexOf(parameterString) + parameterString.length);
        return parameter;
      }) : [];
      const returnType = groups.returnType ? groups.returnType : null;
      func.original = result.trimLeft().replace(/\s{2,}/g, " ");
      func.name = name;
      func.parameters = parameters;
      func.returnType = returnType;
      func.fileName = filePath;
      func.range = new vscode.Range(lineIndex, result.length - result.trimLeft().length, lineIndex, result.length);
      func.nameRange = new vscode.Range(lineIndex, result.indexOf(name), lineIndex, result.indexOf(name) + name.length);
      if (returnType) func.returnTypeRange = new vscode.Range(lineIndex, result.length - returnType.length, lineIndex, result.length);
      Funcs.push(func);
    }
  });
});

console.log(Funcs.slice(0, 20));

// 處理為提示
const TypeItems = Types.map(type => {
  const item = new vscode.CompletionItem(type.type, vscode.CompletionItemKind.Class);
  item.detail = type.type;
  item.documentation = new vscode.MarkdownString().appendCodeblock(type.original);
  return item;
});

console.log(TypeItems)

const GlobalItems = Globals.map(globalValue => {
  const item = new vscode.CompletionItem(globalValue.name, globalValue.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
  item.detail = `${globalValue.name} (${path.parse(globalValue.fileName).base})`; 
  item.documentation = new vscode.MarkdownString().appendCodeblock(globalValue.original);
  return item;
});

const FuncItems = Funcs.map(func => {
  const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
  item.detail = `${func.name} (${path.parse(func.fileName).base})`; 
  item.documentation = new vscode.MarkdownString().appendCodeblock(func.original);
  return item;
});

/**
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 */
const canCompletion = (document, position) => {
  const textLine = document.lineAt(position);
  let inString = false;
  for (let i = 0; i < position.character; i++) {
    if (!inString && textLine.text.charAt(i) == "/" && textLine.text.charAt(i - 1) == "/") {
      return false;
    } else if (!inString && textLine.text.charAt(i) == "\"") {
      inString = true;
    } else if (inString && textLine.text.charAt(i) == "\"" && textLine.text.charAt(i - 1) != "\\") {
      inString = false;
    }
  }
  return !inString;
}

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    if (canCompletion(document, position)) return [...TypeItems,...GlobalItems, ...FuncItems];
    return [];
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    return [];
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, "|");

vscode.languages.registerSignatureHelpProvider("jass", {
  provideSignatureHelp(document, position, token, context){
    // BlzChangeMinimapTerrainTex
    const SignatureHelp = new vscode.SignatureHelp();
    SignatureHelp.signatures.push(new vscode.SignatureInformation("BlzChangeMinimapTerrainTex", "6666"))
    return SignatureHelp;
  }
},"(")
