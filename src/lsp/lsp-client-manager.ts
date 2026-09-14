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
import {
    DocumentSelector,
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

        const serverOptions: ServerOptions = {
            command: launch.command,
            args: launch.args,
            transport: TransportKind.stdio,
            options: {
                env: { ...process.env },
                shell: false,
                cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
            }
        };

        const clientOptions: LanguageClientOptions = {
            documentSelector: this.options.documentSelector,
            diagnosticCollectionName: LSP_DIAGNOSTIC_COLLECTION,
            outputChannel: this.options.outputChannel,
            progressOnInitialization: true,
            middleware: this.buildMiddleware()
        };

        const client = new LanguageClient(LSP_CLIENT_ID, LSP_CLIENT_NAME, serverOptions, clientOptions);
        this.client = client;
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
            this.client = undefined;
            this.capabilities = undefined;
            this.setState('failed', detail);
            return false;
        }

        // 启动过程中被 dispose/stop（例如用户又切了配置），直接放弃这次启动结果
        if (this.client !== client) {
            return false;
        }

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
        this.options.outputChannel.appendLine(`[jass.lsp] ${message}`);
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
                        // 已经是我们主动 stop 掉的旧实例
                        return;
                    }
                    const unexpected = this.expectedRunning;
                    this.client = undefined;
                    this.capabilities = undefined;
                    this.expectedRunning = false;
                    this.setState(unexpected ? 'failed' : 'stopped', unexpected ? '服务端意外退出' : undefined);
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
        try {
            await client.stop(2000);
        } catch (error) {
            this.log(`停止语言服务器时出错：${describeError(error)}`);
        }
    }

    /**
     * 构造能力屏蔽中间件。
     * 注意：回调在每次请求时执行，因此读取的是**实时**接管集合，
     * 服务端就绪后按实际能力收窄接管范围时无需重建客户端。
     */
    private buildMiddleware(): Middleware {
        const takeover = this.options.isFeatureTakeover;
        return {
            provideHover: (document, position, token, next) =>
                takeover('hover') ? next(document, position, token) : undefined,

            provideCompletionItem: (document, position, context, token, next) =>
                takeover('completion') ? next(document, position, context, token) : undefined,

            provideDefinition: (document, position, token, next) =>
                takeover('definition') ? next(document, position, token) : undefined,

            provideSignatureHelp: (document, position, context, token, next) =>
                takeover('signatureHelp') ? next(document, position, context, token) : undefined,

            provideDocumentSymbols: (document, token, next) =>
                takeover('documentSymbol') ? next(document, token) : undefined,

            provideInlayHints: (document, viewPort, token, next) =>
                takeover('inlayHints') ? next(document, viewPort, token) : undefined,

            provideDocumentHighlights: (document, position, token, next) =>
                takeover('documentHighlight') ? next(document, position, token) : undefined,

            provideDocumentSemanticTokens: (document, token, next) =>
                takeover('semanticTokens') ? next(document, token) : undefined,

            provideDocumentSemanticTokensEdits: (document, previousResultId, token, next) =>
                takeover('semanticTokens') ? next(document, previousResultId, token) : undefined,

            handleDiagnostics: (uri, diagnostics, next) => {
                if (takeover('diagnostics')) {
                    next(uri, diagnostics);
                }
            }
        };
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
        ['inlayHintProvider', 'inlayHint'],
        ['documentHighlightProvider', 'documentHighlight'],
        ['semanticTokensProvider', 'semanticTokens']
    ];
    const enabled = names
        .filter(([key]) => Boolean(capabilities[key]))
        .map(([, label]) => label);
    return enabled.length > 0 ? enabled.join(', ') : '(仅诊断)';
}
