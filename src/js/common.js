const fs = require("fs")
const path = require("path")

let functions = {
  "ConvertRace": {
    "fileName": "",
    "original": "constant native ConvertRace takes integer i returns race",
    "name": "ConvertRace",
    "isConstant": true,
    "isNative": true,
    "args": [
      { "type": "integer", "name": "i", "documentation": "" }
    ],
    "returnType": "race",
    "insertText": "ConvertRace(i)",
    "documentation": ""
  }
}

const readJFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, {
      encoding: "utf8",
      flag: "r"
    })
  }
  catch (error) {
    console.error(error)
    return null
  }
}

/**
 * 揾到native 或者 function 方法字符串数组并返回
 * @param {string} content j内容
 */
const parseJFunctionStrings = (content) => {
  try {
    if (content) {
      // 去除注释
      let uncommentContent = content.replace(/\/\/.*/g, "")
      let funcRegExp = new RegExp(/((constant\s+)?native\s+\w+\s+takes\s+[\w\s,]+?\s+returns\s+\w+)|(function\s+\w+\s+takes\s+[\w\s,]+\s+returns\s+\w+)/, "g")
      // 揾到native 或者 function 方法字符串数组并返回
      return funcRegExp.exec(uncommentContent).filter(x => x).map(x => x)
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 * 處理j functions 並保存在functions中
 * @param {array} functionStrings j方法字符串數組
 * @param {string} fileName j文件名稱
 */
const parseJFunctionStrings2FunctionObject = (functionStrings, fileName = "") => {
  if (functionStrings && Array.isArray(functionStrings)) {
    functionStrings.forEach(x => {
      let original = x
      let functionName = x.replace(/((constant\s+)?native\s+)|(function\s+)|(\s+takes.+)/g, "")
      let isContent = x.startsWith("constant")
      let isNative = isContent ? x.replace(/constant\s+/).startsWith("native") : x.startsWith("native")
      let argsString = x.replace(/(.+takes\s+)|\s+returns.+/g, "")
      let args = argsString == "nothing" ? null : argsString.split(/\s*,\s*/).map(argString => {
        let argArr = argString.split(/\s+/)
        return {
          type: argArr[0],
          name: argArr[1]
        }
      })
      let returnTypeString = x.replace(/.+returns\s+/, "")
      let returnType = returnTypeString == "nothing" ? null : returnTypeString
      let insertText = functionName + "(" + (args ? args.map(s => s.name).join(", ") : "") + ")"
      fileName = fileName ? fileName : ""
      functions[functionName] = {
        fileName: fileName,
        original: original,
        name: functionName,
        isConstant: isContent,
        isNative: isNative,
        args: args,
        returnType: returnType,
        insertText: insertText
      }
      console.log(functions[functionName])
    })
  }
}

let paths = fs.readdirSync(path.join(__dirname, "../static/library"), "utf8")

parseJFunctionStrings2FunctionObject(parseJFunctionStrings(readJFile(path.join(__dirname, "../static/library/japi/YDWEJapiOther.j"))))

module.exports = {

}