import {Options} from "./options";
import * as fs from "fs";

import {Program} from "./jass";


const commonJContent = fs.readFileSync(Options.commonJPath).toString();
const commonJProgram = new Program(Options.commonJPath, commonJContent);

const commonAiContent = fs.readFileSync(Options.commonAiPath).toString();
const commonAiProgram = new Program(Options.commonAiPath, commonAiContent);

const blizzardJContent = fs.readFileSync(Options.blizzardJPath).toString();
const blizzardJProgram = new Program(Options.blizzardJPath, blizzardJContent);

const dzApiJContent = fs.readFileSync(Options.dzApiJPath).toString();
const dzApiJProgram = new Program(Options.dzApiJPath, dzApiJContent);

const includePrograms = Options.includes.map(path => {
  const content = fs.readFileSync(path).toString();
  const program = new Program(path, content);
  return program;
});

export {
  commonJProgram,
  commonAiProgram,
  blizzardJProgram,
  dzApiJProgram,
  includePrograms
};