import { removeComment } from "../vjass/comment";
import { parseAndRemovePreprocessor, Define, Include } from "../vjass/preprocess";
import { parseAndRemoveLuaSegement } from "../vjass/lua-segement-remover";
import { parseAndRemoveZincBlock, ZincBlockCollection } from "../vjass/zinc-block";
import { Parser } from "../vjass/parser";
import { InnerZincParser } from "../vjass/inner-zinc-parser";
import { ZincProgram } from "../vjass/zinc-ast";
import { BlockStatement } from "../vjass/vjass-ast";
import { ErrorCollection } from "../vjass/simple-error";
import { TextMacroExpander } from "../vjass/text-macro-expander";

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
 * 4. 调用 Parser 解析
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
        textMacroExpander
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

    // 步骤2: 预处理指令
    content = parseAndRemovePreprocessor(content, errors, preprocessCollection);

    // 步骤3: Lua 段
    content = parseAndRemoveLuaSegement(content, errors);

    // 步骤4: 解析并移除 Zinc 块
    const zincBlockCollection: ZincBlockCollection = { blocks: [] };
    content = parseAndRemoveZincBlock(content, errors, zincBlockCollection);

    // 步骤5: 解析 Zinc 块
    for (const zincBlock of zincBlockCollection.blocks) {
        try {
            const zincParser = new InnerZincParser(zincBlock.code, filePath);
            const statements = zincParser.parse();
            const zincProgram = new ZincProgram(statements);
            
            // 注意：InnerZincParser 目前不提供错误收集
            // 如果需要错误收集，可以在 InnerZincParser 中添加 errors 属性
            // zincProgram 已解析，但错误信息暂时不可用
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

    // 步骤6: 调用 Parser 解析剩余的 vJass 代码
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

    return {
        blockStatement,
        errors,
        preprocessCollection,
        zincBlocks: zincBlockCollection
    };
}

