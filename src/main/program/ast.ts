

class Node {
  public left:Node|null = null;
  public right:Node|null = null;
}

class  Program extends Node {
  public globals:Array<GlobalsStatement> = new Array<GlobalsStatement>();
  public types:Array<TypeStatement> = new Array<TypeStatement>();
  public function:Array<FunctionStatement> = new Array<FunctionStatement>();
  public native:Array<GlobalsStatement> = new Array<GlobalsStatement>();
}

class Block extends Node {

}

class Statement extends Node {

}

class Expression extends Node {

}

class GlobalsStatement extends Statement {

}

class NativeStatement extends Statement {
  public name:string;

  constructor(name:string){
    super();
    this.name = name;
  }
}

class FunctionStatement extends Statement {
  public name:string;

  constructor(name:string){
    super();
    this.name = name;
  }
}

class ConstantStatement extends Statement {

}

class TypeStatement extends Statement {

}

class IdentifierStatement extends Statement {
  
}

class  AssignmentExpression extends Expression{

}




















