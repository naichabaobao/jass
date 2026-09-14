/**
 * ydwe-compiler 语言服务器的定位与可用性探测
 *
 * 服务器路径**不支持配置**：固定使用扩展自带的 `static/` 目录下的二进制，
 * 按运行平台选择文件名：
 *   - Windows：`static/ydwe-compiler.exe`
 *   - Linux / macOS：`static/ydwe-compiler`（ELF 二进制，需要可执行权限）
 *
 * 这样做的理由：
 *   - 版本由扩展统一控制，避免用户 PATH 里的旧版 exe 造成行为不一致；
 *   - 排障时只需关心一个位置，「输出 → JASS Language Server」里能看到确切路径。
 */

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/** 语言服务器启动参数：必须含 `--lsp`，否则 exe 会退化成 CLI 编译模式 */
export const LSP_SERVER_ARGS: readonly string[] = ['--lsp'];

const SERVER_BASENAME = 'ydwe-compiler';

/** 解析来源，仅用于日志与排障；服务器现在只来自扩展内置目录 */
export type ServerSource = 'bundled';

export interface ServerLaunchConfig {
    /** 可执行文件绝对路径 */
    command: string;
    /** 启动参数 */
    args: string[];
    /** 命中的解析来源 */
    source: ServerSource;
}

export interface ServerResolution {
    /** 成功定位到的启动配置；找不到平台对应的二进制时为空对象 */
    launch?: ServerLaunchConfig;
}

export interface LspProbeResult {
    /** 服务器是否真的带 LSP 功能 */
    ok: boolean;
    /** 不可用时的原因（通常是服务器自己打印的提示） */
    detail?: string;
}

export const SERVER_SOURCE_LABELS: Readonly<Record<ServerSource, string>> = {
    bundled: '扩展内置 static/'
};

/** 按平台返回内置二进制的文件名 */
function bundledServerName(): string {
    return process.platform === 'win32'
        ? `${SERVER_BASENAME}.exe`
        : SERVER_BASENAME;
}

function isFile(candidate: string): boolean {
    try {
        return fs.statSync(candidate).isFile();
    } catch {
        return false;
    }
}

/**
 * 解析语言服务器可执行文件。
 *
 * - Windows：直接使用扩展内置 `static/ydwe-compiler.exe`。
 * - Linux / macOS：VSIX 是 zip 包，从 Windows 侧打包会**丢失可执行位**，
 *   直接执行扩展目录内的二进制会 EACCES。因此首次使用时把内置二进制
 *   拷贝到扩展的 globalStorage 目录并 `chmod 0o755`，之后执行该副本
 *   （内置文件变化时按 size+mtime 自动重新拷贝）。
 *
 * @param extensionPath 扩展根目录（`context.extensionPath`）
 * @param globalStoragePath 扩展的全局存储目录（`context.globalStorageUri.fsPath`），
 *                          非 Windows 平台用于存放带可执行权限的二进制副本
 */
export function resolveServerLaunch(extensionPath: string, globalStoragePath?: string): ServerResolution {
    const bundled = path.join(extensionPath, 'static', bundledServerName());
    if (!isFile(bundled)) {
        return {};
    }

    if (process.platform === 'win32' || !globalStoragePath) {
        return { launch: { command: bundled, args: [...LSP_SERVER_ARGS], source: 'bundled' } };
    }

    try {
        const executableCopy = path.join(globalStoragePath, bundledServerName());
        if (needsRefresh(bundled, executableCopy)) {
            fs.mkdirSync(globalStoragePath, { recursive: true });
            fs.copyFileSync(bundled, executableCopy);
        }
        fs.chmodSync(executableCopy, 0o755);
        return { launch: { command: executableCopy, args: [...LSP_SERVER_ARGS], source: 'bundled' } };
    } catch (error) {
        // 拷贝/赋权失败（例如磁盘只读）时退回直接执行内置文件，让错误信息自然暴露
        console.error('[jass.lsp] 准备可执行副本失败：', error);
        return { launch: { command: bundled, args: [...LSP_SERVER_ARGS], source: 'bundled' } };
    }
}

/** 副本缺失或内置二进制已更新时返回 true */
function needsRefresh(source: string, copy: string): boolean {
    try {
        const src = fs.statSync(source);
        const dst = fs.statSync(copy);
        return src.size !== dst.size || src.mtimeMs !== dst.mtimeMs;
    } catch {
        return true;
    }
}

/** 探测结果缓存：key 为 `路径|mtime`，同一二进制不重复探测 */
const probeCache = new Map<string, LspProbeResult>();

function probeCacheKey(launch: ServerLaunchConfig): string | undefined {
    try {
        return `${launch.command}|${fs.statSync(launch.command).mtimeMs}`;
    } catch {
        return undefined;
    }
}

/**
 * 轻量探测服务器是否真的带 LSP 功能。
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
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'EACCES') {
                finish({
                    ok: false,
                    detail: `${launch.command} 没有可执行权限（Linux/macOS 需执行 chmod +x）`
                });
                return;
            }
            finish({ ok: false, detail: `无法启动 ${launch.command}：${String(error)}` });
            return;
        }

        timer = setTimeout(() => finish({ ok: true }), timeoutMs);

        child.stderr.on('data', (chunk: Buffer) => {
            stderr += chunk.toString();
        });
        child.on('error', (error) => {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'EACCES') {
                finish({
                    ok: false,
                    detail: `${launch.command} 没有可执行权限（Linux/macOS 需执行 chmod +x）`
                });
                return;
            }
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
