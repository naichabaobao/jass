import * as path from "path";
import * as fs from "fs";
import { Call, Comment, Func, GlobalContext, GlobalVariable, Globals, If, Implement, Interface, JassDetail, Library, Local, Loop, Member, Method, Module, Native, NodeAst, Other, Scope, Set, Struct, Take, Type, ZincNode, parse, parse_function, parse_globals, parse_if, parse_interface, parse_library, parse_line_call, parse_line_comment, parse_line_else, parse_line_else_if, parse_line_end_tag, parse_line_exitwhen, parse_line_expr, parse_line_global, parse_line_implement, parse_line_local, parse_line_member, parse_line_method, parse_line_native, parse_line_return, parse_line_set, parse_line_type, parse_loop, parse_method, parse_module, parse_scope, parse_struct, zinc } from "./parser-vjass";
import { tokenize_for_vjass, tokenize_for_vjass_by_content } from "./tokenizer-vjass";
import { parse_zinc } from "./zinc";
import { AllTokenTexts } from "./keyword";
import { removeComment } from "../vjass/comment";
import { ErrorCollection, CheckValidationError, CheckErrorType } from "../vjass/simple-error";
import { Define, Include, parseAndRemovePreprocessor } from "../vjass/preprocess";
import { Import, parseAndRemoveImports } from "../vjass/vjass-import";
import { parseAndRemoveTextMacros, TextMacro } from "../vjass/text-macro";
import { parseAndRemoveRunTextMacros, RunTextMacro, RunTextMacroCollection } from "../vjass/run-text-macro";
import { parseAndRemoveZincBlock, ZincBlock, ZincBlockCollection } from "../vjass/zinc-block";




/**
 * AST访问者接口
 * 实现此接口以遍历AST树的不同节点类型（Visitor模式）
 */
export interface ASTVisitor {
  visitFunc?(node: Func | zinc.Func): void;
  visitNative?(node: Native): void;
  visitMethod?(node: Method | zinc.Method): void;
  visitStruct?(node: Struct | zinc.Struct): void;
  visitInterface?(node: Interface | zinc.Interface): void;
  visitLibrary?(node: Library): void;
  visitScope?(node: Scope): void;
  visitGlobals?(node: Globals): void;
  visitType?(node: Type): void;
  visitLocal?(node: Local | zinc.Member): void;
  visitMember?(node: Member | zinc.Member): void;
  visitGlobalVariable?(node: GlobalVariable | zinc.Member): void;
  visitIf?(node: If | zinc.If): void;
  visitLoop?(node: Loop): void;
  visitSet?(node: Set | zinc.Set): void;
  visitCall?(node: Call | zinc.Call): void;
  visitComment?(node: Comment): void;
  visitModule?(node: any): void; // vJASS Module support
  visitModuleImplementation?(node: any): void; // vJASS Module implementation support
  visitOther?(node: NodeAst): void;
}

/**
 * 类型定义查找器 - 使用ASTVisitor系统
 * 用于查找Interface或Struct定义，替代废弃的GlobalContext方法
 */
class TypeDefinitionFinder implements ASTVisitor {
  private targetName: string;
  private foundType: Interface | zinc.Interface | Struct | zinc.Struct | null = null;
  
  constructor(name: string) {
    this.targetName = name;
  }
  
  private getNodeName(node: NodeAst): string {
    if ('name' in node && node.name) {
      const nameToken = node.name as any;
      return typeof nameToken.getText === 'function' ? nameToken.getText() : '';
    }
    return '';
  }
  
  visitStruct(node: Struct | zinc.Struct): void {
    if (this.foundType) return; // 已经找到，停止搜索
    
    const name = this.getNodeName(node);
    if (name === this.targetName) {
      this.foundType = node;
    }
  }
  
  visitInterface(node: Interface | zinc.Interface): void {
    if (this.foundType) return; // 已经找到，停止搜索
    
    const name = this.getNodeName(node);
    if (name === this.targetName) {
      this.foundType = node;
    }
  }
  
  getFoundType(): Interface | zinc.Interface | Struct | zinc.Struct | null {
    return this.foundType;
  }
}

class Segment {
  parent: Block|null = null;

  // 用于接收解析后的对象
  public data:any;

  type: "local" | "set" | "call" | "return" | "comment" | "empty" | "other" | "member" | "native" | "method" | "exitwhen" | "elseif" | "else" | "type" | "implement";

  constructor(type: "local" | "set" | "call" | "return" | "comment" | "empty" | "other" | "member" | "native" | "method" | "exitwhen" | "elseif" | "else" | "type" | "implement", tokens:Token[]) {
    this.type = type;
    this.tokens = tokens;
  }

  tokens:Token[] = [];
}
class Block {
  parent: Block|null = null;
  children: (Block|Segment)[] = [];

  // 用于接收解析后的对象
  public data:any;

  type: "library" | "struct" | "interface" | "method" | "func" | "globals" | "scope" | "if" | "loop" | "module";
  constructor(type: "library" | "struct" | "interface" | "method" | "func" | "globals" | "scope" | "if" | "loop" | "module", start_tokens:Token[]) {
    this.type = type;

    this.start_tokens = start_tokens;
  }

  start_tokens:Token[] = [];
  end_tokens:Token[] = [];

  public last_block():Block {
    if (this.children.length > 0) {
      const blocks:Block[] = this.children.filter((x) => {
        return x instanceof Block;
      })as Block[];
      if (blocks.length > 0) {
        return (blocks[blocks.length - 1]).last_block();
      } else {
        return this;
      }
    } else {
      return this;
    }
  }

  /**
   * 用于保存zinc block内部的token
   */
  public readonly tokens:Token[] = [];
}

/**
 * Document 类 - JASS/vJASS 文档解析器
 * 负责解析 JASS/vJASS 代码，生成 AST 树结构
 */
export class Document {
  // ==================== 核心属性 ====================
  public readonly filePath: string;
  public content: string;
  public readonly tokens: Token[] = [];
  public readonly lineCount: number = 0;
  public is_special: boolean = false;

  // ==================== AST 相关 ====================
  public program: NodeAst | null = null;
  public readonly zincNodes: ZincNode[] = [];

  // ==================== 错误处理 ====================
  public readonly errorCollection: ErrorCollection = {
    errors: [],
    warnings: [],
    checkValidationErrors: []
  };

  // ==================== Check验证配置 ====================
  private checkValidationConfig = {
    enabled: true,
    enablePerformanceLogging: false,
    enableDetailedErrors: true,
    skipNodes: new Set() as any, // 可以跳过特定节点类型的检查
    maxExecutionTime: 100 // 单个check方法的最大执行时间(ms)
  };

  // ==================== Check验证统计 ====================
  private checkValidationStats = {
    totalNodesChecked: 0,
    checkErrors: 0,
    checkWarnings: 0,
    checkExecutionTime: 0,
    nodesWithCheckInterface: 0,
    skippedNodes: 0
  };

  // ==================== 预处理器集合 ====================
  private preprocessCollection: {
    defines: Define[];
    includes: Include[];
      } = {
    defines: [],
    includes: []
  };

  private importsCollection: {
    imports: Import[];
  } = {
    imports: []
  };

  private textMacroCollection: {
    textMacros: TextMacro[];
  } = {
    textMacros: []
  };

  private runTextMacroCollection: RunTextMacroCollection = {
    runTextMacros: [],
    mixLineTexts: []
  };

  private zincBlockCollection: ZincBlockCollection = {
    blocks: []
  };

  // ==================== 公共访问器 ====================
  public get defines(): Define[] {
    return this.preprocessCollection.defines;
  }

  public get includes(): Include[] {
    return this.preprocessCollection.includes;
  }

  public get imports(): Import[] {
    return this.importsCollection.imports;
  }

  public get textMacros(): TextMacro[] {
    return this.textMacroCollection.textMacros;
  }

  public get runTextMacros(): RunTextMacro[] {
    return this.runTextMacroCollection.runTextMacros;
  }

  public get zincBlocks(): ZincBlock[] {
    return this.zincBlockCollection.blocks;
  }

  /**
   * 构造函数 - 初始化文档解析器
   * @param filePath 文件路径
   * @param content 文件内容
   */
  public constructor(filePath: string, content: string) {
    this.filePath = filePath;
    this.content = content;
    
    // 预处理阶段
    this.preprocessContent();
    
    // 词法分析
    tokenize_for_vjass(this);
    
    // 特殊文件处理
    if (this.isSpecialFile(filePath)) {
      this.handleSpecialFile();
      return;
    }
    
    // 设置全局上下文
    GlobalContext.set(filePath, this);
    this.is_special = false;
    
    // 解析 Zinc 代码块
    this.parseZincBlocks();
    
    // 构建 AST
    this.buildAST();
    
    // 错误处理
    this.after_handing_error();
  }

  /**
   * 预处理内容 - 移除注释、宏、导入等
   */
  private preprocessContent(): void {
    this.content = removeComment(this.content, this.errorCollection);
    this.content = parseAndRemovePreprocessor(this.content, this.errorCollection, this.preprocessCollection);
    this.content = parseAndRemoveImports(this.content, this.errorCollection, this.importsCollection);
    this.content = parseAndRemoveTextMacros(this.content, this.errorCollection, this.textMacroCollection, this.filePath);
    this.content = parseAndRemoveZincBlock(this.content, this.errorCollection, this.zincBlockCollection);
    this.content = parseAndRemoveRunTextMacros(this.content, this.errorCollection, this.runTextMacroCollection);
  }

