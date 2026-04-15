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

// JASS 语言选择器
const jassSelector = { scheme: 'file', language: 'jass' };
const jassZincSelector = { scheme: 'file', language: 'jass-zinc' };

// 全局 DataEnterManager 实例
let dataEnterManager: DataEnterManager | undefined;

const SUPPORT_PROMPT_SNOOZE_UNTIL_KEY = 'supportPrompt.snoozeUntil';
const SUPPORT_PROMPT_RETRY_UNTIL_KEY = 'supportPrompt.retryUntil';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HALF_DAY_MS = 12 * 60 * 60 * 1000;

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
      <p class="desc">你的支持会用于持续维护、修复问题和更新文档。完全自愿，不影响功能使用。</p>
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
    const retryUntil = context.globalState.get<number>(SUPPORT_PROMPT_RETRY_UNTIL_KEY, 0);
    if (now < snoozeUntil || now < retryUntil) {
        return;
    }

    const choice = await vscode.window.showInformationMessage(
        '如果这个扩展帮到了你，欢迎支持作者持续维护 ❤️（温馨提示）',
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
        // 点开支持页后，给半天冷静期，避免过于频繁
        await context.globalState.update(SUPPORT_PROMPT_RETRY_UNTIL_KEY, now + HALF_DAY_MS);
        return;
    }

    if (choice === '不再提示') {
        // 按产品策略：这里不是永久不提示，而是冷却 7 天
        await context.globalState.update(SUPPORT_PROMPT_SNOOZE_UNTIL_KEY, now + WEEK_MS);
        await context.globalState.update(SUPPORT_PROMPT_RETRY_UNTIL_KEY, 0);
        return;
    }

    if (choice === '稍后提醒') {
        // 稍后提醒：半天后再提醒
        await context.globalState.update(SUPPORT_PROMPT_RETRY_UNTIL_KEY, now + HALF_DAY_MS);
        return;
    }

    if (choice === '狠心拒绝') {
        // 狠心拒绝：这次不处理，下次打开继续提醒
        await context.globalState.update(SUPPORT_PROMPT_RETRY_UNTIL_KEY, 0);
    }
}

