const Zz = "//";

/**
 * 
 * @param line 解析一行单行注释
 */
function parseComment(line:string){
  if(line && line.trimStart().startsWith(Zz)){
    const zzIndex = line.indexOf(Zz);
    return line.substring(zzIndex + Zz.length).trimStart();
  }else{
    return "";
  }
}

export {
  parseComment
};