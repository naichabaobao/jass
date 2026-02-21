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

// JASS 语言选择器
const jassSelector = { scheme: 'file', language: 'jass' };
const jassZincSelector = { scheme: 'file', language: 'jass-zinc' };

// 全局 DataEnterManager 实例
let dataEnterManager: DataEnterManager | undefined;

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
                    "checkArrayBounds": true
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

    // 将 DataEnterManager 的 dispose 方法添加到订阅中，以便在扩展停用时清理资源
    context.subscriptions.push({
        dispose: () => {
            if (dataEnterManager) {
                dataEnterManager.dispose();
                dataEnterManager = undefined;
            }
        }
    });

    console.log('✅ JASS Extension activated successfully');
}

export function deactivate() {
    // 清理资源
    if (dataEnterManager) {
        dataEnterManager.dispose();
        dataEnterManager = undefined;
    }
    console.log('JASS Extension deactivated');
}