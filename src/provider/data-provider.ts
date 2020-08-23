import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as jass from "../main/jass/parsing";


function configuration() {
    return vscode.workspace.getConfiguration("jass");
}

function _resolvePaths(paths: Array<string>) {
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
            arr.push(..._resolvePaths(subPaths));
        }
        return arr;
    }).flat();
}

/**
 * 获取包含的所有文件,一般不适用此方法,而是使用getIncludeJPaths()
 */
function getIncludePaths() {
    const includes = configuration()["includes"] as Array<string>;
    return _resolvePaths(includes);
}

/**
 * 获取包含的.j文件
 */
function getIncludeJPaths() {
    return getIncludePaths().filter(val => isJFile(val));
}

/**
 * 获取包含的.j文件
 */
function getIncludeAiPaths() {
    return getIncludePaths().filter(val => isAiFile(val));
}

function isJFile(filePath: string) {
    return path.parse(filePath).ext == ".j";
}

function isAiFile(filePath: string) {
    return path.parse(filePath).ext == ".ai";
}

function getCommonJPath() {
    return isUsableJFile(configuration()["common_j"] as string) ? configuration()["common_j"] as string : path.resolve(__dirname, "../../src/resources/static/jass/common.j");
}

function getBlizzardJPath() {
    return isUsableJFile(configuration()["blizzard"] as string) ? configuration()["blizzard"] as string : path.resolve(__dirname, "../../src/resources/static/jass/blizzard.j");
}

function getCommonAiPath() {
    return isUsableAiFile(configuration()["common_ai"] as string) ? configuration()["common_ai"] as string : path.resolve(__dirname, "../../src/resources/static/jass/common.ai");
}

function getDzApiJPath() {
    return isUsableJFile(configuration()["dz"] as string) ? configuration()["dz"] as string : path.resolve(__dirname, "../../src/resources/static/jass/DzAPI.j");
}

function isUsableFile(filePath: string) {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function isUsableJFile(filePath: string) {
    return isUsableFile(filePath) && isJFile(filePath);
}

function isUsableAiFile(filePath: string) {
    return isUsableFile(filePath) && isAiFile(filePath);
}

function getPaths() {
    return [...getIncludePaths(), getCommonJPath(), getCommonAiPath(), getBlizzardJPath(), getDzApiJPath()]
}



const _programs:jass.Program[] = [];
function init() {
    getPaths().forEach(x => {
        const buffer = fs.readFileSync(x);

        const program = jass.parse(buffer.toString("utf8"));
        const parsedPaht = path.parse(x);
        program.fileName = parsedPaht.dir + "/" + parsedPaht.base;

        _programs.push(program);
    });
}
init();
function programs () {
    return _programs;
}

export {
    getPaths,
    isJFile,
    isAiFile,
    programs
};
