const vscode = require("vscode");
let createDiagnosticCollection = vscode.languages.createDiagnosticCollection("jass");

let inFunction = false; // 方法中
let inFunctionName = false;
let inTakes = false;
let inTakesType = false;
let inTakesName = false;
let inReturns = false;
let inReturnsType = false;
let inFunctionBody = false;

let inLocal = false;
let inLocalType = false;
let inLocalName = false;
let inLocalArray = false;

let inExpression = false;

let inExpressionValue = false;
let inExpressionOperator = false;

let inPriority = 0; // 括號中

let inSet = false;
let inSetName = false;
let inSetArray = false;
let inArrayIndex = 0; // 下標中

let inEndFunction = false;

let injector = [];

class Injector {
  constructor() {
    this.event.infunction = [];
    this.event.infunctionname = [];
    this.event.intakes = [];
    this.event.intakestype = [];
    this.event.intakesname = [];
    this.event.inreturns = [];
    this.event.inreturnstype = [];
    this.event.infunctionbody = [];
    this.event.inlocal = [];
    this.event.inlocaltype = [];
    this.event.inlocalname = [];
    this.event.inlocalarray = [];
    this.event.inexpression = [];
    this.event.inexpressionvalue = [];
    this.event.inexpressionoperator = [];
    this.event.inpriority = [];
    this.event.inset = [];
    this.event.insetname = [];
    this.event.insetarray = [];
    this.event.inarrayindex = [];
    this.event.inendfunction = [];
  }

  /**
   * 
   * @param {string} type 
   * @param {function} callback 
   */
  addEventListener(type, callback) {
    if (this.event[type] && typeof this.event[type] == 'array' && typeof type == 'string') {
      this.event[type].push(callback);
    }
  }

  /**
   * 注入字符，
   * @param {string} char 
   */
  push(char) {

  }

}

/**
 * 
 * @param {vscode.TextDocument} document 
 */
const parse = (document) => {
  for (let i = 0; i < document.lineCount; i++) {
    const TextLine = document.lineAt(i);
  }
}


/**
 * @deprecated 改未错误检测，构思中
 */
vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    let items = [];
    console.log("code")
    try {
      createDiagnosticCollection.set(document.uri, [new vscode.Diagnostic(new vscode.Range(0, 0, 0, 20), "好晕啊", vscode.DiagnosticSeverity.Error)]);
    } catch (err) {
      console.log(err);
    }

    console.log("code")
    return items;
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ";");



