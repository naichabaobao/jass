import * as vscode from 'vscode';
import { Jasss } from '../main/include-file';
import { language } from '../main/constant';
import { parseLocal } from '../main/local';
import { Keyword } from '../main/keyword';
import { parseTakes, parseFunctions } from '../main/function';
import { parseGlobals } from '../main/global';
import { commonJFilePath } from '../main/path';
import { CommonJJass, BlizzardJJass, CommonAiJJass, DzApiJJass } from '../main/file';

class DefinitionProvider implements vscode.DefinitionProvider {

  private convertFileNameToUrl(fileName: string): string {
    return `file:${fileName}`;
  }

  /**
   * 目前仅提供用户文件跳转
   * @param key 
   */
  private getLocations(key: string): Array<vscode.Location> {
    const locations = new Array<vscode.Location>();

    [...Jasss,CommonJJass,BlizzardJJass,CommonAiJJass,DzApiJJass].forEach(jass => {
      jass.globals.forEach(global => {
        if (global.name == key) {
          const location = new vscode.Location(vscode.Uri.parse(this.convertFileNameToUrl(jass.fileName)), global.range);
          locations.push(location);
        }
      });
      jass.functions.forEach(func => {
        if (func.name == key) {
          const location = new vscode.Location(vscode.Uri.parse(this.convertFileNameToUrl(jass.fileName)), func.range);
          locations.push(location);
        }
      });
      jass.natives.forEach(native => {
        if (native.name == key) {
          const location = new vscode.Location(vscode.Uri.parse(this.convertFileNameToUrl(jass.fileName)), native.range);
          locations.push(location);
        }
      });
    });

    return locations;
  }

  /**
   * 解析当前文档
   */
  private getCurrentLocations(document: vscode.TextDocument, position: vscode.Position, key: string): Array<vscode.Location> {
    const locations = new Array<vscode.Location>();

    // 以function开头
    const functionLineRegExp = new RegExp(`^\\s*${Keyword.Function}\\b`);

    // 找local和方法参数
    for (let i = position.line; i >= 0; i--) {

      const TextLine = document.lineAt(i);
      const text = TextLine.text;
      if (!TextLine.isEmptyOrWhitespace) {

        try{
          const local = parseLocal(text);
          if (local) {
          if (local.name == key) {
            const nameIndex = Math.max(text.indexOf(local.name), 0);
            const location = new vscode.Location(document.uri, new vscode.Range(i, nameIndex, i, nameIndex + local.name.length));
            locations.push(location);
          }
        } 
        }catch(err){
          console.error(err);
        }
        if (functionLineRegExp.test(text)) {
          const takes = parseTakes(text);
          takes.forEach(take => {
            if (take.name == key) {
              const nameIndex = Math.max(text.indexOf(take.name), 0);
              const location = new vscode.Location(document.uri, new vscode.Range(i, nameIndex, i, nameIndex + take.name.length));
              locations.push(location);
            }
          });
          break;
        }

      }
    }

    const content = document.getText();

    // 找globals
    parseGlobals(content).forEach(global => {
      if (global.name == key) {
        const location = new vscode.Location(document.uri, global.range);
        locations.push(location);
      }
    });

    // 找方法
    parseFunctions(content).forEach(func => {
      if (func.name == key) {
        const location = new vscode.Location(document.uri, func.range);
        locations.push(location);
      }
    });

    return locations;
  }

  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {

    let key = document.getText(document.getWordRangeAtPosition(position));
    // new vscode.Location(vscode.Uri.file(commonJFilePath),new vscode.Range(2,0,2,0))
    return [...this.getLocations(key),...this.getCurrentLocations(document,position,key),];
  }

}

vscode.languages.registerDefinitionProvider(language, new DefinitionProvider);
