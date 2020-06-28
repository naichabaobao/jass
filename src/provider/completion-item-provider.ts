import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";
import { Keyword } from '../main/keyword';
import { isVjassSupport } from '../main/configuration';
import { language } from '../main/constant';
import { Global, GlobalArray, GlobalImpl, parseGlobals, GlobalConstant } from '../main/global';
import { Type } from '../main/type';
import { FunctionImpl, Native, Function, parseFunctions, parseTakes, Take } from '../main/function';
import { CommonJGlobals, BlizzardJGlobals, CommonAiGlobals, DzApiJGlobals, CommonJNatives, BlizzardJNatives, CommonAiNatives, DzApiJNatives, CommonJFunctions, BlizzardJFunctions, CommonAiFunctions, DzApiJFunctions } from '../main/file';
// import { parseLibrarys, resolveGlobal, resolveFunction } from '../main/library';
import { Jasss } from '../main/include-file';
import { ModifierEnum } from '../main/modifier';
import { parseLocal, Local } from '../main/local';
import { allFunctions, allGlobals, allFunctionImpls, isSpace, isLetter } from '../main/tool';
import { isNumber } from 'util';

import {JassType} from '../jass/type';
import {getTypeDesc} from '../jass/type-desc';
import { Program } from '../jass/ast';

/**
 * 关键字提示提供
 */
class KeywordCompletionItemProvider implements vscode.CompletionItemProvider {

  /**
   * 将关键字转为提示
   * @param keyword 关键字
   */
  private creatKeywordCompletion(keyword: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
    item.detail = keyword;
    const ms = new vscode.MarkdownString();
    ms.appendCodeblock(keyword);
    item.documentation = ms;
    return item;
  }

  /**
   * jass关键字
   */
  private readonly KeywordCompletions: vscode.CompletionItem[] = Keyword.Keywords.map(keyword => this.creatKeywordCompletion(keyword));

  private readonly VjassCompletions: vscode.CompletionItem[] = Keyword.vKeywordKeywords.map(keyword => this.creatKeywordCompletion(keyword));

  private readonly AllKeywordCompletions: vscode.CompletionItem[] = [...this.KeywordCompletions, ...this.VjassCompletions];

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    if (isVjassSupport()) {
      return this.AllKeywordCompletions;
    } else {
      return this.KeywordCompletions;
    }
  }

}

/**
 * 类型提示提供
 */
class TypeCompletionItemProvider implements vscode.CompletionItemProvider {

  /**
   * 将类转为提示
   * @param type jassType
   */
  private creatTypeCompletion(type: Type): vscode.CompletionItem {
    const item = new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class);
    item.detail = type.name;
    const ms = new vscode.MarkdownString();
    ms.appendText(type.description);
    ms.appendCodeblock(type.origin());
    item.documentation = ms;
    return item;
  }

  /**
   * jass类
   */
  private readonly TypeCompletions: vscode.CompletionItem[] = Type.AllTypes.map(type => this.creatTypeCompletion(type));

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    return this.TypeCompletions;
  }

}



/**
 * 全局变量提示提供
 */
class GlobalCompletionItemProvider implements vscode.CompletionItemProvider {



  private get commonJGlobals(): Array<vscode.CompletionItem> {
    return CommonJGlobals.map(global => this.creatGlobalCompletion(global));
  }

  private get blizzardJGlobals(): Array<vscode.CompletionItem> {
    return BlizzardJGlobals.map(global => this.creatGlobalCompletion(global));
  }
  private get commonAiGlobals(): Array<vscode.CompletionItem> {
    return CommonAiGlobals.map(global => this.creatGlobalCompletion(global));
  }
  private get dzApiJGlobals(): Array<vscode.CompletionItem> {
    return DzApiJGlobals.map(global => this.creatGlobalCompletion(global));
  }

  private get mainGlobals(): Array<vscode.CompletionItem> {
    return [...this.commonJGlobals, ...this.blizzardJGlobals, ...this.commonAiGlobals, ...this.dzApiJGlobals];
  }

  /**
   * 将全局转为提示
   * @param global 全局变量
   */
  private creatGlobalCompletion(global: GlobalImpl): vscode.CompletionItem {
    let completionItemKind;
    if (global instanceof Global || global instanceof GlobalArray) {
      completionItemKind = vscode.CompletionItemKind.Variable;
    } else {
      completionItemKind = vscode.CompletionItemKind.Constant;
    }
    var name = "";
    if (global.modifier == ModifierEnum.Public) {
      name = global.name;
    } else {
      name = global.name;
    }
    const item = new vscode.CompletionItem(name, completionItemKind);
    item.detail = name;
    const ms = new vscode.MarkdownString();
    ms.appendText(global.descript);
    ms.appendCodeblock(global.origin());
    item.documentation = ms;
    return item;
  }

