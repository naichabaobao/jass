import {common_j} from './configuration';

const path = require("path");

const commonJFilePath = path.resolve(__dirname, "../../src/resources/static/jass/common.j");
const blizzardJFilePath = path.resolve(__dirname, "../../src/resources/static/jass/blizzard.j");
const commonAiFilePath = path.resolve(__dirname, "../../src/resources/static/jass/common.ai");
const DzAPIJFilePath = path.resolve(__dirname, "../../src/resources/static/jass/DzAPI.j");

function getCommonJPath() {
  return common_j() ?? commonJFilePath;
}

export {commonJFilePath, blizzardJFilePath,commonAiFilePath,DzAPIJFilePath,getCommonJPath};
