import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Parser } from '../vjass/parser';
import { BlockStatement } from '../vjass/ast';
import { Subject, debounceTime } from '../extern/rxjs';
import { TextMacroCollector } from '../vjass/text-macro-collector';
import { TextMacroExpander } from '../vjass/text-macro-expander';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
import { DefineRegistry } from '../vjass/define-registry';
import { streamingParse } from './streaming-parser';
import { CompletionCache } from './completion-cache';
import { CompletionExtractor } from './completion-extractor';
import { ErrorCollection } from '../vjass/error';
import { InnerZincParser } from '../vjass/inner-zinc-parser';
import { ZincProgram } from '../vjass/zinc-ast';
import { analyzeSemantics, analyzeSemanticsWithAllFiles, SemanticAnalyzerOptions } from '../vjass/analyzer';
import { CheckErrorType } from '../vjass/error';
import { JumpCache, JumpCacheItem } from './jump-cache';
import { HoverCache } from './hover-cache';

/**
 * 文件事件类型
 */
type FileEventType = 'create' | 'update' | 'delete' | 'rename';

/**
 * 文件事件负载
 */
interface FileEventPayload {
    type: FileEventType;
    filePath: string;
    oldPath?: string; // 用于重命名事件
    content?: string; // 用于更新事件
}

/**
 * 文件缓存项
 */
interface FileCacheItem {
    blockStatement: BlockStatement | null;
    /** Zinc 程序 AST（仅用于 .zn 文件） */
    zincProgram?: ZincProgram | null;
    lastModified: number;
    version: number;
    /** 是否为不可变文件（静态文件） */
    isImmutable: boolean;
    /** 文件原始内容（用于提取注释） */
    content: string;
    /** 解析错误集合 */
    errors?: ErrorCollection;
}

/**
 * 解析选项配置
 */
interface ParsingConfig {
    /** 是否启用 textmacro */
    enableTextMacro?: boolean;
    /** 是否启用预处理器 */
    enablePreprocessor?: boolean;
    /** 是否启用 Lua 块 */
    enableLuaBlocks?: boolean;
    /** 是否启用严格模式 */
    strictMode?: boolean;
}

/**
 * 标准库路径配置
 */
interface StandardLibrariesConfig {
    /** common.j 文件路径 */
    "common.j"?: string;
    /** common.ai 文件路径 */
    "common.ai"?: string;
    /** blizzard.j 文件路径 */
    "blizzard.j"?: string;
    /** DzAPI.j 文件路径 */
    "dzapi.j"?: string;
}

/**
 * 诊断选项配置
 */
interface DiagnosticsConfig {
    /** 是否启用诊断 */
    enable?: boolean;
    /** 严重程度配置 */
    severity?: {
        /** 错误严重程度 */
        errors?: "error" | "warning" | "information" | "hint";
        /** 警告严重程度 */
        warnings?: "error" | "warning" | "information" | "hint";
    };
    /** 是否检查类型 */
    checkTypes?: boolean;
    /** 是否检查未定义 */
    checkUndefined?: boolean;
    /** 是否检查未使用 */
    checkUnused?: boolean;
    /** 是否检查数组越界（默认开启） */
    checkArrayBounds?: boolean;
    /** 是否检查句柄泄漏（timer/group/force/location，默认开启） */
    checkHandleLeaks?: boolean;
}

/**
 * JASS 配置文件接口
 */
interface JassConfig {
    /** 排除的文件/目录模式（glob 模式） */
    excludes?: string[];
    /** 包含的文件/目录模式（glob 模式，优先级高于 excludes） */
    includes?: string[];
    /** 解析选项 */
    parsing?: ParsingConfig;
    /** 标准库路径配置 */
    standardLibraries?: StandardLibrariesConfig;
    /** 诊断选项 */
    diagnostics?: DiagnosticsConfig;
}

/**
 * 配置选项
 */
interface DataEnterOptions {
    /** 是否忽略配置检查 */
    ignoreConfig?: boolean;
    /** 防抖延迟时间（毫秒） */
    debounceDelay?: number;
    /** 是否启用文件监听 */
    enableFileWatcher?: boolean;
}

interface IgnoreDirectives {
    ignoreFileErrors: boolean;
    ignoreNextLineSyntaxErrors: Set<number>;
}

/**
 * 标准库文件解析顺序
 */
const STANDARD_LIBRARY_ORDER = ['common.j', 'common.ai', 'blizzard.j', 'dzapi.j'];

/**
 * 需要忽略的文件名（不处理，但需要监听变化）
 */
const IGNORED_FILES = ['numbers.jass', 'presets.jass', 'strings.jass'];

/**
 * 检查是否是特殊文件（需要由 SpecialFileManager 处理）
 */
function isSpecialFile(filePath: string): boolean {
    const fileName = path.basename(filePath).toLowerCase();
    return IGNORED_FILES.includes(fileName);
}

/**
 * 文件路径到 BlockStatement 的映射管理器
 * 使用 RxJS 实现优雅的事件驱动和延迟策略
 */
export class DataEnterManager {
    private readonly cache: Map<string, FileCacheItem> = new Map();
    private readonly fileEventSubject: Subject<FileEventPayload> = new Subject();
    private readonly parserCache: Map<string, Parser> = new Map();
    private readonly immutableFiles: Set<string> = new Set(); // 不可变文件集合
    private options: DataEnterOptions;
    private fileWatcher?: vscode.FileSystemWatcher;
    private configWatcher?: vscode.FileSystemWatcher;
    private disposables: vscode.Disposable[] = [];
    private workspaceRoot?: string;
    
    // TextMacro 相关组件
    private readonly textMacroCollector: TextMacroCollector;
    private readonly textMacroExpander: TextMacroExpander;
    private readonly textMacroRegistry: TextMacroRegistry;
    
    // Define 相关组件
    private readonly defineRegistry: DefineRegistry;
    
    // 跳转缓存相关组件
    private readonly jumpCache: JumpCache;
    // Hover 缓存相关组件
    private readonly hoverCache: HoverCache;
    
    // 配置文件相关
    private config: JassConfig | null = null;
    private configPath?: string;
    private readonly configReloadCallbacks: Array<() => void> = [];
    private hasInitializedWorkspace = false;
    private hasLoggedEmptyCacheWarning = false;

    constructor(options: DataEnterOptions = {}) {
        this.options = {
            ignoreConfig: options.ignoreConfig ?? false,
            debounceDelay: options.debounceDelay ?? 300,
            enableFileWatcher: options.enableFileWatcher ?? true,
            ...options
        };

        // 获取工作区根目录
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        this.workspaceRoot = workspaceFolder?.uri.fsPath;

        // 初始化 TextMacro 组件
        this.textMacroRegistry = TextMacroRegistry.getInstance();
        this.textMacroCollector = new TextMacroCollector(this.textMacroRegistry);
        this.textMacroExpander = new TextMacroExpander(this.textMacroRegistry);
        
        // 初始化 Define 组件
        this.defineRegistry = DefineRegistry.getInstance();
        
        // 初始化跳转缓存
        this.jumpCache = JumpCache.getInstance();
        // 初始化 Hover 缓存
        this.hoverCache = HoverCache.getInstance();

        // 加载配置文件
        this.loadConfig();

        // 不在这里设置监听器，监听器在 initializeWorkspace 中设置
    }

    // 已移除 .mate 持久化功能，缓存仅保留内存态。

    private parseApiVersionParts(version: string): { major: number; minor: number } | null {
        const match = version.trim().match(/^(\d+)\.(\d+)/);
        if (!match) {
            return null;
        }
        return {
            major: Number(match[1]),
            minor: Number(match[2])
        };
    }

    private isReturnBugCompatibleApiVersion(version: string): boolean {
        const parsed = this.parseApiVersionParts(version);
        if (!parsed) {
            return false;
        }
        if (parsed.major < 1) {
            return true;
        }
        return parsed.major === 1 && parsed.minor <= 20;
    }

    private getReturnBehaviorMode(): "strict" | "legacy" | "adaptive" {
        const apiVersion = vscode.workspace.getConfiguration('jass').get<string>('apiVersion', 'off');
        if (apiVersion === 'off') {
            // off 表示用户未明确指定版本：采用友好模式，减少误报并给出提示
            return "adaptive";
        }
        if (this.isReturnBugCompatibleApiVersion(apiVersion)) {
            return "legacy";
        }
        return "strict";
    }

    private parseIgnoreDirectives(content: string): IgnoreDirectives {
        const directives: IgnoreDirectives = {
            ignoreFileErrors: false,
            ignoreNextLineSyntaxErrors: new Set<number>()
        };
        const lines = content.split(/\r?\n/);

        for (let index = 0; index < lines.length; index++) {
            const line = lines[index].trim().toLowerCase();
            if (!line.startsWith("//")) {
                continue;
            }

            const isIgnoreFile =
                /^\/\/\s*@ignore-file-errors\b/.test(line) ||
                /^\/\/\s*@ignore\s+file-errors\b/.test(line) ||
                /^\/\/\s*@ignore\s+file\b/.test(line);
            if (isIgnoreFile) {
                directives.ignoreFileErrors = true;
            }

            const isIgnoreNextLineSyntax =
                /^\/\/\s*@ignore-next-line-syntax\b/.test(line) ||
                /^\/\/\s*@ignore\s+next-line-syntax\b/.test(line) ||
                /^\/\/\s*@ignore\s+next-line\b/.test(line);
            if (isIgnoreNextLineSyntax) {
                directives.ignoreNextLineSyntaxErrors.add(index + 1);
            }
        }

        return directives;
    }

