import("./boot/provider-new/data-enter");
import * as vscode from 'vscode';
import * as path from 'path';

import { CompletionProvider } from './boot/provider-new/completion-provider';
import { SignatureHelpProvider } from './boot/provider-new/signature-help-provider';
import { OutlineProvider } from './boot/provider-new/outline-provider';
import { HoverProvider } from './boot/provider-new/hover-provider';
import { DefinitionProvider } from './boot/provider-new/definition-provider';
import { TypeDefinitionProvider } from './boot/provider-new/type-definition-provider';
import { ReferenceProvider } from './boot/provider-new/reference-provider';
import { InlayHintsProvider } from './boot/provider-new/inlay-hints-provider';
import { DiagnosticProvider } from './boot/provider-new/diagnostic-provider';
import { ZincCompletionProvider } from './boot/provider-new/zinc/zinc-completion-provider';
import { ZincDefinitionProvider } from './boot/provider-new/zinc/zinc-definition-provider';
import { ZincHoverProvider } from './boot/provider-new/zinc/zinc-hover-provider';
import { ZincSignatureHelpProvider } from './boot/provider-new/zinc/zinc-signature-help-provider';
import { ZincOutlineProvider } from './boot/provider-new/zinc/zinc-outline-provider';
import { ZincDiagnosticProvider } from './boot/provider-new/zinc/zinc-diagnostic-provider';
import { FormattingProvider } from './boot/provider-new/formatting-provider';
import { ZincFormattingProvider } from './boot/provider-new/zinc/zinc-formatting-provider';
import { DataEnterManager } from './boot/provider-new/data-enter';

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

    // 创建并注册 InlayHintsProvider（参数类型提示支持）
    const inlayHintsProvider = new InlayHintsProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerInlayHintsProvider(
            jassSelector,
            inlayHintsProvider
        )
    );

    // 创建并注册 DiagnosticProvider（语法错误和警告提示支持）
    const diagnosticProvider = new DiagnosticProvider(dataEnterManager);
    context.subscriptions.push(diagnosticProvider.getDiagnosticCollection());
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

    // 创建并注册 FormattingProvider（vJass 代码格式化支持）
    const formattingProvider = new FormattingProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            jassSelector,
            formattingProvider
        )
    );
    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider(
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