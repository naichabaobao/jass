import {Options} from "./options";
import * as fs from "fs";

import {Program} from "./jass-parse";

const commonJProgram = new Program(Options.commonJPath, fs.readFileSync(Options.commonJPath).toString());

const commonAiProgram = new Program(Options.commonAiPath, fs.readFileSync(Options.commonAiPath).toString());

const blizzardJProgram = new Program(Options.blizzardJPath, fs.readFileSync(Options.blizzardJPath).toString());


const dzApiJProgram = new Program(Options.dzApiJPath, fs.readFileSync(Options.dzApiJPath).toString());

const includePrograms = Options.includes.map(path => {
  const content = fs.readFileSync(path).toString();
  const program = new Program(path, content);
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