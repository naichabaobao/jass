import("./provider/data-enter-manager");
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import("./provider/data-enter-manager");
import { CompletionProvider } from './provider/completion-provider';
import { SignatureHelpProvider } from './provider/signature-help-provider';
import { OutlineProvider } from './provider/outline-provider';
import { HoverProvider } from './provider/hover-provider';
import { DefinitionProvider } from './provider/definition-provider';
import { KeywordDefinitionProvider } from './provider/keyword-definition-provider';
import { TypeDefinitionProvider } from './provider/type-definition-provider';
import { ReferenceProvider } from './provider/reference-provider';
import { InlayHintsProvider } from './provider/inlay-hints-provider';
import { ImplementationProvider } from './provider/implementation-provider';
import { DiagnosticProvider } from './provider/diagnostic-provider';
import { ZincCompletionProvider } from './provider/zinc/zinc-completion-provider';
import { ZincDefinitionProvider } from './provider/zinc/zinc-definition-provider';
import { ZincHoverProvider } from './provider/zinc/zinc-hover-provider';
import { ZincSignatureHelpProvider } from './provider/zinc/zinc-signature-help-provider';
import { ZincOutlineProvider } from './provider/zinc/zinc-outline-provider';
import { ZincDiagnosticProvider } from './provider/zinc/zinc-diagnostic-provider';
// import { FormattingProvider } from './provider/formatting-provider';
import { DocumentFormattingSortEditProvider } from './provider/formatting-edit-provider';

import { ZincFormattingProvider } from './provider/zinc/zinc-formatting-provider';
import { DataEnterManager } from './provider/data-enter-manager';
import { JassDocumentColorProvider } from './provider/color-provider';
import { ZincInlayHintsProvider } from './provider/zinc/zinc-inlay-hints-provider';
import { SpecialFileManager } from './provider/special/special-file-manager';
import { SpecialCompletionProvider } from './provider/special/special-completion-provider';
import { SpecialHoverProvider } from './provider/special/special-hover-provider';
import { SpecialDefinitionProvider } from './provider/special/special-definition-provider';
import { DocumentLinkProvider } from './provider/link-provider';
import { CodeActionProvider } from './provider/code-action-provider';
import { WorkspaceSymbolProvider } from './provider/workspace-symbol-provider';
import { DocumentInfoManager } from './provider/document-info-manager';

// 实验性：ydwe-compiler(exe) 语言服务器接入
import { LSP_DOCUMENT_SELECTOR, LspModeController } from './lsp/lsp-mode-controller';
import { JassFeatureId } from './lsp/takeover';

// JASS 语言选择器
const jassSelector = { scheme: 'file', language: 'jass' };
const jassZincSelector = { scheme: 'file', language: 'jass-zinc' };

// 全局 DataEnterManager 实例
let dataEnterManager: DataEnterManager | undefined;

