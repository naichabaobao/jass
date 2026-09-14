import * as fs from "fs";
import * as path from "path";
import { analyzeSemanticsWithAllFiles } from "./analyzer";

// ============================================================================
// 语义分析器 误报（false-positive）扫描
// ----------------------------------------------------------------------------
// 目标：对一批「显然合法」的复杂 vJASS 代码，断言语义分析器不应产生
//       任何错误（errors）以及任何「非 unused 类」的警告（warnings）。
//
// 设计：
//   - 以扩展真实运行方式调用 analyzeSemanticsWithAllFiles：
//       当前文件 = 待测片段；otherFiles = 打包的 static/common.j + static/blizzard.j
//       选项复刻默认行为（apiVersion=off -> returnBehaviorMode=adaptive，
//       其余 check* 均默认 true）。
//   - 标准库符号从 otherFiles 提取，因此片段中引用 native / 类型 / 函数不会
//     被误判为「未定义」。
//   - 仅把「Unused ...」类警告视为片段本身的可接受噪声（片段无法构成调用图），
//     其余警告一律当作潜在误报上报。
//
// 运行：npm run test:anfp   （或 node out/vjass/analyzer-fp.test.js）
// ============================================================================

interface Case {
    name: string;
    code: string;
}

function loadStdLib(): Array<{ filePath: string; content: string }> {
    const dir = path.resolve(__dirname, "../../static");
    return [
        { filePath: "common.j", content: fs.readFileSync(path.join(dir, "common.j"), "utf8") },
        { filePath: "blizzard.j", content: fs.readFileSync(path.join(dir, "blizzard.j"), "utf8") }
    ];
}

const stdlib = loadStdLib();

// 合法「unused」类告警（片段无法构成完整调用图，属预期噪声，不计入误报）
function isAcceptableWarning(message: string): boolean {
    return /unused/i.test(message);
}

const CASES: Case[] = [
    {
        name: "基础函数调用 native",
        code: `function Hello takes nothing returns nothing
    call BJDebugMsg("hi")
endfunction
`
    },
    {
        name: "struct extends array + thistype + allocate + operator+ + this",
        code: `struct Point extends array
    real x
    real y
    static method create takes real a, real b returns thistype
        local thistype p = thistype.allocate()
        set p.x = a
        set p.y = b
        return p
    endmethod
    method operator + takes thistype o returns thistype
        local thistype r = thistype.allocate()
        set r.x = this.x + o.x
        set r.y = this.y + o.y
        return r
    endmethod
    method destroy takes nothing returns nothing
        call this.deallocate()
    endmethod
endstruct
function UsePoint takes nothing returns nothing
    local Point a = Point.create(1.0, 2.0)
    local Point b = Point.create(3.0, 4.0)
    local Point c = a + b
    call a.destroy()
    call b.destroy()
    call c.destroy()
endfunction
`
    },
    {
        name: "struct implements interface（方法签名匹配）",
        code: `interface IDamageable
    method takeDamage takes real d returns nothing
    method getHp takes nothing returns integer
endinterface
struct Unit extends array
    integer hp
    implement IDamageable
    method takeDamage takes real d returns nothing
        set this.hp = this.hp - R2I(d)
    endmethod
    method getHp takes nothing returns integer
        return this.hp
    endmethod
endstruct
function UseUnit takes nothing returns nothing
    local Unit u = Unit.create()
    call u.takeDamage(5.0)
    call u.destroy()
endfunction
`
    },
    {
        name: "普通 struct 的 create/destroy（非 array）",
        code: `struct Foo
    integer v
    method get takes nothing returns integer
        return this.v
    endmethod
endstruct
function DoFoo takes nothing returns nothing
    local Foo f = Foo.create()
    local integer x = f.get()
    call f.destroy()
endfunction
`
    },
    {
        name: "library 包裹 struct + 调用",
        code: `library MyLib requires nothing
    struct Bar
        integer v
        method inc takes nothing returns nothing
            set this.v = this.v + 1
        endmethod
    endstruct
    function DoBar takes nothing returns nothing
        local Bar b = Bar.create()
        call b.inc()
        call b.destroy()
    endfunction
endlibrary
`
    },
    {
        name: "static if (DEBUG_MODE) 条件编译",
        code: `function DebugPrint takes string s returns nothing
    static if (DEBUG_MODE) then
        call BJDebugMsg(s)
    endif
endfunction
`
    },
    {
        name: "operator [] 与 []= 重载",
        code: `struct Vec extends array
    real x
    method operator [] takes integer i returns real
        return this.x
    endmethod
    method operator []= takes integer i, real v returns nothing
        set this.x = v
    endmethod
endstruct
function UseVec takes nothing returns nothing
    local Vec v = Vec.create()
    set v[0] = 3.0
    local real r = v[0]
    call v.destroy()
endfunction
`
    },
    {
        name: "delegate 委托成员",
        code: `struct Inner
    integer val
endstruct
struct Outer extends array
    delegate Inner inner
    method getVal takes nothing returns integer
        return this.val
    endmethod
endstruct
function UseOuter takes nothing returns nothing
    local Outer o = Outer.create()
    local integer x = o.getVal()
    call o.destroy()
endfunction
`
    },
    {
        name: "code 类型 / 函数引用 / ExecuteFunc",
        code: `function Callback takes nothing returns nothing
endfunction
function Register takes code c returns nothing
    call ExecuteFunc("")
endfunction
function UseCode takes nothing returns nothing
    call Register(function Callback)
endfunction
`
    },
    {
        name: "显式类型转换 Integer()/Real()",
        code: `function Cast takes real r returns integer
    return Integer(r)
endfunction
function CastBack takes integer i returns real
    return Real(i)
endfunction
`
    },
    {
        name: "数组变量与下标读写",
        code: `function Arr takes nothing returns nothing
    local integer array xs
    local integer i = 0
    set xs[0] = 5
    set i = xs[0]
endfunction
`
    },
    {
        name: "loop + exitwhen + and/or 条件",
        code: `function LoopDemo takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i >= 10 or i < 0
        set i = i + 1
    endloop
endfunction
`
    },
    {
        name: "handle 类型使用（create+destroy+null，不应报泄漏）",
        code: `function GroupUse takes nothing returns nothing
    local group g = CreateGroup()
    call DestroyGroup(g)
    set g = null
endfunction
`
    },
    {
        name: "public/private 成员与方法",
        code: `struct S
    public integer a
    private integer b
    public method getB takes nothing returns integer
        return this.b
    endmethod
    private method setB takes integer v returns nothing
        set this.b = v
    endmethod
endstruct
function UseS takes nothing returns nothing
    local S s = S.create()
    set s.a = 1
    local integer x = s.getB()
    call s.destroy()
endfunction
`
    },
    {
        name: "scope + initializer",
        code: `scope MyScope initializer Init
    private function Init takes nothing returns nothing
    endfunction
endscope
`
    },
    {
        name: "onDestroy / static onInit",
        code: `struct T extends array
    static method onInit takes nothing returns nothing
    endmethod
    method onDestroy takes nothing returns nothing
    endmethod
endstruct
`
    },
    {
        name: "struct 互引（成员为同类型 struct）",
        code: `struct Node extends array
    Node next
    static method link takes Node a, Node b returns nothing
        set a.next = b
    endmethod
endstruct
function UseNode takes nothing returns nothing
    local Node a = Node.create()
    local Node b = Node.create()
    call Node.link(a, b)
    call a.destroy()
    call b.destroy()
endfunction
`
    },
    {
        name: "数值运算 + I2R/R2I/I2S 混合",
        code: `function Math takes nothing returns nothing
    local integer a = 5
    local real b = I2R(a) + 3.0
    local integer c = R2I(b)
    call BJDebugMsg(I2S(c))
endfunction
`
    },
    {
        name: "operator < 比较重载（thistype）",
        code: `struct Cmp extends array
    integer v
    method operator < takes thistype o returns boolean
        return this.v < o.v
    endmethod
endstruct
function UseCmp takes nothing returns nothing
    local Cmp a = Cmp.create()
    local Cmp b = Cmp.create()
    local boolean r = a < b
    call a.destroy()
    call b.destroy()
endfunction
`
    },
    {
        name: "method 链式返回 thistype（builder 风格）",
        code: `struct Builder extends array
    integer n
    method add takes integer x returns thistype
        set this.n = this.n + x
        return this
    endmethod
endstruct
function UseBuilder takes nothing returns nothing
    local Builder b = Builder.create()
    call b.add(1).add(2)
    call b.destroy()
endfunction
`
    },
    {
        name: "textmacro / runtextmacro 文本宏",
        code: `//! textmacro M_INC takes A
    set $A$ = $A$ + 1
//! endtextmacro
function UseMacro takes nothing returns nothing
    local integer i = 0
    //! runtextmacro M_INC("i")
endfunction
`
    },
    {
        name: "嵌套函数调用 + 类型匹配返回",
        code: `function Add takes integer a, integer b returns integer
    return a + b
endfunction
function Calc takes nothing returns nothing
    local integer r = Add(1, 2)
    call BJDebugMsg(I2S(r))
endfunction
`
    },
    {
        name: "方法参数类型为 struct + 调用方法",
        code: `struct Box extends array
    integer v
    method setV takes integer x returns nothing
        set this.v = x
    endmethod
    method getV takes nothing returns integer
        return this.v
    endmethod
endstruct
function UseBox takes Box b returns integer
    call b.setV(7)
    return b.getV()
endfunction
`
    }
];

