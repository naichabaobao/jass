const { log } = require("console");
const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.resolve(__dirname, "./jass.config.json")).toString("utf-8");

log(content.substring(0, 1000));

console.log(JSON.parse(content)["presets"]);
const presets = JSON.parse(content)["presets"];
if (Array.isArray(presets)) {
    const str = presets.map(preset => {
        const code = preset["code"];
        const name = preset["name"];
        const descript = preset["descript"];
        const kind = preset["kind"];
        const race = preset["race"];
        const type = preset["type"];

        const detailline = `// ${type}-${kind}-${race}`;
        const descriptline = `// ${descript}`;
        const nametline = `// ${name}`;
        const codeline = `'${code}'`;
        const str = [detailline, nametline, descriptline, codeline].join("\n");
        return str;
    }).join("\n\n");
    fs.writeFileSync(path.resolve(__dirname, "./presets.jass"), str, {encoding: "utf-8"});
}
const strings = JSON.parse(content)["strings"];
if (Array.isArray(strings)) {
    const str = strings.map(preset => {
        const name = preset["content"];
        const descript = preset["descript"];

        const descriptline = `// ${descript}`;
        const codeline = `"${name}"`;
        const str = [descriptline, codeline].join("\n");
        return str;
    }).join("\n\n");
    fs.writeFileSync(path.resolve(__dirname, "./strings.jass"), str, {encoding: "utf-8"});
}
const numbers = JSON.parse(content)["numbers"];
if (Array.isArray(numbers)) {
    const str = numbers.map(preset => {
        const name = preset["value"];
        const descript = preset["descript"];

        const descriptline = `// ${descript}`;
        const codeline = `${name}`;
        const str = [descriptline, codeline].join("\n");
        return str;
    }).join("\n\n");
    fs.writeFileSync(path.resolve(__dirname, "./numbers.jass"), str, {encoding: "utf-8"});
}