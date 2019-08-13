// @ts-nocheck
const fs = require('fs');
const vscode = require('vscode')
const description = require('./description')
var functions = []
var constants = []
/**
 * 讀取jass並解析，type，變量名，方法名等
 * @param path jass文件路徑
 */
const parseJassFile = (path, callback = null) => {
  fs.readFile(path, 'utf-8', function (err, data) {
    if (err) {
      console.error(err);
    }
    else {
      // 分析出functions
      functions = data.match(/\b(function|native)\s+\w+\s+takes\s+.+\s+returns\s+[a-z]+\b/g).map(x => {
        var functionName = x.substring(
          Math.max(x.indexOf('native') + 'native'.length, x.indexOf('function') + 'function'.length),
          x.indexOf('takes')
        ).trim()
        var argstring = x.substring(x.indexOf('takes') + 'takes'.length, x.indexOf('returns')).trim()
        var args = argstring == 'nothing' ? null : argstring.split(',').map(s => {
          var typeName = s.trim().split(' ')
          return { type: typeName[0].trim(), name: typeName[1].trim() }
        })
        var retType = x.substring(x.indexOf('returns') + 'returns'.length).trim()
        var returnType = retType == 'nothing' ? null : retType

        return {
          // 原樣
          original: x,
          // 類型
          type: vscode.CompletionItemKind.Function,
          // 名稱
          name: functionName,
          // 參數
          args: args,
          // 返回值
          returnType: returnType,
          // 插入文本
          insertText: `${functionName}(${args ? args.map(s => s.name).join(",") : ''})`,
          // 提示標題 
          detail: functionName,
          // 提示内容
          documentation: `function ${functionName} takes ${args ? args.map(s => s.type + ' ' + s.name).join(", ") : 'nothing'} returns ${returnType ? returnType : 'nothing'}\n${description.description[functionName] ? description.description[functionName] : ''}`
        };
      })

      globalstiring = data.match(/globals[\s\S]+endglobals/g).map(x => x).join(" ")

      constants = globalstiring.match(/(constant\s+|\s+)[a-z]+\s+\w+\s*=\s*([\w'\(\)\+\-\*\/\.\t ]+)|[a-z]+\s+array\s+\w+/g).map(x => {
        // 是否数组
        var isArray = new RegExp(/\barray\s/).test(x)
        if (isArray) {
          // 獲取標識符
          var names = x.match(/(?<=array+\s+)\w+/)
          var name = names && names.length > 0 ? names.pop() : null
          // 獲取class
          var clas = x.match(/[a-z]+(?=\s+array)/)
          var cla = clas && clas.length > 0 ? clas.pop() : null

          return {
            original: x,
            name: name,
            kind: vscode.CompletionItemKind.Variable,
            type: cla,
            isArray: true,
            // 插入文本
            insertText: name,
            // 提示標題
            detail: name,
            // 提示内容
            documentation: `${cla} ${isArray ? 'array ' : ' '}${name}\n${description.description[name] ? description.description[name] : ''}`
          }
        } else {
          // 獲取是否常量
          var isConst = new RegExp(/\bconstant\s/).test(x)
          // 獲取標識符
          var names = x.match(/(?<=[a-z]+\s+)\w+(?=\s+=)/)
          var name = names && names.length > 0 ? names.pop() : null
          // 獲取class
          var clas = x.match(/(?<=\s+)[a-z]+(?=\s+\w+\s*=)/)
          var cla = clas && clas.length > 0 ? clas.pop() : null
          return {
            original: x,
            name: name,
            kind: isConst ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable,
            type: cla,
            isArray: false,
            // 插入文本
            insertText: name,
            // 提示標題
            detail: name,
            // 提示内容
            documentation: `${isConst ? 'constant ' : ''}${cla} ${name}\n${description.description[name] ? description.description[name] : ''}`
          }
        }
      })


      if (callback) {
        console.log(constants)
        callback(functions, constants);
      }
    }
  });
}



module.exports = {
  parseJassFile
}