    private applyIgnoreDirectivesToSyntaxErrors(errors: ErrorCollection, directives: IgnoreDirectives): void {
        if (directives.ignoreNextLineSyntaxErrors.size === 0) {
            return;
        }

        errors.errors = errors.errors.filter((error) => !directives.ignoreNextLineSyntaxErrors.has(error.start.line));
        if (errors.checkValidationErrors && errors.checkValidationErrors.length > 0) {
            errors.checkValidationErrors = errors.checkValidationErrors.filter((error) => {
                if (error.checkType !== CheckErrorType.SYNTAX_ERROR) {
                    return true;
                }
                return !directives.ignoreNextLineSyntaxErrors.has(error.start.line);
            });
        }
    }

    private applyIgnoreDirectivesToAllErrors(errors: ErrorCollection, directives: IgnoreDirectives): void {
        if (!directives.ignoreFileErrors) {
            return;
        }

        errors.errors = [];
        if (errors.checkValidationErrors && errors.checkValidationErrors.length > 0) {
            errors.checkValidationErrors = errors.checkValidationErrors.filter((error) => error.severity !== 'error');
        }
    }

    /**
     * 处理文件事件
     */
    private async processFileEvent(event: FileEventPayload): Promise<{ success: boolean; event: FileEventPayload; error?: string }> {
        try {
            switch (event.type) {
                case 'create':
                case 'update':
                    await this.handleFileUpdate(event.filePath, event.content);
                    break;
                case 'delete':
                    this.handleFileDelete(event.filePath);
                    break;
                case 'rename':
                    if (event.oldPath) {
                        await this.handleFileRename(event.oldPath, event.filePath);
                    }
                    break;
            }
            return { success: true, event };
        } catch (error) {
            return { 
                success: false, 
                event, 
                error: error instanceof Error ? error.message : String(error) 
            };
        }
    }

    /**
     * 处理文件创建
     */
    private handleFileCreate(filePath: string): void {
        // 如果是特殊文件，即使是在 static 目录下，也要通知 SpecialFileManager
        if (isSpecialFile(filePath)) {
            this.notifySpecialFileManager(filePath, 'create');
            // 特殊文件不进行 AST 解析，直接返回
            return;
        }

        // 静态文件不监听创建事件
        if (this.isImmutableFile(filePath)) {
            return;
        }

        if (this.shouldIgnoreFile(filePath)) {
            return;
        }

        this.fileEventSubject.next({
            type: 'create',
            filePath
        });
    }

    /**
     * 处理文件更新
     */
    private async handleFileUpdate(filePath: string, content?: string): Promise<void> {
        const isImmutable = this.isImmutableFile(filePath);
        
        // 如果是不可变文件且已缓存，直接返回（不更新）
        if (isImmutable && this.cache.has(filePath)) {
            return;
        }

        if (this.shouldIgnoreFile(filePath)) {
            return;
        }

        // 如果没有提供内容，从文件系统读取
        if (!content) {
            try {
                content = fs.readFileSync(filePath, 'utf-8');
            } catch (error) {
                console.error(`Failed to read file ${filePath}:`, error);
                return;
            }
        }
        const ignoreDirectives = this.parseIgnoreDirectives(content);

        const ext = path.extname(filePath).toLowerCase();
        const isZinc = ext === '.zn';
        
        let blockStatement: BlockStatement | null = null;
        let zincProgram: ZincProgram | null = null;
        let errors: ErrorCollection = { errors: [], warnings: [], checkValidationErrors: [] };

        if (isZinc) {
            // 对于 Zinc 文件，使用 InnerZincParser
            // 注意：Zinc 文件不支持 textmacro，所以跳过 textmacro 收集
            const zincParser = new InnerZincParser(content, filePath);
            const statements = zincParser.parse();
            zincProgram = new ZincProgram(statements);
            // 使用 InnerZincParser 的错误收集
            errors = zincParser.errors;
        } else {
            // 对于非 Zinc 文件，使用原有的流程
            // 获取解析配置
            const parsingConfig = this.config?.parsing || {};
            const enableTextMacro = parsingConfig.enableTextMacro !== false; // 默认启用
            const enablePreprocessor = parsingConfig.enablePreprocessor !== false; // 默认启用
            const enableLuaBlocks = parsingConfig.enableLuaBlocks !== false; // 默认启用
            
            // 1. 如果启用 textmacro，先更新 textmacro 注册表（收集阶段）
            if (enableTextMacro) {
                const collection = { errors: [], warnings: [] };
                this.textMacroCollector.collectFromFile(filePath, content, collection);
                
                // 报告收集阶段的错误和警告
                if (collection.errors.length > 0 || collection.warnings.length > 0) {
                    console.warn(`TextMacro collection issues in ${path.basename(filePath)}:`, {
                        errors: collection.errors.length,
                        warnings: collection.warnings.length
                    });
                }
            }

            // 2. 解析文件内容为 BlockStatement（解析阶段，此时可以使用 textmacro）
            const result = streamingParse(content, {
                filePath,
                deleteLineComment: false, // 保留行注释
                textMacroExpander: enableTextMacro ? this.textMacroExpander : undefined,
                enablePreprocessor: enablePreprocessor,
                enableLuaBlocks: enableLuaBlocks
            });
            
            blockStatement = result.blockStatement;
            errors = result.errors;
            this.applyIgnoreDirectivesToSyntaxErrors(errors, ignoreDirectives);
            
            // 3. 注册 #define 宏到注册表
            if (enablePreprocessor && result.preprocessCollection.defines.length > 0) {
                this.defineRegistry.updateFile(filePath, result.preprocessCollection.defines);
            }
            
            // 4. 如果解析成功且没有严重错误，进行语义分析
            // immutable/static 文件用于符号索引与跳转，跳过语义分析可显著降低冷启动耗时。
            if (!isImmutable && blockStatement && errors.errors.length === 0) {
                try {
                    // 获取诊断配置
                    const diagnosticsConfig = this.config?.diagnostics || {};
                    const checkUndefined = diagnosticsConfig.checkUndefined !== false; // 默认启用
                    const checkTypes = diagnosticsConfig.checkTypes !== false; // 默认启用
                    const checkUnused = diagnosticsConfig.checkUnused !== false; // 默认启用（仅显式 false 才关闭）
                    const checkArrayBounds = diagnosticsConfig.checkArrayBounds !== false; // 默认启用
                    const checkHandleLeaks = diagnosticsConfig.checkHandleLeaks !== false; // 默认启用
                    const returnBehaviorMode = this.getReturnBehaviorMode();
                    
                    if (checkUndefined) {
                        // 使用新的方法：先解析所有文件，再进行语义分析
                        const workspaceRoot = this.workspaceRoot || path.dirname(filePath);
                        const standardLibFiles = this.getStandardLibraryFiles(workspaceRoot);
                        // 使用缓存中的所有文件（包括 static 目录的文件），而不是重新扫描文件系统
                        // 注意：如果标准库文件在 getStandardLibraryFiles 中找不到，会从缓存中获取
                        const projectFiles = this.getProjectFilesFromCache(filePath, standardLibFiles);
                        
                        // 使用 analyzeSemanticsWithAllFiles 进行语义分析
                        // 注意：确保所有相关文件都被包含，包括可能包含库声明的文件
                        const result = analyzeSemanticsWithAllFiles(
                            { filePath: filePath, content: content },
                            [...standardLibFiles, ...projectFiles],
                            { 
                                checkUndefinedBehavior: checkUndefined,
                                checkTypes: checkTypes,
                                checkUnused: checkUnused,
                                checkArrayBounds: checkArrayBounds,
                                checkHandleLeaks: checkHandleLeaks,
                                returnBehaviorMode: returnBehaviorMode
                            }
                        );
                        
                        // 调试信息：检查外部符号表
                        if (result.externalSymbols.size > 0) {
                            // 可以在这里添加调试日志，但为了性能，只在需要时启用
                            // console.log(`External symbols loaded: ${result.externalSymbols.size} symbols from ${standardLibFiles.length + projectFiles.length} files`);
                        }
                        
                        // 合并语义分析结果到错误集合
                        errors.errors.push(...result.semanticResult.errors);
                        errors.warnings.push(...result.semanticResult.warnings);
                        if (result.semanticResult.checkValidationErrors) {
                            if (!errors.checkValidationErrors) {
                                errors.checkValidationErrors = [];
                            }
                            errors.checkValidationErrors.push(...result.semanticResult.checkValidationErrors);
                        }
                    } else {
                        // 如果未启用未定义检查，使用旧的简单方法
                        const semanticOptions: SemanticAnalyzerOptions = {
                            checkUndefinedBehavior: false,
                            returnBehaviorMode: returnBehaviorMode
                        };
                        const semanticErrors = analyzeSemantics(blockStatement, semanticOptions);
                        
                        // 合并语义分析结果到错误集合
                        errors.errors.push(...semanticErrors.errors);
                        errors.warnings.push(...semanticErrors.warnings);
                        if (semanticErrors.checkValidationErrors) {
                            if (!errors.checkValidationErrors) {
                                errors.checkValidationErrors = [];
                            }
                            errors.checkValidationErrors.push(...semanticErrors.checkValidationErrors);
                        }
                    }
                } catch (error) {
                    // 语义分析失败不应该阻止文件解析，只记录错误
                    console.error(`Semantic analysis failed for ${path.basename(filePath)}:`, error);
                }
            }
        }

        this.applyIgnoreDirectivesToAllErrors(errors, ignoreDirectives);
        
        // 存储到缓存
        if (blockStatement || zincProgram) {
            const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : { mtimeMs: Date.now() };
            const cacheItem = this.cache.get(filePath);
            this.cache.set(filePath, {
                blockStatement: blockStatement || null,
                zincProgram: zincProgram || undefined,
                lastModified: stats.mtimeMs,
                version: (cacheItem?.version || 0) + 1,
                isImmutable,
                content, // 存储原始内容用于提取注释
                errors: errors // 存储错误信息
            });

            // 如果是不可变文件，添加到集合中
            if (isImmutable) {
                this.immutableFiles.add(filePath);
            }

            // 3. 更新补全项缓存（异步，不阻塞）
            // 只对非 Zinc 文件更新补全缓存（Zinc 文件由 ZincCompletionProvider 处理）
            if (blockStatement) {
                this.updateCompletionCache(filePath, blockStatement);
            }

            // 4. 清除跳转缓存（因为文件内容已更新，需要重新计算）
            this.jumpCache.clear(filePath);
            // 5. 清除 hover 缓存（注释/签名可能已变化，避免 hover 显示旧描述）
            this.hoverCache.clearAll();
        }
    }