  /**
   * 检查是否为特殊文件
   * @param filePath 文件路径
   * @returns 是否为特殊文件
   */
  private isSpecialFile(filePath: string): boolean {
    const parsed = path.parse(filePath);
    return parsed.base === "presets.jass" || 
           parsed.base === "numbers.jass" || 
           parsed.base === "strings.jass";
  }

  /**
   * 处理特殊文件
   */
  private handleSpecialFile(): void {
      this.values();
      this.is_special = true;
    GlobalContext.set(this.filePath, this);
    }

  /**
   * 解析 Zinc 代码块
   */
  private parseZincBlocks(): void {
    this.zincBlockCollection.blocks.forEach((block: ZincBlock) => {
      const zincTokens = tokenize_for_vjass_by_content(block.code).map(token => {
        // @ts-expect-error
        token.line = block.startLine + 1 + token.line;
        return token;
      });
      
      this.zincNodes.push(parse_zinc(this, zincTokens));
    });
  }

  /**
   * 构建 AST
   */
  private buildAST(): void {
    const object_list = this.slice_layer();
    

    
    if (object_list && object_list.length > 0) {
      this.program = this.get_program(object_list);
    }
  }

  


  // ==================== 公共方法 ====================
  
  /**
   * 获取指定行的所有 Token
   * 使用缓存索引提高性能，几万行文件可在10ms内完成
   * @param line 行号
   * @returns 该行的 Token 数组
   */
  public lineTokens(line: number): Token[] {
    const token_index_cache = this.line_token_indexs[line];
    if (!token_index_cache) {
      return [];
    }
    return this.tokens.slice(token_index_cache.index, token_index_cache.index + token_index_cache.count);
  }


  // private zinc_indexs:VjassZincBlockTempObjectLine[] = [];

  /**
   * 记录每个分行的点，使用这种方法只需消耗一点内存有几百倍的性能提升
   * @private 不要修改，有词法解析时写入
   */
  private line_points: {
    line: number,
    position: number
  }[] = [];

  /**
   * line成员跟数组下标保持一致，在空行的情况可以删除减少内存暂用，删除了也就意味着要遍历
   * @private 不要修改，有词法解析时写入
   */
  public line_token_indexs: {
    // 跟数组下标保持一致
    line: number,
    index: number,
    count: number,
  }[] = [];

  // ==================== 错误处理 ====================
  
  public token_errors: { token: Token, message: string, charge?: number }[] = [];

  /**
   * 添加 Token 错误
   * @param token 出错的 Token
   * @param message 错误消息
   */
  public add_token_error(token: Token, message: string): void {
    this.token_errors.push({ token, message });
  }

  private values() {
    
    this.program = new NodeAst(this);
    for (let index = 0; index < this.lineCount; index++) {
      const tokens = this.lineTokens(index);
      if (tokens.length == 0) {
        continue;
      } else if (tokens[0].is_comment) {
        const comment = parse_line_comment(this, tokens);
        this.program.add_node(comment);
      } else if (tokens[0].is_value()) {
        const value = new JassDetail(this, tokens[0]);
        this.program.add_node(value);
      } else {
        this.add_token_error(tokens[0], "unsupported syntax, if you want to use JASS syntax, please change the file name");
        continue;
      }
    }
  }





  private find_token_error() {
    const handle = (tokens:Token[]) => {
      tokens.forEach(token => {
        let temp:string;
        const text = () => {
          if (!temp) {
            temp = token.getText();
          }
          return temp;
        };
        if (token.type == TokenType.Unkown) {
          this.add_token_error(token, `lexical error,unkown token '${text().substring(0, 100)}'!`);
        } else if (!token.is_complete) {
          if (token.type == TokenType.String) {
            this.add_token_error(token, `string need package in "...",error string '${text().substring(0, 100)}'!`);
          } else if (token.type == TokenType.Mark) {
            this.add_token_error(token, `integer identifier mark format is 'A' or 'AAAA',error integer identifier mark '${text().substring(0, 100)}'!`);
          } else if (token.type == TokenType.Integer) {
            this.add_token_error(token, `error integer expression '${text().substring(0, 100)}'!`);
          } else {
            this.add_token_error(token, `error expression '${text().substring(0, 100)}'!`);
          }
        } else if (token.type == TokenType.Integer) {
          if (text().startsWith("0x") && text().length > 10) {
            this.add_token_error(token, `out of range '${text()}'!`);
          } else if (text().startsWith("$") && text().length > 9) {
            this.add_token_error(token, `out of range '${text()}'!`);
          }
        }
      });
    };
  }

