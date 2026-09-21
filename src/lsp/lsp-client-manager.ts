/**
 * 语言客户端生命周期管理
 *
 * 只负责「把 ydwe-compiler 的 LSP 当成一个可启动/可停用的服务来用」：
 * 进程启动、能力协商、trace 级别、优雅关闭、异常退出上报。
 * 具体「哪些特性交给它、原生实现怎么让位」由 lsp-mode-controller 决定。
 *
 * 关键设计：**能力屏蔽中间件**
 * vscode-languageclient 一旦发现服务端声明了某能力，就会为 `documentSelector`
 * 覆盖的所有文档注册对应 provider。若我们只想接管其中一部分，其余能力的 provider
 * 仍会被注册，导致与扩展内置实现的结果叠加（补全重复、hover 出现两段）。
 * 因此这里用 middleware 把「未接管」的能力统一改写成「无结果」，
 * 效果等价于该能力完全由原生实现负责。
 */

import * as vscode from 'vscode';
import { spawn, type ChildProcess } from 'child_process';
import {
    CloseAction,
    DocumentSelector,
    ErrorAction,
    LanguageClient,
    LanguageClientOptions,
    Middleware,
    ServerCapabilities,
    ServerOptions,
    State,
    Trace,
    TransportKind
} from 'vscode-languageclient/node';

import { JassFeatureId, describeTakeover } from './takeover';
import { ServerLaunchConfig, SERVER_SOURCE_LABELS } from './server-resolver';

export const LSP_CLIENT_ID = 'jassLsp';
export const LSP_CLIENT_NAME = 'JASS/ydwe-compiler Language Server';

/** 诊断集合名：Problems 面板里的来源标签，与原生 `jass` / `zinc` 区分开 */
export const LSP_DIAGNOSTIC_COLLECTION = 'ydwe-compiler';

export type LspClientState = 'stopped' | 'starting' | 'running' | 'failed';

export interface LspClientManagerOptions {
    /** 语言服务器覆盖的文档选择器 */
    documentSelector: DocumentSelector;
    /** 输出通道，承载生命周期日志与服务端 stderr */
    outputChannel: vscode.OutputChannel;
    /** 某个特性当前是否交给服务端；中间件据此屏蔽未接管的能力 */
    isFeatureTakeover: (feature: JassFeatureId) => boolean;
    /** 服务端在「非我们主动停止」的情况下退出时回调（崩溃/被杀） */
    onUnexpectedExit?: (detail: string) => void;
}

export class LspClientManager implements vscode.Disposable {
    private client: LanguageClient | undefined;
    private state: LspClientState = 'stopped';
    private capabilities: ServerCapabilities | undefined;
    /** 跟随当前客户端实例的状态监听器；重启时随之释放，避免累积 */
    private stateListener: vscode.Disposable | undefined;
    private disposed = false;
    /** 标记当前是否处于「我们期望它在跑」的阶段，用于区分主动停服与意外退出 */
    private expectedRunning = false;

    constructor(private readonly options: LspClientManagerOptions) {}

    public get currentState(): LspClientState {
        return this.state;
    }

    public get serverCapabilities(): ServerCapabilities | undefined {
        return this.capabilities;
    }

    /** 当前是否有活跃的客户端实例 */
    public get isActive(): boolean {
        return this.client !== undefined;
    }

