import { resolve } from "path";
import { readFileContent } from "../check/utils";
import { tokens } from "./tokens";
import { cwd } from "process";
import { execSync } from "child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { tokenize_for_vjass } from "./tokenizer-vjass";
import { Token } from "./tokenizer-common";

// 词法解析速度与内存暂用测试
if (false) {
    const mb = (n:number) => (n / 1024 / 1024).toFixed(2) + ' MB';

    // const content = "0x0000000000"
    // const content = readFileContent(resolve(cwd(), "./static/blizzard.j"))
    const content = readFileContent(resolve(cwd(), "./static/common.j"))
    // console.log(content);

    console.time("tokenize_for_vjass")
    console.log("tokenize_for_vjass before", mb(process.memoryUsage().heapUsed));
    tokenize_for_vjass(content)
    console.log("tokenize_for_vjass after", mb(process.memoryUsage().heapUsed));
    // console.log(tokenize_for_vjass(content).map(x => `${x.type} ${x.is_complete ? "true" : "false"} '${x.getText()}'`));
    console.timeEnd("tokenize_for_vjass")

    console.time("tokens")
    console.log("tokens before", mb(process.memoryUsage().heapUsed));
    tokens(content)
    console.log("tokens after", mb(process.memoryUsage().heapUsed));
    // console.log(tokens(content).map(x => `${x.type} ${x.isError() ? "true" : "false"} '${x.value}'`));
    console.timeEnd("tokens")
}


/*
tokenize_for_vjass before 4.88 MB
tokenize_for_vjass after 8.94 MB
tokenize_for_vjass: 93.04ms
4.06 MB


tokens before 8.94 MB
tokens after 14.20 MB
tokens: 112.222ms
5.26 MB
*/

// tokenize_for_vjass方法功能测试
if (true) {
    const printToken = (token:Token) => {
        
        console.log(` ${token.type} ${token.is_complete ? "true" : "false"} '${token.getText()}'`);
    }

    let content:string = `[ ] = /*
    
    */
    2.3
    function
    debugsaod刚爬到`;
    content = readFileContent(resolve(cwd(), "./static/common.j"))
    tokenize_for_vjass(content).tokens.slice(0, 5).map(t => printToken(t))

    const document = tokenize_for_vjass(content);
    console.time("line_tokens")
    for (let index = 0; index < document.lineCount; index++) {
        const line = document.lineTokens(index);
        // const line = document.tokens.slice(500, 1000);
        // tokens(line.text)
        // console.log(line
        
    }
    console.timeEnd("line_tokens")
    console.log("=======================");
    
    console.log(tokenize_for_vjass(content).lineAt(0));
    tokenize_for_vjass(content).lineTokens(0).forEach(t => printToken(t))
    // console.log(tokenize_for_vjass(content).lineTokens(0));
    
    // console.log(document.line_token_indexs);
    
    console.time("find_line_tokens")
    console.log(tokenize_for_vjass(content).lineTokens(1200))
    console.timeEnd("find_line_tokens")
}

if (false) {
    const content = `
    function a takes nothing returns nothing
    local integer b = 10 % 2
    endfunction
    `;
    writeFileSync(resolve(cwd(), "./static/temp/test-jass-language.j"), content, {encoding: "utf8"});
    const result_buffer = execSync(`"${resolve(cwd(), "./static/pjass-latest.exe")}" "${resolve(cwd(), "./static/common.j")}" "${resolve(cwd(), "./static/blizzard.j")}" "${resolve(cwd(), "./static/common.ai")}" "${resolve(cwd(), "./static/temp/test-jass-language.j")}"`);
    // console.info(result_buffer.toLocaleString());
    console.info(result_buffer.toString("utf8"));
    unlinkSync(resolve(cwd(), "./static/temp/test-jass-language.j"));
}