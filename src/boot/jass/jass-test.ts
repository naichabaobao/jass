import { resolve } from "path";
import { readFileContent } from "../check/utils";
import { tokens } from "./tokens";
import { cwd } from "process";
import { execSync } from "child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { tokenize_for_vjass } from "./tokenizer-vjass";
import { Token } from "./tokenizer-common";
import { Global, parse } from "./parser-vjass";
import { Parser } from "./parser";
import { Context } from "./ast";
import { Options } from "../provider/options";

// 词法解析速度与内存暂用测试
if (false) {
    const mb = (n:number) => (n / 1024 / 1024).toFixed(2) + ' MB';

    // const content = "0x0000000000"
    // const content = readFileContent(resolve(cwd(), "./static/blizzard.j"))
    const content = readFileContent(resolve(cwd(), "./static/common.j"))
    // console.log(content);

    console.time("tokenize_for_vjass")
    console.log("tokenize_for_vjass before", mb(process.memoryUsage().heapUsed));
    // tokenize_for_vjass(content)
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
if (false) {
    const printToken = (token:Token) => {
        
        console.log(` ${token.type} ${token.is_complete ? "true" : "false"} '${token.getText()}'`);
    }
    const printTokens = (tokens:Token[]|undefined) => {
        
        tokens?.forEach(token => {
            printToken(token);
        });
    }

    // let content:string = `#aaa bbb ofjsapf
    // #define java b\tab  a\\
    // fsao\fpos \\
    // fsaf
    // #define asdsa3
    // //!`;
    // // content = readFileContent(resolve(cwd(), "./static/common.j"))
    // tokenize_for_vjass(content).tokens.slice(0, 5).map(t => printToken(t))

    

    // const document = tokenize_for_vjass(content);
    // console.time("line_tokens")
    // for (let index = 0; index < document.lineCount; index++) {
    //     const line = document.lineTokens(index);
    //     // const line = document.tokens.slice(500, 1000);
    //     // tokens(line.text)
    //     // console.log(line
        
    // }
    // console.timeEnd("line_tokens")
    // console.log("=======================");
    
    // console.log(tokenize_for_vjass(content).lineAt(0));
    // tokenize_for_vjass(content).lineTokens(0).forEach(t => printToken(t))
    // // console.log(tokenize_for_vjass(content).lineTokens(0));
    
    // // console.log(document.line_token_indexs);
    
    // console.time("find_line_tokens")
    // console.log(tokenize_for_vjass(content).lineAt(1200))
    // console.timeEnd("find_line_tokens")
    // console.time("preprocessing");
    // textmacro(document);
    // console.timeEnd("preprocessing");

    // const filePath = resolve(cwd(), "./static/blizzard.j");
    console.time("kk")
    const filePath = "C:/Users/Administrator/Desktop/ff/test3.j";
    // const filePath = resolve(cwd(), "./static/common.j");
    const filePath2 = "C:/Users/Administrator/Desktop/ff/test.j";
    parse(filePath)
    console.timeEnd("kk");


    

    // console.time("kk2")
    // new Parser(new Context(), readFileContent(filePath)).parsing()
    // console.timeEnd("kk2");

    // printTokens(Global.get(filePath)?.tokens);
    // console.log(Global.get(filePath)?.root_node?.children);
    // Global.get(filePath)?.root_node?.children.forEach(node => {
    //     if (node.start_line?.document.is_text_macro_line(node.start_line.line)) {

    //     }    //     console.log(node.start_line?.text_line().text, node.start_line?.line);
    //     node.body.forEach(b => {
    //         console.log(b.text_line().text, b.line);
            
    //     })
    //     console.log(node.end_line?.text_line().text, node.end_line?.line);
    // });

    // const document = Global.get(filePath)!;
    // let step = 0;
    // let step2 = 0;
    // document.loop((document, line) => {
    //     console.log("func1", line, document.lineAt(line).text);
        
    // }, (document, run_text_macro, macro, line) => {
    //     console.log("func2", line, document.lineAt(line).text, macro.line_at(line, run_text_macro.param_values()), );
    //     printTokens(macro.line_tokens(line, run_text_macro.param_values()))
    // })
    // printTokens(Global.get(filePath2)?.tokens);
    // console.log(Global.get(filePath2))
    
    // node ./out/boot/jass/jass-test.js
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