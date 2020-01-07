
export class Keyword {

  public static readonly Function = "function";
public static readonly Endfunction = "endfunction";
public static readonly Constant = "constant";
public static readonly Native = "native";
public static readonly Local = "local";
public static readonly Type = "type";
public static readonly Set = "set";
public static readonly Call = "call";
public static readonly Takes = "takes";
public static readonly Returns = "returns";
public static readonly Extends = "extends";
public static readonly Array = "array";
public static readonly True = "true";
public static readonly False = "false";
public static readonly Null = "null";
public static readonly Nothing = "nothing";
public static readonly If = "if";
public static readonly Else = "else";
public static readonly Elseif = "elseif";
public static readonly Endif = "endif";
public static readonly Then = "then";
public static readonly Loop = "loop";
public static readonly Endloop = "endloop";
public static readonly Exitwhen = "exitwhen";
public static readonly Return = "return";
public static readonly Integer = "integer";
public static readonly Real = "real";
public static readonly Boolean = "boolean";
public static readonly String = "string";
public static readonly Handle = "handle";
public static readonly Code = "code";
public static readonly And = "and";
public static readonly Or = "or";
public static readonly Not = "not";
public static readonly Globals = "globals";
public static readonly Endglobals = "endglobals"

  public static readonly Keywords = [Keyword.Function,Keyword.Endfunction,Keyword.Constant,Keyword.Native,Keyword.Local,Keyword.Type,Keyword.Set,Keyword.Call,Keyword.Takes,Keyword.Returns,Keyword.Extends,Keyword.Array,Keyword.True,Keyword.False,Keyword.Null,Keyword.Nothing,Keyword.If,Keyword.Else,Keyword.Elseif,Keyword.Endif,Keyword.Then,Keyword.Loop,Keyword.Endloop,Keyword.Exitwhen,Keyword.Return,Keyword.Integer,Keyword.Real,Keyword.Boolean,Keyword.String,Keyword.Handle,Keyword.Code,Keyword.And,Keyword.Or,Keyword.Not,Keyword.Globals,Keyword.Endglobals];

  public isKeyword(keyword:string):boolean{
    return Keyword.Keywords.includes(keyword);
  }

  public isNotKeyword(keyword:string):boolean{
    return !Keyword.Keywords.includes(keyword);
  }

  public isFunction(keyword:string):boolean{
    return Keyword.Function == keyword;
  }
  
  public isNotFunction(keyword:string):boolean{
    return Keyword.Function != keyword;
  }
  
public isEndfunction(keyword:string):boolean{
    return Keyword.Endfunction == keyword;
  }
  
  public isNotEndfunction(keyword:string):boolean{
    return Keyword.Endfunction != keyword;
  }
  
public isConstant(keyword:string):boolean{
    return Keyword.Constant == keyword;
  }
  
  public isNotConstant(keyword:string):boolean{
    return Keyword.Constant != keyword;
  }
  
public isNative(keyword:string):boolean{
    return Keyword.Native == keyword;
  }
  
  public isNotNative(keyword:string):boolean{
    return Keyword.Native != keyword;
  }
  
public isLocal(keyword:string):boolean{
    return Keyword.Local == keyword;
  }
  
  public isNotLocal(keyword:string):boolean{
    return Keyword.Local != keyword;
  }
  
public isType(keyword:string):boolean{
    return Keyword.Type == keyword;
  }
  
  public isNotType(keyword:string):boolean{
    return Keyword.Type != keyword;
  }
  
public isSet(keyword:string):boolean{
    return Keyword.Set == keyword;
  }
  
  public isNotSet(keyword:string):boolean{
    return Keyword.Set != keyword;
  }
  
public isCall(keyword:string):boolean{
    return Keyword.Call == keyword;
  }
  
  public isNotCall(keyword:string):boolean{
    return Keyword.Call != keyword;
  }
  
public isTakes(keyword:string):boolean{
    return Keyword.Takes == keyword;
  }
  
  public isNotTakes(keyword:string):boolean{
    return Keyword.Takes != keyword;
  }
  
public isReturns(keyword:string):boolean{
    return Keyword.Returns == keyword;
  }
  
  public isNotReturns(keyword:string):boolean{
    return Keyword.Returns != keyword;
  }
  
public isExtends(keyword:string):boolean{
    return Keyword.Extends == keyword;
  }
  
  public isNotExtends(keyword:string):boolean{
    return Keyword.Extends != keyword;
  }
  
public isArray(keyword:string):boolean{
    return Keyword.Array == keyword;
  }
  
  public isNotArray(keyword:string):boolean{
    return Keyword.Array != keyword;
  }
  
public isTrue(keyword:string):boolean{
    return Keyword.True == keyword;
  }
  
