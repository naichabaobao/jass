const jg = require("../js/jg");

let obj = {};

for (const key in jg) {
  if (jg.hasOwnProperty(key)) {
    const element = jg[key];
    console.log(element.name);
    if (obj[element.fileName]) {
      obj[element.fileName][element.name] = element.documentation;
    } else {
      obj[element.fileName] = {};
    }
  }
}

console.log(obj)

require("fs").writeFileSync("E:/jass/src/js/jass/desc-globals.js", "module.exports = " + JSON.stringify(obj), {
  encoding: "UTF-8"
});
