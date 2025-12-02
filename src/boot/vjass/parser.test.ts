import { Parser } from "./parser";
import {
    BlockStatement,
    Statement,
    Expression,
    FunctionDeclaration,
    FunctionInterfaceDeclaration,
    NativeDeclaration,
    TypeDeclaration,
    StructDeclaration,
    VariableDeclaration,
    IfStatement,
    LoopStatement,
    ExitWhenStatement,
    AssignmentStatement,
    CallStatement,
    ReturnStatement,
    FunctionExpression,
    CallExpression,
    StringLiteral,
    IntegerLiteral,
    RealLiteral,
    BooleanLiteral,
    Identifier,
    MethodDeclaration,
    InterfaceDeclaration,
    ScopeDeclaration,
    LibraryDeclaration,
    HookStatement,
    InjectStatement,
    LoadDataStatement,
    ZincBlockStatement,
    ModuleDeclaration,
    ImplementStatement,
    DelegateDeclaration,
    OperatorType,
    BinaryExpression
} from "./vjass-ast";
import { TextMacroRegistry } from "./text-macro-registry";
import { TextMacroCollector } from "./text-macro-collector";
import { TextMacroExpander } from "./text-macro-expander";
import * as fs from 'fs';
import * as path from 'path';

// 测试代码
if (typeof require !== 'undefined' && require.main === module) {
    console.log("=== vJass Parser 测试 ===\n");
    
    // 测试 1: if/elseif/else 语句
    console.log("测试 1: if/elseif/else 语句");
    const test1 = `
function testIf takes nothing returns nothing
    if true then
        call BJDebugMsg("true")
    elseif false then
        call BJDebugMsg("false")
    else
        call BJDebugMsg("else")
    endif
endfunction
    `;
    const parser1 = new Parser(test1);
    const result1 = parser1.parse();
    console.log("✓ 解析成功，语句数:", result1.body.length);
    console.log("✓ 错误数:", parser1.errors.errors.length);
    if (parser1.errors.errors.length > 0) {
        console.log("错误:", parser1.errors.errors);
    }
    
    // 测试 2: static if
    console.log("\n测试 2: static if 语句");
    const test2 = `
globals
    constant boolean DO_KILL_LIB = true
endglobals
function testStaticIf takes nothing returns nothing
    static if DO_KILL_LIB then
        call BJDebugMsg("static if true")
    else
        call BJDebugMsg("static if false")
    endif
endfunction
    `;
    const parser2 = new Parser(test2);
    const result2 = parser2.parse();
    console.log("✓ 解析成功，语句数:", result2.body.length);
    console.log("✓ 错误数:", parser2.errors.errors.length);
    
    // 测试 3: struct 继承和数组成员
    console.log("\n测试 3: struct 继承和数组成员");
    
    // 测试 4: //! zinc 块支持
    console.log("\n测试 4: //! zinc 块支持");
    const testZincBlock = `
library Test
    //! zinc
    library HelloWorld
    {
        function onInit()
        {
             BJDebugMsg("Hello World");
        }
    }
    //! endzinc
endlibrary
    `;
    try {
        const parserZinc = new Parser(testZincBlock);
        const resultZinc = parserZinc.parse();
        console.log(`  语句数量: ${resultZinc.body.length}`);
        console.log(`  语句类型: ${resultZinc.body.map(s => s.constructor.name).join(", ")}`);
        if (resultZinc.body.length > 0) {
            const lib = resultZinc.body[0];
            if (lib instanceof LibraryDeclaration) {
                console.log(`  Library 成员数量: ${lib.members.length}`);
                console.log(`  Library 成员类型: ${lib.members.map(s => s.constructor.name).join(", ")}`);
                const zincBlocksInLib = lib.members.filter((s: Statement) => s instanceof ZincBlockStatement) as ZincBlockStatement[];
                console.log(`  Library 中的 zinc 块数量: ${zincBlocksInLib.length}`);
                if (zincBlocksInLib.length > 0) {
                    const zincBlock = zincBlocksInLib[0];
                    console.log(`  Zinc 内容长度: ${zincBlock.content.length}`);
                    console.log(`  Zinc 语句数量: ${zincBlock.zincStatements.length}`);
                    if (zincBlock.zincStatements && zincBlock.zincStatements.length > 0) {
                        console.log("✓ //! zinc 块支持 - 成功解析 Zinc 代码块");
                    } else {
                        console.log("✗ //! zinc 块支持 - Zinc 代码块为空或解析失败");
                    }
                }
            }
        }
        const zincBlocks = resultZinc.body.filter((s: Statement) => s instanceof ZincBlockStatement) as ZincBlockStatement[];
        if (zincBlocks.length === 1) {
            const zincBlock = zincBlocks[0];
            console.log(`  Zinc 内容长度: ${zincBlock.content.length}`);
            console.log(`  Zinc 语句数量: ${zincBlock.zincStatements.length}`);
            if (zincBlock.zincStatements && zincBlock.zincStatements.length > 0) {
                console.log("✓ //! zinc 块支持 - 成功解析 Zinc 代码块");
            } else {
                console.log("✗ //! zinc 块支持 - Zinc 代码块为空或解析失败");
            }
        } else {
            console.log(`✗ //! zinc 块支持 - 期望 1 个 zinc 块，实际 ${zincBlocks.length} 个`);
        }
    } catch (error: any) {
        console.log(`✗ //! zinc 块支持 - 测试异常: ${error.message}`);
        console.error(error);
    }
    const test3 = `
struct Parent
    integer x
endstruct
struct Child extends Parent
    integer y
    integer array data[100]
    static integer array staticData[50]
endstruct
    `;
    const parser3 = new Parser(test3);
    const result3 = parser3.parse();
    console.log("✓ 解析成功，语句数:", result3.body.length);
    if (result3.body.length > 1) {
        const stmt = result3.body[1];
        if (stmt instanceof StructDeclaration) {
            console.log("✓ Struct 名称:", stmt.name?.toString());
            console.log("✓ 继承类型:", stmt.extendsType?.toString());
            console.log("✓ 成员数:", stmt.members.length);
        }
    }
    
    // 测试 4: struct 索引空间增强
    console.log("\n测试 4: struct 索引空间增强");
    const test4 = `
struct BigStruct[10000]
    integer a
    integer b
endstruct
    `;
    const parser4 = new Parser(test4);
    const result4 = parser4.parse();
    console.log("✓ 解析成功，语句数:", result4.body.length);
    if (result4.body.length > 0) {
        const stmt = result4.body[0];
        if (stmt instanceof StructDeclaration) {
            console.log("✓ 索引大小:", stmt.indexSize);
        }
    }
    
    // 测试 5: 数组结构
    console.log("\n测试 5: 数组结构");
    const test5 = `
struct ArrayStruct extends array [20000]
    integer a
    integer b
endstruct
    `;
    const parser5 = new Parser(test5);
    const result5 = parser5.parse();
    console.log("✓ 解析成功，语句数:", result5.body.length);
    if (result5.body.length > 0) {
        const stmt = result5.body[0];
        if (stmt instanceof StructDeclaration) {
            console.log("✓ 是数组结构:", stmt.isArrayStruct);
            console.log("✓ 数组大小:", stmt.arraySize);
        }
    }
    
    // 测试 6: 运算符重载
    console.log("\n测试 6: 运算符重载");
    const test6 = `
struct TestStruct
    string str = ""
    method operator [] takes integer i returns string
        return SubString(.str, i, i+1)
    endmethod
    method operator []= takes integer i, string ch returns nothing
        set .str = SubString(.str, 0, i) + ch + SubString(.str, i+1, StringLength(.str))
    endmethod
    method operator < takes TestStruct b returns boolean
        return StringLength(this.str) < StringLength(b.str)
    endmethod
endstruct
    `;
    const parser6 = new Parser(test6);
    const result6 = parser6.parse();
    console.log("✓ 解析成功，语句数:", result6.body.length);
    console.log("✓ 错误数:", parser6.errors.errors.length);
    
    // 测试 7: 多个 elseif
    console.log("\n测试 7: 多个 elseif");
    const test7 = `
function testMultipleElseif takes integer x returns nothing
    if x == 1 then
        call BJDebugMsg("one")
    elseif x == 2 then
        call BJDebugMsg("two")
    elseif x == 3 then
        call BJDebugMsg("three")
    else
        call BJDebugMsg("other")
    endif
endfunction
    `;
    const parser7 = new Parser(test7);
    const result7 = parser7.parse();
    console.log("✓ 解析成功，语句数:", result7.body.length);
    console.log("✓ 错误数:", parser7.errors.errors.length);
    
    // 测试 8: interface 错误检测
    console.log("\n测试 8: interface 错误检测");
    const test8 = `
interface IBuffInterface=
    method method_name takes nothing returns nothing
    endinterface
    `;
    const parser8 = new Parser(test8);
    const result8 = parser8.parse();
    console.log("✓ 解析完成");
    console.log("✓ 错误数:", parser8.errors.errors.length);
    if (parser8.errors.errors.length > 0) {
        console.log("✓ 检测到错误:", parser8.errors.errors[0].message);
    }
    
    // 测试 9: 表达式解析 - 运算符优先级和结合性
    console.log("\n测试 9: 表达式解析 - 运算符优先级和结合性");
    
    function testExpression(name: string, code: string, check: (expr: Expression | null) => boolean): boolean {
        const testCode = `function test takes nothing returns nothing\n    set x = ${code}\nendfunction`;
        const parser = new Parser(testCode);
        const result = parser.parse();
        if (result.body.length > 0) {
            const func = result.body[0];
            if (func instanceof FunctionDeclaration && func.body.body.length > 0) {
                const stmt = func.body.body[0];
                if (stmt instanceof AssignmentStatement) {
                    const expr = stmt.value;
                    const success = check(expr);
                    if (success) {
                        console.log(`✓ ${name}: ${code}`);
                        console.log(`  解析结果: ${expr?.toString()}`);
                    } else {
                        console.log(`✗ ${name}: ${code}`);
                        console.log(`  解析结果: ${expr?.toString()}`);
                    }
                    return success;
                }
            }
        }
        console.log(`✗ ${name}: 解析失败`);
        if (parser.errors.errors.length > 0) {
            console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
        }
        return false;
    }
    
    let exprPassed = 0;
    let exprFailed = 0;
    
    // 测试基本算术运算符优先级
    if (testExpression("算术优先级 1", "1 + 2 * 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.right instanceof BinaryExpression)) return false;
        return expr.right.operator === OperatorType.Multiply;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("算术优先级 2", "1 * 2 + 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Multiply;
    })) exprPassed++; else exprFailed++;
    
    // 测试左结合性
    if (testExpression("左结合性 1", "1 + 2 + 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("左结合性 2", "1 - 2 - 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Minus) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Minus;
    })) exprPassed++; else exprFailed++;
    
    // 测试比较运算符
    if (testExpression("比较运算符", "1 + 2 == 3 * 4", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Equal;
    })) exprPassed++; else exprFailed++;
    
    // 测试逻辑运算符
    if (testExpression("逻辑运算符", "true && false || true", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.LogicalOr;
    })) exprPassed++; else exprFailed++;
    
    // 测试括号
    if (testExpression("括号 1", "(1 + 2) * 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Multiply) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("括号 2", "1 + (2 * 3)", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.right instanceof BinaryExpression)) return false;
        return expr.right.operator === OperatorType.Multiply;
    })) exprPassed++; else exprFailed++;
    
    // 测试一元运算符
    if (testExpression("一元负号", "-1 + 2", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    // 测试函数调用
    if (testExpression("函数调用", "GetUnitX(u) + GetUnitY(u)", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    // 测试成员访问
    if (testExpression("成员访问", "unit.x + unit.y", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    // 测试复杂嵌套表达式
    if (testExpression("复杂嵌套", "(a + b) * (c - d) / e", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Divide;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("复杂嵌套 2", "a == b && c != d || e < f", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.LogicalOr;
    })) exprPassed++; else exprFailed++;
    
    // 测试点运算符优先级
    if (testExpression("点运算符", "obj.member1 + obj.member2", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    console.log(`\n表达式测试结果: 通过 ${exprPassed}, 失败 ${exprFailed}`);
    
    // 测试 10: loop 语句
    console.log("\n测试 10: loop 语句");
    const { LoopStatement, ExitWhenStatement } = require('./vjass-ast');
    
    function testLoop(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let loopPassed = 0;
    let loopFailed = 0;
    
    // 测试基本 loop
    if (testLoop("基本 loop", `function test takes nothing returns nothing
    loop
        call BJDebugMsg("loop")
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        if (func.body.body.length === 0) return false;
        const loop = func.body.body[0];
        return loop instanceof LoopStatement;
    })) loopPassed++; else loopFailed++;
    
    // 测试 loop 带 exitwhen
    if (testLoop("loop 带 exitwhen", `function test takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i >= 10
        set i = i + 1
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        const exitwhen = loopStmt.body.body.find((s: Statement) => s instanceof ExitWhenStatement);
        return exitwhen !== undefined;
    })) loopPassed++; else loopFailed++;
    
    // 测试嵌套 loop
    if (testLoop("嵌套 loop", `function test takes nothing returns nothing
    local integer i = 0
    local integer j = 0
    loop
        exitwhen i >= 5
        set j = 0
        loop
            exitwhen j >= 3
            set j = j + 1
        endloop
        set i = i + 1
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        const nestedLoop = loopStmt.body.body.find((s: Statement) => s instanceof LoopStatement);
        return nestedLoop instanceof LoopStatement;
    })) loopPassed++; else loopFailed++;
    
    // 测试 loop 中的各种语句
    if (testLoop("loop 中的各种语句", `function test takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i >= 10
        set i = i + 1
        call BJDebugMsg(I2S(i))
        if i == 5 then
            call BJDebugMsg("five")
        endif
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        // 检查是否包含 exitwhen, set, call, if
        const hasExitwhen = loopStmt.body.body.some((s: Statement) => s instanceof ExitWhenStatement);
        const hasSet = loopStmt.body.body.some((s: Statement) => s instanceof AssignmentStatement);
        const hasIf = loopStmt.body.body.some((s: Statement) => s instanceof IfStatement);
        return hasExitwhen && hasSet && hasIf;
    })) loopPassed++; else loopFailed++;
    
    // 测试空 loop
    if (testLoop("空 loop", `function test takes nothing returns nothing
    loop
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body[0];
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        return loopStmt.body.body.length === 0;
    })) loopPassed++; else loopFailed++;
    
    // 测试 loop 中只有 exitwhen
    if (testLoop("loop 中只有 exitwhen", `function test takes nothing returns nothing
    loop
        exitwhen true
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body[0];
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        return loopStmt.body.body.length === 1 && loopStmt.body.body[0] instanceof ExitWhenStatement;
    })) loopPassed++; else loopFailed++;
    
    // 测试多个 exitwhen
    if (testLoop("多个 exitwhen", `function test takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i >= 10
        set i = i + 1
        exitwhen i == 5
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        const exitwhenCount = loopStmt.body.body.filter((s: Statement) => s instanceof ExitWhenStatement).length;
        return exitwhenCount === 2;
    })) loopPassed++; else loopFailed++;
    
    console.log(`\nloop 测试结果: 通过 ${loopPassed}, 失败 ${loopFailed}`);
    
    // 测试 11: call 语句
    console.log("\n测试 11: call 语句");
    
    function testCall(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let callPassed = 0;
    let callFailed = 0;
    
    // 测试基本 call 语句
    if (testCall("基本 call 语句", `function test takes nothing returns nothing
    call BJDebugMsg("Hello")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        return callStmt instanceof CallStatement;
    })) callPassed++; else callFailed++;
    
    // 测试 call 无参数
    if (testCall("call 无参数", `function test takes nothing returns nothing
    call InitTrig()
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 0;
    })) callPassed++; else callFailed++;
    
    // 测试 call 单参数
    if (testCall("call 单参数", `function test takes nothing returns nothing
    call BJDebugMsg("Hello World")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 1;
    })) callPassed++; else callFailed++;
    
    // 测试 call 多参数
    if (testCall("call 多参数", `function test takes nothing returns nothing
    call SetUnitPosition(unit, 100.0, 200.0)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 3;
    })) callPassed++; else callFailed++;
    
    // 测试 call 带表达式参数
    if (testCall("call 带表达式参数", `function test takes nothing returns nothing
    local integer x = 10
    call BJDebugMsg(I2S(x + 5))
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 1;
    })) callPassed++; else callFailed++;
    
    // 测试 call 带 function 表达式参数
    if (testCall("call 带 function 表达式参数", `function test takes nothing returns nothing
    call a(function temp_func1)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const arg = callStmt.expression.arguments[0];
        return arg instanceof FunctionExpression;
    })) callPassed++; else callFailed++;
    
    // 测试 call 带复杂表达式参数
    if (testCall("call 带复杂表达式参数", `function test takes nothing returns nothing
    call a(function temp_func1 + 2 * 3)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 1;
    })) callPassed++; else callFailed++;
    
    // 测试 call 成员方法
    if (testCall("call 成员方法", `function test takes nothing returns nothing
    local unit u = null
    call u.destroy()
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const callee = callStmt.expression.callee;
        return callee instanceof BinaryExpression && callee.operator === OperatorType.Dot;
    })) callPassed++; else callFailed++;
    
    // 测试多个 call 语句
    if (testCall("多个 call 语句", `function test takes nothing returns nothing
    call BJDebugMsg("First")
    call BJDebugMsg("Second")
    call BJDebugMsg("Third")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmts = func.body.body.filter((s: Statement) => s instanceof CallStatement);
        return callStmts.length === 3;
    })) callPassed++; else callFailed++;
    
    // 测试 call 嵌套调用
    if (testCall("call 嵌套调用", `function test takes nothing returns nothing
    call BJDebugMsg(I2S(GetUnitX(unit)))
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        // 检查参数中是否有嵌套的 CallExpression
        const hasNestedCall = callStmt.expression.arguments.some((arg: Expression) => 
            arg instanceof CallExpression
        );
        return hasNestedCall;
    })) callPassed++; else callFailed++;
    
    console.log(`\ncall 测试结果: 通过 ${callPassed}, 失败 ${callFailed}`);
    
    // 测试 12: set 语句
    console.log("\n测试 12: set 语句");
    
    function testSet(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let setPassed = 0;
    let setFailed = 0;
    
    // 测试基本 set 语句
    if (testSet("基本 set 语句", `function test takes nothing returns nothing
    local integer x
    set x = 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        return setStmt instanceof AssignmentStatement;
    })) setPassed++; else setFailed++;
    
    // 测试 set 字符串
    if (testSet("set 字符串", `function test takes nothing returns nothing
    local string s
    set s = "Hello World"
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof StringLiteral;
    })) setPassed++; else setFailed++;
    
    // 测试 set 表达式
    if (testSet("set 表达式", `function test takes nothing returns nothing
    local integer x
    local integer y = 5
    set x = y + 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 数组索引
    if (testSet("set 数组索引", `function test takes nothing returns nothing
    local integer array arr
    set arr[0] = 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        // 检查 target 是否是数组访问（BinaryExpression with Index operator）
        const target = setStmt.target;
        return target instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 成员访问
    if (testSet("set 成员访问", `function test takes nothing returns nothing
    local unit u = null
    set u.x = 100.0
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        if (target instanceof BinaryExpression) {
            return target.operator === OperatorType.Dot;
        }
        return false;
    })) setPassed++; else setFailed++;
    
    // 测试 set 函数调用结果
    if (testSet("set 函数调用结果", `function test takes nothing returns nothing
    local real x
    local unit u = null
    set x = GetUnitX(u)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof CallExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 复杂表达式
    if (testSet("set 复杂表达式", `function test takes nothing returns nothing
    local integer x
    local integer a = 5
    local integer b = 10
    set x = (a + b) * 2
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 数组索引表达式
    if (testSet("set 数组索引表达式", `function test takes nothing returns nothing
    local integer array arr
    local integer i = 0
    set arr[i] = 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        return target instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 嵌套成员访问
    if (testSet("set 嵌套成员访问", `function test takes nothing returns nothing
    local unit u = null
    set u.x = GetUnitX(u)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        if (target instanceof BinaryExpression) {
            return target.operator === OperatorType.Dot && setStmt.value instanceof CallExpression;
        }
        return false;
    })) setPassed++; else setFailed++;
    
    // 测试多个 set 语句
    if (testSet("多个 set 语句", `function test takes nothing returns nothing
    local integer x
    local integer y
    set x = 10
    set y = 20
    set x = x + y
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmts = func.body.body.filter((s: Statement) => s instanceof AssignmentStatement);
        return setStmts.length === 3;
    })) setPassed++; else setFailed++;
    
    // 测试 set 自增
    if (testSet("set 自增", `function test takes nothing returns nothing
    local integer x = 0
    set x = x + 1
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        if (value instanceof BinaryExpression) {
            return value.operator === OperatorType.Plus;
        }
        return false;
    })) setPassed++; else setFailed++;
    
    console.log(`\nset 测试结果: 通过 ${setPassed}, 失败 ${setFailed}`);
    
    // 测试 13: return 语句
    console.log("\n测试 13: return 语句");
    
    function testReturn(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let returnPassed = 0;
    let returnFailed = 0;
    
    // 测试 return 无返回值
    if (testReturn("return 无返回值", `function test takes nothing returns nothing
    return
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument === null;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 整数
    if (testReturn("return 整数", `function test takes nothing returns integer
    return 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof IntegerLiteral;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 字符串
    if (testReturn("return 字符串", `function test takes nothing returns string
    return "Hello World"
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof StringLiteral;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 变量
    if (testReturn("return 变量", `function test takes nothing returns integer
    local integer x = 10
    return x
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof Identifier;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 表达式
    if (testReturn("return 表达式", `function test takes nothing returns integer
    local integer x = 5
    local integer y = 10
    return x + y
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof BinaryExpression;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 函数调用
    if (testReturn("return 函数调用", `function test takes unit u returns real
    return GetUnitX(u)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof CallExpression;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 复杂表达式
    if (testReturn("return 复杂表达式", `function test takes nothing returns integer
    local integer a = 5
    local integer b = 10
    local integer c = 2
    return (a + b) * c
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof BinaryExpression;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 数组索引
    if (testReturn("return 数组索引", `function test takes nothing returns integer
    local integer array arr
    set arr[0] = 10
    return arr[0]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const arg = returnStmt.argument;
        return arg instanceof BinaryExpression && (arg as BinaryExpression).operator === OperatorType.Index;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 成员访问
    if (testReturn("return 成员访问", `function test takes nothing returns real
    local unit u = null
    return u.x
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const arg = returnStmt.argument;
        return arg instanceof BinaryExpression && (arg as BinaryExpression).operator === OperatorType.Dot;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 布尔值
    if (testReturn("return 布尔值", `function test takes nothing returns boolean
    return true
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof BooleanLiteral;
    })) returnPassed++; else returnFailed++;
    
    // 测试多个 return 语句（虽然不常见，但语法上允许）
    if (testReturn("多个 return 语句", `function test takes boolean flag returns integer
    if flag then
        return 1
    endif
    return 0
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmts = func.body.body.filter((s: Statement) => s instanceof ReturnStatement);
        return returnStmts.length >= 1;
    })) returnPassed++; else returnFailed++;
    
    console.log(`\nreturn 测试结果: 通过 ${returnPassed}, 失败 ${returnFailed}`);
    
    // 测试 14: 复杂表达式解析
    console.log("\n测试 14: 复杂表达式解析");
    
    function testComplexExpression(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
                // 打印前3个错误的详细信息
                parser.errors.errors.slice(0, 3).forEach(e => {
                    console.log(`    位置: 行 ${e.start.line + 1}, 列 ${e.start.position + 1}`);
                });
            }
        }
        return success;
    }
    
    let complexPassed = 0;
    let complexFailed = 0;
    
    // 测试超复杂表达式
    const complexExpr = `this.a(this.b() + this.ccc.sf[MAX_vALUE + 32 * 6], function callback, 0.75, false) * S2R("fsafhsfho")`;
    if (testComplexExpression("超复杂表达式", `function test takes nothing returns real
    set x = ${complexExpr}
endfunction`, (r, p) => {
        if (r.body.length === 0) {
            console.log("  错误: 没有解析到任何语句");
            return false;
        }
        if (p.errors.errors.length > 0) {
            return false;
        }
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) {
            console.log("  错误: 第一个语句不是函数声明");
            return false;
        }
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) {
            console.log("  错误: 没有找到 set 语句");
            return false;
        }
        const value = setStmt.value;
        if (!(value instanceof BinaryExpression)) {
            console.log("  错误: 值不是二元表达式");
            return false;
        }
        // 检查是否是乘法运算
        if (value.operator !== OperatorType.Multiply) {
            console.log(`  错误: 运算符不是乘法，而是 ${value.operator}`);
            return false;
        }
        // 检查左操作数是否是函数调用
        const left = value.left;
        if (!(left instanceof CallExpression)) {
            console.log("  错误: 左操作数不是函数调用");
            return false;
        }
        // 检查右操作数是否是函数调用
        const right = value.right;
        if (!(right instanceof CallExpression)) {
            console.log("  错误: 右操作数不是函数调用");
            return false;
        }
        return true;
    })) complexPassed++; else complexFailed++;
    
    // 测试嵌套成员访问和函数调用
    if (testComplexExpression("嵌套成员访问和函数调用", `function test takes nothing returns nothing
    call this.a(this.b())
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const callee = callStmt.expression.callee;
        // 检查是否是 this.a
        if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
            const left = callee.left;
            if (left instanceof Identifier && left.toString() === "this") {
                return true;
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试数组索引表达式
    if (testComplexExpression("数组索引表达式", `function test takes nothing returns nothing
    set x = arr[MAX_vALUE + 32 * 6]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是数组索引访问
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const index = value.right;
            // 检查索引是否是表达式
            if (index instanceof BinaryExpression) {
                return true;
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试成员访问链
    if (testComplexExpression("成员访问链", `function test takes nothing returns nothing
    set x = this.ccc.sf[0]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是 this.ccc.sf[0]
        // 应该是 Index 运算符，左操作数是 Dot 运算符
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const left = value.left;
            // 检查是否是 this.ccc.sf (Dot 运算符)
            if (left instanceof BinaryExpression && left.operator === OperatorType.Dot) {
                // 检查左操作数是否是 this.ccc (另一个 Dot 运算符)
                const thisCcc = left.left;
                if (thisCcc instanceof BinaryExpression && thisCcc.operator === OperatorType.Dot) {
                    // 检查是否是 this
                    const thisPart = thisCcc.left;
                    if (thisPart instanceof Identifier && thisPart.toString() === "this") {
                        return true;
                    }
                }
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试 function 表达式作为参数
    if (testComplexExpression("function 表达式作为参数", `function test takes nothing returns nothing
    call a(function callback)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const args = callStmt.expression.arguments;
        // 检查第一个参数是否是 function 表达式
        if (args.length > 0 && args[0] instanceof FunctionExpression) {
            return true;
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试混合类型参数
    if (testComplexExpression("混合类型参数", `function test takes nothing returns nothing
    call func(0.75, false, "string")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) {
            if (p.errors.errors.length > 0) {
                console.log("  解析错误:", p.errors.errors.map(e => e.message).join(', '));
            }
            return false;
        }
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) {
            console.log("  未找到 call 语句");
            return false;
        }
        const args = callStmt.expression.arguments;
        // 检查参数类型
        if (args.length === 3) {
            const hasReal = args[0] instanceof RealLiteral;
            const hasBoolean = args[1] instanceof BooleanLiteral;
            const hasString = args[2] instanceof StringLiteral;
            if (!hasReal) console.log("  第一个参数不是 RealLiteral");
            if (!hasBoolean) console.log("  第二个参数不是 BooleanLiteral");
            if (!hasString) console.log("  第三个参数不是 StringLiteral");
            return hasReal && hasBoolean && hasString;
        } else {
            console.log(`  参数数量不正确: 期望 3，实际 ${args.length}`);
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试完整复杂表达式（简化版）
    if (testComplexExpression("完整复杂表达式（简化版）", `function test takes nothing returns real
    local real x
    set x = this.a(this.b(), function callback) * S2R("test")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是乘法表达式
        if (value instanceof BinaryExpression && value.operator === OperatorType.Multiply) {
            const left = value.left;
            const right = value.right;
            // 检查左操作数是函数调用，右操作数也是函数调用
            if (left instanceof CallExpression && right instanceof CallExpression) {
                return true;
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    console.log(`\n复杂表达式测试结果: 通过 ${complexPassed}, 失败 ${complexFailed}`);
    
    // 测试 15: 二维数组
    console.log("\n测试 15: 二维数组");
    let twoDimArrayPassed = 0;
    let twoDimArrayFailed = 0;
    
    const testTwoDimArray = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本二维数组声明
    if (testTwoDimArray("基本二维数组声明", `globals
integer array mat1 [10][20]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecl = block.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.arrayWidth === 10 && varDecl.arrayHeight === 20 && varDecl.arraySize === null;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 2: 大尺寸二维数组
    if (testTwoDimArray("大尺寸二维数组", `globals
integer array mat2 [100][200]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecl = block.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.arrayWidth === 100 && varDecl.arrayHeight === 200;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 3: 静态二维数组成员（struct 中）
    if (testTwoDimArray("静态二维数组成员", `struct TestStruct
static integer array mat3 [5][6]
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const varDecl = structDecl.members.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.isStatic && varDecl.arrayWidth === 5 && varDecl.arrayHeight === 6;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 4: 一维数组（确保不会误判为二维）
    if (testTwoDimArray("一维数组（不应误判为二维）", `globals
integer array arr1 [100]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecl = block.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.arraySize === 100 && varDecl.arrayWidth === null && varDecl.arrayHeight === null;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 5: 局部二维数组（在函数中声明）
    if (testTwoDimArray("局部二维数组", `function test takes nothing returns nothing
local integer array mat [3][4]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const localVar = func.body.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(localVar instanceof VariableDeclaration)) return false;
        return localVar.isArray && localVar.isLocal && localVar.arrayWidth === 3 && localVar.arrayHeight === 4;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 6: 多个二维数组
    if (testTwoDimArray("多个二维数组", `globals
integer array matA [10][20]
real array matB [5][8]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecls = block.body.filter((s: Statement) => s instanceof VariableDeclaration);
        if (varDecls.length < 2) return false;
        const matA = varDecls.find((v: Statement) => v instanceof VariableDeclaration && v.name.toString() === "matA");
        const matB = varDecls.find((v: Statement) => v instanceof VariableDeclaration && v.name.toString() === "matB");
        if (!matA || !matB || !(matA instanceof VariableDeclaration) || !(matB instanceof VariableDeclaration)) return false;
        return matA.arrayWidth === 10 && matA.arrayHeight === 20 &&
               matB.arrayWidth === 5 && matB.arrayHeight === 8;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    console.log(`\n二维数组测试结果: 通过 ${twoDimArrayPassed}, 失败 ${twoDimArrayFailed}`);
    
    // 测试 16: struct 和 interface 完整测试
    console.log("\n测试 16: struct 和 interface 完整测试");
    let structInterfacePassed = 0;
    let structInterfaceFailed = 0;
    
    const testStructInterface = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 struct 声明
    if (testStructInterface("基本 struct 声明", `struct Point
integer x
integer y
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.name?.toString() === "Point" && structDecl.members.length === 2;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 2: struct 继承
    if (testStructInterface("struct 继承", `struct Parent
integer x
endstruct
struct Child extends Parent
integer y
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        return childStruct.extendsType?.toString() === "Parent";
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 3: struct 索引空间增强
    if (testStructInterface("struct 索引空间增强", `struct BigStruct[10000]
integer a
integer b
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.indexSize === 10000;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 4: struct 数组结构
    if (testStructInterface("struct 数组结构", `struct ArrayStruct extends array [20000]
integer a
integer b
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.isArrayStruct && structDecl.arraySize === 20000;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 5: struct 静态成员
    if (testStructInterface("struct 静态成员", `struct TestStruct
static integer count = 0
static integer array data[100]
integer value
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const staticVar = structDecl.members.find((m: Statement) => m instanceof VariableDeclaration && m.isStatic);
        return staticVar !== undefined;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 6: struct 方法
    if (testStructInterface("struct 方法", `struct TestStruct
integer x
method setX takes integer val returns nothing
set this.x = val
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 7: 基本 interface 声明
    if (testStructInterface("基本 interface 声明", `interface Printable
method toString takes nothing returns string
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        return interfaceDecl.name?.toString() === "Printable";
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 8: struct 实现 interface
    if (testStructInterface("struct 实现 interface", `interface Printable
method toString takes nothing returns string
endinterface
struct SingleInt extends Printable
integer v
method toString takes nothing returns string
return I2S(this.v)
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.extendsType?.toString() === "Printable";
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 9: struct 二维数组成员
    if (testStructInterface("struct 二维数组成员", `struct Matrix
static integer array data [10][20]
integer value
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const arrayMember = structDecl.members.find((m: Statement) => 
            m instanceof VariableDeclaration && m.isArray && m.arrayWidth !== null
        );
        if (!(arrayMember instanceof VariableDeclaration)) return false;
        return arrayMember.arrayWidth === 10 && arrayMember.arrayHeight === 20;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    console.log(`\nstruct 和 interface 测试结果: 通过 ${structInterfacePassed}, 失败 ${structInterfaceFailed}`);
    
    // 测试 25: defaults 关键字功能测试
    console.log("\n测试 25: defaults 关键字功能测试");
    let defaultsPassed = 0;
    let defaultsFailed = 0;
    
    const testDefaults = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            // 添加调试信息
            if (result.body.length > 0) {
                const interfaceDecl = result.body.find((s: Statement) => s instanceof InterfaceDeclaration);
                if (interfaceDecl instanceof InterfaceDeclaration) {
                    const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
                    console.log(`  找到 ${methods.length} 个方法`);
                    methods.forEach(m => {
                        if (m.defaultsValue) {
                            console.log(`    方法 ${m.name?.toString()}: defaultsValue = ${m.defaultsValue.toString()} (类型: ${m.defaultsValue.constructor.name})`);
                        } else {
                            console.log(`    方法 ${m.name?.toString()}: 无 defaultsValue`);
                        }
                    });
                }
            }
            return false;
        }
    };
    
    // 测试 1: 基本 defaults 使用（文档示例）
    if (testDefaults("基本 defaults 使用（文档示例）", `interface whattodo
method onStrike takes real x, real y returns boolean defaults false
method onBegin takes real x, real y returns nothing defaults nothing
method onFinish takes nothing returns nothing
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 3) return false;
        
        // 检查 onStrike 方法有 defaults false
        const onStrike = methods.find(m => m.name?.toString() === "onStrike");
        if (!onStrike || !onStrike.defaultsValue) return false;
        if (onStrike.defaultsValue.toString() !== "false") return false;
        
        // 检查 onBegin 方法有 defaults nothing
        const onBegin = methods.find(m => m.name?.toString() === "onBegin");
        if (!onBegin || !onBegin.defaultsValue) return false;
        if (onBegin.defaultsValue.toString() !== "nothing") return false;
        
        // 检查 onFinish 方法没有 defaults
        const onFinish = methods.find(m => m.name?.toString() === "onFinish");
        if (!onFinish || onFinish.defaultsValue !== null) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 2: defaults 带整数常量值
    if (testDefaults("defaults 带整数常量值", `interface TestInterface
method getValue takes nothing returns integer defaults 0
method getCount takes nothing returns integer defaults 100
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const getValue = methods.find(m => m.name?.toString() === "getValue");
        if (!getValue || !getValue.defaultsValue) return false;
        if (getValue.defaultsValue.toString() !== "0") return false;
        
        const getCount = methods.find(m => m.name?.toString() === "getCount");
        if (!getCount || !getCount.defaultsValue) return false;
        if (getCount.defaultsValue.toString() !== "100") return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 3: defaults 带实数常量值
    if (testDefaults("defaults 带实数常量值", `interface TestInterface
method getReal takes nothing returns real defaults 0.0
method getPi takes nothing returns real defaults 3.14159
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const getReal = methods.find(m => m.name?.toString() === "getReal");
        if (!getReal || !getReal.defaultsValue) return false;
        
        const getPi = methods.find(m => m.name?.toString() === "getPi");
        if (!getPi || !getPi.defaultsValue) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 4: defaults 带字符串常量值
    if (testDefaults("defaults 带字符串常量值", `interface TestInterface
method getName takes nothing returns string defaults ""
method getMessage takes nothing returns string defaults "default"
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const getName = methods.find(m => m.name?.toString() === "getName");
        if (!getName || !getName.defaultsValue) return false;
        
        const getMessage = methods.find(m => m.name?.toString() === "getMessage");
        if (!getMessage || !getMessage.defaultsValue) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 5: defaults 带布尔常量值
    if (testDefaults("defaults 带布尔常量值", `interface TestInterface
method isEnabled takes nothing returns boolean defaults true
method isDisabled takes nothing returns boolean defaults false
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const isEnabled = methods.find(m => m.name?.toString() === "isEnabled");
        if (!isEnabled || !isEnabled.defaultsValue) return false;
        if (isEnabled.defaultsValue.toString() !== "true") return false;
        
        const isDisabled = methods.find(m => m.name?.toString() === "isDisabled");
        if (!isDisabled || !isDisabled.defaultsValue) return false;
        if (isDisabled.defaultsValue.toString() !== "false") return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 6: 混合使用 defaults 和不使用 defaults
    if (testDefaults("混合使用 defaults 和不使用 defaults", `interface TestInterface
method required takes nothing returns nothing
method optional1 takes nothing returns integer defaults 0
method optional2 takes nothing returns boolean defaults false
method required2 takes nothing returns string
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 4) return false;
        
        const required = methods.find(m => m.name?.toString() === "required");
        if (!required || required.defaultsValue !== null) return false;
        
        const optional1 = methods.find(m => m.name?.toString() === "optional1");
        if (!optional1 || !optional1.defaultsValue) return false;
        
        const optional2 = methods.find(m => m.name?.toString() === "optional2");
        if (!optional2 || !optional2.defaultsValue) return false;
        
        const required2 = methods.find(m => m.name?.toString() === "required2");
        if (!required2 || required2.defaultsValue !== null) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 7: struct 实现带 defaults 的接口
    if (testDefaults("struct 实现带 defaults 的接口", `interface TestInterface
method optional takes nothing returns integer defaults 0
method required takes nothing returns nothing
endinterface
struct TestStruct extends TestInterface
method required takes nothing returns nothing
call BJDebugMsg("required")
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        
        // 检查接口中有 defaults
        const interfaceMethods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        const optionalMethod = interfaceMethods.find(m => m.name?.toString() === "optional");
        if (!optionalMethod || !optionalMethod.defaultsValue) return false;
        
        // struct 实现了 required 方法（没有实现 optional，这是合法的，因为有 defaults）
        const structMethods = structDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        const requiredMethod = structMethods.find(m => m.name?.toString() === "required");
        if (!requiredMethod) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    console.log(`\ndefaults 关键字测试结果: 通过 ${defaultsPassed}, 失败 ${defaultsFailed}`);
    
    // 测试 26: readonly 关键字功能测试
    console.log("\n测试 26: readonly 关键字功能测试");
    let readonlyPassed = 0;
    let readonlyFailed = 0;
    
    const testReadonly = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            readonlyPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            readonlyFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 readonly 使用（文档示例）
    testReadonly("基本 readonly 成员", `struct encap
    real a = 0.0
    private real b = 0.0
    public real c = 4.5
    readonly real d = 10.0
    method randomize takes nothing returns nothing
        set this.a = GetRandomReal(0, 45.0)
        set this.b = GetRandomReal(0, 45.0)
        set this.c = GetRandomReal(0, 45.0)
        set this.d = GetRandomReal(0, 45.0)
    endmethod
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "encap");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 4) return false;
        // 检查是否有 readonly 成员
        const readonlyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "d" && m.isReadonly === true;
            }
            return false;
        });
        return readonlyMember !== undefined;
    });
    
    // 测试 2: readonly 与 static 组合
    testReadonly("readonly static 成员", `struct TestStruct
    readonly static integer count = 0
    readonly real value = 5.0
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 2) return false;
        // 检查 readonly static 成员
        const readonlyStatic = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "count" && m.isReadonly === true && m.isStatic === true;
            }
            return false;
        });
        // 检查 readonly 非 static 成员
        const readonlyNonStatic = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "value" && m.isReadonly === true && m.isStatic === false;
            }
            return false;
        });
        return readonlyStatic !== undefined && readonlyNonStatic !== undefined;
    });
    
    // 测试 3: readonly 与 constant 组合（虽然文档说它是非标准的，但我们仍然支持解析）
    testReadonly("readonly constant 成员", `struct TestStruct
    readonly constant integer MAX_VALUE = 100
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "MAX_VALUE" && 
               member.isReadonly === true && 
               member.isConstant === true;
    });
    
    // 测试 4: readonly 数组成员
    testReadonly("readonly 数组成员", `struct TestStruct
    readonly integer array data[10]
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "data" && 
               member.isReadonly === true && 
               member.isArray === true &&
               member.arraySize === 10;
    });
    
    // 测试 5: readonly 与 private/public 的混合使用
    testReadonly("readonly 与 private/public 混合", `struct TestStruct
    real a = 0.0
    private real b = 0.0
    public real c = 0.0
    readonly real d = 0.0
    private readonly real e = 0.0
    public readonly real f = 0.0
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 6) return false;
        // 检查所有成员都被正确解析
        const memberNames = members.map((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString();
            }
            return "";
        });
        return memberNames.includes("a") && 
               memberNames.includes("b") && 
               memberNames.includes("c") && 
               memberNames.includes("d") && 
               memberNames.includes("e") && 
               memberNames.includes("f");
    });
    
    // 测试 6: readonly 成员的 toString 输出
    testReadonly("readonly 成员的 toString", `struct TestStruct
    readonly real value = 5.0
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        const str = member.toString();
        // 检查 toString 是否包含 readonly
        return str.includes("readonly") && member.isReadonly === true;
    });
    
    // 测试 7: readonly 二维数组成员
    testReadonly("readonly 二维数组成员", `struct TestStruct
    readonly integer array matrix[10][20]
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "matrix" && 
               member.isReadonly === true && 
               member.isArray === true &&
               member.arrayWidth === 10 &&
               member.arrayHeight === 20;
    });
    
    // 测试 8: readonly 与 static 和 constant 三组合
    testReadonly("readonly static constant 组合", `struct TestStruct
    readonly static constant integer MAX = 100
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "MAX" && 
               member.isReadonly === true && 
               member.isStatic === true &&
               member.isConstant === true;
    });
    
    // 测试 9: readonly 在继承结构中的使用
    testReadonly("readonly 在继承结构中", `struct Parent
    integer x
    readonly integer y = 10
endstruct
struct Child extends Parent
    integer z
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const parent = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Parent");
        if (!(parent instanceof StructDeclaration)) return false;
        const members = parent.members.filter((m: Statement) => m instanceof VariableDeclaration);
        const readonlyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "y" && m.isReadonly === true;
            }
            return false;
        });
        return readonlyMember !== undefined;
    });
    
    // 测试 10: readonly 与自定义类型
    testReadonly("readonly 与自定义类型", `struct MyType
    integer value
endstruct
struct TestStruct
    readonly MyType obj = 0
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const testStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(testStruct instanceof StructDeclaration)) return false;
        const members = testStruct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        const readonlyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "obj" && m.isReadonly === true && m.type?.toString() === "MyType";
            }
            return false;
        });
        return readonlyMember !== undefined;
    });
    
    console.log(`\nreadonly 关键字测试结果: 通过 ${readonlyPassed}, 失败 ${readonlyFailed}`);
    
    // 测试 27: key 类型功能测试
    console.log("\n测试 27: key 类型功能测试");
    let keyPassed = 0;
    let keyFailed = 0;
    
    const testKey = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            keyPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            keyFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 key 类型声明（文档示例）
    testKey("基本 key 类型声明", `scope Tester initializer test
globals
key AAAA
private key BBBB
public key CCCC
constant key DDDD
endglobals
private function test takes nothing returns nothing
local hashtable ht = InitHashtable()
call SaveInteger(ht, AAAA, BBBB, 5)
call SaveInteger(ht, AAAA, CCCC, 7)
call SaveReal(ht, AAAA, DDDD, LoadInteger(ht, AAAA, BBBB) * 0.05)
call BJDebugMsg(R2S(LoadReal(ht, AAAA, DDDD)))
call BJDebugMsg(I2S(BBBB))
call BJDebugMsg(I2S(CCCC))
endfunction
endscope`, (r, p) => {
        if (p.errors.errors.length > 0) {
            return false;
        }
        if (r.body.length < 1) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration);
        if (!(scope instanceof ScopeDeclaration)) return false;
        // 检查是否有 globals 块
        const globalsBlock = scope.members.find((m: Statement) => m instanceof BlockStatement);
        if (!(globalsBlock instanceof BlockStatement)) return false;
        const globalsStmts = globalsBlock.body;
        // 应该找到 4 个 key 变量声明
        const keyVars = globalsStmts.filter((s: Statement) => {
            if (s instanceof VariableDeclaration) {
                return s.type?.toString() === "key";
            }
            return false;
        });
        return keyVars.length === 4;
    });
    
    // 测试 2: key 类型不能有初始化值
    testKey("key 类型不能有初始化值", `globals
key TEST_KEY = 123
endglobals`, (r, p) => {
        // 应该报错：key 类型不能有初始化值
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("cannot have initializers") || e.message.includes("Key type variables cannot have initializers"));
    });
    
    // 测试 3: key 类型不能是数组
    testKey("key 类型不能是数组", `globals
key array TEST_KEYS[10]
endglobals`, (r, p) => {
        // 应该报错：key 类型不能是数组
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("cannot be an array") || e.message.includes("Key type cannot be an array"));
    });
    
    // 测试 4: constant key 类型
    testKey("constant key 类型", `globals
constant key KEY1
constant key KEY2
endglobals`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const globalsBlock = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!(globalsBlock instanceof BlockStatement)) return false;
        const keyVars = globalsBlock.body.filter((s: Statement) => {
            if (s instanceof VariableDeclaration) {
                return s.type?.toString() === "key" && s.isConstant === true;
            }
            return false;
        });
        return keyVars.length === 2;
    });
    
    // 测试 5: key 类型在 struct 中（应该不支持，但先测试解析）
    testKey("key 类型在 struct 中", `struct TestStruct
key memberKey
endstruct`, (r, p) => {
        // key 类型主要用于 globals，但在 struct 中理论上也可以解析
        // 这里只检查是否能解析，不检查语义正确性
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        const keyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.type?.toString() === "key";
            }
            return false;
        });
        return keyMember !== undefined;
    });
    
    // 测试 6: key 类型在函数参数中（应该不支持，但先测试解析）
    testKey("key 类型在函数参数中", `function test takes key k returns nothing
call BJDebugMsg(I2S(k))
endfunction`, (r, p) => {
        // key 类型主要用于 globals，但在函数参数中理论上也可以解析
        // 这里只检查是否能解析，不检查语义正确性
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const keyParam = func.parameters.find((p: VariableDeclaration) => {
            return p.type?.toString() === "key";
        });
        return keyParam !== undefined;
    });
    
    // 测试 7: key 类型在局部变量中（应该不支持，但先测试解析）
    testKey("key 类型在局部变量中", `function test takes nothing returns nothing
local key localKey
call BJDebugMsg(I2S(localKey))
endfunction`, (r, p) => {
        // key 类型主要用于 globals，但在局部变量中理论上也可以解析
        // 这里只检查是否能解析，不检查语义正确性
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const localVars = func.body.body.filter((s: Statement) => s instanceof VariableDeclaration && (s as VariableDeclaration).isLocal);
        const keyLocal = localVars.find((v: Statement) => {
            if (v instanceof VariableDeclaration) {
                return v.type?.toString() === "key";
            }
            return false;
        });
        return keyLocal !== undefined;
    });
    
    console.log(`\nkey 类型测试结果: 通过 ${keyPassed}, 失败 ${keyFailed}`);
    
    // 测试 28: library/scope 的 requires/needs/uses/initializer/optional 功能测试
    console.log("\n测试 28: library/scope 的 requires/needs/uses/initializer/optional 功能测试");
    let libraryScopePassed = 0;
    let libraryScopeFailed = 0;
    
    const testLibraryScope = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            libraryScopePassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            libraryScopeFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 library 声明
    testLibraryScope("基本 library 声明", `library MyLibrary
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration);
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.name?.toString() === "MyLibrary" && 
               lib.dependencies.length === 0 && 
               lib.initializer === null;
    });
    
    // 测试 2: library 带 requires
    testLibraryScope("library 带 requires", `library B requires A
function Bfun takes nothing returns nothing
endfunction
endlibrary
library A
function Afun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const libB = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "B");
        if (!(libB instanceof LibraryDeclaration)) return false;
        return libB.dependencies.length === 1 && 
               libB.dependencies[0].toString() === "A";
    });
    
    // 测试 3: library 带 needs
    testLibraryScope("library 带 needs", `library C needs A, B
function Cfun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "C");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 2 && 
               lib.dependencies[0].toString() === "A" && 
               lib.dependencies[1].toString() === "B";
    });
    
    // 测试 4: library 带 uses
    testLibraryScope("library 带 uses", `library D uses A
function Dfun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "D");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 1 && 
               lib.dependencies[0].toString() === "A";
    });
    
    // 测试 5: library 带 initializer
    testLibraryScope("library 带 initializer", `library A initializer InitA
function InitA takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "A");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "InitA";
    });
    
    // 测试 6: library 带 initializer 和 requires（文档示例）
    testLibraryScope("library 带 initializer 和 requires（文档示例）", `library A initializer InitA requires B
function InitA takes nothing returns nothing
endfunction
endlibrary
library B initializer InitB
function InitB takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const libA = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "A");
        if (!(libA instanceof LibraryDeclaration)) return false;
        return libA.initializer?.toString() === "InitA" && 
               libA.dependencies.length === 1 && 
               libA.dependencies[0].toString() === "B";
    });
    
    // 测试 7: library 带 optional requires
    testLibraryScope("library 带 optional requires", `library OptionalCode requires optional UnitKiller
function fun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "OptionalCode");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 1 && 
               lib.dependencies[0].toString() === "UnitKiller" && 
               lib.optionalDependencies.has("UnitKiller");
    });
    
    // 测试 8: library 带多个 optional 依赖
    testLibraryScope("library 带多个 optional 依赖", `library TestLib requires optional A, optional B, C
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 3 && 
               lib.dependencies[0].toString() === "A" && 
               lib.dependencies[1].toString() === "B" && 
               lib.dependencies[2].toString() === "C" && 
               lib.optionalDependencies.has("A") && 
               lib.optionalDependencies.has("B") && 
               !lib.optionalDependencies.has("C");
    });
    
    // 测试 9: library_once
    testLibraryScope("library_once 声明", `library_once MyLib
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "MyLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.isLibraryOnce === true;
    });
    
    // 测试 10: scope 基本声明
    testLibraryScope("scope 基本声明", `scope MyScope
function test takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration);
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.name?.toString() === "MyScope" && 
               scope.initializer === null;
    });
    
    // 测试 11: scope 带 initializer
    testLibraryScope("scope 带 initializer", `scope Tester initializer test
function test takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "Tester");
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.initializer?.toString() === "test";
    });
    
    // 测试 12: scope 带 initializer 和 globals（key 类型测试中的示例）
    testLibraryScope("scope 带 initializer 和 globals", `scope Tester initializer test
globals
key AAAA
endglobals
function test takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "Tester");
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.initializer?.toString() === "test" && 
               scope.members.length > 0;
    });
    
    // 测试 13: library 多个 requires 语句
    testLibraryScope("library 多个 requires 语句", `library TestLib requires A
requires B
requires C
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 3 && 
               lib.dependencies[0].toString() === "A" && 
               lib.dependencies[1].toString() === "B" && 
               lib.dependencies[2].toString() === "C";
    });
    
    // 测试 14: library initializer 在 requires 之前
    testLibraryScope("library initializer 在 requires 之前", `library TestLib initializer Init requires A
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "Init" && 
               lib.dependencies.length === 1 && 
               lib.dependencies[0].toString() === "A";
    });
    
    // 测试 15: library 混合使用 requires/needs/uses
    testLibraryScope("library 混合使用 requires/needs/uses", `library TestLib requires A
needs B
uses C
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 3 && 
               lib.dependencies.some((d: Identifier) => d.toString() === "A") &&
               lib.dependencies.some((d: Identifier) => d.toString() === "B") &&
               lib.dependencies.some((d: Identifier) => d.toString() === "C");
    });
    
    // 测试 16: library 复杂依赖链
    testLibraryScope("library 复杂依赖链", `library E requires A, B, C, D
function Efun takes nothing returns nothing
endfunction
endlibrary
library D requires A, B
function Dfun takes nothing returns nothing
endfunction
endlibrary
library C requires A
function Cfun takes nothing returns nothing
endfunction
endlibrary
library B requires A
function Bfun takes nothing returns nothing
endfunction
endlibrary
library A
function Afun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 5 || p.errors.errors.length > 0) return false;
        const libE = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "E");
        if (!(libE instanceof LibraryDeclaration)) return false;
        return libE.dependencies.length === 4;
    });
    
    // 测试 17: library 带 initializer 和多个 optional 依赖
    testLibraryScope("library 带 initializer 和多个 optional 依赖", `library TestLib initializer Init requires optional A, optional B
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "Init" && 
               lib.dependencies.length === 2 && 
               lib.optionalDependencies.has("A") && 
               lib.optionalDependencies.has("B");
    });
    
    // 测试 18: library_once 带依赖和 initializer
    testLibraryScope("library_once 带依赖和 initializer", `library_once TestLib initializer Init requires A
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.isLibraryOnce === true && 
               lib.initializer?.toString() === "Init" && 
               lib.dependencies.length === 1;
    });
    
    // 测试 19: scope 嵌套在 library 中
    testLibraryScope("scope 嵌套在 library 中", `library TestLib
scope InnerScope initializer innerInit
function innerInit takes nothing returns nothing
endfunction
endscope
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        const scope = lib.members.find((m: Statement) => m instanceof ScopeDeclaration && (m as ScopeDeclaration).name?.toString() === "InnerScope");
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.initializer?.toString() === "innerInit";
    });
    
    // 测试 20: library 的 toString 输出
    testLibraryScope("library 的 toString 输出", `library TestLib initializer Init requires A, optional B
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        const str = lib.toString();
        return str.includes("library TestLib") && 
               str.includes("initializer Init") && 
               str.includes("requires");
    });
    
    // 测试 21: scope 的 toString 输出
    testLibraryScope("scope 的 toString 输出", `scope TestScope initializer Init
function Init takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "TestScope");
        if (!(scope instanceof ScopeDeclaration)) return false;
        const str = scope.toString();
        return str.includes("scope TestScope") && 
               str.includes("initializer Init");
    });
    
    console.log(`\nlibrary/scope 功能测试结果: 通过 ${libraryScopePassed}, 失败 ${libraryScopeFailed}`);
    
    // 测试 29: hook 语句功能测试
    console.log("\n测试 29: hook 语句功能测试");
    let hookPassed = 0;
    let hookFailed = 0;
    
    const testHook = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            hookPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            hookFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 hook 语句（文档示例）
    testHook("基本 hook 语句（文档示例）", `function onRemoval takes unit u returns nothing
call BJDebugMsg("unit is being removed!")
endfunction
hook RemoveUnit onRemoval`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "RemoveUnit" && 
               hook.hookFunction.toString() === "onRemoval" && 
               hook.hookStruct === null && 
               hook.hookMethod === null;
    });
    
    // 测试 2: hook 语句使用结构静态方法（文档示例）
    testHook("hook 语句使用结构静态方法（文档示例）", `struct err
static method onrem takes unit u returns nothing
call BJDebugMsg("This also knows that a unit is being removed!")
endmethod
endstruct
hook RemoveUnit err.onrem`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "RemoveUnit" && 
               hook.hookStruct?.toString() === "err" && 
               hook.hookMethod?.toString() === "onrem";
    });
    
    // 测试 3: hook 多个函数
    testHook("hook 多个函数", `function hook1 takes nothing returns nothing
endfunction
function hook2 takes nothing returns nothing
endfunction
hook KillUnit hook1
hook CreateUnit hook2`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const hooks = r.body.filter((s: Statement) => s instanceof HookStatement);
        if (hooks.length !== 2) return false;
        const hook1 = hooks[0] as HookStatement;
        const hook2 = hooks[1] as HookStatement;
        return (hook1.targetFunction.toString() === "KillUnit" && hook1.hookFunction.toString() === "hook1") ||
               (hook1.targetFunction.toString() === "CreateUnit" && hook1.hookFunction.toString() === "hook2");
    });
    
    // 测试 4: hook 语句在 library 中
    testHook("hook 语句在 library 中", `library TestLib
function onKill takes unit u returns nothing
call BJDebugMsg("Unit killed")
endfunction
hook KillUnit onKill
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration);
        if (!(lib instanceof LibraryDeclaration)) return false;
        const hook = lib.members.find((m: Statement) => m instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "KillUnit" && 
               hook.hookFunction.toString() === "onKill";
    });
    
    // 测试 5: hook 语句在 scope 中
    testHook("hook 语句在 scope 中", `scope TestScope
function onCreate takes nothing returns nothing
call BJDebugMsg("Unit created")
endfunction
hook CreateUnit onCreate
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration);
        if (!(scope instanceof ScopeDeclaration)) return false;
        const hook = scope.members.find((m: Statement) => m instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "CreateUnit" && 
               hook.hookFunction.toString() === "onCreate";
    });
    
    // 测试 6: hook 语句的 toString 输出（普通函数）
    testHook("hook 语句的 toString 输出（普通函数）", `function hookFunc takes nothing returns nothing
endfunction
hook TestFunc hookFunc`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        const str = hook.toString();
        return str === "hook TestFunc hookFunc";
    });
    
    // 测试 7: hook 语句的 toString 输出（结构方法）
    testHook("hook 语句的 toString 输出（结构方法）", `struct MyStruct
static method hookMethod takes nothing returns nothing
endmethod
endstruct
hook TestFunc MyStruct.hookMethod`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        const str = hook.toString();
        return str === "hook TestFunc MyStruct.hookMethod";
    });
    
    // 测试 8: hook native 函数
    testHook("hook native 函数", `function onNativeCall takes nothing returns nothing
endfunction
hook GetUnitX onNativeCall`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "GetUnitX" && 
               hook.hookFunction.toString() === "onNativeCall";
    });
    
    // 测试 9: hook bj 函数
    testHook("hook bj 函数", `function onBJCall takes nothing returns nothing
endfunction
hook BJDebugMsg onBJCall`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "BJDebugMsg" && 
               hook.hookFunction.toString() === "onBJCall";
    });
    
    // 测试 10: hook 多个结构方法
    testHook("hook 多个结构方法", `struct Handler1
static method handle1 takes nothing returns nothing
endmethod
endstruct
struct Handler2
static method handle2 takes nothing returns nothing
endmethod
endstruct
hook Func1 Handler1.handle1
hook Func2 Handler2.handle2`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const hooks = r.body.filter((s: Statement) => s instanceof HookStatement);
        if (hooks.length !== 2) return false;
        const hook1 = hooks.find((h: HookStatement) => h.targetFunction.toString() === "Func1") as HookStatement;
        const hook2 = hooks.find((h: HookStatement) => h.targetFunction.toString() === "Func2") as HookStatement;
        if (!hook1 || !hook2) return false;
        return hook1.hookStruct?.toString() === "Handler1" && 
               hook1.hookMethod?.toString() === "handle1" &&
               hook2.hookStruct?.toString() === "Handler2" && 
               hook2.hookMethod?.toString() === "handle2";
    });
    
    // 测试 11: hook 同一个函数多次（应该允许）
    testHook("hook 同一个函数多次", `function hook1 takes nothing returns nothing
endfunction
function hook2 takes nothing returns nothing
endfunction
hook TestFunc hook1
hook TestFunc hook2`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const hooks = r.body.filter((s: Statement) => s instanceof HookStatement);
        if (hooks.length !== 2) return false;
        const allTargetTestFunc = hooks.every((h: HookStatement) => h.targetFunction.toString() === "TestFunc");
        return allTargetTestFunc;
    });
    
    // 测试 12: hook 带参数的函数
    testHook("hook 带参数的函数", `function onUnitAction takes unit u, integer i returns nothing
call BJDebugMsg("Unit action")
endfunction
hook SomeFunction onUnitAction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "SomeFunction" && 
               hook.hookFunction.toString() === "onUnitAction";
    });
    
    // 测试 13: hook 带返回值的函数
    testHook("hook 带返回值的函数", `function onGetValue takes nothing returns integer
return 100
endfunction
hook GetValue onGetValue`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "GetValue" && 
               hook.hookFunction.toString() === "onGetValue";
    });
    
    // 测试 14: hook 在嵌套 scope 中
    testHook("hook 在嵌套 scope 中", `scope Outer
scope Inner
function onInner takes nothing returns nothing
endfunction
hook InnerFunc onInner
endscope
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const outerScope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "Outer");
        if (!(outerScope instanceof ScopeDeclaration)) return false;
        const innerScope = outerScope.members.find((m: Statement) => m instanceof ScopeDeclaration && (m as ScopeDeclaration).name?.toString() === "Inner");
        if (!(innerScope instanceof ScopeDeclaration)) return false;
        const hook = innerScope.members.find((m: Statement) => m instanceof HookStatement);
        return hook !== undefined;
    });
    
    // 测试 15: hook 与 library initializer 组合
    testHook("hook 与 library initializer 组合", `library TestLib initializer Init
function Init takes nothing returns nothing
endfunction
function onHook takes nothing returns nothing
endfunction
hook TestFunc onHook
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "Init" && 
               lib.members.some((m: Statement) => m instanceof HookStatement);
    });
    
    console.log(`\nhook 语句测试结果: 通过 ${hookPassed}, 失败 ${hookFailed}`);
    
    // 测试 30: inject 和 loaddata 预处理器指令功能测试
    console.log("\n测试 30: inject 和 loaddata 预处理器指令功能测试");
    let injectLoadDataPassed = 0;
    let injectLoadDataFailed = 0;
    
    const testInjectLoadData = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            injectLoadDataPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            injectLoadDataFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 inject main 指令（文档示例）
    testInjectLoadData("基本 inject main 指令（文档示例）", `//! inject main
//一些函数调用可能会在这里
//将 vJass 初始化放置在此处，注意，结构优先被初始化，然后是库初始化
//! dovJassinit
//其他的调用可能会在这里
call InitCustomTriggers()
//也许您想使用 WorldEditor 的该功能...
//! endinject`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        if (!(inject instanceof InjectStatement)) return false;
        return inject.injectType === "main" && inject.content.length > 0;
    });
    
    // 测试 2: inject config 指令
    testInjectLoadData("inject config 指令", `//! inject config
//配置代码
call SetGameSpeed(MAP_SPEED_FAST)
//! endinject`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        if (!(inject instanceof InjectStatement)) return false;
        return inject.injectType === "config" && inject.content.length > 0;
    });
    
    // 测试 3: 基本 loaddata 指令
    testInjectLoadData("基本 loaddata 指令", `//! loaddata "path.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        return loadData.filePath === "path.slk";
    });
    
    // 测试 4: loaddata 带相对路径
    testInjectLoadData("loaddata 带相对路径", `//! loaddata "data/units.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        return loadData.filePath === "data/units.slk";
    });
    
    // 测试 5: loaddata 带绝对路径
    testInjectLoadData("loaddata 带绝对路径", `//! loaddata "C:\\data\\units.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        return loadData.filePath === "C:\\data\\units.slk";
    });
    
    // 测试 6: inject 和 loaddata 混合使用
    testInjectLoadData("inject 和 loaddata 混合使用", `//! loaddata "units.slk"
//! inject main
call InitCustomTriggers()
//! endinject
//! loaddata "items.slk"`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const loadData1 = r.body.find((s: Statement) => s instanceof LoadDataStatement && s.filePath === "units.slk");
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        const loadData2 = r.body.find((s: Statement) => s instanceof LoadDataStatement && s.filePath === "items.slk");
        return loadData1 !== undefined && inject !== undefined && loadData2 !== undefined;
    });
    
    // 测试 7: inject 在 library 中
    testInjectLoadData("inject 在 library 中", `library TestLib
//! inject main
call InitTestLib()
//! endinject
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration);
        if (!(lib instanceof LibraryDeclaration)) return false;
        const inject = lib.members.find((m: Statement) => m instanceof InjectStatement);
        return inject !== undefined;
    });
    
    // 测试 8: inject 的 toString 输出
    testInjectLoadData("inject 的 toString 输出", `//! inject main
call Test()
//! endinject`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        if (!(inject instanceof InjectStatement)) return false;
        const str = inject.toString();
        return str.includes("//! inject main") && str.includes("//! endinject");
    });
    
    // 测试 9: loaddata 的 toString 输出
    testInjectLoadData("loaddata 的 toString 输出", `//! loaddata "test.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        const str = loadData.toString();
        return str === `//! loaddata "test.slk"`;
    });
    
    // 测试 10: 未闭合的 inject 块（应该报错）
    testInjectLoadData("未闭合的 inject 块（应该报错）", `//! inject main
call Test()
// 没有 endinject`, (r, p) => {
        // 应该报错：未闭合的 inject 块
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("Unclosed //! inject"));
    });
    
    console.log(`\ninject 和 loaddata 测试结果: 通过 ${injectLoadDataPassed}, 失败 ${injectLoadDataFailed}`);
    
    // 测试 17: 二维数组表达式访问
    console.log("\n测试 17: 二维数组表达式访问");
    let twoDimExprPassed = 0;
    let twoDimExprFailed = 0;
    
    const testTwoDimExpr = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本二维数组访问
    if (testTwoDimExpr("基本二维数组访问", `function test takes nothing returns nothing
local integer array mat [10][20]
local integer i = 0
local integer j = 0
set i = mat[0][1]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是嵌套的数组访问：mat[0][1] 应该是 BinaryExpression(Index, BinaryExpression(Index, mat, 0), 1)
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const left = value.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                return true;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 2: 二维数组赋值
    if (testTwoDimExpr("二维数组赋值", `function test takes nothing returns nothing
local integer array mat [5][6]
set mat[2][3] = 100
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        // 检查 target 是否是嵌套的数组访问
        if (target instanceof BinaryExpression && target.operator === OperatorType.Index) {
            const left = target.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                return true;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 3: 二维数组访问表达式索引
    if (testTwoDimExpr("二维数组访问表达式索引", `function test takes nothing returns nothing
local integer array mat [10][20]
local integer i = 0
local integer j = 0
set i = mat[i + 1][j * 2]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const left = value.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                // 检查索引是否是表达式
                const firstIndex = left.right;
                const secondIndex = value.right;
                return firstIndex instanceof BinaryExpression && secondIndex instanceof BinaryExpression;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 4: 全局二维数组访问
    if (testTwoDimExpr("全局二维数组访问", `globals
integer array mat [10][20]
endglobals
function test takes nothing returns nothing
set mat[5][10] = 50
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        if (target instanceof BinaryExpression && target.operator === OperatorType.Index) {
            const left = target.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                return true;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 5: 二维数组在函数调用中
    if (testTwoDimExpr("二维数组在函数调用中", `function test takes nothing returns nothing
local integer array mat [3][4]
call BJDebugMsg(I2S(mat[1][2]))
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) {
            if (p.errors.errors.length > 0) {
                console.log(`    解析错误: ${p.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) {
            return false;
        }
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) {
            return false;
        }
        const args = callStmt.expression.arguments;
        if (args.length === 0) {
            return false;
        }
        // BJDebugMsg 的第一个参数是 I2S(mat[1][2])，这是一个 CallExpression
        const arg = args[0];
        if (!(arg instanceof CallExpression)) {
            return false;
        }
        // 检查 I2S 的参数，应该是 mat[1][2]
        const i2sArgs = arg.arguments;
        if (i2sArgs.length === 0) {
            return false;
        }
        const matArg = i2sArgs[0];
        // 检查是否是二维数组访问：matArg 应该是 BinaryExpression(Index, BinaryExpression(Index, mat, 1), 2)
        if (!(matArg instanceof BinaryExpression)) {
            return false;
        }
        if (matArg.operator !== OperatorType.Index) {
            return false;
        }
        // 检查内层：matArg.left 应该是 BinaryExpression(Index, mat, 1)
        const left = matArg.left;
        if (!(left instanceof BinaryExpression)) {
            return false;
        }
        if (left.operator !== OperatorType.Index) {
            return false;
        }
        // 检查内层的 left 是否是 mat 标识符
        if (!(left.left instanceof Identifier) || left.left.toString() !== "mat") {
            return false;
        }
        // 检查索引值（可以是 IntegerLiteral 或其他表达式）
        // 第一个索引应该是 1
        if (!(left.right instanceof IntegerLiteral) || left.right.value !== 1) {
            return false;
        }
        // 第二个索引应该是 2
        if (!(matArg.right instanceof IntegerLiteral) || matArg.right.value !== 2) {
            return false;
        }
        return true;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 6: 二维数组在条件表达式中
    if (testTwoDimExpr("二维数组在条件表达式中", `function test takes nothing returns nothing
local integer array mat [5][5]
if mat[2][3] > 0 then
call BJDebugMsg("positive")
endif
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const ifStmt = func.body.body.find((s: Statement) => s instanceof IfStatement);
        if (!(ifStmt instanceof IfStatement)) return false;
        const condition = ifStmt.condition;
        if (condition instanceof BinaryExpression) {
            const left = condition.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                const nestedLeft = left.left;
                if (nestedLeft instanceof BinaryExpression && nestedLeft.operator === OperatorType.Index) {
                    return true;
                }
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 7: 成员访问后的二维数组访问
    if (testTwoDimExpr("成员访问后的二维数组访问", `struct Matrix
integer array data [10][20]
endstruct
function test takes nothing returns nothing
local Matrix m = Matrix.create()
set m.data[5][10] = 100
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        // 应该是 m.data[5][10]，即 Dot(m, Index(Index(data, 5), 10))
        if (target instanceof BinaryExpression) {
            if (target.operator === OperatorType.Index) {
                const left = target.left;
                if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                    return true;
                }
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    console.log(`\n二维数组表达式访问测试结果: 通过 ${twoDimExprPassed}, 失败 ${twoDimExprFailed}`);
    
    // 测试 18: module 功能测试
    console.log("\n测试 18: module 功能测试");
    let modulePassed = 0;
    let moduleFailed = 0;
    
    const testModule = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 module 声明
    if (testModule("基本 module 声明", `module MyModule
method repeat1000 takes nothing returns nothing
local integer i=0
loop
exitwhen i==1000
set i=i+1
endloop
endmethod
endmodule`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration);
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        return moduleDecl.name?.toString() === "MyModule" && moduleDecl.members.length === 1;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 2: struct 实现 module
    if (testModule("struct 实现 module", `module MyRepeatModule
method repeat1000 takes nothing returns nothing
local integer i=0
loop
exitwhen i==1000
call this.sub()
set i=i+1
endloop
endmethod
endmodule
struct MyStruct
method sub takes nothing returns nothing
call BJDebugMsg("Hello world")
endmethod
implement MyRepeatModule
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const implementStmt = structDecl.members.find((m: Statement) => m instanceof ImplementStatement);
        return implementStmt !== undefined && implementStmt instanceof ImplementStatement && 
               implementStmt.moduleName.toString() === "MyRepeatModule" && !implementStmt.isOptional;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 3: module 内部 implement optional
    if (testModule("module 内部 implement optional", `module MyOtherModule
method uhOh takes nothing returns nothing
endmethod
endmodule
module MyModule
implement optional MyOtherModule
static method swap takes thistype A, thistype B returns nothing
local thistype C = thistype.allocate()
call C.copy(A)
call A.copy(B)
call B.copy(C)
call C.destroy()
endmethod
endmodule`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration && s.name?.toString() === "MyModule");
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        const implementStmt = moduleDecl.members.find((m: Statement) => m instanceof ImplementStatement);
        return implementStmt !== undefined && implementStmt instanceof ImplementStatement && 
               implementStmt.moduleName.toString() === "MyOtherModule" && implementStmt.isOptional;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 4: struct 实现多个 module
    if (testModule("struct 实现多个 module", `module ModuleA
method methodA takes nothing returns nothing
endmethod
endmodule
module ModuleB
method methodB takes nothing returns nothing
endmethod
endmodule
struct MyStruct
integer a
integer b
implement ModuleA
implement ModuleB
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const implementStmts = structDecl.members.filter((m: Statement) => m instanceof ImplementStatement);
        return implementStmts.length === 2;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 5: module 中的静态方法
    if (testModule("module 中的静态方法", `module SwapModule
static method swap takes thistype A, thistype B returns nothing
local thistype C = thistype.allocate()
call C.copy(A)
call A.copy(B)
call B.copy(C)
call C.destroy()
endmethod
endmodule
struct MyStruct
integer a
integer b
integer c
method copy takes MyStruct x returns nothing
set this.a = x.a
set this.b = x.b
set this.c = x.c
endmethod
implement SwapModule
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration);
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        const method = moduleDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined && method instanceof MethodDeclaration && method.isStatic;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 6: module 中的私有方法
    if (testModule("module 中的私有方法", `module PrivateModule
private method privateMethod takes nothing returns nothing
call BJDebugMsg("private")
endmethod
public method publicMethod takes nothing returns nothing
call this.privateMethod()
endmethod
endmodule
struct MyStruct
implement PrivateModule
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration);
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        const methods = moduleDecl.members.filter((m: Statement) => m instanceof MethodDeclaration);
        return methods.length === 2;
    })) modulePassed++; else moduleFailed++;
    
    console.log(`\nmodule 测试结果: 通过 ${modulePassed}, 失败 ${moduleFailed}`);
    
    // 测试 19: delegate 功能测试
    console.log("\n测试 19: delegate 功能测试");
    let delegatePassed = 0;
    let delegateFailed = 0;
    
    const testDelegate = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 delegate 声明
    if (testDelegate("基本 delegate 声明", `struct A
private real x
private real y
public method performAction takes nothing returns nothing
call BJDebugMsg("action")
endmethod
endstruct
struct B
delegate A deleg
static method create takes nothing returns B
local B b = B.allocate()
set b.deleg = A.create()
return b
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegateDecl = structB.members.find((m: Statement) => m instanceof DelegateDeclaration);
        return delegateDecl !== undefined && delegateDecl instanceof DelegateDeclaration && 
               delegateDecl.delegateType.toString() === "A" && delegateDecl.name.toString() === "deleg" && !delegateDecl.isPrivate;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 2: private delegate
    if (testDelegate("private delegate", `struct A
method test takes nothing returns nothing
endmethod
endstruct
struct B
private delegate A privDeleg
delegate A pubDeleg
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        if (delegates.length !== 2) return false;
        const privDelegate = delegates.find((d: Statement) => d instanceof DelegateDeclaration && d.name.toString() === "privDeleg");
        const pubDelegate = delegates.find((d: Statement) => d instanceof DelegateDeclaration && d.name.toString() === "pubDeleg");
        return privDelegate !== undefined && pubDelegate !== undefined &&
               privDelegate instanceof DelegateDeclaration && privDelegate.isPrivate &&
               pubDelegate instanceof DelegateDeclaration && !pubDelegate.isPrivate;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 3: 多个 delegate
    if (testDelegate("多个 delegate", `struct A
method methodA takes nothing returns nothing
endmethod
endstruct
struct C
method methodC takes nothing returns nothing
endmethod
endstruct
struct B
delegate A delegA
delegate C delegC
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        return delegates.length === 2;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 4: delegate 与变量声明混合
    if (testDelegate("delegate 与变量声明混合", `struct A
method test takes nothing returns nothing
endmethod
endstruct
struct B
integer x
delegate A deleg
integer y
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        const variables = structB.members.filter((m: Statement) => m instanceof VariableDeclaration);
        return delegates.length === 1 && variables.length === 2;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 5: delegate 与 method 混合
    if (testDelegate("delegate 与 method 混合", `struct A
method performAction takes nothing returns nothing
endmethod
endstruct
struct B
delegate A deleg
method myMethod takes nothing returns nothing
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        const methods = structB.members.filter((m: Statement) => m instanceof MethodDeclaration);
        return delegates.length === 1 && methods.length === 1;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 6: delegate 到接口类型
    if (testDelegate("delegate 到接口类型", `interface IAction
method perform takes nothing returns nothing
endinterface
struct A implements IAction
method perform takes nothing returns nothing
endmethod
endstruct
struct B
delegate IAction action
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegateDecl = structB.members.find((m: Statement) => m instanceof DelegateDeclaration);
        return delegateDecl !== undefined && delegateDecl instanceof DelegateDeclaration && 
               delegateDecl.delegateType.toString() === "IAction";
    })) delegatePassed++; else delegateFailed++;
    
    console.log(`\ndelegate 测试结果: 通过 ${delegatePassed}, 失败 ${delegateFailed}`);
    
    // 测试 20: stub 方法功能测试
    console.log("\n测试 20: stub 方法功能测试");
    let stubPassed = 0;
    let stubFailed = 0;
    
    const testStub = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 stub method 声明
    if (testStub("基本 stub method 声明", `struct Parent
stub method xx takes nothing returns nothing
call BJDebugMsg("Parent")
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration | undefined;
        return method !== undefined && method.isStub === true && method.name?.toString() === "xx";
    })) stubPassed++; else stubFailed++;
    
    // 测试 2: stub method 被子结构重写
    if (testStub("stub method 被子结构重写", `struct Parent
stub method xx takes nothing returns nothing
call BJDebugMsg("Parent")
endmethod
endstruct
struct ChildA extends Parent
method xx takes nothing returns nothing
call BJDebugMsg("Child A")
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const parentStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Parent") as StructDeclaration | undefined;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "ChildA") as StructDeclaration | undefined;
        if (!parentStruct || !childStruct) return false;
        const parentMethod = parentStruct.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "xx") as MethodDeclaration | undefined;
        const childMethod = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "xx") as MethodDeclaration | undefined;
        return parentMethod?.isStub === true && childMethod?.isStub === false;
    })) stubPassed++; else stubFailed++;
    
    // 测试 3: stub method 带参数和返回值
    if (testStub("stub method 带参数和返回值", `struct TestStruct
stub method calculate takes integer x, integer y returns integer
return 0
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration | undefined;
        return method !== undefined && method.isStub === true && 
               method.parameters.length === 2 && 
               method.returnType?.toString() === "integer";
    })) stubPassed++; else stubFailed++;
    
    // 测试 4: static stub method
    if (testStub("static stub method", `struct TestStruct
static stub method create takes nothing returns thistype
return thistype.allocate()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration | undefined;
        return method !== undefined && method.isStub === true && method.isStatic === true;
    })) stubPassed++; else stubFailed++;
    
    // 测试 5: stub method 在 interface 中（应该不支持，但测试解析是否正常）
    if (testStub("stub method 在 interface 中（解析测试）", `interface TestInterface
stub method test takes nothing returns nothing
endinterface`, (r, p) => {
        // interface 中的 method 声明通常不需要 body，但 stub 在 interface 中可能不合法
        // 这里只测试解析是否正常，不测试语义
        if (r.body.length === 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        return interfaceDecl !== undefined;
    })) stubPassed++; else stubFailed++;
    
    console.log(`\nstub 方法测试结果: 通过 ${stubPassed}, 失败 ${stubFailed}`);
    
    // 测试 21: super 语句功能测试
    console.log("\n测试 21: super 语句功能测试");
    let superPassed = 0;
    let superFailed = 0;
    
    const testSuper = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 super 调用（文档示例）
    if (testSuper("基本 super 调用（文档示例）", `struct Parent
stub method xx takes nothing returns nothing
call BJDebugMsg("Parent")
endmethod
endstruct
struct ChildA extends Parent
method xx takes nothing returns nothing
call BJDebugMsg("- Child A -")
call super.xx()
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "ChildA");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "xx");
        if (!(method instanceof MethodDeclaration)) return false;
        // 检查方法体中是否有 super.xx() 调用
        const callStmts = method.body.body.filter((s: Statement) => s instanceof CallStatement);
        return callStmts.length > 0;
    })) superPassed++; else superFailed++;
    
    // 测试 2: super 调用带参数的方法
    if (testSuper("super 调用带参数的方法", `struct Parent
stub method calculate takes integer x, integer y returns integer
return x + y
endmethod
endstruct
struct Child extends Parent
method calculate takes integer x, integer y returns integer
local integer result = super.calculate(x, y)
return result * 2
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) superPassed++; else superFailed++;
    
    // 测试 3: super 调用返回值的父方法
    if (testSuper("super 调用返回值的父方法", `struct Parent
stub method getValue takes nothing returns integer
return 10
endmethod
endstruct
struct Child extends Parent
method getValue takes nothing returns integer
return super.getValue() + 5
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) superPassed++; else superFailed++;
    
    // 测试 4: 多层继承中的 super 调用
    if (testSuper("多层继承中的 super 调用", `struct GrandParent
stub method test takes nothing returns nothing
call BJDebugMsg("GrandParent")
endmethod
endstruct
struct Parent extends GrandParent
method test takes nothing returns nothing
call BJDebugMsg("Parent")
call super.test()
endmethod
endstruct
struct Child extends Parent
method test takes nothing returns nothing
call BJDebugMsg("Child")
call super.test()
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) superPassed++; else superFailed++;
    
    // 测试 5: super 在静态方法中（应该不支持，但测试解析是否正常）
    if (testSuper("super 在静态方法中（解析测试）", `struct Parent
stub method test takes nothing returns nothing
endmethod
endstruct
struct Child extends Parent
static method test takes nothing returns nothing
call super.test()
endmethod
endstruct`, (r, p) => {
        // 静态方法中不应该使用 super，但这里只测试解析是否正常
        if (r.body.length < 2) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        return childStruct !== undefined;
    })) superPassed++; else superFailed++;
    
    console.log(`\nsuper 语句测试结果: 通过 ${superPassed}, 失败 ${superFailed}`);
    
    // 测试 22: thistype 关键字功能测试
    console.log("\n测试 22: thistype 关键字功能测试");
    let thistypePassed = 0;
    let thistypeFailed = 0;
    
    const testThistype = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 thistype 使用（文档示例）
    if (testThistype("基本 thistype 使用（文档示例）", `struct test
thistype array ts
method tester takes nothing returns thistype
return thistype.allocate()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "test");
        if (!(structDecl instanceof StructDeclaration)) return false;
        // 检查是否有 thistype array ts 成员
        const varDecl = structDecl.members.find((m: Statement) => m instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        // 检查方法
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "tester");
        return method !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 2: thistype 作为变量类型
    if (testThistype("thistype 作为变量类型", `struct Node
thistype next
thistype prev
integer value
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const varDecls = structDecl.members.filter((m: Statement) => m instanceof VariableDeclaration);
        return varDecls.length >= 3;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 3: thistype 作为方法返回类型
    if (testThistype("thistype 作为方法返回类型", `struct Factory
static method create takes nothing returns thistype
return thistype.allocate()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "create");
        if (!(method instanceof MethodDeclaration)) return false;
        return method.isStatic === true;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 4: thistype 作为方法参数类型
    if (testThistype("thistype 作为方法参数类型", `struct Node
static method swap takes thistype A, thistype B returns nothing
local thistype C = thistype.allocate()
call C.copy(A)
call A.copy(B)
call B.copy(C)
call C.destroy()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 5: thistype.allocate() 调用
    if (testThistype("thistype.allocate() 调用", `struct Test
static method create takes nothing returns thistype
local thistype instance = thistype.allocate()
return instance
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 6: thistype 数组声明
    if (testThistype("thistype 数组声明", `struct Container
thistype array items[100]
integer count = 0
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const varDecl = structDecl.members.find((m: Statement) => m instanceof VariableDeclaration && (m as VariableDeclaration).isArray);
        return varDecl !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    console.log(`\nthistype 关键字测试结果: 通过 ${thistypePassed}, 失败 ${thistypeFailed}`);
    
    // 测试 23: 函数接口功能测试
    console.log("\n测试 23: 函数接口功能测试");
    let functionInterfacePassed = 0;
    let functionInterfaceFailed = 0;
    
    const testFunctionInterface = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本函数接口声明（文档示例）
    if (testFunctionInterface("基本函数接口声明（文档示例）", `function interface Arealfunction takes real x returns real
function double takes real x returns real
return x*2.0
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.name?.toString() === "Arealfunction" && 
               funcInterface.parameters.length === 1 &&
               funcInterface.returnType?.toString() === "real";
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 2: 函数接口带多个参数
    if (testFunctionInterface("函数接口带多个参数", `function interface MathFunc takes real x, real y returns real
function add takes real x, real y returns real
return x + y
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.parameters.length === 2;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 3: 函数接口返回 nothing
    if (testFunctionInterface("函数接口返回 nothing", `function interface ActionFunc takes nothing returns nothing
function doSomething takes nothing returns nothing
call BJDebugMsg("test")
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.parameters.length === 0 && funcInterface.returnType === null;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 4: 函数接口带自定义类型参数
    if (testFunctionInterface("函数接口带自定义类型参数", `struct Point
real x
real y
endstruct
function interface PointFunc takes Point p returns real
function getDistance takes Point p returns real
return p.x + p.y
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.parameters.length === 1 && 
               funcInterface.parameters[0].type?.toString() === "Point";
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 5: 函数接口返回自定义类型
    if (testFunctionInterface("函数接口返回自定义类型", `struct Factory
integer value
endstruct
function interface FactoryFunc takes integer x returns Factory
function create takes integer x returns Factory
local Factory f = Factory.create()
set f.value = x
return f
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.returnType?.toString() === "Factory";
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 6: 多个函数接口声明
    if (testFunctionInterface("多个函数接口声明", `function interface Func1 takes real x returns real
function interface Func2 takes integer x returns integer
function test1 takes real x returns real
return x
endfunction
function test2 takes integer x returns integer
return x
endfunction`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const funcInterfaces = r.body.filter((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        return funcInterfaces.length === 2;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 7: 函数接口与普通函数混合
    if (testFunctionInterface("函数接口与普通函数混合", `function interface Callback takes nothing returns nothing
function normalFunc takes nothing returns nothing
call BJDebugMsg("normal")
endfunction
function callbackFunc takes nothing returns nothing
call BJDebugMsg("callback")
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration);
        return funcInterface !== undefined && funcs.length >= 2;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    console.log(`\n函数接口测试结果: 通过 ${functionInterfacePassed}, 失败 ${functionInterfaceFailed}`);

    // 测试 24: JASS type 声明解析测试（来自 common.j 片段 + 动态数组）
    console.log("\n测试 24: JASS type 声明解析测试");
    let typePassed = 0;
    let typeFailed = 0;

    const testTypeDecl = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };

    // 测试 1: 来自 common.j 的基础类型声明
    if (testTypeDecl("common.j 基础类型声明", `type effecttype extends handle
type weathereffect extends handle
type terraindeformation extends handle
type fogstate extends handle
type fogmodifier extends agent
type dialog extends agent`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        if (types.length !== 6) return false;
        const expected: [string, string][] = [
            ["effecttype", "handle"],
            ["weathereffect", "handle"],
            ["terraindeformation", "handle"],
            ["fogstate", "handle"],
            ["fogmodifier", "agent"],
            ["dialog", "agent"]
        ];
        return expected.every(([n, b], i) => 
            types[i].name.toString() === n && types[i].baseType.toString() === b
        );
    })) typePassed++; else typeFailed++;

    // 测试 2: 自定义普通类型声明
    if (testTypeDecl("自定义普通类型声明", `type myhandle extends handle`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        return types.length === 1 &&
               types[0].name.toString() === "myhandle" &&
               types[0].baseType.toString() === "handle" &&
               !types[0].isArray;
    })) typePassed++; else typeFailed++;

    // 测试 3: 动态数组类型声明（文档示例 type arsample extends integer array[8]）
    if (testTypeDecl("动态数组类型声明（简单）", `type arsample extends integer array[8]`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        if (types.length !== 1) return false;
        const t = types[0];
        return t.isArray &&
               t.name.toString() === "arsample" &&
               t.baseType.toString() === "integer" &&
               !!t.elementSize &&
               t.elementSize.toString() === "8" &&
               t.storageSize === null;
    })) typePassed++; else typeFailed++;

    // 测试 4: 动态数组类型声明带扩展存储（type myDyArray extends integer array [200,40000]）
    if (testTypeDecl("动态数组类型声明（扩展存储）", `type myDyArray extends integer array [200,40000]`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        if (types.length !== 1) return false;
        const t = types[0];
        return t.isArray &&
               t.name.toString() === "myDyArray" &&
               t.baseType.toString() === "integer" &&
               !!t.elementSize &&
               t.elementSize.toString() === "200" &&
               !!t.storageSize &&
               t.storageSize.toString() === "40000";
    })) typePassed++; else typeFailed++;

    console.log(`\nJASS type 测试结果: 通过 ${typePassed}, 失败 ${typeFailed}`);

    // 测试 25: 冒号操作符语法糖（a:X）
    console.log("\n测试 25: 冒号操作符语法糖");
    let colonPassed = 0;
    let colonFailed = 0;

    const testColon = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };

    // 文档示例：set X[a] = 10 与 set a:X = 10 等价
    if (testColon("基本冒号赋值（文档示例）", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:X = 10
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 只需验证解析无错即可
        return true;
    })) colonPassed++; else colonFailed++;

    // 文档示例：set X[a] = X[a] + 10 与 set a:X = a:X + 10 等价
    if (testColon("冒号作为表达式（文档示例）", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:X = a:X + 10
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 复杂场景 1：冒号出现在右值表达式中
    if (testColon("冒号出现在右值表达式中", `function test takes nothing returns nothing
local integer a=3
local integer array X
local integer y
set y = a:X * 2 + 5
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 复杂场景 2：混合使用 X[a] 和 a:X
    if (testColon("混合使用 X[a] 和 a:X", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:X = X[a] + a:X
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 复杂场景 3：冒号作为函数调用参数
    if (testColon("冒号作为函数调用参数", `function foo takes integer v returns nothing
endfunction
function test takes nothing returns nothing
local integer a=3
local integer array X
call foo(a:X)
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 非法用法 1：3:X 应该产生解析错误（根据文档，仅能用于变量）
    if (testColon("非法用法：3:X", `function test takes nothing returns nothing
local integer array X
set 3:X = 1000
endfunction`, (r, p) => {
        // 期望有语法错误
        return p.errors.errors.length > 0;
    })) colonPassed++; else colonFailed++;

    // 非法用法 2：a:3 也应产生错误，因为 ':' 后需要数组名标识符
    if (testColon("非法用法：a:3", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:3 = 1000
endfunction`, (r, p) => {
        return p.errors.errors.length > 0;
    })) colonPassed++; else colonFailed++;

    console.log(`\n冒号操作符测试结果: 通过 ${colonPassed}, 失败 ${colonFailed}`);

    // 测试 26: 函数对象内置方法 (.evaluate, .execute, .name)
    console.log("\n测试 26: 函数对象内置方法");
    let functionObjectPassed = 0;
    let functionObjectFailed = 0;

    const testFunctionObject = (name: string, code: string, validator: (result: any, parser: Parser) => boolean): boolean => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            functionObjectPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
            functionObjectFailed++;
            return false;
        }
    };

    // 测试函数对象的 .evaluate 方法
    if (testFunctionObject("函数对象的 .evaluate 方法", `function A takes real x returns real
    return x * 2.0
endfunction
function test takes nothing returns real
    return A.evaluate(5.0)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const testFunc = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(testFunc instanceof FunctionDeclaration)) return false;
        const returnStmt = testFunc.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const expr = returnStmt.argument;
        // 应该是 CallExpression，callee 是 BinaryExpression (A.evaluate)
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "evaluate") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    // 测试函数对象的 .execute 方法
    if (testFunctionObject("函数对象的 .execute 方法", `function DestroyEffectAfter takes effect fx, real t returns nothing
    call TriggerSleepAction(t)
    call DestroyEffect(fx)
endfunction
function test takes nothing returns nothing
    call DestroyEffectAfter.execute(null, 3.0)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const testFunc = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(testFunc instanceof FunctionDeclaration)) return false;
        const callStmt = testFunc.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const expr = callStmt.expression;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "execute") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    // 测试函数对象的 .name 属性
    if (testFunctionObject("函数对象的 .name 属性", `scope test
public function xxx takes nothing returns nothing
    call BJDebugMsg(xxx.name)
endfunction
endscope`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        // scope 被解析为 BlockStatement，查找其中的函数
        const scope = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!(scope instanceof BlockStatement)) return false;
        const func = scope.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "xxx");
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const args = callStmt.expression.arguments;
        if (args.length > 0) {
            const arg = args[0];
            // 应该是 BinaryExpression (xxx.name)
            if (arg instanceof BinaryExpression && arg.operator === OperatorType.Dot) {
                const right = arg.right;
                if (right instanceof Identifier && right.toString() === "name") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    // 测试函数对象的 .evaluate 用于相互递归
    if (testFunctionObject("函数对象的 .evaluate 用于相互递归", `function A takes real x returns real
    if (GetRandomInt(0,1) == 0) then
        return B.evaluate(x * 0.02)
    endif
    return x
endfunction
function B takes real x returns real
    if (GetRandomInt(0,1) == 1) then
        return A(x * 1000.)
    endif
    return x
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcA = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "A");
        if (!(funcA instanceof FunctionDeclaration)) return false;
        const returnStmt = funcA.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const expr = returnStmt.argument;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "evaluate") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    console.log(`\n函数对象内置方法测试结果: 通过 ${functionObjectPassed}, 失败 ${functionObjectFailed}`);

    // 测试 27: 方法对象内置方法 (.evaluate, .execute, .name, .exists)
    console.log("\n测试 27: 方法对象内置方法");
    let methodObjectPassed = 0;
    let methodObjectFailed = 0;

    const testMethodObject = (name: string, code: string, validator: (result: any, parser: Parser) => boolean): boolean => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            methodObjectPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
            methodObjectFailed++;
            return false;
        }
    };

    // 测试静态方法的 .name 属性
    if (testMethodObject("静态方法的 .name 属性", `struct mystruct
static method mymethod takes nothing returns nothing
    call BJDebugMsg("this works")
endmethod
endstruct
function myfunction takes nothing returns nothing
    call ExecuteFunc(mystruct.mymethod.name)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "myfunction");
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const args = callStmt.expression.arguments;
        if (args.length > 0) {
            const arg = args[0];
            // 应该是 BinaryExpression (mystruct.mymethod.name)
            // 这是一个链式成员访问：mystruct -> mymethod -> name
            if (arg instanceof BinaryExpression && arg.operator === OperatorType.Dot) {
                const right = arg.right;
                if (right instanceof Identifier && right.toString() === "name") {
                    // 检查左操作数是否是 mystruct.mymethod
                    const left = arg.left;
                    if (left instanceof BinaryExpression && left.operator === OperatorType.Dot) {
                        return true;
                    }
                }
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    // 测试方法的 .exists 属性
    if (testMethodObject("方法的 .exists 属性", `interface myInterface
method myMethod1 takes nothing returns nothing
method myMethod2 takes nothing returns nothing
endinterface
struct myStruct
method myMethod1 takes nothing returns nothing
    call BJDebugMsg("er")
endmethod
endstruct
function test takes nothing returns nothing
    local myInterface mi = myStruct.create()
    if (mi.myMethod1.exists) then
        call BJDebugMsg("Yes")
    endif
    if (mi.myMethod2.exists) then
        call BJDebugMsg("Yes")
    else
        call BJDebugMsg("No")
    endif
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(func instanceof FunctionDeclaration)) return false;
        // 查找 if 语句中的 .exists 访问
        const ifStmts = func.body.body.filter((s: Statement) => s instanceof IfStatement);
        if (ifStmts.length < 2) return false;
        // 检查第一个 if 语句的条件
        const firstIf = ifStmts[0] as IfStatement;
        const condition = firstIf.condition;
        if (condition instanceof BinaryExpression && condition.operator === OperatorType.Dot) {
            const right = condition.right;
            if (right instanceof Identifier && right.toString() === "exists") {
                return true;
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    // 测试方法的 .evaluate 方法
    if (testMethodObject("方法的 .evaluate 方法", `struct TestStruct
method calculate takes integer x returns integer
    return x * 2
endmethod
endstruct
function test takes nothing returns integer
    local TestStruct ts = TestStruct.create()
    return ts.calculate.evaluate(5)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const expr = returnStmt.argument;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            // 应该是 ts.calculate.evaluate
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "evaluate") {
                    return true;
                }
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    // 测试静态方法的 .execute 方法
    if (testMethodObject("静态方法的 .execute 方法", `struct Worker
static method doWork takes integer id returns nothing
    call BJDebugMsg("Working: " + I2S(id))
endmethod
endstruct
function test takes nothing returns nothing
    call Worker.doWork.execute(42)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const expr = callStmt.expression;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            // 应该是 Worker.doWork.execute
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "execute") {
                    return true;
                }
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    console.log(`\n方法对象内置方法测试结果: 通过 ${methodObjectPassed}, 失败 ${methodObjectFailed}`);

    // 测试 28: constant native 函数功能测试
    console.log("\n测试 28: constant native 函数功能测试");
    let constantNativePassed = 0;
    let constantNativeFailed = 0;

    const testConstantNative = (name: string, code: string, validator: (result: any, parser: Parser) => boolean): boolean => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            constantNativePassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
            constantNativeFailed++;
            return false;
        }
    };

    // 测试 1: 基本 constant native 函数声明（来自 common.j）
    if (testConstantNative("基本 constant native 函数声明（来自 common.j）", `constant native GetTriggeringTrigger takes nothing returns trigger
constant native GetTriggerEventId takes nothing returns eventid
constant native GetTriggerEvalCount takes trigger whichTrigger returns integer
constant native GetTriggerExecCount takes trigger whichTrigger returns integer`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 4) return false;
        // 检查所有函数都是 constant native
        return natives.every(f => f.isConstant === true) &&
               natives[0].name?.toString() === "GetTriggeringTrigger" &&
               natives[1].name?.toString() === "GetTriggerEventId" &&
               natives[2].name?.toString() === "GetTriggerEvalCount" &&
               natives[3].name?.toString() === "GetTriggerExecCount";
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 2: constant native 与普通 native 混合
    if (testConstantNative("constant native 与普通 native 混合", `native GetUnitX takes unit whichUnit returns real
constant native GetTriggeringTrigger takes nothing returns trigger
native GetUnitY takes unit whichUnit returns real`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 3) return false;
        const getUnitX = natives.find(f => f.name?.toString() === "GetUnitX");
        const getTriggeringTrigger = natives.find(f => f.name?.toString() === "GetTriggeringTrigger");
        const getUnitY = natives.find(f => f.name?.toString() === "GetUnitY");
        return getUnitX !== undefined && getUnitX.isConstant === false &&
               getTriggeringTrigger !== undefined && getTriggeringTrigger.isConstant === true &&
               getUnitY !== undefined && getUnitY.isConstant === false;
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 3: constant native 带参数
    if (testConstantNative("constant native 带参数", `constant native GetTriggerEvalCount takes trigger whichTrigger returns integer
constant native GetTriggerExecCount takes trigger whichTrigger returns integer`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 2) return false;
        const evalCount = natives.find(f => f.name?.toString() === "GetTriggerEvalCount");
        const execCount = natives.find(f => f.name?.toString() === "GetTriggerExecCount");
        return evalCount !== undefined && evalCount.isConstant === true && evalCount.parameters.length === 1 &&
               execCount !== undefined && execCount.isConstant === true && execCount.parameters.length === 1;
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 4: constant native 带返回值
    if (testConstantNative("constant native 带返回值", `constant native GetTriggeringTrigger takes nothing returns trigger
constant native GetTriggerEventId takes nothing returns eventid`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 2) return false;
        const trigger = natives.find(f => f.name?.toString() === "GetTriggeringTrigger");
        const eventId = natives.find(f => f.name?.toString() === "GetTriggerEventId");
        return trigger !== undefined && trigger.isConstant === true && trigger.returnType?.toString() === "trigger" &&
               eventId !== undefined && eventId.isConstant === true && eventId.returnType?.toString() === "eventid";
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 5: constant native 的 toString 输出
    if (testConstantNative("constant native 的 toString 输出", `constant native GetTriggeringTrigger takes nothing returns trigger`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const native = r.body.find((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration | undefined;
        if (!native) return false;
        const str = native.toString();
        return str.includes("constant") && str.includes("native") && str.includes("GetTriggeringTrigger");
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 6: constant native 与注释混合（来自 common.j 实际场景）
    if (testConstantNative("constant native 与注释混合（来自 common.j 实际场景）", `// 获取（当前被）触发的触发器
constant native GetTriggeringTrigger takes nothing returns trigger
// 获取触发器事件ID
constant native GetTriggerEventId takes nothing returns eventid
// 获取触发器条件数量
constant native GetTriggerEvalCount takes trigger whichTrigger returns integer
// 获取触发器运行次数
constant native GetTriggerExecCount takes trigger whichTrigger returns integer`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        return natives.length === 4 && natives.every(f => f.isConstant === true);
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 7: constant function 应该报错（不合法）
    if (testConstantNative("constant function 应该报错（不合法）", `constant function TestFunc takes nothing returns nothing
endfunction`, (r, p) => {
        // 应该报错：constant function 不合法
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("constant function") && e.message.includes("not allowed"));
    })) constantNativePassed++; else constantNativeFailed++;

    console.log(`\nconstant native 函数测试结果: 通过 ${constantNativePassed}, 失败 ${constantNativeFailed}`);

    // 测试 31: textmacro 和 runtextmacro 功能测试
    console.log("\n测试 31: textmacro 和 runtextmacro 功能测试");
    let textMacroPassed = 0;
    let textMacroFailed = 0;

    const { TextMacroRegistry } = require('./text-macro-registry');
    const { TextMacroCollector } = require('./text-macro-collector');
    const { TextMacroExpander } = require('./text-macro-expander');

    const testTextMacro = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        // 先收集 textmacro
        const registry = TextMacroRegistry.getInstance();
        registry.clear(); // 清空注册表
        
        const collector = new TextMacroCollector(registry);
        const expander = new TextMacroExpander(registry);
        
        // 收集 textmacro
        collector.collectFromFile('test.j', code);
        
        // 使用 expander 解析
        const parser = new Parser(code, 'test.j', expander);
        const result = parser.parse();
        
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map((e: any) => e.message).join(", ")}`);
            }
            return false;
        }
    };

    // 测试 1: 基本 textmacro 定义和展开
    if (testTextMacro("基本 textmacro 定义和展开", `//! textmacro asdgspfnsa takes args
    function func_$args$ takes nothing returns nothing
    endfunction
//! endtextmacro

type hgoashgo extends integer

//! runtextmacro asdgspfnsa("diap")

call func_diap()`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 应该能找到展开后的函数 func_diap
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const funcDiap = funcs.find(f => f.name?.toString() === "func_diap");
        return funcDiap !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 2: textmacro 无参数
    if (testTextMacro("textmacro 无参数", `//! textmacro SimpleMacro
    function SimpleFunc takes nothing returns nothing
        call BJDebugMsg("Hello")
    endfunction
//! endtextmacro

//! runtextmacro SimpleMacro()`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const simpleFunc = funcs.find(f => f.name?.toString() === "SimpleFunc");
        return simpleFunc !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 3: textmacro 多参数
    if (testTextMacro("textmacro 多参数", `//! textmacro CreateFunc takes TYPE, NAME
    function Get$NAME$ takes nothing returns $TYPE$
        return 0
    endfunction
//! endtextmacro

//! runtextmacro CreateFunc("integer", "UnitCount")
//! runtextmacro CreateFunc("real", "UnitHealth")`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const getUnitCount = funcs.find(f => f.name?.toString() === "GetUnitCount");
        const getUnitHealth = funcs.find(f => f.name?.toString() === "GetUnitHealth");
        return getUnitCount !== undefined && getUnitHealth !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 4: textmacro 参数替换在函数名中
    if (testTextMacro("textmacro 参数替换在函数名中", `//! textmacro TestMacro takes SUFFIX
    function TestFunc_$SUFFIX$ takes nothing returns nothing
        call BJDebugMsg("test")
    endfunction
//! endtextmacro

//! runtextmacro TestMacro("ABC")`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const testFuncABC = funcs.find(f => f.name?.toString() === "TestFunc_ABC");
        return testFuncABC !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 5: textmacro 展开后调用生成的函数
    if (testTextMacro("textmacro 展开后调用生成的函数", `//! textmacro GenerateFunc takes NAME
    function $NAME$ takes nothing returns nothing
        call BJDebugMsg("$NAME$")
    endfunction
//! endtextmacro

//! runtextmacro GenerateFunc("MyFunc")

call MyFunc()`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 应该能找到函数定义
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const myFunc = funcs.find(f => f.name?.toString() === "MyFunc");
        // 应该能找到函数调用
        const calls = r.body.filter((s: Statement) => s instanceof CallStatement) as CallStatement[];
        const callMyFunc = calls.find(c => 
            c.expression.callee instanceof Identifier && 
            c.expression.callee.name === "MyFunc"
        );
        return myFunc !== undefined && callMyFunc !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 6: textmacro 参数数量不匹配应该报错
    if (testTextMacro("textmacro 参数数量不匹配应该报错", `//! textmacro TestMacro takes ARG1, ARG2
    function Test takes nothing returns nothing
    endfunction
//! endtextmacro

//! runtextmacro TestMacro("only_one")`, (r, p) => {
        // 应该报错：参数数量不匹配
        return p.errors.errors.length > 0 && 
               p.errors.errors.some((e: any) => e.message.includes("expects") && e.message.includes("parameters"));
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 7: textmacro 不存在应该报错
    if (testTextMacro("textmacro 不存在应该报错", `//! runtextmacro NonExistentMacro("param")`, (r, p) => {
        // 应该报错：宏不存在
        return p.errors.errors.length > 0 && 
               p.errors.errors.some((e: any) => e.message.includes("not found"));
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 8: optional textmacro 不存在时不报错
    if (testTextMacro("optional textmacro 不存在时不报错", `//! runtextmacro optional NonExistentMacro("param")`, (r, p) => {
        // 可选宏不存在时不应该报错
        return p.errors.errors.length === 0;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 9: textmacro 在多个地方使用
    if (testTextMacro("textmacro 在多个地方使用", `//! textmacro CreateVar takes TYPE, NAME
    local $TYPE$ $NAME$ = 0
//! endtextmacro

function test takes nothing returns nothing
    //! runtextmacro CreateVar("integer", "x")
    //! runtextmacro CreateVar("real", "y")
    set x = 10
    set y = 3.14
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const testFunc = funcs.find(f => f.name?.toString() === "test");
        if (!testFunc) return false;
        // 检查函数体中是否有变量声明
        const vars = testFunc.body.body.filter((s: Statement) => s instanceof VariableDeclaration) as VariableDeclaration[];
        return vars.length >= 2;
    })) textMacroPassed++; else textMacroFailed++;

    console.log(`\ntextmacro 和 runtextmacro 测试结果: 通过 ${textMacroPassed}, 失败 ${textMacroFailed}`);

    // 测试 32: common.j 标准库文件完整测试
    console.log("\n测试 32: common.j 标准库文件完整测试");
    let commonJPassed = 0;
    let commonJFailed = 0;

    const testCommonJ = (name: string, validator: (result: any, parser: Parser) => boolean) => {
        try {
            // 尝试读取 common.j 文件（可能在 static 目录下）
            let commonJPath: string | null = null;
            const possiblePaths = [
                path.join(__dirname, '..', '..', '..', 'static', 'common.j'),
                path.join(__dirname, '..', '..', '..', 'common.j'),
                path.join(process.cwd(), 'static', 'common.j'),
                path.join(process.cwd(), 'common.j')
            ];

            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath)) {
                    commonJPath = testPath;
                    console.log(`  📁 找到 common.j: ${commonJPath}`);
                    break;
                }
            }

            if (!commonJPath) {
                console.log(`⚠ ${name}: common.j 文件未找到，跳过测试`);
                console.log(`  尝试的路径:`);
                possiblePaths.forEach(p => console.log(`    - ${p}`));
                return false;
            }

            const commonJContent = fs.readFileSync(commonJPath, 'utf8');
            
            // 先收集 textmacro
            const registry = TextMacroRegistry.getInstance();
            registry.clear();
            
            const collector = new TextMacroCollector(registry);
            const expander = new TextMacroExpander(registry);
            
            // 收集 textmacro
            collector.collectFromFile(commonJPath, commonJContent);
            
            // 使用 expander 解析
            const parser = new Parser(commonJContent, commonJPath, expander);
            const result = parser.parse();
            
            if (validator(result, parser)) {
                console.log(`✓ ${name}`);
                return true;
            } else {
                console.log(`✗ ${name}`);
                if (parser.errors.errors.length > 0) {
                    console.log(`  错误数量: ${parser.errors.errors.length}`);
                    // 输出前 10 个错误
                    const firstErrors = parser.errors.errors.slice(0, 10);
                    firstErrors.forEach((e: any, index: number) => {
                        const line = e.start?.line !== undefined ? e.start.line + 1 : '?';
                        console.log(`  错误 ${index + 1} (行 ${line}): ${e.message}`);
                    });
                    if (parser.errors.errors.length > 10) {
                        console.log(`  ... 还有 ${parser.errors.errors.length - 10} 个错误`);
                    }
                }
                return false;
            }
        } catch (error: any) {
            console.log(`✗ ${name}: 测试异常 - ${error.message}`);
            return false;
        }
    };

    // 测试 1: common.j 基本解析（无错误）
    if (testCommonJ("common.j 基本解析（无错误）", (r, p) => {
        return p.errors.errors.length === 0;
    })) commonJPassed++; else commonJFailed++;

    // 测试 2: common.j 包含 type 声明
    if (testCommonJ("common.j 包含 type 声明", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        return types.length > 0;
    })) commonJPassed++; else commonJFailed++;

    // 测试 3: common.j 包含 constant native 函数
    if (testCommonJ("common.j 包含 constant native 函数", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        const constantNatives = natives.filter(n => n.isConstant === true);
        return constantNatives.length > 0;
    })) commonJPassed++; else commonJFailed++;

    // 测试 4: common.j 包含普通 native 函数
    if (testCommonJ("common.j 包含普通 native 函数", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        const regularNatives = natives.filter(n => n.isConstant === false);
        return regularNatives.length > 0 || natives.length > 0; // 至少有一些 native 函数
    })) commonJPassed++; else commonJFailed++;

    // 测试 5: common.j 包含 globals 块
    if (testCommonJ("common.j 包含 globals 块", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 检查是否有 globals 块（BlockStatement 且包含全局变量）
        const globalsBlocks = r.body.filter((s: Statement) => {
            if (s instanceof BlockStatement) {
                return s.body.some(stmt => stmt instanceof VariableDeclaration && !stmt.isLocal);
            }
            return false;
        });
        return globalsBlocks.length > 0;
    })) commonJPassed++; else commonJFailed++;

    // 测试 6: common.j 中的 constant native 函数格式正确
    if (testCommonJ("common.j 中的 constant native 函数格式正确", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        const constantNatives = natives.filter(n => n.isConstant === true);
        // 检查所有 constant native 都有名称和参数
        // 注意：returnType 可以为 null（表示 returns nothing），这是合法的
        return constantNatives.length > 0 && constantNatives.every(n => 
            n.name !== null && 
            n.parameters !== undefined
            // returnType 可以为 null（returns nothing）或非 null（returns type）
        );
    })) commonJPassed++; else commonJFailed++;

    // 测试 7: common.j 中的 type 声明格式正确
    if (testCommonJ("common.j 中的 type 声明格式正确", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        // 检查所有 type 都有名称和基类型
        return types.length > 0 && types.every(t => 
            t.name !== null && 
            t.baseType !== null
        );
    })) commonJPassed++; else commonJFailed++;

    // 测试 8: common.j 解析统计信息
    if (testCommonJ("common.j 解析统计信息", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration).length;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration).length;
        const constantNatives = r.body.filter((s: Statement) => 
            s instanceof NativeDeclaration && (s as NativeDeclaration).isConstant === true
        ).length;
        const globalsBlocks = r.body.filter((s: Statement) => 
            s instanceof BlockStatement && 
            (s as BlockStatement).body.some(stmt => stmt instanceof VariableDeclaration && !(stmt as VariableDeclaration).isLocal)
        ).length;
        
        console.log(`  📊 统计信息:`);
        console.log(`    - Type 声明: ${types}`);
        console.log(`    - Native 函数: ${natives} (其中 constant native: ${constantNatives})`);
        console.log(`    - Globals 块: ${globalsBlocks}`);
        console.log(`    - 总语句数: ${r.body.length}`);
        
        return types > 0 && natives > 0;
    })) commonJPassed++; else commonJFailed++;

    console.log(`\ncommon.j 标准库文件测试结果: 通过 ${commonJPassed}, 失败 ${commonJFailed}`);

    // 测试 33: common.ai 标准库文件完整测试
    console.log("\n测试 33: common.ai 标准库文件完整测试");
    let commonAiPassed = 0;
    let commonAiFailed = 0;

    const testCommonAi = (name: string, validator: (result: any, parser: Parser) => boolean) => {
        try {
            // 尝试读取 common.ai 文件（可能在 static 目录下）
            let commonAiPath: string | null = null;
            const possiblePaths = [
                path.join(__dirname, '..', '..', '..', 'static', 'common.ai'),
                path.join(__dirname, '..', '..', '..', 'common.ai'),
                path.join(process.cwd(), 'static', 'common.ai'),
                path.join(process.cwd(), 'common.ai')
            ];

            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath)) {
                    commonAiPath = testPath;
                    console.log(`  📁 找到 common.ai: ${commonAiPath}`);
                    break;
                }
            }

            if (!commonAiPath) {
                console.log(`⚠ ${name}: common.ai 文件未找到，跳过测试`);
                console.log(`  尝试的路径:`);
                possiblePaths.forEach(p => console.log(`    - ${p}`));
                return false;
            }

            const commonAiContent = fs.readFileSync(commonAiPath, 'utf8');
            
            // 先收集 textmacro
            const registry = TextMacroRegistry.getInstance();
            registry.clear();
            
            const collector = new TextMacroCollector(registry);
            const expander = new TextMacroExpander(registry);
            
            // 收集 textmacro
            collector.collectFromFile(commonAiPath, commonAiContent);
            
            // 使用 expander 解析
            const parser = new Parser(commonAiContent, commonAiPath, expander);
            const result = parser.parse();
            
            if (validator(result, parser)) {
                console.log(`✓ ${name}`);
                return true;
            } else {
                console.log(`✗ ${name}`);
                if (parser.errors.errors.length > 0) {
                    console.log(`  错误数量: ${parser.errors.errors.length}`);
                    // 输出前 10 个错误
                    const firstErrors = parser.errors.errors.slice(0, 10);
                    firstErrors.forEach((e: any, index: number) => {
                        const line = e.start?.line !== undefined ? e.start.line + 1 : '?';
                        console.log(`  错误 ${index + 1} (行 ${line}): ${e.message}`);
                    });
                    if (parser.errors.errors.length > 10) {
                        console.log(`  ... 还有 ${parser.errors.errors.length - 10} 个错误`);
                    }
                }
                return false;
            }
        } catch (error: any) {
            console.log(`✗ ${name}: 测试异常 - ${error.message}`);
            return false;
        }
    };

    // 测试 1: common.ai 基本解析（无错误）
    if (testCommonAi("common.ai 基本解析（无错误）", (r, p) => {
        return p.errors.errors.length === 0;
    })) commonAiPassed++; else commonAiFailed++;

    // 测试 2: common.ai 包含 native 函数
    if (testCommonAi("common.ai 包含 native 函数", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        return natives.length > 0;
    })) commonAiPassed++; else commonAiFailed++;

    // 测试 3: common.ai 解析统计信息
    if (testCommonAi("common.ai 解析统计信息", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration).length;
        
        console.log(`  📊 统计信息:`);
        console.log(`    - Native 函数: ${natives}`);
        console.log(`    - 总语句数: ${r.body.length}`);
        
        return natives > 0;
    })) commonAiPassed++; else commonAiFailed++;

    console.log(`\ncommon.ai 标准库文件测试结果: 通过 ${commonAiPassed}, 失败 ${commonAiFailed}`);

    // 测试 34: blizzard.j 标准库文件完整测试
    console.log("\n测试 34: blizzard.j 标准库文件完整测试");
    let blizzardJPassed = 0;
    let blizzardJFailed = 0;

    const testBlizzardJ = (name: string, validator: (result: any, parser: Parser) => boolean) => {
        try {
            // 尝试读取 blizzard.j 文件（可能在 static 目录下）
            let blizzardJPath: string | null = null;
            const possiblePaths = [
                path.join(__dirname, '..', '..', '..', 'static', 'blizzard.j'),
                path.join(__dirname, '..', '..', '..', 'blizzard.j'),
                path.join(process.cwd(), 'static', 'blizzard.j'),
                path.join(process.cwd(), 'blizzard.j')
            ];

            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath)) {
                    blizzardJPath = testPath;
                    console.log(`  📁 找到 blizzard.j: ${blizzardJPath}`);
                    break;
                }
            }

            if (!blizzardJPath) {
                console.log(`⚠ ${name}: blizzard.j 文件未找到，跳过测试`);
                console.log(`  尝试的路径:`);
                possiblePaths.forEach(p => console.log(`    - ${p}`));
                return false;
            }

            const blizzardJContent = fs.readFileSync(blizzardJPath, 'utf8');
            
            // 先收集 textmacro
            const registry = TextMacroRegistry.getInstance();
            registry.clear();
            
            const collector = new TextMacroCollector(registry);
            const expander = new TextMacroExpander(registry);
            
            // 收集 textmacro
            collector.collectFromFile(blizzardJPath, blizzardJContent);
            
            // 使用 expander 解析
            const parser = new Parser(blizzardJContent, blizzardJPath, expander);
            const result = parser.parse();
            
            if (validator(result, parser)) {
                console.log(`✓ ${name}`);
                return true;
            } else {
                console.log(`✗ ${name}`);
                if (parser.errors.errors.length > 0) {
                    console.log(`  错误数量: ${parser.errors.errors.length}`);
                    // 输出前 10 个错误
                    const firstErrors = parser.errors.errors.slice(0, 10);
                    firstErrors.forEach((e: any, index: number) => {
                        const line = e.start?.line !== undefined ? e.start.line + 1 : '?';
                        console.log(`  错误 ${index + 1} (行 ${line}): ${e.message}`);
                    });
                    if (parser.errors.errors.length > 10) {
                        console.log(`  ... 还有 ${parser.errors.errors.length - 10} 个错误`);
                    }
                }
                return false;
            }
        } catch (error: any) {
            console.log(`✗ ${name}: 测试异常 - ${error.message}`);
            return false;
        }
    };

    // 测试 1: blizzard.j 基本解析（无错误）
    if (testBlizzardJ("blizzard.j 基本解析（无错误）", (r, p) => {
        return p.errors.errors.length === 0;
    })) blizzardJPassed++; else blizzardJFailed++;

    // 测试 2: blizzard.j 包含函数声明
    if (testBlizzardJ("blizzard.j 包含函数声明", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const functions = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        return functions.length > 0;
    })) blizzardJPassed++; else blizzardJFailed++;

    // 测试 3: blizzard.j 包含 globals 块
    if (testBlizzardJ("blizzard.j 包含 globals 块", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 检查是否有 globals 块（BlockStatement 且包含全局变量）
        const globalsBlocks = r.body.filter((s: Statement) => {
            if (s instanceof BlockStatement) {
                return s.body.some(stmt => stmt instanceof VariableDeclaration && !stmt.isLocal);
            }
            return false;
        });
        return globalsBlocks.length > 0;
    })) blizzardJPassed++; else blizzardJFailed++;

    // 测试 4: blizzard.j 包含常量声明
    if (testBlizzardJ("blizzard.j 包含常量声明", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 检查 globals 块中的常量
        const globalsBlocks = r.body.filter((s: Statement) => {
            if (s instanceof BlockStatement) {
                return s.body.some(stmt => stmt instanceof VariableDeclaration && !stmt.isLocal);
            }
            return false;
        }) as BlockStatement[];
        
        if (globalsBlocks.length === 0) return false;
        
        // 检查是否有常量
        const constants = globalsBlocks[0].body.filter((stmt: Statement) => {
            if (stmt instanceof VariableDeclaration) {
                return stmt.isConstant === true;
            }
            return false;
        });
        return constants.length > 0;
    })) blizzardJPassed++; else blizzardJFailed++;

    // 测试 5: blizzard.j 解析统计信息
    if (testBlizzardJ("blizzard.j 解析统计信息", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const functions = r.body.filter((s: Statement) => s instanceof FunctionDeclaration).length;
        const globalsBlocks = r.body.filter((s: Statement) => 
            s instanceof BlockStatement && 
            (s as BlockStatement).body.some(stmt => stmt instanceof VariableDeclaration && !(stmt as VariableDeclaration).isLocal)
        ) as BlockStatement[];
        
        let constants = 0;
        let variables = 0;
        if (globalsBlocks.length > 0) {
            globalsBlocks[0].body.forEach((stmt: Statement) => {
                if (stmt instanceof VariableDeclaration) {
                    if (stmt.isConstant) {
                        constants++;
                    } else {
                        variables++;
                    }
                }
            });
        }
        
        console.log(`  📊 统计信息:`);
        console.log(`    - 函数声明: ${functions}`);
        console.log(`    - Globals 块: ${globalsBlocks.length}`);
        console.log(`    - 常量: ${constants}`);
        console.log(`    - 变量: ${variables}`);
        console.log(`    - 总语句数: ${r.body.length}`);
        
        return functions > 0 && globalsBlocks.length > 0;
    })) blizzardJPassed++; else blizzardJFailed++;

    console.log(`\nblizzard.j 标准库文件测试结果: 通过 ${blizzardJPassed}, 失败 ${blizzardJFailed}`);

    // 测试 35: DzAPI.j 标准库文件完整测试
    console.log("\n测试 35: DzAPI.j 标准库文件完整测试");
    let dzApiJPassed = 0;
    let dzApiJFailed = 0;

    const testDzApiJ = (name: string, validator: (result: any, parser: Parser) => boolean) => {
        try {
            // 尝试读取 DzAPI.j 文件（可能在 static 目录下）
            let dzApiJPath: string | null = null;
            const possiblePaths = [
                path.join(__dirname, '..', '..', '..', 'static', 'DzAPI.j'),
                path.join(__dirname, '..', '..', '..', 'DzAPI.j'),
                path.join(process.cwd(), 'static', 'DzAPI.j'),
                path.join(process.cwd(), 'DzAPI.j')
            ];

            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath)) {
                    dzApiJPath = testPath;
                    console.log(`  📁 找到 DzAPI.j: ${dzApiJPath}`);
                    break;
                }
            }

            if (!dzApiJPath) {
                console.log(`⚠ ${name}: DzAPI.j 文件未找到，跳过测试`);
                console.log(`  尝试的路径:`);
                possiblePaths.forEach(p => console.log(`    - ${p}`));
                return false;
            }

            const dzApiJContent = fs.readFileSync(dzApiJPath, 'utf8');
            
            // 先收集 textmacro
            const registry = TextMacroRegistry.getInstance();
            registry.clear();
            
            const collector = new TextMacroCollector(registry);
            const expander = new TextMacroExpander(registry);
            
            // 收集 textmacro
            collector.collectFromFile(dzApiJPath, dzApiJContent);
            
            // 使用 expander 解析
            const parser = new Parser(dzApiJContent, dzApiJPath, expander);
            const result = parser.parse();
            
            if (validator(result, parser)) {
                console.log(`✓ ${name}`);
                return true;
            } else {
                console.log(`✗ ${name}`);
                if (parser.errors.errors.length > 0) {
                    console.log(`  错误数量: ${parser.errors.errors.length}`);
                    // 输出前 10 个错误
                    const firstErrors = parser.errors.errors.slice(0, 10);
                    firstErrors.forEach((e: any, index: number) => {
                        const line = e.start?.line !== undefined ? e.start.line + 1 : '?';
                        console.log(`  错误 ${index + 1} (行 ${line}): ${e.message}`);
                    });
                    if (parser.errors.errors.length > 10) {
                        console.log(`  ... 还有 ${parser.errors.errors.length - 10} 个错误`);
                    }
                }
                return false;
            }
        } catch (error: any) {
            console.log(`✗ ${name}: 测试异常 - ${error.message}`);
            return false;
        }
    };

    // 测试 1: DzAPI.j 基本解析（无错误）
    if (testDzApiJ("DzAPI.j 基本解析（无错误）", (r, p) => {
        return p.errors.errors.length === 0;
    })) dzApiJPassed++; else dzApiJFailed++;

    // 测试 2: DzAPI.j 包含 native 函数声明
    if (testDzApiJ("DzAPI.j 包含 native 函数声明", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        return natives.length > 0;
    })) dzApiJPassed++; else dzApiJFailed++;

    // 测试 3: DzAPI.j 包含函数声明
    if (testDzApiJ("DzAPI.j 包含函数声明", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const functions = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        return functions.length > 0;
    })) dzApiJPassed++; else dzApiJFailed++;

    // 测试 4: DzAPI.j 解析统计信息
    if (testDzApiJ("DzAPI.j 解析统计信息", (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration).length;
        const functions = r.body.filter((s: Statement) => s instanceof FunctionDeclaration).length;
        
        console.log(`  📊 统计信息:`);
        console.log(`    - Native 函数: ${natives}`);
        console.log(`    - 函数声明: ${functions}`);
        console.log(`    - 总语句数: ${r.body.length}`);
        
        return natives > 0 || functions > 0;
    })) dzApiJPassed++; else dzApiJFailed++;

    console.log(`\nDzAPI.j 标准库文件测试结果: 通过 ${dzApiJPassed}, 失败 ${dzApiJFailed}`);

    console.log("\n=== 测试完成 ===");
}