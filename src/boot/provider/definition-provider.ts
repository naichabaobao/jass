/*
流程
先查找當前文件 -> 再去找common等文件 -> 再去找includes文件
一旦找到了就直接返回，不再無畏的往下找
*/

import * as vscode from 'vscode';

import { AllKeywords } from './keyword';
import { Types } from './types';
// import { commonJFile, commonAiFile, blizzardJFile, dzApiJFile, includeFiles } from "./data";
import { Program } from "../jass/ast";
import {
  commonJProgram,
  blizzardJProgram,
  dzApiJProgram,
  includePrograms,
  commonAiProgram,
  includeJassPrograms,
  includeMap,
  workMap
} from "./data"
import { Rangebel } from '../common';
import { Options } from './options';
import { parse } from '../jass/parse';


const toVsPosition = <T extends Rangebel>(any: T) => {
  return new vscode.Position(any.loc.start.line, any.loc.start.position);
};

vscode.languages.registerDefinitionProvider("jass", new class NewDefinitionProvider implements vscode.DefinitionProvider {

  private _maxLength = 255;

  private isNumber = function (val: string) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
      return true;
    } else {
      return false;
    }
  }

  private programToLocation(key: string, uri: vscode.Uri, program: Program): vscode.Location | null {
    let location: vscode.Location | null = null;
    const currentFunc = program.functions.find(func => func.name == key);

    if (currentFunc) {
      location = new vscode.Location(uri, toVsPosition(currentFunc));
    } else {
      const currentGlobal = program.globals.find(global => global.name == key);
      if (currentGlobal) {
        location = new vscode.Location(uri, toVsPosition(currentGlobal));
      } else {
        const currentNative = program.natives.find(global => global.name == key);
        if (currentNative) {
          location = new vscode.Location(uri, toVsPosition(currentNative));
        } else {
          return null;
        }
      }
    }
    /*
    const currentStruct = program.allStructs.find(struct => struct.name == key);
    if (currentStruct) {
      location = new vscode.Location(uri, toVsPosition(currentStruct));
    } else {
      const currentMethod = program.allStructs.map(struct => {
        return struct.methods;
      }).flat().find(method => method.name == key);
      if (currentMethod) {
        location = new vscode.Location(uri, toVsPosition(currentMethod));
      } else {
        return null;
      }
    }*/

    return location;
  }

  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    const key = document.getText(document.getWordRangeAtPosition(position));
    // console.log(key);
    if (key.length > this._maxLength) {
      return null;
    }

    if (this.isNumber(key)) {
      return null;
    }

    if (AllKeywords.includes(key)) {
      return null;
    }

    const type = Types.find(type => type === key);
    if (type) {
      return null;
    }
    let location: vscode.Location | null = null;

    const currentProgram = workMap
    for (const key in workMap) {
      if (workMap.has(key)) {
        const program = <Program>workMap.get(key);
        const workIocation = this.programToLocation(key, vscode.Uri.file(key), program);
        if (workIocation) {
          return workIocation;
        }
      }
    }
    const commonJLocation = this.programToLocation(key, vscode.Uri.file(Options.commonJPath), commonJProgram);
    if (commonJLocation) {
      location = commonJLocation;
    } else {
      const blizzardJLocation = this.programToLocation(key, vscode.Uri.file(Options.blizzardJPath), blizzardJProgram);
      if (blizzardJLocation) {
        location = blizzardJLocation;
      } else {
        const dzApiJLocation = this.programToLocation(key, vscode.Uri.file(Options.dzApiJPath), dzApiJProgram);
        if (dzApiJLocation) {
          location = dzApiJLocation;
        } else {
          let hit = false;
          for (const key in includeMap) {
            if (includeMap.has(key)) {
              const includeProgram = <Program>includeMap.get(key);
              const includeLocation = this.programToLocation(key, vscode.Uri.file(key), includeProgram);
              if (includeLocation) {
                location = includeLocation;
                if (!hit) {
                  hit = true;
                }
              }
            }
          }
          if (!hit) {
            const commonAiLocation = this.programToLocation(key, vscode.Uri.file(Options.commonAiPath), commonAiProgram);
            if (commonAiLocation) {
              location = commonAiLocation;
            }
          }
        }
      }
    }
    return location;
  }

}());