const SUPPORT_PROMPT_SNOOZE_UNTIL_KEY = 'supportPrompt.snoozeUntil';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function renderSupportWebview(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): void {
    const webview = panel.webview;
    const toWebviewUri = (segments: string[]): string => {
        const uri = vscode.Uri.joinPath(context.extensionUri, ...segments);
        return webview.asWebviewUri(uri).toString();
    };

    const imageStore = toWebviewUri(['static', 'images', '渴望可乐.png']);
    const imageCoding = toWebviewUri(['static', 'images', '零食充足才有精力修BUG.png']);
    const imageQQ = toWebviewUri(['static', 'images', 'qrcode.png']);
    const imageWechat = toWebviewUri(['static', 'images', 'wechatqrcode.png']);

    panel.webview.html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>支持作者</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
      padding: 20px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }
    .wrap {
      max-width: 980px;
      margin: 0 auto;
      display: grid;
      gap: 18px;
    }
    .hero {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 14px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(255,145,77,0.12), rgba(255,80,120,0.08));
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }
    .desc {
      margin: 10px 0 0;
      opacity: 0.85;
      line-height: 1.6;
    }
    .tip {
      margin: 10px 0 0;
      font-size: 12px;
      opacity: 0.75;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 14px;
    }
    .card {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 12px;
      overflow: hidden;
      background: var(--vscode-editorWidget-background);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .card img {
      display: block;
      width: 100%;
      height: auto;
    }
    .label {
      padding: 10px 12px;
      font-size: 13px;
      opacity: 0.9;
      border-top: 1px solid var(--vscode-panel-border);
    }
    .qr .label {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1 class="title">如果项目帮到你，欢迎请我喝杯奶茶 ❤️</h1>
      <p class="desc">你的支持会用于持续维护、修复问题和更新文档。完全自愿，不影响功能使用。<br/>感谢风云地图编辑器QQ群：534186949的维护支持。</p>
      <p class="tip">每一份支持，都会优先转化成更快的修复与更稳的版本。</p>
    </div>
    <div class="grid">
      <div class="card">
        <img src="${imageStore}" alt="support-image-1" />
        <div class="label">渴望可乐</div>
      </div>
      <div class="card">
        <img src="${imageCoding}" alt="support-image-2" />
        <div class="label">零食充足才有精力修 BUG</div>
      </div>
      <div class="card qr">
        <img src="${imageQQ}" alt="qq-qrcode" />
        <div class="label">QQ 扫码支持</div>
      </div>
      <div class="card qr">
        <img src="${imageWechat}" alt="wechat-qrcode" />
        <div class="label">微信扫码支持</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function showSupportPrompt(context: vscode.ExtensionContext): Promise<void> {
    const now = Date.now();
    const snoozeUntil = context.globalState.get<number>(SUPPORT_PROMPT_SNOOZE_UNTIL_KEY, 0);
    if (now < snoozeUntil) {
        return;
    }

    const choice = await vscode.window.showInformationMessage(
        '如果这个扩展帮到了你，欢迎支持作者持续维护 ❤️（温馨提示）。\n感谢风云地图编辑器QQ群：534186949的维护支持。',
        '去支持',
        '不再提示',
        '稍后提醒',
        '狠心拒绝'
    );

    if (choice === '去支持') {
        const panel = vscode.window.createWebviewPanel(
            'jassSupportAuthor',
            '支持 JASS 扩展作者',
            vscode.ViewColumn.Beside,
            {
                enableScripts: false,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'static', 'images')]
            }
        );
        renderSupportWebview(panel, context);
        return;
    }

    if (choice === '不再提示') {
        // 按产品策略：这里不是永久不提示，而是冷却 7 天
        await context.globalState.update(SUPPORT_PROMPT_SNOOZE_UNTIL_KEY, now + WEEK_MS);
        return;
    }

    if (choice === '稍后提醒') {
        // 每次打开都询问，因此“稍后提醒”不写入冷却状态
        return;
    }

    if (choice === '狠心拒绝') {
        // 每次打开都询问，因此“狠心拒绝”不写入冷却状态
        return;
    }
}

async function openKeywordDocWebview(context: vscode.ExtensionContext, docFileName?: string): Promise<void> {
    if (!docFileName || typeof docFileName !== 'string') {
        vscode.window.showWarningMessage('Keyword document is empty');
        return;
    }

    const safeName = path.basename(docFileName);
    const htmlPath = path.join(context.extensionPath, 'static', 'html', safeName);
    const keywordName = safeName.replace('.html', '');
    const htmlContent = fs.existsSync(htmlPath)
        ? fs.readFileSync(htmlPath, 'utf-8')
        : buildFallbackKeywordDocHtml(keywordName);
    const enhancedHtmlContent = enhanceKeywordDocHtml(htmlContent);
    const panel = vscode.window.createWebviewPanel(
        'jassKeywordDoc',
        `JASS Keyword: ${keywordName}`,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'static', 'html')]
        }
    );
    panel.webview.html = enhancedHtmlContent;
}