function printCodeWithLines(code: string): void {
    const lines = code.split("\n");
    lines.forEach((l, i) => {
        console.log(`    ${String(i + 1).padStart(3, " ")} | ${l}`);
    });
}

function run(): void {
    let passed = 0;
    let failed = 0;

    for (const c of CASES) {
        const result = analyzeSemanticsWithAllFiles(
            { filePath: "test.j", content: c.code },
            stdlib,
            {
                checkUndefinedBehavior: true,
                checkTypes: true,
                checkUnused: true,
                checkArrayBounds: true,
                checkHandleLeaks: true,
                returnBehaviorMode: "adaptive"
            }
        );

        const parseErrs = result.allParseResults[0].parseErrors.errors;
        const semanticErrs = result.semanticResult.errors;
        const allWarns = result.semanticResult.warnings;
        const realWarns = allWarns.filter((w) => !isAcceptableWarning(w.message));

        const problems: string[] = [];
        parseErrs.forEach((e: any) => problems.push(`PARSE-ERR: ${e.message}`));
        semanticErrs.forEach((e: any) => problems.push(`ERR: ${e.message}`));
        realWarns.forEach((w: any) => problems.push(`WARN: ${w.message}`));

        if (problems.length === 0) {
            passed++;
            console.log(`  ✅ ${c.name}`);
        } else {
            failed++;
            console.log(`  ❌ ${c.name}  (${problems.length} 处)`);
            problems.forEach((p) => console.log(`       ${p}`));
            console.log(`   ---- 代码片段 ----`);
            printCodeWithLines(c.code);
            console.log(``);
        }
    }

    console.log(`\n语义分析误报扫描：通过 ${passed} / ${CASES.length}，疑似误报 ${failed}`);
    if (failed > 0) {
        process.exitCode = 1;
    }
}

if (require.main === module) {
    run();
}

export function runAnalyzerFpTests(): void {
    run();
}
