import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { isAiFile, isJFile, resolvePaths } from "../tool";

class Options {

  public static get configuration() : vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("jass");
  }

  public static get commonJPath() : string {
    return this.isUsableJFile(this.configuration["common_j"] as string) ? this.configuration["common_j"] as string : path.resolve(__dirname, "../../../static/common.j");
  }
  public static get blizzardJPath() : string {
    return this.isUsableJFile(this.configuration["blizzard"] as string) ? this.configuration["blizzard"] as string : path.resolve(__dirname, "../../../static/blizzard.j");
  }
  public static get commonAiPath() : string {
    return this.isUsableAiFile(this.configuration["common_ai"] as string) ? this.configuration["common_ai"] as string : path.resolve(__dirname, "../../../static/common.ai");
  }
  public static get dzApiJPath() : string {
    return this.isUsableJFile(this.configuration["dzapi"] as string) ? this.configuration["dzapi"] as string : path.resolve(__dirname, "../../../static/DzAPI.j");
  }

  // 是文件和是否存在
  private static isUsableFile(filePath: string) {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  }

  private static isUsableJFile(filePath: string) {
      return this.isUsableFile(filePath) && isJFile(filePath);
  }

  private static isUsableAiFile(filePath: string) {
    return this.isUsableFile(filePath) && isAiFile(filePath);
  }
  
  public static get includes() {
    const includes = this.configuration["includes"] as Array<string>;
    return resolvePaths(includes);
  }

  
  public static get supportZinc() {
    return this.configuration["support"]["zinc"] as boolean;
  }

  public static get supportVJass() {
    return this.configuration["support"]["vjass"] as boolean;
  }

  // 纯净jass模式
  public static get isOnlyJass() {
    return this.configuration["only"] as boolean;
  }
  // jass错误检测
  public static get isJassDiagnostic() {
    return this.configuration["diagnostic"] as boolean;
  }

  public static get workspaces():string[] {
    return vscode.workspace.workspaceFolders?.map((floder) => {
      const files = resolvePaths([floder.uri.fsPath]);
      return files;
    }).flat() ?? [];
  }

  
}

export {
  Options
};