function enhanceKeywordDocHtml(html: string): string {
    const highlightStyle = `
<style id="jass-keyword-highlight-style">
  .jass-kw { color: #c586c0; font-weight: 600; }
  .jass-ty { color: #4ec9b0; font-weight: 600; }
  .jass-num { color: #b5cea8; }
  .jass-comment { color: #6a9955; }
</style>`;

    const highlightScript = `
<script id="jass-keyword-highlight-script">
(function () {
  const keywords = [
    'endfunction','endglobals','endloop','exitwhen','function','constant','native','local','type','set','call',
    'takes','returns','extends','array','elseif','endif','then','loop','return','globals','if','else','and','or','not',
    'library','initializer','needs','uses','requires','endlibrary','scope','endscope','private','public','static',
    'interface','endinterface','implement','struct','endstruct','method','endmethod','this','delegate','operator',
    'debug','module','endmodule','optional','stub','key','thistype','oninit','ondestroy','hook','defaults','execute',
    'create','destroy','size','name','allocate','deallocate'
  ];
  const typeWords = ['integer','real','boolean','string','handle','code','nothing','true','false','null'];
  const kwPattern = new RegExp('\\\\b(' + keywords.join('|') + ')\\\\b', 'g');
  const tyPattern = new RegExp('\\\\b(' + typeWords.join('|') + ')\\\\b', 'g');
  const numPattern = /\\b\\d+(?:\\.\\d+)?\\b/g;

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightCode(raw) {
    const lines = raw.split('\n');
    return lines.map((line) => {
      const commentIndex = line.indexOf('//');
      let codePart = line;
      let commentPart = '';
      if (commentIndex >= 0) {
        codePart = line.slice(0, commentIndex);
        commentPart = line.slice(commentIndex);
      }

      let out = escapeHtml(codePart);
      out = out.replace(kwPattern, '<span class="jass-kw">$1</span>');
      out = out.replace(tyPattern, '<span class="jass-ty">$1</span>');
      out = out.replace(numPattern, '<span class="jass-num">$&</span>');

      if (commentPart) {
        out += '<span class="jass-comment">' + escapeHtml(commentPart) + '</span>';
      }
      return out;
    }).join('\n');
  }

  document.querySelectorAll('pre code').forEach((node) => {
    const text = node.textContent || '';
    node.innerHTML = highlightCode(text);
  });
})();
</script>`;

    const withStyle = html.includes('</head>')
        ? html.replace('</head>', `${highlightStyle}\n</head>`)
        : `${highlightStyle}\n${html}`;
    const withScript = withStyle.includes('</body>')
        ? withStyle.replace('</body>', `${highlightScript}\n</body>`)
        : `${withStyle}\n${highlightScript}`;
    return withScript;
}

