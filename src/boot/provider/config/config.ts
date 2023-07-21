
import * as vscode from "vscode";

import * as path from "path";
import * as fs from "fs";
import { Options } from "../options";
import { cjassDataMap, dataMap, luaDataMap, zincDataMap } from "../data";


function configFileToObject(jsonData: string): ConfigFileOption {
    const configObject = JSON.parse(jsonData);
    let option: ConfigFileOption = {};
    if (configObject.presets) {
        if (Array.isArray(configObject.presets)) { // 确保传进来的是数组
            const presets = (<Array<any>>(configObject.presets)).filter(preset => {
                return typeof (preset["code"]) == "string" && typeof (preset["name"]) == "string" && typeof (preset["descript"]) == "string"
                    && (preset["kind"] ? typeof (preset["kind"]) == "string" : true)
                    && (preset["race"] ? typeof (preset["race"]) == "string" : true)
                    && (preset["type"] ? typeof (preset["type"]) == "string" : true);
            }).map(function (preset): PresetOption {
                return {
                    code: preset["code"] as string,
                    name: preset["name"] as string,
                    descript: preset["descript"] as string,
                    kind: preset["kind"] as string | undefined,
                    race: preset["race"] as string | undefined,
                    type: preset["type"] as string | undefined,
                }
            });
            option.presets = presets;
        }
    }
    if (configObject.strings) {
        if (Array.isArray(configObject.strings)) { // 确保传进来的是数组
            const strings = (<Array<any>>(configObject.strings)).filter(str => {
                return (typeof (str["content"]) == "string"
                    && (str["descript"] ? typeof (str["descript"]) == "string" : true))
                    ||
                    typeof (str) == "string";
            }).map(function (str): StringOption | string {
                return (function () {
                    if (typeof (str) == "string") {
                        return str;
                    } else {
                        return {
                            content: str["content"] as string,
                            descript: str["descript"] as string | undefined,
                        };
                    }
                })();
            });

            option.strings = strings;
        }
    }
    if (configObject.excludes) {
        if (Array.isArray(configObject.excludes)) { // 确保传进来的是数组
            const excludes = <string[]>(<Array<any>>(configObject.excludes)).filter(function (exclude): boolean {
                return typeof (exclude) == "string";
            });

            option.excludes = excludes;
        }
    }


    return option;
}

// "Xfla": { code: "", name: "照明弹 (效果)", tip: "", kind: Kind.Buff, race: Race.Human, type: Type.Unit },
interface PresetOption {
    code: string,
    name: string,
    descript: string,
    // 种类
    kind?: string,
    // 种类
    race?: string,
    // 类型
    type?: string,
}

interface StringOption {
    content: string;
    descript?: string;
};

interface ConfigFileOption {
    presets?: PresetOption[];
    strings?: (StringOption | string)[];
    excludes?: string[];
}

export class ConfigPovider {

    public static excludes: string[] = [];
    private constructor() {

    }

    // 是否已经解释过
    private isParsed: boolean = false;
    private result: ConfigFileOption | undefined;

    private parse() {
        if (!this.isParsed) {
            if (Options.workspaceConfigFilePath) {
                if (fs.existsSync(Options.workspaceConfigFilePath)) {
                    this.result = this.getConfigureFileObject();
                    this.isParsed = true;
                }
            }
        }
    }

    private getConfigureFileObject(): ConfigFileOption {
        const workspacePath = Options.workspaceConfigFilePath;

        let option: ConfigFileOption = {};

        // const workspacePath = vscode.workspace.workspaceFile?.fsPath;
        if (workspacePath) {

            if (fs.existsSync(workspacePath)) {
                const configObject = JSON.parse(fs.readFileSync(workspacePath).toString("utf-8"));
                option = configFileToObject(fs.readFileSync(workspacePath).toString("utf-8"));
            } else {
                vscode.window.showInformationMessage("你可以创建'jass.config.json'在你的根目录中,定义你物遍");
            }
        }
        return option;
    }

    private isWatch: boolean = false;

    watch() {
        if (!this.isWatch) {
            if (Options.workspaceConfigFilePath) {
                if (fs.existsSync(Options.workspaceConfigFilePath)) {
                    fs.watch(Options.workspaceConfigFilePath, (event, fileName) => {
                        this.isParsed = false;
                        this.doExclude();
                    });
                    this.isWatch = true;
                }
            }
        }

    }

    public getPresets(): PresetOption[] {
        this.parse();
        this.watch();
        return this.result?.presets ?? [];
    }

    public getstrings(): (StringOption | string)[] {
        this.parse();
        this.watch();
        return this.result?.strings ?? [];
    }

    // 获取无视文件
    public getExcludes(): string[] {
        this.parse();
        this.watch();
        return this.result?.excludes ?? [];
    }

    // 配置文件发生改变时,把excludes配置的文件从数据中移除
    private doExclude() {
        this.getExcludes().forEach(filePath => {
            console.log("配置文件发生改变，移除文件:", filePath);

            dataMap.remove(filePath);
            zincDataMap.remove(filePath);
            cjassDataMap.remove(filePath);
        });
    }

    private static _?: ConfigPovider;
    public static instance(): ConfigPovider {
        if (!this._) {
            this._ = new ConfigPovider();
        }
        return this._;
    }

}

/**
 * 插件默认的配置对象,静态的
 */
export const PluginDefaultConfig: ConfigFileOption = configFileToObject(fs.readFileSync(Options.pluginConfigFilePath).toString("utf-8"));