    /**
     * 启动语言服务器。
     * @returns 是否成功进入就绪状态（initialize 完成）
     */
    public async start(launch: ServerLaunchConfig): Promise<boolean> {
        if (this.disposed) {
            return false;
        }

        await this.stop();
        this.setState('starting');
        this.log(
            `启动语言服务器：${launch.command} [${launch.args.join(' ')}]（来源：${SERVER_SOURCE_LABELS[launch.source]}）`
        );

        // ===== 关键：用函数形式自己 spawn，避免库自动插 --stdio =====
        //
        // vscode-languageclient 的 Executable 形式会自动往 args 末尾加 --stdio（或 --pipe/--socket），
        // 但 ydwe-compiler 的 clap 参数解析器不接受这个 flag —— 导致启动瞬间报错退出 → EPIPE。
        //
        // 函数形式的 ServerOptions 可以返回 ChildProcess，库会用 cp.stdin/stdout 自己建 transport，
        // 不会动我们的 args。
        const serverOptions: ServerOptions = async () => {
            const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            this.log(`spawn：${launch.command} ${launch.args.join(' ')}${cwd ? ` (cwd=${cwd})` : ''}`);
            const cp = spawn(launch.command, launch.args, {
                env: { ...process.env },
                shell: false,
                cwd
            });
            return cp;
        };

        const clientOptions: LanguageClientOptions = {
            documentSelector: this.options.documentSelector,
            diagnosticCollectionName: LSP_DIAGNOSTIC_COLLECTION,
            outputChannel: this.options.outputChannel,
            progressOnInitialization: true,
            middleware: this.buildMiddleware(),
            errorHandler: {
                // 连接级错误（EPIPE/ECONNRESET 等）静默等 close 事件，不要让它们冒到控制台。
                // count <= 3 都返回 Continue，让库内部继续等 connection.dispose() 收尾。
                error: (_error, _message, count) => {
                    const ec = (_error as NodeJS.ErrnoException)?.code;
                    if (ec === 'EPIPE' || ec === 'ECONNRESET' || ec === 'ECONNREFUSED') {
                        this.log(`连接错误（${ec}），等 close 事件收尾`);
                    } else if (count !== undefined && count <= 3) {
                        this.log(`连接错误（count=${count}），Continue：${_error.message}`);
                    } else {
                        this.log(`连接错误（count=${count ?? '?'}），Shutdown：${_error.message}`);
                        return { action: ErrorAction.Shutdown };
                    }
                    return { action: ErrorAction.Continue };
                },
                // 关键：覆盖 DefaultErrorHandler 的自动重启（最多 4 次/3min）。
                // 我们自己的 lsp-mode-controller 有 fallback 机制，两套重启会打架导致两个 client 实例并存。
                closed: () => {
                    this.log('连接已关闭，交给外部 controller 决定 fallback');
                    return { action: CloseAction.DoNotRestart };
                }
            }
        };

        const client = new LanguageClient(LSP_CLIENT_ID, LSP_CLIENT_NAME, serverOptions, clientOptions);
        // ===== 关键修复：monkey-patch client.stop 来兜住库内部的 bug =====
        //
        // vscode-languageclient 在 doInitialize 的 catch 块里有 `void this.stop()`，
        // 此时内部 $state 通常是 "starting" 或 "startFailed"，而 BaseLanguageClient.shutdown()
        // 只允许 state==="stopped"/"initial" 时直接 return —— 其他状态都会抛 "Client is not running..."。
        //
        // 但注意 NodeLanguageClient.stop() 里 super.stop().finally(terminate(childProcess)) 是杀进程的关键，
        // 我们不能完全绕过它：非 running/stopping 状态时手动 terminate 子进程，再 resolve。
        //
        // 两套 state：
        //   - client.state      → State 枚举 (Stopped=1, Running=2, Starting=3) — getPublicState()
        //   - client.$state      → ClientState 字符串枚举 ("starting"/"running"/"stopping"...) — 内部真值
        // 必须用 $state 判断。
        const baseClient = client as any;
        const originalStop = client.stop.bind(client);
        client.stop = (timeout?: number) => {
            const internalState: string = baseClient.$state;
            if (internalState !== 'running' && internalState !== 'stopping') {
                // 绕过 shutdown 协议（必抛），但必须保证子进程被 terminate，否则会成孤儿
                this.log(`[wrapper] stop() 绕过 shutdown（$state=${internalState}）→ forceKill + resolve`);
                this.forceKillChildProcess(baseClient);
                return Promise.resolve();
            }
            this.log(`[wrapper] stop() 正常 shutdown（$state=${internalState}）`);
            return originalStop(timeout);
        };

        // ===== 第二层兜底：patch sendRequest / sendNotification 吞掉 EPIPE =====
        //
        // connection.js 里有两处会把 write 错误 throw 出来变成 Promise rejection：
        //   - line 1089: sendRequest 的 catch 里 `throw error` → "Sending request failed."
        //   - line 952: sendNotification 的 catch 里 `throw error` → "Sending notification failed."
        // 这些 rejection 中间件层没人 catch → 冒到控制台。
        //
        // 这里把 client 实例的 sendRequest 和 sendNotification 都包一层：
        // EPIPE/ECONNRESET/ECONNREFUSED/PendingResponseRejected 时静默吞掉，
        // 让上层自然 fallback 到原生实现。
        const swallow = (err: any): boolean => {
            const code: string | undefined = err?.code;
            return code === 'EPIPE' || code === 'ECONNRESET' || code === 'ECONNREFUSED'
                || err?.message?.includes?.('Pending response rejected');
        };
        const originalSendRequest = (client as any).sendRequest?.bind(client);
        if (originalSendRequest) {
            (client as any).sendRequest = async function patchedSendRequest(...args: unknown[]) {
                try {
                    return await originalSendRequest(...args);
                } catch (err: any) {
                    if (swallow(err)) return null;
                    throw err;
                }
            };
        }
        const originalSendNotification = (client as any).sendNotification?.bind(client);
        if (originalSendNotification) {
            (client as any).sendNotification = function patchedSendNotification(...args: unknown[]) {
                return originalSendNotification(...args).catch((err: any) => {
                    if (!swallow(err)) throw err;
                });
            };
        }

        // 注意：this.client 要等 start() 成功后才赋值，否则 observeState 的 Stopped 回调
        // 可能在启动中途抢到清理权（connection close → StartFailed → Stopped → 误清 this.client）
        // 导致外层 catch 拿到的 client 和 observeState 里清的不是同一个。
        this.expectedRunning = true;
        this.observeState(client);
        void this.applyTraceLevel(client);

        try {
            await client.start();
        } catch (error) {
            const detail = describeError(error);
            this.log(`语言服务器启动失败：${detail}`);
            this.expectedRunning = false;
            await this.safeStop(client);
            // 失败时由外层赋 undefined；observeState 里也可能已经清过了，保险起见再清一次
            if (this.client === client) {
                this.client = undefined;
            }
            this.capabilities = undefined;
            this.setState('failed', detail);
            return false;
        }

        // 启动过程中被 dispose/stop（例如用户又切了配置），直接放弃这次启动结果
        if (this.disposed || this.stateListener === undefined) {
            await this.safeStop(client);
            return false;
        }

        this.client = client;
        this.capabilities = client.initializeResult?.capabilities;
        this.log(`语言服务器就绪；服务端声明能力：${describeCapabilities(this.capabilities)}`);
        this.setState('running');
        return true;
    }

