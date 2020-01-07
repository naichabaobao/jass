import { Type } from './type';
import {Origin} from './origin';

export interface JassFunction{
  name:string;
  takes:Array<Take>;
  returns:Type;

}

export class Take implements Origin{
  type:Type = Type.nothing;
  name:string = "";

  public origin():string{
    return `${this.type.name} ${this.name}`;
  }
}

export class Native implements JassFunction, Origin{
  name: string = "";
  takes: Take[] = [];
  returns: Type = Type.nothing;
  isConstant: boolean = false;

  public origin():string{
    return `${this.isConstant?"constant ":""}native ${this.name} takes ${this.takes.map(take => take.origin()).join(" ,")} returns ${this.returns.name}`;
  }
}

export class Function  implements JassFunction, Origin{
  name: string = "";
  takes: Take[] = [];
  returns: Type = Type.nothing;

  public origin():string{
    return `function ${this.name} takes ${this.takes.map(take => take.origin()).join(" ,")} returns ${this.returns.name}`;
  }
}
