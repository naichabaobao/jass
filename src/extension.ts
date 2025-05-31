import * as vscode from 'vscode';

import "./boot/boot";
import { releace_diagnosticor } from './boot/provider/diagnostic-provider';
import { WaveProvider } from './boot/provider/wave-provider';
import { GlobalsProvider } from './boot/provider/jass/globals-provider';

let globalsProvider: GlobalsProvider;

export async function activate(context: vscode.ExtensionContext) {
    // 初始化 WaveProvider
    const waveProvider = new WaveProvider();
    waveProvider.activate(context);
    
    // 初始化 GlobalsProvider
    globalsProvider = new GlobalsProvider();
    
    // 注册文档变化事件
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            globalsProvider.updateDiagnostics(event.document);
        })
    );
    
    // 注册文档打开事件
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            globalsProvider.updateDiagnostics(document);
        })
    );
    
    console.log('WaveProvider initialized');
    console.log('GlobalsProvider initialized');
}

export function deactivate() {
    releace_diagnosticor();
    globalsProvider?.dispose();
}

