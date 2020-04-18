// 从common.j中解析出type

import {common_j} from '../configuration';
import {commonJFilePath} from '../path';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import * as vscode from 'vscode';

function getCommonJPath() {
  return common_j() ?? commonJFilePath;
}


const CommonJContent = readFileSync(getCommonJPath()).toString("utf8");

