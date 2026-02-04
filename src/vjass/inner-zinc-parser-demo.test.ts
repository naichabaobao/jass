/**
 * Inner Zinc 解析器演示测试
 * 测试 zinc.docs.txt 中的 Zinc 案例
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
    ZincReturnStatement,
    ZincStatement
} from "./zinc-ast";

// 测试代码
if (typeof require !== 'undefined' && require.main === module) {
    console.log("=== Inner Zinc Parser 演示测试（来自 zinc.docs.txt）===\n");
    
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
    
    // 案例 1: Hello World (zinc.docs.txt lines 98-104)
    test("Hello World", `
library HelloWorld
{
    function onInit()
    {
         BJDebugMsg("Hello World");
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!(lib instanceof ZincLibraryDeclaration)) return false;
        if (lib.name?.name !== "HelloWorld") return false;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func) return false;
        if (func.name?.name !== "onInit") return false;
        return true;
    });
    
    // 案例 2: 99 Bottles of Beer (zinc.docs.txt lines 108-133)
    test("99 Bottles of Beer", `
library Bottles99
{
    function onInit()
    {
        string bot = "99 bottles";
        integer i=99;
        while (i>=0)
        {
            BJDebugMsg(bot+" of beer on the wall, "+bot+" of beer");
            i=i-1;
            if      (i== 1) bot = "1 bottle";
            else if (i== 0) bot = "No more bottles";
            else            bot = I2S(i)+" bottles";

            if(i>=0)
            {
                BJDebugMsg("Take one down and pass it around, "+bot+" of beer on the wall.\\n");
            }
        }
        BJDebugMsg("Go to the store and buy some more, 99 bottles of beer on the wall.");
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        // 递归查找 while 和 if 语句（可能在嵌套块中）
        const findStatements = (statements: any[], type: any): any[] => {
            const found: any[] = [];
            for (const stmt of statements) {
                if (stmt instanceof type) {
                    found.push(stmt);
                }
                if (stmt.body && stmt.body.statements) {
                    found.push(...findStatements(stmt.body.statements, type));
                }
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
        const whileStmts = findStatements(func.body.statements, ZincWhileStatement);
        const ifStmts = findStatements(func.body.statements, ZincIfStatement);
        if (whileStmts.length < 1 || ifStmts.length < 1) return false;
        return true;
    });
    
    // 案例 3: Factorial (zinc.docs.txt lines 138-152)
    test("Factorial", `
library Factorial
{
    public function Factorial(integer n) -> integer
    {
        integer result=1, i;
        for ( 1 <= i <= n)
            result = result * i;

        return result;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func) return false;
        if (func.name?.name !== "Factorial") return false;
        if (!func.isPublic) return false;
        if (func.returnType?.name !== "integer") return false;
        if (!func.body) return false;
        const forStmts = func.body.statements.filter(s => s instanceof ZincForStatement);
        const returns = func.body.statements.filter(s => s instanceof ZincReturnStatement);
        if (forStmts.length < 1 || returns.length < 1) return false;
        return true;
    });
    
    // 案例 4: Instant Kill (zinc.docs.txt lines 158-183)
    test("Instant Kill", `
library InstantKill
{
    constant integer SPELL_ID = 'A001';

    function onSpellCast()
    {
        KillUnit(  GetSpellTargetUnit() );
    }

    function spellIdMatch() -> boolean
    {
        return (GetSpellAbilityId() == SPELL_ID);
    }

    function onInit()
    {
        trigger t = CreateTrigger();
        TriggerAddAction(t, function onSpellCast);
        TriggerAddCondition(t, Condition(function spellIdMatch) );
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        // 检查常量变量
        const vars = lib.body.statements.filter(s => s instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        const spellIdVar = vars.find(v => v.name?.name === "SPELL_ID");
        if (!spellIdVar || !spellIdVar.isConstant) return false;
        // 检查函数
        const funcs = lib.body.statements.filter(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration[];
        if (funcs.length < 3) return false;
        const spellIdMatch = funcs.find(f => f.name?.name === "spellIdMatch");
        if (!spellIdMatch || spellIdMatch.returnType?.name !== "boolean") return false;
        return true;
    });
    
    // 案例 5: AddSpecialEffectTimed (zinc.docs.txt lines 188-215)
    test("AddSpecialEffectTimed", `
library TimedEffect requires TimerUtils
{
    struct data
    {
        effect fx;
    }
    function destroyEffect()
    {
        timer t=GetExpiredTimer();
        data dt = data( GetTimerData(t));
        DestroyEffect(dt.fx);
        ReleaseTimer(t);
    }

    public function AddSpecialEffectTimed( string fxpath, real x, real y, real duration)
    {
        timer t=NewTimer();
        data  dt = data.create();
        dt.fx = AddSpecialEffect(fxpath, x, y);

        SetTimerData(t, integer(dt));
        TimerStart(t, duration , false, function destroyEffect);
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        // 检查 requires
        if (lib.requirements.length !== 1) return false;
        if (lib.requirements[0].name !== "TimerUtils") return false;
        // 检查 struct
        const struct = lib.body.statements.find(s => s instanceof ZincStructDeclaration) as ZincStructDeclaration;
        if (!struct || struct.name?.name !== "data") return false;
        // 检查 public 函数
        const funcs = lib.body.statements.filter(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration[];
        const publicFunc = funcs.find(f => f.name?.name === "AddSpecialEffectTimed");
        if (!publicFunc || !publicFunc.isPublic) return false;
        return true;
    });
    
    // 案例 6: CountUnitsInGroup (zinc.docs.txt lines 222-231)
    test("CountUnitsInGroup", `
library CountUnitsInGroup
{
    integer count;
    public function CountUnitsInGroup( group g ) -> integer
    {
        count = 0;
        ForGroup(g, function() { count= count + 1; });
        return count;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        // 检查全局变量
        const vars = lib.body.statements.filter(s => s instanceof ZincVariableDeclaration) as ZincVariableDeclaration[];
        const countVar = vars.find(v => v.name?.name === "count");
        if (!countVar) return false;
        // 检查 public 函数
        const funcs = lib.body.statements.filter(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration[];
        const func = funcs.find(f => f.name?.name === "CountUnitsInGroup");
        if (!func || !func.isPublic) return false;
        if (func.returnType?.name !== "integer") return false;
        return true;
    });
    
    // 案例 7: While Test (zinc.docs.txt lines 581-594)
    test("While Test", `
library WhileTest
{
    function onInit()
    {
        integer x = 5;
        while( x > 0)
        {
            BJDebugMsg( I2S(x) );
            x = x - 1;
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const whileStmts = func.body.statements.filter(s => s instanceof ZincWhileStatement);
        if (whileStmts.length < 1) return false;
        return true;
    });
    
    // 案例 8: For Range Test (zinc.docs.txt lines 601-638)
    test("For Range Test", `
library WhileTest
{
    function onInit()
    {
        integer x, n=7;
        for ( 0 <= x < 10)
        {
            BJDebugMsg( I2S(x) );
        }

        for ( 10 > x >= 0)
        {
            BJDebugMsg( I2S(x) );
        }

        for( 1 <= x <= 10 )
        {
            BJDebugMsg( I2S(x) );
            x = x - 1;
        }

        for ( 0 <= x < n )
        {
            BJDebugMsg( I2S(x) );
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        const forStmts = func.body.statements.filter(s => s instanceof ZincForStatement);
        if (forStmts.length < 4) return false;
        return true;
    });
    
    // 案例 9: If Test (zinc.docs.txt lines 454-500)
    test("If Test", `
library IfTest
{
    integer x = 0;

    function onInit()
    {
        if(x==0)
        {
            BJDebugMsg("it is 0");
        }
        else
        {
            BJDebugMsg("it is not 0");
        }

        x = GetRandomInt(0,3);
        
        if(x==0)  BJDebugMsg("it is 0");
        else      BJDebugMsg("it is not 0");

        x = GetRandomInt(0,6);
        if(x==5)
        {
            BJDebugMsg("Today is your lucky day, because you got a 5");
        }
        else if (x==0)
        {
            BJDebugMsg("Today is your unlucky day,")
            BJDebugMsg(" you got a 0");
        }
        else
        {
            BJDebugMsg("Normal day");
            if( x==4) {
                BJDebugMsg("But hey, at least it is a 4, that is good");
            }
        }
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const func = lib.body.statements.find(s => s instanceof ZincFunctionDeclaration) as ZincFunctionDeclaration;
        if (!func || !func.body) return false;
        // 递归查找 if 语句
        const findIfStatements = (statements: any[]): any[] => {
            const found: any[] = [];
            for (const stmt of statements) {
                if (stmt instanceof ZincIfStatement) {
                    found.push(stmt);
                }
                if (stmt.body && stmt.body.statements) {
                    found.push(...findIfStatements(stmt.body.statements));
                }
                if (stmt instanceof ZincIfStatement) {
                    if (stmt.thenBlock && stmt.thenBlock.statements) {
                        found.push(...findIfStatements(stmt.thenBlock.statements));
                    }
                    if (stmt.elseBlock && stmt.elseBlock.statements) {
                        found.push(...findIfStatements(stmt.elseBlock.statements));
                    }
                }
            }
            return found;
        };
        const ifStmts = findIfStatements(func.body.statements);
        if (ifStmts.length < 4) return false;
        return true;
    });
    
    // 案例 10: Struct Example (zinc.docs.txt lines 686-786)
    test("Struct Example", `
library WhileTest
{
    struct A
    {
        integer x,y,z;
    }

    struct[20000] C
    {
        real a,b,c;
        string s,t;
    }

    struct myArr[]
    {
        static constant integer meh = 30004;
        integer a;
        integer b;
    }

    struct myErr[10000]
    {
        integer x,y,z;
    }
}
    `, (r) => {
        if (r.length !== 1) return false;
        const lib = r[0] as ZincLibraryDeclaration;
        if (!lib.body) return false;
        const structs = lib.body.statements.filter(s => s instanceof ZincStructDeclaration) as ZincStructDeclaration[];
        if (structs.length < 4) return false;
        // 检查 struct A
        const structA = structs.find(s => s.name?.name === "A");
        if (!structA) return false;
        // 检查 struct C (带存储大小)
        const structC = structs.find(s => s.name?.name === "C");
        if (!structC) return false;
        // 检查 array struct myArr (空括号表示数组 struct)
        const structArr = structs.find(s => s.name?.name === "myArr");
        if (!structArr) return false;
        // 检查 array struct myErr (带大小的数组 struct)
        const structErr = structs.find(s => s.name?.name === "myErr");
        if (!structErr || !structErr.isArrayStruct) return false;
        return true;
    });
    
    // 输出测试结果
    console.log(`\n测试完成: ${passed} 通过, ${failed} 失败`);
    if (failed > 0) {
        process.exit(1);
    }
}

