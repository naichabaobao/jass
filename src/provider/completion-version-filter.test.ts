/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

function createVscodeMock(apiVersion: string) {
    class MarkdownString {
        public value: string;
        constructor(value: string) {
            this.value = value;
        }
    }

    class CompletionItem {
        public label: string;
        public kind: number;
        public sortText?: string;
        public documentation?: any;
        public tags?: number[];
        constructor(label: string, kind: number) {
            this.label = label;
            this.kind = kind;
        }
    }

    return {
        MarkdownString,
        CompletionItem,
        CompletionItemKind: {
            Function: 3,
            Keyword: 14,
        },
        CompletionItemTag: {
            Deprecated: 1,
        },
        workspace: {
            getConfiguration: (_section: string) => ({
                get: (_key: string, defaultValue: string) => apiVersion || defaultValue
            })
        }
    };
}

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

function runVersionFilterTests() {
    const Module = require("module");
    const originalRequire = Module.prototype.require;

    function withApiVersion(version: string, fn: (providerModule: any, vscodeMock: any) => void) {
        const vscodeMock = createVscodeMock(version);
        Module.prototype.require = function patchedRequire(this: any, id: string) {
            if (id === "vscode") {
                return vscodeMock;
            }
            return originalRequire.apply(this, arguments as any);
        };
        try {
            delete require.cache[require.resolve("./completion-provider")];
            const providerModule = require("./completion-provider");
            fn(providerModule, vscodeMock);
        } finally {
            Module.prototype.require = originalRequire;
        }
    }

    withApiVersion("1.27", ({ CompletionProvider }, vscodeMock) => {
        const provider = new CompletionProvider({} as any);
        const item = new vscodeMock.CompletionItem("BlzFoo", vscodeMock.CompletionItemKind.Function);
        item.sortText = "1_func_BlzFoo";
        item.documentation = new vscodeMock.MarkdownString("**Since:** 1.33");
        const keep = (provider as any).applyApiVersionPreference(item);
        assert(keep === false, "legacy 1.27 应过滤 Since 1.33 的补全项");
    });

    withApiVersion("1.33", ({ CompletionProvider }, vscodeMock) => {
        const provider = new CompletionProvider({} as any);
        const item = new vscodeMock.CompletionItem("FutureApi", vscodeMock.CompletionItemKind.Function);
        item.sortText = "1_func_FutureApi";
        item.documentation = new vscodeMock.MarkdownString("**Since:** 1.36");
        const keep = (provider as any).applyApiVersionPreference(item);
        assert(keep === true, "非 legacy 版本不应直接过滤高版本 API");
        assert(
            typeof item.sortText === "string" && item.sortText.indexOf("7_version_mismatch_") === 0,
            "非 legacy 版本应对高版本 API 降权排序"
        );
    });

    withApiVersion("off", ({ CompletionProvider }, vscodeMock) => {
        const provider = new CompletionProvider({} as any);
        const item = new vscodeMock.CompletionItem("AnyApi", vscodeMock.CompletionItemKind.Function);
        item.sortText = "1_func_AnyApi";
        item.documentation = new vscodeMock.MarkdownString("**Since:** 1.36");
        const keep = (provider as any).applyApiVersionPreference(item);
        assert(keep === true, "apiVersion=off 不应过滤补全项");
        assert(item.sortText === "1_func_AnyApi", "apiVersion=off 不应改写排序");
    });

    console.log("✅ completion version filter tests passed");
}

runVersionFilterTests();

