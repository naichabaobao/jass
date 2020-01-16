import * as vscode from 'vscode';
import { Keyword } from '../main/keyword';
import { isVjassSupport } from '../main/configuration';
import { language } from '../main/constant';
import { Global, GlobalArray, GlobalImpl, parseGlobals } from '../main/global';
import { Type } from '../main/type';
import { FunctionImpl, Native, Function, parseFunctions } from '../main/function';
import { CommonJGlobals, BlizzardJGlobals, CommonAiGlobals, DzApiJGlobals, CommonJNatives, BlizzardJNatives, CommonAiNatives, DzApiJNatives, CommonJFunctions, BlizzardJFunctions, CommonAiFunctions, DzApiJFunctions } from '../main/file';
import { parseLibrarys, resolveGlobal, resolveFunction } from '../main/library';
import { Jasss } from '../main/include-file';
import { ModifierEnum } from '../main/modifier';

console.log("注册KeywordCompletionItemProvider")

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
    if(global.modifier == ModifierEnum.Public){
      name = global.libraryGlobalName;
    }else{
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

    const items = (isVjassSupport() ? resolveGlobal(parseLibrarys(content),globals) : globals).map(global => this.creatGlobalCompletion(global));

    return [...this.mainGlobals,...this.includeGlobals,...items];
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
    var name:string = "";
    if(func instanceof Native){
      name = func.name;
    }else if(func instanceof Function){
      func as Function;
      if(func.modifier == ModifierEnum.Public){
        name = func.libraryFunctionName;
      }else{
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

  private get includeFunctions(): Array<vscode.CompletionItem>{
    return Jasss.map(jass => jass.functions).flat().filter(func => func.modifier != ModifierEnum.Private).map(func => this.creatCompletion(func));
  }


  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    console.log(this.includeFunctions);

    const content = document.getText();
    const functions = parseFunctions(content);
    var items:vscode.CompletionItem[] = (isVjassSupport() ? resolveFunction(parseLibrarys(content),functions) : functions).map(func => this.creatCompletion(func));

    return [...this.allMainCompletionItem,...this.includeFunctions,...items];
  }

}

vscode.languages.registerCompletionItemProvider(language, new KeywordCompletionItemProvider);
vscode.languages.registerCompletionItemProvider(language, new TypeCompletionItemProvider);
vscode.languages.registerCompletionItemProvider(language, new GlobalCompletionItemProvider);
vscode.languages.registerCompletionItemProvider(language, new FunctionCompletionItemProvider);
