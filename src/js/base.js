const fs = require("fs");
const path = require("path");

let jassDir = path.resolve(__dirname, "../resources/jass");
let jFiles = fs.readdirSync(jassDir).filter(s => s.endsWith(".j"));


// ((constant\s+)?native|function)\s+\w+\s+takes\s+(([a-z]+\s+\w+\s*,\s*)*[a-z]+\s+\w+|nothing)\s+returns\s+[a-z]+
const FunctionRegExp = new RegExp(/((constant\s+)?native|function)\s+[a-zA-Z]\w*\s+takes\s+(([a-z]+\s+\w+\s*,\s*)*[a-z]+\s+\w+|nothing)\s+returns\s+[a-z]+/, "g");

let contents = jFiles.map(fileName => {
  let content = fs.readFileSync(path.resolve(jassDir, fileName)).toString();
  return { fileName, content };
});

let jasss = contents.map(s => {
  let fuctionResults = FunctionRegExp.exec(s.content);
  console.log(fuctionResults)
  if (fuctionResults) {
    return fuctionResults.map(functionString => {
      console.log(functionString)
      let isConstant = functionString.includes("constant");
      let isNative = functionString.includes("native");
      let functionName = /[a-zA-Z]\w*(?=\s+takes)/.exec(functionString).shift();

      let argsStringResult = functionString.match(/(?<=takes\s+).+?(?=\s+returns)/);
      let argsString = argsStringResult ? argsStringResult.shift() : "nothing";
      let args = argsString == "nothing" ? [] : argsString.split(",").map(p => {
        let arg = p.trim().split(/\s+/);
        let type = arg[0];
        let name = arg[1];
        return { type, name };
      })

      let returnTypeResult = functionString.match(/(?<=returns\s+)[a-z]+/);
      let returnType = returnTypeResult ? returnTypeResult.shift() : "nothing";
      returnType = returnType == "nothing" ? null : returnType;

      return {
        isConstant, isNative, name: functionName, parameters: args, returnType
      };
    });
  }
});


console.log(jasss)