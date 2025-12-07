import { removeComment } from "../vjass/comment";
import { parseAndRemovePreprocessor, Define, Include } from "../vjass/preprocess";
import { parseAndRemoveLuaSegement } from "../vjass/lua-segement-remover";
import { parseAndRemoveZincBlock, ZincBlockCollection } from "../vjass/zinc-block";
import { Parser } from "../vjass/parser";
import { InnerZincParser } from "../vjass/inner-zinc-parser";
import { ZincProgram } from "../vjass/zinc-ast";
import { BlockStatement, ZincBlockStatement, Statement, LibraryDeclaration, StructDeclaration } from "../vjass/vjass-ast";
import { ErrorCollection } from "../vjass/simple-error";
import { TextMacroExpander } from "../vjass/text-macro-expander";

/**
 * 递归将 Zinc 块注入到 AST 的正确位置
 */
function injectZincBlockIntoAST(
    block: BlockStatement,
    zincBlockStatement: ZincBlockStatement,
    targetLine: number
): boolean {
    // 首先尝试在顶级 body 中注入
    let insertIndex = block.body.length;
    for (let i = 0; i < block.body.length; i++) {
        const stmt = block.body[i];
        
        // 检查是否在某个语句的范围内（如 library、struct）
        if (stmt.start && stmt.end) {
            const stmtStartLine = stmt.start.line;
            const stmtEndLine = stmt.end.line;
            
            // 如果 Zinc 块在这个语句的范围内，尝试注入到该语句的 members 中
            if (targetLine >= stmtStartLine && targetLine <= stmtEndLine) {
                // 检查是否是 LibraryDeclaration
                if (stmt instanceof LibraryDeclaration) {
                    // 在 library 的 members 中查找插入位置
                    let memberInsertIndex = stmt.members.length;
                    for (let j = 0; j < stmt.members.length; j++) {
                        const member = stmt.members[j];
                        if (member.start && member.start.line >= targetLine) {
                            memberInsertIndex = j;
                            break;
                        }
                    }
                    stmt.members.splice(memberInsertIndex, 0, zincBlockStatement);
                    return true;
                }
                // 检查是否是 StructDeclaration
                else if (stmt instanceof StructDeclaration) {
                    // 在 struct 的 members 中查找插入位置
                    let memberInsertIndex = stmt.members.length;
                    for (let j = 0; j < stmt.members.length; j++) {
                        const member = stmt.members[j];
                        if (member.start && member.start.line >= targetLine) {
                            memberInsertIndex = j;
                            break;
                        }
                    }
                    stmt.members.splice(memberInsertIndex, 0, zincBlockStatement);
                    return true;
                }
            }
            
            // 如果 Zinc 块在这个语句之前，在这里插入
            if (stmtStartLine >= targetLine) {
                insertIndex = i;
                break;
            }
        }
    }
    
    // 如果没有找到嵌套位置，在顶级 body 中插入
    block.body.splice(insertIndex, 0, zincBlockStatement);
    return true;
}

/**
 * 流式解析配置
 */
export interface StreamingParsingOptions {
    /** 文件路径 */
    filePath?: string;
    /** 是否删除行注释 */
    deleteLineComment?: boolean;
    /** TextMacroExpander（可选，用于展开 runtextmacro） */
    textMacroExpander?: TextMacroExpander;
    /** 是否启用预处理器 */
    enablePreprocessor?: boolean;
    /** 是否启用 Lua 块 */
    enableLuaBlocks?: boolean;
}

/**
 * 流式解析结果
 */
export interface StreamingParsingResult {
    /** 解析后的 BlockStatement */
    blockStatement: BlockStatement | null;
    /** 错误集合 */
    errors: ErrorCollection;
    /** 预处理指令集合 */
    preprocessCollection: {
        defines: Define[];
        includes: Include[];
    };
    /** Zinc 代码块集合 */
    zincBlocks: ZincBlockCollection;
}

/**
 * 流式解析函数
 * 按照以下顺序处理内容：
 * 1. 移除多行注释 (removeComment)
 * 2. 预处理指令 (parseAndRemovePreprocessor)
 * 3. Lua 段 (parseAndRemoveLuaSegement)
 * 4. 解析并移除 Zinc 块 (parseAndRemoveZincBlock)
 * 5. 调用 Parser 解析
 * 6. 解析 Zinc 块 (parseZincBlock)
 * 7. 合并 Parser 的错误
 * 8. 返回解析结果
 * 
 * @param content 源代码内容
 * @param options 解析选项
 * @returns 解析结果
 */
