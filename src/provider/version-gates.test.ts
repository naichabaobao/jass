/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

function runVersionGateTests() {
    const Module = require("module");
    const originalRequire = Module.prototype.require;

    let apiVersion = "off";
    const vscodeMock = {
        workspace: {
            getConfiguration: (_section: string) => ({
                get: (_key: string, defaultValue: string) => apiVersion || defaultValue,
            }),
            createFileSystemWatcher: (_glob: string) => ({
                onDidChange: (_cb: any) => undefined,
                onDidDelete: (_cb: any) => undefined,
                dispose: () => undefined,
            }),
        },
        Uri: {
            file: (fsPath: string) => ({ fsPath }),
        },
        Position: class Position {
            public line: number;
            public character: number;
            constructor(line: number, character: number) {
                this.line = line;
                this.character = character;
            }
        },
        Range: class Range {
            public start: any;
            public end: any;
            constructor(start: any, end: any) {
                this.start = start;
                this.end = end;
            }
        },
    };

    Module.prototype.require = function patchedRequire(this: any, id: string) {
        if (id === "vscode") {
            return vscodeMock;
        }
        return originalRequire.apply(this, arguments as any);
    };

    try {
        const { DefinitionProvider } = require("./definition-provider");
        const { FunctionDeclaration, Identifier, BlockStatement } = require("../vjass/ast");
        const { ZincDefinitionProvider } = require("./zinc/zinc-definition-provider");
        const { ZincFunctionDeclaration } = require("../vjass/zinc-ast");

        const fakeDataEnterManager = {
            getFileContent: (filePath: string) => {
                if (filePath === "legacy.j" || filePath === "legacy.zn") {
                    return "// @since 1.33\nfunction NewApi takes nothing returns nothing\n";
                }
                return "";
            },
            getAllCachedFiles: () => [],
            getBlockStatement: () => null,
            getZincProgram: () => null,
            isZincFile: (filePath: string) => filePath.endsWith(".zn"),
        };

        const jassStmt = new FunctionDeclaration({
            name: new Identifier("NewApi", { line: 1, position: 9 }, { line: 1, position: 15 }),
            body: new BlockStatement([], { line: 1, position: 0 }, { line: 1, position: 20 }),
            start: { line: 1, position: 0 },
            end: { line: 1, position: 20 },
        });
        const jassProvider = new DefinitionProvider(fakeDataEnterManager);
        const jassAny = jassProvider as any;

        apiVersion = "1.27";
        assert(
            jassAny.isStatementAllowedForApiVersion(jassStmt, "legacy.j") === false,
            "DefinitionProvider: legacy 1.27 应过滤 @since 1.33 的声明",
        );
        apiVersion = "1.33";
        assert(
            jassAny.isStatementAllowedForApiVersion(jassStmt, "legacy.j") === true,
            "DefinitionProvider: 1.33 不应过滤 @since 1.33 的声明",
        );
        apiVersion = "off";
        assert(
            jassAny.isStatementAllowedForApiVersion(jassStmt, "legacy.j") === true,
            "DefinitionProvider: apiVersion=off 不应过滤声明",
        );

        const zincStmt = new ZincFunctionDeclaration({
            name: new Identifier("NewApi", { line: 1, position: 9 }, { line: 1, position: 15 }),
            start: { line: 1, position: 0 },
            end: { line: 1, position: 20 },
        });
        const zincProvider = new ZincDefinitionProvider(fakeDataEnterManager);
        const zincAny = zincProvider as any;

        apiVersion = "1.27";
        assert(
            zincAny.isStatementAllowedForApiVersion(zincStmt, "legacy.zn") === false,
            "ZincDefinitionProvider: legacy 1.27 应过滤 @since 1.33 的声明",
        );
        apiVersion = "1.33";
        assert(
            zincAny.isStatementAllowedForApiVersion(zincStmt, "legacy.zn") === true,
            "ZincDefinitionProvider: 1.33 不应过滤 @since 1.33 的声明",
        );
        apiVersion = "off";
        assert(
            zincAny.isStatementAllowedForApiVersion(zincStmt, "legacy.zn") === true,
            "ZincDefinitionProvider: apiVersion=off 不应过滤声明",
        );

        zincProvider.dispose();
        console.log("✅ version gate tests passed");
    } finally {
        Module.prototype.require = originalRequire;
    }
}

runVersionGateTests();
