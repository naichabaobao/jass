import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from '../data-enter-manager';
import { ZincKeywords } from '../../vjass/keyword';
import {
    ZincProgram,
    ZincStatement,
    ZincFunctionDeclaration,
    ZincVariableDeclaration,
    ZincStructDeclaration,
    ZincInterfaceDeclaration,
    ZincTypeDeclaration,
    ZincLibraryDeclaration,
    ZincModuleDeclaration,
    ZincMethodDeclaration,
    ZincParameter
} from '../../vjass/zinc-ast';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from '../comment-parser';
import { ZincLocalScopeHelper } from './zinc-local-scope-helper';

/**
 * Zinc 代码补全提供者
 * 专门处理 .zn 文件的代码补全
 */
export class ZincCompletionProvider implements vscode.CompletionItemProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        try {
            const filePath = document.uri.fsPath;
            const ext = path.extname(filePath).toLowerCase();

            // 只处理 .zn 文件
            if (ext !== '.zn') {
                return [];
            }

            const items: vscode.CompletionItem[] = [];
            const itemSet = new Set<string>(); // 用于去重

            // 1. 添加 Zinc 关键字
            ZincKeywords.forEach(keyword => {
                if (!itemSet.has(keyword)) {
                    const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                    item.sortText = `0_keyword_${keyword}`;
                    items.push(item);
                    itemSet.add(keyword);
                }
            });

            // 2. 从 DataEnterManager 获取当前文件的 ZincProgram
            // 如果还没有缓存，先触发更新（异步，不阻塞）
            let currentFileProgram = this.dataEnterManager.getZincProgram(filePath);
            if (!currentFileProgram) {
                // 如果还没有解析，先更新文件（异步执行，不等待）
                this.dataEnterManager.updateFile(filePath, document.getText()).then(() => {
                    // 更新后，下次补全时会包含新的内容
                }).catch(err => {
                    console.error(`Failed to update Zinc file ${filePath}:`, err);
                });
                // 继续使用当前可能为空的结果，下次补全时会更新
            }
            
            // 检查是否是 library 成员访问（如 libraryName.）
            const libraryMemberAccess = this.detectLibraryMemberAccess(document, position);
            if (libraryMemberAccess) {
                // 提供该 library 的成员补全（从所有文件中查找）
                if (currentFileProgram) {
                    this.addLibraryMemberCompletions(
                        currentFileProgram,
                        libraryMemberAccess.libraryName,
                        filePath,
                        items,
                        itemSet
                    );
                }
                
                // 从所有缓存的 .zn 文件中查找 library 成员
                const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
                for (const cachedFilePath of allCachedFiles) {
                    if (cachedFilePath === filePath) {
                        continue; // 跳过当前文件（已处理）
                    }

                    if (!this.dataEnterManager.isZincFile(cachedFilePath)) {
                        continue; // 只处理 .zn 文件
                    }

                    const program = this.dataEnterManager.getZincProgram(cachedFilePath);
                    if (program) {
                        this.addLibraryMemberCompletions(
                            program,
                            libraryMemberAccess.libraryName,
                            cachedFilePath,
                            items,
                            itemSet
                        );
                    }
                }
            } else {
                // 正常补全流程
                if (currentFileProgram) {
                    this.extractCompletionItemsFromProgram(currentFileProgram, filePath, items, itemSet);
                    
                    // 添加局部变量和参数的补全
                    this.addLocalVariablesAndParameters(currentFileProgram, filePath, position, items, itemSet);
                }

                // 3. 从所有缓存的 .zn 文件中提取补全项
                const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
                for (const cachedFilePath of allCachedFiles) {
                    if (cachedFilePath === filePath) {
                        continue; // 跳过当前文件（已处理）
                    }

                    if (!this.dataEnterManager.isZincFile(cachedFilePath)) {
                        continue; // 只处理 .zn 文件
                    }

                    const program = this.dataEnterManager.getZincProgram(cachedFilePath);
                    if (program) {
                        this.extractCompletionItemsFromProgram(program, cachedFilePath, items, itemSet);
                    }
                }
            }

