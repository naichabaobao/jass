/**
 * 快速测试脚本：测试 special 解析器
 * 可以直接在 Node.js 环境中运行，或通过 VS Code 命令运行
 */

import * as fs from 'fs';
import * as path from 'path';
import { StringsParser } from './strings-parser';
import { PresetsParser } from './presets-parser';
import { NumbersParser } from './numbers-parser';
import { SpecialFileManager } from './special-file-manager';

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

/**
 * 测试解析器
 */
function testParser(name: string, parser: StringsParser | PresetsParser | NumbersParser, content: string, filePath: string) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing ${name}`);
    console.log('='.repeat(60));
    
    try {
        const literals = parser.parse(filePath, content);
        
        console.log(`✅ Successfully parsed ${literals.length} literals:\n`);
        
        literals.forEach((literal, index) => {
            const displayText = literal.type === 'string' ? `"${literal.content}"` :
                              literal.type === 'mark' ? `'${literal.content}'` :
                              literal.content;
            
            console.log(`  ${index + 1}. ${displayText}`);
            console.log(`     Type: ${literal.type}`);
            console.log(`     Position: Line ${literal.line + 1}, Column ${literal.column}`);
            if (literal.description) {
                console.log(`     Description: ${literal.description}`);
            }
            if (literal.deprecated) {
                console.log(`     ⚠️  Deprecated`);
            }
            console.log('');
        });
        
        return literals;
    } catch (error) {
        console.error(`❌ Error parsing ${name}:`, error);
        return [];
    }
}

/**
 * 运行所有测试
 */
export function runAllTests() {
    console.log('🚀 Starting Special Parser Tests...\n');
    
    // 测试字符串解析器
    const stringsLiterals = testParser(
        'StringsParser',
        new StringsParser(),
        testStringsContent,
        'test/strings.jass'
    );
    
    // 测试标记解析器
    const presetsLiterals = testParser(
        'PresetsParser',
        new PresetsParser(),
        testPresetsContent,
        'test/presets.jass'
    );
    
    // 测试数字解析器
    const numbersLiterals = testParser(
        'NumbersParser',
        new NumbersParser(),
        testNumbersContent,
        'test/numbers.jass'
    );
    
    // 统计
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Strings: ${stringsLiterals.length} literals`);
    console.log(`Presets: ${presetsLiterals.length} literals`);
    console.log(`Numbers: ${numbersLiterals.length} literals`);
    console.log(`Total: ${stringsLiterals.length + presetsLiterals.length + numbersLiterals.length} literals`);
    
    // 验证结果
    const allPassed = 
        stringsLiterals.length === 5 &&
        presetsLiterals.length === 5 &&
        numbersLiterals.length === 6;
    
    if (allPassed) {
        console.log('\n✅ All tests passed!');
    } else {
        console.log('\n❌ Some tests failed!');
    }
    
    return allPassed;
}

// 如果直接运行此文件
if (require.main === module) {
    runAllTests();
}

