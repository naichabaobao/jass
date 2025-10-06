import * as vscode from "vscode";
import { GlobalContext } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import { Document } from "../jass/tokenizer-common";
import { Position } from "../jass/loc";

/**
 * 类型推断上下文
 */
export interface TypeInferenceContext {
  document: vscode.TextDocument;
  position: vscode.Position;
  currentDocument: Document;
}

/**
 * 推断出的类型信息
 */
export interface InferredType {
  type: string;
  isStruct: boolean;
  isArray: boolean;
  struct?: vjass_ast.Struct | vjass_ast.zinc.Struct;
  baseType?: string; // 对于数组类型，存储基础类型
}

/**
 * 变量信息
 */
export interface VariableInfo {
  name: string;
  type: InferredType;
  isParameter: boolean;
  isLocal: boolean;
  isGlobal: boolean;
  isStatic: boolean;
  node?: vjass_ast.NodeAst | vjass_ast.Take;
}

/**
 * 类型推断器
 */
export class TypeInferencer {
  private readonly context: TypeInferenceContext;

  constructor(context: TypeInferenceContext) {
    this.context = context;
  }

  /**
   * 推断变量的类型
   */
  public inferVariableType(variableName: string): InferredType | null {
    // 1. 查找局部变量
    const localVar = this.findLocalVariable(variableName);
    if (localVar) {
      return this.inferTypeFromNode(localVar);
    }

    // 2. 查找参数
    const parameter = this.findParameter(variableName);
    if (parameter) {
      return this.inferTypeFromTake(parameter);
    }

    // 3. 查找全局变量
    const globalVar = this.findGlobalVariable(variableName);
    if (globalVar) {
      return this.inferTypeFromNode(globalVar);
    }

    // 4. 查找成员变量
    const member = this.findMemberVariable(variableName);
    if (member) {
      return this.inferTypeFromNode(member);
    }

    return null;
  }

  /**
   * 推断函数调用的返回类型
   */
  public inferFunctionReturnType(functionName: string): InferredType | null {
    // 查找函数
    const functions = GlobalContext.get_functions();
    const func = functions.find(f => f.name && f.name.getText() === functionName);
    if (func && func.returns) {
      return this.parseTypeString(func.returns.getText());
    }

    // 查找原生函数
    const natives = GlobalContext.get_natives();
    const native = natives.find(n => n.name && n.name.getText() === functionName);
    if (native && native.returns) {
      return this.parseTypeString(native.returns.getText());
    }

    // 查找方法
    const methods = this.context.currentDocument.get_all_methods();
    const method = methods.find((m: any) => m.name && m.name.getText() === functionName);
    if (method && method.returns) {
      return this.parseTypeString(method.returns.getText());
    }

    return null;
  }

