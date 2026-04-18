/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Parser } from "../vjass/parser";

function createVscodeMock() {
    class Position {
        public line: number;
        public character: number;
        constructor(line: number, character: number) {
            this.line = line;
            this.character = character;
        }
        public isAfterOrEqual(other: Position): boolean {
            return this.line > other.line || (this.line === other.line && this.character >= other.character);
        }
        public isBeforeOrEqual(other: Position): boolean {
            return this.line < other.line || (this.line === other.line && this.character <= other.character);
        }
    }

    class Range {
        public start: Position;
        public end: Position;
        constructor(start: Position, end: Position) {
            this.start = start;
            this.end = end;
        }
    }

    class MarkdownString {
        public value: string;
        constructor(value: string) {
            this.value = value;
        }
    }

    class InlayHint {
        public position: Position;
        public label: string;
        public kind: number;
        public tooltip: any;
        constructor(position: Position, label: string, kind: number) {
            this.position = position;
            this.label = label;
            this.kind = kind;
            this.tooltip = undefined;
        }
    }

    return {
        Position,
        Range,
        MarkdownString,
        InlayHint,
        InlayHintKind: {
            Type: 1,
            Parameter: 2,
        },
    };
}

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

function runInlayHintRegressionTests() {
    const Module = require("module");
    const originalRequire = Module.prototype.require;
    const vscodeMock = createVscodeMock();
    Module.prototype.require = function patchedRequire(this: any, id: string) {
        if (id === "vscode") {
            return vscodeMock;
        }
        return originalRequire.apply(this, arguments as any);
    };

    try {
        const { InlayHintsProvider } = require("./inlay-hints-provider");

        const code = [
            "struct S",
            "    integer array arr",
            "    method m takes nothing returns nothing",
            "        set this.arr[1] = 2",
            "    endmethod",
            "endstruct",
            "function f takes nothing returns nothing",
            "    local integer array a",
            "    local integer array mat[10][20]",
            "    local S s",
            "    set a[0] = 1",
            "    set s.arr[2] = 3",
            "    set mat[1][2] = 4",
            "endfunction",
        ].join("\n");

        const parser = new Parser(code, "test.j");
        const block = parser.parse();
        assert(parser.errors.errors.length === 0, `解析失败: ${parser.errors.errors.map((e: any) => e.message).join(", ")}`);

        const lines = code.split("\n");
        const fakeDocument = {
            uri: { fsPath: "test.j" },
            lineCount: lines.length,
            lineAt: (index: number) => ({ text: lines[index] ?? "" }),
            getText: () => code,
        };

        const fakeDataEnterManager = {
            getBlockStatement: (path: string) => (path === "test.j" ? block : null),
            getAllCachedFiles: () => ["test.j"],
        };

        const provider = new InlayHintsProvider(fakeDataEnterManager);
        const range = new vscodeMock.Range(
            new vscodeMock.Position(0, 0),
            new vscodeMock.Position(lines.length - 1, lines[lines.length - 1].length),
        );
        const hints = provider.provideInlayHints(fakeDocument, range, { isCancellationRequested: false }) || [];

        const hintLabels = hints.map((h: any) => String(h.label));
        const hintTooltips = hints.map((h: any) => String(h.tooltip?.value ?? ""));

        assert(
            hintLabels.includes(": integer") &&
            hintTooltips.some((t: string) => t.includes("变量 `a` 类型: `integer`")),
            "缺少 set a[0] = 1 的数组元素类型提示",
        );
        assert(
            hintLabels.includes(": integer") &&
            hintTooltips.some((t: string) => t.includes("变量 `arr` 类型: `integer`")),
            "缺少 set this.arr[1] = 2 的数组成员元素类型提示",
        );
        assert(
            hintLabels.includes(": integer") &&
            hintTooltips.some((t: string) => t.includes("变量 `arr` 类型: `integer`")),
            "缺少 set s.arr[2] = 3 的对象成员数组元素类型提示",
        );
        assert(
            hintLabels.includes(": integer") &&
            hintTooltips.some((t: string) => t.includes("变量 `mat` 类型: `integer`")),
            "缺少 set mat[1][2] = 4 的多维数组元素类型提示",
        );

        console.log("✅ inlay-hints regression tests passed");
    } finally {
        Module.prototype.require = originalRequire;
    }
}

runInlayHintRegressionTests();
