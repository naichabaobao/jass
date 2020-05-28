import * as vscode from 'vscode';
import { resolve } from 'path';

/**
 * 获取common.j文件路径
 */
function getCommonJPath() {
  return (vscode.workspace.getConfiguration().jass.common_j ?? resolve(__dirname, "../../src/resources/static/jass/common.j")) as string;
}



























export {
  getCommonJPath
}