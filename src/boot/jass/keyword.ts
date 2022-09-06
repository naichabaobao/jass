const JassKeywork = ["function","endfunction","constant","native","local","type","set","call","takes","returns","extends","array","true","false","null","nothing","if","else","elseif","endif","then","loop","endloop","exitwhen","return","and","or","not","globals","endglobals"];

const Keywords = ["integer","real","boolean","string","handle","code", ...JassKeywork];

function isKeyword(keyword: string) {
  return JassKeywork.includes(keyword);
}

export{
  isKeyword
};