  private is_start_with(tokens: Token[], keyword: string|((token:Token) => boolean), excute_string: string[] = ["debug"]):boolean {
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      if (token.is_block_comment) {
        continue;
      } else if (excute_string.includes(token.getText())) {
        continue;
      } else if (typeof keyword == "string" ? token.getText() == keyword : keyword(token)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  public readonly zinc_nodes:ZincNode[] = [];

  /**
   * 文档最根部的对象
   * 根据每一行分层
   * @deprecated 后续改成局部,目前能正常运行,但会跟着document导致内存占用，因为解析完后就没用了
   */
  private slice_layer() {
    const blocks:Block[] = [];
    const list:(Block|Segment)[] = [];
    const last_block = () => {
      return blocks[blocks.length - 1];
    }

    let in_interface = false;
    const handle_one_line = (tokens: Token[]) => {
      const handle = () => {
        const push_block_to = (block:Block) => {
          if (blocks.length > 0) {
            block.parent = blocks[blocks.length - 1];
            blocks[blocks.length - 1].children.push(block);
          } else {
            list.push(block);
          }
          blocks.push(block);
        };
        const push_segment_to = (segment:Segment) => {
          if (blocks.length > 0) {
            segment.parent = blocks[blocks.length - 1];
            blocks[blocks.length - 1].children.push(segment);
          } else {
            list.push(segment);
          }
        };
        if (this.is_start_with(tokens, "function", ["debug", "private", "public"])) {
          push_block_to(new Block("func", tokens));
        } else if (this.is_start_with(tokens, "method", ["debug", "private", "public", "static", "stub"])) {
          if (in_interface) {
            push_segment_to(new Segment("method", tokens));
          } else {
            push_block_to(new Block("method", tokens));
          }
        } else if (this.is_start_with(tokens, "struct", ["debug", "private", "public"])) {
          push_block_to(new Block("struct", tokens));
        } else if (this.is_start_with(tokens, "interface", ["debug", "private", "public"])) {
          push_block_to(new Block("interface", tokens));
          in_interface = true;
        } else if (this.is_start_with(tokens, "library", ["debug", "private", "public"])) {
          push_block_to(new Block("library", tokens));
        } else if (this.is_start_with(tokens, "globals")) {
          push_block_to(new Block("globals", tokens));
        } else if (this.is_start_with(tokens, "scope", ["debug", "private", "public"])) {
          push_block_to(new Block("scope", tokens));
        } else if (this.is_start_with(tokens, "if", ["debug", "static"])) {
          push_block_to(new Block("if", tokens));
        } else if (this.is_start_with(tokens, "loop")) {
          push_block_to(new Block("loop", tokens));
        } else if (this.is_start_with(tokens, "module")) {
          push_block_to(new Block("module", tokens));
        }
        // "local" | "set" | "call" | "return" | "comment" | "empty" | "other" | "member" | "native" | "method" | "exitwhen" | "elseif" | "else" | "type"
        else if (this.is_start_with(tokens, "local")) {
          push_segment_to(new Segment("local", tokens));
        } else if (this.is_start_with(tokens, "set")) {
          push_segment_to(new Segment("set", tokens));
        } else if (this.is_start_with(tokens, "call")) {
          push_segment_to(new Segment("call", tokens));
        } else if (this.is_start_with(tokens, "return")) {
          push_segment_to(new Segment("return", tokens));
        } else if (this.is_start_with(tokens, "native",  ["debug", "private", "public", "static", "stub", "constant"])) {
          push_segment_to(new Segment("native", tokens));
        } else if (this.is_start_with(tokens, "exitwhen")) {
          push_segment_to(new Segment("exitwhen", tokens));
        } else if (this.is_start_with(tokens, "elseif")) {
          push_segment_to(new Segment("elseif", tokens));
        } else if (this.is_start_with(tokens, "else")) {
          push_segment_to(new Segment("else", tokens));
        } else if (this.is_start_with(tokens, "type")) {
          push_segment_to(new Segment("type", tokens));
        } else if (this.is_start_with(tokens, "implement")) {
          push_segment_to(new Segment("implement", tokens));
        } else if (this.is_start_with(tokens, (t) => t.is_identifier)) {
          push_segment_to(new Segment("member", tokens));
        } else if (this.is_start_with(tokens, (t) => t.is_comment)) {
          push_segment_to(new Segment("comment", tokens));
        } else if (this.is_start_with(tokens, (t) => !!t)) {
          push_segment_to(new Segment("other", tokens));
        }
      };

      if (blocks.length > 0) {
        const last_block = blocks[blocks.length - 1];
        if (last_block.type == "func" && this.is_start_with(tokens, "endfunction")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "globals" && this.is_start_with(tokens, "endglobals")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "if" && this.is_start_with(tokens, "endif")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "loop" && this.is_start_with(tokens, "endloop")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "interface" && this.is_start_with(tokens, "endinterface")) {
          in_interface = false;
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "method" && this.is_start_with(tokens, "endmethod")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "library" && this.is_start_with(tokens, "endlibrary")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "globals" && this.is_start_with(tokens, "endglobals")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "scope" && this.is_start_with(tokens, "endscope")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "struct" && this.is_start_with(tokens, "endstruct")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "module" && this.is_start_with(tokens, "endmodule")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else {
          handle();
        }
      } else {
        handle();
      }

    };

    this.runTextMacroCollection.mixLineTexts.forEach((value: string | RunTextMacro, line: number) => {
      if (value instanceof RunTextMacro) {
        const textMacro = this.textMacros.find(x => x.name == value.name);
        if (textMacro) {
          const newContents = textMacro.body.map(body => {
            textMacro.takes.forEach((take, paramIndex) => {
              const paramValue = value.params[paramIndex] || "";
              body = body.replace(new RegExp(`\\$${take}\\$`, "g"), paramValue);
            });
            return body;
          });
          newContents.forEach(content => {
            // console.log("newContents", newContents);
            handle_one_line(tokenize_for_vjass_by_content(content).map(token => {
              // @ts-expect-error 强行改line
              token.line = line;
              return token;
            }));
          });
        }
      } else {
        const tokens = this.lineTokens(line);
        handle_one_line(tokens);
      }
    });

    return list;
  }

  /**
   * 优化的解析程序方法 - 整合 parse_node、expand_node 和 get_program 的功能
   * 使用迭代方式避免递归，提高性能
   * @param object_list 需要解析的对象列表
   * @returns 解析后的根节点
   */
  private get_program(object_list:(Block|Segment)[]) {
    const root_node = new NodeAst(this);
    
    // 第一步：解析所有节点，创建 NodeAst 对象
    this.parse_all_nodes(object_list);
    
    // 第二步：构建 AST 树结构（使用迭代避免递归）
    this.build_ast_tree(object_list, root_node);
    
    return root_node;
  }

  /**
   * 解析所有节点，创建对应的 NodeAst 对象
   * 使用迭代方式遍历所有节点
   * @param object_list 需要解析的对象列表
   */
  private parse_all_nodes(object_list:(Block|Segment)[]) {
    const processing_stack: (Block|Segment)[] = [...object_list];
    
    while (processing_stack.length > 0) {
      const node = processing_stack.pop()!;
      
      // 解析当前节点
      this.parse_single_node(node);
      
      // 如果是 Block 类型，将子节点添加到处理栈中
      if (node instanceof Block) {
        processing_stack.push(...node.children);
      }
    }
  }

  /**
   * 解析单个节点
   * @param node 需要解析的节点
   */
  private parse_single_node(node: Block | Segment) {
    if (node instanceof Block) {
      // 解析 Block 类型的节点
      this.parse_block_node(node);
    } else {
      // 解析 Segment 类型的节点
      this.parse_segment_node(node);
    }
  }

  /**
   * 解析 Block 类型的节点
   * @param node Block 节点
   */
  private parse_block_node(node: Block) {
    const end_tag_map: { [key: string]: string } = {
      "func": "endfunction",
      "library": "endlibrary", 
      "scope": "endscope",
      "interface": "endinterface",
      "struct": "endstruct",
      "method": "endmethod",
      "globals": "endglobals",
      "if": "endif",
      "loop": "endloop",
      "module": "endmodule"
    };

    let ast_node: NodeAst;

    // 根据节点类型创建对应的 AST 节点
    switch (node.type) {
      case "library":
        ast_node = parse_library(this, node.start_tokens);
        break;
      case "scope":
        ast_node = parse_scope(this, node.start_tokens);
        break;
      case "interface":
        ast_node = parse_interface(this, node.start_tokens);
        break;
      case "struct":
        ast_node = parse_struct(this, node.start_tokens);
        break;
      case "method":
        ast_node = parse_method(this, node.start_tokens);
        break;
      case "func":
        ast_node = parse_function(this, node.start_tokens);
        break;
      case "globals":
        ast_node = parse_globals(this, node.start_tokens);
        break;
      case "if":
        ast_node = parse_if(this, node.start_tokens);
        break;
      case "loop":
        ast_node = parse_loop(this, node.start_tokens);
        break;
      case "module":
        ast_node = parse_module(this, node.start_tokens);
        break;
      default:
        ast_node = new NodeAst(this);
        break;
    }

    // 解析 end 标签
    const end_tag = end_tag_map[node.type];
    if (end_tag && node.end_tokens && node.end_tokens.length > 0) {
      parse_line_end_tag(this, node.end_tokens, ast_node, end_tag);
    }

    node.data = ast_node;
  }

  /**
   * 解析 Segment 类型的节点
   * @param node Segment 节点
   */
  private parse_segment_node(node: Segment) {
    let ast_node: NodeAst;

    switch (node.type) {
      case "empty":
        return; // 空节点不需要处理
      case "comment":
        ast_node = parse_line_comment(this, node.tokens);
        break;
      case "local":
        ast_node = parse_line_local(this, node.tokens);
        break;
      case "set":
        ast_node = parse_line_set(this, node.tokens);
        break;
      case "call":
        ast_node = parse_line_call(this, node.tokens);
        break;
      case "return":
        ast_node = parse_line_return(this, node.tokens);
        break;
      case "native":
        ast_node = parse_line_native(this, node.tokens);
        break;
      case "method":
        ast_node = parse_line_method(this, node.tokens);
        break;
      case "implement":
        ast_node = parse_line_implement(this, node.tokens);
        break;
      case "member":
        if (node.parent && (node.parent.type === "struct" || node.parent.type === "interface")) {
          ast_node = parse_line_member(this, node.tokens);
        } else if (node.parent && node.parent.type === "globals") {
          ast_node = parse_line_global(this, node.tokens);
        } else {
          ast_node = new NodeAst(this);
        }
        break;
      case "exitwhen":
        ast_node = parse_line_exitwhen(this, node.tokens);
        break;
      case "elseif":
        ast_node = parse_line_else_if(this, node.tokens);
        break;
      case "else":
        ast_node = parse_line_else(this, node.tokens);
        break;
      case "type":
        ast_node = parse_line_type(this, node.tokens);
        break;

      case "other":
        ast_node = new Other(this);
        ast_node.start_token = node.tokens[0];
        ast_node.end_token = node.tokens[node.tokens.length - 1];
        break;
      default:
        ast_node = new NodeAst(this);
        break;
    }

    node.data = ast_node;
  }

  /**
   * 构建 AST 树结构
   * 使用迭代方式避免递归
   * @param object_list 对象列表
   * @param root_node 根节点
   */
  private build_ast_tree(object_list:(Block|Segment)[], root_node: NodeAst) {
    // 为根级别的节点建立父子关系
    object_list.forEach(node => {
      if (node.data) {
        root_node.addChild(node.data);
      }
    });

    // 使用迭代方式建立所有子节点的父子关系
    const build_stack: Array<{source: Block|Segment, target: NodeAst}> = [];
    
    // 初始化构建栈
    object_list.forEach(node => {
      if (node instanceof Block && node.data) {
        build_stack.push({source: node, target: node.data});
      }
    });

    while (build_stack.length > 0) {
      const {source, target} = build_stack.pop()!;
      
      if (source instanceof Block) {
        // 为当前节点的子节点建立父子关系
        source.children.forEach(child => {
          if (child.data) {
            target.addChild(child.data);
            
            // 如果子节点也是 Block，添加到构建栈中继续处理
            if (child instanceof Block) {
              build_stack.push({source: child, target: child.data});
            }
          }
        });
      }
    }
  }



  // ==================== Visitor 系统 ====================
  
  /**
   * 访问AST树（Visitor模式）
   * @param visitor 访问者对象
   */
  public accept(visitor: ASTVisitor): void {
    if (this.program) {
      this.visitNode(this.program, visitor);
    }
    
    // 访问zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, visitor);
    });
  }
  
  /**
   * 递归访问节点
   */
  private visitNode(node: NodeAst, visitor: ASTVisitor): void {
    // 根据节点类型调用相应的visitor方法
    if (node instanceof Func || node instanceof zinc.Func) {
      visitor.visitFunc?.(node);
    } else if (node instanceof Native) {
      visitor.visitNative?.(node);
    } else if (node instanceof Method || node instanceof zinc.Method) {
      visitor.visitMethod?.(node);
    } else if (node instanceof Struct || node instanceof zinc.Struct) {
      visitor.visitStruct?.(node);
    } else if (node instanceof Interface || node instanceof zinc.Interface) {
      visitor.visitInterface?.(node);
    } else if (node instanceof Library) {
      visitor.visitLibrary?.(node);
    } else if (node instanceof Scope) {
      visitor.visitScope?.(node);
    } else if (node instanceof Globals) {
      visitor.visitGlobals?.(node);
    } else if (node instanceof Type) {
      visitor.visitType?.(node);
    } else if (node instanceof Local) {
      visitor.visitLocal?.(node);
    } else if (node instanceof Member || node instanceof zinc.Member) {
      // 区分是member还是local还是global
      const parent = node.parent;
      if (parent instanceof Func || parent instanceof Method ||
          parent instanceof zinc.Func || parent instanceof zinc.Method) {
        visitor.visitLocal?.(node);
      } else {
        visitor.visitMember?.(node);
      }
    } else if (node instanceof GlobalVariable) {
      visitor.visitGlobalVariable?.(node);
    } else if (node instanceof If || node instanceof zinc.If) {
      visitor.visitIf?.(node);
    } else if (node instanceof Loop) {
      visitor.visitLoop?.(node);
    } else if (node instanceof Set || node instanceof zinc.Set) {
      visitor.visitSet?.(node);
    } else if (node instanceof Call || node instanceof zinc.Call) {
      visitor.visitCall?.(node);
    } else if (node instanceof Comment) {
      visitor.visitComment?.(node);
    } else if (node instanceof Module) {
      visitor.visitModule?.(node);
    // } else if (node instanceof VjassModule) {
    //   visitor.visitModule?.(node);
    // } else if (node instanceof VjassModuleImplementation) {
    //   visitor.visitModuleImplementation?.(node);
    } else {
      visitor.visitOther?.(node);
    }
    
    // 递归访问子节点
    node.children.forEach(child => this.visitNode(child, visitor));
  }
  
  /**
   * @deprecated 使用 accept(visitor) 替代
   * 遍历整个程序的 AST 节点
   */
  public every(callback: (node: NodeAst) => void): void {
    this.accept({
      visitFunc: callback,
      visitNative: callback,
      visitMethod: callback,
      visitStruct: callback,
      visitInterface: callback,
      visitLibrary: callback,
      visitScope: callback,
      visitGlobals: callback,
      visitType: callback,
      visitLocal: callback,
      visitMember: callback,
      visitGlobalVariable: callback,
      visitIf: callback,
      visitLoop: callback,
      visitSet: callback,
      visitCall: callback,
      visitComment: callback,
      visitOther: callback
    });
  }

  // ==================== 分类存储的 AST 节点 ====================
  
  /** @deprecated 占用过多内存，请避免直接使用此数组 */
  // public readonly built_in_zincs: BuiltZincBlock[] = [];

  // ==================== 分类方法 ====================
  
  /**
   * @deprecated
   * 将程序根节点下的所有解析节点分类存储到对应的数组中
   * 提高后续查找和访问的效率
   */

  /**
   * 错误和警告分析
   */
  private after_handing_error() {
    // 1. 检查zinc块未闭合
    this.checkZincBlockClosure();
    
    // 2. 遍历AST树进行各种检查
    if (this.program) {
      this.analyzeASTTree(this.program);
    }
    
    // 3. 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.analyzeASTTree(zincNode);
    });
  }
  
  /**
   * 递归分析AST树
   */
  private analyzeASTTree(node: NodeAst): void {
    // 1. 检查语句块闭合
    this.checkNodeClosure(node);
    
    // 2. 检查非法嵌套
    this.checkNodeNesting(node);
    
    // 3. 检查loop的exitwhen
    this.checkNodeLoopExitwhen(node);
    
    // 4. 检查接口实现
    this.checkInterfaceImplementation(node);
    
    // 5. 检查模块实现
    this.checkModuleImplementation(node);
    
    // 6. 检查implement语句位置
    this.checkImplementStatement(node);
    
    // 7. 检查类型匹配
    this.checkTypeMatching(node);
    
    // 8. 调用节点的check方法（如果实现了Check接口）
    this.checkNodeValidation(node);
    
    // 递归检查子节点
    node.children.forEach(child => this.analyzeASTTree(child));
  }
  
  /**
   * 检查节点验证（调用Check接口）
   */
  private checkNodeValidation(node: NodeAst): void {
    this.checkValidationStats.totalNodesChecked++;
    
    // 检查Check验证是否启用
    if (!this.checkValidationConfig.enabled) {
      return;
    }
    
    // 检查节点是否实现了Check接口
    if ('check' in node && typeof node.check === 'function') {
      const nodeType = node.constructor.name;
      
      // 检查是否跳过此节点类型
      if (this.checkValidationConfig.skipNodes.has(nodeType)) {
        this.checkValidationStats.skippedNodes++;
        return;
      }
      
      this.checkValidationStats.nodesWithCheckInterface++;
      
      try {
        const startTime = Date.now();
        
        // 调用check方法
        node.check();
        
        // 记录验证成功
        const duration = Date.now() - startTime;
        this.checkValidationStats.checkExecutionTime += duration;
        
        // 性能日志记录
        if (this.checkValidationConfig.enablePerformanceLogging && duration > 10) {
          console.debug(`Check validation completed for ${nodeType} in ${duration}ms`);
        }
        
        // 检查执行时间是否超时
        if (duration > this.checkValidationConfig.maxExecutionTime) {
          console.warn(`Check validation for ${nodeType} took ${duration}ms, exceeding threshold of ${this.checkValidationConfig.maxExecutionTime}ms`);
        }
        
      } catch (error) {
        // 如果check方法抛出异常，记录错误但不中断分析
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        this.checkValidationStats.checkErrors++;
        console.error(`Check validation failed for ${nodeType}:`, error);
        
        // 创建Check验证错误
        const checkError: CheckValidationError = {
          start: {
            line: node.start.line,
            position: node.start.position
          },
          end: {
            line: node.end.line,
            position: node.end.position
          },
          message: this.checkValidationConfig.enableDetailedErrors 
            ? `Check validation error in ${nodeType}: ${errorMessage}`
            : `Validation error: ${errorMessage}`,
          nodeType: nodeType,
          checkType: CheckErrorType.VALIDATION_ERROR,
          severity: "error"
        };
        
        // 添加到Check验证错误集合
        if (this.errorCollection.checkValidationErrors) {
          this.errorCollection.checkValidationErrors.push(checkError);
        }
        
        // 同时添加到常规错误集合以保持兼容性
        this.errorCollection.errors.push({
          start: checkError.start,
          end: checkError.end,
          message: checkError.message
        });
      }
    }
  }

  /**
   * 获取Check验证统计信息
   */
  public getCheckValidationStats() {
    return {
      ...this.checkValidationStats,
      averageExecutionTime: this.checkValidationStats.nodesWithCheckInterface > 0 
        ? this.checkValidationStats.checkExecutionTime / this.checkValidationStats.nodesWithCheckInterface 
        : 0,
      checkInterfaceCoverage: this.checkValidationStats.totalNodesChecked > 0
        ? (this.checkValidationStats.nodesWithCheckInterface / this.checkValidationStats.totalNodesChecked) * 100
        : 0
    };
  }

  /**
   * 重置Check验证统计信息
   */
  public resetCheckValidationStats(): void {
    this.checkValidationStats = {
      totalNodesChecked: 0,
      checkErrors: 0,
      checkWarnings: 0,
      checkExecutionTime: 0,
      nodesWithCheckInterface: 0,
      skippedNodes: 0
    };
  }

  /**
   * 获取Check验证配置
   */
  public getCheckValidationConfig() {
    return { ...this.checkValidationConfig };
  }

  /**
   * 更新Check验证配置
   */
  public updateCheckValidationConfig(config: Partial<typeof this.checkValidationConfig>): void {
    Object.assign(this.checkValidationConfig, config);
  }

  /**
   * 启用/禁用Check验证
   */
  public setCheckValidationEnabled(enabled: boolean): void {
    this.checkValidationConfig.enabled = enabled;
  }

  /**
   * 添加要跳过的节点类型
   */
  public addSkipNodeType(nodeType: string): void {
    this.checkValidationConfig.skipNodes.add(nodeType);
  }

  /**
   * 移除跳过的节点类型
   */
  public removeSkipNodeType(nodeType: string): void {
    this.checkValidationConfig.skipNodes.delete(nodeType);
  }

  /**
   * 检查implement语句位置
   */
  private checkImplementStatement(node: NodeAst): void {
    if (node instanceof Implement) {
      // 检查implement语句是否在struct或module内部
      if (!this.isImplementInValidContext(node)) {
        if (node.start_token) {
          this.errorCollection.errors.push({
            start: {
              line: node.start_token.line,
              position: node.start_token.character
            },
            end: {
              line: node.start_token.line,
              position: node.start_token.character + node.start_token.length
            },
            message: `'implement' statement can only be used inside struct or module`
          });
        }
      }
    }
  }

  /**
   * 检查implement语句是否在有效的上下文中
   */
  private isImplementInValidContext(implement: Implement): boolean {
    let current = implement.parent;
    
    while (current) {
      if (current instanceof Struct || current instanceof Module || 
          current instanceof zinc.Struct || current instanceof zinc.Interface) {
        return true;
      }
      current = current.parent;
    }
    
    return false;
  }

  /**
   * 检查zinc块闭合
   */
  private checkZincBlockClosure(): void {
    // this.built_in_zincs.forEach(block => {
    //   if (block.end_token === null) {
    //     if (block.start_token) {
    //       this.add_token_error(
    //         block.start_token, 
    //         `zinc block starting at line ${block.start_token.line + 1} is missing closing tag '//! endzinc'`
    //       );
    //     }
    //   }
    // });
    // this.zinc_nodes.forEach(child => {
    //   this.for_program_handle(child, (node) => {
    //     if (node instanceof zinc.Member) {
    //       if (node.parent) {
    //         if (node.parent instanceof zinc.Struct || node.parent instanceof zinc.Interface) {
    //           if (node.is_array && node.size_expr == null) {
    //             this.add_token_error(node.array_token!, `expectat [size]`);
    //           }
    //         }
    //       }
    //     }
    //   });
    // });

  }
  
  /**
   * 检查单个节点的闭合
   */
  private checkNodeClosure(node: NodeAst): void {
    // 接口中的方法声明不需要endmethod
    if (node instanceof Method && node.parent instanceof Interface) {
      return;
    }
    
    const endTagMap: { [key: string]: { end: string, display: string } } = {
      'Func': { end: 'endfunction', display: 'function' },
      'Method': { end: 'endmethod', display: 'method' },
      'Struct': { end: 'endstruct', display: 'struct' },
      'Interface': { end: 'endinterface', display: 'interface' },
      'Library': { end: 'endlibrary', display: 'library' },
      'Scope': { end: 'endscope', display: 'scope' },
      'Globals': { end: 'endglobals', display: 'globals' },
      'If': { end: 'endif', display: 'if statement' },
      'Loop': { end: 'endloop', display: 'loop' }
    };
    
    const constructor_name = node.constructor.name;
    const tagInfo = endTagMap[constructor_name];
    
    if (tagInfo && node.end_tag === null) {
      if (node.start_token) {
        const name = ('name' in node && node.name) ? ` '${(node.name as any).getText()}'` : '';
        this.add_token_error(
          node.start_token, 
          `${tagInfo.display}${name} is missing closing tag '${tagInfo.end}'`
        );
      }
    }
  }
  
  /**
   * 检查单个节点的嵌套规则
   */
  private checkNodeNesting(node: NodeAst): void {
    if (!node.parent) return;
    
    const nodeType = node.constructor.name.toLowerCase();
    const parentType = node.parent.constructor.name.toLowerCase();
    
    // library不能嵌套library
    if (node instanceof Library && node.parent instanceof Library) {
      if (node.start_token) {
        const libName = ('name' in node && node.name) ? ` '${(node.name as any).getText()}'` : '';
        const parentName = ('name' in node.parent && node.parent.name) ? ` '${(node.parent.name as any).getText()}'` : '';
        this.add_token_error(
          node.start_token, 
          `library${libName} cannot be nested inside library${parentName}`
        );
      }
    }
    
    // globals不能包含function/method/if/loop等
    if (node.parent instanceof Globals) {
      if (node instanceof Func || node instanceof Method || 
          node instanceof If || node instanceof Loop ||
          node instanceof zinc.Func || node instanceof zinc.Method) {
        if (node.start_token) {
          const name = ('name' in node && node.name) ? ` '${(node.name as any).getText()}'` : '';
          this.add_token_error(
            node.start_token, 
            `${nodeType}${name} cannot be declared inside globals block (globals can only contain variable declarations and types)`
          );
        }
      }
    }
    
    // if/loop必须在function或method内部
    if (node instanceof If || node instanceof Loop || 
        node instanceof zinc.If) {
      let hasValidParent = false;
      let current: NodeAst | null = node.parent;
      
      while (current) {
        if (current instanceof Func || current instanceof Method ||
            current instanceof zinc.Func || current instanceof zinc.Method) {
          hasValidParent = true;
          break;
        }
        current = current.parent;
      }
      
      if (!hasValidParent && node.start_token) {
        this.add_token_error(
          node.start_token, 
          `${nodeType} statement must be inside a function or method body`
        );
      }
    }
    
    // struct/interface不能嵌套
    if ((node instanceof Struct || node instanceof Interface ||
         node instanceof zinc.Struct || node instanceof zinc.Interface) &&
        (node.parent instanceof Struct || node.parent instanceof Interface ||
         node.parent instanceof zinc.Struct || node.parent instanceof zinc.Interface)) {
      if (node.start_token) {
        const name = ('name' in node && node.name) ? ` '${(node.name as any).getText()}'` : '';
        const parentName = ('name' in node.parent && node.parent.name) ? ` '${(node.parent.name as any).getText()}'` : '';
        this.add_token_error(
          node.start_token, 
          `${nodeType}${name} cannot be nested inside ${parentType}${parentName}`
        );
      }
    }
  }
  
  /**
   * 检查单个loop节点是否包含exitwhen
   */
  private checkNodeLoopExitwhen(node: NodeAst): void {
    if (!(node instanceof Loop)) return;
    
    let hasExitwhen = false;
    
    // 检查子节点是否有exitwhen
    const checkChildren = (parent: NodeAst): void => {
      for (const child of parent.children) {
        // 找到exitwhen语句
        if (child.start_token && child.start_token.getText() === 'exitwhen') {
          hasExitwhen = true;
          return;
        }
        // 递归检查（但不进入嵌套的loop）
        if (!(child instanceof Loop)) {
          checkChildren(child);
        }
      }
    };
    
    checkChildren(node);
    
    if (!hasExitwhen && node.start_token) {
      // 添加警告而不是错误
      this.errorCollection.warnings.push({
        start: {
          line: node.start_token.line,
          position: node.start_token.character
        },
        end: {
          line: node.start_token.line,
          position: node.start_token.character + node.start_token.length
        },
        message: `loop at line ${node.start_token.line + 1} does not contain 'exitwhen' statement (potential infinite loop)`
      });
    }
  }
  
  /**
   * 检查接口实现 - 确保struct实现了所有接口方法
   * 
   * 重要区分:
   * - extends Interface: 必须实现接口的所有方法 ✓
   * - extends Struct: 只是继承，不需要检查 ✗
   */
  private checkInterfaceImplementation(node: NodeAst): void {
    // 只检查struct节点
    if (!(node instanceof Struct) && !(node instanceof zinc.Struct) && !(node instanceof Interface) && !(node instanceof zinc.Interface)) {
      return;
    }
    
    // 检查是否extends
    if (!node.extends || node.extends.length === 0) {
      return;
    }
    
    const structName = node.name ? node.name.getText() : '(unknown)';
    
    // 收集struct中的所有方法
    const structMethods = new Map<string, Method | zinc.Method>();
    for (const child of node.children) {
      if (child instanceof Method || child instanceof zinc.Method) {
        const methodName = child.name ? child.name.getText() : '';
        if (methodName) {
          structMethods.set(methodName, child);
        }
      }
    }
    
    // 检查每个extends的类型
    for (const extendToken of node.extends) {
      const extendName = extendToken.getText();
      
      // ✅ 关键：区分是Interface还是Struct
      const extendedNode = this.findTypeDefinition(extendName);
      
      // 只有extends Interface时才需要检查方法实现
      if (!extendedNode || !(extendedNode instanceof Interface || extendedNode instanceof zinc.Interface)) {
        continue; // 是Struct或未找到，跳过检查
      }
      
      // 这是Interface，必须实现所有方法（包括继承链中的方法）
      const allRequiredMethods = this.collectAllInterfaceMethods(extendedNode);
      
      for (const [methodName, methodNode] of allRequiredMethods) {
        // 检查struct是否实现了这个方法
        if (!structMethods.has(methodName)) {
          // 未实现！报告错误
          if (node.start_token) {
            this.add_token_error(
              node.start_token,
              `struct '${structName}' does not implement method '${methodName}' from interface '${extendName}'`
            );
          }
        }
      }
    }
  }
  
  /**
   * 收集接口及其继承链中的所有方法
   * 递归遍历接口继承链，收集所有需要实现的方法
   * 包含循环继承检测，防止无限递归
   */
  private collectAllInterfaceMethods(interfaceNode: Interface | zinc.Interface): Map<string, Method | zinc.Method> {
    const allMethods = new Map<string, Method | zinc.Method>();
    const visited: string[] = []; // 防止循环继承
    const currentPath: string[] = []; // 当前继承路径，用于检测循环
    
    const collectMethods = (currentInterface: Interface | zinc.Interface) => {
      const interfaceName = currentInterface.name ? currentInterface.name.getText() : '';
      
      // 检查循环继承：如果当前接口已经在当前路径中，说明存在循环
      if (currentPath.indexOf(interfaceName) !== -1) {
        // 报告循环继承错误
        if (currentInterface.start_token) {
          this.add_token_error(
            currentInterface.start_token,
            `Circular inheritance detected: interface '${interfaceName}' extends itself through the inheritance chain`
          );
        }
        return; // 停止递归，避免无限循环
      }
      
      // 检查是否已经访问过（避免重复处理）
      if (visited.indexOf(interfaceName) !== -1) {
        return;
      }
      
      // 标记为已访问
      visited.push(interfaceName);
      currentPath.push(interfaceName);
      
      // 收集当前接口的直接方法
      for (const child of currentInterface.children) {
        if (child instanceof Method || child instanceof zinc.Method) {
          const methodName = child.name ? child.name.getText() : '';
          if (methodName && !allMethods.has(methodName)) {
            allMethods.set(methodName, child);
          }
        }
      }
      
      // 递归收集继承的接口方法
      if (currentInterface.extends && currentInterface.extends.length > 0) {
        for (const extendToken of currentInterface.extends) {
          const extendName = extendToken.getText();
          const extendedInterface = this.findTypeDefinition(extendName);
          
          if (extendedInterface && (extendedInterface instanceof Interface || extendedInterface instanceof zinc.Interface)) {
            collectMethods(extendedInterface);
          }
        }
      }
      
      // 从当前路径中移除当前接口（回溯）
      currentPath.pop();
    };
    
    collectMethods(interfaceNode);
    return allMethods;
  }
  
  /**
   * 在全局上下文中查找类型定义（Interface或Struct）
   * 返回找到的节点，用于区分是Interface还是Struct
   * 注意：vJASS只有extends，没有implements，struct继承不需要实现方法
   */
  private findTypeDefinition(name: string): Interface | zinc.Interface | Struct | zinc.Struct | null {
    // 使用ASTVisitor系统查找类型定义
    const typeFinder = new TypeDefinitionFinder(name);
    
    // 遍历所有文档
    for (const filePath of GlobalContext.keys) {
      const doc = GlobalContext.get(filePath);
      if (doc) {
        doc.accept(typeFinder);
        const found = typeFinder.getFoundType();
        if (found) {
          return found;
        }
      }
    }
    
    return null; // 未找到
  }
  
  // ==================== 模块系统 ====================
  
  /**
   * 检查模块实现 - 确保struct正确实现了模块
   * 包括模块方法注入和可选模块处理
   */
  private checkModuleImplementation(node: NodeAst): void {
    // 只检查struct节点
    if (!(node instanceof Struct) && !(node instanceof zinc.Struct)) {
      return;
    }
    
    const structName = node.name ? node.name.getText() : '(unknown)';
    const implementedModules: string[] = []; // 防止重复实现
    
    // 收集struct中的所有方法
    const structMethods = new Map<string, Method | zinc.Method>();
    for (const child of node.children) {
      if (child instanceof Method || child instanceof zinc.Method) {
        const methodName = child.name ? child.name.getText() : '';
        if (methodName) {
          structMethods.set(methodName, child);
        }
      }
    }
    
    // 检查模块实现
    for (const child of node.children) {
      if (child instanceof Implement) {
        const moduleName = child.moduleName ? child.moduleName.getText() : '';
        const isOptional = !!child.optional;
        
        if (!moduleName) {
          continue;
        }
        
        // 检查是否已经实现过这个模块
        if (implementedModules.indexOf(moduleName) !== -1) {
          // 重复实现，忽略
          continue;
        }
        
        // 查找模块定义
        const module = this.findModuleDefinition(moduleName);
        
        if (!module) {
          if (!isOptional) {
            // 必需模块未找到，报告错误
            if (child.moduleName) {
              this.errorCollection.errors.push({
                start: {
                  line: child.moduleName.line,
                  position: child.moduleName.character
                },
                end: {
                  line: child.moduleName.line,
                  position: child.moduleName.character + child.moduleName.length
                },
                message: `Module '${moduleName}' not found. Required module implementation failed.`
              });
            }
          }
          // 可选模块未找到，静默忽略
          continue;
        }
        
        // 标记为已实现
        implementedModules.push(moduleName);
        
        // 检查模块方法实现
        this.checkModuleMethods(module, structMethods, structName, moduleName);
        
        // 递归检查模块内部实现的模块
        this.checkNestedModuleImplementations(module, implementedModules, structMethods, structName);
      }
    }
  }
  
  /**
   * 查找模块定义
   */
  private findModuleDefinition(name: string): Module | null {
    // 使用GlobalContext的get_module_by_name方法
    const modules = GlobalContext.get_module_by_name(name);
    return modules.length > 0 ? modules[0] : null;
  }
  
  /**
   * 检查模块方法实现
   */
  private checkModuleMethods(
    module: Module, 
    structMethods: Map<string, Method | zinc.Method>, 
    structName: string, 
    moduleName: string
  ): void {
    for (const method of module.methods) {
      const methodName = method.name ? method.name.getText() : '';
      
      if (!methodName) {
        continue;
      }
      
      // 检查struct是否实现了这个方法
      if (!structMethods.has(methodName)) {
        // 未实现！报告错误
        if (module.name) {
          this.errorCollection.errors.push({
            start: {
              line: module.name.line,
              position: module.name.character
            },
            end: {
              line: module.name.line,
              position: module.name.character + module.name.length
            },
            message: `struct '${structName}' does not implement method '${methodName}' from module '${moduleName}'`
          });
        }
      }
    }
  }
  
  /**
   * 检查嵌套模块实现
   */
  private checkNestedModuleImplementations(
    module: Module,
    implementedModules: string[],
    structMethods: Map<string, Method | zinc.Method>,
    structName: string
  ): void {
    for (const implementation of module.implementations) {
      const moduleName = implementation.moduleName ? implementation.moduleName.getText() : '';
      const isOptional = !!implementation.optional;
      
      if (!moduleName || implementedModules.indexOf(moduleName) !== -1) {
        continue;
      }
      
      // 查找嵌套模块
      const nestedModule = this.findModuleDefinition(moduleName);
      
      if (!nestedModule) {
        if (!isOptional) {
          // 必需嵌套模块未找到
          if (implementation.moduleName) {
            this.errorCollection.errors.push({
              start: {
                line: implementation.moduleName.line,
                position: implementation.moduleName.character
              },
              end: {
                line: implementation.moduleName.line,
                position: implementation.moduleName.character + implementation.moduleName.length
              },
              message: `Nested module '${moduleName}' not found in module implementation.`
            });
          }
        }
        continue;
      }
      
      // 标记为已实现
      implementedModules.push(moduleName);
      
      // 检查嵌套模块方法
      this.checkModuleMethods(nestedModule, structMethods, structName, moduleName);
      
      // 递归检查更深层的嵌套
      this.checkNestedModuleImplementations(nestedModule, implementedModules, structMethods, structName);
    }
  }

  // ==================== 类型推断系统 ====================
  
  /**
   * 推断表达式的类型
   * 参考Clang的类型推断系统
   */
  private inferExpressionType(expr: any): string | null {
    if (!expr) {
      return null;
    }
    
    // 1. Id - 标识符，查找变量类型
    if ('expr' in expr && expr.expr instanceof Token) {
      const token = expr.expr as Token;
      const varType = this.findVariableType(token.getText());
      return varType;
    }
    
    // 2. Value - 字面量
    if ('value' in expr && expr.value instanceof Token) {
      const token = expr.value as Token;
      const text = token.getText();
      
      // 判断字面量类型
      if (token.type == TokenType.String) return 'string';
      if (token.type == TokenType.Integer) return 'integer'; // fourcc
      if (token.type == TokenType.Real) return 'real';
      if (text === 'true' || text === 'false') return 'boolean';
      if (text === 'null') return 'null';
      
      return null;
    }
    
    // 3. Caller - 函数调用，查找返回类型
    if ('name' in expr && expr.name && 'params' in expr) {
      const funcName = this.extractIdentifierFromExpr(expr.name);
      if (funcName) {
        const returnType = this.findFunctionReturnType(funcName);
        return returnType;
      }
    }
    
    // 4. BinaryExpr - 二元表达式
    if ('left' in expr && 'right' in expr && 'op' in expr) {
      const op = expr.op instanceof Token ? expr.op.getText() : '';
      
      // 比较运算符返回boolean
      if (['==', '!=', '>', '<', '>=', '<=', 'and', 'or'].includes(op)) {
        return 'boolean';
      }
      
      // 算术运算符，推断左侧类型
      const leftType = this.inferExpressionType(expr.left);
      return leftType;
    }
    
    // 5. UnaryExpr - 一元表达式
    if ('unary' in expr && expr.unary) {
      return this.inferExpressionType(expr.unary);
    }
    
    // 6. MemberReference - 成员引用（this.field）
    if ('names' in expr && Array.isArray(expr.names)) {
      // 需要查找struct的成员类型
      return null; // 暂时返回null
    }
    
    return null;
  }
  
  /**
   * 从表达式中提取标识符名称
   */
  private extractIdentifierFromExpr(expr: any): string | null {
    if ('expr' in expr && expr.expr instanceof Token) {
      return expr.expr.getText();
    }
    return null;
  }
  
  /**
   * 查找变量类型
   */
  private findVariableType(varName: string): string | null {
    if (!this.program) {
      return null;
    }
    
    // 在AST中查找变量定义
    const findVar = (node: NodeAst): string | null => {
      // Local变量
      if (node instanceof Local && node.name && node.name.getText() === varName) {
        return node.type ? node.type.getText() : null;
      }
      
      // 全局变量
      if (node instanceof GlobalVariable && node.name && node.name.getText() === varName) {
        return node.type ? node.type.getText() : null;
      }
      
      // Struct成员
      if ((node instanceof Member || node instanceof zinc.Member) && 
          node.name && node.name.getText() === varName) {
        return node.type ? node.type.getText() : null;
      }
      
      // 参数
      if (node instanceof Func || node instanceof Method || node instanceof Native ||
          node instanceof zinc.Func || node instanceof zinc.Method) {
        if (node.takes) {
          for (const take of node.takes) {
            if (take.name && take.name.getText() === varName) {
              return take.type ? take.type.getText() : null;
            }
          }
        }
      }
      
      // 递归查找
      for (const child of node.children) {
        const found = findVar(child);
        if (found) {
          return found;
        }
      }
      
      return null;
    };
    
    return findVar(this.program);
  }
  
  /**
   * 查找函数返回类型
   */
  private findFunctionReturnType(funcName: string): string | null {
    if (!this.program) {
      return null;
    }
    
    // 在AST中查找函数定义
    const findFunc = (node: NodeAst): string | null => {
      if ((node instanceof Func || node instanceof Native || node instanceof Method ||
           node instanceof zinc.Func || node instanceof zinc.Method) &&
          node.name && node.name.getText() === funcName) {
        return node.returns ? node.returns.getText() : 'nothing';
      }
      
      for (const child of node.children) {
        const found = findFunc(child);
        if (found) {
          return found;
        }
      }
      
      return null;
    };
    
    return findFunc(this.program);
  }
  
  /**
   * 检查类型匹配 - 表达式类型推断和错误分析
   * 参考Clang的类型检查系统
   */
  private checkTypeMatching(node: NodeAst): void {
    // 检查Set语句的类型匹配
    if (node instanceof Set || node instanceof zinc.Set) {
      this.checkSetTypeMatching(node);
    }
    
    // 检查Local变量初始化的类型匹配
    if (node instanceof Local) {
      this.checkLocalTypeMatching(node);
    }
    
    // 检查GlobalVariable初始化的类型匹配
    if (node instanceof GlobalVariable) {
      this.checkGlobalVariableTypeMatching(node);
    }
  }
  
  /**
   * 检查Set语句的类型匹配
   * set x = y + 1  ← x的类型 应该匹配 y+1的类型
   */
  private checkSetTypeMatching(node: Set | zinc.Set): void {
    // 获取左侧变量名
    if (!('name' in node) || !node.name) {
      return;
    }
    
    // 提取变量名（处理VariableName）
    let varName: string | null = null;
    if ('names' in node.name && Array.isArray(node.name.names)) {
      const firstToken = node.name.names[0];
      if (firstToken instanceof Token) {
        varName = firstToken.getText();
      }
    }
    
    if (!varName) {
      return;
    }
    
    // 查找变量类型（左侧）
    const leftType = this.findVariableType(varName);
    if (!leftType) {
      return; // 变量未找到，可能有其他错误
    }
    
    // 推断右侧表达式类型
    const rightType = this.inferExpressionType(('init' in node) ? node.init : null);
    if (!rightType) {
      return; // 无法推断类型
    }
    
    // 类型检查
    if (!this.isTypeCompatible(leftType, rightType)) {
      // 类型不匹配！
      if (node.start_token) {
        this.errorCollection.warnings.push({
          start: {
            line: node.start_token.line,
            position: node.start_token.character
          },
          end: {
            line: node.end_token ? node.end_token.line : node.start_token.line,
            position: node.end_token ? node.end_token.character : node.start_token.character + node.start_token.length
          },
          message: `Type mismatch: cannot assign '${rightType}' to '${leftType}' (variable '${varName}')`
        });
      }
    }
  }
  
  /**
   * 检查Local变量初始化的类型匹配
   * local integer x = "string"  ← 类型不匹配
   */
  private checkLocalTypeMatching(node: Local): void {
    if (!node.type || !('expr' in node) || !node.expr) {
      return;
    }
    
    const varName = node.name ? node.name.getText() : '(unknown)';
    const declaredType = node.type.getText();
    const initType = this.inferExpressionType(node.expr);
    
    if (initType && !this.isTypeCompatible(declaredType, initType)) {
      if (node.start_token) {
        this.errorCollection.warnings.push({
          start: {
            line: node.start_token.line,
            position: node.start_token.character
          },
          end: {
            line: node.end_token ? node.end_token.line : node.start_token.line,
            position: node.end_token ? node.end_token.character : node.start_token.character + node.start_token.length
          },
          message: `Type mismatch in local variable '${varName}': cannot initialize '${declaredType}' with '${initType}'`
        });
      }
    }
  }
  
  /**
   * 检查全局变量初始化的类型匹配
   */
  private checkGlobalVariableTypeMatching(node: GlobalVariable): void {
    if (!node.type || !('expr' in node) || !node.expr) {
      return;
    }
    
    const varName = node.name ? node.name.getText() : '(unknown)';
    const declaredType = node.type.getText();
    const initType = this.inferExpressionType(node.expr);
    
    if (initType && !this.isTypeCompatible(declaredType, initType)) {
      if (node.start_token) {
        this.errorCollection.warnings.push({
          start: {
            line: node.start_token.line,
            position: node.start_token.character
          },
          end: {
            line: node.end_token ? node.end_token.line : node.start_token.line,
            position: node.end_token ? node.end_token.character : node.start_token.character + node.start_token.length
          },
          message: `Type mismatch in global variable '${varName}': cannot initialize '${declaredType}' with '${initType}'`
        });
      }
    }
  }
  
  /**
   * 检查两个类型是否兼容
   * 参考类型系统的兼容性规则
   */
  private isTypeCompatible(targetType: string, sourceType: string): boolean {
    // 完全相同
    if (targetType === sourceType) {
      return true;
    }
    
    // null可以赋值给handle类型
    if (sourceType === 'null' && this.isHandleType(targetType)) {
      return true;
    }
    
    // integer可以自动转换为real
    if (targetType === 'real' && sourceType === 'integer') {
      return true;
    }
    
    // handle类型的继承关系（简化处理）
    if (this.isHandleType(targetType) && this.isHandleType(sourceType)) {
      return true; // handle类型之间可以互相赋值
    }
    
    return false;
  }
  
  /**
   * 判断是否是handle类型
   */
  private isHandleType(type: string): boolean {
    // 基础handle类型
    const handleTypes = ['handle', 'agent', 'event', 'player', 'widget', 
                        'unit', 'destructable', 'item', 'ability', 'buff', 
                        'force', 'group', 'trigger', 'triggercondition', 
                        'triggeraction', 'timer', 'location', 'region', 
                        'rect', 'boolexpr', 'sound', 'effect', 'unitpool', 
                        'itempool', 'quest', 'questitem', 'defeatcondition', 
                        'timerdialog', 'leaderboard', 'multiboard', 
                        'multiboarditem', 'trackable', 'dialog', 'button', 
                        'texttag', 'lightning', 'image', 'ubersplat', 
                        'fogstate', 'fogmodifier', 'hashtable'];
    
    if (handleTypes.includes(type.toLowerCase())) {
      return true;
    }
    
    // 自定义的struct也是handle类型
    const typeNode = this.findTypeDefinition(type);
    if (typeNode instanceof Struct || typeNode instanceof zinc.Struct) {
      return true;
    }
    
    return false;
  }

  /**
   * @deprecated
   * @param name 
   * @returns 
   */
  public get_struct_by_name(name: string):(Struct|zinc.Struct)[] {
    const structs:(Struct|zinc.Struct)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitStruct: (node) => {
          if (node.name && node.name.getText() === name) {
            structs.push(node);
          }
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitStruct: (node) => {
          if (node.name && node.name.getText() === name) {
            structs.push(node);
          }
        }
      });
    });

    return structs;
  }

  public get_interface_by_name(name: string):(Interface|zinc.Interface)[] {
    const interfaces:(Interface|zinc.Interface)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitInterface: (node) => {
          if (node.name && node.name.getText() === name) {
            interfaces.push(node);
          }
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitInterface: (node) => {
          if (node.name && node.name.getText() === name) {
            interfaces.push(node);
          }
        }
      });
    });

    return interfaces;
  }

  public get_struct_by_extends_name(name: string):(Struct|zinc.Struct)[] {
    const structs:(Struct|zinc.Struct)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitStruct: (node) => {
          if (node.extends && node.extends.length > 0 && node.extends.map(extends_type_token => extends_type_token.getText()).includes(name)) {
            structs.push(node);
          }
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitStruct: (node) => {
          if (node.extends && node.extends.length > 0 && node.extends.map(extends_type_token => extends_type_token.getText()).includes(name)) {
            structs.push(node);
          }
        }
      });
    });

    return structs;
  }

  public get_interface_by_extends_name(name: string):(Interface|zinc.Interface)[] {
    const interfaces:(Interface|zinc.Interface)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitInterface: (node) => {
          if (node.extends && node.extends.length > 0 && node.extends.map(extends_type_token => extends_type_token.getText()).includes(name)) {
            interfaces.push(node);
          }
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitInterface: (node) => {
          if (node.extends && node.extends.length > 0 && node.extends.map(extends_type_token => extends_type_token.getText()).includes(name)) {
            interfaces.push(node);
          }
        }
      });
    });

    return interfaces;
  }

  public get_all_structs():(Struct|zinc.Struct)[] {
    const structs:(Struct|zinc.Struct)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitStruct: (node) => {
          structs.push(node);
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitStruct: (node) => {
          structs.push(node);
        }
      });
    });

    return structs;
  }

  public get_all_interfaces():(Interface|zinc.Interface)[] {
    const interfaces:(Interface|zinc.Interface)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitInterface: (node) => {
          interfaces.push(node);
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitInterface: (node) => {
          interfaces.push(node);
        }
      });
    });

    return interfaces;
  }

  public get_all_functions():(Func|zinc.Func)[] {
    const functions:(Func|zinc.Func)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitFunc: (node) => {
          functions.push(node);
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitFunc: (node) => {
          functions.push(node);
        }
      });
    });

    return functions;
  }

  public get_all_natives():Native[] {
    const natives:Native[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitNative: (node) => {
          natives.push(node);
        }
      });
    }

    return natives;
  }

  public get_all_methods():(Method|zinc.Method)[] {
    const methods:(Method|zinc.Method)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitMethod: (node) => {
          methods.push(node);
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitMethod: (node) => {
          methods.push(node);
        }
      });
    });

    return methods;
  }

  public get_all_libraries():Library[] {
    const libraries:Library[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitLibrary: (node) => {
          libraries.push(node);
        }
      });
    }

    return libraries;
  }

  public get_all_scopes():Scope[] {
    const scopes:Scope[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitScope: (node) => {
          scopes.push(node);
        }
      });
    }

    return scopes;
  }

  public get_all_global_variables():(GlobalVariable|zinc.Member)[] {
    const globals:(GlobalVariable|zinc.Member)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitGlobalVariable: (node) => {
          globals.push(node);
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitGlobalVariable: (node) => {
          globals.push(node);
        }
      });
    });

    return globals;
  }

  public get_all_members():(Member|zinc.Member)[] {
    const members:(Member|zinc.Member)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitMember: (node) => {
          members.push(node);
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitMember: (node) => {
          members.push(node);
        }
      });
    });

    return members;
  }

  public get_all_locals():(Local|zinc.Member)[] {
    const locals:(Local|zinc.Member)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitLocal: (node) => {
          locals.push(node);
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitLocal: (node) => {
          locals.push(node);
        }
      });
    });

    return locals;
  }

  public get_all_types():Type[] {
    const types:Type[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitType: (node) => {
          types.push(node);
        }
      });
    }

    return types;
  }

  // 兼容性属性 - 使用getter方法
  public get functions():(Func|zinc.Func)[] { return this.get_all_functions(); }
  public get natives():Native[] { return this.get_all_natives(); }
  public get methods():(Method|zinc.Method)[] { return this.get_all_methods(); }
  public get structs():(Struct|zinc.Struct)[] { return this.get_all_structs(); }
  public get interfaces():(Interface|zinc.Interface)[] { return this.get_all_interfaces(); }
  public get librarys():Library[] { return this.get_all_libraries(); }
  public get scopes():Scope[] { return this.get_all_scopes(); }
  public get global_variables():(GlobalVariable|zinc.Member)[] { return this.get_all_global_variables(); }
  public get members():(Member|zinc.Member)[] { return this.get_all_members(); }
  public get locals():(Local|zinc.Member)[] { return this.get_all_locals(); }
  public get types():Type[] { return this.get_all_types(); }
  public get modules():Module[] { return this.get_all_modules(); }

  public get_all_modules():Module[] {
    const modules: Module[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitModule: (node) => {
          modules.push(node);
        }
      });
    }

    return modules;
  }

  public get_module_by_name(name: string): Module[] {
    const modules: Module[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitModule: (node) => {
          if (node.name && node.name.getText() === name) {
            modules.push(node);
          }
        }
      });
    }

    return modules;
  }

  public get_function_set_by_name(name: string):(Func|Native|Method|zinc.Func|zinc.Method)[] {
    const funcs:(Func|Native|Method|zinc.Func|zinc.Method)[] = [];

    // 使用visitor模式遍历AST树
    if (this.program) {
      this.visitNode(this.program, {
        visitFunc: (node) => {
          if (node.name && node.name.getText() === name) {
            funcs.push(node);
          }
        },
        visitNative: (node) => {
          if (node.name && node.name.getText() === name) {
            funcs.push(node);
          }
        },
        visitMethod: (node) => {
          if (node.name && node.name.getText() === name) {
            funcs.push(node);
          }
        }
      });
    }

    // 遍历zinc节点
    this.zincNodes.forEach(zincNode => {
      this.visitNode(zincNode, {
        visitFunc: (node) => {
          if (node.name && node.name.getText() === name) {
            funcs.push(node);
          }
        },
        visitMethod: (node) => {
          if (node.name && node.name.getText() === name) {
            funcs.push(node);
          }
        }
      });
    });

    return funcs;
}
}



