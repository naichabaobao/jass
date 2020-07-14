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

    this.description = "";
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
// console.log(Types)
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
// console.log(Globals.slice(0, 20))

// 3,找到方法
let funcs;
const DzApiFileName = "DzAPI.j";
/**
 * dzApi文件路徑
 */
const DzApiFilePath = path.resolve(__dirname, "../../resources/jass/", DzApiFileName);
const FuncRegExp = new RegExp(`^\\s*(function|(constant\\s+)?native)\\s+(?<name>[a-zA-Z]\\w*)(\\s+takes\\s+(nothing|(?<parameters>((${StatementTypeRegExpString + "|code"})\\s+[a-zA-Z]\\w*(\\s*,\\s*(${StatementTypeRegExpString + "|code"})\\s+[a-zA-Z]\\w*)*))))?(\\s+returns\\s+(nothing|(?<returnType>${StatementTypeRegExpString})))?`);
// const ArgsRegExp = new RegExp()

// 添加用戶指定路勁所有j
let customFiles;
let includes; // 此處要排序，後面要轉換爲字符串比對
const resolveCustomFiles =  function () {
  includes = vscode.workspace.getConfiguration().jass.includes.sort();
  customFiles = [];
  includes.forEach(dirPath => {
    const availableDirPath = dirPath.replace(/\u202a/,""); // 去除控制字符
    if(fs.existsSync(availableDirPath)){
      const stat = fs.statSync(availableDirPath);
      if(stat.isDirectory){
        customFiles.push(...fs.readdirSync(availableDirPath).map(fileName => path.resolve(availableDirPath, fileName)).filter(filePath => path.parse(filePath).ext == ".j" && fs.statSync(filePath).isFile()));
      }
    }
  });
}
resolveCustomFiles();
// console.log(customFiles);

const resolveFuncs = function (paths) {
  funcs = [];
  paths.forEach((filePath) => {
    if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
      const FileContent = fs.readFileSync(filePath).toString("utf8");
    FileContent.split("\n").forEach((line, lineIndex, allLines) => {
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
        const DescriptionRegExp = new RegExp(/\/\/\s*(?<description>.+)/);
        if (DescriptionRegExp.test(allLines[lineIndex - 1])) {
          const preLineContent = DescriptionRegExp.exec(allLines[lineIndex - 1]);
          func.description = preLineContent.groups.description;
        }
        funcs.push(func);
      }
    });
    }
  });
}
resolveFuncs([CommonJFilePath, CommonAiFilePath, BlizzardJFilePath, DzApiFilePath, ...customFiles]);



// console.log(Funcs.slice(0, 20));

// 處理為提示
const TypeItems = Types.map(type => {
  const item = new vscode.CompletionItem(type.type, vscode.CompletionItemKind.Class);
  item.detail = type.type;
  item.documentation = new vscode.MarkdownString().appendCodeblock(type.original);
  return item;
});

// console.log(TypeItems)

