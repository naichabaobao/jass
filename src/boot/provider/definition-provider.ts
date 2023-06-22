import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

import { AllKeywords } from '../jass/keyword';
import { Types } from './types';
import { Func, Library, Local, Member, Method, Program, Take } from "../jass/ast";
import data, { DataGetter, parseContent } from "./data";
import { Rangebel, Global, Native, Struct} from '../jass/ast';
import { Options } from './options';
import { compare, isAiFile, isJFile, isLuaFile, isZincFile } from '../tool';
import { convertPosition, fieldFunctions } from './tool';
import { tokenize } from '../jass/tokens';
import { TextMacroDefine } from '../jass/ast';


const toVsPosition = (any: De) => {
  const range = new vscode.Range(any.loc.start.line, any.loc.start.position, any.loc.end.line, any.loc.end.position);
  return range ?? new vscode.Position(any.loc.start.line, any.loc.start.position);
};

type De = Native|Func|Method|Library|Struct|Member|Global|Local|Take|TextMacroDefine;

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

  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    const key = document.getText(document.getWordRangeAtPosition(position));
    console.log(key);
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
    console.log(key);

    const fsPath = document.uri.fsPath;
    const locations = new Array<vscode.Location>();

    new DataGetter().forEach((program, filePath) => {
      const isCurrent = compare(fsPath, filePath);
      
      if (!Options.isOnlyJass) {
        program.getNameLibrary(key).forEach(library => {
          const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(library));
          locations.push(location);
        });
        program.getNameStruct(key).forEach(struct => {
          const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(struct));
          locations.push(location);
        });
        program.getNameMethod(key).forEach(method => {
          const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(method));
          locations.push(location);
        });
        program.getNameMember(key).forEach(member => {
          const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(member));
          locations.push(location);
        });
      }
      program.getNameGlobal(key).forEach(global => {
        const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(global));
        locations.push(location);
      });
      program.getNameFunction(key).forEach(func => {
        const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(func));
        locations.push(location);
      });
      program.getNameNative(key).forEach(func => {
        const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(func));
        locations.push(location);
      });
    
      if (isCurrent) {

        const findedFunc = program.getPositionFunction(convertPosition(position));
        if (findedFunc) {
          findedFunc.takes.filter(take => take.name == key).forEach((take, index) => {
            const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(take));
            locations.push(location);
          });
    
          findedFunc.locals.filter(local => local.name == key).forEach(local => {
            const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(local));
            locations.push(location);
          });
        }
        
        const findedMethod = program.getPositionMethod(convertPosition(position));
        if (findedMethod) {
          findedMethod.takes.filter(take => take.name == key).forEach((take, index) => {
            const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(take));
            locations.push(location);
          });
    
          findedMethod.locals.filter(local => local.name == key).forEach(local => {
            const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(local));
            locations.push(location);
          });
        }

        const findedDefineIndex = program.defines.findIndex(define => define.id.name == key);
        if (findedDefineIndex != -1) {
          const findedDefine = program.defines[findedDefineIndex];
          const location = new vscode.Location(vscode.Uri.file(filePath), toVsPosition(findedDefine));
          locations.push(location);
        }


      }
    }, !Options.isOnlyJass && Options.supportZinc, !Options.isOnlyJass && Options.isSupportCjass);

    return locations;
  }

}());

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

  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    const locations = new Array<vscode.Location>();

    const tokens = tokenize(document.lineAt(position).text);
    if (tokens.length >= 2 && tokens[0].value == "#include" && tokens[1].isString()) {
      const key = tokens[1].value;

      console.log("file key: " + key);

      const prefixContent = key.substring(1, key.length - 1);

      const currentFileDir = () => {
        return path.parse(document.uri.fsPath).dir;
      };

      const realPath = path.isAbsolute(prefixContent) ? path.resolve(prefixContent) : path.resolve(currentFileDir(), prefixContent);
      const stat = fs.statSync(realPath);
      if (stat.isFile()) {
        const location = new vscode.Location(vscode.Uri.file(realPath), new vscode.Range(0, 0, 0, 0));
        locations.push(location);
      } else if (stat.isDirectory()) {
        const paths = fs.readdirSync(realPath);
        paths.forEach((p) => {
          const filePath = path.resolve(realPath, p);
          if (fs.statSync(filePath).isDirectory()) {
          } else if (isJFile(filePath) || isZincFile(filePath) || isAiFile(filePath) || isLuaFile(filePath)) {
            const location = new vscode.Location(vscode.Uri.file(filePath), new vscode.Range(0, 0, 0, 0));
            locations.push(location);
          }
        });
      }
    } else {
      return null;
    }

    return locations;
  }

}());
