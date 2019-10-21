const fs = require("fs");
const path = require("path");

const desc = require("../js/jass/desc");

const name = "DzAPI.j";

let content = fs.readFileSync("F:/jass/src/resources/jass/" + name).toString("utf8");

for (const key in desc[name]) {
  if (desc[name][key].length > 0) {
    content = content.replace(new RegExp(`(function|(constant\\s+)?native)\\s+${key}`), (args) => {
      console.log(args)
      return `// ${desc[name][key]}\n${args}`
    })
  }
}

fs.writeFileSync("C:/Users/Administrator/Desktop/" + name + "2.j", content, {
  encoding: "utf8"
})