  // include全局
  private get includeGlobals(): Array<vscode.CompletionItem> {
    return Jasss.map(jass => jass.globals).flat().filter(global => global.modifier != ModifierEnum.Private).map(global => this.creatGlobalCompletion(global));
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const content = document.getText();
    const globals = parseGlobals(content);

    const items = globals.map(global => this.creatGlobalCompletion(global));

    return [...this.mainGlobals, ...this.includeGlobals, ...items];
  }

}

/**
 * 全局变量提示提供
 */
class FunctionCompletionItemProvider implements vscode.CompletionItemProvider {



  private get commonJNatives(): Array<vscode.CompletionItem> {
    return CommonJNatives.map(func => this.creatCompletion(func));
  }

  private get blizzardJNatives(): Array<vscode.CompletionItem> {
    return BlizzardJNatives.map(func => this.creatCompletion(func));
  }
  private get commonAiNatives(): Array<vscode.CompletionItem> {
    return CommonAiNatives.map(func => this.creatCompletion(func));
  }
  private get dzApiJNatives(): Array<vscode.CompletionItem> {
    return DzApiJNatives.map(func => this.creatCompletion(func));
  }

  private get mainNativesCompletionItem(): Array<vscode.CompletionItem> {
    return [...this.commonJNatives, ...this.blizzardJNatives, ...this.commonAiNatives, ...this.dzApiJNatives];
  }

  private get commonJFunctions(): Array<vscode.CompletionItem> {
    return CommonJFunctions.map(func => this.creatCompletion(func));
  }

  private get blizzardJFunctions(): Array<vscode.CompletionItem> {
    return BlizzardJFunctions.map(func => this.creatCompletion(func));
  }
  private get commonAiFunctions(): Array<vscode.CompletionItem> {
    return CommonAiFunctions.map(func => this.creatCompletion(func));
  }
  private get dzApiJFunctions(): Array<vscode.CompletionItem> {
    return DzApiJFunctions.map(func => this.creatCompletion(func));
  }

  private get mainFunctionsCompletionItem(): Array<vscode.CompletionItem> {
    return [...this.commonJFunctions, ...this.blizzardJFunctions, ...this.commonAiFunctions, ...this.dzApiJFunctions];
  }

  private get allMainCompletionItem(): Array<vscode.CompletionItem> {
    return [...this.mainNativesCompletionItem, ...this.mainFunctionsCompletionItem];
  }

  /**
   * 将全局转为提示
   * @param global 全局变量
   */
  private creatCompletion(func: FunctionImpl): vscode.CompletionItem {
    var name: string = "";
    if (func instanceof Native) {
      name = func.name;
    } else if (func instanceof Function) {
      func as Function;
      if (func.modifier == ModifierEnum.Public) {
        name = func.name;
      } else {
        name = func.name;
      }
    }

    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
    item.detail = name;
    const ms = new vscode.MarkdownString();
    ms.appendText(func.descript);
    ms.appendCodeblock(func.origin());
    item.documentation = ms;
    return item;
  }

  private get includeFunctions(): Array<vscode.CompletionItem> {
    return Jasss.map(jass => jass.functions).flat().filter(func => func.modifier != ModifierEnum.Private).map(func => this.creatCompletion(func));
  }


  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    console.log(this.includeFunctions);

    const content = document.getText();
    const functions = parseFunctions(content);
    var items: vscode.CompletionItem[] = functions.map(func => this.creatCompletion(func));

    return [...this.allMainCompletionItem, ...this.includeFunctions, ...items];
  }

}

/**
 * 局部变量参数提示
 */
class CurrentCompletionItemProvider implements vscode.CompletionItemProvider {

  /**
     * 解析当前文档
     */
  private getCurrentComplateItems(document: vscode.TextDocument, position: vscode.Position): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    // 以function开头
    const functionLineRegExp = new RegExp(`^\\s*${Keyword.Function}\\b`);