async function openKeywordDocWebview(context: vscode.ExtensionContext, docFileName?: string): Promise<void> {
    if (!docFileName || typeof docFileName !== 'string') {
        vscode.window.showWarningMessage('Keyword document is empty');
        return;
    }

    const safeName = path.basename(docFileName);
    const htmlPath = path.join(context.extensionPath, 'static', 'html', safeName);
    if (!fs.existsSync(htmlPath)) {
        vscode.window.showWarningMessage(`Keyword doc not found: ${safeName}`);
        return;
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const enhancedHtmlContent = enhanceKeywordDocHtml(htmlContent);
    const panel = vscode.window.createWebviewPanel(
        'jassKeywordDoc',
        `JASS Keyword: ${safeName.replace('.html', '')}`,
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
    'takes','returns','extends','array','elseif','endif','then','loop','return','globals','if','else','and','or','not'
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
    const lines = raw.split('\\n');
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
    }).join('\\n');
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

    // 创建 CompletionProvider（需要传入 DataEnterManager）
    const completionProvider = new CompletionProvider(dataEnterManager);

    // 注册代码补全提供者
    // 触发字符包括引号、斜杠等，以及所有字母数字字符
    const triggerChars = [
        "\"", "/", "\\",
        ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789_.".split("")
    ];
    
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            jassSelector,
            completionProvider,
            ...triggerChars
        )
    );

    // 创建并注册特殊文件补全提供者
    const specialCompletionProvider = new SpecialCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            jassSelector,
            specialCompletionProvider,
            '"', "'", ..."0123456789xbBX$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$".split("")
        )
    );

    // 创建并注册 ZincCompletionProvider（Zinc 文件专用补全提供者）
    const zincCompletionProvider = new ZincCompletionProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            jassSelector,
            zincCompletionProvider,
            ...triggerChars
        )
    );

    // 创建并注册 SignatureHelpProvider（参数提示支持）
    const signatureHelpProvider = new SignatureHelpProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            jassSelector,
            signatureHelpProvider,
            "(",
            ",",
            ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split("")
        )
    );

    // 创建并注册 ZincSignatureHelpProvider（Zinc 文件专用参数提示支持）
    const zincSignatureHelpProvider = new ZincSignatureHelpProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            jassSelector,
            zincSignatureHelpProvider,
            "(",
            ",",
            ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split("")
        )
    );

    // 创建并注册 OutlineProvider（文档大纲支持）
    const outlineProvider = new OutlineProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            jassSelector,
            outlineProvider
        )
    );

    // 创建并注册 ZincOutlineProvider（Zinc 文件专用文档大纲支持）
    const zincOutlineProvider = new ZincOutlineProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            jassSelector,
            zincOutlineProvider
        )
    );

    // 创建并注册 HoverProvider（悬停信息支持）
    const hoverProvider = new HoverProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            jassSelector,
            hoverProvider
        )
    );
    context.subscriptions.push({
        dispose: () => {
            hoverProvider.dispose();
        }
    });

    // 创建并注册特殊文件悬停提供者
    const specialHoverProvider = new SpecialHoverProvider();
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            jassSelector,
            specialHoverProvider
        )
    );

    // 创建并注册 ZincHoverProvider（Zinc 文件专用悬停信息支持）
    const zincHoverProvider = new ZincHoverProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            jassSelector,
            zincHoverProvider
        )
    );
    context.subscriptions.push({
        dispose: () => {
            zincHoverProvider.dispose();
        }
    });

    // 创建并注册 DefinitionProvider（跳转到定义支持）
    const definitionProvider = new DefinitionProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            jassSelector,
            definitionProvider
        )
    );

    // 创建并注册特殊文件定义提供者
    const specialDefinitionProvider = new SpecialDefinitionProvider();
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            jassSelector,
            specialDefinitionProvider
        )
    );

    // 创建并注册 ZincDefinitionProvider（Zinc 文件专用定义提供者）
    const zincDefinitionProvider = new ZincDefinitionProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            jassSelector,
            zincDefinitionProvider
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

    // 创建并注册 InlayHintsProvider（参数类型提示支持）
    // 这是一个测试特性，默认不开启，需要通过配置 jass.hint 启用
    let inlayHintsProvider: InlayHintsProvider | undefined;
    let zincInlayHintsProvider: ZincInlayHintsProvider | undefined;
    let inlayHintsDisposables: vscode.Disposable[] = [];

    // 注册或注销 hint 提供者的函数
    const updateHintProviders = () => {
        const config = vscode.workspace.getConfiguration('jass');
        const hintEnabled = config.get<boolean>('hint', false);

        // 先清理现有的注册
        inlayHintsDisposables.forEach(d => d.dispose());
        inlayHintsDisposables = [];

        if (hintEnabled && dataEnterManager) {
            // 创建并注册 InlayHintsProvider（vJASS）
            inlayHintsProvider = new InlayHintsProvider(dataEnterManager);
            inlayHintsDisposables.push(
                vscode.languages.registerInlayHintsProvider(
                    jassSelector,
                    inlayHintsProvider
                )
            );

            // 创建并注册 ZincInlayHintsProvider（Zinc 文件专用类型提示支持）
            zincInlayHintsProvider = new ZincInlayHintsProvider(dataEnterManager);
            inlayHintsDisposables.push(
                vscode.languages.registerInlayHintsProvider(
                    { scheme: 'file', pattern: '**/*.zn' },
                    zincInlayHintsProvider
                )
            );
            inlayHintsDisposables.push({
                dispose: () => {
                    zincInlayHintsProvider?.dispose();
                }
            });
        } else {
            // 如果禁用，清理提供者实例
            if (inlayHintsProvider) {
                inlayHintsProvider = undefined;
            }
            if (zincInlayHintsProvider) {
                zincInlayHintsProvider.dispose();
                zincInlayHintsProvider = undefined;
            }
        }
    };

    // 初始化 hint 提供者（根据配置）
    updateHintProviders();

    // 监听配置变化，动态更新 hint 提供者
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('jass.hint')) {
                updateHintProviders();
            }
        })
    );

    // 将 hint 相关的 disposable 添加到订阅中
    context.subscriptions.push({
        dispose: () => {
            inlayHintsDisposables.forEach(d => d.dispose());
            if (zincInlayHintsProvider) {
                zincInlayHintsProvider.dispose();
            }
        }
    });

    // 创建并注册 DiagnosticProvider（语法错误和警告提示支持）
    const diagnosticProvider = new DiagnosticProvider(dataEnterManager);
    context.subscriptions.push(diagnosticProvider.getDiagnosticCollection());
    
    // 监听配置重新加载，更新诊断提供者
    if (dataEnterManager) {
        dataEnterManager.onConfigReload(() => {
            const config = dataEnterManager?.getConfig();
            if (config?.diagnostics) {
                diagnosticProvider.updateDiagnosticsConfig(config.diagnostics);
            }
        });
        
        // 初始化诊断配置
        const initialConfig = dataEnterManager.getConfig();
        if (initialConfig?.diagnostics) {
            diagnosticProvider.updateDiagnosticsConfig(initialConfig.diagnostics);
        }
    }
    
    context.subscriptions.push({
        dispose: () => {
            diagnosticProvider.dispose();
        }
    });

    // 创建并注册 ZincDiagnosticProvider（Zinc 文件专用诊断支持）
    const zincDiagnosticProvider = new ZincDiagnosticProvider(dataEnterManager);
    context.subscriptions.push(zincDiagnosticProvider.getDiagnosticCollection());
    context.subscriptions.push({
        dispose: () => {
            zincDiagnosticProvider.dispose();
        }
    });

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
    const zincFileSelector = { scheme: 'file', pattern: '**/*.zn' };
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

    // 注册命令：打开关键字文档 Webview（供 DefinitionProvider 调用）
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
                    "blizzard.j": "./libs/blizzard.j"
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