    /** 停止语言服务器（幂等） */
    public async stop(): Promise<void> {
        const client = this.client;
        this.client = undefined;
        this.capabilities = undefined;
        this.expectedRunning = false;

        // 先摘掉状态监听，避免主动停止时被误判为「意外退出」
        this.stateListener?.dispose();
        this.stateListener = undefined;

        this.log(`stop() 被调用，client=${client ? '有' : '无'}`);

        if (client) {
            await this.safeStop(client);
        }
        if (this.state !== 'failed') {
            this.setState('stopped');
        }
    }

    /** 重新读取 trace 配置（配置变化时调用，无需重启） */
    public refreshTraceLevel(): void {
        if (this.client) {
            void this.applyTraceLevel(this.client);
        }
    }

    /** 把当前接管集合写进日志，便于排障 */
    public logTakeover(features: ReadonlySet<JassFeatureId>): void {
        this.log(`由服务端接管的特性：${describeTakeover(features)}`);
    }

    public dispose(): void {
        this.log(`dispose() 被调用`);
        this.disposed = true;
        const client = this.client;
        this.client = undefined;
        this.capabilities = undefined;
        this.expectedRunning = false;

        if (client) {
            // dispose 阶段不能 await，best-effort 关闭；进程会随扩展宿主退出而回收
            void client.stop(1000).catch(() => undefined);
        }
        this.stateListener?.dispose();
        this.stateListener = undefined;
    }

    // ===== 内部实现 =====

    private setState(next: LspClientState, detail?: string): void {
        if (this.state === next && !detail) {
            return;
        }
        this.state = next;
        if (detail) {
            this.log(`状态：${next}（${detail}）`);
        }
    }

    private log(message: string): void {
        const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
        this.options.outputChannel.appendLine(`[jass.lsp ${ts}] ${message}`);
    }

    private observeState(client: LanguageClient): void {
        this.stateListener?.dispose();
        this.stateListener = client.onDidChangeState((event) => {
                if (event.newState === State.Running) {
                    this.log('连接已建立');
                    return;
                }
                if (event.newState === State.Stopped) {
                    if (this.client !== client) {
                        // 两种可能：
                        // 1. 启动阶段还没把 this.client 赋值给 client（我们故意延后到 start 成功后），
                        //    这时 Stopped 只是 connection close → StartFailed → Stopped 的伴随事件，
                        //    外层 start() catch 块会统一处理。直接忽略。
                        // 2. 已经是 stop() 主动摘掉 stateListener 之后的旧实例事件，跳过。
                        this.log(`收到旧实例的 Stopped 事件（state=${(client as any).$state}），跳过。`);
                        return;
                    }
                    const unexpected = this.expectedRunning;
                    this.client = undefined;
                    this.capabilities = undefined;
                    this.expectedRunning = false;
                    const reason = unexpected ? '服务端意外退出' : '主动停止';
                    this.setState(unexpected ? 'failed' : 'stopped', reason);
                    if (unexpected) {
                        this.options.onUnexpectedExit?.('语言服务器进程已退出');
                    }
                }
        });
    }