    // 找local和方法参数
    for (let i = position.line; i >= 0; i--) {

      const TextLine = document.lineAt(i);
      const text = TextLine.text;
      if (!TextLine.isEmptyOrWhitespace) {

        const local = parseLocal(text);
        if (local) {
          const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Variable);
          const ms = new vscode.MarkdownString();
          ms.appendCodeblock(local.origin());
          item.documentation = ms;
          items.push(item);
        }

        if (functionLineRegExp.test(text)) {
          const takes = parseTakes(text);
          takes.forEach(take => {
            const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.TypeParameter);
            const ms = new vscode.MarkdownString();
            ms.appendCodeblock(take.origin());
            item.documentation = ms;
            items.push(item);
          });
          break;
        }

      }


    }

    return items;
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    return this.getCurrentComplateItems(document, position);
  }

}

/**
 * 类型点提示
 */
class ClassCompletionItemProvider implements vscode.CompletionItemProvider {

  private findMatchType(document: vscode.TextDocument, position: vscode.Position): string | null {
    const content = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const result = content.match(/(?<key>[a-zA-Z][a-zA-Z0-9_]*)\.$/);// \s*
    let key = null;
    if (result && result.groups && result.groups.key) {
      key = result.groups.key;
    }
    return key;
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {

    const items = new Array<vscode.CompletionItem>();

    const typeName = this.findMatchType(document, position);
    if (typeName) {
      const content = document.getText();
      const functions = parseFunctions(content);
      [...allFunctions(), ...functions].filter(func => func.returns.name == typeName).forEach(func => {
        const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
        const ms = new vscode.MarkdownString();
        ms.appendText(func.descript);
        ms.appendCodeblock(func.origin());
        item.documentation = ms;

        item.additionalTextEdits = [vscode.TextEdit.delete(new vscode.Range(new vscode.Position(position.line, position.character - typeName.length - 1), position))];

        items.push(item);
      });

      const globals = parseGlobals(content);
      [...allGlobals(), ...globals].filter(global => global.type.name == typeName).forEach(global => {
        const kind = global instanceof GlobalConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
        const item = new vscode.CompletionItem(global.name, kind);
        const ms = new vscode.MarkdownString();
        ms.appendText(global.descript);
        ms.appendCodeblock(global.origin());
        item.documentation = ms;

        item.additionalTextEdits = [vscode.TextEdit.delete(new vscode.Range(new vscode.Position(position.line, position.character - typeName.length - 1), position))];

        items.push(item);
      });
    }

    return items;
  }


}

vscode.languages.registerCompletionItemProvider(language, new ClassCompletionItemProvider, ".");

/**
 * 标记当前position提示类型
 */
enum CompletionPosition {
  Unkown,
  Nil,
  Call,
  TakesType,
  Returns,
  Local,
  LocalNaming,
  Set,
  /**
   * @unuse
   */
  Return,
  FunctionNaming,
  FunctionCall,
  Modifier,
  Constant,
  Native,
  Type,
  Extends,
  TypeNaming,

  // 加号
  Plus, 
  // 减号,乘号,除号
  Operator,
}

// 静态化数据


/**
 * 整合提示
 */
class CompletionItemProvider implements vscode.CompletionItemProvider {

  private typeItems = () => {
    const origin = (type:JassType) => {
      let originString = `type ${type.name}`;
      const appendExtends = (extendType:JassType) => {
        if(extendType.extend) {
          originString += ` extends ${extendType.extend.name}`;
          appendExtends(extendType.extend);
        }
      }
      appendExtends(type);
      return originString;
    }
    return JassType.types().map(type => {
      const item = new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class);
      item.detail = type.name;
      item.documentation = new vscode.MarkdownString()
      .appendText(getTypeDesc(type.name))
      .appendCodeblock(origin(type));
      return item;
    });
  }

