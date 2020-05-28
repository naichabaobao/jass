// 从common.j中解析出type


import {getCommonJPath} from './config';
import { readFileSync } from 'fs';
import('fs');

const commonJContent = readFileSync(getCommonJPath());

class Type {
  private _name:string;
  private _extend:string|null = null;

  constructor(name:string,extend?:string) {
    this._name = name;
    if(extend) this._extend = extend;
  }

  public static parse() {
    const reg = ""//
  }

}


