import("./boot/provider/data-enter");
import * as vscode from 'vscode';

import { AutoCompletionProvider, IncludeCompletionItemProvider, SpecialCompletionItemProvider } from './boot/provider/auto-completion-provider';
import { AutoHoverProvider, SpecialHoverProvider } from "./boot/provider/auto-hover-provider";
import { NewDefinitionProvider, TypeDefinitionProvider, SpecialDefinitionProvider, IncludeDefinitionProvider } from "./boot/provider/definition-provider-ex";
import { JassDocumentColorProvider } from "./boot/provider/document-color-provider";
import { JassDiagnosticProvider } from "./boot/provider/diagnostic-provider";
import { DocumentSymbolProvider } from "./boot/provider/outline-provider";
import { SignatureHelpProvider } from './boot/provider/signature-help-provider-ex';
import { JassCodeActionsProvider } from './boot/provider/code-actions-provider';
import { DocumentFormattingSortEditProvider, TypeFormatProvider } from './boot/provider/document-formatting-edit-provider';

export async function activate(context: vscode.ExtensionContext) {
    // 注册补全提供器
    const jassSelector = { scheme: 'file', language: 'jass' };
    
    // JASS 提供者注册
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(jassSelector, new IncludeCompletionItemProvider(), "\"", "/", "\\"));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(jassSelector, new SpecialCompletionItemProvider(), "\"", "'"));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(jassSelector, new AutoCompletionProvider(), ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789_.".split("")));
    context.subscriptions.push(vscode.languages.registerHoverProvider(jassSelector, new AutoHoverProvider()));
    context.subscriptions.push(vscode.languages.registerHoverProvider(jassSelector, new SpecialHoverProvider()));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(jassSelector, new IncludeDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(jassSelector, new NewDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(jassSelector, new SpecialDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerTypeDefinitionProvider(jassSelector, new TypeDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerColorProvider(jassSelector, new JassDocumentColorProvider()));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(jassSelector, new DocumentSymbolProvider()));
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(jassSelector, new SignatureHelpProvider(), "(", ",", ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split("")));
    // 注册代码操作提供者
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
        jassSelector, 
        new JassCodeActionsProvider(),
        {
            providedCodeActionKinds: [
                vscode.CodeActionKind.QuickFix,
                vscode.CodeActionKind.Refactor,
                vscode.CodeActionKind.RefactorExtract,
                vscode.CodeActionKind.Source
            ]
        }
    ));

    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(jassSelector, new DocumentFormattingSortEditProvider()));
    context.subscriptions.push(vscode.languages.registerOnTypeFormattingEditProvider(jassSelector, new TypeFormatProvider(), ')', ',', '+', '-', '*', '/', '>', '<', '=', '(', '[', ']',));


    // 创建并初始化诊断提供者
    const diagnosticProvider = new JassDiagnosticProvider();
    diagnosticProvider.initialize();
    context.subscriptions.push(diagnosticProvider.getDiagnosticCollection());

    console.log('WaveProvider initialized');
    console.log('ColorProvider initialized');
    console.log('DiagnosticProvider initialized');
    console.log('DocumentSymbolProvider initialized');
    console.log('GlobalsProvider initialized');
    console.log('CodeLensProvider initialized');
    console.log('DocumentSemanticTokensProvider initialized');
    console.log('CodeActionsProvider initialized');
    console.log('TestProvider initialized');
}

export function deactivate() {
    
}

