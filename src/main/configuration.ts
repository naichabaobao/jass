import * as vscode from 'vscode';

export const isVjassEnable:boolean = vscode.workspace.getConfiguration()?.jass?.vjass?.support ?? true;

/**
 * 是否支持vjass
 */
function isVjassSupport(){
  let isSupport = false;
  const enable = vscode.workspace.getConfiguration()?.jass?.vjass?.support;
  if(enable && typeof enable == "boolean"){
    isSupport = enable;
  }
  return isSupport;
}

function includes():Array<string>{
  return vscode.workspace.getConfiguration()?.jass?.includes ?? [];
}

export {isVjassSupport,includes};