export function streamingParse(
    content: string,
    options: StreamingParsingOptions = {}
): StreamingParsingResult {
    const {
        filePath = "",
        deleteLineComment = false,
        textMacroExpander,
        enablePreprocessor = true,
        enableLuaBlocks = true
    } = options;

    // 初始化错误集合
    const errors: ErrorCollection = {
        errors: [],
        warnings: [],
        checkValidationErrors: [] as any[]
    };

    // 初始化预处理指令集合
    const preprocessCollection: {
        defines: Define[];
        includes: Include[];
    } = {
        defines: [],
        includes: []
    };

    // 步骤1: 移除多行注释
    content = removeComment(content, errors, deleteLineComment);

    // 步骤2: 预处理指令（如果启用）
    if (enablePreprocessor) {
        content = parseAndRemovePreprocessor(content, errors, preprocessCollection);
    }

    // 步骤3: Lua 段（如果启用）
    if (enableLuaBlocks) {
        content = parseAndRemoveLuaSegement(content, errors);
    }

    // 步骤4: 解析并移除 Zinc 块
    const zincBlockCollection: ZincBlockCollection = { blocks: [] };
    content = parseAndRemoveZincBlock(content, errors, zincBlockCollection);

    // 步骤5: 调用 Parser 解析剩余的 vJass 代码（Zinc 块已被替换为空行）
    let blockStatement: BlockStatement | null = null;
    try {
        const parser = new Parser(content, filePath, textMacroExpander);
        blockStatement = parser.parse();
        
        // 合并 Parser 的错误
        if (parser.errors.errors.length > 0) {
            errors.errors.push(...parser.errors.errors);
        }
        if (parser.errors.warnings.length > 0) {
            errors.warnings.push(...parser.errors.warnings);
        }
        if (parser.errors.checkValidationErrors && parser.errors.checkValidationErrors.length > 0) {
            if (!errors.checkValidationErrors) {
                errors.checkValidationErrors = [];
            }
            errors.checkValidationErrors.push(...parser.errors.checkValidationErrors);
        }
    } catch (error) {
        console.error(`Failed to parse content:`, error);
        // 错误已记录到 errors 集合中
    }

    // 步骤6: 解析 Zinc 块并注入回 AST
    if (blockStatement && zincBlockCollection.blocks.length > 0) {
        // 按行号排序 Zinc 块（从后往前插入，避免行号变化）
        const sortedBlocks = [...zincBlockCollection.blocks].sort((a, b) => b.startLine - a.startLine);
        
        for (const zincBlock of sortedBlocks) {
            try {
                // 解析 Zinc 代码
                const zincParser = new InnerZincParser(zincBlock.code, filePath);
                const statements = zincParser.parse();
                
                // 合并 InnerZincParser 的错误
                if (zincParser.errors) {
                    errors.errors.push(...zincParser.errors.errors);
                    errors.warnings.push(...zincParser.errors.warnings);
                    const checkErrors = zincParser.errors.checkValidationErrors;
                    if (checkErrors && Array.isArray(checkErrors)) {
                        if (!errors.checkValidationErrors) {
                            errors.checkValidationErrors = [];
                        }
                        errors.checkValidationErrors.push(...checkErrors);
                    }
                }
                
                // 创建 ZincBlockStatement
                const zincBlockStatement = new ZincBlockStatement({
                    content: zincBlock.code,
                    zincStatements: statements,
                    start: { line: zincBlock.startLine, position: 0 },
                    end: { line: zincBlock.endLine, position: 0 }
                });
                
                // 递归查找并注入 Zinc 块到正确的位置
                injectZincBlockIntoAST(blockStatement, zincBlockStatement, zincBlock.startLine);
            } catch (error) {
                console.error(`Failed to parse Zinc block at line ${zincBlock.startLine}:`, error);
                errors.errors.push({
                    start: { line: zincBlock.startLine, position: 0 },
                    end: { line: zincBlock.startLine, position: 0 },
                    message: `Failed to parse Zinc block: ${error}`,
                    fix: "Check Zinc syntax"
                });
            }
        }
    }

    return {
        blockStatement,
        errors,
        preprocessCollection,
        zincBlocks: zincBlockCollection
    };
}

