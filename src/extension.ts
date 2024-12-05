import * as vscode from 'vscode';

import "./boot/boot";
import { releace_diagnosticor } from './boot/provider/diagnostic-provider';



export async function activate(context: vscode.ExtensionContext) {

}

export function deactivate() {
    releace_diagnosticor();
}

