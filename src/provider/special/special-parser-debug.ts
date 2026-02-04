import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SpecialFileManager } from './special-file-manager';
import { StringsParser } from './strings-parser';
import { PresetsParser } from './presets-parser';
import { NumbersParser } from './numbers-parser';

/**
 * 调试工具：测试和调试 special 解析器
 */
export class SpecialParserDebugger {
    /**
     * 测试解析器（使用测试数据）
     */
    public static testParsersWithSampleData(): void {
        console.log('🔍 Testing Special Parsers with Sample Data...\n');

        // 测试数据
        const testStringsContent = `
// strings.jass 测试文件
"TRIGSTR_001" // 字符串1
"TRIGSTR_002" // 字符串2
"TRIGSTR_003" // deprecated 已废弃
"TRIGSTR_004"
"TRIGSTR_005" // 带空格的字符串
`;

        const testPresetsContent = `
// presets.jass 测试文件
'B000' // 标记1
'B001' // 标记2
'B002' // deprecated 已废弃
'B003'
'B004' // 另一个标记
`;

        const testNumbersContent = `
// numbers.jass 测试文件
12345 // 十进制
0xABCD // 十六进制
$FF00 // 十六进制（$前缀）
0b1010 // 二进制
67890 // deprecated 已废弃
0x1234 // 另一个十六进制
`;

        // 测试字符串解析器
        this.testParserWithContent('strings.jass', new StringsParser(), testStringsContent);
        
        // 测试标记解析器
        this.testParserWithContent('presets.jass', new PresetsParser(), testPresetsContent);
        
        // 测试数字解析器
        this.testParserWithContent('numbers.jass', new NumbersParser(), testNumbersContent);
    }

    /**
     * 使用测试内容测试解析器
     */
    private static testParserWithContent(
        fileName: string,
        parser: StringsParser | PresetsParser | NumbersParser,
        content: string
    ): void {
        console.log(`\n📄 Testing ${fileName} parser...`);

        try {
            const literals = parser.parse(`test/${fileName}`, content);

            console.log(`   ✅ Found ${literals.length} literals in ${fileName}`);
            
            // 显示所有字面量
            literals.forEach((literal, index) => {
                const displayText = literal.type === 'string' ? `"${literal.content}"` :
                                  literal.type === 'mark' ? `'${literal.content}'` :
                                  literal.content;
                console.log(`      ${index + 1}. ${displayText} (line ${literal.line + 1}, col ${literal.column})`);
                if (literal.description) {
                    console.log(`         Description: ${literal.description}`);
                }
                if (literal.deprecated) {
                    console.log(`         ⚠️  Deprecated`);
                }
            });
        } catch (error) {
            console.error(`   ❌ Error parsing ${fileName}:`, error);
        }
    }

    /**
     * 测试解析器（从工作区文件）
     */
    public static async testParsers(workspaceRoot?: string): Promise<void> {
        console.log('🔍 Testing Special Parsers from Workspace...\n');

        if (!workspaceRoot) {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            workspaceRoot = workspaceFolder?.uri.fsPath;
        }

        if (!workspaceRoot) {
            console.error('❌ No workspace root found');
            return;
        }

        // 测试字符串解析器
        await this.testParser('strings.jass', new StringsParser(), workspaceRoot);
        
        // 测试标记解析器
        await this.testParser('presets.jass', new PresetsParser(), workspaceRoot);
        
        // 测试数字解析器
        await this.testParser('numbers.jass', new NumbersParser(), workspaceRoot);

        // 测试 SpecialFileManager
        await this.testSpecialFileManager(workspaceRoot);
    }