export class TokenType {
  static Conment = "Conment";
  static Identifier = "Identifier";
  static Operator = "Operator";
  static Integer = "Integer";
  static Real = "Real";
  static String = "String";
  static Mark = "Mark";
  static Unkown = "Unkown";
  static BlockComment = "BlockComment";
  static EmbeddedToken = "EmbeddedToken";
};

export class StringCollection {
  public static readonly StringMap:Map<number, string> = new Map();

  private static _id:number = -1;
  public static get_id() :number {
    const id = StringCollection._id;
    StringCollection._id--;
    return id;
  }
}

export class Token /*extends Range*/ {
  private static textCache = new Map<number, string>();
  // public readonly document: Document;
  /**
   * 当前行
   */
  public readonly line: number;
  /**
   * 当前行的位置
   */
  public readonly character: number;
  /**
   * 整个content的indexof
   */
  public readonly index: number;
  /**
   * text文本长度
   */
  public readonly length: number;
  /**
   * 类型
   */
  public readonly type: string;
  /**
   * 是否完整
   */
  public readonly is_complete: boolean;
  //@ts-ignore
  // public readonly type_name: string;
  private text_or_index:number|string


  public constructor(text: string, line: number, character: number, position: number, length: number, type: string, is_complete: boolean = true) {
    // super(new Position(line, character), new Position(line, character + length));
    // this.document = document;
    this.line = line;
    this.character = character;
    this.index = position;
    this.length = length;
    this.type = type;
    this.is_complete = is_complete;

    const text_index = AllTokenTexts.indexOf(text);
    if (text_index != -1) {
      // 转为负数，为负数时代表在AllTokenTexts中
      this.text_or_index = text_index;
    } else {
      this.text_or_index = text;
    }
    // this.text_or_index = text;

    // if (text.startsWith("globals")) {
    //   console.log(`'${text}'`);
    // }

    //   if (this.type == TokenType.Conment) {
    //     return "Comment";
    //   } else if (this.type == TokenType.Identifier) {
    //     return "Identifier";
    //   } else if (this.type == TokenType.Operator) {
    //     return "Operator";
    //   } else if (this.type == TokenType.Integer) {
    //     return "Integer";
    //   } else if (this.type == TokenType.Real) {
    //     return "Real";
    //   } else if (this.type == TokenType.String) {
    //     return "String";
    //   } else if (this.type == TokenType.Mark) {
    //     return "Mark";
    //   } else {
    //     return "Unkown";
    //   }
  }

