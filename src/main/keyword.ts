
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

  public static readonly Keywords = [Keyword.Function, Keyword.Endfunction, Keyword.Constant, Keyword.Native, Keyword.Local, Keyword.Type, Keyword.Set, Keyword.Call, Keyword.Takes, Keyword.Returns, Keyword.Extends, Keyword.Array, Keyword.True, Keyword.False, Keyword.Null, Keyword.Nothing, Keyword.If, Keyword.Else, Keyword.Elseif, Keyword.Endif, Keyword.Then, Keyword.Loop, Keyword.Endloop, Keyword.Exitwhen, Keyword.Return, Keyword.Integer, Keyword.Real, Keyword.Boolean, Keyword.String, Keyword.Handle, Keyword.Code, Keyword.And, Keyword.Or, Keyword.Not, Keyword.Globals, Keyword.Endglobals];

  public static isKeyword(keyword: string): boolean {
    return Keyword.Keywords.includes(keyword);
  }

  public static isNotKeyword(keyword: string): boolean {
    return !Keyword.Keywords.includes(keyword);
  }

  public static isFunction(keyword: string): boolean {
    return Keyword.Function == keyword;
  }

  public static isNotFunction(keyword: string): boolean {
    return Keyword.Function != keyword;
  }

  public static isEndfunction(keyword: string): boolean {
    return Keyword.Endfunction == keyword;
  }

  public static isNotEndfunction(keyword: string): boolean {
    return Keyword.Endfunction != keyword;
  }

  public static isConstant(keyword: string): boolean {
    return Keyword.Constant == keyword;
  }

  public static isNotConstant(keyword: string): boolean {
    return Keyword.Constant != keyword;
  }

  public static isNative(keyword: string): boolean {
    return Keyword.Native == keyword;
  }

  public static isNotNative(keyword: string): boolean {
    return Keyword.Native != keyword;
  }

  public static isLocal(keyword: string): boolean {
    return Keyword.Local == keyword;
  }

  public static isNotLocal(keyword: string): boolean {
    return Keyword.Local != keyword;
  }

  public static isType(keyword: string): boolean {
    return Keyword.Type == keyword;
  }

  public static isNotType(keyword: string): boolean {
    return Keyword.Type != keyword;
  }

  public static isSet(keyword: string): boolean {
    return Keyword.Set == keyword;
  }

  public static isNotSet(keyword: string): boolean {
    return Keyword.Set != keyword;
  }

  public static isCall(keyword: string): boolean {
    return Keyword.Call == keyword;
  }

  public static isNotCall(keyword: string): boolean {
    return Keyword.Call != keyword;
  }

  public static isTakes(keyword: string): boolean {
    return Keyword.Takes == keyword;
  }

  public static isNotTakes(keyword: string): boolean {
    return Keyword.Takes != keyword;
  }

  public static isReturns(keyword: string): boolean {
    return Keyword.Returns == keyword;
  }

  public static isNotReturns(keyword: string): boolean {
    return Keyword.Returns != keyword;
  }

  public static isExtends(keyword: string): boolean {
    return Keyword.Extends == keyword;
  }

  public static isNotExtends(keyword: string): boolean {
    return Keyword.Extends != keyword;
  }

  public static isArray(keyword: string): boolean {
    return Keyword.Array == keyword;
  }

  public static isNotArray(keyword: string): boolean {
    return Keyword.Array != keyword;
  }

  public static isTrue(keyword: string): boolean {
    return Keyword.True == keyword;
  }

  public static isNotTrue(keyword: string): boolean {
    return Keyword.True != keyword;
  }

  public static isFalse(keyword: string): boolean {
    return Keyword.False == keyword;
  }

  public static isNotFalse(keyword: string): boolean {
    return Keyword.False != keyword;
  }

  public static isNull(keyword: string): boolean {
    return Keyword.Null == keyword;
  }

  public static isNotNull(keyword: string): boolean {
    return Keyword.Null != keyword;
  }

  public static isNothing(keyword: string): boolean {
    return Keyword.Nothing == keyword;
  }

  public static isNotNothing(keyword: string): boolean {
    return Keyword.Nothing != keyword;
  }

  public static isIf(keyword: string): boolean {
    return Keyword.If == keyword;
  }

  public static isNotIf(keyword: string): boolean {
    return Keyword.If != keyword;
  }

  public static isElse(keyword: string): boolean {
    return Keyword.Else == keyword;
  }

  public static isNotElse(keyword: string): boolean {
    return Keyword.Else != keyword;
  }

  public static isElseif(keyword: string): boolean {
    return Keyword.Elseif == keyword;
  }

  public static isNotElseif(keyword: string): boolean {
    return Keyword.Elseif != keyword;
  }

  public static isEndif(keyword: string): boolean {
    return Keyword.Endif == keyword;
  }

  public static isNotEndif(keyword: string): boolean {
    return Keyword.Endif != keyword;
  }

  public static isThen(keyword: string): boolean {
    return Keyword.Then == keyword;
  }

  public static isNotThen(keyword: string): boolean {
    return Keyword.Then != keyword;
  }

  public static isLoop(keyword: string): boolean {
    return Keyword.Loop == keyword;
  }

  public static isNotLoop(keyword: string): boolean {
    return Keyword.Loop != keyword;
  }

  public static isEndloop(keyword: string): boolean {
    return Keyword.Endloop == keyword;
  }

  public static isNotEndloop(keyword: string): boolean {
    return Keyword.Endloop != keyword;
  }

  public static isExitwhen(keyword: string): boolean {
    return Keyword.Exitwhen == keyword;
  }

  public static isNotExitwhen(keyword: string): boolean {
    return Keyword.Exitwhen != keyword;
  }

  public static isReturn(keyword: string): boolean {
    return Keyword.Return == keyword;
  }

  public static isNotReturn(keyword: string): boolean {
    return Keyword.Return != keyword;
  }

  public static isInteger(keyword: string): boolean {
    return Keyword.Integer == keyword;
  }

  public static isNotInteger(keyword: string): boolean {
    return Keyword.Integer != keyword;
  }

  public static isReal(keyword: string): boolean {
    return Keyword.Real == keyword;
  }

  public static isNotReal(keyword: string): boolean {
    return Keyword.Real != keyword;
  }

  public static isBoolean(keyword: string): boolean {
    return Keyword.Boolean == keyword;
  }

  public static isNotBoolean(keyword: string): boolean {
    return Keyword.Boolean != keyword;
  }

  public static isString(keyword: string): boolean {
    return Keyword.String == keyword;
  }

  public static isNotString(keyword: string): boolean {
    return Keyword.String != keyword;
  }

  public static isHandle(keyword: string): boolean {
    return Keyword.Handle == keyword;
  }

  public static isNotHandle(keyword: string): boolean {
    return Keyword.Handle != keyword;
  }

  public static isCode(keyword: string): boolean {
    return Keyword.Code == keyword;
  }

  public static isNotCode(keyword: string): boolean {
    return Keyword.Code != keyword;
  }

  public static isAnd(keyword: string): boolean {
    return Keyword.And == keyword;
  }

  public static isNotAnd(keyword: string): boolean {
    return Keyword.And != keyword;
  }

  public static isOr(keyword: string): boolean {
    return Keyword.Or == keyword;
  }

  public static isNotOr(keyword: string): boolean {
    return Keyword.Or != keyword;
  }

  public static isNot(keyword: string): boolean {
    return Keyword.Not == keyword;
  }

  public static isNotNot(keyword: string): boolean {
    return Keyword.Not != keyword;
  }

  public static isGlobals(keyword: string): boolean {
    return Keyword.Globals == keyword;
  }

  public static isNotGlobals(keyword: string): boolean {
    return Keyword.Globals != keyword;
  }

  public static isEndglobals(keyword: string): boolean {
    return Keyword.Endglobals == keyword;
  }

  public static isNotEndglobals(keyword: string): boolean {
    return Keyword.Endglobals != keyword;
  }


  public static readonly keywordLibrary = "library";
  public static readonly keyworInitializer = "initializer";
  public static readonly keywordNeeds = "needs";
  public static readonly keywordUses = "uses";
  public static readonly keywordRequires = "requires";
  public static readonly keywordEndLibrary = "endlibrary";
  public static readonly keywordScope = "scope";
  public static readonly keywordEndScope = "endscope";
  public static readonly keywordPrivate = "private";
  public static readonly keywordPublic = "public";
  public static readonly keywordStatic = "static";
  public static readonly keywordInterface = "interface";
  public static readonly keywordEndInterface = "endinterface";
  public static readonly keywordImplement = "implement";
  public static readonly keywordStruct = "struct";
  public static readonly keywordEndStruct = "endstruct";
  public static readonly keywordMethod = "method";
  public static readonly keywordEndMethod = "endmethod";
  public static readonly keywordThis = "this";
  public static readonly keywordDelegate = "delegate";
  public static readonly keywordOperator = "operator";
  public static readonly keywordDebug = "debug";

  public static readonly vKeywordKeywords = [Keyword.keywordLibrary, Keyword.keyworInitializer, Keyword.keywordNeeds,Keyword.keywordUses, Keyword.keywordRequires, Keyword.keywordEndLibrary, Keyword.keywordScope, Keyword.keywordEndScope, Keyword.keywordPrivate, Keyword.keywordPublic, Keyword.keywordStatic, Keyword.keywordInterface, Keyword.keywordEndInterface, Keyword.keywordImplement, Keyword.keywordStruct, Keyword.keywordEndStruct, Keyword.keywordMethod, Keyword.keywordEndMethod, Keyword.keywordThis, Keyword.keywordDelegate, Keyword.keywordOperator, Keyword.keywordDebug];

  public static readonly allKeywords = [...Keyword.Keywords,...Keyword.vKeywordKeywords];

};

