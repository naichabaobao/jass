/*
流程
先查找當前文件 -> 再去找common等文件 -> 再去找includes文件
一旦找到了就直接返回，不再無畏的往下找
*/

import * as vscode from 'vscode';

import { AllKeywords } from './keyword';
import { Types } from './types';
import { Func, Library, Local, Member, Method, Program, Take } from "../jass/ast";
import data, { DataGetter, parseContent } from "./data";
import { Rangebel, Global, Native, Struct} from '../jass/ast';
import { Options } from './options';
import { compare, isZincFile } from '../tool';
import { convertPosition, fieldFunctions } from './tool';


const toVsPosition = (any: De) => {
  const range = new vscode.Range(any.loc.start.line, any.loc.start.position, any.loc.end.line, any.loc.end.position);
  return range ?? new vscode.Position(any.loc.start.line, any.loc.start.position);
};

type De = Native|Func|Method|Library|Struct|Member|Global|Local|Take;

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
      }
    }, !Options.isOnlyJass && Options.supportZinc, !Options.isOnlyJass && Options.isSupportCjass);

    return locations;
  }

}());
