import * as vscode from 'vscode';

export const isVjassEnable:boolean = vscode.workspace.getConfiguration()?.jass?.vjass?.support ?? true;

/**
 * 是否支持vjass
 * @deprecated
 */
function isVjassSupport(){
  // let isSupport = false;
  // const enable = vscode.workspace.getConfiguration()?.jass?.vjass?.support;
  // if(enable && typeof enable == "boolean"){
  //   isSupport = enable;
  // }
  return false;
}

/**
 * 获取配置文件commonj路径
 */
function common_j():string|null {
  return vscode.workspace.getConfiguration()?.jass?.common_j as string;
}

function includes():Array<string>{
  return vscode.workspace.getConfiguration()?.jass?.includes ?? [];
}

function isdiagnosticsupport(){
  let isSupport = false;
  const enable = vscode.workspace.getConfiguration()?.jass?.diagnostic?.support;
  if(enable && typeof enable == "boolean"){
    isSupport = enable;
  }
  return isSupport;
}

export {isVjassSupport,includes,isdiagnosticsupport,common_j};