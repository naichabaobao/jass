import("./provider/data-enter-manager");
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

import("./provider/data-enter-manager");
import { CompletionProvider } from './provider/completion-provider';
import { SignatureHelpProvider } from './provider/signature-help-provider';
import { OutlineProvider } from './provider/outline-provider';
import { HoverProvider } from './provider/hover-provider';
import { DefinitionProvider } from './provider/definition-provider';
import { KeywordDefinitionProvider } from './provider/keyword-definition-provider';
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

// JASS 语言选择器（同时支持已保存的 file 和未保存的 untitled 两种 scheme）
const jassSelector: vscode.DocumentSelector = [
    { scheme: 'file', language: 'jass' },
    { scheme: 'untitled', language: 'jass' }
];
const jassZincSelector: vscode.DocumentSelector = [
    { scheme: 'file', language: 'jass-zinc' },
    { scheme: 'untitled', language: 'jass-zinc' }
];

// 全局 DataEnterManager 实例
let dataEnterManager: DataEnterManager | undefined;

const SUPPORT_PROMPT_SNOOZE_UNTIL_KEY = 'supportPrompt.snoozeUntil';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;