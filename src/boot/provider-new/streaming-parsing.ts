import { removeComment } from "../vjass/comment";
import { parseAndRemovePreprocessor, Define, Include } from "../vjass/preprocess";
import { parseAndRemoveLuaSegement } from "../vjass/lua-segement-remover";
import { Parser } from "../vjass/parser";
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

    // 步骤4: 调用 Parser 解析
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
        preprocessCollection
    };
}