  public getText(): string {
    // return this.document.content.substring(this.position, this.position + this.length);
    if (typeof this.text_or_index == "number") {
      return AllTokenTexts[this.text_or_index];
    } else {
      return this.text_or_index;  
    }
  }

  public is_value(): boolean {
    return this.type == TokenType.Integer || this.type == TokenType.Real || this.type == TokenType.String || this.type == TokenType.Mark || this.type == TokenType.EmbeddedToken;
  }


  // public get type_name() : string {
  //     if (this.type == TokenType.Conment) {
  //         return "Comment";
  //       } else if (this.type == TokenType.Identifier) {
  //         return "Identifier";
  //       } else if (this.type == TokenType.Operator) {
  //         return "Operator";
  //       } else if (this.type == TokenType.Integer) {
  //         return "Integer";
  //       } else if (this.type == TokenType.Real) {
  //         return "Real";
  //       } else if (this.type == TokenType.String) {
  //         return "String";
  //       } else if (this.type == TokenType.Mark) {
  //         return "Mark";
  //       } else {
  //         return "Unkown";
  //       }
  // }


  public clone(): Token {
    return Object.assign({}, this) as Token;
  }


  public get is_block_comment(): boolean {
    return this.type == TokenType.BlockComment;
  }
  public get is_comment(): boolean {
    return this.type == TokenType.Conment;
  }
  public get is_identifier(): boolean {
    return this.type == TokenType.Identifier;
  }
  public get is_operator(): boolean {
    return this.type == TokenType.Operator;
  }