  private readonly isNilRegExp = new RegExp(`^\\s*[a-zA-Z0-9_]*$`);
  private readonly isCallRegExp = new RegExp(`\\bcall\\s+[a-zA-Z][a-zA-Z0-9_]*$`);
  private readonly isTakesTypeRegExp = new RegExp(`(\\btakes\\s+[a-zA-Z]*|\\btakes\\s+|\\btakes\\s+([a-zA-Z0-9_ \\t]+\\s*,\\s*)+[a-zA-Z]*)$`);
  private readonly isReturnsRegExp = new RegExp(`\\breturns\\s+[a-zA-Z]*$`);
  private readonly isLocalRegExp = new RegExp(`\\blocal\\s+[a-zA-Z]*$`);
  private readonly isLocalNamingRegExp = new RegExp(`\\blocal\\s+[a-zA-Z]+\\s+array\\s+[a-zA-Z][a-zA-Z0-9_]*$|\\blocal\\s+[a-zA-Z]+\\s+[a-zA-Z][a-zA-Z0-9_]*$|\\blocal\\s+[a-zA-Z]+\\s+$`);
  private readonly isSetRegExp = new RegExp(`\\bset\\s+[a-zA-Z][a-zA-Z0-9_]*$|\\bset\\s+$`);
  private readonly isFunctionNamingRegExp = new RegExp(`(?<!\\(\\s*|,\\s*)function\\s+[a-zA-Z][a-zA-Z0-9_]*$|(?<!\\(\\s*|,\\s*)\\s*function\\s+$`);
  private readonly isNativeNamingRegExp = new RegExp(`\\bnative\\s+[a-zA-Z][a-zA-Z0-9_]*$`);
  private readonly isFunctionCallRegExp = new RegExp(`(\\(\\s*|,\\s*)function\\s+[a-zA-Z][a-zA-Z0-9_]*$|(\\(\\s*|,\\s*)\\s*function\\s+$`);
  private readonly isModifierRegExp = new RegExp(`\\b(private|public)\\s+[a-zA-Z]*$`);
  private readonly isConstantRegExp = new RegExp(`\\bconstant\\s+[a-zA-Z]*$`);
  private readonly isTypeRegExp = new RegExp(`\\btype\\s+[a-zA-Z]*$`);
  private readonly isExtendsRegExp = new RegExp(`\\bextends\\s+[a-zA-Z]*$`);
  // 所有類型的或字符串
  private readonly typeString = Type.AllTypes.map(type => type.name).sort((typeName1, typeName2) => typeName2.length - typeName1.length).join("|");
  private readonly isTypeNamingRegExp = new RegExp(`\\b(${this.typeString})\\s+[a-zA-Z]*$|\\b(${this.typeString})\\s+array\\s+[a-zA-Z]*$`);

  private readonly isPlusRegExp = new RegExp(/\+\s*[a-zA-Z][a-zA-Z0-9_]*$/);
  // private readonly isOperatorRegExp = new RegExp(`(\\b(\\+|-|\\*)\\s*$)|(\\b(\\+|-|\\*)\\s*[a-zA-Z][a-zA-Z0-9_]*$)`);
  private readonly isOperatorRegExp = new RegExp(/(\/|-|\*)\s*[a-zA-Z][a-zA-Z0-9_]*$/);
  // private readonly isProductRegExp = new RegExp(`\\b(${this.typeString})\\s+[a-zA-Z]*$|\\b(${this.typeString})\\s+array\\s+[a-zA-Z]*$`);
  // private readonly isDivisionRegExp = new RegExp(`\\b(${this.typeString})\\s+[a-zA-Z]*$|\\b(${this.typeString})\\s+array\\s+[a-zA-Z]*$`);

  private completioType = CompletionPosition.Unkown;

  private handleCompletionType(document: vscode.TextDocument, position: vscode.Position) {
    const line = document.lineAt(position.line);

    const lineText = line.text;

    const lineSubText = lineText.substring(0, position.character);



    // console.log("this.isTakesTypeRegExp.test(lineSubText)" + this.isTakesTypeRegExp.test(lineSubText))
    if (this.isNilRegExp.test(lineSubText)) {
      console.log("nil")
      this.completioType = CompletionPosition.Nil;
    } else if (this.isCallRegExp.test(lineSubText)) {
      console.log("call")
      this.completioType = CompletionPosition.Call;
      console.log(this.completioType)
    } else if (this.isTakesTypeRegExp.test(lineSubText)) {
      console.log("takes")
      this.completioType = CompletionPosition.TakesType;
    } else if (this.isReturnsRegExp.test(lineSubText)) {
      this.completioType = CompletionPosition.Returns;
    } else if (this.isLocalRegExp.test(lineSubText)) {
      console.log("local")
      this.completioType = CompletionPosition.Local;
    } else if (this.isLocalNamingRegExp.test(lineSubText)) {
      console.log("local naming")
      this.completioType = CompletionPosition.LocalNaming;
    } else if (this.isSetRegExp.test(lineSubText)) {
      console.log("set")
      this.completioType = CompletionPosition.Set
    } else if (this.isFunctionNamingRegExp.test(lineSubText)) {
      console.log("function naming")
      this.completioType = CompletionPosition.FunctionNaming;
    }
    else if (this.isFunctionCallRegExp.test(lineSubText)) {
      console.log("function call")
      this.completioType = CompletionPosition.FunctionCall;
    }
    else if (this.isModifierRegExp.test(lineSubText)) {
      console.log("modifier")
      this.completioType = CompletionPosition.Modifier;
    }
    else if (this.isConstantRegExp.test(lineSubText)) {
      console.log("constant")
      this.completioType = CompletionPosition.Constant;
    }
    else if (this.isNativeNamingRegExp.test(lineSubText)) {
      console.log("native")
      this.completioType = CompletionPosition.Native;
    }
    else if (this.isTypeRegExp.test(lineSubText)) {
      console.log("type")
      this.completioType = CompletionPosition.Type;
    }
    else if (this.isExtendsRegExp.test(lineSubText)) {
      console.log("extends")
      this.completioType = CompletionPosition.Extends;
    }
    else if (this.isTypeNamingRegExp.test(lineSubText)) {
      console.log("TypeNaming")
      this.completioType = CompletionPosition.TypeNaming;
    }
    else if(this.isPlusRegExp.test(lineSubText)) {
      console.log("plus");
      this.completioType = CompletionPosition.Plus;
    }
    else if(this.isOperatorRegExp.test(lineSubText)) {
      console.log("Operator");
      this.completioType = CompletionPosition.Operator;
    }
    else {
      this.completioType = CompletionPosition.Unkown;
    }


  }

