import * as vscode from 'vscode';
import {Type} from './type';
import * as JassPath from './path';
/**
 * @deprecate
 */
import {Func,Jass} from '../provider/main-provider';
import { fstat, readFile } from 'fs';
import { Keyword } from './keyword';

function creatTypeCompletion(type:Type):vscode.CompletionItem {
  const item = new vscode.CompletionItem(type.name,vscode.CompletionItemKind.Class);
  item.detail = type.name;
  const ms = new vscode.MarkdownString();
  ms.appendText(type.description);
  ms.appendCodeblock(type.origin());
  item.documentation = ms;
  return item;
}

export const TypeCompletions: vscode.CompletionItem[] = Type.AllTypes.map(type => creatTypeCompletion(type));


function creatKeywordCompletion(keyword:string):vscode.CompletionItem {
  const item = new vscode.CompletionItem(keyword,vscode.CompletionItemKind.Class);
  item.detail = keyword;
  const ms = new vscode.MarkdownString();
  ms.appendCodeblock(keyword);
  item.documentation = ms;
  return item;
}

export const KetwordCompletions: vscode.CompletionItem[] = Keyword.Keywords.map(keyword => creatKeywordCompletion(keyword));



/**
 * 四个主要文件的
 */
export const MainCompletions: vscode.CompletionItem[] = Keyword.Keywords.map(keyword => creatKeywordCompletion(keyword));


