let vscode = require('vscode');

const { StatementType, ParamenterType } = require("./support-type");

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

/**
 * 
 * @param {string} content 
 */
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
      let typeResult = s.match(`(?<=^\\s*constant\\s+)(${StatementType.join("|")})|(?<=^\\s*)(${StatementType.join("|")})`);
      let type = typeResult ? typeResult.shift() : null;
      if (!type) return null;

      let isArray = new RegExp(`${type}\\s+array`).test(s);

      // 標識符形式 class name, class array name
      let nameResult = s.match(isArray ? `(?<=${type}\\s+array\\s+)[a-zA-Z]\\w*` : `(?<=${type}\\s+)[a-zA-Z]\\w*`);
      let name = nameResult ? nameResult.shift() : null;
      if (!name) return null;
      return { original: s.replace(/\s+/g, " "), name, type, isConstant, isArray };
    }).filter(s => s);
  });
  return globals;
}

/**
  * 解析所有方法
  * @param {string} content
  */
const parseFunctions = (content) => {
  if (!content) return [];
  // 找到所有function塊
  let functionsResult = content.match(/^\s*(constant\s+native|native|function).+/gm);
  if (!functionsResult) return [];
  let functions = functionsResult.map(text => {

    // 獲取方法名稱
    const nameResult = text.match(/(?<=(function|native)\s+)[a-zA-Z]\w+/);
    let name = nameResult ? nameResult.shift() : null;
    if (!name) return null;

    // 獲取方法參數 若空串或nothing 設置為空數組而不是null
    let argsStringResult = text.match(/(?<=takes\s+).+?(?=\s+returns)/);
    let argsString = argsStringResult ? argsStringResult.shift() : "nothing";
    let args = argsString == "nothing" ? [] : argsString.split(",").map(s => {
      // 無法接受只有類而沒有類名 亦不能接受只有類名而無類 如 takes integer , u1 returns
      let ptypeResult = s.match(ParamenterType.join("|"));
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
    return { original: text.replace(/\s+/g, " "), name, parameters: args, returnType };
  }).filter(s => s);
  return functions;
}

module.exports = {
  parseFunctions, parseGlobals, parseImport
}