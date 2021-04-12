import {Options} from "./options";
import * as fs from "fs";

import {Program} from "./jass";


const commonJContent = fs.readFileSync(Options.commonJPath).toString();
const commonJFile = {
  path: Options.commonJPath,
  content: commonJContent
};
const commonJProgram = new Program(Options.commonJPath, commonJContent);

const commonAiContent = fs.readFileSync(Options.commonAiPath).toString();
const commonAiFile = {
  path: Options.commonAiPath,
  content: commonAiContent
};
const commonAiProgram = new Program(Options.commonAiPath, commonAiContent);

const blizzardJContent = fs.readFileSync(Options.blizzardJPath).toString();
const blizzardJFile = {
  path: Options.blizzardJPath,
  content: blizzardJContent
};
const blizzardJProgram = new Program(Options.blizzardJPath, blizzardJContent);

const dzApiJContent = fs.readFileSync(Options.dzApiJPath).toString();
const dzApiJFile = {
  path: Options.dzApiJPath,
  content: dzApiJContent
};
const dzApiJProgram = new Program(Options.dzApiJPath, dzApiJContent);

const includeFiles = Options.includes.map(path => {
  const content = fs.readFileSync(path).toString();
  return {
    path, content
  };
});
const includeContents = includeFiles.map(x => {
  return x.content;
});
const includePrograms = includeFiles.map(x => {
  const program = new Program(x.path, x.content);
  return program;
});

const programs = [commonJProgram, commonAiProgram, dzApiJProgram, blizzardJProgram, ...includePrograms];
const scopes = programs.map(program => program.allScope).flat();
const librarys = programs.map(program => program.librarys).flat();
const types = programs.map(program => program.types).flat();
const natives = programs.map(program => program.natives).flat();
const functions = programs.map(program => program.allFunctions).flat();
const globals = programs.map(program => program.allGlobals).flat();
const structs = programs.map(program => program.allStructs).flat();

export {
  commonJFile,
  commonAiFile,
  blizzardJFile,
  dzApiJFile,
  includeFiles,
  commonJProgram,
  commonAiProgram,
  blizzardJProgram,
  dzApiJProgram,
  includePrograms,
  programs,
  types,
  natives,
  functions,
  globals,
  structs,
  scopes,
  librarys
};