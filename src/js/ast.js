/**
 * 語法樹
 */
const vscode = require("vscode");
const characters = require("./triggre-characters");
const { ParamenterType } = require("./support-type")

class {
  constructor(document) {
    this.NodeType = {
      Comment,
      Macro, // 宏
      Type,
      Globals,
      Function, // 包含native方法
    }
    this.nodes = []
  }
  parse(content) {
    if (!content || content.trim() == "") return [];
    let lines = this.toLine(content)
    let functing = false; // 記錄是否開始function block
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*function/.test(line.content)) {
        if (functing) {
          this.nodes.push(this.parseFunctionHeade(line));
        } else {
          functing = true;
        }
      }
    }
  }
  /**
   * @param {string} content 
   */
  toLine(content) {
    if (!content || content.trim() == "") return [];
    let contents = content.split("\n");
    return contents.map((item, index) => {
      let tlContent = item.trimLeft();
      return {
        content: item,
        line: index + 1,
        isEmpty: tlContent == "",
        firstCharacterIndex: item.length - tlContent.length - 1,
        /**
         * 
         * @param {string} str 
         */
        startWith(str) {
          if (this.firstCharacterIndex < 0) return false;
          if (str.trimLeft().length == 0) return true;
          return item.substr(this.firstCharacterIndex).startsWith(str)
        },
      }
    })
  }


  /**
   * 解析方法信息
   * @param {{content:string,line:number,isEmpty:boolean,firstCharacterIndex:number,startWith:function}} line 
   * @returns {{ line: number, name: string, nameRange: { start: number, end: number }, parameters: {type:string,name:string}[], returnType:  string}}
   */
  parseFunctionHeade(line) {
    if (!line || line.isEmpty) return null;

    let isConstant = /^\s*constant/.test(line.content)
    let isNative = /^\s*(native|constant\s+native)/.test(line.content)

    // 獲取方法名稱
    const nameResult = line.content.match(/(?<=^\s*(function|native|constant\s+native)\s+)[a-zA-Z]\w+/);
    let name = nameResult ? nameResult.shift() : null;
    if (!name);

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

    return {
      line: line.line,
      closeLine: line.line,
      name: name,
      nameRange: {
        start: line.content.indexOf(name),
        end: this.start + name.length
      },
      isConstant,
      isNative,
      parameters: args,
      returnType: returnType,
    }
  }



}

var jass = {
  NodeType = {
    Comment,
    Macro, // 宏
    Type,
    Globals,
    Function, // 包含native方法
  },


  /**
   * jass文檔節點抽象表示
   */
  nodes: []

}


console.log(jass)
console.log(Object.defineProperty)

/*
Object.defineProperty(jass, "document", {
  set(value) {
    // 比對
    console.log(jass)
    console.log(value)
    jass.document = value;
  }
})
*/
jass.document = "666"

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    document.lineAt()
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, characters.l, characters.u)

