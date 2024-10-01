import * as vscode from 'vscode';

import {boot} from "./boot/boot";



export async function activate(context: vscode.ExtensionContext) {
    // // 注册一个命令处理程序
    // context.subscriptions.push(vscode.commands.registerCommand('extension.showMessage', (message) => {
    //     vscode.window.showInformationMessage(message);
    // }));

    // context.subscriptions.push(vscode.languages.registerCodeLensProvider('javascript', {
    //     provideCodeLenses(document) {
    //         const text = document.getText();
    //         const range = document.lineAt(0).range;

    //         // 创建一个代码线命令，当点击时会显示一个提示信息
    //         const command = {
    //             title: "点击我3",
    //             command : 'extension.showMessage',
    //             // tooltip = ['你点击了代码线命令!']
    //             arguments : ['你点击了代码线命令!']
    //           };

    //         // 创建代码线并返回
    //         return [new vscode.CodeLens(range, command)];
    //     }
    // }));
    await boot();
}

export function deactivate() {}

