/**
 * Inner Zinc 解析器测试
 * 测试 inner-zinc-parser 的各种功能
 */

import { InnerZincParser } from "./inner-zinc-parser";
import {
    ZincLibraryDeclaration,
    ZincFunctionDeclaration,
    ZincVariableDeclaration,
    ZincStructDeclaration,
    ZincMethodDeclaration,
    ZincIfStatement,
    ZincWhileStatement,
    ZincForStatement,
    ZincForRange,
    ZincBlock,
    ZincAssignmentStatement,
    ZincCallStatement,
    ZincBreakStatement,
    ZincReturnStatement,
    ZincStatement
} from "./zinc-ast";

// 测试代码
if (typeof require !== 'undefined' && require.main === module) {
    console.log("=== Inner Zinc Parser 测试 ===\n");
    
    let passed = 0;
    let failed = 0;
    
    const test = (name: string, code: string, validator: (result: ZincStatement[], parser: InnerZincParser) => boolean) => {
        try {
            const parser = new InnerZincParser(code);
            const result = parser.parse();
            if (validator(result, parser)) {
                console.log(`✓ ${name}`);
                passed++;
                return true;
            } else {
                console.log(`✗ ${name}`);
                // 调试信息
                if (name.includes("function 带返回类型")) {
                    if (result.length > 0) {
                        const lib = result[0] as ZincLibraryDeclaration;
                        if (lib.body) {
                            const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
                            if (func) {
                                console.log(`  函数名: ${func.name?.name}, 返回类型: ${func.returnType?.name || "null"}`);
                            } else {
                                console.log(`  未找到函数，语句类型: ${lib.body.statements.map(s => s.constructor.name).join(", ")}`);
                            }
                        }
                    }
                }
                failed++;
                return false;
            }
        } catch (error: any) {
            console.log(`✗ ${name}: 测试异常 - ${error.message}`);
            console.error(error);
            failed++;
            return false;
        }
    };
    
    // 测试 1: 简单的 library 声明（顶层只能是 library）
    test("简单的 library 声明", `
library MyLibrary {
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0];
        if (!(lib instanceof ZincLibraryDeclaration)) return false;
        if (lib.name?.name !== "MyLibrary") return false;
        return true;
    });
    
    // 测试 2: library 带 requires（顶层只能是 library）
    test("library 带 requires", `
library MyLibrary requires Library1, Library2 {
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!(lib instanceof ZincLibraryDeclaration)) return false;
        if (lib.requirements.length !== 2) return false;
        if (lib.requirements[0].name !== "Library1") return false;
        if (lib.requirements[1].name !== "Library2") return false;
        return true;
    });
    
    // 测试 3: library 内部只能是 struct、function 或变量（function 声明）
    test("library 内部 - function 声明", `
library Test {
    function myFunction() {
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration);
        if (!(func instanceof ZincFunctionDeclaration)) return false;
        if (func.name?.name !== "myFunction") return false;
        return true;
    });
    
    // 测试 4: library 内部 - function 带返回类型
    test("library 内部 - function 带返回类型", `
library Test {
    function getValue() -> integer {
        return 42;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func) return false;
        if (func.returnType?.name !== "integer") return false;
        return true;
    });
    
    // 测试 5: library 内部 - struct 声明
    test("library 内部 - struct 声明", `
library Test {
    struct MyStruct {
        integer value;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const struct = lib.body.statements.find(s => s instanceof ZincStructDeclaration) as ZincStructDeclaration;
        if (!struct) return false;
        if (struct.name?.name !== "MyStruct") return false;
        if (struct.members.length !== 1) return false;
        return true;
    });
    
    // 测试 6: struct 内部只能是成员或 method - method 声明
    test("struct 内部 - method 声明", `
library Test {
    struct MyStruct {
        method getName() -> string {
            return "test";
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const struct = lib.body.statements.find(s => s instanceof ZincStructDeclaration) as ZincStructDeclaration;
        if (!struct) return false;
        const method = struct.members.find(m => m instanceof ZincMethodDeclaration) as ZincMethodDeclaration;
        if (!method) return false;
        if (method.name?.name !== "getName") return false;
        return true;
    });
    
    // 测试 7: struct 内部 - 成员变量声明
    test("struct 内部 - 成员变量声明", `
library Test {
    struct MyStruct {
        integer value;
        string name;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const struct = lib.body.statements.find(s => s instanceof ZincStructDeclaration) as ZincStructDeclaration;
        if (!struct) return false;
        const vars = struct.members.filter(m => m instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        if (vars.length !== 2) return false;
        return true;
    });
    
    // 测试 8: library 内部 - 变量声明（成员变量）
    test("library 内部 - 变量声明（成员变量）", `
library Test {
    integer globalVar = 10;
    constant integer MAX = 100;
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const vars = lib.body.statements.filter(s => s instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        if (vars.length < 2) return false;
        const var1 = vars.find(v => v.name?.name === "globalVar");
        const var2 = vars.find(v => v.name?.name === "MAX");
        if (!var1 || !var2) return false;
        if (!var2.isConstant) return false;
        return true;
    });
    
    // 测试 9: function 内部 - 变量声明
    test("function 内部 - 变量声明", `
library Test {
    function test() {
        integer x = 1;
        string name = "test";
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const vars = func.body.statements.filter(s => s instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        if (vars.length !== 2) return false;
        return true;
    });
    
    // 测试 10: function 内部 - if 语句
    test("function 内部 - if 语句", `
library Test {
    function test() {
        if (true) {
            integer x = 1;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const ifStmt = func.body.statements.find(s => s instanceof ZincIfStatement) as ZincIfStatement;
        if (!ifStmt) return false;
        return true;
    });
    
    // 测试 11: function 内部 - if-else 语句
    test("function 内部 - if-else 语句", `
library Test {
    function test() {
        if (true) {
            integer x = 1;
        } else {
            integer x = 2;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const ifStmt = func.body.statements.find(s => s instanceof ZincIfStatement) as ZincIfStatement;
        if (!ifStmt) return false;
        if (!ifStmt.elseBlock) return false;
        return true;
    });
    
    // 测试 12: function 内部 - if-else if-else 语句
    test("function 内部 - if-else if-else 语句", `
library Test {
    function test() {
        if (x == 1) {
            integer a = 1;
        } else if (x == 2) {
            integer a = 2;
        } else {
            integer a = 3;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const ifStmt = func.body.statements.find(s => s instanceof ZincIfStatement) as ZincIfStatement;
        if (!ifStmt) return false;
        if (!ifStmt.elseBlock) return false;
        return true;
    });
    
    // 测试 13: function 内部 - while 语句
    test("function 内部 - while 语句", `
library Test {
    function test() {
        while (i < 10) {
            i = i + 1;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const whileStmt = func.body.statements.find(s => s instanceof ZincWhileStatement) as ZincWhileStatement;
        if (!whileStmt) return false;
        return true;
    });
    
    // 测试 14: function 内部 - for 范围语法
    test("function 内部 - for 范围语法", `
library Test {
    function test() {
        for (0 < i <= 10) {
            integer x = i;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const forStmt = func.body.statements.find(s => s instanceof ZincForStatement) as ZincForStatement;
        if (!forStmt) return false;
        if (!forStmt.range) return false;
        if (forStmt.range.variable?.name !== "i") return false;
        return true;
    });
    
    // 测试 15: function 内部 - for C 风格语法
    test("function 内部 - for C 风格语法", `
library Test {
    function test() {
        for (i = 0; i < 10; i = i + 1) {
            integer x = i;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const forStmt = func.body.statements.find(s => s instanceof ZincForStatement) as ZincForStatement;
        if (!forStmt) return false;
        if (forStmt.range) return false; // C 风格不应该有 range
        if (!forStmt.condition) return false;
        return true;
    });
    
    // 测试 16: function 内部 - 赋值语句
    test("function 内部 - 赋值语句", `
library Test {
    function test() {
        integer x = 0;
        x = 10;
        x += 1;
        x -= 1;
        x *= 2;
        x /= 2;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const assignments = func.body.statements.filter(s => s instanceof ZincAssignmentStatement) as ZincAssignmentStatement[];
        if (assignments.length < 4) return false;
        const plusAssign = assignments.find(a => a.operator === "+=");
        const minusAssign = assignments.find(a => a.operator === "-=");
        const multiplyAssign = assignments.find(a => a.operator === "*=");
        const divideAssign = assignments.find(a => a.operator === "/=");
        if (!plusAssign || !minusAssign || !multiplyAssign || !divideAssign) return false;
        return true;
    });
    
    // 测试 17: function 内部 - break 和 return 语句
    test("function 内部 - break 和 return 语句", `
library Test {
    function test() -> integer {
        while (true) {
            break;
        }
        return 42;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        
        // 递归查找 break 和 return 语句（可能在嵌套的块中）
        const findStatement = (statements: any[], type: any): any => {
            for (const stmt of statements) {
                if (stmt instanceof type) {
                    return stmt;
                }
                // 检查嵌套的块（如 while 循环体）
                if (stmt.body && stmt.body.statements) {
                    const found = findStatement(stmt.body.statements, type);
                    if (found) return found;
                }
            }
            return null;
        };
        
        const breakStmt = findStatement(func.body.statements, ZincBreakStatement);
        const returnStmt = findStatement(func.body.statements, ZincReturnStatement);
        if (!breakStmt || !returnStmt) return false;
        return true;
    });
    
    // 测试 18: method 内部 - 变量声明和语句（method 和 function 内部规则相同）
    test("method 内部 - 变量声明和语句", `
library Test {
    struct MyStruct {
        method test() {
            integer x = 1;
            x = x + 1;
            if (x > 0) {
                return;
            }
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const struct = lib.body.statements.find(s => s instanceof ZincStructDeclaration) as ZincStructDeclaration;
        if (!struct) return false;
        const method = struct.members.find(m => m instanceof ZincMethodDeclaration) as ZincMethodDeclaration;
        if (!method || !method.body) return false;
        const vars = method.body.statements.filter(s => s instanceof ZincVariableDeclaration);
        const assignments = method.body.statements.filter(s => s instanceof ZincAssignmentStatement);
        const ifStmts = method.body.statements.filter(s => s instanceof ZincIfStatement);
        if (vars.length < 1 || assignments.length < 1 || ifStmts.length < 1) return false;
        return true;
    });
    
    // 测试 19: library 内部 - public/private 块
    test("library 内部 - public/private 块", `
library Test {
    public {
        function publicFunc() {
        }
    }
    private {
        function privateFunc() {
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const funcs = lib.body.statements.filter(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration[];
        if (funcs.length !== 2) return false;
        const publicFunc = funcs.find(f => f.name?.name === "publicFunc");
        const privateFunc = funcs.find(f => f.name?.name === "privateFunc");
        if (!publicFunc || !privateFunc) return false;
        if (!publicFunc.isPublic || privateFunc.isPublic) return false;
        if (publicFunc.isPrivate || !privateFunc.isPrivate) return false;
        return true;
    });
    
    // 测试 20: function 内部 - 方法调用
    test("function 内部 - 方法调用", `
library Test {
    function test() {
        foo();
        obj.method();
        obj.method().chain();
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const calls = func.body.statements.filter(s => s instanceof ZincCallStatement) as ZincCallStatement[];
        if (calls.length < 3) return false;
        return true;
    });
    
    // 测试 21: function 内部 - 复杂表达式
    test("function 内部 - 复杂表达式", `
library Test {
    function test() {
        integer x = 1 + 2 * 3;
        boolean b = (x > 0) && (x < 10);
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const vars = func.body.statements.filter(s => s instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        if (vars.length < 2) return false;
        return true;
    });
    
    // 测试 22: library 内部 - 数组声明（成员变量）
    test("library 内部 - 数组声明（成员变量）", `
library Test {
    integer array[10];
    integer array2[];
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const vars = lib.body.statements.filter(s => s instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        if (vars.length < 2) return false;
        const arr1 = vars.find(v => v.name?.name === "array");
        const arr2 = vars.find(v => v.name?.name === "array2");
        if (!arr1 || !arr2) return false;
        return true;
    });
    
    // 测试 23: struct 内部 - 成员变量和 method 混合
    test("struct 内部 - 成员变量和 method 混合", `
library Test {
    struct MyStruct {
        integer value;
        string name;
        method getValue() -> integer {
            return this.value;
        }
        method setName(string n) {
            this.name = n;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const struct = lib.body.statements.find(s => s instanceof ZincStructDeclaration) as ZincStructDeclaration;
        if (!struct) return false;
        const vars = struct.members.filter(m => m instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        const methods = struct.members.filter(m => m instanceof ZincMethodDeclaration) as ZincMethodDeclaration[];
        if (vars.length !== 2 || methods.length !== 2) return false;
        return true;
    });
    
    // 测试 24: function 内部 - 完整功能测试
    test("function 内部 - 完整功能测试", `
library Test {
    function complexFunction() -> integer {
        integer i = 0;
        integer sum = 0;
        
        while (i < 10) {
            if (i % 2 == 0) {
                sum += i;
            } else {
                sum -= i;
            }
            i += 1;
        }
        
        for (0 < j <= 5) {
            sum *= 2;
        }
        
        if (sum > 100) {
            return sum;
        } else {
            return 0;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        
        // 递归查找各种语句类型（可能在嵌套的块中）
        const findStatements = (statements: any[], type: any): any[] => {
            const found: any[] = [];
            for (const stmt of statements) {
                if (stmt instanceof type) {
                    found.push(stmt);
                }
                // 检查嵌套的块（如 if-else、while、for 循环体）
                if (stmt.body && stmt.body.statements) {
                    found.push(...findStatements(stmt.body.statements, type));
                }
                // 检查 if 语句的 thenBlock 和 elseBlock
                if (stmt instanceof ZincIfStatement) {
                    if (stmt.thenBlock && stmt.thenBlock.statements) {
                        found.push(...findStatements(stmt.thenBlock.statements, type));
                    }
                    if (stmt.elseBlock && stmt.elseBlock.statements) {
                        found.push(...findStatements(stmt.elseBlock.statements, type));
                    }
                }
            }
            return found;
        };
        
        // 检查包含各种语句类型
        const vars = findStatements(func.body.statements, ZincVariableDeclaration);
        const whileStmts = findStatements(func.body.statements, ZincWhileStatement);
        const forStmts = findStatements(func.body.statements, ZincForStatement);
        const ifStmts = findStatements(func.body.statements, ZincIfStatement);
        const returns = findStatements(func.body.statements, ZincReturnStatement);
        if (vars.length < 2 || whileStmts.length < 1 || forStmts.length < 1 || ifStmts.length < 1 || returns.length < 1) return false;
        return true;
    });
    
    // 输出测试结果
    console.log(`\n测试完成: ${passed} 通过, ${failed} 失败`);
    if (failed > 0) {
        process.exit(1);
    }
}

