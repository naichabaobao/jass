import * as assert from 'assert';
import { StringsParser } from './strings-parser';
import { PresetsParser } from './presets-parser';
import { NumbersParser } from './numbers-parser';
import { SpecialLiteral } from './special-parser';

/**
 * 测试 strings.jass 解析器
 */
function testStringsParser() {
    console.log('🧪 Testing StringsParser...');
    
    const parser = new StringsParser();
    const testContent = `
// 这是注释
"TRIGSTR_001" // 字符串1
"TRIGSTR_002" // 字符串2
"TRIGSTR_003" // deprecated 已废弃
"TRIGSTR_004"
    `;

    const literals = parser.parse('test/strings.jass', testContent);
    
    console.log(`✅ Found ${literals.length} string literals:`);
    literals.forEach((literal, index) => {
        console.log(`  ${index + 1}. "${literal.content}" (line ${literal.line + 1}, col ${literal.column})`);
        if (literal.description) {
            console.log(`     Description: ${literal.description}`);
        }
        if (literal.deprecated) {
            console.log(`     ⚠️  Deprecated`);
        }
    });

    assert.strictEqual(literals.length, 4, 'Should find 4 string literals');
    assert.strictEqual(literals[0].content, 'TRIGSTR_001', 'First literal should be TRIGSTR_001');
    assert.strictEqual(literals[0].type, 'string', 'Type should be string');
    assert.strictEqual(literals[2].deprecated, true, 'Third literal should be deprecated');
    
    console.log('✅ StringsParser test passed!\n');
}

/**
 * 测试 presets.jass 解析器
 */
function testPresetsParser() {
    console.log('🧪 Testing PresetsParser...');
    
    const parser = new PresetsParser();
    const testContent = `
// 这是注释
'B000' // 标记1
'B001' // 标记2
'B002' // deprecated 已废弃
'B003'
    `;

    const literals = parser.parse('test/presets.jass', testContent);
    
    console.log(`✅ Found ${literals.length} mark literals:`);
    literals.forEach((literal, index) => {
        console.log(`  ${index + 1}. '${literal.content}' (line ${literal.line + 1}, col ${literal.column})`);
        if (literal.description) {
            console.log(`     Description: ${literal.description}`);
        }
        if (literal.deprecated) {
            console.log(`     ⚠️  Deprecated`);
        }
    });

    assert.strictEqual(literals.length, 4, 'Should find 4 mark literals');
    assert.strictEqual(literals[0].content, 'B000', 'First literal should be B000');
    assert.strictEqual(literals[0].type, 'mark', 'Type should be mark');
    assert.strictEqual(literals[2].deprecated, true, 'Third literal should be deprecated');
    
    console.log('✅ PresetsParser test passed!\n');
}

/**
 * 测试 numbers.jass 解析器
 */
function testNumbersParser() {
    console.log('🧪 Testing NumbersParser...');
    
    const parser = new NumbersParser();
    const testContent = `
// 这是注释
12345 // 数字1
0xABCD // 十六进制
$FF00 // 十六进制（$前缀）
0b1010 // 二进制
67890 // deprecated 已废弃
    `;

    const literals = parser.parse('test/numbers.jass', testContent);
    
    console.log(`✅ Found ${literals.length} number literals:`);
    literals.forEach((literal, index) => {
        console.log(`  ${index + 1}. ${literal.content} (line ${literal.line + 1}, col ${literal.column})`);
        if (literal.description) {
            console.log(`     Description: ${literal.description}`);
        }
        if (literal.deprecated) {
            console.log(`     ⚠️  Deprecated`);
        }
    });

    assert.strictEqual(literals.length, 5, 'Should find 5 number literals');
    assert.strictEqual(literals[0].content, '12345', 'First literal should be 12345');
    assert.strictEqual(literals[0].type, 'number', 'Type should be number');
    assert.strictEqual(literals[1].content, '0xABCD', 'Second literal should be 0xABCD');
    assert.strictEqual(literals[2].content, '$FF00', 'Third literal should be $FF00');
    assert.strictEqual(literals[3].content, '0b1010', 'Fourth literal should be 0b1010');
    assert.strictEqual(literals[4].deprecated, true, 'Fifth literal should be deprecated');
    
    console.log('✅ NumbersParser test passed!\n');
}

/**
 * 测试边界情况
 */
function testEdgeCases() {
    console.log('🧪 Testing edge cases...');
    
    // 测试空文件
    const stringsParser = new StringsParser();
    const emptyLiterals = stringsParser.parse('test/empty.jass', '');
    assert.strictEqual(emptyLiterals.length, 0, 'Empty file should return no literals');
    
    // 测试只有注释的文件
    const commentOnly = stringsParser.parse('test/comments.jass', '// 只有注释\n// 没有字面量');
    assert.strictEqual(commentOnly.length, 0, 'Comment-only file should return no literals');
    
    // 测试包含转义字符的字符串
    const escapedContent = '"TRIGSTR_001" // 正常\n"TRIGSTR_002" // 另一个';
    const escapedLiterals = stringsParser.parse('test/escaped.jass', escapedContent);
    assert.strictEqual(escapedLiterals.length, 2, 'Should find 2 literals');
    
    console.log('✅ Edge cases test passed!\n');
}

/**
 * 运行所有测试
 */
export function runTests() {
    console.log('🚀 Starting Special Parser Tests...\n');
    
    try {
        testStringsParser();
        testPresetsParser();
        testNumbersParser();
        testEdgeCases();
        
        console.log('🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    runTests();
}

