/**
 * LSP 模式控制器 —— 扩展内「原实现」与「exe 语言服务器」的唯一切换点
 *
 * 职责：
 *   1. 读 `jass.lsp` 开关，决定语言特性由谁负责；
 *   2. 保证同一特性**同时只有一套实现生效**：接管时注销原生 provider，
 *      未接管（或服务端不支持）时安装原生 provider；
 *   3. 服务端不可用时（找不到 exe / exe 未带 lsp 功能 / 启动失败 / 中途崩溃）
 *      一律回落到原生实现，并给出可操作的提示，避免用户「hover 突然没了」。
 *
 * 设计要点：所有注册/注销都收敛到 FeatureRegistry，
 * 切换逻辑集中在本文件，其余 provider 代码无需关心 LSP 的存在。
 */

import * as vscode from 'vscode';

import {
    ALL_JASS_FEATURES,
    DEFAULT_TAKEOVER_FEATURES,
    FEATURE_LABELS,
    JassFeatureId,
    describeTakeover,
    resolveEffectiveTakeover
} from './takeover';
import { LspClientManager } from './lsp-client-manager';
import { probeLspSupport, resolveServerLaunch } from './server-resolver';
import { DocumentSelector } from 'vscode-languageclient/node';

/** 注册表条目：一个特性当前生效的那套实现 */
type FeatureDisposables = vscode.Disposable[];

/**
 * 独占特性注册表。
 * 同一 id 重复 install 会先注销旧实现，因此可以安全地反复调用。
 */
export class FeatureRegistry implements vscode.Disposable {
    private readonly installed = new Map<string, FeatureDisposables>();

    /** 安装某个特性的实现；factory 内的注册动作立即执行 */
    public install(feature: string, factory: () => FeatureDisposables): void {
        this.uninstall(feature);
        const disposables = factory();
        if (disposables.length > 0) {
            this.installed.set(feature, disposables);
        }
    }

    /** 注销某个特性的实现（幂等） */
    public uninstall(feature: string): void {
        const disposables = this.installed.get(feature);
        if (!disposables) {
            return;
        }
        this.installed.delete(feature);
        for (const disposable of disposables) {
            try {
                disposable.dispose();
            } catch (error) {
                console.error(`[jass.lsp] 注销特性 ${feature} 时出错：`, error);
            }
        }
    }

    public isInstalled(feature: string): boolean {
        return this.installed.has(feature);
    }

    public dispose(): void {
        for (const feature of Array.from(this.installed.keys())) {
            this.uninstall(feature);
        }
    }
}

export interface LspModeControllerOptions {
    context: vscode.ExtensionContext;
    /**
     * 各语言特性的原生实现工厂。
     * 未提供工厂的特性视为「没有原生实现」（例如符号高亮、语义着色），
     * 此时该特性未接管也不会注册任何东西。
     */
    nativeFeatureFactories: Partial<Record<JassFeatureId, () => FeatureDisposables>>;
    /** 语言服务器覆盖的文档选择器 */
    documentSelector: DocumentSelector;
}

