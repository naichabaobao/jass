/*初始方法*/

const fs = require("fs");
const path = require("path");

const { parseFunctions, parseGlobals } = require("../jass");

let jassDir = path.resolve(__dirname, "../../resources/jass");
let jFiles = fs.readdirSync(jassDir).filter(s => s.endsWith(".j") || s.endsWith(".ai"));

let contents = jFiles.map(fileName => {
  let content = fs.readFileSync(path.resolve(jassDir, fileName)).toString();
  return { fileName, content };
});

let functions = contents.map(s => {
  s.functions = parseFunctions(s.content);
  return s;
});

const initFiles = ["common.j", "blizzard.j", "common.ai"]
let globals = contents.filter(s => initFiles.includes(s.fileName)).map(s => {
  s.globals = parseGlobals(s.content);
  return s;
});

module.exports = { functions, globals };