            // 按 sortText 排序
            items.sort((a, b) => {
                const aSort = a.sortText || '';
                const bSort = b.sortText || '';
                return aSort.localeCompare(bSort);
            });

            return items;
        } catch (error) {
            console.error('ZincCompletionProvider error:', error);
            return [];
        }
    }


    /**
     * 从 ZincProgram 中提取补全项
     */
    private extractCompletionItemsFromProgram(
        program: ZincProgram,
        filePath: string,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {
        for (const stmt of program.declarations) {
            this.extractCompletionItemsFromStatement(stmt, filePath, items, itemSet);
        }
    }

    /**
     * 从 ZincStatement 中提取补全项
     */
    private extractCompletionItemsFromStatement(
        stmt: ZincStatement,
        filePath: string,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {
        // 函数声明
        if (stmt instanceof ZincFunctionDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Function
                );
                
                // 构建函数签名
                const params = stmt.parameters.map(p => {
                    const type = p.type ? p.type.name : 'nothing';
                    return `${type} ${p.name ? p.name.name : ''}`;
                }).join(', ');
                const returnType = stmt.returnType ? stmt.returnType.name : 'nothing';
                const publicStr = stmt.isPublic ? 'public ' : '';
                const privateStr = stmt.isPrivate ? 'private ' : '';
                const signature = `${publicStr}${privateStr}function ${stmt.name.name}(${params}) -> ${returnType}`;
                item.detail = signature;
                
                // 添加注释作为文档，使用 appendCodeblock 显示代码签名
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(signature, 'zinc');
                const comment = this.extractCommentForStatement(stmt, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                item.documentation = doc;

                item.sortText = `1_function_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 变量声明（全局变量）
        else if (stmt instanceof ZincVariableDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Variable
                );
                
                const type = stmt.type ? stmt.type.name : 'nothing';
                const constantStr = stmt.isConstant ? 'constant ' : '';
                const publicStr = stmt.isPublic ? 'public ' : '';
                const privateStr = stmt.isPrivate ? 'private ' : '';
                let arrayStr = '';
                if (stmt.arraySizes.length > 0) {
                    arrayStr = stmt.arraySizes.map(size => {
                        if (size === undefined) {
                            return '[]';
                        } else if (typeof size === 'number') {
                            return `[${size}]`;
                        } else {
                            return `[${size.name}]`;
                        }
                    }).join('');
                }
                const signature = `${publicStr}${privateStr}${constantStr}${type} ${stmt.name.name}${arrayStr}`;
                item.detail = signature;
                
                // 使用 appendCodeblock 显示代码签名
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(signature, 'zinc');
                const comment = this.extractCommentForStatement(stmt, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                item.documentation = doc;

                item.sortText = `2_variable_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 结构体声明
        else if (stmt instanceof ZincStructDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Class
                );
                
                const publicStr = stmt.isPublic ? 'public ' : '';
                const privateStr = stmt.isPrivate ? 'private ' : '';
                let structStr = `${publicStr}${privateStr}struct`;
                if (stmt.storageSize !== null) {
                    const sizeStr = typeof stmt.storageSize === 'number'
                        ? stmt.storageSize.toString()
                        : stmt.storageSize.name;
                    structStr += `[${sizeStr}]`;
                }
                structStr += ` ${stmt.name.name}`;
                if (stmt.isArrayStruct && stmt.arraySize !== null) {
                    const sizeStr = typeof stmt.arraySize === 'number'
                        ? stmt.arraySize.toString()
                        : stmt.arraySize.name;
                    structStr += `[${sizeStr}]`;
                }
                item.detail = structStr;
                
                // 使用 appendCodeblock 显示代码签名
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(structStr, 'zinc');
                const comment = this.extractCommentForStatement(stmt, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                item.documentation = doc;

                item.sortText = `3_struct_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);

                // 提取结构体成员
                if (stmt.members) {
                    for (const member of stmt.members) {
                        if (member instanceof ZincVariableDeclaration && member.name) {
                            const memberName = `${stmt.name.name}.${member.name.name}`;
                            if (!itemSet.has(memberName)) {
                                const memberItem = new vscode.CompletionItem(
                                    memberName,
                                    vscode.CompletionItemKind.Field
                                );
                                const memberType = member.type ? member.type.name : 'nothing';
                                const constantStr = member.isConstant ? 'constant ' : '';
                                let arrayStr = '';
                                if (member.arraySizes.length > 0) {
                                    arrayStr = member.arraySizes.map(size => {
                                        if (size === undefined) {
                                            return '[]';
                                        } else if (typeof size === 'number') {
                                            return `[${size}]`;
                                        } else {
                                            return `[${size.name}]`;
                                        }
                                    }).join('');
                                }
                                const memberSignature = `${memberType} ${memberName}${arrayStr}`;
                                memberItem.detail = memberSignature;
                                
                                // 使用 appendCodeblock 显示代码签名
                                const memberDoc = new vscode.MarkdownString();
                                memberDoc.appendCodeblock(memberSignature, 'zinc');
                                memberItem.documentation = memberDoc;
                                
                                memberItem.sortText = `4_struct_member_${memberName}`;
                                items.push(memberItem);
                                itemSet.add(memberName);
                            }
                        } else if (member instanceof ZincMethodDeclaration && member.name) {
                            const memberName = `${stmt.name.name}.${member.name.name}`;
                            if (!itemSet.has(memberName)) {
                                const memberItem = new vscode.CompletionItem(
                                    memberName,
                                    vscode.CompletionItemKind.Method
                                );
                                const params = member.parameters.map(p => {
                                    const type = p.type ? p.type.name : 'nothing';
                                    return `${type} ${p.name ? p.name.name : ''}`;
                                }).join(', ');
                                const returnType = member.returnType ? member.returnType.name : 'nothing';
                                const staticStr = member.isStatic ? 'static ' : '';
                                const methodSignature = `${staticStr}method ${memberName}(${params}) -> ${returnType}`;
                                memberItem.detail = methodSignature;
                                
                                // 使用 appendCodeblock 显示代码签名
                                const methodDoc = new vscode.MarkdownString();
                                methodDoc.appendCodeblock(methodSignature, 'zinc');
                                memberItem.documentation = methodDoc;
                                
                                memberItem.sortText = `4_struct_method_${memberName}`;
                                items.push(memberItem);
                                itemSet.add(memberName);
                            }
                        }
                    }
                }
            }
        }
        // 接口声明
        else if (stmt instanceof ZincInterfaceDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Interface
                );
                
                const publicStr = stmt.isPublic ? 'public ' : '';
                const privateStr = stmt.isPrivate ? 'private ' : '';
                const interfaceSignature = `${publicStr}${privateStr}interface ${stmt.name.name}`;
                item.detail = interfaceSignature;
                
                // 使用 appendCodeblock 显示代码签名
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(interfaceSignature, 'zinc');
                const comment = this.extractCommentForStatement(stmt, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                item.documentation = doc;

                item.sortText = `5_interface_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);

                // 提取接口成员
                if (stmt.members) {
                    for (const member of stmt.members) {
                        if (member instanceof ZincVariableDeclaration && member.name) {
                            const memberName = `${stmt.name.name}.${member.name.name}`;
                            if (!itemSet.has(memberName)) {
                                const memberItem = new vscode.CompletionItem(
                                    memberName,
                                    vscode.CompletionItemKind.Field
                                );
                                const memberType = member.type ? member.type.name : 'nothing';
                                const memberSignature = `${memberType} ${memberName}`;
                                memberItem.detail = memberSignature;
                                
                                // 使用 appendCodeblock 显示代码签名
                                const memberDoc = new vscode.MarkdownString();
                                memberDoc.appendCodeblock(memberSignature, 'zinc');
                                memberItem.documentation = memberDoc;
                                
                                memberItem.sortText = `6_interface_member_${memberName}`;
                                items.push(memberItem);
                                itemSet.add(memberName);
                            }
                        } else if (member instanceof ZincMethodDeclaration && member.name) {
                            const memberName = `${stmt.name.name}.${member.name.name}`;
                            if (!itemSet.has(memberName)) {
                                const memberItem = new vscode.CompletionItem(
                                    memberName,
                                    vscode.CompletionItemKind.Method
                                );
                                const params = member.parameters.map(p => {
                                    const type = p.type ? p.type.name : 'nothing';
                                    return `${type} ${p.name ? p.name.name : ''}`;
                                }).join(', ');
                                const returnType = member.returnType ? member.returnType.name : 'nothing';
                                const staticStr = member.isStatic ? 'static ' : '';
                                const methodSignature = `${staticStr}method ${memberName}(${params}) -> ${returnType}`;
                                memberItem.detail = methodSignature;
                                
                                // 使用 appendCodeblock 显示代码签名
                                const methodDoc = new vscode.MarkdownString();
                                methodDoc.appendCodeblock(methodSignature, 'zinc');
                                memberItem.documentation = methodDoc;
                                
                                memberItem.sortText = `6_interface_method_${memberName}`;
                                items.push(memberItem);
                                itemSet.add(memberName);
                            }
                        }
                    }
                }
            }
        }
        // 类型声明
        else if (stmt instanceof ZincTypeDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.TypeParameter
                );
                
                const baseType = stmt.baseType ? stmt.baseType.name : 'nothing';
                const typeSignature = `type ${stmt.name.name} = ${baseType}`;
                item.detail = typeSignature;
                
                // 使用 appendCodeblock 显示代码签名
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(typeSignature, 'zinc');
                const comment = this.extractCommentForStatement(stmt, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                item.documentation = doc;

                item.sortText = `7_type_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 库声明
        else if (stmt instanceof ZincLibraryDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Module
                );
                
                const publicStr = stmt.isPublic ? 'public ' : '';
                const privateStr = stmt.isPrivate ? 'private ' : '';
                const requirements = stmt.requirements.length > 0
                    ? ` requires ${stmt.requirements.map(r => r.name).join(', ')}`
                    : '';
                const librarySignature = `${publicStr}${privateStr}library ${stmt.name.name}${requirements}`;
                item.detail = librarySignature;
                
                // 使用 appendCodeblock 显示代码签名
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(librarySignature, 'zinc');
                item.documentation = doc;
                
                item.sortText = `8_library_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
            
            // 提取 library 内部的成员（函数、变量等）
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    this.extractCompletionItemsFromStatement(member, filePath, items, itemSet);
                }
            }
        }
        // 模块声明
        else if (stmt instanceof ZincModuleDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Module
                );
                
                const moduleSignature = `module ${stmt.name.name}`;
                item.detail = moduleSignature;
                
                // 使用 appendCodeblock 显示代码签名
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(moduleSignature, 'zinc');
                item.documentation = doc;
                
                item.sortText = `9_module_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
    }

    /**
     * 检测是否是 library 成员访问（如 libraryName.）
     */
    private detectLibraryMemberAccess(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { libraryName: string } | null {
        const line = document.lineAt(position.line);
        const textBeforeCursor = line.text.substring(0, position.character);
        
        // 匹配 libraryName. 模式
        const match = textBeforeCursor.match(/(\w+)\s*\.\s*$/);
        if (match) {
            return { libraryName: match[1] };
        }
        
        return null;
    }

    /**
     * 添加 library 成员的补全项
     */
    private addLibraryMemberCompletions(
        program: ZincProgram,
        libraryName: string,
        filePath: string,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {
        // 在所有文件中查找该 library
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        const programs: Array<{ program: ZincProgram; filePath: string }> = [
            { program, filePath }
        ];
        
        for (const cachedFilePath of allCachedFiles) {
            if (cachedFilePath === filePath) {
                continue;
            }
            if (!this.dataEnterManager.isZincFile(cachedFilePath)) {
                continue;
            }
            const cachedProgram = this.dataEnterManager.getZincProgram(cachedFilePath);
            if (cachedProgram) {
                programs.push({ program: cachedProgram, filePath: cachedFilePath });
            }
        }

        // 查找 library 并提取其成员
        for (const { program: prog, filePath: progFilePath } of programs) {
            for (const stmt of prog.declarations) {
                if (stmt instanceof ZincLibraryDeclaration) {
                    if (stmt.name && stmt.name.name === libraryName) {
                        // 找到目标 library，提取其成员
                        if (stmt.body) {
                            for (const member of stmt.body.statements) {
                                this.extractLibraryMemberCompletionItem(
                                    member,
                                    libraryName,
                                    progFilePath,
                                    items,
                                    itemSet
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 提取 library 成员的补全项
     */
    private extractLibraryMemberCompletionItem(
        member: ZincStatement,
        libraryName: string,
        filePath: string,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {
        // 函数成员
        if (member instanceof ZincFunctionDeclaration) {
            if (member.name && !itemSet.has(member.name.name)) {
                const item = new vscode.CompletionItem(
                    member.name.name,
                    vscode.CompletionItemKind.Function
                );
                
                const params = member.parameters.map(p => {
                    const type = p.type ? p.type.name : 'nothing';
                    return `${type} ${p.name ? p.name.name : ''}`;
                }).join(', ');
                const returnType = member.returnType ? member.returnType.name : 'nothing';
                const publicStr = member.isPublic ? 'public ' : '';
                const privateStr = member.isPrivate ? 'private ' : '';
                const functionSignature = `${publicStr}${privateStr}function ${member.name.name}(${params}) -> ${returnType}`;
                item.detail = functionSignature;
                
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(functionSignature, 'zinc');
                const comment = this.extractCommentForStatement(member, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                doc.appendMarkdown(`\n\n**所属:** \`${libraryName}\``);
                item.documentation = doc;

                item.sortText = `1_lib_func_${member.name.name}`;
                items.push(item);
                itemSet.add(member.name.name);
            }
        }
        // 变量成员
        else if (member instanceof ZincVariableDeclaration) {
            if (member.name && !itemSet.has(member.name.name)) {
                const item = new vscode.CompletionItem(
                    member.name.name,
                    vscode.CompletionItemKind.Variable
                );
                
                const type = member.type ? member.type.name : 'nothing';
                const constantStr = member.isConstant ? 'constant ' : '';
                const publicStr = member.isPublic ? 'public ' : '';
                const privateStr = member.isPrivate ? 'private ' : '';
                let arrayStr = '';
                if (member.arraySizes.length > 0) {
                    arrayStr = member.arraySizes.map(size => {
                        if (size === undefined) {
                            return '[]';
                        } else if (typeof size === 'number') {
                            return `[${size}]`;
                        } else {
                            return `[${size.name}]`;
                        }
                    }).join('');
                }
                const signature = `${publicStr}${privateStr}${constantStr}${type} ${member.name.name}${arrayStr}`;
                item.detail = signature;
                
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(signature, 'zinc');
                const comment = this.extractCommentForStatement(member, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                doc.appendMarkdown(`\n\n**所属:** \`${libraryName}\``);
                item.documentation = doc;

                item.sortText = `1_lib_var_${member.name.name}`;
                items.push(item);
                itemSet.add(member.name.name);
            }
        }
        // 结构体成员
        else if (member instanceof ZincStructDeclaration) {
            if (member.name && !itemSet.has(member.name.name)) {
                const item = new vscode.CompletionItem(
                    member.name.name,
                    vscode.CompletionItemKind.Class
                );
                
                const publicStr = member.isPublic ? 'public ' : '';
                const privateStr = member.isPrivate ? 'private ' : '';
                let structStr = `${publicStr}${privateStr}struct ${member.name.name}`;
                if (member.storageSize !== null) {
                    const sizeStr = typeof member.storageSize === 'number'
                        ? member.storageSize.toString()
                        : member.storageSize.name;
                    structStr += `[${sizeStr}]`;
                }
                if (member.isArrayStruct && member.arraySize !== null) {
                    const sizeStr = typeof member.arraySize === 'number'
                        ? member.arraySize.toString()
                        : member.arraySize.name;
                    structStr += `[${sizeStr}]`;
                }
                item.detail = structStr;
                
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(structStr, 'zinc');
                const comment = this.extractCommentForStatement(member, filePath);
                if (comment) {
                    doc.appendMarkdown('\n\n---\n\n');
                    doc.appendMarkdown(comment);
                }
                doc.appendMarkdown(`\n\n**所属:** \`${libraryName}\``);
                item.documentation = doc;

                item.sortText = `1_lib_struct_${member.name.name}`;
                items.push(item);
                itemSet.add(member.name.name);
            }
        }
    }

    /**
     * 添加局部变量和参数的补全项
     */
    private addLocalVariablesAndParameters(
        program: ZincProgram,
        filePath: string,
        position: vscode.Position,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {
        // 查找包含当前位置的函数或方法
        const funcOrMethod = ZincLocalScopeHelper.findContainingFunctionOrMethod(program, position);
        if (!funcOrMethod) {
            return;
        }

        // 查找局部变量和参数
        const locals = ZincLocalScopeHelper.findLocalVariablesAndParameters(funcOrMethod, position);
        
        for (const { variable, isParameter } of locals) {
            let varName: string | null = null;
            let varType: string | null = null;
            
            if (isParameter) {
                const param = variable as ZincParameter;
                varName = param.name?.name || null;
                varType = param.type?.name || 'nothing';
            } else {
                const varDecl = variable as ZincVariableDeclaration;
                varName = varDecl.name?.name || null;
                varType = varDecl.type?.name || 'nothing';
            }

            if (!varName || itemSet.has(varName)) {
                continue;
            }

            const item = new vscode.CompletionItem(
                varName,
                vscode.CompletionItemKind.Variable
            );

            // 构建签名
            let signature = `${varType} ${varName}`;
            if (!isParameter && variable instanceof ZincVariableDeclaration) {
                const varDecl = variable as ZincVariableDeclaration;
                if (varDecl.arraySizes.length > 0) {
                    const arrayStr = varDecl.arraySizes.map(size => {
                        if (size === undefined) {
                            return '[]';
                        } else if (typeof size === 'number') {
                            return `[${size}]`;
                        } else {
                            return `[${size.name}]`;
                        }
                    }).join('');
                    signature += arrayStr;
                }
            }

            item.detail = signature;
            
            // 使用 appendCodeblock 显示代码签名
            const doc = new vscode.MarkdownString();
            doc.appendCodeblock(signature, 'zinc');
            if (isParameter) {
                doc.appendMarkdown('\n\n**参数**');
            } else {
                doc.appendMarkdown('\n\n**局部变量**');
            }
            item.documentation = doc;

            item.sortText = isParameter 
                ? `1_local_param_${varName}` 
                : `1_local_var_${varName}`;
            
            items.push(item);
            itemSet.add(varName);
        }
    }

    /**
     * 提取 statement 前面的注释
     */
    private extractCommentForStatement(stmt: ZincStatement, filePath: string): string | null {
        if (!stmt.start) {
            return null;
        }

        const fileContent = this.dataEnterManager.getFileContent(filePath);
        if (!fileContent) {
            return null;
        }

        const commentLines = extractLeadingComments(fileContent, stmt.start.line);
        if (commentLines.length === 0) {
            return null;
        }

        const parsedComment = parseComment(commentLines);
        const markdown = formatCommentAsMarkdown(parsedComment);
        
        return markdown || null;
    }

    resolveCompletionItem?(
        item: vscode.CompletionItem,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CompletionItem> {
        // 可以在这里添加更详细的文档
        return item;
    }
}