export class LspModeController implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly registry = new FeatureRegistry();
    private readonly clientManager: LspClientManager;
    private readonly options: LspModeControllerOptions;

    /** 当前由服务端接管的特性集合；中间件实时读取它 */
    private takeover: ReadonlySet<JassFeatureId> = new Set();

    /** 串行化 apply：快速切换配置时避免两次 apply 交叉执行 */
    private queue: Promise<void> = Promise.resolve();
    private disposed = false;

    constructor(options: LspModeControllerOptions) {
        this.options = options;
        this.outputChannel = vscode.window.createOutputChannel('JASS Language Server');
        this.clientManager = new LspClientManager({
            documentSelector: options.documentSelector,
            outputChannel: this.outputChannel,
            isFeatureTakeover: (feature) => this.takeover.has(feature),
            onUnexpectedExit: (detail) => {
                void this.handleUnexpectedExit(detail);
            }
        });
    }

    /** 当前是否有特性交给语言服务器 */
    public get isLspActive(): boolean {
        return this.takeover.size > 0;
    }

    /**
     * 按当前配置重建特性归属。幂等，可反复调用
     * （激活时调用一次，`jass.lsp` 变化时再调用）。
     *
     * 该方法**永不 reject**：LSP 只是可选增强，它的任何异常都不应该
     * 中断扩展激活或影响已注册的特性，因此内部统一兜底为「回落原生实现」。
     */
    public apply(): Promise<void> {
        const run = (): Promise<void> => this.applySafely();
        this.queue = this.queue.then(run, run);
        return this.queue;
    }

    /**
     * 只重装某个原生特性的实现。
     * 用于不影响 LSP 归属的配置变化（例如 `jass.hint` 控制的内联提示）。
     */
    public refreshNativeFeature(feature: JassFeatureId): void {
        if (this.takeover.has(feature)) {
            // 已由服务端负责，无需重装原生实现
            return;
        }
        this.installNativeFeature(feature);
    }

    /** LSP 日志级别变化：无需重启，直接下发给客户端 */
    public refreshTraceLevel(): void {
        this.clientManager.refreshTraceLevel();
    }

    /** 重启语言服务器（供命令调用） */
    public async restart(): Promise<void> {
        await this.clientManager.stop();
        this.takeover = new Set();
        await this.apply();
    }

    public dispose(): void {
        this.disposed = true;
        this.registry.dispose();
        this.clientManager.dispose();
        this.outputChannel.dispose();
    }

    // ===== 内部实现 =====

    /** applyInternal 的兜底包装：任何异常都收敛为「回落到原生实现」 */
    private async applySafely(): Promise<void> {
        try {
            await this.applyInternal();
        } catch (error) {
            if (this.disposed) {
                return;
            }
            const detail = error instanceof Error ? error.message : String(error);
            this.takeover = new Set();
            this.installAllNativeFeatures();
            this.log(`LSP 接管流程异常，已回落扩展内置实现：${detail}`);
        }
    }

    private async applyInternal(): Promise<void> {
        if (this.disposed) {
            return;
        }

        const enabled = vscode.workspace.getConfiguration('jass').get<boolean>('lsp', false);

        if (!enabled) {
            await this.clientManager.stop();
            this.takeover = new Set();
            this.installAllNativeFeatures();
            this.log('jass.lsp 关闭，全部语言特性使用扩展内置实现');
            return;
        }

        this.log('jass.lsp 已开启（实验性），准备接入 exe 语言服务器');

        const resolution = resolveServerLaunch(this.options.context.extensionPath);
        if (resolution.missingConfiguredPath) {
            await this.fallback(
                `jass.lsp.path 指向的文件不存在：${resolution.missingConfiguredPath}`
            );
            return;
        }
        if (!resolution.launch) {
            await this.fallback(
                '未找到 ydwe-compiler 可执行文件。已尝试 jass.lsp.path、系统 PATH、' +
                    '工作区 target/{release,debug} 与扩展内置 static/。'
            );
            return;
        }

        // 先用「期望集合」告诉中间件，客户端启动期间即按此屏蔽未接管的能力
        this.takeover = new Set(DEFAULT_TAKEOVER_FEATURES);

        const probe = await probeLspSupport(resolution.launch);
        if (!probe.ok) {
            await this.fallback(
                '内置的 ydwe-compiler 没有启用 LSP 功能。请用 ' +
                    '`cargo build --release --features lsp` 重新构建后替换静态资源。' +
                    (probe.detail ? `\n服务端输出：${probe.detail}` : '')
            );
            return;
        }

        const started = await this.clientManager.start(resolution.launch);
        if (!started) {
            await this.fallback('ydwe-compiler 语言服务器启动失败，已回落到扩展内置实现。');
            return;
        }

        // 服务端就绪后，按它真实声明的能力收窄接管范围
        const effective = resolveEffectiveTakeover(
            DEFAULT_TAKEOVER_FEATURES,
            this.clientManager.serverCapabilities
        );
        this.takeover = effective;
        this.clientManager.logTakeover(effective);

        for (const feature of ALL_JASS_FEATURES) {
            if (effective.has(feature)) {
                this.registry.uninstall(feature);
            } else {
                this.installNativeFeature(feature);
            }
        }

        const skipped = DEFAULT_TAKEOVER_FEATURES.filter((f) => !effective.has(f));
        if (skipped.length > 0) {
            this.log(
                `服务端未声明以下能力，已回落扩展内置实现：${skipped
                    .map((f) => FEATURE_LABELS[f])
                    .join('、')}`
            );
        }
        this.log(`LSP 接管完成：${describeTakeover(effective)}`);
    }

    private installAllNativeFeatures(): void {
        for (const feature of ALL_JASS_FEATURES) {
            this.installNativeFeature(feature);
        }
    }

    private installNativeFeature(feature: JassFeatureId): void {
        const factory = this.options.nativeFeatureFactories[feature];
        if (!factory) {
            // 该特性没有原生实现（符号高亮 / 语义着色），未接管时保持静默
            this.registry.uninstall(feature);
            return;
        }
        try {
            this.registry.install(feature, factory);
        } catch (error) {
            // 单个特性装不上不应该拖垮其它特性
            const detail = error instanceof Error ? error.message : String(error);
            this.log(`安装「${FEATURE_LABELS[feature]}」的原生实现失败：${detail}`);
            this.registry.uninstall(feature);
        }
    }

    private async handleUnexpectedExit(detail: string): Promise<void> {
        if (this.disposed) {
            return;
        }
        this.takeover = new Set();
        this.installAllNativeFeatures();
        this.log(`${detail}，已回落到扩展内置实现`);

        const choice = await vscode.window.showWarningMessage(
            `${detail}（ydwe-compiler 语言服务器）。已暂时切回扩展内置实现。`,
            '重启语言服务器',
            '查看日志'
        );
        if (choice === '重启语言服务器') {
            await this.restart();
        } else if (choice === '查看日志') {
            this.outputChannel.show(true);
        }
    }

    /** 任何一步失败：记录原因、提示用户、回落原生实现 */
    private async fallback(reason: string): Promise<void> {
        await this.clientManager.stop();
        this.takeover = new Set();
        this.installAllNativeFeatures();
        this.log(`已回落扩展内置实现。原因：${reason}`);

        const choice = await vscode.window.showErrorMessage(
            `JASS 语言服务器不可用，已回落到扩展内置实现。${reason.split('\n')[0]}`,
            '查看日志',
            '重新加载窗口'
        );
        if (choice === '查看日志') {
            this.outputChannel.show(true);
        } else if (choice === '重新加载窗口') {
            void vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }

    private log(message: string): void {
        this.outputChannel.appendLine(`[jass.lsp] ${message}`);
    }
}

/** 语言服务器覆盖的文档选择器（与 extension.ts 的 jassSelector 对齐，含 untitled） */
export const LSP_DOCUMENT_SELECTOR: DocumentSelector = [
    { scheme: 'file', language: 'jass' },
    { scheme: 'untitled', language: 'jass' },
    { scheme: 'file', language: 'jass-zinc' },
    { scheme: 'untitled', language: 'jass-zinc' }
];
