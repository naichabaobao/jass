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

    function ic() -> {}
    function
     name(xiaocan
         xiaocan, xiaocan )
          ->
          
          
          void {
        666
        }
        
globals
    integer a a a a a a a a
    constant string haha
    private code vun id diaoq
    / code vun id diaoq
endglobalsa
function aaa 

endfunctionc

function bbb
// function a 
globals
integer

function aa (string aa) -> nothing {}
// jiexila
*/
function aaa takes nothing returns nothing
        call aaa6((), a3(25.0, 47))
endfunction
    `);

const progam = parsing(tokens);

console.log(JSON.stringify(progam.functions()));
console.timeEnd("parsing")

