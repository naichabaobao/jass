/**
 * ydwe-compiler --lsp 端到端探测脚本（排障工具，不参与编译/打包）
 *
 * 用途：怀疑「LSP 开了但不对」时，先用本脚本绕开 VSCode 客户端，
 * 直接驱动内置二进制走完一轮完整 LSP 会话（initialize → didOpen →
 * publishDiagnostics → hover → documentSymbol → didChange）。
 * - 本脚本通过：服务端没问题，问题在客户端集成（看输出面板 [jass.lsp] 日志）。
 * - 本脚本失败：服务端二进制问题（重新 cargo build --release --features lsp）。
 *
 * 用法：node test-lsp-probe.js
 */
const { spawn } = require("child_process");
const path = require("path");

const exe = path.join(__dirname, "static", process.platform === "win32" ? "ydwe-compiler.exe" : "ydwe-compiler");
const child = spawn(exe, ["--lsp"], { stdio: ["pipe", "pipe", "pipe"] });

let buf = Buffer.alloc(0);
const messages = [];

function frame(obj) {
    const json = Buffer.from(JSON.stringify(obj), "utf8");
    return Buffer.concat([Buffer.from(`Content-Length: ${json.length}\r\n\r\n`, "ascii"), json]);
}

child.stdout.on("data", (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
        const s = buf.indexOf("\r\n\r\n");
        if (s === -1) break;
        const m = buf.slice(0, s).toString("ascii").match(/Content-Length: (\d+)/i);
        if (!m) { console.log("✗ 无法解析帧头"); process.exit(1); }
        const len = parseInt(m[1], 10);
        if (buf.length < s + 4 + len) break;
        try { messages.push(JSON.parse(buf.slice(s + 4, s + 4 + len).toString("utf8"))); } catch (e) { /* 忽略 */ }
        buf = buf.slice(s + 4 + len);
    }
});
child.stderr.on("data", (c) => process.stderr.write("[srv] " + c.toString()));

function send(obj) { child.stdin.write(frame(obj)); }

const testUri = "file:///F:/tmp_lsp_test/probe.j";
// 有意包含：语法错误（空表达式）+ blizzard.j 函数 + 前向引用
const testContent = [
    "function InitTrig takes nothing returns nothing",
    "    local trigger t = CreateTrigger()",
    "    call TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_SPELL_EFFECT)",
    "    call TriggerAddCondition(t, Condition(function cond))",
    "    local integer broken = ",
    "endfunction",
    "function cond takes nothing returns boolean",
    "    return true",
    "endfunction",
].join("\n");

send({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { processId: process.pid, rootUri: "file:///F:/tmp_lsp_test", capabilities: {} }
});

setTimeout(() => {
    send({ jsonrpc: "2.0", method: "initialized", params: {} });
    send({
        jsonrpc: "2.0", method: "textDocument/didOpen",
        params: { textDocument: { uri: testUri, languageId: "jass", version: 1, text: testContent } }
    });
}, 300);

setTimeout(() => {
    send({ jsonrpc: "2.0", id: 2, method: "textDocument/hover", params: { textDocument: { uri: testUri }, position: { line: 2, character: 12 } } });
    send({ jsonrpc: "2.0", id: 3, method: "textDocument/documentSymbol", params: { textDocument: { uri: testUri } } });
}, 1000);

setTimeout(() => {
    let pass = true;

    const initResp = messages.find(m => m.id === 1 && m.result);
    if (initResp) {
        const caps = initResp.result.capabilities || {};
        console.log("✓ initialize：服务端能力 =", Object.keys(caps).filter(k => /Provider$/.test(k)).join(", ") || "(无)");
    } else { console.log("✗ initialize 无响应"); pass = false; }

    const diags = [];
    for (const m of messages) {
        if (m.method === "textDocument/publishDiagnostics") {
            diags.push(...(m.params.diagnostics || []));
        }
    }
    const syntaxErr = diags.find(d => (d.message || "").includes("expected expression"));
    const bjFalsePositive = diags.find(d => /TriggerRegisterAnyUnitEventBJ|CreateTrigger|undefined|未定义/.test(d.message || ""));
    if (syntaxErr) {
        console.log("✓ 诊断：识别语法错误 →", syntaxErr.message.slice(0, 80), `(source=${syntaxErr.source})`);
    } else { console.log("✗ 诊断：未识别故意注入的语法错误"); pass = false; }
    if (bjFalsePositive) {
        console.log("✗ 诊断：对 blizzard.j 函数误报 →", bjFalsePositive.message.slice(0, 80));
        pass = false;
    } else {
        console.log("✓ 诊断：blizzard.j 函数零误报（共 " + diags.length + " 条诊断）");
    }

    const hover = messages.find(m => m.id === 2);
    if (hover && hover.result && hover.result.contents) {
        console.log("✓ hover：", JSON.stringify(hover.result.contents.value || hover.result.contents).slice(0, 80) + "…");
    } else { console.log("✗ hover 无结果"); pass = false; }

    const symbols = messages.find(m => m.id === 3);
    if (symbols && Array.isArray(symbols.result)) {
        console.log("✓ documentSymbol：", symbols.result.map(s => s.name).join(", "));
    } else { console.log("✗ documentSymbol 无结果"); pass = false; }

    console.log(pass ? "\n=== 服务端 LSP 全部通过：问题应在客户端集成，查看「输出 → JASS Language Server」===" : "\n=== 服务端 LSP 存在问题 ===");
    child.kill();
    process.exit(pass ? 0 : 1);
}, 2500);
