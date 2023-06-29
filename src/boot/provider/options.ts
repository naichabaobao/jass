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
    return this.isUsableJFile(this.configuration["ObjectEditor"] as string) ? this.configuration["ObjectEditor"] as string : path.resolve(__dirname, "../../../static/ObjectEditor.j");
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
  // 是否需要显示mark
  public static get isSupportMark() {
    return this.configuration["support"]["mark"] as boolean;
  }


  // 加入工作空间缓存
  private static workspacesCache: string[] = []
  private static lastWorkspacesUpdate: number = 0
  // 大于该值则使用缓存
  private static triggerCount = 20

  public static get workspaces():string[] {
    console.log('read space')
    if (vscode.workspace.workspaceFolders) {
      const lastUpdate = this.lastWorkspacesUpdate
      const usingCache = this.workspacesCache.length > this.triggerCount && Date.now() - lastUpdate < 1000 * 1 // 1秒
      if (usingCache){
        return this.workspacesCache
      }
      console.time('read space')
      this.workspacesCache = vscode.workspace.workspaceFolders.map((floder) => {
        const options = {
            cwd: floder.uri.fsPath,
            ignore: readIgnoreRules(
                path.resolve(floder.uri.fsPath, ".jassignore")
            ),
        };
        console.log(options)
        return ["**/*.j", "**/*.jass", "**/*.ai", "**/*.zn", "**/*.lua"]
            .map((pattern) => glob.sync(pattern, options))
            .flat()
            .map((file) => path.resolve(floder.uri.fsPath, file));
      }).flat();
      console.timeEnd('read space')
      this.lastWorkspacesUpdate = Date.now()
      return this.workspacesCache
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
