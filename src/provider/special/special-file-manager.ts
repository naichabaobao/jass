import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SpecialLiteral, SpecialParser } from './special-parser';
import { StringsParser } from './strings-parser';
import { PresetsParser } from './presets-parser';
import { NumbersParser } from './numbers-parser';

/**
 * 特殊文件管理器
 * 管理 strings.jass、presets.jass、numbers.jass 文件的字面量
 */
export class SpecialFileManager {
    private static instance: SpecialFileManager | undefined;
    private literals: SpecialLiteral[] = [];
    private filePathToLiterals: Map<string, SpecialLiteral[]> = new Map();
    private stringsParser: StringsParser | undefined;
    private presetsParser: PresetsParser | undefined;
    private numbersParser: NumbersParser | undefined;

    private constructor() {
        // 延迟初始化解析器，避免循环依赖问题
    }

    /**
     * 获取字符串解析器（延迟初始化）
     */
    private getStringsParser(): StringsParser {
        if (!this.stringsParser) {
            this.stringsParser = new StringsParser();
        }
        return this.stringsParser;
    }

    /**
     * 获取标记解析器（延迟初始化）
     */
    private getPresetsParser(): PresetsParser {
        if (!this.presetsParser) {
            this.presetsParser = new PresetsParser();
        }
        return this.presetsParser;
    }

    /**
     * 获取数字解析器（延迟初始化）
     */
    private getNumbersParser(): NumbersParser {
        if (!this.numbersParser) {
            this.numbersParser = new NumbersParser();
        }
        return this.numbersParser;
    }

    public static getInstance(): SpecialFileManager {
        if (!SpecialFileManager.instance) {
            SpecialFileManager.instance = new SpecialFileManager();
        }
        return SpecialFileManager.instance;
    }

    /**
     * 初始化，扫描工作区中的特殊文件
     */
    public async initialize(workspaceRoot?: string): Promise<void> {
        if (!workspaceRoot) {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            workspaceRoot = workspaceFolder?.uri.fsPath;
        }

        if (!workspaceRoot) {
            return;
        }

        this.literals = [];
        this.filePathToLiterals.clear();

        // 查找特殊文件
        const specialFiles = await this.findSpecialFiles(workspaceRoot);
        
        if (specialFiles.length === 0) {
            console.warn(`[SpecialFileManager] No special files found in workspace. Make sure strings.jass, presets.jass, or numbers.jass exist.`);
        }
        
        // 解析每个文件
        for (const filePath of specialFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const fileName = path.basename(filePath);
                let parser: SpecialParser = this.getStringsParser();

                if (fileName === 'presets.jass') {
                    parser = this.getPresetsParser();
                } else if (fileName === 'numbers.jass') {
                    parser = this.getNumbersParser();
                }

                const fileLiterals = parser.parse(filePath, content);
                console.log(`[SpecialFileManager] Parsed ${fileLiterals.length} literals from ${fileName}`);
                this.literals.push(...fileLiterals);
                this.filePathToLiterals.set(filePath, fileLiterals);
            } catch (error) {
                console.error(`[SpecialFileManager] Failed to parse special file ${filePath}:`, error);
            }
        }

        console.log(`✅ SpecialFileManager initialized: ${this.literals.length} literals from ${specialFiles.length} files`);
    }

    /**
     * 查找工作区中的特殊文件
     */
    private async findSpecialFiles(workspaceRoot: string): Promise<string[]> {
        const specialFiles: string[] = [];
        const fileNames = ['strings.jass', 'presets.jass', 'numbers.jass'];

        console.log(`[SpecialFileManager] Searching for special files in: ${workspaceRoot}`);

        // 递归查找文件
        const findFiles = (dir: string): void => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        // 跳过 node_modules、.git 等目录，但包括 static 目录
                        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                            findFiles(fullPath);
                        }
                    } else if (entry.isFile()) {
                        if (fileNames.includes(entry.name)) {
                            specialFiles.push(fullPath);
                            console.log(`[SpecialFileManager] Found special file: ${fullPath}`);
                        }
                    }
                }
            } catch (error) {
                // 忽略权限错误等，但记录警告
                console.warn(`[SpecialFileManager] Failed to read directory ${dir}:`, error);
            }
        };

        findFiles(workspaceRoot);

        // 也检查扩展的 static 目录（从编译后的 out 目录计算）
        try {
            // __dirname 在编译后是 out/provider/special
            // 需要回到项目根目录的 static 目录
            const extensionStaticDir = path.resolve(__dirname, "../../../../static");
            if (fs.existsSync(extensionStaticDir) && fs.statSync(extensionStaticDir).isDirectory()) {
                console.log(`[SpecialFileManager] Also searching in extension static: ${extensionStaticDir}`);
                findFiles(extensionStaticDir);
            } else {
                // 尝试另一个可能的路径（如果从 src 编译）
                const altPath = path.resolve(__dirname, "../../../../../static");
                if (fs.existsSync(altPath) && fs.statSync(altPath).isDirectory()) {
                    console.log(`[SpecialFileManager] Also searching in extension static (alt path): ${altPath}`);
                    findFiles(altPath);
                }
            }
        } catch (error) {
            console.warn(`[SpecialFileManager] Failed to check extension static directory:`, error);
        }

        console.log(`[SpecialFileManager] Found ${specialFiles.length} special files total`);
        return specialFiles;
    }

    /**
     * 获取所有字面量
     */
    public getAllLiterals(): SpecialLiteral[] {
        return [...this.literals];
    }

    /**
     * 根据内容查找字面量
     */
    public findLiteralsByContent(content: string): SpecialLiteral[] {
        return this.literals.filter(literal => literal.content === content);
    }

    /**
     * 根据类型查找字面量
     */
    public findLiteralsByType(type: 'string' | 'mark' | 'number'): SpecialLiteral[] {
        return this.literals.filter(literal => literal.type === type);
    }

    /**
     * 根据文件路径获取字面量
     */
    public getLiteralsByFile(filePath: string): SpecialLiteral[] {
        return this.filePathToLiterals.get(filePath) || [];
    }

    /**
     * 更新文件
     */
    public updateFile(filePath: string, content: string): void {
        const fileName = path.basename(filePath);
        let parser: SpecialParser = this.getStringsParser();

        if (fileName === 'presets.jass') {
            parser = this.getPresetsParser();
        } else if (fileName === 'numbers.jass') {
            parser = this.getNumbersParser();
        } else if (fileName !== 'strings.jass') {
            return; // 不是特殊文件
        }

        // 移除旧的字面量
        const oldLiterals = this.filePathToLiterals.get(filePath) || [];
        this.literals = this.literals.filter(l => !oldLiterals.includes(l));
        this.filePathToLiterals.delete(filePath);

        // 解析新内容
        try {
            const newLiterals = parser.parse(filePath, content);
            this.literals.push(...newLiterals);
            this.filePathToLiterals.set(filePath, newLiterals);
        } catch (error) {
            console.error(`Failed to update special file ${filePath}:`, error);
        }
    }

    /**
     * 删除文件
     */
    public deleteFile(filePath: string): void {
        const oldLiterals = this.filePathToLiterals.get(filePath) || [];
        this.literals = this.literals.filter(l => !oldLiterals.includes(l));
        this.filePathToLiterals.delete(filePath);
    }

    /**
     * 清理
     */
    public dispose(): void {
        this.literals = [];
        this.filePathToLiterals.clear();
    }
}

