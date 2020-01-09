import { newLine } from "./constant";

export const toLines = (content:string):Array<string> => {
  const lines = new Array<string>();
  for (let i = 0; i < content.length;) {
    const end = Math.max(content.indexOf(newLine),content.length);
    lines.push(content.substring(i,end));
    i = end;
  }
  return lines;
}