const GlobalItems = Globals.map(globalValue => {
  const item = new vscode.CompletionItem(`${globalValue.name}->${globalValue.type}`, globalValue.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
  item.filterText = globalValue.name;
  item.detail = `${globalValue.name} (${path.parse(globalValue.fileName).base})`;
  item.documentation = new vscode.MarkdownString().appendCodeblock(globalValue.original);
  return item;
});

let funcItems;
const resolveFuncItems = function () {
  funcItems = funcs.map(func => {
    const item = new vscode.CompletionItem(`${func.name}(${func.parameters.map(param => param.type).join(",")})->${func.returnType}`, vscode.CompletionItemKind.Function);
    item.insertText = func.name;
    item.filterText = func.name;
    item.detail = `${func.name} (${path.parse(func.fileName).base})`;
    item.documentation = new vscode.MarkdownString(func.description).appendCodeblock(func.original);
    return item;
  });
}
resolveFuncItems();

// 儅配置項includes變化時
vscode.workspace.onDidChangeConfiguration(e => {
  console.log(e)
  let currentIncludes = vscode.workspace.getConfiguration().jass.includes;
  if(includes.toString() != currentIncludes.sort().toString()){
    resolveCustomFiles();
    resolveFuncs([CommonJFilePath, CommonAiFilePath, BlizzardJFilePath, DzApiFilePath, ...customFiles]);
    resolveFuncItems();
  }
})

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
    if (canCompletion(document, position)) return [...TypeItems, ...GlobalItems, ...funcItems];
    return [];
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    const textLine = document.lineAt(position.line);
    const typeNames = [];
    
    for (let i = position.character - 1; i >= 0; i--) {
      const char = textLine.text.charAt(i);
      const pchar = textLine.text.charAt(i - 1);
      
      if (/\w/.test(char)) {
        typeNames.push(char);
        if (typeNames.length > 0 && (/\W/.test(pchar) || i == 0)) {
          const typeName = typeNames.reverse().join("");
          if (Types.findIndex(type => type.name == typeName)) { // 確認匹配的類已被定義
            return funcs.filter(func => func.returnType == typeName).map(func => {
              const item = new vscode.CompletionItem(`${func.name}(${func.parameters.map(param => param.type).join(",")})->${func.returnType}`, vscode.CompletionItemKind.Function);
              item.insertText = func.name;
              item.filterText = func.name;
              item.detail = `${func.name} (${path.parse(func.fileName).base})`;
              item.documentation = new vscode.MarkdownString(func.description).appendCodeblock(func.original);
              item.additionalTextEdits = [vscode.TextEdit.delete(new vscode.Range(position.line, position.character - typeName.length - 1, position.line, position.character))]
              return item;
            });
          }
        }
      }
    }
    return [];
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ".");

vscode.languages.registerSignatureHelpProvider("jass", {
  provideSignatureHelp(document, position, token, context) {
    const lineText = document.lineAt(position.line);
    let funcNames = [];
    let field = 1;
    let activeParameter = 0;
    let inString = false;
    for (let i = position.character - 1; i >= 0; i--) {
      const char = lineText.text.charAt(i);
      if (field > 0) {
        if (!inString && char == '"') {
          inString = true;
        } else if (inString && char == '"' && lineText.text.charAt(i - 1) != '\\') {
          inString = false;
        } else if (!inString && char == '(') {
          field--;
        } else if (!inString && char == ')') {
          field++;
        } else if (!inString && char == ',') {
          activeParameter++;
        }
      } else if (field == 0) {
        if (funcNames.length == 0 && /\s/.test(char)) {
          continue;
        } else if (/\w/.test(char)) {
          funcNames.push(char);
          // 向前預測
          if (funcNames.length > 0 && (/\W/.test(lineText.text.charAt(i - 1)) || i == 0)) {
            const funcName = funcNames.reverse().join("");
            const func = funcs.find(func => func.name == funcName);
            if (func) {
              const SignatureHelp = new vscode.SignatureHelp();
              const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.parameters.map(param => param.type + " " + param.name).join(", ")})->${func.returnType}`, new vscode.MarkdownString().appendCodeblock(func.original));
              SignatureInformation.parameters = func.parameters.map(param => new vscode.SignatureInformation(param.name));
              SignatureHelp.activeParameter = activeParameter;
              SignatureHelp.signatures.push(SignatureInformation);
              return SignatureHelp;
            }
          }
        }
      }
    }
    return null;
  }
}, "(", ",");

vscode.languages.registerHoverProvider("jass", {
  provideHover(document, position, token) {
    const keyword = document.getText(document.getWordRangeAtPosition(position));

    const func = funcs.find(fun => fun.name == keyword);
    if (func) {
      const hover = new vscode.MarkdownString(`${func.name} (${func.name})`).appendText(`\n${func.description}`).appendCodeblock(func.original)
      return new vscode.Hover(hover);
    }
  }
});