    private async applyTraceLevel(client: LanguageClient): Promise<void> {
        const level = vscode.workspace.getConfiguration('jass').get<string>('lsp.trace.server', 'off');
        try {
            await client.setTrace(Trace.fromString(level));
        } catch (error) {
            this.log(`设置 LSP 日志级别失败：${describeError(error)}`);
        }
    }

    private async safeStop(client: LanguageClient): Promise<void> {
        // 和 wrapper 一样，必须用 $state 才能拿到真正的内部字符串状态。
        // shutdown() 只在 "running"/"stopping" 时能正常执行。
        const internalState = (client as any).$state as string;
        if (internalState !== 'running' && internalState !== 'stopping') {
            // 手动 kill 子进程，否则 wrapper 绕过了 NodeLanguageClient.stop 的 finally 清理，
            // 进程会成孤儿（YDWE-compiler.exe 在后台继续跑）
            this.log(`safeStop：$state=${internalState}，forceKill + dispose`);
            this.forceKillChildProcess(client as any);
            try {
                (client as any).dispose?.();
            } catch {
                /* 忽略 dispose 的偶发异常 */
            }
            return;
        }
        this.log(`safeStop：$state=${internalState}，走正常 shutdown`);
        try {
            await client.stop(2000);
        } catch (error) {
            this.log(`停止语言服务器时出错：${describeError(error)}`);
        }
    }

    /**
     * 强制终止子进程。
     *
     * 背景：NodeLanguageClient.stop(timeout) 里 super.stop(timeout).finally(() => { terminate(childProcess) })
     * 是库杀进程的唯一入口。我们的 wrapper 在非 running/stopping 状态时直接绕过了它，
     * 所以必须在自己这里确保 _serverProcess 被杀掉。
     *
     * _serverProcess 在以下时刻会被设为 undefined：
     *   - handleConnectionClosed（connection 断开时）
     *   - stop().finally（正常 stop 后）
     *   - createMessageTransports fork 之前（还没 fork 就没进程）
     * 这些情况下 _serverProcess 本来就是 undefined，这里直接 return。
     */
    private forceKillChildProcess(baseClient: any): void {
        const child = baseClient._serverProcess as ChildProcess | undefined;
        if (!child || child.pid === undefined) {
            this.log(`forceKill：无 _serverProcess，跳过`);
            return;
        }
        this.log(`forceKill：pid=${child.pid}，发 SIGTERM`);
        try {
            child.kill('SIGTERM');
        } catch {
            /* 进程可能已退出，忽略 */
        }
        setTimeout(() => {
            try {
                if (child.pid !== undefined) {
                    this.log(`forceKill：2s 后仍存活，发 SIGKILL`);
                    child.kill('SIGKILL');
                }
            } catch {
                /* 忽略 */
            }
        }, 2000);
        baseClient._serverProcess = undefined;
    }

