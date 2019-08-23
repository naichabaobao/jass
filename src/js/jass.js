const fs = require("fs")
const path = require("path")

let functions = {}
let values = {}

/**
 * 用于判断当前编辑文件是不是ai如果是ai只返回common.j同埋common.ai两个文件
 * 否者返回lib目录下所有.j文件
 */
let ai = false

/**
 * 设置ai
 * @param {boolean} isAi 
 */
const setAi = (isAi) => {
  ai = isAi
}

/**
 * 
 * @param {string} filePath 
 */
const readJFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8")
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
      let funcRegExp = new RegExp(/function[\s\S\n]+?endfunction|(constant\s+)?native.+?returns\s+\w+/, "gm")
      // 揾到native 或者 function 方法字符串数组并返回
      let v = funcRegExp.exec(uncommentContent)
      if (v)
        return v.filter(x => x).map(x => x)
    }
    return null
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * 處理j functions 並保存在functions中
 * @param {array} functionStrings j方法字符串數組
 * @param {string} fileName j文件名稱
 */
const parseJFunctions = (functionStrings, fileName = "") => {
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
    })
  }
}

/**
 * 解析出globals--endblobals内容
 * @param {string} content j文件内容
 */
const parseJGlobalsBlockString = (content) => {
  try {
    if (content && typeof content == "string") {
      // 獲取globals塊 同時去掉所有注釋
      let g = content.match(/globals[\s\S]+?endglobals/m)
      if (g)
        return g.shift().replace(/\/\/.+/g, "")
    }
    return null
  } catch (error) {
    console.error(error)
    return null
  }
}

const types = [
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
  "hashtable"]

let typesString = `(${types.join("|")})`

/**
 * 從globals塊内容中解析出全局定義(無視vjass語法中 private)
 * @param {string} content 
 */
const parseJValueStrings = (content) => {
  try {
    if (content && typeof content == "string" && content.includes("globals")) {
      // 正則拼裝 用於獲取全局量
      let constantReg = `constant\\s+${typesString}\\s+\\w+\\s*=.+`
      let varibleReg = `${typesString}\\s+\\w+\\s*=.+`
      let varibleArrayReg = `${typesString}\\s+array\\s+\\w+`
      let reg = `(${constantReg})|(${varibleReg})|(${varibleArrayReg})`
      let v = content.match(new RegExp(reg, "g"))
      if (v)
        return v.map(x => x.trim())
    }
    return null
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * 傳入全局量字符串數組 分別解析后保存在values中
 * @param {array} valueStrings 
 */
const parseJValues = (valueStrings, fileName = "") => {
  try {
    if (valueStrings && Array.isArray(valueStrings)) {
      valueStrings.forEach(valueString => {

        let original = valueString
        let isContent = valueString.includes("constant")
        let isArray = valueString.includes("array")
        let type = types.filter(x => valueString.includes(x)).shift()
        let name = valueString.replace(new RegExp(`${typesString}|(constant)|(array)|(=.+)|\\s+`, "g"), "")
        fileName ? fileName : ""
        values[name] = { original, fileName, name, isContent, isArray, type }
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const dirRoot = "../static/library"

/**
 * 读取目录下所有j文件
 * @param {string} abdir 
 */
const readJFiles = (abdir) => {
  let files = fs.readdirSync(path.join(__dirname, abdir), "utf8")
  let jFiles = new Array()
  files.forEach(x => {
    let filePath = path.join(__dirname, path.join(abdir, x))
    let file = fs.lstatSync(filePath)
    if (file.isDirectory()) {
      jFiles.concat(readJFiles(abdir + "/" + x))
    } else if (file.isFile()) {
      if (ai) {
        if (x == "common.j" || x == "common.ai") {
          jFiles.push(filePath)
        }
      } else {
        if (x.endsWith(".j")) {
          jFiles.push(filePath)
        }
      }
    }
  })
  return jFiles
}

// 读取库文件初始化
readJFiles(dirRoot).forEach(x => {
  let content = readJFile(x)
  if (content) {
    parseJFunctions(parseJFunctionStrings(content), path.parse(x).base)
    let globalsContent = parseJGlobalsBlockString(content)
    parseJValues(parseJValueStrings(globalsContent), path.parse(x).base)
  }
})

// 匹配文档
const commonDcumentations = require("../static/documentation/common")
for (const key in commonDcumentations) {
  if (functions[key]) {
    functions[key].documentation = commonDcumentations[key]
  }
}
module.exports = {
  functions, values, setAi
}