    /**
     * 处理文件变化（VSCode 文档变化）
     */
    private handleFileChange(filePath: string): void {
        // 如果是特殊文件，即使是在 static 目录下，也要通知 SpecialFileManager
        if (isSpecialFile(filePath)) {
            this.notifySpecialFileManager(filePath, 'update');
            // 特殊文件不进行 AST 解析，直接返回
            return;
        }

        // 静态文件不监听变化
        if (this.isImmutableFile(filePath)) {
            return;
        }

        if (this.shouldIgnoreFile(filePath)) {
            return;
        }

        // 从 VSCode 文档获取内容
        const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === filePath);
        if (document) {
            this.fileEventSubject.next({
                type: 'update',
                filePath,
                content: document.getText()
            });
        }
    }

    /**
     * 处理文件删除
     */
    private handleFileDelete(filePath: string): void {
        // 如果是特殊文件，即使是在 static 目录下，也要通知 SpecialFileManager
        if (isSpecialFile(filePath)) {
            this.notifySpecialFileManager(filePath, 'delete');
            // 特殊文件不进行 AST 解析，直接返回
            return;
        }

        // 从 textmacro 注册表中移除该文件的宏
        this.textMacroRegistry.unregisterFile(filePath);
        
        // 从 define 注册表中移除该文件的宏
        this.defineRegistry.unregisterFile(filePath);
        
        this.cache.delete(filePath);
        this.parserCache.delete(filePath);
        this.jumpCache.clear(filePath);
        this.jumpCache.clearByTargetFile(filePath);
        
        // 从补全项缓存中删除
        const completionCache = CompletionCache.getInstance();
        completionCache.delete(filePath);
        // 只清理该文件的 hover 缓存，避免旧路径命中
        this.hoverCache.clear(filePath);
        
        console.log(`🗑️ Removed cache for ${path.basename(filePath)}`);
    }

    /**
     * 处理文件重命名
     */
    private async handleFileRename(oldPath: string, newPath: string): Promise<void> {
        if (this.shouldIgnoreFile(newPath)) {
            // 如果新路径应该被忽略，直接删除旧缓存
            this.handleFileDelete(oldPath);
            return;
        }

        // 更新 textmacro 注册表：获取旧文件的宏并更新路径
        const oldMacros = this.textMacroRegistry.getByFile(oldPath);
        if (oldMacros.length > 0) {
            // 先移除旧路径的宏
            this.textMacroRegistry.unregisterFile(oldPath);
            // 更新宏的文件路径并重新注册
            oldMacros.forEach(macro => {
                const updatedMacro = { ...macro, filePath: newPath };
                this.textMacroRegistry.register(updatedMacro);
            });
        }

        // 获取旧文件的 BlockStatement
        const oldCache = this.cache.get(oldPath);
        if (oldCache) {
            // 移动到新路径
            this.cache.set(newPath, {
                ...oldCache,
                version: oldCache.version + 1
            });
            this.cache.delete(oldPath);

            // 更新 parser 缓存
            const oldParser = this.parserCache.get(oldPath);
            if (oldParser) {
                oldParser.filePath = newPath;
                this.parserCache.set(newPath, oldParser);
                this.parserCache.delete(oldPath);
            }

            console.log(`📝 Renamed cache: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
            
            // 更新补全项缓存：删除旧路径，新路径会在 handleFileUpdate 中更新
            const completionCache = CompletionCache.getInstance();
            const oldItems = completionCache.get(oldPath);
            completionCache.delete(oldPath);
            // 路径变更后清理 old/new 路径的跳转与 hover 缓存，避免命中旧位置
            this.jumpCache.clear(oldPath);
            this.jumpCache.clear(newPath);
            this.jumpCache.clearByTargetFile(oldPath);
            this.jumpCache.clearByTargetFile(newPath);
            this.hoverCache.clear(oldPath);
            this.hoverCache.clear(newPath);
            if (oldItems.length > 0) {
                // 更新文件路径并重新保存
                oldItems.forEach(item => {
                    (item as any).filePath = newPath;
                });
                completionCache.update(newPath, oldItems);
            }
        } else {
            // 如果旧文件没有缓存，尝试解析新文件
            await this.handleFileUpdate(newPath);
        }
    }

    /**
     * 更新补全项缓存（异步，不阻塞）
     */
    private updateCompletionCache(filePath: string, blockStatement: BlockStatement): void {
        // 异步更新，不阻塞
        setImmediate(() => {
            try {
                const completionCache = CompletionCache.getInstance();
                const items = CompletionExtractor.extractCompletionItems(
                    blockStatement,
                    filePath,
                    (fp) => this.getFileContent(fp),
                    (fp) => {
                        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                        if (workspaceFolder) {
                            try {
                                return vscode.workspace.asRelativePath(fp);
                            } catch {
                                return fp;
                            }
                        }
                        return fp;
                    }
                );
                completionCache.update(filePath, items);
            } catch (error) {
                console.error(`Failed to update completion cache for ${filePath}:`, error);
            }
        });
    }

    /**
     * 解析文件内容为 BlockStatement 或 ZincProgram
     * 使用 streamingParse 进行预处理和解析
     * 对于 .zn 文件，使用 Zinc 解析器
     */
    private parseFile(filePath: string, content: string): BlockStatement | null {
        try {
            const ext = path.extname(filePath).toLowerCase();
            
            // 如果是 .zn 文件，使用 InnerZincParser
            if (ext === '.zn') {
                const zincParser = new InnerZincParser(content, filePath);
                const statements = zincParser.parse();
                const zincProgram = new ZincProgram(statements);
                // 使用 InnerZincParser 的错误收集
                const zincErrors = zincParser.errors;
                
                // 存储 ZincProgram 和错误信息到缓存
                const cacheItem = this.cache.get(filePath);
                if (cacheItem) {
                    cacheItem.zincProgram = zincProgram;
                    cacheItem.errors = zincErrors;
                } else {
                    // 如果缓存项不存在，创建一个新的（这种情况应该很少见）
                    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : { mtimeMs: Date.now() };
                    this.cache.set(filePath, {
                        blockStatement: null,
                        zincProgram: zincProgram,
                        lastModified: stats.mtimeMs,
                        version: 1,
                        isImmutable: this.isImmutableFile(filePath),
                        content: content,
                        errors: zincErrors
                    });
                }
                
                if (zincErrors.errors.length > 0) {
                    console.warn(`Parsing errors in ${path.basename(filePath)}:`, {
                        errors: zincErrors.errors.length,
                        warnings: zincErrors.warnings.length
                    });
                }
                
                // 返回 null，因为 Zinc AST 和 vJass BlockStatement 不兼容
                return null;
            }
            
            // 使用 streamingParse 进行预处理和解析
            // 它会自动处理：移除注释、预处理指令、Lua 段，然后调用 Parser
            const result = streamingParse(content, {
                filePath,
                deleteLineComment: false, // 保留行注释
                textMacroExpander: this.textMacroExpander
            });

            // 如果有错误，记录到控制台
            if (result.errors.errors.length > 0) {
                console.warn(`Parsing errors in ${path.basename(filePath)}:`, {
                    errors: result.errors.errors.length,
                    warnings: result.errors.warnings.length
                });
            }

            // 存储错误信息到缓存（如果缓存项已存在）
            const cacheItem = this.cache.get(filePath);
            if (cacheItem) {
                cacheItem.errors = result.errors;
                // 确保 zincProgram 为 undefined（非 Zinc 文件）
                cacheItem.zincProgram = undefined;
            }
            // 注意：如果缓存项不存在，错误信息将在 handleFileUpdate 中通过 parseFile 的返回值存储

            // 注册 #define 宏到注册表
            const parsingConfig = this.config?.parsing || {};
            const enablePreprocessor = parsingConfig.enablePreprocessor !== false; // 默认启用
            if (enablePreprocessor && result.preprocessCollection.defines.length > 0) {
                this.defineRegistry.updateFile(filePath, result.preprocessCollection.defines);
            }

            // 返回解析后的 BlockStatement
            return result.blockStatement;
        } catch (error) {
            console.error(`Failed to parse file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * 检查文件是否为不可变文件（静态文件）
     */
    private isImmutableFile(filePath: string): boolean {
        const fileName = path.basename(filePath).toLowerCase();
        const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

        // 检查是否在扩展的 static 目录下
        const extensionStaticDir = path.resolve(__dirname, "../../../static").replace(/\\/g, '/').toLowerCase();
        if (normalizedPath.includes(extensionStaticDir)) {
            return true;
        }

        // 检查是否在工作区的 static 目录下
        if (normalizedPath.includes('/static/') || normalizedPath.includes('\\static\\')) {
            return true;
        }

        // 标准库文件也是不可变的
        if (STANDARD_LIBRARY_ORDER.includes(fileName)) {
            return true;
        }

        return false;
    }

    /**
     * 检查文件是否为 JASS 文件
     */
    private isJassFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        const validExtensions = ['.j', '.jass', '.ai', '.zn'];
        return validExtensions.includes(ext);
    }

    /**
     * 加载 jass.config.json 配置文件
     */
    private loadConfig(): void {
        if (!this.workspaceRoot) {
            return;
        }

        this.configPath = path.join(this.workspaceRoot, 'jass.config.json');
        
        if (!fs.existsSync(this.configPath)) {
            this.config = null;
            return;
        }

        try {
            const configContent = fs.readFileSync(this.configPath, 'utf-8');
            const configJson = JSON.parse(configContent);
            
            // 加载所有配置项
            this.config = {
                excludes: configJson.excludes || [],
                includes: configJson.includes || [],
                parsing: configJson.parsing || {},
                standardLibraries: configJson.standardLibraries || {},
                diagnostics: configJson.diagnostics || {}
            };
            
            const excludesCount = this.config.excludes?.length || 0;
            const includesCount = this.config.includes?.length || 0;
            const hasParsing = Object.keys(this.config.parsing || {}).length > 0;
            const hasStandardLibraries = Object.keys(this.config.standardLibraries || {}).length > 0;
            const hasDiagnostics = Object.keys(this.config.diagnostics || {}).length > 0;
            
            console.log(`📋 Loaded jass.config.json: ${excludesCount} excludes, ${includesCount} includes, ` +
                       `parsing: ${hasParsing}, standardLibraries: ${hasStandardLibraries}, diagnostics: ${hasDiagnostics}`);
        } catch (error) {
            console.warn(`Failed to parse jass.config.json: ${error}`);
            this.config = null;
        }
    }

    /**
     * 检查文件路径是否匹配 glob 模式
     * 使用 VSCode 内置的 glob 实现（通过 RelativePattern 和 findFiles）
     */
    private matchesGlobPattern(filePath: string, pattern: string, workspaceRoot: string): boolean {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return false;
            }

            // 如果模式是绝对路径，转换为相对路径
            let normalizedPattern = pattern;
            if (path.isAbsolute(pattern)) {
                if (!path.isAbsolute(filePath)) {
                    return false;
                }
                // 转换为相对于工作区的路径
                normalizedPattern = path.relative(workspaceRoot, pattern).replace(/\\/g, '/');
            }

            // 将文件路径转换为相对于工作区根目录的路径
            const relativeFilePath = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
            
            // 标准化模式（使用正斜杠）
            normalizedPattern = normalizedPattern.replace(/\\/g, '/');
            
            // 使用 VSCode 的 RelativePattern 来创建模式
            const relativePattern = new vscode.RelativePattern(workspaceFolder, normalizedPattern);
            
            // 使用 VSCode 的 glob 匹配逻辑
            // VSCode 内部使用 minimatch，我们可以通过检查文件 URI 是否匹配模式来判断
            // 由于 VSCode 没有直接暴露同步的匹配函数，我们使用一个简化的匹配逻辑
            // 这个逻辑基于 VSCode 的 glob 匹配规则
            return this.matchGlobPatternSync(relativeFilePath, normalizedPattern);
        } catch (error) {
            console.error(`Error matching glob pattern: ${error}`);
            return false;
        }
    }

    /**
     * 同步方式匹配 glob 模式
     * 使用与 VSCode 兼容的 glob 匹配逻辑
     * 支持基本的 glob 模式：*, **, ?, [chars], {a,b}
     */
    private matchGlobPatternSync(filePath: string, pattern: string): boolean {
        // 将模式转换为正则表达式
        // 处理 ** (匹配任意路径，包括 /)
        let regexPattern = pattern
            .replace(/\\/g, '/')
            // 先处理 **，避免被 * 替换
            .replace(/\*\*/g, '___GLOBSTAR___')
            // 转义特殊字符
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            // 恢复 ** 并替换为匹配任意字符（包括 /）
            .replace(/___GLOBSTAR___/g, '.*')
            // * 匹配除 / 外的任意字符
            .replace(/\*/g, '[^/]*')
            // ? 匹配除 / 外的单个字符
            .replace(/\?/g, '[^/]')
            // 处理字符类 [abc] 或 [^abc]
            .replace(/\[([^\]]+)\]/g, (match, chars) => {
                // 如果第一个字符是 ^，表示否定
                if (chars.startsWith('^')) {
                    return `[^${chars.substring(1).replace(/\\/g, '\\\\')}]`;
                }
                return `[${chars.replace(/\\/g, '\\\\')}]`;
            });
        
        // 处理大括号扩展 {a,b} -> (a|b)
        regexPattern = regexPattern.replace(/\{([^}]+)\}/g, (match, content) => {
            const alternatives = content.split(',').map((alt: string) => alt.trim());
            return `(${alternatives.map((alt: string) => alt.replace(/[.+^${}()|[\]\\]/g, '\\$&')).join('|')})`;
        });
        
        try {
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(filePath);
        } catch (error) {
            console.error(`Error creating regex for pattern ${pattern}: ${error}`);
            return false;
        }
    }

    /**
     * 检查文件是否应该被包含（根据 includes 配置）
     */
    private shouldIncludeFile(filePath: string): boolean {
        if (!this.config || !this.config.includes || this.config.includes.length === 0) {
            // 如果没有 includes 配置，默认包含所有 JASS 文件
            return true;
        }

        if (!this.workspaceRoot) {
            return true;
        }

        // 如果配置了 includes，只要匹配任何一个模式就包含
        for (const pattern of this.config.includes) {
            if (this.matchesGlobPattern(filePath, pattern, this.workspaceRoot)) {
                return true;
            }
        }

        // 如果没有匹配任何 includes 模式，则不包含
        return false;
    }

    /**
     * 检查文件是否应该被排除（根据 excludes 配置）
     */
    private shouldExcludeFile(filePath: string): boolean {
        if (!this.config || !this.config.excludes || this.config.excludes.length === 0) {
            return false;
        }

        if (!this.workspaceRoot) {
            return false;
        }

        // 检查是否匹配任何 excludes 模式
        for (const pattern of this.config.excludes) {
            if (this.matchesGlobPattern(filePath, pattern, this.workspaceRoot)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否应该忽略文件
     */
    private shouldIgnoreFile(filePath: string): boolean {
        // 如果设置了忽略配置，直接返回 false（不忽略）
        if (this.options.ignoreConfig) {
            return false;
        }

        const fileName = path.basename(filePath).toLowerCase();
        
        // 检查是否在忽略列表中（特殊文件由 SpecialFileManager 处理，这里忽略）
        if (IGNORED_FILES.includes(fileName)) {
            return true;
        }

        // 检查文件扩展名
        if (!this.isJassFile(filePath)) {
            return true;
        }

        // 如果配置了 includes，先检查是否应该包含
        if (!this.shouldIncludeFile(filePath)) {
            return true;
        }

        // 检查是否应该被排除
        if (this.shouldExcludeFile(filePath)) {
            return true;
        }

        return false;
    }

    /**
     * 通知 SpecialFileManager 特殊文件变化
     */
    private notifySpecialFileManager(filePath: string, eventType: 'create' | 'update' | 'delete'): void {
        try {
            // 动态导入，避免循环依赖
            const { SpecialFileManager } = require('./special/special-file-manager');
            const manager = SpecialFileManager.getInstance();
            
            if (eventType === 'delete') {
                manager.deleteFile(filePath);
                console.log(`📢 Notified SpecialFileManager: deleted ${path.basename(filePath)}`);
            } else {
                // create 或 update 都需要读取文件内容
                const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === filePath);
                if (document) {
                    const content = document.getText();
                    manager.updateFile(filePath, content);
                    console.log(`📢 Notified SpecialFileManager: ${eventType} ${path.basename(filePath)}`);
                } else {
                    // 如果文档未打开，从文件系统读取
                    try {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        manager.updateFile(filePath, content);
                        console.log(`📢 Notified SpecialFileManager: ${eventType} ${path.basename(filePath)} (from filesystem)`);
                    } catch (error) {
                        console.error(`Failed to read special file ${filePath}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to notify SpecialFileManager for ${filePath}:`, error);
        }
    }

    /**
     * 检查文件是否在工作目录下（可变文件）
     */
    private isWorkspaceFile(filePath: string): boolean {
        if (!this.workspaceRoot) {
            return false;
        }

        const normalizedFilePath = path.normalize(filePath).toLowerCase();
        const normalizedWorkspaceRoot = path.normalize(this.workspaceRoot).toLowerCase();

        // 检查文件路径是否以工作区根目录开头
        return normalizedFilePath.startsWith(normalizedWorkspaceRoot);
    }

    /**
     * 获取文件的 BlockStatement
     */
    public getBlockStatement(filePath: string): BlockStatement | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.blockStatement || null;
    }

    /**
     * 获取文件的 ZincProgram（仅用于 .zn 文件）
     */
    public getZincProgram(filePath: string): ZincProgram | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.zincProgram || null;
    }

    /**
     * 检查文件是否为 Zinc 文件
     */
    public isZincFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.zn';
    }

    /**
     * 获取文件的错误集合
     */
    public getErrors(filePath: string): ErrorCollection | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.errors || null;
    }

    /**
     * 获取文件的原始内容（用于提取注释）
     */
    public getFileContent(filePath: string): string | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.content || null;
    }

    /**
     * 获取文件缓存信息
     */
    public getCacheInfo(filePath: string): { lastModified: number; version: number } | null {
        const cacheItem = this.cache.get(filePath);
        if (!cacheItem) {
            return null;
        }
        return {
            lastModified: cacheItem.lastModified,
            version: cacheItem.version
        };
    }

    /**
     * 手动触发文件更新
     */
    public async updateFile(filePath: string, content?: string): Promise<void> {
        await this.handleFileUpdate(filePath, content);
    }

    /**
     * 手动触发文件重命名
     */
    public async renameFile(oldPath: string, newPath: string): Promise<void> {
        await this.handleFileRename(oldPath, newPath);
    }

    /**
     * 手动触发文件删除
     */
    public deleteFile(filePath: string): void {
        this.handleFileDelete(filePath);
    }

    /**
     * 获取所有缓存的文件路径
     */
    public getAllCachedFiles(): string[] {
        const files = Array.from(this.cache.keys());
        // 调试：仅在工作区初始化完成后提示一次，避免 hover 期间重复刷屏
        if (files.length === 0 && this.hasInitializedWorkspace && !this.hasLoggedEmptyCacheWarning) {
            console.warn('[DataEnterManager] getAllCachedFiles: cache is empty');
            this.hasLoggedEmptyCacheWarning = true;
        }
        if (files.length > 0) {
            this.hasLoggedEmptyCacheWarning = false;
        }
        return files;
    }

    /**
     * 获取缓存统计信息（用于调试）
     */
    public getCacheStats(): {
        totalFiles: number;
        immutableFiles: number;
        cachedFiles: string[];
        immutableFileList: string[];
    } {
        return {
            totalFiles: this.cache.size,
            immutableFiles: this.immutableFiles.size,
            cachedFiles: Array.from(this.cache.keys()),
            immutableFileList: Array.from(this.immutableFiles)
        };
    }

    /**
     * 按顺序获取标准库文件的 BlockStatement
     * @returns 按解析顺序返回的 BlockStatement 数组 [common.j, common.ai, blizzard.j]
     */
    public getStandardLibraries(workspaceRoot?: string): BlockStatement[] {
        const root = workspaceRoot || this.workspaceRoot;
        if (!root) {
            return [];
        }

        const results: BlockStatement[] = [];
        for (const fileName of STANDARD_LIBRARY_ORDER) {
            const filePath = path.join(root, fileName);
            const blockStatement = this.getBlockStatement(filePath);
            if (blockStatement) {
                results.push(blockStatement);
            }
        }
        return results;
    }

    /**
     * 获取不可变文件列表
     */
    public getImmutableFiles(): string[] {
        return Array.from(this.immutableFiles);
    }

    /**
     * 检查文件是否为不可变文件
     */
    public isFileImmutable(filePath: string): boolean {
        return this.immutableFiles.has(filePath) || this.isImmutableFile(filePath);
    }

    /**
     * 清空所有缓存
     */
    public clearCache(): void {
        this.cache.clear();
        this.parserCache.clear();
        this.jumpCache.clearAll();
        this.hoverCache.clearAll();
        const completionCache = CompletionCache.getInstance();
        completionCache.clear();
        console.log('🧹 Cleared all cache');
    }

    /**
     * 更新跳转缓存
     */
    public updateJumpCache(filePath: string, symbolName: string, locations: vscode.Location[]): void {
        // 将 locations 转换为 JumpCacheItem 格式
        const jumpCacheItems: JumpCacheItem[] = locations.map(loc => ({
            symbolName: symbolName,
            location: {
                uri: loc.uri.fsPath,
                range: {
                    start: { line: loc.range.start.line, character: loc.range.start.character },
                    end: { line: loc.range.end.line, character: loc.range.end.character }
                }
            },
            filePath: loc.uri.fsPath
        }));
        
        this.jumpCache.update(filePath, jumpCacheItems);
    }

    /**
     * 初始化工作区文件
     * 两阶段解析：先收集所有 textmacro，再解析文件
     * 无工作区时仍注册文档监听，保证单文件打开/编辑时解析与功能可用
     */
    public async initializeWorkspace(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const hasWorkspace = !!workspaceFolder;
        const workspaceRoot = workspaceFolder?.uri.fsPath;
        this.hasInitializedWorkspace = false;

        if (hasWorkspace && workspaceRoot) {
            console.log('📦 Phase 1: Collecting TextMacros...');
            // 阶段1：收集所有文件中的 textmacro 定义
            await this.collectAllTextMacros(workspaceRoot);
            
            const stats = this.textMacroRegistry.getStats();
            console.log(`✅ Collected ${stats.totalMacros} textmacros from ${stats.totalFiles} files`);

            console.log('📦 Phase 2: Parsing files with TextMacro expansion...');
            // 阶段2：解析所有文件（此时 runtextmacro 可以正确展开）
            await this.loadStandardLibraries(workspaceRoot);
            await this.loadStaticFiles(workspaceRoot);
            await this.loadWorkspaceFiles(workspaceRoot);
            
            const cacheStats = this.getCacheStats();
            console.log('✅ Workspace initialization complete');
            console.log(`📊 Cache Stats: ${cacheStats.totalFiles} files cached (${cacheStats.immutableFiles} immutable)`);
            if (cacheStats.totalFiles > 0) {
                const fileList = cacheStats.cachedFiles.slice(0, 10).map(f => path.basename(f)).join(', ');
                console.log(`📁 Sample cached files: ${fileList}${cacheStats.cachedFiles.length > 10 ? '...' : ''}`);
            }
        } else {
            console.log('📂 No workspace folder; single-file mode enabled (parse on open/edit).');
        }

        // 无论是否有工作区，都注册事件与文档监听，保证解析和补全/诊断等功能可用
        this.setupEventHandlers();
        this.setupConfigWatcher();
        if (this.options.enableFileWatcher) {
            this.setupFileWatcher();
        }

        // 无工作区时：对当前已打开的 JASS 文档做一次解析，否则已打开的单文件不会进缓存
        if (!hasWorkspace) {
            vscode.workspace.textDocuments.forEach((doc) => {
                if (this.isJassFile(doc.uri.fsPath) && !this.shouldIgnoreFile(doc.uri.fsPath)) {
                    this.handleFileChange(doc.uri.fsPath);
                }
            });
        }

        this.hasInitializedWorkspace = true;
    }

    /**
     * 设置事件处理器（监听和数据处理分离）
     * 监听器只负责触发事件，不阻塞
     */
    private setupEventHandlers(): void {
        // 使用 RxJS 处理文件事件流
        this.fileEventSubject
            .pipe(
                // 防抖处理，避免频繁更新
                debounceTime(this.options.debounceDelay!)
            )
            .subscribe({
                next: (event) => {
                    // 不等待，异步处理文件事件，不阻塞
                    this.processFileEvent(event).then(
                        (result) => {
                            if (result.success) {
                                // 静默处理成功，减少日志输出
                                // console.log(`✅ Processed ${result.event.type} for ${path.basename(result.event.filePath)}`);
                            } else {
                                console.error(`❌ Failed to process ${result.event.type} for ${path.basename(result.event.filePath)}: ${result.error}`);
                            }
                        },
                        (error) => {
                            console.error('❌ Error processing file event:', error);
                        }
                    );
                },
                error: (error) => {
                    console.error('❌ Error in file event stream:', error);
                }
            });
    }

    /**
     * 设置配置文件监听器
     */
    private setupConfigWatcher(): void {
        if (!this.workspaceRoot) {
            return;
        }

        // 监听 jass.config.json 文件保存事件
        const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
            const filePath = document.uri.fsPath;
            const configPath = path.join(this.workspaceRoot!, 'jass.config.json');
            
            // 检查是否是 jass.config.json 文件
            if (filePath === configPath || path.normalize(filePath) === path.normalize(configPath)) {
                console.log('📋 jass.config.json saved, reloading...');
                this.loadConfig();
                // 配置保存后，重新评估已缓存的文件
                this.revalidateCachedFiles();
                // 触发配置重新加载回调
                this.triggerConfigReloadCallbacks();
            }
        });

        // 监听 jass.config.json 文件创建和删除（使用文件系统监听器）
        const configPattern = new vscode.RelativePattern(
            vscode.workspace.workspaceFolders?.[0] || vscode.Uri.file('/'),
            'jass.config.json'
        );

        this.configWatcher = vscode.workspace.createFileSystemWatcher(configPattern);

        // 监听配置文件创建
        this.configWatcher.onDidCreate((uri) => {
            console.log('📋 jass.config.json created, loading...');
            this.loadConfig();
            // 配置创建后，重新评估已缓存的文件
            this.revalidateCachedFiles();
            // 触发配置重新加载回调
            this.triggerConfigReloadCallbacks();
        });

        // 监听配置文件删除
        this.configWatcher.onDidDelete((uri) => {
            console.log('📋 jass.config.json deleted, clearing config...');
            this.config = null;
            this.configPath = undefined;
            // 配置删除后，重新评估已缓存的文件（现在应该都包含）
            this.revalidateCachedFiles();
        });

        this.disposables.push(this.configWatcher);
        this.disposables.push(saveDisposable);
    }

    /**
     * 重新验证已缓存的文件（根据新的配置）
     */
    private revalidateCachedFiles(): void {
        const filesToRecheck: string[] = [];
        
        // 收集所有需要重新检查的文件
        for (const filePath of this.cache.keys()) {
            // 如果文件现在应该被忽略，但之前没有被忽略，需要移除
            // 如果文件现在不应该被忽略，但之前被忽略了，需要重新加载
            if (this.shouldIgnoreFile(filePath)) {
                // 文件现在应该被忽略，如果之前没有被忽略，需要移除缓存
                if (!this.isImmutableFile(filePath) && !isSpecialFile(filePath)) {
                    filesToRecheck.push(filePath);
                }
            }
        }

        // 移除应该被忽略的文件缓存
        for (const filePath of filesToRecheck) {
            if (this.shouldIgnoreFile(filePath)) {
                console.log(`🗑️ Removing cached file due to config change: ${path.basename(filePath)}`);
                this.handleFileDelete(filePath);
            }
        }

        // 重新加载之前被忽略但现在应该包含的文件
        // 这需要扫描工作区，但为了性能，我们只在文件被访问时重新加载
        console.log(`✅ Config reloaded, ${filesToRecheck.length} files revalidated`);
    }

    /**
     * 设置文件监听器（监听和数据处理分离）
     * 监听器只负责触发事件，不阻塞
     */
    private setupFileWatcher(): void {
        // 只监听工作区文件变化（不包括 static 目录）
        const pattern = new vscode.RelativePattern(
            vscode.workspace.workspaceFolders?.[0] || vscode.Uri.file('/'),
            '**/*.{j,jass,ai,zn}'
        );

        this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

        // 监听文件创建（只处理可变文件）
        this.fileWatcher.onDidCreate((uri) => {
            const filePath = uri.fsPath;
            // 只监听工作区文件，不监听静态文件
            if (this.isWorkspaceFile(filePath) && !this.isImmutableFile(filePath)) {
                this.handleFileCreate(filePath);
            }
        });

        // 监听文件删除（只处理可变文件）
        this.fileWatcher.onDidDelete((uri) => {
            const filePath = uri.fsPath;
            // 只监听工作区文件，不监听静态文件
            if (this.isWorkspaceFile(filePath) && !this.isImmutableFile(filePath)) {
                this.handleFileDelete(filePath);
            }
        });

        // 监听文件变化（只处理可变文件）
        this.fileWatcher.onDidChange((uri) => {
            const filePath = uri.fsPath;
            // 只监听工作区文件，不监听静态文件
            if (this.isWorkspaceFile(filePath) && !this.isImmutableFile(filePath)) {
                this.handleFileChange(filePath);
            }
        });

        this.disposables.push(this.fileWatcher);

        // 监听文档打开事件（立即解析，确保 outline 可以显示）
        const openDisposable = vscode.workspace.onDidOpenTextDocument((document) => {
            const filePath = document.uri.fsPath;
            // 只处理 JASS 文件
            if (!this.isJassFile(filePath)) {
                return;
            }
            // 如果是不可变文件或应该忽略的文件，跳过
            if (this.isImmutableFile(filePath) || this.shouldIgnoreFile(filePath)) {
                return;
            }
            // 如果文件还没有被解析，立即解析
            if (!this.cache.has(filePath)) {
                const content = document.getText();
                if (content) {
                    this.handleFileChange(filePath);
                }
            }
        });
        this.disposables.push(openDisposable);

        // 监听文档变化事件（只处理可变文件）
        const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const filePath = event.document.uri.fsPath;
            // 特殊文件需要监听，即使被忽略
            if (isSpecialFile(filePath)) {
                this.handleFileChange(filePath);
                return;
            }
            if (this.isImmutableFile(filePath) || this.shouldIgnoreFile(filePath)) {
                return;
            }
            this.handleFileChange(filePath);
        });
        this.disposables.push(changeDisposable);

        // 监听文档保存事件（只处理可变文件）
        const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
            const filePath = document.uri.fsPath;
            // 特殊文件需要监听，即使被忽略
            if (isSpecialFile(filePath)) {
                this.handleFileChange(filePath);
                return;
            }
            if (this.isImmutableFile(filePath) || this.shouldIgnoreFile(filePath)) {
                return;
            }
            this.handleFileChange(filePath);
        });
        this.disposables.push(saveDisposable);

        // 监听文件删除事件（只处理可变文件）
        const deleteDisposable = vscode.workspace.onDidDeleteFiles((event) => {
            event.files.forEach(uri => {
                const filePath = uri.fsPath;
                if (!this.isImmutableFile(filePath)) {
                    this.handleFileDelete(filePath);
                }
            });
        });
        this.disposables.push(deleteDisposable);

        // 监听文件重命名事件（只处理可变文件）
        const renameDisposable = vscode.workspace.onDidRenameFiles((event) => {
            event.files.forEach(({ oldUri, newUri }) => {
                const newPath = newUri.fsPath;
                if (!this.isImmutableFile(newPath)) {
                    this.fileEventSubject.next({
                        type: 'rename',
                        filePath: newPath,
                        oldPath: oldUri.fsPath
                    });
                }
            });
        });
        this.disposables.push(renameDisposable);
    }

    /**
     * 阶段1：收集所有文件中的 textmacro 定义
     * @param workspaceRoot 工作区根目录
     */
    private async collectAllTextMacros(workspaceRoot: string): Promise<void> {
        const collection = { errors: [], warnings: [] };
        
        // 收集标准库文件中的 textmacro
        for (const fileName of STANDARD_LIBRARY_ORDER) {
            const filePath = path.join(workspaceRoot, fileName);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    this.textMacroCollector.collectFromFile(filePath, content, collection);
                } catch (error) {
                    console.error(`Failed to collect textmacros from ${fileName}:`, error);
                }
            }
        }
        
        // 收集 static 目录下的 textmacro
        const staticDir = path.join(workspaceRoot, 'static');
        if (fs.existsSync(staticDir) && fs.statSync(staticDir).isDirectory()) {
            this.collectTextMacrosFromDirectory(staticDir, collection);
        }
        
        // 收集工作区文件中的 textmacro
        this.collectTextMacrosFromDirectory(workspaceRoot, collection);
        
        // 报告收集阶段的错误和警告
        if (collection.errors.length > 0) {
            console.warn(`TextMacro collection errors: ${collection.errors.length}`);
        }
        if (collection.warnings.length > 0) {
            console.warn(`TextMacro collection warnings: ${collection.warnings.length}`);
        }
    }
    
    /**
     * 从目录递归收集 textmacro
     * @param dir 目录路径
     * @param collection 错误和警告收集器
     */
    private collectTextMacrosFromDirectory(
        dir: string,
        collection: { errors: any[]; warnings: any[] }
    ): void {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // 跳过忽略的文件
                if (this.shouldIgnoreFile(fullPath)) {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    // 递归处理子目录
                    this.collectTextMacrosFromDirectory(fullPath, collection);
                } else if (entry.isFile()) {
                    // 检查文件扩展名
                    const ext = path.extname(entry.name).toLowerCase();
                    if (['.j', '.jass', '.ai', '.zn'].includes(ext)) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf-8');
                            this.textMacroCollector.collectFromFile(fullPath, content, collection);
                        } catch (error) {
                            console.error(`Failed to collect textmacros from ${fullPath}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to read directory ${dir}:`, error);
        }
    }

    /**
     * 按顺序加载标准库文件
     * 优先使用配置中的路径，然后从工作区根目录查找，最后从扩展的 static 目录查找
     */
    private async loadStandardLibraries(workspaceRoot: string): Promise<void> {
        const startTime = Date.now();
        let totalCandidates = 0;
        let notFoundCount = 0;
        let parsedFromSourceCount = 0;
        const apiVersion = vscode.workspace.getConfiguration('jass').get<string>('apiVersion', 'off');
        const legacyApiVersions = new Set(['1.20', '1.24', '1.26a', '1.27', '1.27a']);
        const strictLegacyMode = legacyApiVersions.has((apiVersion || '').toLowerCase());

        // 扩展 static 目录候选路径（兼容不同编译/运行目录）
        const extensionStaticDirCandidates = [
            path.resolve(__dirname, "../../../static"),
            path.resolve(__dirname, "../../../../static"),
            path.resolve(__dirname, "../../static")
        ];
        const extensionStaticDir = extensionStaticDirCandidates.find((dir) => {
            try {
                return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
            } catch {
                return false;
            }
        });
        
        console.log(`📚 Scanning for standard libraries...`);
        console.log(`   Workspace root: ${workspaceRoot}`);
        console.log(`   Extension static: ${extensionStaticDir}`);
        
        for (const fileName of STANDARD_LIBRARY_ORDER) {
            let filePath: string | null = null;
            
            // 1. 优先使用配置中的路径
            if (this.config?.standardLibraries && this.config.standardLibraries[fileName as keyof StandardLibrariesConfig]) {
                const configPath = this.config.standardLibraries[fileName as keyof StandardLibrariesConfig];
                if (configPath) {
                    // 如果是相对路径，相对于工作区根目录
                    if (path.isAbsolute(configPath)) {
                        filePath = configPath;
                    } else {
                        filePath = path.resolve(workspaceRoot, configPath);
                    }
                    if (fs.existsSync(filePath)) {
                        console.log(`📚 Using configured path for ${fileName}: ${filePath}`);
                    } else {
                        console.warn(`⚠️ Configured path for ${fileName} not found: ${filePath}`);
                        filePath = null;
                    }
                }
            }
            
            // 2. 如果配置路径不存在，从工作区根目录查找
            if (!filePath || !fs.existsSync(filePath)) {
                filePath = path.join(workspaceRoot, fileName);
                if (!fs.existsSync(filePath)) {
                    // 3. 仅在非 legacy 严格模式下，从扩展 static 回退
                    if (!strictLegacyMode) {
                        if (extensionStaticDir) {
                            filePath = path.join(extensionStaticDir, fileName);
                        } else {
                            filePath = null;
                        }
                    } else {
                        filePath = null;
                    }
                }
            }
            
            if (filePath && fs.existsSync(filePath)) {
                totalCandidates++;
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    await this.handleFileUpdate(filePath, content);
                    parsedFromSourceCount++;
                    console.log(`📚 Loaded standard library: ${fileName} (from ${path.dirname(filePath)})`);
                } catch (error) {
                    console.error(`Failed to load standard library ${fileName}:`, error);
                }
            } else {
                notFoundCount++;
                console.log(`ℹ️ Standard library not found: ${fileName} (checked config, workspace and extension static)`);
            }
        }

        const elapsedMs = Date.now() - startTime;
        console.log(
            `📚 Standard libraries loaded in ${elapsedMs}ms ` +
            `(found=${totalCandidates}, missing=${notFoundCount}, parsed=${parsedFromSourceCount})`
        );
        if (strictLegacyMode) {
            console.log(`📚 Legacy API mode (${apiVersion}): extension static fallback disabled`);
        }
    }

    /**
     * 加载 static 目录下的文件
     * 从扩展的 static 目录加载（不是工作区的 static 目录）
     */
    private async loadStaticFiles(workspaceRoot: string): Promise<void> {
        const startTime = Date.now();
        let totalFiles = 0;
        let parsedFromSourceCount = 0;
        const apiVersion = vscode.workspace.getConfiguration('jass').get<string>('apiVersion', 'off');
        const legacyApiVersions = new Set(['1.20', '1.24', '1.26a', '1.27', '1.27a']);
        const strictLegacyMode = legacyApiVersions.has((apiVersion || '').toLowerCase());

        // 扩展的 static 目录路径（相对于扩展安装目录）
        // 尝试多个可能的路径（因为编译后的 __dirname 位置可能不同）
        const possiblePaths = [
            path.resolve(__dirname, "../../../static"),  // out/provider -> static
            path.resolve(__dirname, "../../../../static"), // out/provider -> static (如果更深)
            path.resolve(__dirname, "../../static"),     // out/provider -> static (如果更浅)
        ];
        
        // 也检查工作区的 static 目录（如果存在）
        const workspaceStaticDir = path.join(workspaceRoot, 'static');
        
        const staticDirs: string[] = [];
        
        // 优先加载扩展的 static 目录（legacy 版本模式下禁用，避免高版本库污染）
        if (!strictLegacyMode) {
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath) && fs.statSync(possiblePath).isDirectory()) {
                    staticDirs.push(possiblePath);
                    break; // 找到第一个就停止
                }
            }
        }
        
        // 也加载工作区的 static 目录（如果存在）
        if (fs.existsSync(workspaceStaticDir) && fs.statSync(workspaceStaticDir).isDirectory()) {
            staticDirs.push(workspaceStaticDir);
        }
        
        if (staticDirs.length === 0) {
            console.log(`ℹ️ No static directories found (checked extension and workspace)`);
            return;
        }

        const loadFilesInDir = async (dir: string, baseDir: string): Promise<void> => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await loadFilesInDir(fullPath, baseDir);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (['.j', '.jass', '.ai', '.zn'].includes(ext) && !this.shouldIgnoreFile(fullPath)) {
                            try {
                                totalFiles++;
                                const content = fs.readFileSync(fullPath, 'utf-8');
                                await this.handleFileUpdate(fullPath, content);
                                parsedFromSourceCount++;
                            } catch (error) {
                                console.error(`Failed to load static file ${fullPath}:`, error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to read directory ${dir}:`, error);
            }
        };

        // 加载所有找到的 static 目录
        for (const staticDir of staticDirs) {
            await loadFilesInDir(staticDir, staticDir);
        }

        const elapsedMs = Date.now() - startTime;
        console.log(
            `📦 Static files loaded in ${elapsedMs}ms ` +
            `(total=${totalFiles}, parsed=${parsedFromSourceCount})`
        );
        if (strictLegacyMode) {
            console.log(`📦 Legacy API mode (${apiVersion}): extension static files disabled`);
        }

        // 通知 SpecialFileManager 重新初始化（会扫描所有特殊文件，包括 static 目录下的）
        try {
            const { SpecialFileManager } = require('./special/special-file-manager');
            const manager = SpecialFileManager.getInstance();
            await manager.initialize(workspaceRoot);
            console.log(`📢 SpecialFileManager reloaded after static files loaded`);
        } catch (error) {
            console.error(`Failed to reload SpecialFileManager:`, error);
        }
    }

    /**
     * 加载工作区文件（可变文件）
     */
    private async loadWorkspaceFiles(workspaceRoot: string): Promise<void> {
        const loadFilesInDir = async (dir: string): Promise<void> => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    // 跳过 static 目录（已在 loadStaticFiles 中处理）
                    if (entry.isDirectory()) {
                        const normalizedPath = fullPath.replace(/\\/g, '/').toLowerCase();
                        if (normalizedPath.includes('/static/') || normalizedPath.includes('\\static\\')) {
                            continue; // 跳过 static 目录
                        }
                        await loadFilesInDir(fullPath);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (['.j', '.jass', '.ai', '.zn'].includes(ext)) {
                            // 只处理工作区文件，排除静态文件和标准库文件
                            if (this.isWorkspaceFile(fullPath) && 
                                !this.isImmutableFile(fullPath) && 
                                !this.shouldIgnoreFile(fullPath)) {
                                try {
                                    const content = fs.readFileSync(fullPath, 'utf-8');
                                    await this.handleFileUpdate(fullPath, content);
                                    console.log(`📄 Loaded workspace file: ${path.relative(workspaceRoot, fullPath)}`);
                                } catch (error) {
                                    console.error(`Failed to load workspace file ${fullPath}:`, error);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to read directory ${dir}:`, error);
            }
        };

        // 递归扫描工作区目录（排除 static 目录）
        await loadFilesInDir(workspaceRoot);
        
        // 同时处理已打开的文档（如果还没有被加载）
        const pendingOpenDocs: Array<Promise<void>> = [];
        vscode.workspace.textDocuments.forEach(document => {
            const filePath = document.uri.fsPath;
            if (this.isWorkspaceFile(filePath) && 
                !this.isImmutableFile(filePath) && 
                !this.shouldIgnoreFile(filePath) &&
                !this.cache.has(filePath)) {
                // 如果文件还没有被加载，使用文档内容
                const content = document.getText();
                if (content) {
                    pendingOpenDocs.push(this.handleFileUpdate(filePath, content));
                }
            }
        });

        if (pendingOpenDocs.length > 0) {
            await Promise.allSettled(pendingOpenDocs);
        }
    }

    /**
     * 获取当前配置
     */
    public getConfig(): JassConfig | null {
        return this.config;
    }

    /**
     * 注册配置重新加载回调
     */
    public onConfigReload(callback: () => void): void {
        this.configReloadCallbacks.push(callback);
    }

    /**
     * 配置重新加载时触发回调
     */
    private triggerConfigReloadCallbacks(): void {
        this.configReloadCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in config reload callback:', error);
            }
        });
    }

    /**
     * 获取标准库文件名列表
     */
    private getStandardLibraryNames(): string[] {
        const names: string[] = [];
        if (this.config?.standardLibraries) {
            for (const fileName of STANDARD_LIBRARY_ORDER) {
                const configPath = this.config.standardLibraries[fileName as keyof StandardLibrariesConfig];
                if (configPath) {
                    // 如果配置了标准库路径，将其添加到列表中
                    // 这里我们只返回文件名，因为语义分析器可能需要知道哪些是标准库
                    names.push(fileName);
                }
            }
        }
        // 如果没有配置，返回默认的标准库列表
        return names.length > 0 ? names : STANDARD_LIBRARY_ORDER;
    }

    /**
     * 获取标准库文件列表（用于语义分析）
     * @param workspaceRoot 工作区根目录
     * @returns 标准库文件列表（包含路径和内容）
     */
    private getStandardLibraryFiles(workspaceRoot: string): Array<{ filePath: string; content: string }> {
        const files: Array<{ filePath: string; content: string }> = [];
        const extensionStaticDir = path.resolve(__dirname, "../../../static");
        
        for (const fileName of STANDARD_LIBRARY_ORDER) {
            let filePath: string | null = null;
            
            // 1. 优先使用配置中的路径
            if (this.config?.standardLibraries && this.config.standardLibraries[fileName as keyof StandardLibrariesConfig]) {
                const configPath = this.config.standardLibraries[fileName as keyof StandardLibrariesConfig];
                if (configPath) {
                    if (path.isAbsolute(configPath)) {
                        filePath = configPath;
                    } else {
                        filePath = path.resolve(workspaceRoot, configPath);
                    }
                }
            }
            
            // 2. 如果配置路径不存在，从工作区根目录查找
            if (!filePath || !fs.existsSync(filePath)) {
                filePath = path.join(workspaceRoot, fileName);
                if (!fs.existsSync(filePath)) {
                    // 3. 如果工作区不存在，从扩展的 static 目录查找
                    filePath = path.join(extensionStaticDir, fileName);
                    if (!fs.existsSync(filePath)) {
                        filePath = null;
                    }
                }
            }
            
            // 如果找到文件，读取内容
            if (filePath && fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    files.push({ filePath: filePath, content: content });
                } catch (error) {
                    console.error(`Failed to read standard library file ${filePath}:`, error);
                }
            }
        }
        
        return files;
    }

    /**
     * 获取工程目录的其他文件列表（用于语义分析）
     * @param workspaceRoot 工作区根目录
     * @param currentFilePath 当前文件路径（排除此文件）
     * @returns 工程文件列表（包含路径和内容）
     */
    /**
     * 从缓存中获取项目文件列表（用于语义分析）
     * 包括所有缓存的文件（工作区文件 + static 目录文件）
     * 如果标准库文件在 getStandardLibraryFiles 中找不到，也会从缓存中获取
     */
    private getProjectFilesFromCache(
        currentFilePath: string,
        standardLibFiles: Array<{ filePath: string; content: string }>
    ): Array<{ filePath: string; content: string }> {
        const files: Array<{ filePath: string; content: string }> = [];
        const normalizedCurrentPath = path.resolve(currentFilePath).replace(/\\/g, '/').toLowerCase();
        
        // 标准库文件名列表
        const standardLibNames = new Set(STANDARD_LIBRARY_ORDER.map(name => name.toLowerCase()));
        
        // 已找到的标准库文件路径集合（用于检查哪些标准库文件已经在 standardLibFiles 中）
        const foundStandardLibPaths = new Set(
            standardLibFiles.map(f => path.resolve(f.filePath).replace(/\\/g, '/').toLowerCase())
        );
        
        // 从缓存中获取所有文件
        for (const [filePath, cacheItem] of this.cache.entries()) {
            const normalizedPath = path.resolve(filePath).replace(/\\/g, '/').toLowerCase();
            
            // 跳过当前文件
            if (normalizedPath === normalizedCurrentPath) {
                continue;
            }
            
            const fileName = path.basename(filePath).toLowerCase();
            const isStandardLib = standardLibNames.has(fileName);
            
            // 如果是标准库文件，但已经在 standardLibFiles 中找到了，就跳过
            // 如果标准库文件在 standardLibFiles 中找不到，就从缓存中获取（可能是 static 目录中的文件）
            if (isStandardLib && foundStandardLibPaths.has(normalizedPath)) {
                continue;
            }
            
            // 跳过 .zn 文件（Zinc 文件使用不同的 AST）
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.zn') {
                continue;
            }
            
            // 使用缓存中的内容
            if (cacheItem.content) {
                files.push({ filePath: filePath, content: cacheItem.content });
            }
        }
        
        return files;
    }

    private getProjectFiles(workspaceRoot: string, currentFilePath: string): Array<{ filePath: string; content: string }> {
        const files: Array<{ filePath: string; content: string }> = [];
        const normalizedCurrentPath = path.resolve(currentFilePath).replace(/\\/g, '/').toLowerCase();
        
        const collectFiles = (dir: string): void => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const normalizedPath = path.resolve(fullPath).replace(/\\/g, '/').toLowerCase();
                    
                    // 跳过当前文件
                    if (normalizedPath === normalizedCurrentPath) {
                        continue;
                    }
                    
                    // 跳过忽略的文件
                    if (this.shouldIgnoreFile(fullPath)) {
                        continue;
                    }
                    
                    // 跳过 static 目录
                    const relativePath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
                    if (relativePath.startsWith('static/') || relativePath.startsWith('static\\')) {
                        continue;
                    }
                    
                    if (entry.isDirectory()) {
                        collectFiles(fullPath);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (['.j', '.jass', '.ai'].includes(ext)) {
                            // 只处理工作区文件，排除静态文件和标准库文件
                            if (this.isWorkspaceFile(fullPath) && !this.isImmutableFile(fullPath)) {
                                try {
                                    const content = fs.readFileSync(fullPath, 'utf-8');
                                    files.push({ filePath: fullPath, content: content });
                                } catch (error) {
                                    console.error(`Failed to read project file ${fullPath}:`, error);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                // 忽略目录读取错误
            }
        };
        
        if (fs.existsSync(workspaceRoot)) {
            collectFiles(workspaceRoot);
        }
        
        return files;
    }

    /**
     * 重新加载配置文件
     */
    public reloadConfig(): void {
        this.loadConfig();
        console.log('📋 Reloaded jass.config.json');
        // 重新验证已缓存的文件
        this.revalidateCachedFiles();
        // 触发配置重新加载回调
        this.triggerConfigReloadCallbacks();
    }

    /**
     * 销毁管理器，清理资源
     */
    public dispose(): void {
        this.fileEventSubject.complete();
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        this.clearCache();
    }
}

// 导出单例实例（可选）
let defaultInstance: DataEnterManager | null = null;

/**
 * 获取默认的 DataEnterManager 实例
 */
export function getDefaultDataEnterManager(options?: DataEnterOptions): DataEnterManager {
    if (!defaultInstance) {
        defaultInstance = new DataEnterManager(options);
    }
    return defaultInstance;
}

/**
 * 销毁默认实例
 */
export function disposeDefaultDataEnterManager(): void {
    if (defaultInstance) {
        defaultInstance.dispose();
        defaultInstance = null;
    }
}

