import * as vscode from 'vscode';
import { BlockStatement, ZincBlockStatement } from '../vjass/ast';
import { DataEnterManager } from './data-enter-manager';
import { InnerZincParser } from '../vjass/inner-zinc-parser';
import { ZincProgram } from '../vjass/zinc-ast';

/**
 * Zinc 块信息
 */
export interface ZincBlockInfo {
    block: ZincBlockStatement;
    content: string;
    startLine: number;
    program: ZincProgram | null;
}

/**
 * Zinc 块辅助工具
 */
export class ZincBlockHelper {
    /**
     * 查找包含指定位置的 Zinc 块
     */
    static findZincBlock(
        document: vscode.TextDocument,
        position: vscode.Position,
        dataEnterManager: DataEnterManager
    ): ZincBlockInfo | null {
        try {
            const filePath = document.uri.fsPath;
            const blockStatement = dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                return null;
            }

            // 递归查找 Zinc 块
            const result = this.findZincBlockInBlock(blockStatement, position);
            if (!result) {
                return null;
            }

            // 解析 Zinc 代码
            let program: ZincProgram | null = null;
            try {
                const zincParser = new InnerZincParser(result.content, filePath);
                const statements = zincParser.parse();
                program = new ZincProgram(statements);
            } catch (error) {
                console.error('Error parsing Zinc block:', error);
            }

            return {
                block: result.block,
                content: result.content,
                startLine: result.startLine,
                program
            };
        } catch (error) {
            console.error('Error finding Zinc block:', error);
            return null;
        }
    }

    /**
     * 在 BlockStatement 中递归查找 Zinc 块
     */
    private static findZincBlockInBlock(
        block: BlockStatement,
        position: vscode.Position
    ): { block: ZincBlockStatement; content: string; startLine: number } | null {
        for (const stmt of block.body) {
            if (stmt instanceof ZincBlockStatement) {
                // 检查位置是否在 Zinc 块内
                if (stmt.start && stmt.end) {
                    const startLine = stmt.start.line;
                    const endLine = stmt.end.line;
                    
                    // 位置在 Zinc 块范围内（不包括 //! zinc 和 //! endzinc 行）
                    if (position.line > startLine && position.line < endLine) {
                        return {
                            block: stmt,
                            content: stmt.content,
                            startLine: startLine + 1 // Zinc 内容从下一行开始
                        };
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                // 递归查找嵌套块
                const result = this.findZincBlockInBlock(stmt, position);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
}

