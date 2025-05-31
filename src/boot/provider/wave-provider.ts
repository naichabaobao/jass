import * as vscode from 'vscode';
import { WaveMacro, replace_wave_macro } from '../jass/wave-macro';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 宏提供器类，提供各种宏相关的功能
 */
export class WaveProvider {
    private macros: Map<string, WaveMacro[]> = new Map();
    private documentMacros: Map<string, WaveMacro[]> = new Map();
    private includePaths: string[] = [];
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('wave-macro');
    }

    /**
     * 创建诊断集合
     */
    private createDiagnosticCollection(): vscode.DiagnosticCollection {
        const collection = vscode.languages.createDiagnosticCollection('wave-macro');
        
        // 监听文档变化
        vscode.workspace.onDidChangeTextDocument(event => {
            this.updateDiagnostics(event.document, collection);
        });

        // 监听文档打开
        vscode.workspace.onDidOpenTextDocument(document => {
            this.updateDiagnostics(document, collection);
        });

        // 监听文档关闭
        vscode.workspace.onDidCloseTextDocument(document => {
            collection.delete(document.uri);
        });

        return collection;
    }

    /**
     * 更新诊断信息
     */
    private updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
        const result = replace_wave_macro(document.getText());
        const diagnostics: vscode.Diagnostic[] = [];

        // 处理宏错误
        for (const error of result.errors) {
            diagnostics.push(
                new vscode.Diagnostic(
                    new vscode.Range(
                        error.line - 1,
                        error.column,
                        error.line - 1,
                        error.column + 1
                    ),
                    error.message,
                    vscode.DiagnosticSeverity.Error
                )
            );
        }

        // 检查未闭合的条件编译块
        const unclosedMacros = this.findUnclosedMacros(result.macros);
        for (const macro of unclosedMacros) {
            diagnostics.push(
                new vscode.Diagnostic(
                    new vscode.Range(
                        macro.lineNumber - 1,
                        macro.startColumn,
                        macro.lineNumber - 1,
                        macro.endColumn
                    ),
                    `Unclosed ${macro.type} block`,
                    vscode.DiagnosticSeverity.Error
                )
            );
        }

        // 检查重复的宏定义
        const duplicateMacros = this.findDuplicateMacros(result.macros);
        for (const macro of duplicateMacros) {
            diagnostics.push(
                new vscode.Diagnostic(
                    new vscode.Range(
                        macro.lineNumber - 1,
                        macro.startColumn,
                        macro.lineNumber - 1,
                        macro.endColumn
                    ),
                    `Duplicate macro definition: ${macro.getName()}`,
                    vscode.DiagnosticSeverity.Warning
                )
            );
        }

        // 检查未使用的宏
        const unusedMacros = this.findUnusedMacros(result.macros);
        for (const macro of unusedMacros) {
            diagnostics.push(
                new vscode.Diagnostic(
                    new vscode.Range(
                        macro.lineNumber - 1,
                        macro.startColumn,
                        macro.lineNumber - 1,
                        macro.endColumn
                    ),
                    `Unused macro: ${macro.getName()}`,
                    vscode.DiagnosticSeverity.Information
                )
            );
        }

        // 更新诊断集合
        collection.set(document.uri, diagnostics);
    }

    /**
     * 查找未闭合的条件编译块
     */
    private findUnclosedMacros(macros: WaveMacro[]): WaveMacro[] {
        const unclosed: WaveMacro[] = [];
        const stack: WaveMacro[] = [];

        for (const macro of macros) {
            if (macro.type === 'if' || macro.type === 'ifdef' || macro.type === 'ifndef') {
                stack.push(macro);
            } else if (macro.type === 'endif') {
                if (stack.length > 0) {
                    stack.pop();
                } else {
                    unclosed.push(macro);
                }
            }
        }

        // 将未闭合的宏添加到结果中
        unclosed.push(...stack);
        return unclosed;
    }

    /**
     * 查找重复的宏定义
     */
    private findDuplicateMacros(macros: WaveMacro[]): WaveMacro[] {
        const duplicates: WaveMacro[] = [];
        const definedMacros = new Map<string, WaveMacro>();

        for (const macro of macros) {
            if (macro.type === 'define') {
                const name = macro.getName();
                if (definedMacros.has(name)) {
                    duplicates.push(macro);
                } else {
                    definedMacros.set(name, macro);
                }
            }
        }

        return duplicates;
    }

    /**
     * 查找未使用的宏
     */
    private findUnusedMacros(macros: WaveMacro[]): WaveMacro[] {
        const unused: WaveMacro[] = [];
        const definedMacros = new Map<string, WaveMacro>();
        const usedMacros = new Set<string>();

        // 收集所有定义的宏
        for (const macro of macros) {
            if (macro.type === 'define') {
                definedMacros.set(macro.getName(), macro);
            }
        }

        // 检查宏的使用
        for (const macro of macros) {
            // 检查宏值中的使用
            if (macro.type === 'define') {
                const value = macro.getValue();
                const params = macro.getParameters();
                
                // 检查宏值中是否使用了其他宏
                for (const [name, definedMacro] of definedMacros) {
                    // 跳过自身
                    if (name === macro.getName()) continue;
                    
                    // 检查宏值中是否包含宏名（作为完整标识符）
                    const regex = new RegExp(`\\b${name}\\b`, 'g');
                    if (regex.test(value)) {
                        usedMacros.add(name);
                    }
                }

                // 检查参数中是否使用了其他宏
                for (const param of params) {
                    for (const [name, definedMacro] of definedMacros) {
                        // 跳过自身
                        if (name === macro.getName()) continue;
                        
                        // 检查参数中是否包含宏名（作为完整标识符）
                        const regex = new RegExp(`\\b${name}\\b`, 'g');
                        if (regex.test(param)) {
                            usedMacros.add(name);
                        }
                    }
                }
            }

            // 检查条件编译指令中的使用
            if (macro.type === 'if' || macro.type === 'ifdef' || macro.type === 'ifndef' || 
                macro.type === 'elif') {
                const condition = macro.content.substring(macro.content.indexOf(macro.type) + macro.type.length).trim();
                for (const [name, definedMacro] of definedMacros) {
                    // 检查条件中是否包含宏名（作为完整标识符）
                    const regex = new RegExp(`\\b${name}\\b`, 'g');
                    if (regex.test(condition)) {
                        usedMacros.add(name);
                    }
                }
            }
        }

        // 检查所有打开的文档中的宏使用
        const documents = vscode.workspace.textDocuments;
        for (const doc of documents) {
            const text = doc.getText();
            for (const [name, definedMacro] of definedMacros) {
                // 检查文档中是否包含宏名（作为完整标识符）
                const regex = new RegExp(`\\b${name}\\b`, 'g');
                if (regex.test(text)) {
                    usedMacros.add(name);
                }
            }
        }

        // 找出未使用的宏
        for (const [name, macro] of definedMacros) {
            if (!usedMacros.has(name)) {
                unused.push(macro);
            }
        }

        return unused;
    }

    /**
     * 激活提供器
     */
    public activate(context: vscode.ExtensionContext) {
        // 创建诊断集合
        const diagnosticCollection = this.createDiagnosticCollection();
        context.subscriptions.push(diagnosticCollection);

        // 注册各种功能
        context.subscriptions.push(
            // 宏提示
            vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: 'jass' },
                this.createCompletionProvider(),
                '#'
            ),

            // 跳转定义
            vscode.languages.registerDefinitionProvider(
                { scheme: 'file', language: 'jass' },
                this.createDefinitionProvider()
            ),

            // 类型定义
            vscode.languages.registerTypeDefinitionProvider(
                { scheme: 'file', language: 'jass' },
                this.createTypeDefinitionProvider()
            ),

            // 实现
            vscode.languages.registerImplementationProvider(
                { scheme: 'file', language: 'jass' },
                this.createImplementationProvider()
            ),

            // 悬停提示
            vscode.languages.registerHoverProvider(
                { scheme: 'file' },
                this.createHoverProvider()
            ),

            // 代码折叠
            vscode.languages.registerFoldingRangeProvider(
                { scheme: 'file', language: 'jass' },
                this.createFoldingProvider()
            ),

            // 大纲视图
            vscode.languages.registerDocumentSymbolProvider(
                { scheme: 'file', language: 'jass' },
                this.createSymbolProvider()
            ),

            // 参数提示
            vscode.languages.registerSignatureHelpProvider(
                { scheme: 'file', language: 'jass' },
                this.createSignatureHelpProvider(),
                '(', ","
            ),

            // 文档格式化
            vscode.languages.registerDocumentFormattingEditProvider(
                { scheme: 'file', language: 'jass' },
                this.createDocumentFormattingProvider()
            ),

            // 选择范围格式化
            vscode.languages.registerDocumentRangeFormattingEditProvider(
                { scheme: 'file', language: 'jass' },
                this.createDocumentRangeFormattingProvider()
            ),

            // 输入时格式化
            vscode.languages.registerOnTypeFormattingEditProvider(
                { scheme: 'file', language: 'jass' },
                this.createOnTypeFormattingProvider(),
                ';', '}', '\n'
            ),

            // 引用查找
            vscode.languages.registerReferenceProvider(
                { scheme: 'file', language: 'jass' },
                this.createReferenceProvider()
            ),

            // 重命名
            vscode.languages.registerRenameProvider(
                { scheme: 'file', language: 'jass' },
                this.createRenameProvider()
            ),

            // CodeLens
            vscode.languages.registerCodeLensProvider(
                { scheme: 'file', language: 'jass' },
                this.createCodeLensProvider()
            ),

            // Code Actions
            vscode.languages.registerCodeActionsProvider(
                { scheme: 'file', language: 'jass' },
                this.createCodeActionsProvider()
            ),

            // 文档高亮
            vscode.languages.registerDocumentHighlightProvider(
                { scheme: 'file', language: 'jass' },
                this.createDocumentHighlightProvider()
            ),

            // 文档链接
            vscode.languages.registerDocumentLinkProvider(
                { scheme: 'file', language: 'jass' },
                this.createDocumentLinkProvider()
            ),

            // 颜色提供器
            vscode.languages.registerColorProvider(
                { scheme: 'file', language: 'jass' },
                this.createColorProvider()
            ),

            // 文档变化监听
            vscode.workspace.onDidChangeTextDocument(this.onDocumentChange, this),
            vscode.workspace.onDidOpenTextDocument(this.onDocumentOpen, this),
            vscode.workspace.onDidCloseTextDocument(this.onDocumentClose, this),

            // 文档语义标记
            vscode.languages.registerDocumentSemanticTokensProvider(
                { scheme: 'file', language: 'jass' },
                this.createDocumentSemanticTokensProvider(),
                {
                    tokenTypes: [
                        'macro',           // 宏定义
                        'keyword',         // 预处理指令关键字
                        'string',          // 字符串文本
                        'number',          // 数字文本
                        'comment',         // 注释
                        'operator',        // 运算符
                        'parameter',       // 宏参数
                        'variable',        // 宏值中的变量
                        'function',        // 函数式宏
                        'type',            // 类型定义
                        'namespace',       // 命名空间
                        'decorator',       // 装饰器
                        'label',           // 标签
                        'regexp',          // 正则表达式
                    ],
                    tokenModifiers: [
                        'declaration',     // 声明
                        'definition',      // 定义
                        'readonly',        // 只读
                        'static',          // 静态
                        'deprecated',      // 废弃
                        'documentation',   // 文档
                        'defaultLibrary',  // 标准库
                        'async',           // 异步
                        'abstract',        // 抽象
                        'modification',    // 修改
                    ]
                }
            ),

            // 范围语义标记
            vscode.languages.registerDocumentRangeSemanticTokensProvider(
                { scheme: 'file', language: 'jass' },
                this.createDocumentRangeSemanticTokensProvider(),
                {
                    tokenTypes: [
                        'macro',           // 宏定义
                        'keyword',         // 预处理指令关键字
                        'string',          // 字符串文本
                        'number',          // 数字文本
                        'comment',         // 注释
                        'operator',        // 运算符
                        'parameter',       // 宏参数
                        'variable',        // 宏值中的变量
                        'function',        // 函数式宏
                        'type',            // 类型定义
                        'namespace',       // 命名空间
                        'decorator',       // 装饰器
                        'label',           // 标签
                        'regexp',          // 正则表达式
                    ],
                    tokenModifiers: [
                        'declaration',     // 声明
                        'definition',      // 定义
                        'readonly',        // 只读
                        'static',          // 静态
                        'deprecated',      // 废弃
                        'documentation',   // 文档
                        'defaultLibrary',  // 标准库
                        'async',           // 异步
                        'abstract',        // 抽象
                        'modification',    // 修改
                    ]
                }
            )
        );

        // 输出调试信息
        console.log('WaveProvider activated');
    }

    /**
     * 创建代码补全提供器
     */
    private createCompletionProvider(): vscode.CompletionItemProvider {
        return {
            provideCompletionItems: (document, position) => {
                const items: vscode.CompletionItem[] = [];
                const linePrefix = document.lineAt(position).text.substr(0, position.character);

                // 添加宏补全
                if (linePrefix.endsWith('#')) {
                    items.push(
                        this.createCompletionItem('define', 'Macro definition', '#define'),
                        this.createCompletionItem('include', 'Include file', '#include'),
                        this.createCompletionItem('ifdef', 'If defined', '#ifdef'),
                        this.createCompletionItem('ifndef', 'If not defined', '#ifndef'),
                        this.createCompletionItem('if', 'Conditional compilation', '#if'),
                        this.createCompletionItem('elif', 'Else if', '#elif'),
                        this.createCompletionItem('else', 'Else', '#else'),
                        this.createCompletionItem('endif', 'End conditional compilation', '#endif'),
                        this.createCompletionItem('pragma', 'Compiler directive', '#pragma'),
                        this.createCompletionItem('undef', 'Undefine macro', '#undef'),
                        this.createCompletionItem('error', 'Compilation error', '#error'),
                        this.createCompletionItem('warning', 'Compilation warning', '#warning')
                    );
                }

                // 添加已定义宏的补全
                const macros = this.getDocumentMacros(document);
                for (const macro of macros) {
                    if (macro.type === 'define') {
                        const name = macro.content.split(/\s+/)[1];
                        if (name) {
                            items.push(this.createCompletionItem(name, 'Defined macro', name));
                        }
                    }
                }

                return items;
            }
        };
    }

    /**
     * 创建定义跳转提供器
     */
    private createDefinitionProvider(): vscode.DefinitionProvider {
        return {
            provideDefinition: (document, position) => {
                const word = document.getWordRangeAtPosition(position);
                if (!word) return null;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 查找宏定义
                for (const macro of macros) {
                    if (macro.type === 'define' && macro.content.includes(wordText)) {
                        return new vscode.Location(
                            document.uri,
                            new vscode.Position(macro.lineNumber - 1, macro.startColumn)
                        );
                    }
                }

                return null;
            }
        };
    }

    /**
     * 创建类型定义提供器
     */
    private createTypeDefinitionProvider(): vscode.TypeDefinitionProvider {
        return {
            provideTypeDefinition: (document, position) => {
                const word = document.getWordRangeAtPosition(position);
                if (!word) return null;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 查找宏定义
                for (const macro of macros) {
                    if (macro.type === 'define' && macro.getName() === wordText) {
                        return new vscode.Location(
                            document.uri,
                            new vscode.Range(
                                macro.lineNumber - 1,
                                macro.startColumn,
                                macro.lineNumber - 1,
                                macro.endColumn
                            )
                        );
                    }
                }

                return null;
            }
        };
    }

    /**
     * 创建实现提供器
     */
    private createImplementationProvider(): vscode.ImplementationProvider {
        return {
            provideImplementation: (document, position) => {
                const word = document.getWordRangeAtPosition(position);
                if (!word) return null;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 查找宏定义
                for (const macro of macros) {
                    if (macro.type === 'define' && macro.getName() === wordText) {
                        return [new vscode.Location(
                            document.uri,
                            new vscode.Range(
                                macro.lineNumber - 1,
                                macro.startColumn,
                                macro.lineNumber - 1,
                                macro.endColumn
                            )
                        )];
                    }
                }

                return null;
            }
        };
    }

    /**
     * 创建悬停提示提供器
     */
    private createHoverProvider(): vscode.HoverProvider {
        return {
            provideHover: (document, position) => {
                // 获取当前行的文本
                const line = document.lineAt(position.line);
                const lineText = line.text;
                
                // 检查是否在宏定义行
                if (lineText.trim().startsWith('#')) {
                    const macroContent = lineText.trim();
                    const macroType = macroContent.split(/\s+/)[0].substring(1); // 移除 # 前缀
                    
                    // 创建悬停内容
                    const hoverContent = new vscode.MarkdownString();
                    hoverContent.appendMarkdown(`**>_** \`${document.uri.fsPath}\`\n\n`);
                    
                    // 获取宏的详细信息
                    const macros = this.getDocumentMacros(document);
                    const macro = macros.find(m => m.lineNumber === position.line + 1);
                    
                    if (macro) {
                        const codeDisplay = macro.isEnabled ? macro.getOriginalCode() : `~~${macro.getOriginalCode()}~~`;
                        hoverContent.appendCodeblock(codeDisplay);
                        hoverContent.appendMarkdown(`\n**Status**: ${macro.isEnabled ? 'Enabled' : 'Disabled'}\n\n`);
                        
                        // 如果是条件编译宏，添加条件信息
                        if (macro.type === 'if' || macro.type === 'ifdef' || macro.type === 'ifndef') {
                            const condition = macro.content.substring(macro.content.indexOf(macro.type) + macro.type.length).trim();
                            hoverContent.appendMarkdown(`**Condition**: \`${condition}\`\n\n`);
                        }
                        
                        // 如果是宏定义，添加定义信息
                        if (macro.type === 'define') {
                            const name = macro.getName();
                            const params = macro.getParameters();
                            const value = macro.getValue();
                            
                            hoverContent.appendMarkdown(`**Name**: \`${name}\`\n\n`);
                            
                            if (params.length > 0) {
                                hoverContent.appendMarkdown(`**Parameters**: \`${params.join(', ')}\`\n\n`);
                            }
                            
                            if (value) {
                                hoverContent.appendMarkdown(`**Value**: \`${value}\`\n\n`);
                            }
                        }
                    } else {
                        // 如果没有找到宏，至少显示当前行的内容
                        hoverContent.appendCodeblock(macroContent);
                    }
                    
                    // 设置悬停内容的支持
                    hoverContent.isTrusted = true;
                    hoverContent.supportHtml = true;
                    
                    return new vscode.Hover(hoverContent);
                }
                
                // 检查是否在宏使用处
                const wordRange = document.getWordRangeAtPosition(position);
                if (wordRange) {
                    const word = document.getText(wordRange);
                    const macros = this.getDocumentMacros(document);
                    
                    // 查找匹配的宏定义
                    const macro = macros.find(m => {
                        if (m.type === 'define') {
                            return m.getName() === word;
                        }
                        return false;
                    });
                    
                    if (macro) {
                        const hoverContent = new vscode.MarkdownString();
                        hoverContent.appendMarkdown(`**>_** \`${document.uri.fsPath}\`\n\n`);
                        
                        const codeDisplay = macro.isEnabled ? macro.getOriginalCode() : `~~${macro.getOriginalCode()}~~`;
                        hoverContent.appendCodeblock(codeDisplay);
                        hoverContent.appendMarkdown(`\n**Status**: ${macro.isEnabled ? 'Enabled' : 'Disabled'}\n\n`);
                        
                        // 添加宏的详细信息
                        const name = macro.getName();
                        const params = macro.getParameters();
                        const value = macro.getValue();
                        
                        hoverContent.appendMarkdown(`**Name**: \`${name}\`\n\n`);
                        
                        if (params.length > 0) {
                            hoverContent.appendMarkdown(`**Parameters**: \`${params.join(', ')}\`\n\n`);
                        }
                        
                        if (value) {
                            hoverContent.appendMarkdown(`**Value**: \`${value}\`\n\n`);
                        }
                        
                        // 设置悬停内容的支持
                        hoverContent.isTrusted = true;
                        hoverContent.supportHtml = true;
                        
                        return new vscode.Hover(hoverContent);
                    }
                }
                
                return null;
            }
        };
    }

    /**
     * 创建代码折叠提供器
     */
    private createFoldingProvider(): vscode.FoldingRangeProvider {
        return {
            provideFoldingRanges: (document) => {
                const ranges: vscode.FoldingRange[] = [];
                const macros = this.getDocumentMacros(document);

                // 为条件编译块创建折叠范围
                for (const macro of macros) {
                    if (macro.type === 'if' || macro.type === 'ifdef' || macro.type === 'ifndef') {
                        const endMacro = macro.children.find(child => child.type === 'endif');
                        if (endMacro) {
                            ranges.push(
                                new vscode.FoldingRange(
                                    macro.lineNumber - 1,
                                    endMacro.lineNumber - 1,
                                    vscode.FoldingRangeKind.Region
                                )
                            );
                        }
                    }
                }

                return ranges;
            }
        };
    }

    /**
     * 创建符号提供器
     */
    private createSymbolProvider(): vscode.DocumentSymbolProvider {
        return {
            provideDocumentSymbols: (document) => {
                const symbols: vscode.DocumentSymbol[] = [];
                const macros = this.getDocumentMacros(document);

                // 创建宏符号
                for (const macro of macros) {
                    if (macro.type === 'define') {
                        const name = macro.content.split(/\s+/)[1];
                        if (name) {
                            symbols.push(
                                new vscode.DocumentSymbol(
                                    name,
                                    macro.content,
                                    vscode.SymbolKind.Constant,
                                    new vscode.Range(
                                        macro.lineNumber - 1,
                                        macro.startColumn,
                                        macro.lineNumber - 1,
                                        macro.endColumn
                                    ),
                                    new vscode.Range(
                                        macro.lineNumber - 1,
                                        macro.startColumn,
                                        macro.lineNumber - 1,
                                        macro.endColumn
                                    )
                                )
                            );
                        }
                    }
                }

                return symbols;
            }
        };
    }

    /**
     * 创建参数提示提供器
     */
    private createSignatureHelpProvider(): vscode.SignatureHelpProvider {
        return {
            provideSignatureHelp: (document, position) => {
                const word = document.getWordRangeAtPosition(position);
                if (!word) return null;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 查找宏定义
                for (const macro of macros) {
                    if (macro.type === 'define' && macro.getName() === wordText) {
                        const parameters = macro.getParameters();
                        if (parameters.length > 0) {
                            const signatureHelp = new vscode.SignatureHelp();
                            
                            // 创建签名信息
                            const signature = new vscode.SignatureInformation(
                                `${wordText}(${parameters.join(', ')})`,
                                new vscode.MarkdownString()
                            );
                            
                            // 添加参数信息
                            signature.parameters = parameters.map(param => 
                                new vscode.ParameterInformation(param)
                            );
                            
                            // 设置活动参数
                            const lineText = document.lineAt(position.line).text;
                            const openParenIndex = lineText.indexOf('(', word.end.character);
                            if (openParenIndex !== -1) {
                                const commaCount = lineText.substring(openParenIndex, position.character).split(',').length - 1;
                                signatureHelp.activeParameter = Math.min(commaCount, parameters.length - 1);
                            }
                            
                            // 添加宏的详细信息
                            const markdown = new vscode.MarkdownString();
                            markdown.appendMarkdown(`**>_** \`${document.uri.fsPath}\`\n\n`);
                            markdown.appendCodeblock(macro.getOriginalCode());
                            markdown.appendMarkdown(`\n**Status**: ${macro.isEnabled ? 'Enabled' : 'Disabled'}\n\n`);
                            markdown.appendMarkdown(`**Value**: \`${macro.getValue()}\`\n\n`);
                            signature.documentation = markdown;
                            
                            signatureHelp.signatures = [signature];
                            signatureHelp.activeSignature = 0;
                            
                            return signatureHelp;
                        }
                    }
                }

                return null;
            }
        };
    }

    /**
     * 创建文档格式化提供器
     */
    private createDocumentFormattingProvider(): vscode.DocumentFormattingEditProvider {
        return {
            provideDocumentFormattingEdits: (document) => {
                return this.formatDocument(document);
            }
        };
    }

    /**
     * 创建选择范围格式化提供器
     */
    private createDocumentRangeFormattingProvider(): vscode.DocumentRangeFormattingEditProvider {
        return {
            provideDocumentRangeFormattingEdits: (document, range) => {
                return this.formatDocumentRange(document, range);
            }
        };
    }

    /**
     * 格式化整个文档
     */
    private formatDocument(document: vscode.TextDocument): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const macros = this.getDocumentMacros(document);

        // 格式化每个宏
        for (const macro of macros) {
            if (macro.type === 'define') {
                const formattedMacro = this.formatMacro(macro);
                if (formattedMacro !== macro.getOriginalCode()) {
                    edits.push(
                        vscode.TextEdit.replace(
                            new vscode.Range(
                                macro.lineNumber - 1,
                                macro.startColumn,
                                macro.lineNumber - 1 + (macro.isMultiline ? macro.getOriginalCode().split('\n').length : 1),
                                macro.endColumn
                            ),
                            formattedMacro
                        )
                    );
                }
            }
        }

        return edits;
    }

    /**
     * 格式化文档的指定范围
     */
    private formatDocumentRange(document: vscode.TextDocument, range: vscode.Range): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];
        const macros = this.getDocumentMacros(document);

        // 只处理范围内的宏
        for (const macro of macros) {
            if (macro.type === 'define') {
                const macroRange = new vscode.Range(
                    macro.lineNumber - 1,
                    macro.startColumn,
                    macro.lineNumber - 1 + (macro.isMultiline ? macro.getOriginalCode().split('\n').length : 1),
                    macro.endColumn
                );

                // 检查宏是否在范围内
                if (range.contains(macroRange)) {
                    const formattedMacro = this.formatMacro(macro);
                    if (formattedMacro !== macro.getOriginalCode()) {
                        edits.push(
                            vscode.TextEdit.replace(macroRange, formattedMacro)
                        );
                    }
                }
            }
        }

        return edits;
    }

    /**
     * 格式化单个宏
     */
    private formatMacro(macro: WaveMacro): string {
        const name = macro.getName();
        const params = macro.getParameters();
        const value = macro.getValue();

        // 构建格式化后的宏定义
        let formatted = '#define ';
        
        // 添加宏名称
        formatted += name;

        // 添加参数列表（如果有）
        if (params.length > 0) {
            formatted += '(' + params.join(', ') + ')';
        }

        // 添加宏值
        if (value) {
            // 如果宏值包含多行，使用反斜杠连接
            if (value.includes('\n')) {
                const lines = value.split('\n');
                formatted += ' ' + lines[0];
                for (let i = 1; i < lines.length; i++) {
                    formatted += ' \\\n    ' + lines[i].trim();
                }
            } else {
                formatted += ' ' + value;
            }
        }

        return formatted;
    }

    /**
     * 处理文档变化
     */
    private onDocumentChange(event: vscode.TextDocumentChangeEvent) {
        this.updateDocumentMacros(event.document);
    }

    /**
     * 处理文档打开
     */
    private onDocumentOpen(document: vscode.TextDocument) {
        this.updateDocumentMacros(document);
    }

    /**
     * 处理文档关闭
     */
    private onDocumentClose(document: vscode.TextDocument) {
        this.documentMacros.delete(document.uri.toString());
    }

    /**
     * 更新文档宏信息
     */
    private updateDocumentMacros(document: vscode.TextDocument) {
        const result = replace_wave_macro(document.getText());
        this.documentMacros.set(document.uri.toString(), result.macros);
        this.updateDiagnostics(document, this.diagnosticCollection);
    }

    /**
     * 获取文档的宏信息
     */
    private getDocumentMacros(document: vscode.TextDocument): WaveMacro[] {
        return this.documentMacros.get(document.uri.toString()) || [];
    }

    /**
     * 创建补全项
     */
    private createCompletionItem(label: string, detail: string, insertText: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.User);
        
        // 获取当前文档的宏信息
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const macros = this.getDocumentMacros(editor.document);
            const macro = macros.find(m => m.type === 'define' && m.content.split(/\s+/)[1] === label);
            
            if (macro) {
                const filePath = editor.document.uri.fsPath;
                const originalCode = macro.getOriginalCode();
                const codeDisplay = macro.isEnabled ? originalCode : `~~${originalCode}~~`;
                
                const markdown = new vscode.MarkdownString();
                markdown.appendMarkdown(`**>_** \`${filePath}\`\n\n`);
                markdown.appendCodeblock(codeDisplay);
                markdown.appendMarkdown(`**Status**: ${macro.isEnabled ? 'Enabled' : 'Disabled'}\n\n`);
                markdown.appendMarkdown(detail);
                
                item.documentation = markdown;
            } else {
                item.documentation = new vscode.MarkdownString(detail);
            }
        } else {
            item.documentation = new vscode.MarkdownString(detail);
        }
        
        item.detail = detail;
        item.insertText = insertText;
        return item;
    }

    /**
     * 创建引用提供器
     */
    private createReferenceProvider(): vscode.ReferenceProvider {
        return {
            provideReferences: async (document, position, context) => {
                const references: vscode.Location[] = [];
                const word = document.getWordRangeAtPosition(position);
                if (!word) return references;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 检查是否是宏定义
                const isMacroDefinition = macros.some(m => 
                    m.type === 'define' && m.getName() === wordText
                );

                if (isMacroDefinition) {
                    // 获取所有打开的文档
                    const documents = vscode.workspace.textDocuments;
                    
                    // 在每个文档中查找宏的引用
                    for (const doc of documents) {
                        const docText = doc.getText();
                        const docMacros = this.getDocumentMacros(doc);
                        
                        // 查找宏定义
                        for (const macro of docMacros) {
                            if (macro.type === 'define' && macro.getName() === wordText) {
                                references.push(
                                    new vscode.Location(
                                        doc.uri,
                                        new vscode.Range(
                                            macro.lineNumber - 1,
                                            macro.startColumn,
                                            macro.lineNumber - 1,
                                            macro.startColumn + wordText.length
                                        )
                                    )
                                );
                            }
                        }

                        // 查找宏的使用
                        const lines = docText.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            let match: RegExpExecArray | null;
                            const regex = new RegExp(`\\b${wordText}\\b`, 'g');
                            
                            while ((match = regex.exec(line)) !== null) {
                                // 检查是否在宏定义行中
                                const isInMacroDefinition = docMacros.some(m => 
                                    m.lineNumber - 1 === i && 
                                    m.type === 'define' && 
                                    m.startColumn <= match!.index && 
                                    m.endColumn >= match!.index + wordText.length
                                );

                                // 如果不是在宏定义行中，则认为是宏的使用
                                if (!isInMacroDefinition) {
                                    references.push(
                                        new vscode.Location(
                                            doc.uri,
                                            new vscode.Range(
                                                i,
                                                match!.index,
                                                i,
                                                match!.index + wordText.length
                                            )
                                        )
                                    );
                                }
                            }
                        }
                    }
                }

                return references;
            }
        };
    }

    /**
     * 创建重命名提供器
     */
    private createRenameProvider(): vscode.RenameProvider {
        return {
            provideRenameEdits: async (document, position, newName) => {
                const word = document.getWordRangeAtPosition(position);
                if (!word) return null;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 检查是否是宏定义
                const isMacroDefinition = macros.some(m => 
                    m.type === 'define' && m.getName() === wordText
                );

                if (!isMacroDefinition) return null;

                const workspaceEdit = new vscode.WorkspaceEdit();
                const documents = vscode.workspace.textDocuments;

                // 在每个文档中查找并替换宏的引用
                for (const doc of documents) {
                    const docText = doc.getText();
                    const docMacros = this.getDocumentMacros(doc);
                    const edits: vscode.TextEdit[] = [];

                    // 处理宏定义
                    for (const macro of docMacros) {
                        if (macro.type === 'define' && macro.getName() === wordText) {
                            // 替换宏名称
                            const macroContent = macro.getOriginalCode();
                            const newContent = macroContent.replace(
                                new RegExp(`\\b${wordText}\\b`),
                                newName
                            );
                            edits.push(
                                vscode.TextEdit.replace(
                                    new vscode.Range(
                                        macro.lineNumber - 1,
                                        macro.startColumn,
                                        macro.lineNumber - 1 + (macro.isMultiline ? macroContent.split('\n').length : 1),
                                        macro.endColumn
                                    ),
                                    newContent
                                )
                            );
                        }
                    }

                    // 处理宏的使用
                    const lines = docText.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        let match: RegExpExecArray | null;
                        const regex = new RegExp(`\\b${wordText}\\b`, 'g');
                        
                        while ((match = regex.exec(line)) !== null) {
                            // 检查是否在宏定义行中
                            const isInMacroDefinition = docMacros.some(m => 
                                m.lineNumber - 1 === i && 
                                m.type === 'define' && 
                                m.startColumn <= match!.index && 
                                m.endColumn >= match!.index + wordText.length
                            );

                            // 如果不是在宏定义行中，则替换宏的使用
                            if (!isInMacroDefinition) {
                                edits.push(
                                    vscode.TextEdit.replace(
                                        new vscode.Range(
                                            i,
                                            match!.index,
                                            i,
                                            match!.index + wordText.length
                                        ),
                                        newName
                                    )
                                );
                            }
                        }
                    }

                    if (edits.length > 0) {
                        workspaceEdit.set(doc.uri, edits);
                    }
                }

                return workspaceEdit;
            },

            prepareRename: async (document, position) => {
                const word = document.getWordRangeAtPosition(position);
                if (!word) return null;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 检查是否是宏定义
                const isMacroDefinition = macros.some(m => 
                    m.type === 'define' && m.getName() === wordText
                );

                if (!isMacroDefinition) return null;

                return new vscode.Range(
                    position.line,
                    word.start.character,
                    position.line,
                    word.end.character
                );
            }
        };
    }

    /**
     * 创建 CodeLens 提供器
     */
    private createCodeLensProvider(): vscode.CodeLensProvider {
        return {
            provideCodeLenses: (document) => {
                const codeLenses: vscode.CodeLens[] = [];
                const macros = this.getDocumentMacros(document);

                // 为每个宏创建 CodeLens
                for (const macro of macros) {
                    if (macro.type === 'define') {
                        const range = new vscode.Range(
                            macro.lineNumber - 1,
                            macro.startColumn,
                            macro.lineNumber - 1,
                            macro.endColumn
                        );

                        // 创建引用计数 CodeLens
                        const references = this.findMacroReferences(macro.getName());
                        const referenceCount = references.length;
                        codeLenses.push(
                            new vscode.CodeLens(range, {
                                title: `References: ${referenceCount}`,
                                command: 'editor.action.showReferences',
                                arguments: [document.uri, range.start, references]
                            })
                        );

                        // 创建状态 CodeLens
                        const status = macro.isEnabled ? 'Enabled' : 'Disabled';
                        codeLenses.push(
                            new vscode.CodeLens(range, {
                                title: `Status: ${status}`,
                                command: '',
                                arguments: []
                            })
                        );

                        // 创建参数信息 CodeLens
                        const params = macro.getParameters();
                        if (params.length > 0) {
                            codeLenses.push(
                                new vscode.CodeLens(range, {
                                    title: `Parameters: ${params.join(', ')}`,
                                    command: '',
                                    arguments: []
                                })
                            );
                        }

                        // 创建值信息 CodeLens
                        const value = macro.getValue();
                        if (value) {
                            codeLenses.push(
                                new vscode.CodeLens(range, {
                                    title: `Value: ${value}`,
                                    command: '',
                                    arguments: []
                                })
                            );
                        }
                    }
                }

                return codeLenses;
            }
        };
    }

    /**
     * 查找宏的所有引用
     */
    private findMacroReferences(macroName: string): vscode.Location[] {
        const references: vscode.Location[] = [];
        const documents = vscode.workspace.textDocuments;

        for (const doc of documents) {
            const macros = this.getDocumentMacros(doc);
            
            // 查找宏定义
            for (const macro of macros) {
                if (macro.type === 'define' && macro.getName() === macroName) {
                    references.push(
                        new vscode.Location(
                            doc.uri,
                            new vscode.Range(
                                macro.lineNumber - 1,
                                macro.startColumn,
                                macro.lineNumber - 1,
                                macro.startColumn + macroName.length
                            )
                        )
                    );
                }
            }

            // 查找宏的使用
            const text = doc.getText();
            const lines = text.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let match: RegExpExecArray | null;
                const regex = new RegExp(`\\b${macroName}\\b`, 'g');
                
                while ((match = regex.exec(line)) !== null) {
                    // 检查是否在宏定义行中
                    const isInMacroDefinition = macros.some(m => 
                        m.lineNumber - 1 === i && 
                        m.type === 'define' && 
                        m.startColumn <= match!.index && 
                        m.endColumn >= match!.index + macroName.length
                    );

                    // 如果不是在宏定义行中，则认为是宏的使用
                    if (!isInMacroDefinition) {
                        references.push(
                            new vscode.Location(
                                doc.uri,
                                new vscode.Range(
                                    i,
                                    match!.index,
                                    i,
                                    match!.index + macroName.length
                                )
                            )
                        );
                    }
                }
            }
        }

        return references;
    }

    /**
     * 创建 Code Actions 提供器
     */
    private createCodeActionsProvider(): vscode.CodeActionProvider {
        return {
            provideCodeActions: (document, range, context) => {
                const actions: vscode.CodeAction[] = [];
                const diagnostics = context.diagnostics;
                const macros = this.getDocumentMacros(document);

                // 处理诊断相关的快速修复
                for (const diagnostic of diagnostics) {
                    // 处理未闭合的条件编译块
                    if (diagnostic.message.includes('Unclosed')) {
                        const fixAction = new vscode.CodeAction('Add #endif', vscode.CodeActionKind.QuickFix);
                        fixAction.diagnostics = [diagnostic];
                        fixAction.isPreferred = true;
                        fixAction.edit = new vscode.WorkspaceEdit();
                        fixAction.edit.insert(document.uri, new vscode.Position(range.end.line + 1, 0), '#endif\n');
                        actions.push(fixAction);
                    }

                    // 处理重复的宏定义
                    if (diagnostic.message.includes('Duplicate macro definition')) {
                        const fixAction = new vscode.CodeAction('Remove duplicate macro', vscode.CodeActionKind.QuickFix);
                        fixAction.diagnostics = [diagnostic];
                        fixAction.isPreferred = true;
                        fixAction.edit = new vscode.WorkspaceEdit();
                        fixAction.edit.delete(document.uri, range);
                        actions.push(fixAction);
                    }

                    // 处理未使用的宏
                    if (diagnostic.message.includes('Unused macro')) {
                        const fixAction = new vscode.CodeAction('Remove unused macro', vscode.CodeActionKind.QuickFix);
                        fixAction.diagnostics = [diagnostic];
                        fixAction.isPreferred = true;
                        fixAction.edit = new vscode.WorkspaceEdit();
                        fixAction.edit.delete(document.uri, range);
                        actions.push(fixAction);
                    }
                }

                // 添加重构建议
                const macro = macros.find(m => 
                    m.lineNumber - 1 === range.start.line && 
                    m.type === 'define'
                );

                if (macro) {
                    // 添加重命名建议
                    const renameAction = new vscode.CodeAction(
                        'Rename macro',
                        vscode.CodeActionKind.Refactor
                    );
                    renameAction.command = {
                        command: 'editor.action.rename',
                        title: 'Rename macro'
                    };
                    actions.push(renameAction);

                    // 添加查找所有引用建议
                    const findRefsAction = new vscode.CodeAction(
                        'Find all references',
                        vscode.CodeActionKind.Refactor
                    );
                    findRefsAction.command = {
                        command: 'editor.action.referenceSearch.trigger',
                        title: 'Find all references'
                    };
                    actions.push(findRefsAction);

                    // 添加格式化宏建议
                    const formatAction = new vscode.CodeAction(
                        'Format macro definition',
                        vscode.CodeActionKind.Refactor
                    );
                    formatAction.edit = new vscode.WorkspaceEdit();
                    formatAction.edit.replace(
                        document.uri,
                        range,
                        this.formatMacro(macro)
                    );
                    actions.push(formatAction);

                    // 添加转换为内联函数建议（如果宏是函数式的）
                    if (macro.getParameters().length > 0) {
                        const inlineAction = new vscode.CodeAction(
                            'Convert to inline function',
                            vscode.CodeActionKind.Refactor
                        );
                        inlineAction.edit = new vscode.WorkspaceEdit();
                        const inlineFunction = this.convertMacroToInlineFunction(macro);
                        inlineAction.edit.replace(document.uri, range, inlineFunction);
                        actions.push(inlineAction);
                    }
                }

                return actions;
            }
        };
    }

    /**
     * 将宏转换为内联函数
     */
    private convertMacroToInlineFunction(macro: WaveMacro): string {
        const name = macro.getName();
        const params = macro.getParameters();
        const value = macro.getValue();

        // 构建内联函数
        let inlineFunction = 'inline ';
        
        // 添加返回类型（尝试从值中推断）
        if (value.includes('?')) {
            inlineFunction += 'auto ';
        } else {
            inlineFunction += 'void ';
        }

        // 添加函数名和参数
        inlineFunction += `${name}(${params.join(', ')}) {\n`;
        inlineFunction += '    ';

        // 添加函数体
        if (value.includes('?')) {
            // 处理三元运算符
            inlineFunction += `return ${value};\n`;
        } else {
            inlineFunction += `${value};\n`;
        }

        inlineFunction += '}';

        return inlineFunction;
    }

    /**
     * 创建文档高亮提供器
     */
    private createDocumentHighlightProvider(): vscode.DocumentHighlightProvider {
        return {
            provideDocumentHighlights: (document, position) => {
                const highlights: vscode.DocumentHighlight[] = [];
                const word = document.getWordRangeAtPosition(position);
                if (!word) return highlights;

                const wordText = document.getText(word);
                const macros = this.getDocumentMacros(document);

                // 查找宏的所有使用位置
                for (const macro of macros) {
                    if (macro.type === 'define' && macro.getName() === wordText) {
                        // 添加定义位置
                        highlights.push(new vscode.DocumentHighlight(
                            new vscode.Range(
                                macro.lineNumber - 1,
                                macro.startColumn,
                                macro.lineNumber - 1,
                                macro.endColumn
                            ),
                            vscode.DocumentHighlightKind.Write
                        ));

                        // 添加使用位置
                        const text = document.getText();
                        const lines = text.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            let match: RegExpExecArray | null;
                            const regex = new RegExp(`\\b${wordText}\\b`, 'g');
                            
                            while ((match = regex.exec(line)) !== null) {
                                if (i !== macro.lineNumber - 1) {
                                    highlights.push(new vscode.DocumentHighlight(
                                        new vscode.Range(
                                            i,
                                            match.index,
                                            i,
                                            match.index + wordText.length
                                        ),
                                        vscode.DocumentHighlightKind.Read
                                    ));
                                }
                            }
                        }
                    }
                }

                return highlights;
            }
        };
    }

    /**
     * 创建文档链接提供器
     */
    private createDocumentLinkProvider(): vscode.DocumentLinkProvider {
        return {
            provideDocumentLinks: (document) => {
                const links: vscode.DocumentLink[] = [];
                const macros = this.getDocumentMacros(document);

                // 为 include 宏创建链接
                for (const macro of macros) {
                    if (macro.type === 'include') {
                        const match = macro.content.match(/#include\s*[<"](.+)[>"]/);
                        if (match) {
                            const fileName = match[1];
                            const range = new vscode.Range(
                                macro.lineNumber - 1,
                                macro.startColumn + macro.content.indexOf(fileName),
                                macro.lineNumber - 1,
                                macro.startColumn + macro.content.indexOf(fileName) + fileName.length
                            );

                            // 尝试解析文件路径
                            const filePath = this.resolveIncludePath(fileName);
                            if (filePath) {
                                links.push(new vscode.DocumentLink(
                                    range,
                                    vscode.Uri.file(filePath)
                                ));
                            }
                        }
                    }
                }

                return links;
            },
            resolveDocumentLink: async (link) => {
                // 验证链接是否有效
                try {
                    await vscode.workspace.fs.stat(link.target!);
                    return link;
                } catch {
                    return null;
                }
            }
        };
    }

    /**
     * 创建颜色提供器
     */
    private createColorProvider(): vscode.DocumentColorProvider {
        return {
            provideDocumentColors: (document) => {
                const colors: vscode.ColorInformation[] = [];
                const macros = this.getDocumentMacros(document);

                // 查找颜色相关的宏定义
                for (const macro of macros) {
                    if (macro.type === 'define') {
                        const value = macro.getValue();
                        const colorMatch = value.match(/#([0-9A-Fa-f]{6})/);
                        if (colorMatch) {
                            const color = this.parseColor(colorMatch[1]);
                            if (color) {
                                colors.push(new vscode.ColorInformation(
                                    new vscode.Range(
                                        macro.lineNumber - 1,
                                        macro.startColumn + value.indexOf(colorMatch[1]),
                                        macro.lineNumber - 1,
                                        macro.startColumn + value.indexOf(colorMatch[1]) + 6
                                    ),
                                    color
                                ));
                            }
                        }
                    }
                }

                return colors;
            },
            provideColorPresentations: (color) => {
                return [{
                    label: `#${this.colorToHex(color)}`,
                    textEdit: new vscode.TextEdit(
                        new vscode.Range(0, 0, 0, 0),
                        `#${this.colorToHex(color)}`
                    )
                }];
            }
        };
    }

    /**
     * 创建输入时格式化提供器
     */
    private createOnTypeFormattingProvider(): vscode.OnTypeFormattingEditProvider {
        return {
            provideOnTypeFormattingEdits: (document, position, ch, options) => {
                const edits: vscode.TextEdit[] = [];
                const line = document.lineAt(position.line);
                const text = line.text;

                // 处理宏定义的格式化
                if (text.trim().startsWith('#')) {
                    if (ch === '\n') {
                        // 处理多行宏的缩进
                        const prevLine = document.lineAt(position.line - 1);
                        if (prevLine.text.trimEnd().endsWith('\\')) {
                            edits.push(
                                vscode.TextEdit.insert(
                                    position,
                                    '    ' // 4 spaces indentation
                                )
                            );
                        }
                    }
                }

                return edits;
            }
        };
    }

    /**
     * 解析颜色值
     */
    private parseColor(hex: string): vscode.Color | null {
        try {
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;
            return new vscode.Color(r, g, b, 1);
        } catch {
            return null;
        }
    }

    /**
     * 将颜色转换为十六进制
     */
    private colorToHex(color: vscode.Color): string {
        const r = Math.round(color.red * 255).toString(16).padStart(2, '0');
        const g = Math.round(color.green * 255).toString(16).padStart(2, '0');
        const b = Math.round(color.blue * 255).toString(16).padStart(2, '0');
        return `${r}${g}${b}`;
    }

    /**
     * 解析包含文件路径
     */
    private resolveIncludePath(fileName: string): string | null {
        // 检查当前目录
        const currentDir = path.dirname(vscode.window.activeTextEditor?.document.uri.fsPath || '');
        const currentPath = path.join(currentDir, fileName);
        if (fs.existsSync(currentPath)) {
            return currentPath;
        }

        // 检查包含路径
        for (const includePath of this.includePaths) {
            const fullPath = path.join(includePath, fileName);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }

        return null;
    }

    /**
     * 创建文档语义标记提供程序
     */
    private createDocumentSemanticTokensProvider(): vscode.DocumentSemanticTokensProvider {
        return {
            provideDocumentSemanticTokens: (document: vscode.TextDocument) => {
                return this.provideSemanticTokens(document);
            },
            provideDocumentSemanticTokensEdits: (document: vscode.TextDocument, previousResultId: string) => {
                return this.provideSemanticTokens(document);
            }
        };
    }

    /**
     * 创建文档范围语义标记提供程序
     */
    private createDocumentRangeSemanticTokensProvider(): vscode.DocumentRangeSemanticTokensProvider {
        return {
            provideDocumentRangeSemanticTokens: (document: vscode.TextDocument, range: vscode.Range) => {
                return this.provideSemanticTokens(document, range);
            }
        };
    }

    /**
     * 提供语义标记
     */
    private provideSemanticTokens(document: vscode.TextDocument, range?: vscode.Range): vscode.SemanticTokens {
        const builder = new vscode.SemanticTokensBuilder();
        const macros = this.getDocumentMacros(document);
        const text = document.getText();
        const lines = text.split('\n');

        // 处理每个宏
        for (const macro of macros) {
            // 如果指定了范围，检查宏是否在范围内
            if (range) {
                const macroRange = new vscode.Range(
                    macro.lineNumber - 1,
                    macro.startColumn,
                    macro.lineNumber - 1 + (macro.isMultiline ? macro.getOriginalCode().split('\n').length : 1),
                    macro.endColumn
                );
                if (!range.contains(macroRange)) {
                    continue;
                }
            }

            // 标记预处理指令关键字
            const directiveMatch = macro.content.match(/^\s*#\s*(\w+)/);
            if (directiveMatch) {
                const directive = directiveMatch[1];
                builder.push(
                    new vscode.Range(
                        macro.lineNumber - 1,
                        macro.startColumn,
                        macro.lineNumber - 1,
                        macro.startColumn + directive.length
                    ),
                    'keyword',
                    ['declaration']
                );
            }

            // 标记宏定义
            if (macro.type === 'define') {
                const name = macro.getName();
                const nameStart = macro.content.indexOf(name);
                if (nameStart !== -1) {
                    builder.push(
                        new vscode.Range(
                            macro.lineNumber - 1,
                            macro.startColumn + nameStart,
                            macro.lineNumber - 1,
                            macro.startColumn + nameStart + name.length
                        ),
                        'macro',
                        ['definition']
                    );
                }

                // 标记宏参数
                const params = macro.getParameters();
                if (params.length > 0) {
                    const paramList = macro.content.substring(
                        macro.content.indexOf('(') + 1,
                        macro.content.indexOf(')')
                    );
                    let currentPos = macro.content.indexOf('(') + 1;
                    for (const param of params) {
                        const paramStart = paramList.indexOf(param);
                        if (paramStart !== -1) {
                            builder.push(
                                new vscode.Range(
                                    macro.lineNumber - 1,
                                    macro.startColumn + currentPos + paramStart,
                                    macro.lineNumber - 1,
                                    macro.startColumn + currentPos + paramStart + param.length
                                ),
                                'parameter',
                                ['declaration']
                            );
                        }
                        currentPos += param.length + 2; // +2 for comma and space
                    }
                }

                // 标记宏值
                const value = macro.getValue();
                if (value) {
                    const valueStart = macro.content.indexOf(value);
                    if (valueStart !== -1) {
                        if (macro.isMultiline) {
                            // 处理多行宏值
                            const valueLines = value.split('\n');
                            for (let i = 0; i < valueLines.length; i++) {
                                const line = valueLines[i];
                                // 分析行内容，标记不同类型的标记
                                this.tokenizeMacroValue(
                                    builder,
                                    line,
                                    macro.lineNumber - 1 + i,
                                    i === 0 ? macro.startColumn + valueStart : 4
                                );
                            }
                        } else {
                            this.tokenizeMacroValue(
                                builder,
                                value,
                                macro.lineNumber - 1,
                                macro.startColumn + valueStart
                            );
                        }
                    }
                }
            }

            // 标记条件编译指令
            if (macro.type === 'if' || macro.type === 'ifdef' || macro.type === 'ifndef') {
                builder.push(
                    new vscode.Range(
                        macro.lineNumber - 1,
                        macro.startColumn,
                        macro.lineNumber - 1,
                        macro.startColumn + macro.type.length
                    ),
                    'keyword',
                    ['declaration']
                );

                // 标记条件表达式
                const condition = macro.content.substring(
                    macro.content.indexOf(macro.type) + macro.type.length
                ).trim();
                if (condition) {
                    this.tokenizeCondition(
                        builder,
                        condition,
                        macro.lineNumber - 1,
                        macro.startColumn + macro.type.length + 1
                    );
                }
            }
        }

        return builder.build();
    }

    /**
     * 标记宏值中的各种标记
     */
    private tokenizeMacroValue(
        builder: vscode.SemanticTokensBuilder,
        text: string,
        line: number,
        startColumn: number
    ): void {
        // 标记字符串
        const stringRegex = /"([^"\\]|\\.)*"/g;
        let match;
        while ((match = stringRegex.exec(text)) !== null) {
            builder.push(
                new vscode.Range(
                    line,
                    startColumn + match.index,
                    line,
                    startColumn + match.index + match[0].length
                ),
                'string',
                []
            );
        }

        // 标记数字
        const numberRegex = /\b\d+(\.\d+)?\b/g;
        while ((match = numberRegex.exec(text)) !== null) {
            builder.push(
                new vscode.Range(
                    line,
                    startColumn + match.index,
                    line,
                    startColumn + match.index + match[0].length
                ),
                'number',
                []
            );
        }

        // 标记运算符
        const operatorRegex = /[+\-*/%=<>!&|^~?:]+/g;
        while ((match = operatorRegex.exec(text)) !== null) {
            builder.push(
                new vscode.Range(
                    line,
                    startColumn + match.index,
                    line,
                    startColumn + match.index + match[0].length
                ),
                'operator',
                []
            );
        }

        // 标记变量
        const variableRegex = /\b[a-zA-Z_]\w*\b/g;
        while ((match = variableRegex.exec(text)) !== null) {
            builder.push(
                new vscode.Range(
                    line,
                    startColumn + match.index,
                    line,
                    startColumn + match.index + match[0].length
                ),
                'variable',
                []
            );
        }
    }

    /**
     * 标记条件表达式中的各种标记
     */
    private tokenizeCondition(
        builder: vscode.SemanticTokensBuilder,
        text: string,
        line: number,
        startColumn: number
    ): void {
        // 标记关键字
        const keywordRegex = /\b(defined|if|else|elif|endif)\b/g;
        let match;
        while ((match = keywordRegex.exec(text)) !== null) {
            builder.push(
                new vscode.Range(
                    line,
                    startColumn + match.index,
                    line,
                    startColumn + match.index + match[0].length
                ),
                'keyword',
                []
            );
        }

        // 标记运算符
        const operatorRegex = /[+\-*/%=<>!&|^~?:]+/g;
        while ((match = operatorRegex.exec(text)) !== null) {
            builder.push(
                new vscode.Range(
                    line,
                    startColumn + match.index,
                    line,
                    startColumn + match.index + match[0].length
                ),
                'operator',
                []
            );
        }

        // 标记宏名
        const macroRegex = /\b[A-Z_][A-Z0-9_]*\b/g;
        while ((match = macroRegex.exec(text)) !== null) {
            builder.push(
                new vscode.Range(
                    line,
                    startColumn + match.index,
                    line,
                    startColumn + match.index + match[0].length
                ),
                'macro',
                []
            );
        }
    }
}