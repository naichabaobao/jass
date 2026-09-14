import { removeComment } from "./comment";

// ===== 自定义测试运行器（与 parser.test.ts 风格一致）=====
if (typeof require !== "undefined" && require.main === module) {
    let runtimeFailedCount = 0;
    const originalLog = console.log.bind(console);
    const originalError = console.error.bind(console);
    const markFailure = (...args: any[]) => {
        const first = args[0];
        if (typeof first === "string" && first.trim().startsWith("✗")) {
            runtimeFailedCount++;
        }
    };
    console.log = (...args: any[]) => {
        markFailure(...args);
        originalLog(...args);
    };
    console.error = (...args: any[]) => {
        markFailure(...args);
        originalError(...args);
    };

    let passed = 0;
    let failed = 0;
    function check(name: string, cond: boolean, detail?: string): void {
        if (cond) {
            passed++;
            console.log(`  ✓ ${name}`);
        } else {
            failed++;
            console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`);
        }
    }

    // ===== removeComment：多行块注释不应“缩起来”（关键回归）=====
    console.log("\n=== removeComment 多行块注释 ===");
    {
        const src = "a/*\nbbb\nccc\n*/d\n";
        const errs = { errors: [], warnings: [] };
        const out = removeComment(src, errs as any);
        check("行数保持 5 行不变", out.split("\n").length === 5, `实际 ${out.split("\n").length}`);
        check("注释体行不再被清空（bbb 行应为空格而非空）", out.split("\n")[1] === "   ", JSON.stringify(out.split("\n")[1]));
        check("注释体行不再被清空（ccc 行应为空格而非空）", out.split("\n")[2] === "   ", JSON.stringify(out.split("\n")[2]));
        check("整体长度保持 16 不变（原 16 → 现 " + out.length + "）", out.length === 16, `实际 ${out.length}`);
        check("闭合行之后内容位置正确（d 在列 3）", out.split("\n")[3] === "  d", JSON.stringify(out.split("\n")[3]));
    }
    {
        // 注释体内部带内容的多行注释
        const src = "function f takes nothing returns nothing\n    /* 这是\n       多行\n       注释 */\n    local integer x = 1\nendfunction\n";
        const errs = { errors: [], warnings: [] };
        const out = removeComment(src, errs as any);
        check("多行块注释后代码行结构完整（行数不变）", out.split("\n").length === src.split("\n").length, `原 ${src.split("\n").length} 现 ${out.split("\n").length}`);
        check("多行块注释整体长度不变", out.length === src.length, `原 ${src.length} 现 ${out.length}`);
        check("注释后 local 行内容保留", out.split("\n")[4] === "    local integer x = 1", JSON.stringify(out.split("\n")[4]));
    }

    // ===== removeComment：单行块注释保持正确 =====
    console.log("\n=== removeComment 单行块注释 ===");
    {
        const src = "a/*comment*/b\n";
        const errs = { errors: [], warnings: [] };
        const out = removeComment(src, errs as any);
        check("单行块注释长度保持 14 不变", out.length === 14, `实际 ${out.length}`);
        check("注释被替换为等宽空格", out === "a           b\n", JSON.stringify(out));
    }
    {
        const src = "code /* note */ more code\n";
        const errs = { errors: [], warnings: [] };
        const out = removeComment(src, errs as any);
        check("单行块注释 + 注释后代码长度保持 26 不变", out.length === 26, `实际 ${out.length}`);
    }

    // ===== removeComment：字符串中的注释符号应受保护 =====
    console.log("\n=== removeComment 字符串保护 ===");
    {
        const src = "s = \"a/*b*/c\"\n";
        const errs = { errors: [], warnings: [] };
        const out = removeComment(src, errs as any);
        check("字符串内的 /* */ 不被当作注释移除", out === src, JSON.stringify(out));
    }
    {
        const src = "s = \"line // not comment\"\n";
        const errs = { errors: [], warnings: [] };
        const out = removeComment(src, errs as any);
        check("字符串内的 // 不被当作注释移除", out === src, JSON.stringify(out));
    }

    // ===== removeComment：未闭合块注释应报错且仍尽量保留长度 =====
    console.log("\n=== removeComment 未闭合块注释 ===");
    {
        const src = "a/* oops\n";
        const errs = { errors: [], warnings: [] };
        const out = removeComment(src, errs as any);
        check("未闭合块注释产生错误", errs.errors.length === 1, `errors=${errs.errors.length}`);
        check("未闭合块注释长度仍保持（注释体转空格）", out.length === src.length, `原 ${src.length} 现 ${out.length}`);
    }

    console.log(`\n注释测试：通过 ${passed}, 失败 ${failed}`);
    if (failed > 0 || runtimeFailedCount > 0) {
        throw new Error(`Comment tests failed: ${failed}`);
    }
}
