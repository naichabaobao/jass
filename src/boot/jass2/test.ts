
// 空串用时
/*
78.489ms
console.time("parseInt")
for (let index = 0; index < 0xffff; index++) {
    const id = "abcd";
    parseInt("0x" + id.charCodeAt(0).toString(16) + id.charCodeAt(1).toString(16) + id.charCodeAt(2).toString(16) + id.charCodeAt(3).toString(16));
}
console.timeEnd("parseInt")

console.time("<<")
for (let index = 0; index < 0xffff; index++) {
    const id = "abcd";
    (id.charCodeAt(0) << 24) + (id.charCodeAt(1) << 16) + (id.charCodeAt(2) << 8) + id.charCodeAt(3);
}
console.timeEnd("<<")


console.time("isEmpty1")
function isEmpty1(text) {
    return /^\s*$/.test(text);
}
console.log(isEmpty1("                                       "))
console.log(isEmpty1("                                       1"))
for (let index = 0; index < 500000; index++) {
    isEmpty1("                                       ")
    isEmpty1("                                       1")
    isEmpty1("1                                       1")
}
console.timeEnd("isEmpty1")
91.07ms
console.time("isEmpty2")
function isEmpty2(text) {
    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        if (char != " " && char != "\t") {
            return false;
        }
    }
    return true;
}
console.log(isEmpty2("                                       "))
console.log(isEmpty2("                                       1"))
for (let index = 0; index < 500000; index++) {
    isEmpty2("                                       ")
    isEmpty2("                                       1")
    isEmpty2("2                                       1")
}
console.timeEnd("isEmpty2")
67.805ms
console.time("isEmpty3")
function isEmpty3(text) {

    return text.trim().length == 0;
}
console.log(isEmpty3("                                       "))
console.log(isEmpty3("                                       1"))
for (let index = 0; index < 500000; index++) {
    isEmpty3("                                       ")
    isEmpty3("                                       1")
    isEmpty3("3                                       1")
}
console.timeEnd("isEmpty3")

*/

/*
第一个字符下标查找 startIndex2 比 startIndex1 性能优，差距不大
console.time("start-index-1")
function startIndex1(params) {
    for (let index = 0; index < params.length; index++) {
        const element = params[index];
        if (element != " " && element != "\t") {
            return index;
        }
    }
    return params.length;
}
console.log(startIndex1("                                       "));
for (let index = 0; index < 500000; index++) {
    startIndex1("                                       ")
    startIndex1("                                       1")
    startIndex1("3                                       1")
}
console.timeEnd("start-index-1")

console.time("start-index-2")
function startIndex2(params) {
    const result = /^\s*(?:\b|$)/.exec(params);
    if (result) {
        return result[0].length;
    }
    return 0;
}
console.log(startIndex2("                                       "));
for (let index = 0; index < 500000; index++) {
    startIndex2("                                       ")
    startIndex2("                                       1")
    startIndex2("3                                       1")
}
console.timeEnd("start-index-2")
 */

/*
分行
function linesByIndexOf(content: string) {
    const LineTexts: string[] = [];

    for (let index = 0; index < content.length;) {
        const newLineIndex = content.indexOf("\n", index);
        const fieldText = content.substring(index, newLineIndex == -1 ? content.length : newLineIndex + 1);

        LineTexts.push(fieldText);

        if (newLineIndex == -1) {
            break;
        } else {
            index = newLineIndex + 1;
        }
    }

    return LineTexts;
}
function linesBySplit(content: string) {
    const ls = content.split("\n");

    const last = ls.pop();

    const lineTexts = ls.map(x => x + "\n");

    if (last) {
        lineTexts.push(last);
    }

    return lineTexts;
}
function linesByMatch(content: string) {
    const result = content.match(/[^\n\r]+/g);

    return result ? [...result] : [];
}
let CS = 1;
console.time("linesByIndexOf")
for (let index = 0; index < CS; index++) {
    const s = linesByIndexOf(`\n\n\n
    123 
        456
            789
    `)
    
    
}
console.timeEnd("linesByIndexOf")


console.time("linesBySplit")
for (let index = 0; index < CS; index++) {
    const s = linesBySplit(`\n\n\n
    123 
        456
            789
    `)
    console.log(s);
}
console.timeEnd("linesBySplit")
console.time("linesByMatch")
for (let index = 0; index < CS; index++) {
    const s = linesByMatch(`\n\n\n
    123 
        456
            789
    `)
    console.log(s);
    
}
console.timeEnd("linesByMatch")
*/