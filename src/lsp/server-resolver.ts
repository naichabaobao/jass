/**
 * ydwe-compiler 语言服务器的定位与可用性探测
 *
 * 定位顺序（先命中先返回）：
 *   1. 配置项 `jass.lsp.path`（支持 `${workspaceFolder}` 变量；配置了但不存在时直接报错，不静默回落）
 *   2. 系统 `PATH` 中的 `ydwe-compiler(.exe)`
 *   3. 当前工作区下的 `target/release`、`../target/release`、`../../target/release`、`target/debug`
 *      （方便直接对着 ydwe-compiler 仓库调服务器）
 *   4. 扩展内置的 `static/ydwe-compiler(.exe)`（随扩展分发，也是正式用户的兜底）
 */

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/** 语言服务器启动参数：必须含 `--lsp`，否则 exe 会退化成 CLI 编译模式 */
export const LSP_SERVER_ARGS: readonly string[] = ['--lsp'];

const SERVER_BASENAME = 'ydwe-compiler';

/** 解析来源，仅用于日志与排障 */
export type ServerSource = 'setting' | 'path' | 'workspace' | 'bundled';

export interface ServerLaunchConfig {
    /** 可执行文件绝对路径 */
    command: string;
    /** 启动参数 */
    args: string[];
    /** 命中的解析来源 */
    source: ServerSource;
}

export interface ServerResolution {
    /** 成功定位到的启动配置 */
    launch?: ServerLaunchConfig;
    /** 用户在 `jass.lsp.path` 里填了路径但文件不存在时为该路径，用于给出精确提示 */
    missingConfiguredPath?: string;
}

export interface LspProbeResult {
    /** exe 是否真的带 LSP 功能 */
    ok: boolean;
    /** 不可用时的原因（通常是 exe 自己打印的提示） */
    detail?: string;
}

export const SERVER_SOURCE_LABELS: Readonly<Record<ServerSource, string>> = {
    setting: '配置 jass.lsp.path',
    path: '系统 PATH',
    workspace: '工作区 target 目录',
    bundled: '扩展内置 static/'
};

/** Windows 下同时接受带与不带 `.exe` 的写法 */
function executableNames(): string[] {
    return process.platform === 'win32'
        ? [`${SERVER_BASENAME}.exe`, SERVER_BASENAME]
        : [SERVER_BASENAME];
}

function isFile(candidate: string | undefined): candidate is string {
    if (!candidate) {
        return false;
    }
    try {
        return fs.statSync(candidate).isFile();
    } catch {
        return false;
    }
}

function expandWorkspaceFolder(value: string): string {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!root) {
        return value;
    }
    return value.replace(/\$\{workspaceFolder\}/g, root);
}

/** 遍历 PATH 查找可执行文件；用字符串切分而非 `where`，避免额外进程与 shell 差异 */
function findOnPath(): string | undefined {
    const pathValue = process.env.PATH || '';
    const names = executableNames();
    for (const dir of pathValue.split(path.delimiter)) {
        if (!dir) {
            continue;
        }
        for (const name of names) {
            const candidate = path.join(dir, name);
            if (isFile(candidate)) {
                return candidate;
            }
        }
    }
    return undefined;
}

/** 工作区内的候选路径：方便直接对着 ydwe-compiler 仓库调试语言服务器 */
function workspaceCandidates(): string[] {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!root) {
        return [];
    }
    const relativeDirs = [
        path.join('target', 'release'),
        path.join('..', 'target', 'release'),
        path.join('..', '..', 'target', 'release'),
        path.join('target', 'debug')
    ];
    const candidates: string[] = [];
    for (const dir of relativeDirs) {
        for (const name of executableNames()) {
            candidates.push(path.resolve(root, dir, name));
        }
    }
    return candidates;
}

/**
 * 解析语言服务器可执行文件。
 *
 * @param extensionPath 扩展根目录（`context.extensionPath`），用于定位内置 exe
 */
export function resolveServerLaunch(extensionPath: string): ServerResolution {
    const config = vscode.workspace.getConfiguration('jass');

    // 1) 显式配置优先，且不回落到其它来源——用户写了路径却不存在时必须让他知道
    const configured = (config.get<string>('lsp.path', '') || '').trim();
    if (configured) {
        const expanded = expandWorkspaceFolder(configured);
        if (isFile(expanded)) {
            return { launch: { command: expanded, args: [...LSP_SERVER_ARGS], source: 'setting' } };
        }
        return { missingConfiguredPath: expanded };
    }

    // 2) 系统 PATH
    const fromPath = findOnPath();
    if (fromPath) {
        return { launch: { command: fromPath, args: [...LSP_SERVER_ARGS], source: 'path' } };
    }

    // 3) 工作区 target 目录
    for (const candidate of workspaceCandidates()) {
        if (isFile(candidate)) {
            return { launch: { command: candidate, args: [...LSP_SERVER_ARGS], source: 'workspace' } };
        }
    }

    // 4) 扩展内置
    for (const name of executableNames()) {
        const bundled = path.join(extensionPath, 'static', name);
        if (isFile(bundled)) {
            return { launch: { command: bundled, args: [...LSP_SERVER_ARGS], source: 'bundled' } };
        }
    }

    return {};
}

/** 探测结果缓存：key 为 `路径|mtime`，避免每次切换配置都白等一次探测 */
const probeCache = new Map<string, LspProbeResult>();

function probeCacheKey(launch: ServerLaunchConfig): string | undefined {
    try {
        return `${launch.command}|${fs.statSync(launch.command).mtimeMs}`;
    } catch {
        return undefined;
    }
}

/**
 * 轻量探测 exe 是否真的带 LSP 功能。
 *
 * 未用 `--features lsp` 构建的产物会**立刻退出**并在 stderr 打印
 * `Error: LSP feature not enabled, rebuild with --features lsp`；
 * 正常的语言服务器则在等待 `initialize` 请求，不会自行退出。
 * 因此判据简化为：启动后短时间内自行退出 => 不可用。
 *
 * @param timeoutMs 观察窗口；到点仍存活即认为可用
 */
export function probeLspSupport(launch: ServerLaunchConfig, timeoutMs = 1200): Promise<LspProbeResult> {
    const cacheKey = probeCacheKey(launch);
    if (cacheKey) {
        const cached = probeCache.get(cacheKey);
        if (cached) {
            return Promise.resolve(cached);
        }
    }

    return new Promise<LspProbeResult>((resolve) => {
        let settled = false;
        let stderr = '';
        let timer: NodeJS.Timeout | undefined;
        let child: cp.ChildProcessWithoutNullStreams | undefined;

        const finish = (result: LspProbeResult): void => {
            if (settled) {
                return;
            }
            settled = true;
            if (timer) {
                clearTimeout(timer);
            }
            try {
                child?.kill();
            } catch {
                // 进程可能已退出，忽略
            }
            if (cacheKey) {
                probeCache.set(cacheKey, result);
            }
            resolve(result);
        };

        try {
            child = cp.spawn(launch.command, launch.args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsHide: true
            });
        } catch (error) {
            finish({ ok: false, detail: `无法启动 ${launch.command}：${String(error)}` });
            return;
        }

        timer = setTimeout(() => finish({ ok: true }), timeoutMs);

        child.stderr.on('data', (chunk: Buffer) => {
            stderr += chunk.toString();
        });
        child.on('error', (error) => {
            finish({ ok: false, detail: String(error) });
        });
        child.on('exit', (code) => {
            finish({
                ok: false,
                detail: stderr.trim() || `进程提前退出（exit code = ${code}）`
            });
        });
    });
}
