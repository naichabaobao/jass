import * as fs from "fs";

/**
 * 获取文件内容
 * @param filePath 
 * @returns 
 */
function readFileContent(filePath: string): string {
    return fs.readFileSync(filePath, {
        encoding: "utf8"
    }).toString();
}

const NewLineRegExp = new RegExp(/\n/);
function isNewLine(char:string):boolean {
    return NewLineRegExp.test(char);
}

const NumberRegExp = new RegExp(/\d/);
function isNumber(char:string):boolean {
    return NumberRegExp.test(char);
}


const IdRegExp = new RegExp(/[a-zA-Z_$#]/);
function isIdentifier(char:string):boolean {
    return IdRegExp.test(char);
}


export {
    readFileContent,
    isNewLine,
    isNumber,
    isIdentifier
}