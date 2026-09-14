import { Parser } from "./parser";
import { Statement } from "./ast";

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

    // 合法复杂 vJASS 片段：解析器不应产生任何语法错误（误报错即 bug）
    const cases: Array<{ name: string; code: string }> = [
        {
            name: "library + requires + initializer",
            code: `
library MyLib requires OtherLib initializer Init
    function Init takes nothing returns nothing
    endfunction
endlibrary
`
        },
        {
            name: "library needs (替代 requires)",
            code: `
library A needs B
endlibrary
`
        },
        {
            name: "scope + initializer + endscope",
            code: `
scope MyScope initializer Init
    function Init takes nothing returns nothing
    endfunction
endscope
`
        },
        {
            name: "struct 继承 + 数组成员 + 静态成员",
            code: `
struct Parent
    integer x
endstruct
struct Child extends Parent
    integer y
    integer array data[100]
    static integer array staticData[50]
    static integer counter = 0
endstruct
`
        },
        {
            name: "struct method operator (+ - * / = [] < > <= >=)",
            code: `
struct Unit
    integer hp
    method operator damage takes integer value returns integer
        return this.hp
    endmethod
    method operator damage= takes integer value returns nothing
        set this.hp = value
    endmethod
    method operator [] takes integer index returns integer
        return this.hp
    endmethod
    method operator + takes Unit other returns Unit
        return this
    endmethod
    method operator - takes Unit other returns Unit
        return this
    endmethod
    method operator * takes Unit other returns Unit
        return this
    endmethod
    method operator / takes Unit other returns Unit
        return this
    endmethod
    method operator = takes Unit other returns nothing
        set this.hp = other.hp
    endmethod
    method operator < takes Unit other returns boolean
        return this.hp < other.hp
    endmethod
    method operator <= takes Unit other returns boolean
        return this.hp <= other.hp
    endmethod
    method operator >= takes Unit other returns boolean
        return this.hp >= other.hp
    endmethod
endstruct
`
        },
        {
            name: "struct delegate 字段",
            code: `
struct Inner
    integer v
endstruct
struct Outer
    delegate Inner innerField
endstruct
`
        },
        {
            name: "interface 方法签名（无 body）",
            code: `
interface Damageable
    method takeDamage takes integer d returns nothing
    method getHp takes nothing returns integer
endinterface
`
        },
        {
            name: "module + implement",
            code: `
module M
    integer field
    method foo takes nothing returns nothing
    endmethod
endmodule
struct S
    implement M
endstruct
`
        },
        {
            name: "method 修饰符 readonly / stub / static",
            code: `
struct T
    readonly integer x
    stub method bar takes nothing returns integer
        return 0
    endmethod
    static stub method baz takes nothing returns nothing
    endmethod
endstruct
`
        },
        {
            name: "type X extends Y",
            code: `
type myhandle extends handle
type unit extends widget
type item extends widget
`
        },
        {
            name: "function interface",
            code: `
function interface TimerProc
    takes nothing returns nothing
`
        },
        {
            name: "hook main / config",
            code: `
function MyMain takes nothing returns nothing
endfunction
function MyConfig takes nothing returns nothing
endfunction
hook main MyMain
hook config MyConfig
`
        },
        {
            name: "globals constant/array/public/private",
            code: `
globals
    constant integer MAX = 100
    integer array buffer
    public real rate = 1.0
    private boolean flag
endglobals
`
        },
        {
            name: "static if / else",
            code: `
function f takes nothing returns nothing
    static if DEBUG_MODE then
        call BJDebugMsg("debug")
    else
        call BJDebugMsg("release")
    endif
endfunction
`
        },
        {
            name: "debug 语句",
            code: `
function g takes nothing returns nothing
    debug call BJDebugMsg("dbg")
    local integer x = 1
    debug set x = 2
endfunction
`
        },
        {
            name: "textmacro + runtextmacro",
            code: `
//! textmacro M_NAME takes A, B
    set $A$ = $B$
//! endtextmacro

function h takes nothing returns nothing
    local integer x
    //! runtextmacro M_NAME("x", "5")
endfunction
`
        },
        {
            name: "textmacro 嵌套定义（深度配对，不应截断外层宏）",
            code: `
//! textmacro OUTER takes P
//! textmacro INNER takes X
    set $X$ = 1
//! endtextmacro
    set $P$ = 2
//! endtextmacro

//! textmacro CREATE_SAVE_FUNC takes TYPE, FUNC_SUFFIX
function Save$TYPE$ takes hashtable ht, integer key, integer subkey, $TYPE$ value returns nothing
call Save$FUNC_SUFFIX$Handle(ht, key, subkey, value)
endfunction
//! endtextmacro

//! runtextmacro OUTER("q")
//! runtextmacro CREATE_SAVE_FUNC("unit", "Unit")

function after takes nothing returns nothing
endfunction
`
        },
        {
            name: "array struct (extends array)",
            code: `
struct Point extends array
    integer x
    integer y
endstruct
`
        },
        {
            name: "code 类型 / 函数引用",
            code: `
function cb takes nothing returns nothing
endfunction
function use takes code c returns nothing
    call c.evaluate()
endfunction
`
        },
        {
            name: "四字符码字面量 'A001'",
            code: `
globals
    constant integer CODE = 'A001'
    constant integer CODE2 = 'A00I'
endglobals
`
        },
        {
            name: "real 负值字面量",
            code: `
globals
    real r = -3.14
    real r2 = 2.5e3
endglobals
`
        },
        {
            name: "local array + 下标赋值",
            code: `
function l takes nothing returns nothing
    local integer array arr
    set arr[0] = 1
    set arr[INDEX] = 2
endfunction
`
        },
        {
            name: "this 方法调用",
            code: `
struct D
    method n takes nothing returns nothing
    endmethod
    method m takes nothing returns nothing
        call this.n()
    endmethod
endstruct
`
        },
        {
            name: "method 参数中 thistype",
            code: `
struct E
    method make takes thistype other returns thistype
        return other
    endmethod
endstruct
`
        },
        {
            name: "嵌套 loop / exitwhen / endloop",
            code: `
function nested takes nothing returns nothing
    local integer i = 0
    local integer j = 0
    loop
        exitwhen i >= 10
        set j = 0
        loop
            exitwhen j >= 5
            set j = j + 1
        endloop
        set i = i + 1
    endloop
endfunction
`
        },
        {
            name: "多行 call 参数",
            code: `
function multi takes nothing returns nothing
    call SomeFunc(
        arg1,
        arg2,
        arg3
    )
endfunction
`
        },
        {
            name: "//! zinc 块",
            code: `
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
`
        },
        {
            name: "//! inject main / config (+ endinject)",
            code: `
//! inject main
    call BJDebugMsg("injected main")
//! endinject
//! inject config
    call BJDebugMsg("injected config")
//! endinject
`
        },
        {
            name: "library 内 globals + struct + function",
            code: `
library Complex requires A, B
    globals
        integer gCounter = 0
    endglobals
    struct Node
        integer value
        Node next
        static method create takes integer v returns Node
            return 0
        endmethod
    endstruct
    function Run takes nothing returns nothing
        local Node n = Node.create(1)
    endfunction
endlibrary
`
        },
        {
            name: "struct 一元 operator - (takes nothing)",
            code: `
struct V
    method operator - takes nothing returns thistype
        return this
    endmethod
endstruct
`
        },
        {
            name: "struct public/private 成员（含 static）",
            code: `
struct S
    public integer a
    private integer b
    public static integer c
    private static integer d
    readonly public integer e
endstruct
`
        },
        {
            name: "scope 内 public/private 函数",
            code: `
scope Sc
    private function f takes nothing returns nothing
    endfunction
    public function g takes nothing returns nothing
    endfunction
endscope
`
        },
        {
            name: "and / or / not 组合条件",
            code: `
function cond takes nothing returns boolean
    local integer a = 1
    local integer b = 2
    if a < b and not (a == b) or b > 0 then
        call BJDebugMsg("ok")
    endif
    return true
endfunction
`
        },
        {
            name: "函数引用 function target / code 变量",
            code: `
function target takes nothing returns nothing
endfunction
function use takes nothing returns nothing
    local code c = function target
    call c.evaluate()
endfunction
`
        },
        {
            name: "static if / static elseif / static else",
            code: `
function sf takes nothing returns nothing
    static if LIB then
        call BJDebugMsg("a")
    static elseif LIB2 then
        call BJDebugMsg("b")
    else
        call BJDebugMsg("c")
    endif
endfunction
`
        },
        {
            name: "globals public/private constant",
            code: `
globals
    public constant integer G = 1
    private constant real H = 2.0
endglobals
`
        },
        {
            name: "type 继承链 extends handle/agent",
            code: `
type agent extends handle
type event extends agent
type player extends agent
`
        },
        {
            name: "loop 内嵌套 if",
            code: `
function nl takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i > 10
        if i > 5 then
            call BJDebugMsg("big")
        endif
        set i = i + 1
    endloop
endfunction
`
        },
        {
            name: "set 数组元素（含表达式下标）",
            code: `
function sa takes nothing returns nothing
    local integer array x
    set x[0] = 1
    set x[1 + 2] = 3
endfunction
`
        },
        {
            name: "struct 方法内 this 调用",
            code: `
struct W
    method bar takes nothing returns nothing
    endmethod
    method foo takes nothing returns nothing
        call this.bar()
    endmethod
endstruct
`
        }
    ];

    console.log("\n=== vJASS 复杂语法误报错扫描（合法片段应零语法错误）===\n");
    let falsePositiveCount = 0;
    for (const c of cases) {
        let body: Statement[] = [];
        let errCount = 0;
        let errMsgs: string[] = [];
        try {
            const p = new Parser(c.code);
            const result = p.parse();
            body = result.body;
            errCount = p.errors.errors.length;
            errMsgs = p.errors.errors.map((e: any) => (e.message || String(e)));
        } catch (e: any) {
            errMsgs = ["解析异常: " + (e && e.message ? e.message : String(e))];
            errCount = 1;
        }
        const ok = errCount === 0;
        if (!ok) falsePositiveCount++;
        check(
            `${c.name}（错误数 ${errCount}）`,
            ok,
            ok ? "" : "错误: " + errMsgs.slice(0, 4).join(" | ")
        );

        // 结构不变量：顶层不允许出现名字带 $ 的函数声明。
        // JASS 合法标识符不含 $，此类节点只可能是 textmacro 模板体因解析错位
        // 泄漏成了真实函数（如嵌套 textmacro 深度不配对导致外层宏提前截断），
        // 即便没有语法错误也是结构性 bug，必须在此暴露。
        const leakedMacros = body.filter(
            (s): s is any => s.constructor.name === "FunctionDeclaration" &&
                typeof (s as any).name?.name === "string" &&
                (s as any).name.name.includes("$")
        );
        if (leakedMacros.length > 0) {
            failed++;
            console.log(`  ✗ ${c.name} —— textmacro 模板体泄漏为顶层函数: ${leakedMacros.map((f: any) => f.name.name).join(", ")}`);
        }
    }

    console.log(`\n误报扫描：用例 ${cases.length}，发现误报 ${falsePositiveCount}，通过 ${passed}，失败 ${failed}`);
    if (failed > 0 || runtimeFailedCount > 0) {
        throw new Error(`Parser bug-scan tests failed: ${failed}`);
    }
}
