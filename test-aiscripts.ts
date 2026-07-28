import * as fs from 'fs';
import * as path from 'path';
import { streamingParse } from './src/provider/streaming-parser';
import { BlockStatement, VariableDeclaration, Statement } from './src/vjass/ast';

const aiScriptsPath = path.join(__dirname, 'static/AIScripts.ai');
const content = fs.readFileSync(aiScriptsPath, 'utf-8');

console.log('=== AIScripts.ai 解析测试 ===');
console.log(`文件大小: ${content.length} 字符`);
console.log(`文件行数: ${content.split('\n').length}`);

const result = streamingParse(content, {
    filePath: aiScriptsPath,
    deleteLineComment: false,
});

console.log(`\n解析结果:`);
console.log(`- 错误数: ${result.errors.errors.length}`);
console.log(`- 警告数: ${result.errors.warnings.length}`);

if (result.errors.errors.length > 0) {
    console.log('\n解析错误:');
    result.errors.errors.slice(0, 10).forEach((err, i) => {
        console.log(`  ${i + 1}. Line ${err.start?.line}: ${err.message}`);
    });
}

const block = result.blockStatement;
if (!block) {
    console.log('\n❌ blockStatement 为 null！');
    process.exit(1);
}

console.log(`\nBlockStatement body 长度: ${block.body.length}`);

// 遍历所有语句，找到变量声明
function findAllVariables(block: BlockStatement, variables: VariableDeclaration[] = []): VariableDeclaration[] {
    for (const stmt of block.body) {
        if (stmt instanceof VariableDeclaration) {
            variables.push(stmt);
        } else if (stmt instanceof BlockStatement) {
            findAllVariables(stmt, variables);
        } else if ((stmt as any).members) {
            // LibraryDeclaration, ScopeDeclaration, StructDeclaration 等有 members
            for (const member of (stmt as any).members) {
                if (member instanceof VariableDeclaration) {
                    variables.push(member);
                } else if (member instanceof BlockStatement) {
                    findAllVariables(member, variables);
                }
            }
        }
    }
    return variables;
}

const allVariables = findAllVariables(block);
console.log(`\n找到的变量声明数: ${allVariables.length}`);

// 查找特定的变量
const targetVars = ['b_hero1_done', 'b_hero2_done', 'b_hero3_done', 'basic_opening'];
console.log('\n=== 特定变量检查 ===');
for (const varName of targetVars) {
    const found = allVariables.find(v => v.name?.name === varName);
    if (found) {
        console.log(`✅ ${varName}:`);
        console.log(`   - 类型: ${found.type?.toString() || 'unknown'}`);
        console.log(`   - 常量: ${found.isConstant}`);
        console.log(`   - 局部: ${found.isLocal}`);
        console.log(`   - start.line: ${found.start?.line}`);
        console.log(`   - start.position: ${found.start?.position}`);
    } else {
        console.log(`❌ ${varName}: 未找到`);
    }
}

// 显示前20个变量及其行号
console.log('\n=== 前20个变量声明 ===');
allVariables.slice(0, 20).forEach((v, i) => {
    console.log(`${i + 1}. ${v.name?.name} (line ${v.start?.line})`);
});

// 测试注释提取
console.log('\n=== 注释提取测试 ===');
import { extractLeadingComments } from './src/provider/comment-parser';

for (const varName of targetVars) {
    const found = allVariables.find(v => v.name?.name === varName);
    if (found && found.start) {
        const comments = extractLeadingComments(content, found.start.line);
        console.log(`\n${varName} (line ${found.start.line}):`);
        if (comments.length > 0) {
            console.log(`  ✅ 找到 ${comments.length} 行注释:`);
            comments.forEach((c, i) => console.log(`    ${i + 1}. ${c}`));
        } else {
            console.log(`  ❌ 未找到注释`);
        }
    }
}

// 检查 globals 块
console.log('\n=== Globals 块检查 ===');
function findGlobalsBlocks(block: BlockStatement): BlockStatement[] {
    const globals: BlockStatement[] = [];
    for (const stmt of block.body) {
        if (stmt instanceof BlockStatement) {
            // 检查是否只包含全局变量
            const allVars = stmt.body.every(s => s instanceof VariableDeclaration && !s.isLocal);
            const hasVars = stmt.body.some(s => s instanceof VariableDeclaration && !s.isLocal);
            if (allVars && hasVars) {
                globals.push(stmt);
            }
            globals.push(...findGlobalsBlocks(stmt));
        }
    }
    return globals;
}

const globalsBlocks = findGlobalsBlocks(block);
console.log(`找到 ${globalsBlocks.length} 个 globals 块`);
globalsBlocks.forEach((gb, i) => {
    console.log(`Globals 块 ${i + 1}: ${gb.body.length} 个语句, start.line=${gb.start?.line}`);
});
