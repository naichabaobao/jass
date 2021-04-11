import("./provider/completion-provider");
import("./provider/hover-provider");
import {Program} from "./provider/jass";

const program = new Program("", `
native  aa takes  integer   ll ,  nothing a  ,returns nothing
library diaobao
function a 
scope a
  scope container
    scope a
      scope a
        scope a
        endscope
      endscope
    endscope
    scope a2
    endscope
    scope a3
    endscope
    function testa
  endscope
endscope
endlibrary


private function a
public function a
static function a
private static function a
public static function a
globals
function
private constant integer array a
endglobals


library kkk

scope aa
struct aaa extends bb


endstruct
endscope
method a
endmethod
endlibrary
/*
method a
endstruct
library
method a
endstruct
scope
method a
endscope
endlibrary
*/
5`);
console.log(program);
export{};