  /**
   * 查找局部变量
   */
  private findLocalVariable(variableName: string): vjass_ast.Local | vjass_ast.zinc.Member | null {
    const position = new Position(this.context.position.line, this.context.position.character);
    
    // 查找包含当前位置的函数
    const functions = this.context.currentDocument.get_all_functions();
    const methods = this.context.currentDocument.get_all_methods();
    
    const containingFunctions = [...functions, ...methods].filter((func: any) => {
      return func.contains && func.contains(position);
    });

    for (const func of containingFunctions) {
      if (func.children) {
        for (const child of func.children) {
          if ((child instanceof vjass_ast.Local || child instanceof vjass_ast.zinc.Member) 
              && child.name && child.name.getText() === variableName) {
            // 检查变量是否在当前行之前声明
            if (child.start.line < this.context.position.line) {
              return child;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * 查找参数
   */
  private findParameter(variableName: string): vjass_ast.Take | null {
    const position = new Position(this.context.position.line, this.context.position.character);
    
    // 查找包含当前位置的函数
    const functions = this.context.currentDocument.get_all_functions();
    const methods = this.context.currentDocument.get_all_methods();
    
    const containingFunctions = [...functions, ...methods].filter((func: any) => {
      return func.contains && func.contains(position);
    });

    for (const func of containingFunctions) {
      if (func.takes) {
        for (const take of func.takes) {
          if (take.name && take.name.getText() === variableName) {
            return take;
          }
        }
      }
    }

    return null;
  }

  /**
   * 查找全局变量
   */
  private findGlobalVariable(variableName: string): vjass_ast.GlobalVariable | null {
    const globals = GlobalContext.get_global_variables();
    const found = globals.find(g => g.name && g.name.getText() === variableName);
    return found instanceof vjass_ast.GlobalVariable ? found : null;
  }

  /**
   * 查找成员变量
   */
  private findMemberVariable(variableName: string): vjass_ast.Member | vjass_ast.zinc.Member | null {
    const members = this.context.currentDocument.get_all_members();
    return members.find((m: any) => m.name && m.name.getText() === variableName) || null;
  }

  /**
   * 从 AST 节点推断类型
   */
  private inferTypeFromNode(node: vjass_ast.NodeAst): InferredType | null {
    if (node instanceof vjass_ast.Local || node instanceof vjass_ast.zinc.Member) {
      if (node.type) {
        return this.parseTypeString(node.type.getText());
      }
    } else if (node instanceof vjass_ast.GlobalVariable) {
      if (node.type) {
        return this.parseTypeString(node.type.getText());
      }
    } else if (node instanceof vjass_ast.Member || node instanceof vjass_ast.zinc.Member) {
      if (node.type) {
        return this.parseTypeString(node.type.getText());
      }
    }

    return null;
  }

  /**
   * 从 Take 节点推断类型
   */
  private inferTypeFromTake(take: vjass_ast.Take): InferredType | null {
    if (take.type) {
      return this.parseTypeString(take.type.getText());
    }
    return null;
  }

  /**
   * 解析类型字符串
   */
  private parseTypeString(typeString: string): InferredType {
    const trimmed = typeString.trim();
    
    // 检查是否为数组类型
    const isArray = trimmed.includes("array");
    const baseType = isArray ? trimmed.replace("array", "").trim() : trimmed;

    // 检查是否为结构体类型
    const structs = GlobalContext.get_structs();
    const struct = structs.find(s => s.name && s.name.getText() === baseType);

    return {
      type: trimmed,
      isStruct: !!struct,
      isArray: isArray,
      struct: struct,
      baseType: baseType
    };
  }

  /**
   * 获取结构体的成员和方法
   */
  public getStructMembers(struct: vjass_ast.Struct | vjass_ast.zinc.Struct): {
    members: (vjass_ast.Member | vjass_ast.zinc.Member)[];
    methods: (vjass_ast.Method | vjass_ast.zinc.Method)[];
  } {
    const members: (vjass_ast.Member | vjass_ast.zinc.Member)[] = [];
    const methods: (vjass_ast.Method | vjass_ast.zinc.Method)[] = [];

    // 获取成员变量
    struct.document.acceptMemberFromNode(struct, (member) => {
      members.push(member);
    });

    // 获取方法
    struct.document.acceptMethodFromNode(struct, (method) => {
      methods.push(method);
    });

    return { members, methods };
  }

  /**
   * 获取结构体的静态成员和方法
   */
  public getStructStaticMembers(struct: vjass_ast.Struct | vjass_ast.zinc.Struct): {
    members: (vjass_ast.Member | vjass_ast.zinc.Member)[];
    methods: (vjass_ast.Method | vjass_ast.zinc.Method)[];
  } {
    const members: (vjass_ast.Member | vjass_ast.zinc.Member)[] = [];
    const methods: (vjass_ast.Method | vjass_ast.zinc.Method)[] = [];

    // 获取静态成员变量
    struct.document.acceptMemberFromNode(struct, (member) => {
      if (member.is_static) {
        members.push(member);
      }
    });

    // 获取静态方法
    struct.document.acceptMethodFromNode(struct, (method) => {
      if (method.is_static) {
        methods.push(method);
      }
    });

    return { members, methods };
  }
}

/**
 * 创建类型推断器
 */
export function createTypeInferencer(document: vscode.TextDocument, position: vscode.Position): TypeInferencer | null {
  const vjassDocument = GlobalContext.get(document.uri.fsPath);
  if (!vjassDocument) {
    return null;
  }

  const context: TypeInferenceContext = {
    document,
    position,
    currentDocument: vjassDocument
  };

  return new TypeInferencer(context);
}
