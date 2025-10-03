import("./boot/provider/data-enter");
import * as vscode from 'vscode';

// import "./boot/boot";
// import { releace_diagnosticor } from './boot/provider/diagnostic-provider';
// import { WaveProvider } from './boot/provider/wave-provider';
// import { GlobalsProvider } from './boot/provider/jass/globals-provider';
// import { CodeLensProvider } from './boot/provider/code-lens-provider';
// import { ReferenceProvider } from './boot/provider/reference-provider';
// import { DocumentSemanticTokensProvider } from './boot/provider/document-semantic-tokens-provider';
import { StructCompletionItemProvider } from "./boot/provider/completion-provider";
// let globalsProvider: GlobalsProvider;

export async function activate(context: vscode.ExtensionContext) {
    // 初始化 WaveProvider
    // const waveProvider = new WaveProvider();
    // waveProvider.activate(context);
    
    // // 初始化 GlobalsProvider
    // globalsProvider = new GlobalsProvider();
    
    // // 注册 CodeLens 提供器
    // context.subscriptions.push(
    //     vscode.languages.registerCodeLensProvider(
    //         { scheme: 'file', language: 'jass' },
    //         new CodeLensProvider()
    //     )
    // );
    
    // // 注册文档变化事件
    // context.subscriptions.push(
    //     vscode.workspace.onDidChangeTextDocument(event => {
    //         globalsProvider.updateDiagnostics(event.document);
    //     })
    // );
    
    // // 注册文档打开事件
    // context.subscriptions.push(
    //     vscode.workspace.onDidOpenTextDocument(document => {
    //         globalsProvider.updateDiagnostics(document);
    //     })
    // );

    // // 注册引用提供器
    // const referenceProvider = new ReferenceProvider();
    // context.subscriptions.push(
    //     vscode.languages.registerReferenceProvider(
    //         { scheme: 'file', language: 'jass' },
    //         referenceProvider
    //     )
    // );

    // 注册结构体提示提供器
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider("jass", new StructCompletionItemProvider(), ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""))
    );

    // 注册语义标记提供器
    const legend = new vscode.SemanticTokensLegend([
        "namespace",
        "class",
        "enum",
        "interface",
        "struct",
        "typeParameter",
        "type",
        "parameter",
        "variable",
        "property",
        "enumMember",
        "decorator",
        "event",
        "function",
        "method",
        "macro",
        "label",
        "comment",
        "string",
        "keyword",
        "number",
        "regexp",
        "operator",
    ], [
        "declaration",
        "definition",
        "readonly",
        "static",
        "deprecated",
        "abstract",
        "async",
        "modification",
        "documentation",
        "defaultLibrary"
    ]);

    // context.subscriptions.push(
    //     vscode.languages.registerDocumentSemanticTokensProvider(
    //         { scheme: 'file', language: 'jass' },
    //         new DocumentSemanticTokensProvider(),
    //         legend
    //     )
    // );
    
    console.log('WaveProvider initialized');
    console.log('GlobalsProvider initialized');
    console.log('CodeLensProvider initialized');
    console.log('DocumentSemanticTokensProvider initialized');
}

export function deactivate() {
    // releace_diagnosticor();
    // globalsProvider?.dispose();
}