  public isNotTrue(keyword:string):boolean{
    return Keyword.True != keyword;
  }
  
public isFalse(keyword:string):boolean{
    return Keyword.False == keyword;
  }
  
  public isNotFalse(keyword:string):boolean{
    return Keyword.False != keyword;
  }
  
public isNull(keyword:string):boolean{
    return Keyword.Null == keyword;
  }
  
  public isNotNull(keyword:string):boolean{
    return Keyword.Null != keyword;
  }
  
public isNothing(keyword:string):boolean{
    return Keyword.Nothing == keyword;
  }
  
  public isNotNothing(keyword:string):boolean{
    return Keyword.Nothing != keyword;
  }
  
public isIf(keyword:string):boolean{
    return Keyword.If == keyword;
  }
  
  public isNotIf(keyword:string):boolean{
    return Keyword.If != keyword;
  }
  
public isElse(keyword:string):boolean{
    return Keyword.Else == keyword;
  }
  
  public isNotElse(keyword:string):boolean{
    return Keyword.Else != keyword;
  }
  
public isElseif(keyword:string):boolean{
    return Keyword.Elseif == keyword;
  }
  
  public isNotElseif(keyword:string):boolean{
    return Keyword.Elseif != keyword;
  }
  
public isEndif(keyword:string):boolean{
    return Keyword.Endif == keyword;
  }
  
  public isNotEndif(keyword:string):boolean{
    return Keyword.Endif != keyword;
  }
  
public isThen(keyword:string):boolean{
    return Keyword.Then == keyword;
  }
  
  public isNotThen(keyword:string):boolean{
    return Keyword.Then != keyword;
  }
  
public isLoop(keyword:string):boolean{
    return Keyword.Loop == keyword;
  }
  
  public isNotLoop(keyword:string):boolean{
    return Keyword.Loop != keyword;
  }
  
public isEndloop(keyword:string):boolean{
    return Keyword.Endloop == keyword;
  }
  
  public isNotEndloop(keyword:string):boolean{
    return Keyword.Endloop != keyword;
  }
  
public isExitwhen(keyword:string):boolean{
    return Keyword.Exitwhen == keyword;
  }
  
  public isNotExitwhen(keyword:string):boolean{
    return Keyword.Exitwhen != keyword;
  }
  
public isReturn(keyword:string):boolean{
    return Keyword.Return == keyword;
  }
  
  public isNotReturn(keyword:string):boolean{
    return Keyword.Return != keyword;
  }
  
public isInteger(keyword:string):boolean{
    return Keyword.Integer == keyword;
  }
  
  public isNotInteger(keyword:string):boolean{
    return Keyword.Integer != keyword;
  }
  
public isReal(keyword:string):boolean{
    return Keyword.Real == keyword;
  }
  
  public isNotReal(keyword:string):boolean{
    return Keyword.Real != keyword;
  }
  
public isBoolean(keyword:string):boolean{
    return Keyword.Boolean == keyword;
  }
  
  public isNotBoolean(keyword:string):boolean{
    return Keyword.Boolean != keyword;
  }
  
public isString(keyword:string):boolean{
    return Keyword.String == keyword;
  }
  
  public isNotString(keyword:string):boolean{
    return Keyword.String != keyword;
  }
  
public isHandle(keyword:string):boolean{
    return Keyword.Handle == keyword;
  }
  
  public isNotHandle(keyword:string):boolean{
    return Keyword.Handle != keyword;
  }
  
public isCode(keyword:string):boolean{
    return Keyword.Code == keyword;
  }
  
  public isNotCode(keyword:string):boolean{
    return Keyword.Code != keyword;
  }
  
public isAnd(keyword:string):boolean{
    return Keyword.And == keyword;
  }
  
  public isNotAnd(keyword:string):boolean{
    return Keyword.And != keyword;
  }
  
public isOr(keyword:string):boolean{
    return Keyword.Or == keyword;
  }
  
  public isNotOr(keyword:string):boolean{
    return Keyword.Or != keyword;
  }
  
public isNot(keyword:string):boolean{
    return Keyword.Not == keyword;
  }
  
  public isNotNot(keyword:string):boolean{
    return Keyword.Not != keyword;
  }
  
public isGlobals(keyword:string):boolean{
    return Keyword.Globals == keyword;
  }
  
  public isNotGlobals(keyword:string):boolean{
    return Keyword.Globals != keyword;
  }
  
public isEndglobals(keyword:string):boolean{
    return Keyword.Endglobals == keyword;
  }
  
  public isNotEndglobals(keyword:string):boolean{
    return Keyword.Endglobals != keyword;
  }
  

}


;
