/*
流程
先查找當前文件 -> 再去找common等文件 -> 再去找includes文件
一旦找到了就直接返回，不再無畏的往下找
*/

import * as vscode from 'vscode';

import { AllKeywords } from './keyword';
import { Types } from './types';
import * as jassAst from "../jass/ast";
import * as vjassAst from "../vjass/ast";
import * as zincAst from "../zinc/ast";
import { Program } from "../jass/ast";
import {
  commonJProgram,
  blizzardJProgram,
  dzApiJProgram,
  commonAiProgram,
  JassMap,
  VjassMap,
  ZincMap
} from "./data"
import { Rangebel } from '../common';
import { Options } from './options';


const toVsPosition = <T extends Rangebel>(any: T) => {
  const range = new vscode.Range(any.loc.start.line, any.loc.start.position, any.loc.end.line, any.loc.end.position);
  return range ?? new vscode.Position(any.loc.start.line, any.loc.start.position);
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

  private all(document: vscode.TextDocument, position: vscode.Position, key: string) {
    const contents: Array<jassAst.Native | jassAst.Func | vjassAst.Func | zincAst.Func | zincAst.Method | vjassAst.Method | jassAst.Global | vjassAst.Global | vjassAst.Struct | vjassAst.Method | vjassAst.Member | zincAst.Global | zincAst.Struct | zincAst.Member | jassAst.Local | jassAst.Take | zincAst.Local> = [];

    const locations = new Array<vscode.Location>();

    contents.push(...commonJProgram.natives, ...commonJProgram.functions, ...commonJProgram.globals);
    contents.push(...commonAiProgram.natives, ...commonAiProgram.functions, ...commonAiProgram.globals);
    contents.push(...blizzardJProgram.natives, ...blizzardJProgram.functions, ...blizzardJProgram.globals);
    contents.push(...dzApiJProgram.natives, ...dzApiJProgram.functions, ...dzApiJProgram.globals);
    JassMap.forEach((program, path) => {
      contents.push(...program.natives, ...program.functions, ...program.globals);
      if (path == document.uri.fsPath) {
        program.functions.forEach((func) => {
          if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
            contents.push(...func.locals);
            contents.push(...func.takes);
          }
        });
      }

    });
    VjassMap.forEach((program, path) => {
      program.librarys.forEach((library) => {

        contents.push(...library.functions);
        contents.push(...library.globals);
        library.structs.forEach((struct) => {
          contents.push(struct);
          contents.push(...struct.methods);
        });

        if (path == document.uri.fsPath) {
          library.functions.forEach((func) => {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              contents.push(...func.locals);
              contents.push(...func.takes);
            }
          });
          library.structs.forEach((struct) => {
            if (new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position).contains(position)) {
              contents.push(...struct.members);
              contents.push(...struct.methods);
              struct.methods.forEach((method) => {
                if (new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position).contains(position)) {
                  contents.push(...method.locals);
                  contents.push(...method.takes);
                }
              });
            }
          });
        }
      });
    });
    ZincMap.forEach((program, path) => {
      program.librarys.forEach((library) => {

        contents.push(...library.functions);
        contents.push(...library.globals);
        library.structs.forEach((struct) => {
          contents.push(struct);
          contents.push(...struct.methods);
        });

        if (path == document.uri.fsPath) {
          library.functions.forEach((func) => {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              contents.push(...func.locals);
              contents.push(...func.takes);
            }
          });
          library.structs.forEach((struct) => {
            if (new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position).contains(position)) {
              contents.push(...struct.members);
              contents.push(...struct.methods);
              struct.methods.forEach((method) => {
                if (new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position).contains(position)) {
                  contents.push(...method.locals);
                  contents.push(...method.takes);
                }
              });
            }
          });
        }
      });
    });

    return locations;
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
    let location: vscode.Location | null = null;

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
          const commonAiLocation = this.programToLocation(key, vscode.Uri.file(Options.commonAiPath), commonAiProgram);
          if (commonAiLocation) {
            location = commonAiLocation;
          } else {
          }
        }
      }
    }

    if (location) {
      return location;
    }
    console.log(key);
    const locations = new Array<vscode.Location>();

    JassMap.forEach((program, path) => {
      program.natives.forEach((native) => {
        if (native.name == key) {
          const range = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
          locations.push(new vscode.Location(vscode.Uri.file(path), range));
        }
      });
      program.functions.forEach((func) => {
        if (func.name == key) {
          const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
          locations.push(new vscode.Location(vscode.Uri.file(path), range));
        }
        if (path == document.uri.fsPath) {
          program.functions.forEach((func) => {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              func.takes.forEach(take => {
                if (take.name == key) {
                  const range = new vscode.Range(take.loc.start.line, take.loc.start.position, take.loc.end.line, take.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
              func.locals.forEach(local => {
                if (local.name == key) {
                  const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
            }
          });
        }
      });
      program.globals.forEach((global) => {
        if (global.name == key) {
          const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
          locations.push(new vscode.Location(vscode.Uri.file(path), range));
        }
      });
    });
    VjassMap.forEach((program, path) => {
      program.librarys.forEach((library) => {
        library.functions.forEach((func) => {
          if (func.name == key) {
            const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            locations.push(new vscode.Location(vscode.Uri.file(path), range));
          }
        });
        library.globals.forEach((global) => {
          if (global.name == key) {
            const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
            locations.push(new vscode.Location(vscode.Uri.file(path), range));
          }
        });
        library.structs.forEach((struct) => {
          if (struct.name == key) {
            const range = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
            locations.push(new vscode.Location(vscode.Uri.file(path), range));
          }
          struct.methods.forEach((method) => {
            if (method.name == key) {
              const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
              locations.push(new vscode.Location(vscode.Uri.file(path), range));
            }
          });
        });
        if (path == document.uri.fsPath) {
          library.functions.forEach((func) => {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              func.takes.forEach(take => {
                if (take.name == key) {
                  const range = new vscode.Range(take.loc.start.line, take.loc.start.position, take.loc.end.line, take.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
              func.locals.forEach(local => {
                if (local.name == key) {
                  const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
            }
          });
          library.structs.forEach((struct) => {
            if (new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position).contains(position)) {
              struct.members.forEach(member => {
                if (member.name == key) {
                  const range = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
              struct.methods.forEach((method) => {
                if (new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position).contains(position)) {
                  method.takes.forEach(take => {
                    if (take.name == key) {
                      const range = new vscode.Range(take.loc.start.line, take.loc.start.position, take.loc.end.line, take.loc.end.position);
                      locations.push(new vscode.Location(vscode.Uri.file(path), range));
                    }
                  });
                  method.locals.forEach(local => {
                    if (local.name == key) {
                      const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                      locations.push(new vscode.Location(vscode.Uri.file(path), range));
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
    ZincMap.forEach((program, path) => {
      program.librarys.forEach((library) => {
        library.functions.forEach((func) => {
          if (func.name == key) {
            const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            locations.push(new vscode.Location(vscode.Uri.file(path), range));
          }
        });
        library.globals.forEach((global) => {
          if (global.name == key) {
            const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
            locations.push(new vscode.Location(vscode.Uri.file(path), range));
          }
        });
        library.structs.forEach((struct) => {
          if (struct.name == key) {
            const range = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
            locations.push(new vscode.Location(vscode.Uri.file(path), range));
          }
          struct.methods.forEach((method) => {
            if (method.name == key) {
              const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
              locations.push(new vscode.Location(vscode.Uri.file(path), range));
            }
          });
        });
        if (path == document.uri.fsPath) {
          library.functions.forEach((func) => {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              func.takes.forEach(take => {
                if (take.name == key) {
                  const range = new vscode.Range(take.loc.start.line, take.loc.start.position, take.loc.end.line, take.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
              func.locals.forEach(local => {
                if (local.name == key) {
                  const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
            }
          });
          library.structs.forEach((struct) => {
            if (new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position).contains(position)) {
              struct.members.forEach(member => {
                if (member.name == key) {
                  const range = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
                  locations.push(new vscode.Location(vscode.Uri.file(path), range));
                }
              });
              struct.methods.forEach((method) => {
                if (new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position).contains(position)) {
                  method.takes.forEach(take => {
                    if (take.name == key) {
                      const range = new vscode.Range(take.loc.start.line, take.loc.start.position, take.loc.end.line, take.loc.end.position);
                      locations.push(new vscode.Location(vscode.Uri.file(path), range));
                    }
                  });
                  console.log(method)
                  method.locals.forEach(local => {
                    if (local.name == key) {
                      const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                      locations.push(new vscode.Location(vscode.Uri.file(path), range));
                      
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
    return locations;
  }

}());
