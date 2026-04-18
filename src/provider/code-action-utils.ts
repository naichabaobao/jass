export type QuickFixIntent =
    | { type: 'implement_interface_method'; structName: string; methodName: string; interfaceName: string }
    | { type: 'remove_unused'; symbolType: string; symbolName: string }
    | { type: 'remove_constant_assignment' }
    | { type: 'remove_dead_code' }
    | { type: 'fix_param_count'; expected: number; provided: number }
    | { type: 'add_library_requires'; libraryName: string };

export function normalizeDiagnosticCode(code: unknown): string {
    if (!code) {
        return '';
    }
    if (typeof code === 'string') {
        return code.toLowerCase();
    }
    if (typeof code === 'object' && code !== null && 'value' in code) {
        return String((code as { value: unknown }).value).toLowerCase();
    }
    return '';
}

export function parseExpectedAndProvidedCount(message: string): { expected: number; provided: number } | null {
    const zhExpected = message.match(/期望\s*(\d+)\s*个参数/);
    const zhProvided = message.match(/提供了\s*(\d+)\s*个/);
    if (zhExpected && zhProvided) {
        return {
            expected: parseInt(zhExpected[1], 10),
            provided: parseInt(zhProvided[1], 10)
        };
    }

    const en = message.match(/expects?\s*(\d+)\s*parameters?,\s*but\s*(\d+)\s*were\s*provided/i);
    if (en) {
        return {
            expected: parseInt(en[1], 10),
            provided: parseInt(en[2], 10)
        };
    }

    return null;
}

export function extractQuickFixIntents(message: string, diagnosticCode: string): QuickFixIntent[] {
    const intents: QuickFixIntent[] = [];
    const messageLower = message.toLowerCase();

    const interfaceMatch = message.match(/Struct '([^']+)' must implement method '([^']+)' from interface '([^']+)'/);
    if (interfaceMatch) {
        intents.push({
            type: 'implement_interface_method',
            structName: interfaceMatch[1],
            methodName: interfaceMatch[2],
            interfaceName: interfaceMatch[3]
        });
    }

    const unusedMatch = message.match(/未使用的(局部变量|函数)\s*'([^']+)'|Unused\s+(local variable|function)\s*'([^']+)'/i);
    if (unusedMatch) {
        intents.push({
            type: 'remove_unused',
            symbolType: unusedMatch[1] || unusedMatch[3] || 'symbol',
            symbolName: unusedMatch[2] || unusedMatch[4]
        });
    }

    if ((message.includes('不能被赋值') && message.includes('常量'))
        || messageLower.includes('cannot be reassigned')
        || (messageLower.includes('constant') && messageLower.includes('cannot be assigned'))) {
        intents.push({ type: 'remove_constant_assignment' });
    }

    if (message.includes('死代码') || messageLower.includes('dead code') || messageLower.includes('never execute')) {
        intents.push({ type: 'remove_dead_code' });
    }

    const counts = parseExpectedAndProvidedCount(message);
    if (counts) {
        intents.push({ type: 'fix_param_count', expected: counts.expected, provided: counts.provided });
    }

    const libMatch = message.match(/库 '([^']+)' 未找到|Library '([^']+)' not found|Dependent library '([^']+)' not found/i);
    if (libMatch) {
        intents.push({ type: 'add_library_requires', libraryName: libMatch[1] || libMatch[2] || libMatch[3] });
    } else if (diagnosticCode === 'validation_error' && messageLower.includes('library')) {
        const byCodeMatch = message.match(/'([^']+)'/);
        if (byCodeMatch?.[1]) {
            intents.push({ type: 'add_library_requires', libraryName: byCodeMatch[1] });
        }
    }

    return intents;
}

export function buildFixedCallLine(lineText: string, expected: number, provided: number): string | null {
    const callMatch = lineText.match(/((?:\w+\.)?\w+)\((.*)\)/);
    if (!callMatch) {
        return null;
    }

    const callName = callMatch[1];
    const paramsText = callMatch[2];
    const params = splitArgs(paramsText);
    if (params.length !== provided) {
        // 保守策略：诊断计数与解析计数不一致时，不自动修改
        return null;
    }

    if (provided === expected) {
        return null;
    }

    let newParams = [...params];
    if (provided > expected) {
        newParams = newParams.slice(0, expected);
    } else {
        for (let i = provided; i < expected; i++) {
            newParams.push('0');
        }
    }
    const newCall = `${callName}(${newParams.join(', ')})`;
    return lineText.replace(callMatch[0], newCall);
}

export function buildLibraryDeclarationWithRequires(lineText: string, libName: string): string | null {
    const normalizedLib = libName.trim();
    if (!normalizedLib) {
        return null;
    }
    if (!/\blibrary\b/i.test(lineText)) {
        return null;
    }

    const requiresMatch = lineText.match(/requires\s+([^\n]+)/i);
    if (requiresMatch) {
        const existingRequires = requiresMatch[1].trim();
        const existingList = existingRequires
            .split(/[,\s]+/)
            .map(s => s.trim())
            .filter(Boolean);
        if (existingList.some(item => item.toLowerCase() === normalizedLib.toLowerCase())) {
            return null;
        }
        const newRequires = `${existingRequires}, ${normalizedLib}`;
        return lineText.replace(requiresMatch[0], `requires ${newRequires}`);
    }

    return `${lineText} requires ${normalizedLib}`;
}

function splitArgs(input: string): string[] {
    const args: string[] = [];
    let depth = 0;
    let current = '';
    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === '(') depth++;
        if (ch === ')') depth = Math.max(0, depth - 1);
        if (ch === ',' && depth === 0) {
            const trimmed = current.trim();
            if (trimmed) args.push(trimmed);
            current = '';
            continue;
        }
        current += ch;
    }
    const tail = current.trim();
    if (tail) args.push(tail);
    return args;
}
