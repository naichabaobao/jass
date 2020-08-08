import { tokenize } from "./tokens";
import { parsing } from "./parsing";

console.time("parsing")
const tokens = tokenize(`
/*
// 小小玩意
native haha takes string str,integer int returns nothing
function haha takes string str,integer int returns nothing
123 local integer name = 12
endfunction
function haha takes string str,integer int returns nothing
123 local integer name = 12
endfunction

function name(xiaocan xiaocan, xiaocan ) -> void {
666
}
function xiaolongnv  (xiaocan xiaocan, xiaocan )  {
    666
    // 想知道
    }

    function ic() -> {}*/
globals
    integer a
    constant string haha
    private code vun
endglobals

    `);

const progam = parsing(tokens);

console.log(JSON.stringify(progam, null, 8));
console.timeEnd("parsing")

