import { tokenizer } from "./tokens";
import { parsing } from "./parsing";

console.time("parsing")
const tokens = tokenizer(`
// 小小玩意
native haha takes string str,integer int returns nothing
function haha takes string str,integer int returns nothing
123 local integer name = 12
endfunction
function haha takes string str,integer int returns nothing
123 local integer name = 12
endfunction
`);

const progam = parsing(tokens);

console.log(JSON.stringify(progam, null, 2));
console.timeEnd("parsing")

