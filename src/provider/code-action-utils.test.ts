import * as assert from 'assert';
import {
    extractQuickFixIntents,
    normalizeDiagnosticCode,
    parseExpectedAndProvidedCount,
    buildFixedCallLine,
    buildLibraryDeclarationWithRequires
} from './code-action-utils';

function runTests(): void {
    const normalized1 = normalizeDiagnosticCode('VALIDATION_ERROR');
    assert.strictEqual(normalized1, 'validation_error');

    const normalized2 = normalizeDiagnosticCode({ value: 'Syntax_Error' });
    assert.strictEqual(normalized2, 'syntax_error');

    const zhCounts = parseExpectedAndProvidedCount('方法调用参数数量不匹配：期望 2 个参数，但提供了 3 个');
    assert.ok(zhCounts);
    assert.strictEqual(zhCounts!.expected, 2);
    assert.strictEqual(zhCounts!.provided, 3);

    const enCounts = parseExpectedAndProvidedCount("Function 'foo' expects 1 parameters, but 2 were provided");
    assert.ok(enCounts);
    assert.strictEqual(enCounts!.expected, 1);
    assert.strictEqual(enCounts!.provided, 2);

    const intents = extractQuickFixIntents(
        "Dependent library 'MathEx' not found in current file or other project files",
        'validation_error'
    );
    assert.ok(intents.some(i => i.type === 'add_library_requires' && i.libraryName === 'MathEx'));

    const unusedIntents = extractQuickFixIntents("Unused local variable 'tmp'", '');
    assert.ok(unusedIntents.some(i => i.type === 'remove_unused' && i.symbolName === 'tmp'));

    const fixedCall1 = buildFixedCallLine('call Foo(a, b, c)', 2, 3);
    assert.strictEqual(fixedCall1, 'call Foo(a, b)');

    const fixedCall2 = buildFixedCallLine('call obj.bar(x)', 3, 1);
    assert.strictEqual(fixedCall2, 'call obj.bar(x, 0, 0)');

    // 嵌套调用参数中的逗号不应被错误拆分
    const fixedCall3 = buildFixedCallLine('call Foo(Bar(a, b), c)', 1, 2);
    assert.strictEqual(fixedCall3, 'call Foo(Bar(a, b))');

    const requires1 = buildLibraryDeclarationWithRequires('library A', 'MathEx');
    assert.strictEqual(requires1, 'library A requires MathEx');

    const requires2 = buildLibraryDeclarationWithRequires('library A requires B, C', 'D');
    assert.strictEqual(requires2, 'library A requires B, C, D');

    const requiresDup = buildLibraryDeclarationWithRequires('library A requires B, C', 'B');
    assert.strictEqual(requiresDup, null);

    console.log('✅ code-action-utils tests passed');
}

if (typeof require !== 'undefined' && require.main === module) {
    runTests();
}

export { runTests as runCodeActionUtilsTests };
