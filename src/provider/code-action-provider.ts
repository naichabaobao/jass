/**
 * 代码操作提供者
 * 提供多种快速修复功能：
 * - 接口方法未实现的自动生成
 * - 删除未使用的变量/函数
 * - 删除常量赋值操作
 * - 删除死代码
 * - 修复方法调用参数错误
 * - 添加库依赖
 */

import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import { 
    StructDeclaration, 
    InterfaceDeclaration, 
    MethodDeclaration,
    Identifier,
    VariableDeclaration,
    ThistypeExpression,
    LibraryDeclaration
} from '../vjass/ast';
import { BlockStatement } from '../vjass/ast';

export class CodeActionProvider implements vscode.CodeActionProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];

        // 检查诊断信息
        for (const diagnostic of context.diagnostics) {
            const message = diagnostic.message;
            
            // 1. 检查是否是接口方法未实现的错误
            const interfaceMatch = message.match(/Struct '([^']+)' must implement method '([^']+)' from interface '([^']+)'/);
            if (interfaceMatch) {
                const action = this.createImplementMethodAction(
                    document,
                    diagnostic,
                    interfaceMatch[1],
                    interfaceMatch[2],
                    interfaceMatch[3]
                );
                if (action) {
                    actions.push(action);
                }
            }
            
            // 2. 检查是否是未使用的变量/函数
            const unusedMatch = message.match(/未使用的(局部变量|函数) '([^']+)'/);
            if (unusedMatch) {
                const action = this.createRemoveUnusedAction(document, diagnostic, unusedMatch[2], unusedMatch[1]);
                if (action) {
                    actions.push(action);
                }
            }
            
            // 3. 检查是否是常量赋值错误
            if (message.includes('不能被赋值') && message.includes('常量')) {
                const action = this.createRemoveConstantAssignmentAction(document, diagnostic);
                if (action) {
                    actions.push(action);
                }
            }
            
            // 4. 检查是否是死代码
            if (message.includes('死代码') || message.includes('dead code')) {
                const action = this.createRemoveDeadCodeAction(document, diagnostic);
                if (action) {
                    actions.push(action);
                }
            }
            
            // 5. 检查是否是方法调用参数数量不匹配
            const paramMatch = message.match(/方法调用参数数量不匹配|期望 (\d+) 个参数，但提供了 (\d+) 个/);
            if (paramMatch) {
                const action = this.createFixMethodCallParamsAction(document, diagnostic, message);
                if (action) {
                    actions.push(action);
                }
            }
            
            // 6. 检查是否是未声明的库依赖
            const libMatch = message.match(/库 '([^']+)' 未找到|Library '([^']+)' not found/);
            if (libMatch) {
                const libName = libMatch[1] || libMatch[2];
                const action = this.createAddLibraryRequiresAction(document, diagnostic, libName);
                if (action) {
                    actions.push(action);
                }
            }
        }

        return actions;
    }

    /**
     * 创建实现方法的快速修复操作
     */
    private createImplementMethodAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        structName: string,
        methodName: string,
        interfaceName: string
    ): vscode.CodeAction | null {
        try {
            // 获取文件的 AST
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            
            if (!blockStatement) {
                return null;
            }

            // 查找接口定义
            const interfaceNode = this.findInterface(blockStatement.body, interfaceName);
            if (!interfaceNode) {
                return null;
            }

            // 查找接口中的方法定义
            const interfaceMethod = this.findMethodInInterface(interfaceNode, methodName);
            if (!interfaceMethod) {
                return null;
            }

            // 查找结构体定义
            const structNode = this.findStruct(blockStatement.body, structName);
            if (!structNode) {
                return null;
            }

            // 生成方法实现代码
            const methodCode = this.generateMethodCode(interfaceMethod, methodName);

            // 找到结构体的结束位置（在 endstruct 之前）
            const insertPosition = this.findStructInsertPosition(document, structNode);

            // 创建代码操作
            const action = new vscode.CodeAction(
                `实现接口方法 '${methodName}'`,
                vscode.CodeActionKind.QuickFix
            );

            action.edit = new vscode.WorkspaceEdit();
            action.edit.insert(document.uri, insertPosition, methodCode);
            action.diagnostics = [diagnostic];
            action.isPreferred = true;

            return action;
        } catch (error) {
            console.error('Error creating implement method action:', error);
            return null;
        }
    }

    /**
     * 在 AST 中查找接口定义
     */
    private findInterface(statements: any[], interfaceName: string): InterfaceDeclaration | null {
        for (const stmt of statements) {
            if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === interfaceName) {
                    return stmt;
                }
            }
            
            // 递归查找（可能在 library 中）
            if (stmt.members && Array.isArray(stmt.members)) {
                const found = this.findInterface(stmt.members, interfaceName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 在接口中查找方法定义
     */
    private findMethodInInterface(interfaceNode: InterfaceDeclaration, methodName: string): MethodDeclaration | null {
        for (const member of interfaceNode.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === methodName) {
                    return member;
                }
            }
        }
        return null;
    }

    /**
     * 在 AST 中查找结构体定义
     */
    private findStruct(statements: any[], structName: string): StructDeclaration | null {
        for (const stmt of statements) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === structName) {
                    return stmt;
                }
            }
            
            // 递归查找（可能在 library 中）
            if (stmt.members && Array.isArray(stmt.members)) {
                const found = this.findStruct(stmt.members, structName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 生成方法实现代码
     */
    private generateMethodCode(method: MethodDeclaration, methodName: string): string {
        // 构建方法签名
        let code = '\tmethod ';
        
        if (method.isStatic) {
            code += 'static ';
        }
        
        code += methodName;
        
        // 参数
        if (method.parameters && method.parameters.length > 0) {
            const params = method.parameters.map(p => {
                let type = 'integer';
                if (p.type) {
                    if (p.type instanceof Identifier) {
                        type = p.type.name;
                    } else if (p.type instanceof ThistypeExpression) {
                        type = 'thistype';
                    }
                }
                const name = p.name ? p.name.name : 'param';
                return `${type} ${name}`;
            }).join(', ');
            code += ` takes ${params}`;
        } else {
            code += ' takes nothing';
        }
        
        // 返回值
        if (method.returnType) {
            if (method.returnType instanceof ThistypeExpression) {
                code += ' returns thistype';
            } else if (method.returnType instanceof Identifier) {
                code += ` returns ${method.returnType.name}`;
            }
        } else {
            code += ' returns nothing';
        }
        
        code += '\n';
        code += '\t\t// TODO: 实现方法逻辑\n';
        
        // 如果有返回值，添加 return 语句
        if (method.returnType) {
            if (method.returnType instanceof ThistypeExpression) {
                code += '\t\treturn this\n';
            } else if (method.returnType instanceof Identifier) {
                const returnType = method.returnType.name;
                if (returnType === 'integer') {
                    code += '\t\treturn 0\n';
                } else if (returnType === 'real') {
                    code += '\t\treturn 0.0\n';
                } else if (returnType === 'boolean') {
                    code += '\t\treturn false\n';
                } else if (returnType === 'string') {
                    code += '\t\treturn ""\n';
                } else {
                    code += '\t\treturn null\n';
                }
            }
        }
        
        code += '\tendmethod';
        
        return code;
    }

    /**
     * 查找结构体中插入方法的位置（在 endstruct 之前）
     */
    private findStructInsertPosition(document: vscode.TextDocument, structNode: StructDeclaration): vscode.Position {
        if (structNode.end) {
            // 在 endstruct 之前插入
            const line = structNode.end.line - 1; // endstruct 所在行（0-based，VSCode 使用 0-based）
            
            // 查找 endstruct 行
            if (line >= 0 && line < document.lineCount) {
                const lineText = document.lineAt(line).text;
                
                // 如果这一行是 endstruct，在其之前插入
                if (lineText.trim().toLowerCase() === 'endstruct') {
                    // 获取 struct 成员的缩进（查看第一个成员）
                    let indent = 0;
                    if (structNode.members && structNode.members.length > 0) {
                        const firstMember = structNode.members[0];
                        if (firstMember.start) {
                            const memberLine = document.lineAt(firstMember.start.line - 1);
                            indent = this.getIndent(memberLine.text);
                        }
                    }
                    // 在 endstruct 之前插入，使用相同的缩进
                    return new vscode.Position(line, indent);
                }
            }
            
            // 如果找不到 endstruct，尝试在结构体成员之后插入
            if (structNode.members && structNode.members.length > 0) {
                const lastMember = structNode.members[structNode.members.length - 1];
                if (lastMember.end) {
                    const lastLine = lastMember.end.line - 1; // 转换为 0-based
                    if (lastLine >= 0 && lastLine < document.lineCount) {
                        const lastLineText = document.lineAt(lastLine).text;
                        const indent = this.getIndent(lastLineText);
                        // 在最后一行之后插入，使用相同的缩进
                        return new vscode.Position(lastLine + 1, indent);
                    }
                }
            }
        }
        
        // 如果找不到合适的位置，返回结构体开始位置之后
        if (structNode.start) {
            const startLine = structNode.start.line; // 1-based
            if (startLine < document.lineCount) {
                return new vscode.Position(startLine, 1); // 在 struct 声明之后插入
            }
        }
        
        // 最后的回退：返回文档末尾
        return new vscode.Position(document.lineCount - 1, 0);
    }

    /**
     * 获取行的缩进
     */
    private getIndent(line: string): number {
        let indent = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '\t') {
                indent++;
            } else if (line[i] === ' ') {
                indent++;
            } else {
                break;
            }
        }
        return indent;
    }

    /**
     * 创建删除未使用变量/函数的代码操作
     */
    private createRemoveUnusedAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        symbolName: string,
        symbolType: string
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                `删除未使用的${symbolType} '${symbolName}'`,
                vscode.CodeActionKind.QuickFix
            );

            // 获取诊断范围对应的完整行
            const range = diagnostic.range;
            const startLine = range.start.line;
            const endLine = range.end.line;
            
            // 删除整个声明（可能跨多行）
            const edit = new vscode.WorkspaceEdit();
            edit.delete(document.uri, new vscode.Range(
                new vscode.Position(startLine, 0),
                new vscode.Position(endLine + 1, 0)
            ));
            
            action.edit = edit;
            action.diagnostics = [diagnostic];
            action.isPreferred = false; // 删除操作不是首选，需要用户确认

            return action;
        } catch (error) {
            console.error('Error creating remove unused action:', error);
            return null;
        }
    }

    /**
     * 创建删除常量赋值操作的代码操作
     */
    private createRemoveConstantAssignmentAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                '删除常量赋值操作',
                vscode.CodeActionKind.QuickFix
            );

            // 删除赋值语句
            const range = diagnostic.range;
            const line = document.lineAt(range.start.line);
            const lineText = line.text;
            
            // 查找赋值语句的结束位置（通常是行尾或分号）
            let endPosition = lineText.length;
            const semicolonIndex = lineText.indexOf(';', range.start.character);
            if (semicolonIndex >= 0) {
                endPosition = semicolonIndex + 1;
            }
            
            // 如果整行都是赋值语句，删除整行
            const trimmedLine = lineText.trim();
            if (trimmedLine.startsWith('set ') || trimmedLine.startsWith('call ')) {
                const edit = new vscode.WorkspaceEdit();
                edit.delete(document.uri, new vscode.Range(
                    new vscode.Position(range.start.line, 0),
                    new vscode.Position(range.start.line + 1, 0)
                ));
                action.edit = edit;
            } else {
                // 只删除赋值部分
                const edit = new vscode.WorkspaceEdit();
                edit.delete(document.uri, new vscode.Range(
                    range.start,
                    new vscode.Position(range.start.line, endPosition)
                ));
                action.edit = edit;
            }
            
            action.diagnostics = [diagnostic];
            action.isPreferred = true;

            return action;
        } catch (error) {
            console.error('Error creating remove constant assignment action:', error);
            return null;
        }
    }

    /**
     * 创建删除死代码的代码操作
     */
    private createRemoveDeadCodeAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                '删除死代码',
                vscode.CodeActionKind.QuickFix
            );

            // 删除死代码（通常是 return 之后的代码）
            const range = diagnostic.range;
            const edit = new vscode.WorkspaceEdit();
            
            // 删除从诊断开始到下一个有意义语句之间的所有代码
            // 这里简化处理，删除诊断范围内的代码
            edit.delete(document.uri, range);
            
            action.edit = edit;
            action.diagnostics = [diagnostic];
            action.isPreferred = false; // 删除代码需要谨慎

            return action;
        } catch (error) {
            console.error('Error creating remove dead code action:', error);
            return null;
        }
    }

    /**
     * 创建修复方法调用参数错误的代码操作
     */
    private createFixMethodCallParamsAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        message: string
    ): vscode.CodeAction | null {
        try {
            // 尝试从消息中提取期望的参数数量
            const expectedMatch = message.match(/期望 (\d+) 个参数/);
            const providedMatch = message.match(/提供了 (\d+) 个/);
            
            if (!expectedMatch || !providedMatch) {
                return null;
            }
            
            const expected = parseInt(expectedMatch[1], 10);
            const provided = parseInt(providedMatch[1], 10);
            
            const action = new vscode.CodeAction(
                `修复方法调用参数（期望 ${expected} 个，当前 ${provided} 个）`,
                vscode.CodeActionKind.QuickFix
            );

            // 获取方法调用行
            const range = diagnostic.range;
            const line = document.lineAt(range.start.line);
            const lineText = line.text;
            
            // 查找方法调用的参数部分
            const callMatch = lineText.match(/(\w+)\.(\w+)\((.*)\)/);
            if (!callMatch) {
                return null;
            }
            
            const paramsText = callMatch[3];
            const params = paramsText.split(',').map(p => p.trim()).filter(p => p.length > 0);
            
            const edit = new vscode.WorkspaceEdit();
            
            if (provided > expected) {
                // 参数过多，删除多余的参数
                const newParams = params.slice(0, expected);
                const newParamsText = newParams.join(', ');
                const newCall = `${callMatch[1]}.${callMatch[2]}(${newParamsText})`;
                edit.replace(document.uri, line.range, lineText.replace(callMatch[0], newCall));
            } else if (provided < expected) {
                // 参数不足，添加默认参数
                const newParams = [...params];
                for (let i = provided; i < expected; i++) {
                    newParams.push('0'); // 默认使用 0
                }
                const newParamsText = newParams.join(', ');
                const newCall = `${callMatch[1]}.${callMatch[2]}(${newParamsText})`;
                edit.replace(document.uri, line.range, lineText.replace(callMatch[0], newCall));
            }
            
            action.edit = edit;
            action.diagnostics = [diagnostic];
            action.isPreferred = false; // 自动修复参数需要用户确认

            return action;
        } catch (error) {
            console.error('Error creating fix method call params action:', error);
            return null;
        }
    }

    /**
     * 创建添加库依赖的代码操作
     */
    private createAddLibraryRequiresAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        libName: string
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                `添加库依赖 '${libName}'`,
                vscode.CodeActionKind.QuickFix
            );

            // 查找 library 声明的位置
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            
            if (!blockStatement) {
                return null;
            }

            // 查找使用该库的 library 声明
            let targetLibrary: any = null;
            for (const stmt of blockStatement.body) {
                if (stmt instanceof LibraryDeclaration) {
                    // 检查这个库是否使用了未声明的库
                    // 这里简化处理，在第一个 library 声明中添加 requires
                    if (!targetLibrary) {
                        targetLibrary = stmt;
                    }
                }
            }

            if (!targetLibrary || !targetLibrary.start) {
                return null;
            }

            // 在 library 声明后添加 requires
            const libraryLine = targetLibrary.start.line - 1; // 转换为 0-based
            if (libraryLine < 0 || libraryLine >= document.lineCount) {
                return null;
            }

            const line = document.lineAt(libraryLine);
            const lineText = line.text;
            
            // 检查是否已经有 requires
            if (lineText.includes('requires')) {
                // 在现有的 requires 列表中添加
                const requiresMatch = lineText.match(/requires\s+([^\n]+)/);
                if (requiresMatch) {
                    const existingRequires = requiresMatch[1].trim();
                    const newRequires = `${existingRequires}, ${libName}`;
                    const edit = new vscode.WorkspaceEdit();
                    edit.replace(document.uri, line.range, lineText.replace(requiresMatch[0], `requires ${newRequires}`));
                    action.edit = edit;
                }
            } else {
                // 添加新的 requires 子句
                const edit = new vscode.WorkspaceEdit();
                const insertPos = new vscode.Position(libraryLine + 1, 0);
                edit.insert(document.uri, insertPos, `requires ${libName}\n`);
                action.edit = edit;
            }
            
            action.diagnostics = [diagnostic];
            action.isPreferred = true;

            return action;
        } catch (error) {
            console.error('Error creating add library requires action:', error);
            return null;
        }
    }
}

