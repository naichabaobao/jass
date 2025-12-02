import * as vscode from 'vscode';
import {
    ZincProgram,
    ZincStatement,
    ZincFunctionDeclaration,
    ZincMethodDeclaration,
    ZincVariableDeclaration,
    ZincBlock,
    ZincParameter,
    ZincIfStatement,
    ZincWhileStatement,
    ZincForStatement
} from '../../vjass/zinc-ast';
import { Identifier } from '../../vjass/vjass-ast';

/**
 * 局部作用域辅助工具
 * 用于查找函数/方法内部的局部变量和参数
 */
export class ZincLocalScopeHelper {
    /**
     * 查找包含指定位置的函数或方法
     */
    static findContainingFunctionOrMethod(
        program: ZincProgram,
        position: vscode.Position
    ): ZincFunctionDeclaration | ZincMethodDeclaration | null {
        for (const stmt of program.declarations) {
            const funcOrMethod = this.findContainingFunctionOrMethodInStatement(stmt, position);
            if (funcOrMethod) {
                return funcOrMethod;
            }
        }
        return null;
    }

    /**
     * 在语句中查找包含指定位置的函数或方法
     */
    private static findContainingFunctionOrMethodInStatement(
        stmt: ZincStatement,
        position: vscode.Position
    ): ZincFunctionDeclaration | ZincMethodDeclaration | null {
        // 函数声明
        if (stmt instanceof ZincFunctionDeclaration) {
            if (this.isPositionInNode(stmt, position)) {
                return stmt;
            }
            // 递归查找嵌套的函数
            if (stmt.body) {
                for (const bodyStmt of stmt.body.statements) {
                    const nested = this.findContainingFunctionOrMethodInStatement(bodyStmt, position);
                    if (nested) {
                        return nested;
                    }
                }
            }
        }
        // 方法声明
        else if (stmt instanceof ZincMethodDeclaration) {
            if (this.isPositionInNode(stmt, position)) {
                return stmt;
            }
            // 递归查找嵌套的函数
            if (stmt.body) {
                for (const bodyStmt of stmt.body.statements) {
                    const nested = this.findContainingFunctionOrMethodInStatement(bodyStmt, position);
                    if (nested) {
                        return nested;
                    }
                }
            }
        }
        // 库声明
        else if (stmt.constructor.name === 'ZincLibraryDeclaration') {
            const libStmt = stmt as any;
            if (libStmt.body) {
                for (const member of libStmt.body.statements) {
                    const nested = this.findContainingFunctionOrMethodInStatement(member, position);
                    if (nested) {
                        return nested;
                    }
                }
            }
        }
        // 结构体声明
        else if (stmt.constructor.name === 'ZincStructDeclaration') {
            const structStmt = stmt as any;
            if (structStmt.members) {
                for (const member of structStmt.members) {
                    if (member instanceof ZincMethodDeclaration) {
                        const nested = this.findContainingFunctionOrMethodInStatement(member, position);
                        if (nested) {
                            return nested;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * 检查位置是否在节点范围内
     * 参数在整个函数/方法范围内都可用（包括函数声明行和函数体）
     */
    private static isPositionInNode(
        node: ZincFunctionDeclaration | ZincMethodDeclaration,
        position: vscode.Position
    ): boolean {
        if (!node.start || !node.end) {
            return false;
        }

        const startLine = node.start.line;
        const endLine = node.end.line;

        // 位置在函数/方法开始行和结束行之间（包括结束行）
        // 允许位置在结束行的下一行（容错处理）
        if (position.line < startLine || position.line > endLine + 1) {
            return false;
        }

        // 如果位置在函数声明行，也认为是有效的（参数在函数声明行也可见）
        if (position.line === startLine) {
            return true;
        }

        // 检查是否在函数体内
        if (node.body) {
            const bodyStart = node.body.start;
            const bodyEnd = node.body.end;
            if (bodyStart && bodyEnd) {
                const bodyStartLine = bodyStart.line;
                const bodyEndLine = bodyEnd.line;

                // 位置在函数体范围内
                if (position.line >= bodyStartLine && position.line <= bodyEndLine) {
                    return true;
                }
            }
        }

        // 如果位置在结束行，也认为是有效的
        if (position.line === endLine) {
            return true;
        }

        return false;
    }

    /**
     * 在函数/方法中查找局部变量和参数
     * 考虑作用域：只返回在指定位置之前声明的变量
     */
    static findLocalVariablesAndParameters(
        funcOrMethod: ZincFunctionDeclaration | ZincMethodDeclaration,
        position: vscode.Position
    ): Array<{ variable: ZincVariableDeclaration | ZincParameter; isParameter: boolean }> {
        const results: Array<{ variable: ZincVariableDeclaration | ZincParameter; isParameter: boolean }> = [];

        // 1. 添加参数（参数在整个函数/方法中可见）
        if (funcOrMethod instanceof ZincFunctionDeclaration) {
            for (const param of funcOrMethod.parameters) {
                if (param.name) {
                    results.push({ variable: param, isParameter: true });
                }
            }
        } else if (funcOrMethod instanceof ZincMethodDeclaration) {
            for (const param of funcOrMethod.parameters) {
                if (param.name) {
                    results.push({ variable: param, isParameter: true });
                }
            }
        }

        // 2. 在函数/方法体中查找局部变量（考虑作用域）
        if (funcOrMethod.body) {
            this.findLocalVariablesInBlock(funcOrMethod.body, position, results);
        }

        return results;
    }

    /**
     * 在代码块中查找局部变量
     */
    private static findLocalVariablesInBlock(
        block: ZincBlock,
        position: vscode.Position,
        results: Array<{ variable: ZincVariableDeclaration | ZincParameter; isParameter: boolean }>
    ): void {
        for (const stmt of block.statements) {
            // 检查是否是变量声明
            if (stmt instanceof ZincVariableDeclaration) {
                // 检查变量是否在指定位置之前声明（作用域检查）
                if (this.isVariableBeforePosition(stmt, position)) {
                    // 检查是否已存在同名变量（避免重复）
                    const varName = stmt.name?.name;
                    if (varName && !results.some(r => {
                        const name = r.variable instanceof ZincParameter
                            ? r.variable.name?.name
                            : (r.variable as ZincVariableDeclaration).name?.name;
                        return name === varName;
                    })) {
                        results.push({ variable: stmt, isParameter: false });
                    }
                }
            }
            // 递归查找嵌套块中的局部变量
            else if (stmt instanceof ZincIfStatement) {
                const ifStmt = stmt as any;
                if (ifStmt.thenBlock && this.isPositionInBlock(ifStmt.thenBlock, position)) {
                    this.findLocalVariablesInBlock(ifStmt.thenBlock, position, results);
                }
                if (ifStmt.elseBlock && this.isPositionInBlock(ifStmt.elseBlock, position)) {
                    this.findLocalVariablesInBlock(ifStmt.elseBlock, position, results);
                }
            }
            else if (stmt instanceof ZincWhileStatement) {
                const whileStmt = stmt as any;
                if (whileStmt.body && this.isPositionInBlock(whileStmt.body, position)) {
                    this.findLocalVariablesInBlock(whileStmt.body, position, results);
                }
            }
            else if (stmt instanceof ZincForStatement) {
                const forStmt = stmt as any;
                if (forStmt.body && this.isPositionInBlock(forStmt.body, position)) {
                    this.findLocalVariablesInBlock(forStmt.body, position, results);
                }
            }
        }
    }

    /**
     * 检查变量是否在指定位置之前声明
     */
    private static isVariableBeforePosition(
        variable: ZincVariableDeclaration,
        position: vscode.Position
    ): boolean {
        if (!variable.start) {
            return false;
        }

        const varLine = variable.start.line;
        const varPos = variable.start.position || 0;

        // 变量必须在当前位置之前声明
        if (varLine < position.line) {
            return true;
        }
        if (varLine === position.line && varPos < position.character) {
            return true;
        }

        return false;
    }

    /**
     * 检查位置是否在代码块范围内
     */
    private static isPositionInBlock(
        block: ZincBlock,
        position: vscode.Position
    ): boolean {
        if (!block.start || !block.end) {
            return false;
        }

        const startLine = block.start.line;
        const endLine = block.end.line;
        const startPos = block.start.position || 0;
        const endPos = block.end.position || 0;

        if (position.line < startLine || position.line > endLine) {
            return false;
        }
        if (position.line === startLine && position.character < startPos) {
            return false;
        }
        if (position.line === endLine && position.character > endPos) {
            return false;
        }

        return true;
    }
}

