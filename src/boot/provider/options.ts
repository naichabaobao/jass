import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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

  public static isUsableFile(filePath: string) {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  }

  public static isUsableJFile(filePath: string) {
      return this.isUsableFile(filePath) && this.isJFile(filePath);
  }

  public static isUsableAiFile(filePath: string) {
    return this.isUsableFile(filePath) && this.isAiFile(filePath);
  }

  public static isJFile(filePath: string) {
    return path.parse(filePath).ext == ".j";
  }

  public static isAiFile(filePath: string) {
      return path.parse(filePath).ext == ".ai";
  }

  private static _resolvePaths(paths: Array<string>) {
    return paths.map(val => {
        const arr = new Array<string>();
        // 处理控制符问题
        // if (val.charCodeAt(0) == 8234) {
        //   val = val.substring(1);
        // }
        if (!fs.existsSync(val)) {
            return arr;
        }
        const stat = fs.statSync(val);
        if (stat.isFile()) {
            arr.push(val);
        } else if (stat.isDirectory()) {
            const subPaths = fs.readdirSync(val).map(fileName => path.resolve(val, fileName));
            arr.push(...this._resolvePaths(subPaths));
        }
        return arr;
    }).flat();
  }

  public static get includes() {
    const includes = this.configuration["includes"] as Array<string>;
    return this._resolvePaths(includes);
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


  
}

export {
  Options
};