  private keywordToCompletionItem(keyword: string): vscode.CompletionItem {
    return new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  }

  private keywordsToCompletionItem(keywords: Array<string>): Array<vscode.CompletionItem> {
    return keywords.map(key => this.keywordToCompletionItem(key));
  }

  private keywordCompletionItems(): Array<vscode.CompletionItem> {
    return this.keywordsToCompletionItem(Keyword.allKeywords);
  }

  private typeToCompletionItem(type: Type): vscode.CompletionItem {
    const item = new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class);
    item.documentation = new vscode.MarkdownString().appendText(type.description).appendCodeblock(type.origin());
    return item;
  }

  private typesToCompletionItem(types: Array<Type>): Array<vscode.CompletionItem> {
    return types.map(type => this.typeToCompletionItem(type));
  }

  private statementCompletionItems(): Array<vscode.CompletionItem> {
    return this.typesToCompletionItem(Type.StatementTypes);
  }

  private takeCompletionItems(): Array<vscode.CompletionItem> {
    return this.typesToCompletionItem(Type.TakesTypes);
  }

  private functionToCompletionItem(func: Function): vscode.CompletionItem {
    const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
    item.detail = func.name;
    item.documentation = new vscode.MarkdownString().appendText(func.descript).appendCodeblock(func.origin());
    return item;
  }

  private nativeToCompletionItem(func: Native): vscode.CompletionItem {
    const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
    item.detail = func.name;
    item.documentation = new vscode.MarkdownString().appendText(func.descript).appendCodeblock(func.origin());
    return item;
  }

  private functionImplToCompletionItem(func: FunctionImpl): vscode.CompletionItem {
    if (func instanceof Function) {
      return this.functionToCompletionItem(func);
    } else if (func instanceof Native) {
      return this.nativeToCompletionItem(func);
    }
    const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
    item.detail = func.name;
    item.documentation = new vscode.MarkdownString().appendText(func.descript).appendCodeblock(func.origin());
    return item;
  }

  private functionsToCompletionItem(funcs: Array<FunctionImpl>): Array<vscode.CompletionItem> {
    return funcs.map(func => this.functionImplToCompletionItem(func));
  }

  private allFunctionImplCompletionItem(): Array<vscode.CompletionItem> {
    return this.functionsToCompletionItem(allFunctionImpls());
  }

  /**
   * @deprecated 使用代替resolveCurrentFileFunction(document)
   * @param document  
   */
  private getCurrentFunctions(document: vscode.TextDocument): Array<FunctionImpl> {
    return this.parseFunctionsAndLibraryResolve(document.getText());
  }

  private globalConstantToCompletionItem(global: GlobalConstant): vscode.CompletionItem {
    const item = new vscode.CompletionItem(global.name, vscode.CompletionItemKind.Constant);
    item.detail = global.name;
    item.documentation = new vscode.MarkdownString().appendText(global.descript).appendCodeblock(global.origin());
    return item;
  }

  private globalUnconstantToCompletionItem(global: GlobalArray | Global): vscode.CompletionItem {
    const item = new vscode.CompletionItem(global.name, vscode.CompletionItemKind.Variable);
    item.detail = global.name;
    item.documentation = new vscode.MarkdownString().appendText(global.descript).appendCodeblock(global.origin());
    return item;
  }

  private globalImplToCompletionItem(global: GlobalImpl): vscode.CompletionItem {
    if (global instanceof GlobalConstant) {
      return this.globalConstantToCompletionItem(global);
    }
    return this.globalUnconstantToCompletionItem(global);
  }

  private allGlobalCompletionItems(): Array<vscode.CompletionItem> {
    return allGlobals().map(global => this.globalImplToCompletionItem(global));
  }

  private globalsToCompletionItems(globals: Array<GlobalImpl>): Array<vscode.CompletionItem> {
    return globals.map(global => this.globalImplToCompletionItem(global));
  }

  private getCurrentGlobals(document: vscode.TextDocument): Array<GlobalImpl> {
    return parseGlobals(document.getText());
  }

  private nilCompletionItems(): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    const keywords = [
      // jass
      Keyword.Function, Keyword.Endfunction, Keyword.Constant, Keyword.Native, Keyword.Local, Keyword.Type, Keyword.Set, Keyword.Call, Keyword.If, Keyword.Else, Keyword.Elseif, Keyword.Endif, Keyword.Loop, Keyword.Endloop, Keyword.Exitwhen, Keyword.Return, Keyword.Globals, Keyword.Endglobals,
      // vjass
      Keyword.keywordLibrary, Keyword.keywordEndLibrary, Keyword.keywordScope, Keyword.keywordEndScope, Keyword.keywordPrivate, Keyword.keywordPublic, Keyword.keywordStatic, Keyword.keywordInterface, Keyword.keywordEndInterface, Keyword.keywordStruct, Keyword.keywordEndStruct, Keyword.keywordMethod, Keyword.keywordEndMethod, Keyword.keywordThis, Keyword.keywordDelegate, Keyword.keywordDebug
    ]
    items.push(...this.keywordsToCompletionItem(keywords));
    // items.push(...this.statementCompletionItems());
    items.push(...this.typeItems());
    return items;
  }

  private takesTypeCompletionItems(): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...this.takeCompletionItems());
    items.push(this.typeToCompletionItem(Type.nothing));
    return items;
  }

  private returnsCompletionItems(): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...this.statementCompletionItems());
    items.push(this.typeToCompletionItem(Type.nothing));
    return items;
  }

  /**
   * 所有方法 和 當前文檔方法
   * @param document 
   */
  private allAndCurrentFunctionImplCompletions(document: vscode.TextDocument): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...this.allFunctionImplCompletionItem());
    /*
    items.push(...this.functionsToCompletionItem(this.getCurrentFunctions(document)));
    */
    // 2020年6月21日
    items.push(...this.resolveCurrentFileFunction(document));
    return items;
  }

  /**
   * 解析出方法並進行lib處理
   */
  private parseFunctionsAndLibraryResolve(content: string): Array<Function> {
    const functions = parseFunctions(content);
    // const librarys = parseLibrarys(content);
    // resolveFunction(librarys, functions);
    return functions;
  }

  /**
   * 解析当前文档
   */
  private getCurrentComplateItems(document: vscode.TextDocument, position: vscode.Position): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();

    // 找local和方法参数
    for (let i = position.line; i >= 0; i--) {

      const TextLine = document.lineAt(i);
      const text = TextLine.text;
      if (!TextLine.isEmptyOrWhitespace) {

        const local = parseLocal(text);
        if (local) {
          const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Variable);
          const ms = new vscode.MarkdownString();
          ms.appendCodeblock(local.origin());
          item.documentation = ms;
          items.push(item);
        }

        if (/\bfunction\b/.test(text) && /\btakes\b/.test(text)) {
          const takes = parseTakes(text);
          takes.forEach(take => {
            const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.TypeParameter);
            const ms = new vscode.MarkdownString();
            ms.appendCodeblock(take.origin());
            item.documentation = ms;
            items.push(item);
          });
          break;
        }

      }


    }

    return items;
  }

  private setCompletions(document: vscode.TextDocument, position: vscode.Position): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    // 過濾出非constant 的global，並解析成item
    const toUnconstantGlobals = (globals: Array<Global | GlobalArray>): Array<vscode.CompletionItem> => {
      return globals.filter(global => !(global instanceof GlobalConstant)).map(global => this.globalUnconstantToCompletionItem(global));
    }
    items.push(...toUnconstantGlobals(allGlobals()));
    items.push(...toUnconstantGlobals(parseGlobals(document.getText())));
    items.push(...this.getCurrentComplateItems(document, position));
    return items;
  }

  private functionCallCompletions(document: vscode.TextDocument): Array<vscode.CompletionItem> {
    return [...allFunctionImpls(), ...this.parseFunctionsAndLibraryResolve(document.getText())].filter(func => func.takes.length == 0).map(func => this.functionImplToCompletionItem(func));
  }

  private modifierCompletions(): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    const keywords = [
      // jass
      Keyword.Constant, Keyword.Function,
      // vjass
      Keyword.keywordStatic, Keyword.keywordInterface, Keyword.keywordStruct, Keyword.keywordMethod
    ]
    items.push(...this.keywordsToCompletionItem(keywords));
    // items.push(...this.statementCompletionItems());
    items.push(...this.typeItems());
    return items;
  }

  private unkwonCompletionItems(document: vscode.TextDocument, position: vscode.Position): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...this.keywordCompletionItems());
    items.push(...this.allFunctionImplCompletionItem());
    items.push(...this.allGlobalCompletionItems());
    items.push(...this.globalsToCompletionItems(this.getCurrentGlobals(document)));
    items.push(...this.getCurrentComplateItems(document, position));
    return items;
  }

  private plusCompletionItems(document: vscode.TextDocument, position: vscode.Position) : Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    this.getLocals(document, position).filter(local => {
      return local.type.name == Type.integer.name || local.type.name == Type.real.name || local.type.name == Type.string.name;
    }).forEach(local => {
      const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Variable);
      item.documentation = new vscode.MarkdownString().appendCodeblock(local.origin());
      items.push(item);
    });
  
    this.getTakes(document, position).filter(take => {
      return take.type.name == Type.integer.name || take.type.name == Type.real.name || take.type.name == Type.string.name;
    }).forEach(take => {
      const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.TypeParameter);
      item.documentation = new vscode.MarkdownString().appendCodeblock(take.origin());
      items.push(item);
    });
   items.push(...this.typeItems());
    this.getCurrentGlobals(document).filter(global => {
      return global.type.name == Type.integer.name || global.type.name == Type.real.name || global.type.name == Type.string.name;
    }).forEach(global => {
      items.push(this.globalImplToCompletionItem(global));
    });
    /*
    this.getCurrentFunctions(document).filter(func => {
      return func.returns.name == Type.integer.name || func.returns.name == Type.real.name || func.returns.name == Type.string.name;
    }).forEach(func => {
      items.push(this.functionImplToCompletionItem(func));
    });
    */
    // 2020年6月21日
    items.push(...this.resolveCurrentFileFunction(document));
    allGlobals().filter(global => {
      return global.type.name == Type.integer.name || global.type.name == Type.real.name || global.type.name == Type.string.name;
    }).forEach(global => {
      items.push(this.globalImplToCompletionItem(global));
    });
    allFunctionImpls().filter(func => {
      return func.returns.name == Type.integer.name || func.returns.name == Type.real.name || func.returns.name == Type.string.name;
    }).forEach(func => {
      items.push(this.functionImplToCompletionItem(func));
    });
    return items;
  }

  private operatorCompletionItems(document: vscode.TextDocument, position: vscode.Position) : Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    this.getLocals(document, position).filter(local => {
      return local.type.name == Type.integer.name || local.type.name == Type.real.name;
    }).forEach(local => {
      const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Variable);
      item.documentation = new vscode.MarkdownString().appendCodeblock(local.origin());
      items.push(item);
    });
    this.getTakes(document, position).filter(take => {
      return take.type.name == Type.integer.name || take.type.name == Type.real.name;
    }).forEach(take => {
      const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.TypeParameter);
      item.documentation = new vscode.MarkdownString().appendCodeblock(take.origin());
      items.push(item);
    });
    this.getCurrentGlobals(document).filter(global => {
      return global.type.name == Type.integer.name || global.type.name == Type.real.name;
    }).forEach(global => {
      items.push(this.globalImplToCompletionItem(global));
    });
    /*
    this.getCurrentFunctions(document).filter(func => {
      return func.returns.name == Type.integer.name || func.returns.name == Type.real.name;
    }).forEach(func => {
      items.push(this.functionImplToCompletionItem(func));
    });
    */
   // 2020年6月21日
   items.push(...this.resolveCurrentFileFunction(document));

    allGlobals().filter(global => {
      return global.type.name == Type.integer.name || global.type.name == Type.real.name;
    }).forEach(global => {
      items.push(this.globalImplToCompletionItem(global));
    });
    allFunctionImpls().filter(func => {
      return func.returns.name == Type.integer.name || func.returns.name == Type.real.name;
    }).forEach(func => {
      items.push(this.functionImplToCompletionItem(func));
    });
    return items;
  }

  private getTakes(document: vscode.TextDocument, position: vscode.Position): Array<Take> {
    
    for (let index = position.line; index >= 0; index--) {
      const line = document.lineAt(index);
      const lineText = line.text;

      if(/^\s*((private|public)\s+)?(static\s+)?(function|method)\b/.test(lineText)) {
        console.log("zhaoda parseTakes")
        return parseTakes(lineText);
      }

    }
    return [];
  }

  private getLocals(document: vscode.TextDocument, position: vscode.Position):Array<Local> {
    const locals = new Array<Local>();
    for (let index = position.line; index >= 0; index--) {
      const line = document.lineAt(index);
      const lineText = line.text;

      if (/^\s*local\b/.test(lineText)) {
        const local = parseLocal(lineText);
        if(local){
          locals.push(local);

        }
      }else if(/^\s*((private|public)\s+)?(static\s+)?(function|method)\b/.test(lineText)) {
        return locals;
      }
    }
    return [];
  }

  private getItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();
    //9 13 14 16 6 1 3 4 2 5 7 8 11 12 15 0
    switch (this.completioType) {
      case CompletionPosition.FunctionNaming:
      case CompletionPosition.Native:
      case CompletionPosition.Type:
        // nothing to do
        break;
      case CompletionPosition.TypeNaming:
      case CompletionPosition.LocalNaming:
        items.push(this.keywordToCompletionItem(Keyword.Array));
        break;
      case CompletionPosition.Nil:
        items.push(...this.nilCompletionItems());
        break;
      case CompletionPosition.TakesType:
        // items.push(...this.takesTypeCompletionItems());
        // 2020年6月7日
        items.push(...this.typeItems());

        break;
      case CompletionPosition.Returns:
        // items.push(...this.returnsCompletionItems());
        items.push(...this.typeItems());
        break;
      case CompletionPosition.Call:
        return this.allAndCurrentFunctionImplCompletions(document);
        // console.log(this.allAndCurrentFunctionImplCompletions(document).length)
        // items.push(...this.allAndCurrentFunctionImplCompletions(document));
        // break;
      case CompletionPosition.Local:
        // items.push(...this.statementCompletionItems());
        items.push(...this.typeItems());
        break;
      case CompletionPosition.Set:
        items.push(...this.setCompletions(document, position));
        break;
      case CompletionPosition.FunctionCall:

        items.push(...this.functionCallCompletions(document));
        break;
      case CompletionPosition.Modifier:
        items.push(...this.modifierCompletions());
        break;
      case CompletionPosition.Constant:
        // items.push(...this.statementCompletionItems());
        items.push(...this.typeItems());
        break;
      case CompletionPosition.Extends:
        // items.push(...Type.ExtendsTypes.map(type => this.typeToCompletionItem(type)));
        items.push(...this.typeItems());
        break;
      case CompletionPosition.Operator:
        items.push(...this.operatorCompletionItems(document,position));
        break;
      case CompletionPosition.Plus:
        items.push(...this.plusCompletionItems(document,position));
        break;
      case CompletionPosition.Return:
      case CompletionPosition.Unkown:
        items.push(...this.unkwonCompletionItems(document, position));
    }
    return items;
  }

  private resolveCurrentFileFunction(document:vscode.TextDocument) {
    const file = new Program();
    file.fileName = document.fileName;
    file.parse(document.getText());
    const functions = file.functions();

    const items = functions.map(func => {
      const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
      item.detail = func.name;
      const ms = new vscode.MarkdownString();
      const explain1 = file.findComment(func.start.line - 1);
      const explain2 = file.findComment(func.start.line);
      if(explain1) {
        ms.appendText(explain1);
      }
      if(explain2) {
        ms.appendText(`${explain1 ? "\n" : ""}${explain2}`);
      }
      ms.appendCodeblock(func.origin());
      item.documentation = ms;
      return item;
    });

    return items;
  }



  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    console.log(`document.version = ${document.version}`)
    let items = null;
    /*
    try {
      this.handleCompletionType(document, position);
      items = this.getItems(document, position);
    } catch (e) {
      console.error(e)
    }
    */
    return items;
  }

}


























