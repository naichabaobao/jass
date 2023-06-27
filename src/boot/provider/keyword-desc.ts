import { Keywords } from "../jass/keyword";


export const keywordDescript = new Map<string, string>([
    ["boolean", "布尔值"],
    ["integer", "整数"],
    ["real", "实数"],
    ["string", "字符串"],
    ["code", "子函数"],
    ["handle", "句柄"],
    ["constant", "常数，表示该全局变量无法重新赋值，只能获取默认值"],
    ["function", "功能开始标识"],
    ["endfunction", "功能结束标识"],
    ["local", "声明本地变量类型及命名"],
    ["set", "设置变量"],
    ["call", "调用程序"],
    ["native", "原生功能"],
    ["returns", "功能返回变量类型"],
    ["takes", "功能获取变量类型及命名"],
    ["call", "调用功能"],
    ["native", "声明原生功能"],
    ["private", "声明私有功能/权限修饰符"],
    ["return", "返回（结束功能）/返回变量"],
    ["takes", "功能获取变量"],
    ["extends", "拓展/继承"],
    ["array", "声明变量为数组"],
    ["nothing", "不获取变量或不返回变量"],
    ["code", "功能/AI脚本的线程"],
    ["library", "库开始标识"],
    ["endlibrary", "库结束标识"],
    ["struct", "构造开始标识"],
    ["endstruct", "构造结束标识"],
    ["interface", "界面开始标识"],
    ["endinterface", "界面结束标识"],
    ["scope", "域开始标识"],
    ["endscope", "域结束标识"],
    ["initializer", "初始化"],
    ["needs", "需要"],
    ["loop", "循环开始标识"],
    ["endloop", "循环开始结束标识"],
    ["exitwhen", "退出循环条件"]
]);

/**
 * @description 获取关键字的中文解释
 */
export function getKeywordDescription(keyword: string): string {
    return keywordDescript.has(keyword) ? <string>keywordDescript.get(keyword) : "unkown";
}