function buildFallbackKeywordDocHtml(keyword: string): string {
    const shownKeyword = keyword || 'keyword';
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${shownKeyword} - JASS/vJass 文档</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; background: #1e1e1e; color: #d4d4d4; }
    .wrap { max-width: 900px; margin: 0 auto; padding: 28px 24px; }
    h1 { margin: 0 0 12px; color: #4ec9b0; font-size: 30px; }
    .tip { margin: 0 0 18px; color: #9cdcfe; }
    .card { background: #252526; border: 1px solid #333; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
    h2 { margin: 0 0 10px; color: #c586c0; font-size: 18px; }
    p { margin: 0 0 10px; line-height: 1.7; }
    pre { margin: 0; background: #1b1b1c; border-radius: 8px; padding: 12px 14px; overflow-x: auto; }
    code { font-family: Consolas, "Courier New", monospace; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${shownKeyword}</h1>
    <p class="tip">该关键字已支持文档跳转；当前显示的是内置通用文档模板。</p>
    <section class="card">
      <h2>用途</h2>
      <p>用于 vJass/JASS 语法结构中的关键语义节点。请结合上下文（函数、结构、模块、库）理解该关键字的作用域与执行时机。</p>
    </section>
    <section class="card">
      <h2>示例</h2>
      <pre><code>// 示例（按上下文调整）
library Demo initializer init
    private static method init takes nothing returns nothing
        // keyword: ${shownKeyword}
    endmethod
endlibrary</code></pre>
    </section>
    <section class="card">
      <h2>注意事项</h2>
      <p>1) 保持关键字与语法块成对出现（如 library/endlibrary、struct/endstruct）。</p>
      <p>2) 避免与标识符重名（如变量名、方法名）。</p>
      <p>3) 关注可见性（public/private）与静态语义（static）。</p>
    </section>
  </div>
</body>
</html>`;
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('JASS Extension is activating...');

    // 创建并初始化 DataEnterManager
    dataEnterManager = new DataEnterManager({
        ignoreConfig: false,
        debounceDelay: 300, // 减少防抖延迟，提高响应速度
        enableFileWatcher: true
    });

    // 初始化工作区（两阶段解析：先收集 textmacro，再解析文件）
    try {
        await dataEnterManager.initializeWorkspace();
        console.log('✅ DataEnterManager initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize DataEnterManager:', error);
        vscode.window.showErrorMessage('Failed to initialize JASS extension workspace');
    }

    // 初始化特殊文件管理器（在 DataEnterManager 初始化之后，确保 static 文件已加载）
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const workspaceRoot = workspaceFolder?.uri.fsPath;
        const specialFileManager = SpecialFileManager.getInstance();
        await specialFileManager.initialize(workspaceRoot);
        console.log('✅ SpecialFileManager initialized successfully');
        
        context.subscriptions.push({
            dispose: () => {
                specialFileManager.dispose();
            }
        });
    } catch (error) {
        console.error('❌ Failed to initialize SpecialFileManager:', error);
    }

    // ============================================================
    // 语言特性注册
    //
    // 语言特性分两类：
    //  1. 独占特性（nativeFeatureFactories）：可被 `jass.lsp` 接入的 exe 语言服务器接管。
    //     由 LspModeController 决定当前装「原生实现」还是让位给服务端，两者互斥，
    //     避免 VSCode 把两套结果合并（补全重复、hover 出现两段）。
    //  2. 常驻特性：在下方直接注册，与 LSP 模式无关。
    // ============================================================

    // dataEnterManager 已在上面完成初始化；取局部常量，便于在工厂闭包中安全使用
    const manager: DataEnterManager = dataEnterManager;

    // 触发字符：代码补全（引号、斜杠 + 所有字母数字与下划线、点号）
    const triggerChars = [
        "\"", "/", "\\",
        ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789_.".split("")
    ];
    // 触发字符：特殊文件（字符串/数值/路径等字面量）补全
    const specialCompletionTriggerChars = [
        '"', "'", ..."0123456789xbBX$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$".split("")
    ];
    // 触发字符：参数提示
    const signatureTriggerChars = [
        "(",
        ",",
        ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split("")
    ];

    // 按扩展名匹配的 Zinc 文件选择器
    const zincFileSelector = { scheme: 'file', pattern: '**/*.zn' };

    /**
     * 各语言特性的原生实现工厂。
     *
     * 约定：
     * - 工厂返回该特性对应的全部 disposable，调用即完成注册；
     * - 未列出的特性视为「没有原生等价物」（符号高亮、语义着色）；
     * - 每次模式切换都会重新调用工厂，因此内部不要持有跨次状态。
     */
    const nativeFeatureFactories: Partial<Record<JassFeatureId, () => vscode.Disposable[]>> = {
        // 代码补全：vJASS + 特殊文件字面量 + Zinc
        completion: () => {
            const completionProvider = new CompletionProvider(manager);
            const specialCompletionProvider = new SpecialCompletionProvider();
            const zincCompletionProvider = new ZincCompletionProvider(manager);
            return [
                vscode.languages.registerCompletionItemProvider(
                    jassSelector,
                    completionProvider,
                    ...triggerChars
                ),
                vscode.languages.registerCompletionItemProvider(
                    jassSelector,
                    specialCompletionProvider,
                    ...specialCompletionTriggerChars
                ),
                vscode.languages.registerCompletionItemProvider(
                    jassZincSelector,
                    zincCompletionProvider,
                    ...triggerChars
                )
            ];
        },

        // 参数提示：vJASS + Zinc
        signatureHelp: () => {
            const signatureHelpProvider = new SignatureHelpProvider(manager);
            const zincSignatureHelpProvider = new ZincSignatureHelpProvider(manager);
            return [
                vscode.languages.registerSignatureHelpProvider(
                    jassSelector,
                    signatureHelpProvider,
                    ...signatureTriggerChars
                ),
                vscode.languages.registerSignatureHelpProvider(
                    jassZincSelector,
                    zincSignatureHelpProvider,
                    ...signatureTriggerChars
                )
            ];
        },

        // 文档大纲：vJASS + Zinc
        documentSymbol: () => {
            const outlineProvider = new OutlineProvider(manager);
            const zincOutlineProvider = new ZincOutlineProvider(manager);
            return [
                vscode.languages.registerDocumentSymbolProvider(
                    jassSelector,
                    outlineProvider
                ),
                vscode.languages.registerDocumentSymbolProvider(
                    jassZincSelector,
                    zincOutlineProvider
                )
            ];
        },

        // 悬停提示：vJASS + 特殊文件 + Zinc
        hover: () => {
            const hoverProvider = new HoverProvider(manager);
            const specialHoverProvider = new SpecialHoverProvider();
            const zincHoverProvider = new ZincHoverProvider(manager);
            return [
                vscode.languages.registerHoverProvider(
                    jassSelector,
                    hoverProvider
                ),
                { dispose: () => hoverProvider.dispose() },
                vscode.languages.registerHoverProvider(
                    jassSelector,
                    specialHoverProvider
                ),
                vscode.languages.registerHoverProvider(
                    jassZincSelector,
                    zincHoverProvider
                ),
                { dispose: () => zincHoverProvider.dispose() }
            ];
        },

        // 跳转定义：vJASS + 特殊文件 + Zinc
        // （关键字文档跳转是独立开关 jass.keywordDefinition，属常驻特性，见下方）
        definition: () => {
            const definitionProvider = new DefinitionProvider(manager);
            const specialDefinitionProvider = new SpecialDefinitionProvider();
            const zincDefinitionProvider = new ZincDefinitionProvider(manager);
            return [
                vscode.languages.registerDefinitionProvider(
                    jassSelector,
                    definitionProvider
                ),
                vscode.languages.registerDefinitionProvider(
                    jassSelector,
                    specialDefinitionProvider
                ),
                vscode.languages.registerDefinitionProvider(
                    jassZincSelector,
                    zincDefinitionProvider
                )
            ];
        },

        /**
         * 内联提示（参数名/类型）：实验特性，由 `jass.hint` 控制，默认关闭。
         * 关闭时返回空数组，等价于「不注册」——同时保持注册表条目的语义。
         */
        inlayHints: () => {
            const hintEnabled = vscode.workspace
                .getConfiguration('jass')
                .get<boolean>('hint', false);
            if (!hintEnabled) {
                return [];
            }

            const inlayHintsProvider = new InlayHintsProvider(manager);
            const zincInlayHintsProvider = new ZincInlayHintsProvider(manager);
            return [
                vscode.languages.registerInlayHintsProvider(
                    jassSelector,
                    inlayHintsProvider
                ),
                vscode.languages.registerInlayHintsProvider(
                    zincFileSelector,
                    zincInlayHintsProvider
                ),
                { dispose: () => zincInlayHintsProvider.dispose() }
            ];
        },

        // 错误诊断：vJASS + Zinc
        diagnostics: () => {
            const diagnosticProvider = new DiagnosticProvider(manager);
            const zincDiagnosticProvider = new ZincDiagnosticProvider(manager);

            // jass.config.json 重新加载时同步诊断配置
            const onConfigReload = (): void => {
                const config = manager.getConfig();
                if (config?.diagnostics) {
                    diagnosticProvider.updateDiagnosticsConfig(config.diagnostics);
                }
            };
            manager.onConfigReload(onConfigReload);

            // 初始诊断配置
            const initialConfig = manager.getConfig();
            if (initialConfig?.diagnostics) {
                diagnosticProvider.updateDiagnosticsConfig(initialConfig.diagnostics);
            }

            return [
                diagnosticProvider.getDiagnosticCollection(),
                zincDiagnosticProvider.getDiagnosticCollection(),
                { dispose: () => manager.offConfigReload(onConfigReload) },
                { dispose: () => diagnosticProvider.dispose() },
                { dispose: () => zincDiagnosticProvider.dispose() }
            ];
        }
    };

    // ------------------------------------------------------------
    // LSP 模式控制器：`jass.lsp` 开启时，由 exe 的 `--lsp` 接管上表中的部分特性
    // ------------------------------------------------------------
    const lspModeController = new LspModeController({
        context,
        nativeFeatureFactories,
        documentSelector: LSP_DOCUMENT_SELECTOR
    });
    context.subscriptions.push({
        dispose: () => lspModeController.dispose()
    });

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            // 日志级别无需重启，直接下发给客户端
            if (e.affectsConfiguration('jass.lsp.trace.server')) {
                lspModeController.refreshTraceLevel();
            }
            // 开关或 exe 路径变化：整体重建特性归属
            // 注意 'jass.lsp' 会同时匹配 jass.lsp.* 子项，因此上面的 trace 分支先处理
            if (e.affectsConfiguration('jass.lsp')) {
                void lspModeController.apply();
            }
            // 内联提示的开关只影响原生实现，不涉及 LSP 归属
            if (e.affectsConfiguration('jass.hint')) {
                lspModeController.refreshNativeFeature('inlayHints');
            }
        })
    );

    // 按当前配置决定每个特性由谁负责
    await lspModeController.apply();

    // 关键字文档跳转（独立 Provider，由 jass.keywordDefinition 控制，默认关闭）
    const keywordDefinitionProvider = new KeywordDefinitionProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            jassSelector,
            keywordDefinitionProvider
        )
    );

    // 创建并注册 TypeDefinitionProvider（跳转到类型定义支持）
    const typeDefinitionProvider = new TypeDefinitionProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerTypeDefinitionProvider(
            jassSelector,
            typeDefinitionProvider
        )
    );

    // 创建并注册 ReferenceProvider（查找引用支持）
    const referenceProvider = new ReferenceProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            jassSelector,
            referenceProvider
        )
    );

    // 创建并注册 WorkspaceSymbolProvider（工作区符号搜索支持）
    const workspaceSymbolProvider = new WorkspaceSymbolProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerWorkspaceSymbolProvider(workspaceSymbolProvider)
    );

    // 创建并注册 ImplementationProvider（查找实现支持）
    const implementationProvider = new ImplementationProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerImplementationProvider(
            jassSelector,
            implementationProvider
        )
    );

    // 基于ast的格式化存在一下问题，因而保守使用之前的格式化方式
    // 创建并注册 FormattingProvider（vJass 代码格式化支持）
    const formattingProvider = new DocumentFormattingSortEditProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            jassSelector,
            formattingProvider
        )
    );

    // 创建并注册 ZincFormattingProvider（Zinc 代码格式化支持）
    // 使用文件扩展名选择器，支持 .zn 文件
    const zincFormattingProvider = new ZincFormattingProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            zincFileSelector,
            zincFormattingProvider
        )
    );
    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider(
            zincFileSelector,
            zincFormattingProvider
        )
    );

    // 创建并注册 JassDocumentColorProvider（颜色提供者支持）
    const documentColorProvider = new JassDocumentColorProvider();
    context.subscriptions.push(
        vscode.languages.registerColorProvider(
            jassSelector,
            documentColorProvider
        )
    );

    // 创建并注册 DocumentLinkProvider（文档链接支持，用于 #include 和 //! import）
    const documentLinkProvider = new DocumentLinkProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(
            jassSelector,
            documentLinkProvider
        )
    );

    // 创建并注册 CodeActionProvider（代码操作支持，用于接口方法未实现的快速修复）
    const codeActionProvider = new CodeActionProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            jassSelector,
            codeActionProvider,
            {
                providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
            }
        )
    );

    // 注册调试命令：查看缓存状态
    context.subscriptions.push(
        vscode.commands.registerCommand('jass.showCacheStats', () => {
            if (!dataEnterManager) {
                vscode.window.showErrorMessage('DataEnterManager is not initialized');
                return;
            }
            
            const stats = dataEnterManager.getCacheStats();
            const message = `📊 JASS Cache Statistics\n\n` +
                `Total Files: ${stats.totalFiles}\n` +
                `Immutable Files: ${stats.immutableFiles}\n\n` +
                `Cached Files:\n${stats.cachedFiles.map(f => `  - ${f}`).join('\n')}\n\n` +
                `Immutable Files:\n${stats.immutableFileList.map(f => `  - ${f}`).join('\n')}`;
            
            vscode.window.showInformationMessage(message, { modal: true });
            console.log('📊 Cache Stats:', stats);
        })
    );

    // 注册命令：跳转到替代符号（用于 @deprecated use XXX 的直达跳转）
    context.subscriptions.push(
        vscode.commands.registerCommand('jass.openReplacementSymbol', async (symbolName?: string) => {
            if (!symbolName || typeof symbolName !== 'string') {
                vscode.window.showWarningMessage('Replacement symbol is empty');
                return;
            }

            try {
                const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
                    'vscode.executeWorkspaceSymbolProvider',
                    symbolName
                ) || [];

                if (symbols.length === 0) {
                    vscode.window.showWarningMessage(`Replacement symbol '${symbolName}' not found in workspace`);
                    return;
                }

                const exact = symbols.find(s => s.name === symbolName)
                    || symbols.find(s => s.name.toLowerCase() === symbolName.toLowerCase())
                    || symbols[0];

                const doc = await vscode.workspace.openTextDocument(exact.location.uri);
                const editor = await vscode.window.showTextDocument(doc);
                editor.selection = new vscode.Selection(exact.location.range.start, exact.location.range.end);
                editor.revealRange(exact.location.range, vscode.TextEditorRevealType.InCenter);
            } catch (error) {
                console.error('Failed to open replacement symbol:', error);
                vscode.window.showErrorMessage(`Failed to navigate to replacement symbol '${symbolName}'`);
            }
        })
    );

    // 注册命令：重启语言服务器（实验性功能 jass.lsp）
    context.subscriptions.push(
        vscode.commands.registerCommand('jass.restartLspServer', async () => {
            const config = vscode.workspace.getConfiguration('jass');
            if (!config.get<boolean>('lsp', false)) {
                const choice = await vscode.window.showInformationMessage(
                    'jass.lsp 当前处于关闭状态，语言特性由扩展内置实现提供。是否开启并接入 ydwe-compiler 语言服务器？',
                    '开启',
                    '取消'
                );
                if (choice !== '开启') {
                    return;
                }
                // 写入后由配置变更监听触发重建，无需在这里再调一次 restart
                await config.update('lsp', true, vscode.ConfigurationTarget.Workspace);
                return;
            }

            await lspModeController.restart();
            vscode.window.showInformationMessage('JASS 语言服务器已重启。');
        })
    );

    // 注册命令：打开关键字文档 Webview（供 KeywordDefinitionProvider 在启用 jass.keywordDefinition 时调用）
    context.subscriptions.push(
        vscode.commands.registerCommand('jass.openKeywordDocWebview', async (docFileName?: string) => {
            await openKeywordDocWebview(context, docFileName);
        })
    );

    // 注册调试命令：测试 special 解析器（使用测试数据）
    context.subscriptions.push(
        vscode.commands.registerCommand('jass.testSpecialParsers', async () => {
            const { SpecialParserDebugger } = await import('./provider/special/special-parser-debug');
            
            vscode.window.showInformationMessage('Testing special parsers with sample data... Check output panel for results.');
            SpecialParserDebugger.testParsersWithSampleData();
            vscode.window.showInformationMessage('Special parser test completed! Check output panel for details.');
        })
    );

    // 注册调试命令：测试 special 解析器（从工作区文件）
    context.subscriptions.push(
        vscode.commands.registerCommand('jass.testSpecialParsersFromWorkspace', async () => {
            const { SpecialParserDebugger } = await import('./provider/special/special-parser-debug');
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            const workspaceRoot = workspaceFolder?.uri.fsPath;
            
            if (!workspaceRoot) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            vscode.window.showInformationMessage('Testing special parsers from workspace... Check output panel for results.');
            await SpecialParserDebugger.testParsers(workspaceRoot);
            vscode.window.showInformationMessage('Special parser test completed! Check output panel for details.');
        })
    );

    // 注册命令：创建 jass.config.json
    context.subscriptions.push(
        vscode.commands.registerCommand('jass.createConfigFile', async (uri?: vscode.Uri) => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            // 确定配置文件路径
            let configPath: string;
            if (uri && uri.scheme === 'file') {
                // 如果右键点击了文件夹，在该文件夹下创建
                const fsPath = uri.fsPath;
                const stats = await vscode.workspace.fs.stat(uri);
                if (stats.type === vscode.FileType.Directory) {
                    configPath = path.join(fsPath, 'jass.config.json');
                } else {
                    // 如果是文件，在文件所在目录创建
                    configPath = path.join(path.dirname(fsPath), 'jass.config.json');
                }
            } else {
                // 默认在工作区根目录创建
                configPath = path.join(workspaceFolder.uri.fsPath, 'jass.config.json');
            }

            // 检查文件是否已存在
            const configUri = vscode.Uri.file(configPath);
            try {
                await vscode.workspace.fs.stat(configUri);
                const overwrite = await vscode.window.showWarningMessage(
                    `jass.config.json already exists at ${path.relative(workspaceFolder.uri.fsPath, configPath)}. Overwrite?`,
                    'Yes',
                    'No'
                );
                if (overwrite !== 'Yes') {
                    return;
                }
            } catch {
                // 文件不存在，继续创建
            }

            // 创建默认配置内容
            const defaultConfig = {
                "excludes": [
                    "**/node_modules/**",
                    "**/.git/**",
                    "**/dist/**",
                    "**/build/**"
                ],
                "includes": [
                    "**/*.j",
                    "**/*.jass",
                    "**/*.ai",
                    "**/*.zn"
                ],
                "parsing": {
                    "enableTextMacro": true,
                    "enablePreprocessor": true,
                    "enableLuaBlocks": false,
                    "strictMode": false
                },
                "standardLibraries": {
                    "common.j": "./libs/common.j",
                    "common.ai": "./libs/common.ai",
                    "blizzard.j": "./libs/blizzard.j",
                    "DzAPI.j": "./libs/DzAPI.j",
                    "war3map.j": "./libs/war3map.j",
                    "AIScripts.ai": "./libs/AIScripts.ai",
                    "Cheats.j": "./libs/Cheats.j",
                    "InitCheats.j": "./libs/InitCheats.j"
                },
                "diagnostics": {
                    "enable": true,
                    "severity": {
                        "errors": "error",
                        "warnings": "warning"
                    },
                    "checkTypes": true,
                    "checkUndefined": true,
                    "checkUnused": false,
                    "checkArrayBounds": true,
                    "checkHandleLeaks": true
                }
            };

            // 写入文件
            const content = JSON.stringify(defaultConfig, null, 4);
            fs.writeFileSync(configPath, content, 'utf-8');

            // 打开文件
            const document = await vscode.workspace.openTextDocument(configUri);
            await vscode.window.showTextDocument(document);

            vscode.window.showInformationMessage(`Created jass.config.json at ${path.relative(workspaceFolder.uri.fsPath, configPath)}`);
            
            // 如果 DataEnterManager 已初始化，重新加载配置
            // 配置重新加载会自动触发回调更新诊断提供者
            if (dataEnterManager) {
                dataEnterManager.reloadConfig();
            }
        })
    );


    // 将 DataEnterManager 与 DocumentInfoManager 的清理添加到订阅中，以便在扩展停用时释放资源
    context.subscriptions.push({
        dispose: () => {
            if (dataEnterManager) {
                dataEnterManager.dispose();
                dataEnterManager = undefined;
            }
            DocumentInfoManager.resetInstance();
        }
    });

    // 每次打开编辑器温和提示一次（受冷却策略控制），避免强打断用户
    setTimeout(() => {
        showSupportPrompt(context).catch((error) => {
            console.error('Failed to show support prompt:', error);
        });
    }, 2800);

    console.log('✅ JASS Extension activated successfully');
}

export function deactivate() {
    // 清理资源
    if (dataEnterManager) {
        dataEnterManager.dispose();
        dataEnterManager = undefined;
    }
    // 引用计数：强制清理并重置单例，确保下次激活时状态干净
    DocumentInfoManager.resetInstance();
    console.log('JASS Extension deactivated');
}