    /**
     * 构造能力屏蔽中间件。
     * 注意：回调在每次请求时执行，因此读取的是**实时**接管集合，
     * 服务端就绪后按实际能力收窄接管范围时无需重建客户端。
     */
    private buildMiddleware(): Middleware {
        const takeover = this.options.isFeatureTakeover;
        const alive = () => this.isClientRunning();
        return {
            provideHover: (document, position, token, next) =>
                takeover('hover') && alive() ? next(document, position, token) : undefined,

            provideCompletionItem: (document, position, context, token, next) =>
                takeover('completion') && alive() ? next(document, position, context, token) : undefined,

            provideDefinition: (document, position, token, next) =>
                takeover('definition') && alive() ? next(document, position, token) : undefined,

            provideSignatureHelp: (document, position, context, token, next) =>
                takeover('signatureHelp') && alive() ? next(document, position, context, token) : undefined,

            provideDocumentSymbols: (document, token, next) =>
                takeover('documentSymbol') && alive() ? next(document, token) : undefined,

            provideWorkspaceSymbols: (query, token, next) =>
                takeover('workspaceSymbol') && alive() ? next(query, token) : undefined,

            provideInlayHints: (document, viewPort, token, next) =>
                takeover('inlayHints') && alive() ? next(document, viewPort, token) : undefined,

            provideDocumentHighlights: (document, position, token, next) =>
                takeover('documentHighlight') && alive() ? next(document, position, token) : undefined,

            provideDocumentSemanticTokens: (document, token, next) =>
                takeover('semanticTokens') && alive() ? next(document, token) : undefined,

            provideDocumentSemanticTokensEdits: (document, previousResultId, token, next) =>
                takeover('semanticTokens') && alive() ? next(document, previousResultId, token) : undefined,

            provideCodeActions: (document, range, context, token, next) =>
                takeover('codeAction') && alive() ? next(document, range, context, token) : undefined,

            provideCodeLenses: (document, token, next) =>
                takeover('codeLens') && alive() ? next(document, token) : undefined,

            provideDocumentFormattingEdits: (document, options, token, next) =>
                takeover('formatting') && alive() ? next(document, options, token) : undefined,

            provideDocumentRangeFormattingEdits: (document, range, options, token, next) =>
                takeover('formatting') && alive() ? next(document, range, options, token) : undefined,

            provideFoldingRanges: (document, context, token, next) =>
                takeover('foldingRange') && alive() ? next(document, context, token) : undefined,

            provideImplementation: (document, position, token, next) =>
                takeover('implementation') && alive() ? next(document, position, token) : undefined,

            provideReferences: (document, position, options, token, next) =>
                takeover('references') && alive() ? next(document, position, options, token) : undefined,

            provideRenameEdits: (document, position, newName, token, next) =>
                takeover('rename') && alive() ? next(document, position, newName, token) : undefined,

            prepareRename: (document, position, token, next) =>
                takeover('rename') && alive() ? next(document, position, token) : undefined,

            provideSelectionRanges: (document, positions, token, next) =>
                takeover('selectionRange') && alive() ? next(document, positions, token) : undefined,

            prepareCallHierarchy: (document, position, token, next) =>
                takeover('callHierarchy') && alive() ? next(document, position, token) : undefined,

            provideCallHierarchyIncomingCalls: (item, token, next) =>
                takeover('callHierarchy') && alive() ? next(item, token) : undefined,

            provideCallHierarchyOutgoingCalls: (item, token, next) =>
                takeover('callHierarchy') && alive() ? next(item, token) : undefined,

            prepareTypeHierarchy: (document, position, token, next) =>
                takeover('typeHierarchy') && alive() ? next(document, position, token) : undefined,

            provideTypeHierarchySupertypes: (item, token, next) =>
                takeover('typeHierarchy') && alive() ? next(item, token) : undefined,

            provideTypeHierarchySubtypes: (item, token, next) =>
                takeover('typeHierarchy') && alive() ? next(item, token) : undefined,

            handleDiagnostics: (uri, diagnostics, next) => {
                if (takeover('diagnostics') && alive()) {
                    next(uri, diagnostics);
                }
            }
        };
    }

    /** client 还在 running 吗？不在的话中间件应该直接让走原生实现 */
    private isClientRunning(): boolean {
        if (!this.client) return false;
        return (this.client as any).$state === 'running';
    }
}

function describeError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/** 把服务端能力声明压缩成一行可读文本 */
function describeCapabilities(capabilities: ServerCapabilities | undefined): string {
    if (!capabilities) {
        return '(无)';
    }
    const names: Array<[keyof ServerCapabilities, string]> = [
        ['hoverProvider', 'hover'],
        ['completionProvider', 'completion'],
        ['definitionProvider', 'definition'],
        ['signatureHelpProvider', 'signatureHelp'],
        ['documentSymbolProvider', 'documentSymbol'],
        ['workspaceSymbolProvider', 'workspaceSymbol'],
        ['inlayHintProvider', 'inlayHint'],
        ['documentHighlightProvider', 'documentHighlight'],
        ['semanticTokensProvider', 'semanticTokens'],
        ['codeActionProvider', 'codeAction'],
        ['codeLensProvider', 'codeLens'],
        ['documentFormattingProvider', 'formatting'],
        ['foldingRangeProvider', 'foldingRange'],
        ['implementationProvider', 'implementation'],
        ['referencesProvider', 'references'],
        ['renameProvider', 'rename'],
        ['selectionRangeProvider', 'selectionRange'],
        ['callHierarchyProvider', 'callHierarchy'],
        ['typeHierarchyProvider', 'typeHierarchy']
    ];
    const enabled = names
        .filter(([key]) => Boolean(capabilities[key]))
        .map(([, label]) => label);
    return enabled.length > 0 ? enabled.join(', ') : '(仅诊断)';
}
