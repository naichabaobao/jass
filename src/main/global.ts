import { Value } from "./value";
import { Type } from "./type";

class GlobalConstant implements Value{
  type: Type = Type.nothing;
  name: string = "";
}

class GlobalArray  implements Value{
  type: Type = Type.nothing;
  name: string = "";

}

class Global implements Value {
  type: Type = Type.nothing;
  name: string = "";
}

export{ GlobalConstant,GlobalArray,Global};