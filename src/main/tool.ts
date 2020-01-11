import { newLine } from "./constant";

export const toLines = (content:string):Array<string> => {
  return content.split(newLine).map(line => `${line}${newLine}`);
}