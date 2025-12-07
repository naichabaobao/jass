import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { isJFile, isZincFile, isAiFile, isLuaFile } from '../tool';

/**
 * 文档链接提供者
 * 支持 #include 和 //! import 指令的文件链接
 */
export class DocumentLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const documentDir = path.dirname(document.uri.fsPath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        const workspaceRoot = workspaceFolder?.uri.fsPath;

        // #include 正则表达式：匹配 #include "path"
        const includeRegex = /^\s*#include\s+"([^"]+)"/;
        
        // //! import 正则表达式：匹配 //! import [type] "path"
        const importRegex = /\/\/!\s+import\b(?:\s+(?:jass|vjass|zinc))?\s+"([^"]+)"/;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            
            // 检查 #include 指令
            const includeMatch = line.match(includeRegex);
            if (includeMatch) {
                const filePath = includeMatch[1];
                const link = this.createLink(
                    document,
                    lineIndex,
                    includeMatch[0],
                    filePath,
                    documentDir,
                    workspaceRoot
                );
                if (link) {
                    links.push(link);
                }
            }

            // 检查 //! import 指令
            const importMatch = line.match(importRegex);
            if (importMatch) {
                const filePath = importMatch[1];
                const link = this.createLink(
                    document,
                    lineIndex,
                    importMatch[0],
                    filePath,
                    documentDir,
                    workspaceRoot
                );
                if (link) {
                    links.push(link);
                }
            }
        }

        return links;
    }

    /**
     * 创建文档链接
     */
    private createLink(
        document: vscode.TextDocument,
        lineIndex: number,
        fullMatch: string,
        filePath: string,
        documentDir: string,
        workspaceRoot: string | undefined
    ): vscode.DocumentLink | null {
        const line = document.lineAt(lineIndex);
        const lineText = line.text;
        
        // 找到文件路径在行中的位置
        const pathStartIndex = lineText.indexOf(`"${filePath}"`);
        if (pathStartIndex === -1) {
            return null;
        }

        // 创建链接范围（包括引号内的路径）
        const startChar = pathStartIndex + 1; // 跳过开始引号
        const endChar = pathStartIndex + 1 + filePath.length;
        const range = new vscode.Range(
            lineIndex,
            startChar,
            lineIndex,
            endChar
        );

        // 解析文件路径
        let targetPath: string;
        if (path.isAbsolute(filePath)) {
            targetPath = filePath;
        } else {
            // 相对路径：相对于当前文件所在目录
            targetPath = path.resolve(documentDir, filePath);
        }

        // 检查文件是否存在
        let targetUri: vscode.Uri | undefined;
        
        try {
            // 首先尝试直接路径
            if (fs.existsSync(targetPath)) {
                const stat = fs.statSync(targetPath);
                if (stat.isFile()) {
                    targetUri = vscode.Uri.file(targetPath);
                } else if (stat.isDirectory() && workspaceRoot) {
                    // 如果是目录，查找目录中的 JASS 文件
                    const files = fs.readdirSync(targetPath);
                    for (const file of files) {
                        const fullFilePath = path.join(targetPath, file);
                        if (fs.statSync(fullFilePath).isFile() && 
                            (isJFile(fullFilePath) || isZincFile(fullFilePath) || isAiFile(fullFilePath) || isLuaFile(fullFilePath))) {
                            targetUri = vscode.Uri.file(fullFilePath);
                            break; // 使用第一个匹配的文件
                        }
                    }
                }
            }
            
            // 如果直接路径不存在，尝试在工作区根目录查找
            if (!targetUri && workspaceRoot) {
                const workspacePath = path.resolve(workspaceRoot, filePath);
                if (fs.existsSync(workspacePath)) {
                    const stat = fs.statSync(workspacePath);
                    if (stat.isFile()) {
                        targetUri = vscode.Uri.file(workspacePath);
                    } else if (stat.isDirectory()) {
                        // 如果是目录，查找目录中的 JASS 文件
                        const files = fs.readdirSync(workspacePath);
                        for (const file of files) {
                            const fullFilePath = path.join(workspacePath, file);
                            if (fs.statSync(fullFilePath).isFile() && 
                                (isJFile(fullFilePath) || isZincFile(fullFilePath) || isAiFile(fullFilePath) || isLuaFile(fullFilePath))) {
                                targetUri = vscode.Uri.file(fullFilePath);
                                break;
                            }
                        }
                    }
                } else {
                    // 尝试在常见目录中查找
                    const commonPaths = [
                        path.resolve(workspaceRoot, 'common.j'),
                        path.resolve(workspaceRoot, 'blizzard.j'),
                        path.resolve(workspaceRoot, 'common', filePath),
                        path.resolve(workspaceRoot, 'lib', filePath),
                        path.resolve(workspaceRoot, 'include', filePath),
                        path.resolve(workspaceRoot, 'scripts', filePath)
                    ];
                    
                    for (const commonPath of commonPaths) {
                        if (fs.existsSync(commonPath) && fs.statSync(commonPath).isFile()) {
                            targetUri = vscode.Uri.file(commonPath);
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            // 文件系统操作失败，忽略错误
            console.error(`Error resolving file path ${filePath}:`, error);
        }

        // 如果找到了目标文件，创建链接
        if (targetUri) {
            const link = new vscode.DocumentLink(range, targetUri);
            link.tooltip = `Open ${path.basename(targetUri.fsPath)}`;
            return link;
        }

        // 即使文件不存在，也创建链接（用户可能想创建该文件）
        // 使用相对路径作为目标
        const relativeUri = vscode.Uri.file(targetPath);
        const link = new vscode.DocumentLink(range, relativeUri);
        link.tooltip = `File not found: ${filePath}`;
        return link;
    }
}

