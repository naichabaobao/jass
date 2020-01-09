import * as vscode from 'vscode';

export const isVjassEnable:boolean = vscode.workspace.getConfiguration().get("jass.vjass.enable") ?? true;