    /**
     * 测试单个解析器
     */
    private static async testParser(
        fileName: string,
        parser: StringsParser | PresetsParser | NumbersParser,
        workspaceRoot: string
    ): Promise<void> {
        console.log(`\n📄 Testing ${fileName} parser...`);

        // 查找文件
        const filePath = this.findFile(workspaceRoot, fileName);
        if (!filePath) {
            console.log(`   ⚠️  ${fileName} not found in workspace`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const literals = parser.parse(filePath, content);

            console.log(`   ✅ Found ${literals.length} literals in ${path.basename(filePath)}`);
            
            // 显示前 10 个字面量
            const displayCount = Math.min(10, literals.length);
            for (let i = 0; i < displayCount; i++) {
                const literal = literals[i];
                const displayText = literal.type === 'string' ? `"${literal.content}"` :
                                  literal.type === 'mark' ? `'${literal.content}'` :
                                  literal.content;
                console.log(`      ${i + 1}. ${displayText} (line ${literal.line + 1}, col ${literal.column})`);
                if (literal.description) {
                    console.log(`         Description: ${literal.description}`);
                }
                if (literal.deprecated) {
                    console.log(`         ⚠️  Deprecated`);
                }
            }
            
            if (literals.length > displayCount) {
                console.log(`      ... and ${literals.length - displayCount} more`);
            }
        } catch (error) {
            console.error(`   ❌ Error parsing ${fileName}:`, error);
        }
    }

    /**
     * 测试 SpecialFileManager
     */
    private static async testSpecialFileManager(workspaceRoot: string): Promise<void> {
        console.log(`\n📦 Testing SpecialFileManager...`);

        try {
            const manager = SpecialFileManager.getInstance();
            await manager.initialize(workspaceRoot);

            const allLiterals = manager.getAllLiterals();
            console.log(`   ✅ Total literals: ${allLiterals.length}`);

            // 按类型统计
            const byType = {
                string: allLiterals.filter(l => l.type === 'string').length,
                mark: allLiterals.filter(l => l.type === 'mark').length,
                number: allLiterals.filter(l => l.type === 'number').length
            };
            console.log(`   📊 By type: string=${byType.string}, mark=${byType.mark}, number=${byType.number}`);

            // 测试查找功能
            if (allLiterals.length > 0) {
                const sampleLiteral = allLiterals[0];
                const found = manager.findLiteralsByContent(sampleLiteral.content);
                console.log(`   🔍 Found ${found.length} literals matching "${sampleLiteral.content}"`);
            }
        } catch (error) {
            console.error(`   ❌ Error testing SpecialFileManager:`, error);
        }
    }

    /**
     * 查找文件
     */
    private static findFile(root: string, fileName: string): string | null {
        const findFiles = (dir: string): string | null => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                            const found = findFiles(fullPath);
                            if (found) return found;
                        }
                    } else if (entry.isFile() && entry.name === fileName) {
                        return fullPath;
                    }
                }
            } catch (error) {
                // 忽略权限错误等
            }
            return null;
        };

        return findFiles(root);
    }

    /**
     * 解析并显示文件内容
     */
    public static async parseAndDisplay(filePath: string): Promise<void> {
        console.log(`\n📄 Parsing ${filePath}...`);

        if (!fs.existsSync(filePath)) {
            console.error(`   ❌ File not found: ${filePath}`);
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.basename(filePath);
            
            let parser: StringsParser | PresetsParser | NumbersParser;
            if (fileName === 'presets.jass') {
                parser = new PresetsParser();
            } else if (fileName === 'numbers.jass') {
                parser = new NumbersParser();
            } else {
                parser = new StringsParser();
            }

            const literals = parser.parse(filePath, content);
            
            console.log(`   ✅ Found ${literals.length} literals:\n`);
            
            literals.forEach((literal, index) => {
                const displayText = literal.type === 'string' ? `"${literal.content}"` :
                                  literal.type === 'mark' ? `'${literal.content}'` :
                                  literal.content;
                
                console.log(`   ${index + 1}. ${displayText}`);
                console.log(`      Type: ${literal.type}`);
                console.log(`      Position: Line ${literal.line + 1}, Column ${literal.column}`);
                if (literal.description) {
                    console.log(`      Description: ${literal.description}`);
                }
                if (literal.deprecated) {
                    console.log(`      ⚠️  Deprecated`);
                }
                console.log('');
            });
        } catch (error) {
            console.error(`   ❌ Error parsing file:`, error);
        }
    }
}