  /**
   * 赋值运算符
   */
  public get is_asignment_operator(): boolean {
    return this.is_operator && (() => {
      const text = this.getText();
      return text == "=" || text == "+=" || text == "-=" || text == "*=" || text == "/=" || text == "%="; 
    })();
  }
  /**
   * 二元运算符
   */
  public get is_binary_operator(): boolean {
    const text = this.getText();
    return text == "+" || text == "-" || text == "*" || text == "/" || text == "==" || text == ">" || text == "<" || text == ">=" || text == "<=" || text == "!=" || text == "or" || text == "and" || text == "%" || text == "&&" || text == "||";
  }
  /**
   * 一元运算符
   */
  public get is_unary_operator(): boolean {
    return this.is_operator && (() => {
      const text = this.getText();
      return text == "+" || text == "-" || text == "not" || text == "!";
    })();
  }

}

export interface TokenHandleResult {
  state?: number;
  length?: number;
  token?: Token | null;
}


export function tokenize(document: Document, call: (document: Document, line: number, character: number, position: number, char: string, next_char: string, state: number, length: number) => TokenHandleResult | undefined) {
  let line: number = 0;;
  let character: number = 0;
  let state: number = 0;
  let length: number = 0;
  const tokens: Token[] = [];
  const content = document.content;
  // @ts-expect-error
  document.line_points.push({
    line: 0,
    position: 0
  });
  document.line_token_indexs.push({
    line: 0,
    index: 0,
    count: 0
  });
  const last_line_token_indexs = () => {
    return document.line_token_indexs[document.line_token_indexs.length - 1];
  };
  for (let index = 0; index < content.length; index++) {
    const char = content.charAt(index);
    const next_char = content.charAt(index + 1);
    // const new_state = is_only_jass ? jass_token.token_handle(context, line, character, index, char, next_char, state, length) : vjass_token.token_handle(context, line, character, index, char, next_char, state, length);
    const new_state = call(document, line, character, index, char, next_char, state, length);

    // substate = new_state.substate;
    if (char == "\n") {
      line++;
      character = 0;

      // @ts-expect-error
      document.line_points.push({
        line,
        position: index + 1
      });
      document.line_token_indexs.push({
        line,
        index: tokens.length,
        count: 0
      });
    } else {
      character++;
    }

    if (new_state?.state !== undefined) {
      state = new_state.state;
    }
    if (new_state?.length !== undefined) {
      length = new_state.length;
    }
    if (new_state?.token) {
      tokens.push(new_state.token);
      last_line_token_indexs().count++;
    }
  }
  // @ts-expect-error
  document.tokens = tokens;
  // @ts-expect-error
  document.lineCount = line + 1;
  return document;
}














