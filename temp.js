// const fs = require("fs");
// const path = require("path");

// const {Parser} = require("./out/boot/jass/parser");
// const { Context } = require("./out/boot/jass/ast");
// const { lines } = require("./out/boot/jass/tool");
// if (false) {

//     const configFilePath = path.resolve(__dirname, "./static/jass.config.json");
//     const ability_OrderIDFilePath = path.resolve(__dirname, "./static/ability_OrderID.j");
    
    
//     const ability_OrderIDFileContent = fs.readFileSync(ability_OrderIDFilePath, {encoding: "utf8"}).toString();
//     const lineTexts = lines(ability_OrderIDFileContent);
    
//     function getLineNumberValue(line) {
//         const text = lineTexts.find(value => value.lineNumber() == line).getText();
    
//         const value = Number.parseInt(/\d+/.exec(text)[0], 10);
    
//         return value;
//     }
    
//     const context = new Context();
//     const parser = new Parser(context, ability_OrderIDFileContent);
    
//     const result = parser.parsing();
    
//     /**
//      * @type {Array<any>}
//      */
//     const globals = result.allGlobals();
    
//     // console.log(globals);
    
//     const ids = globals.map(g => {
//         return {
//             value: getLineNumberValue(g.loc.start.line),
//             descript: g.getContents().join("\\n")
//         }
//     });
    
//     const configFileContent = fs.readFileSync(configFilePath, {encoding: "utf8"}).toString();
    
//     const configObject = JSON.parse(configFileContent, (key, value) => {
//         if (key == "numbers") {
//             return ids;
//         } else return value;
//     });
    
//     console.log(configObject);
    
//     fs.writeFileSync(configFilePath, JSON.stringify(configObject,null, 4), {
//         encoding: "utf8"
//     })
    
    
// }