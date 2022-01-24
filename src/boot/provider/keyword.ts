import { unique } from "../tool";

const JassKeywork = ["function","endfunction","constant","native","local","type","set","call","takes","returns","extends","array","true","false","null","nothing","if","else","elseif","endif","then","loop","endloop","exitwhen","return","and","or","not","globals","endglobals"];

const Keywords = ["integer","real","boolean","string","handle","code", ...JassKeywork];

const VjassKeywords = ["library","initializer","needs","uses","requires","endlibrary","scope","endscope","private","public","static","interface","endinterface","implement","struct","endstruct","method","endmethod","this","delegate","operator","debug","module","endmodule","optional","stub","key","thistype","onInit","onDestroy","hook","defaults","execute","create","destroy","size","name","allocate","deallocate"];

const ZincKeywords = unique([...Keywords, "for", "while", "library", "interface", "static", "method", "debug", "debug", "break", "operator", "module", "optional", "delegate", "private", "public", "requires"]);

const AllKeywords = unique([...Keywords, ...VjassKeywords, ...ZincKeywords]);

function isKeyword(keyword: string) {
  return JassKeywork.includes(keyword);
}

export{
  Keywords,
  AllKeywords,
  ZincKeywords,
  isKeyword
}