import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { isAiFile, isJFile, isUsableFile, readIgnoreRules, resolvePaths } from "../tool";
import { glob } from "glob";



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
  public static get ObjectEditorJPath() : string {
    return this.isUsableAiFile(this.configuration["ObjectEditor.j"] as string) ? this.configuration["ObjectEditor_j"] as string : path.resolve(__dirname, "../../../static/ObjectEditor.j");
  }

  private static isUsableJFile(filePath: string) {
      return isUsableFile(filePath) && isJFile(filePath);
  }

  private static isUsableAiFile(filePath: string) {
    return isUsableFile(filePath) && isAiFile(filePath);
  }
  
  public static get includes() {
    const includes = this.configuration["includes"] as Array<string>;
    return resolvePaths(includes);
  }

  public static get isSupportLua() {
    return this.configuration["support"]["lua"] as boolean;
  }
  public static get luaDependents() {
    const includes = this.configuration["lua"]["dependents"] as Array<string>;
    return resolvePaths(includes);
  }

  public static get excludes() {
    const includes = this.configuration["excludes"] as Array<string>;
    return includes;
  }

  public static get cjassDependents() {
    const includes = this.configuration["cjass"]["dependents"] as Array<string>;
    return resolvePaths(includes);
  }
  public static get isSupportCjass() {
    return this.configuration["support"]["cjass"] as boolean;
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
  // 开启新版格式化
  public static get isFormatv2() {
    return this.configuration["formatv2"] as boolean;
  }
  // 显示更多信息的样式
  public static get enableInfoStyle() {
    return this.configuration["info-style"] as boolean;
  }

  public static get workspaces():string[] {
    if (vscode.workspace.workspaceFolders) {
      return vscode.workspace.workspaceFolders.map((floder) => {
        const options = {
            cwd: floder.uri.fsPath,
            ignore: readIgnoreRules(
                path.resolve(floder.uri.fsPath, ".jassignore")
            ),
        };
        return ["**/*.j", "**/*.jass", "**/*.ai", "**/*.zn", "**/*.lua"]
            .map((pattern) => glob.sync(pattern, options))
            .flat()
            .map((file) => path.resolve(floder.uri.fsPath, file));
      }).flat();
    }
    return [];
  }

  /**
   * 返回支持的所有路径
   */
  public static get paths():string[] {
    return [...this.includes, ...this.workspaces];
  }

  public static get pjassPath():string {
    return path.resolve(__dirname, "../../../static/pjass-latest.exe")
  }
  public static get pjassTempPath():string {
    return path.resolve(__dirname, "../../../static/temp")
  }
  
}

export {
  Options
};
