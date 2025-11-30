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
import { DataEnterManager } from './boot/provider-new/data-enter';

// JASS 语言选择器
const jassSelector = { scheme: 'file', language: 'jass' };

// 全局 DataEnterManager 实例
let dataEnterManager: DataEnterManager | undefined;

export async function activate(context: vscode.ExtensionContext) {
    console.log('JASS Extension is activating...');

    // 创建并初始化 DataEnterManager
    dataEnterManager = new DataEnterManager({
        ignoreConfig: false,
        debounceDelay: 300,
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

    // 创建并注册 OutlineProvider（文档大纲支持）
    const outlineProvider = new OutlineProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            jassSelector,
            outlineProvider
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

    // 创建并注册 DefinitionProvider（跳转到定义支持）
    const definitionProvider = new DefinitionProvider(dataEnterManager);
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            jassSelector,
            definitionProvider
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