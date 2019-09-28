const j = require("../js/j");
const j2 = require("../js/j2");

const jj = { ...j, ...j2 }

let obj = {};

for (const key in jj) {
  if (jj.hasOwnProperty(key)) {
    const element = jj[key];
    console.log(element.name);
    if (obj[element.fileName]) {
      obj[element.fileName][element.name] = element.documentation;
    } else {
      obj[element.fileName] = {};
    }
  }
}

console.log(obj)

require("fs").writeFileSync("E:/jass/src/js/jass/desc.js", `/**
* @description 本翻译借用WorldEdit v1.2.3内置翻译。
* @author 十月,1171866049
*/
module.exports = ` + JSON.stringify(obj), {
  encoding: "UTF-8"
});
