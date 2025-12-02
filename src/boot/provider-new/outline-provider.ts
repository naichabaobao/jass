import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter';
import {
    BlockStatement,
    Statement,
    FunctionDeclaration,
    NativeDeclaration,
    FunctionInterfaceDeclaration,
    VariableDeclaration,
    TypeDeclaration,
    StructDeclaration,
    InterfaceDeclaration,
    ModuleDeclaration,
    DelegateDeclaration,
    MethodDeclaration,
    LibraryDeclaration,
    ScopeDeclaration,
    TextMacroStatement,
    RunTextMacroStatement,
    ImplementStatement,
    ZincBlockStatement
} from '../vjass/vjass-ast';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
import { ZincBlockHelper } from './zinc-block-helper';
import { ZincOutlineProvider } from './zinc/zinc-outline-provider';

/**
 * 基于新 AST 系统的文档大纲提供者
 */
export class OutlineProvider implements vscode.DocumentSymbolProvider {
    private dataEnterManager: DataEnterManager;
    private zincOutlineProvider: ZincOutlineProvider;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        this.zincOutlineProvider = new ZincOutlineProvider(dataEnterManager);
    }

    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        try {
            const symbols: vscode.DocumentSymbol[] = [];
            const filePath = document.uri.fsPath;

            // 获取当前文件的 BlockStatement
            let blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            
            // 如果文件还没有被解析，立即解析它
            if (!blockStatement) {
                const content = document.getText();
                if (content) {
                    // 异步解析文件（不阻塞）
                    this.dataEnterManager.updateFile(filePath, content).then(() => {
                        // 解析完成后，触发 outline 刷新
                        // VSCode 会自动重新调用 provideDocumentSymbols
                    }).catch(err => {
                        console.error('Error parsing file for outline:', err);
                    });
                    
                    // 尝试同步解析（如果可能）
                    blockStatement = this.dataEnterManager.getBlockStatement(filePath);
                }
            }

            if (!blockStatement) {
                return symbols;
            }

            // 从 BlockStatement 中提取符号（包括 TextMacroStatement 和 RunTextMacroStatement）
            this.extractSymbolsFromBlock(blockStatement, symbols, null);

            // 添加 TextMacro 符号（从注册表，用于跨文件引用）
            // 注意：当前文件中的 TextMacroStatement 已经在 extractSymbolsFromBlock 中处理
            const textMacroRegistry = TextMacroRegistry.getInstance();
            const macros = textMacroRegistry.getByFile(filePath);
            macros.forEach(macro => {
                // 检查是否已经在 symbols 中（避免重复）
                const alreadyExists = symbols.some(s => s.name === macro.name && s.kind === vscode.SymbolKind.Function);
                if (!alreadyExists) {
                    const symbol = this.createTextMacroSymbol(macro);
                    if (symbol) {
                        symbols.push(symbol);
                    }
                }
            });

            return symbols;
        } catch (error) {
            console.error('Error in provideDocumentSymbols:', error);
            return [];
        }
    }

    /**
     * 从 BlockStatement 中提取符号
     */
    private extractSymbolsFromBlock(
        block: BlockStatement,
        symbols: vscode.DocumentSymbol[],
        parentSymbol: vscode.DocumentSymbol | null
    ): void {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(block)) {
            const globalsSymbol = this.createGlobalsSymbol(block);
            if (globalsSymbol) {
                if (parentSymbol) {
                    parentSymbol.children.push(globalsSymbol);
                } else {
                    symbols.push(globalsSymbol);
                }
            }
            return;
        }

        for (const stmt of block.body) {
            // 如果遇到 BlockStatement，递归处理（可能是 globals 块或其他嵌套块）
            if (stmt instanceof BlockStatement) {
                this.extractSymbolsFromBlock(stmt, symbols, parentSymbol);
                continue;
            }

            // 处理 Zinc 块
            if (stmt instanceof ZincBlockStatement) {
                const zincSymbol = this.createZincBlockSymbol(stmt);
                if (zincSymbol) {
                    if (parentSymbol) {
                        parentSymbol.children.push(zincSymbol);
                    } else {
                        symbols.push(zincSymbol);
                    }
                }
                continue;
            }

            const symbol = this.createSymbolFromStatement(stmt);
            if (symbol) {
                if (parentSymbol) {
                    parentSymbol.children.push(symbol);
                } else {
                    symbols.push(symbol);
                }

                // 递归处理嵌套的符号
                this.extractNestedSymbols(stmt, symbol);
            }
        }
    }

    /**
     * 从语句创建符号
     */
    private createSymbolFromStatement(stmt: Statement): vscode.DocumentSymbol | null {
        // 函数声明
        if (stmt instanceof FunctionDeclaration) {
            return this.createFunctionSymbol(stmt);
        }
        // Native 函数声明
        else if (stmt instanceof NativeDeclaration) {
            return this.createNativeSymbol(stmt);
        }
        // 函数接口声明
        else if (stmt instanceof FunctionInterfaceDeclaration) {
            return this.createFunctionInterfaceSymbol(stmt);
        }
        // 变量声明（全局变量）
        else if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
            return this.createGlobalVariableSymbol(stmt);
        }
        // 类型声明
        else if (stmt instanceof TypeDeclaration) {
            return this.createTypeSymbol(stmt);
        }
        // 结构体声明
        else if (stmt instanceof StructDeclaration) {
            return this.createStructSymbol(stmt);
        }
        // 接口声明
        else if (stmt instanceof InterfaceDeclaration) {
            return this.createInterfaceSymbol(stmt);
        }
        // 模块声明
        else if (stmt instanceof ModuleDeclaration) {
            return this.createModuleSymbol(stmt);
        }
        // 委托声明
        else if (stmt instanceof DelegateDeclaration) {
            return this.createDelegateSymbol(stmt);
        }
        // Library 声明
        else if (stmt instanceof LibraryDeclaration) {
            return this.createLibrarySymbol(stmt);
        }
        // Scope 声明
        else if (stmt instanceof ScopeDeclaration) {
            return this.createScopeSymbol(stmt);
        }
        // TextMacro 声明
        else if (stmt instanceof TextMacroStatement) {
            return this.createTextMacroStatementSymbol(stmt);
        }
        // RunTextMacro 调用
        else if (stmt instanceof RunTextMacroStatement) {
            return this.createRunTextMacroSymbol(stmt);
        }

        return null;
    }

    /**
     * 检查是否是 globals 块
     */
    private isGlobalsBlock(block: BlockStatement): boolean {
        // globals 块应该只包含非 local 的 VariableDeclaration
        if (block.body.length === 0) {
            return false; // 空块不认为是 globals 块
        }
        
        // 检查是否所有语句都是非 local 的 VariableDeclaration
        // globals 块中不应该有其他类型的语句（如函数、结构体等）
        let hasGlobalVariable = false;
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration) {
                // 如果是 local 变量，则不是 globals 块
                if (stmt.isLocal) {
                    return false;
                }
                hasGlobalVariable = true;
            } else {
                // 如果包含非变量声明的语句，则不是 globals 块
                return false;
            }
        }
        
        // 至少需要有一个全局变量声明
        return hasGlobalVariable;
    }

    /**
     * 创建 globals 符号
     */
    private createGlobalsSymbol(block: BlockStatement): vscode.DocumentSymbol | null {
        const range = block.start && block.end
            ? this.createRange(block.start, block.end)
            : new vscode.Range(0, 0, 0, 0);

        const selectionRange = block.start
            ? new vscode.Range(
                  new vscode.Position(block.start.line, block.start.position),
                  new vscode.Position(block.start.line, block.start.position + 7) // "globals" 长度
              )
            : range;

        const symbol = new vscode.DocumentSymbol(
            'globals',
            'globals block',
            vscode.SymbolKind.Namespace,
            range,
            selectionRange
        );

        // 添加全局变量作为子符号
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                const varSymbol = this.createGlobalVariableSymbol(stmt);
                if (varSymbol) {
                    symbol.children.push(varSymbol);
                }
            }
        }

        return symbol;
    }

    /**
     * 提取嵌套的符号（如结构体成员、模块成员等）
     */
    private extractNestedSymbols(
        stmt: Statement,
        parentSymbol: vscode.DocumentSymbol
    ): void {
        // 结构体成员
        if (stmt instanceof StructDeclaration) {
            for (const member of stmt.members) {
                let memberSymbol: vscode.DocumentSymbol | null = null;

                // 处理方法声明
                if (member instanceof MethodDeclaration) {
                    memberSymbol = this.createMethodSymbol(member);
                }
                // 处理变量声明（成员变量）
                else if (member instanceof VariableDeclaration) {
                    memberSymbol = this.createMemberVariableSymbol(member);
                }
                // 处理 implement 语句
                else if (member instanceof ImplementStatement) {
                    memberSymbol = this.createImplementSymbol(member);
                }
                // 处理其他类型的成员
                else {
                    memberSymbol = this.createSymbolFromStatement(member);
                }

                if (memberSymbol) {
                    parentSymbol.children.push(memberSymbol);
                    // 递归处理嵌套的符号
                    this.extractNestedSymbols(member, memberSymbol);
                }
            }
        }
        // 接口成员
        else if (stmt instanceof InterfaceDeclaration) {
            for (const member of stmt.members) {
                let memberSymbol: vscode.DocumentSymbol | null = null;

                // 处理方法声明
                if (member instanceof MethodDeclaration) {
                    memberSymbol = this.createMethodSymbol(member);
                }
                // 处理其他类型的成员
                else {
                    memberSymbol = this.createSymbolFromStatement(member);
                }

                if (memberSymbol) {
                    parentSymbol.children.push(memberSymbol);
                    this.extractNestedSymbols(member, memberSymbol);
                }
            }
        }
        // 模块成员
        else if (stmt instanceof ModuleDeclaration) {
            for (const member of stmt.members) {
                let memberSymbol: vscode.DocumentSymbol | null = null;

                // 处理方法声明
                if (member instanceof MethodDeclaration) {
                    memberSymbol = this.createMethodSymbol(member);
                }
                // 处理其他类型的成员
                else {
                    memberSymbol = this.createSymbolFromStatement(member);
                }

                if (memberSymbol) {
                    parentSymbol.children.push(memberSymbol);
                    this.extractNestedSymbols(member, memberSymbol);
                }
            }
        }
        // Library 成员
        else if (stmt instanceof LibraryDeclaration) {
            for (const member of stmt.members) {
                const memberSymbol = this.createSymbolFromStatement(member);
                if (memberSymbol) {
                    parentSymbol.children.push(memberSymbol);
                    this.extractNestedSymbols(member, memberSymbol);
                }
            }
        }
        // Scope 成员
        else if (stmt instanceof ScopeDeclaration) {
            for (const member of stmt.members) {
                const memberSymbol = this.createSymbolFromStatement(member);
                if (memberSymbol) {
                    parentSymbol.children.push(memberSymbol);
                    this.extractNestedSymbols(member, memberSymbol);
                }
            }
        }
        // 函数中的 local 变量
        else if (stmt instanceof FunctionDeclaration) {
            if (stmt.body) {
                this.extractLocalVariablesFromBlock(stmt.body, parentSymbol);
            }
        }
        // 方法中的 local 变量
        else if (stmt instanceof MethodDeclaration) {
            if (stmt.body) {
                this.extractLocalVariablesFromBlock(stmt.body, parentSymbol);
            }
        }
        // RunTextMacro 展开后的内容（如果展开成功，会是一个 BlockStatement）
        // 注意：如果 runtextmacro 成功展开，parser 会返回 BlockStatement 而不是 RunTextMacroStatement
        // 所以这里处理的是展开后的 BlockStatement
        else if (stmt instanceof BlockStatement && stmt.body.length > 0) {
            // 检查是否是展开后的 runtextmacro（通过检查父符号是否是 RunTextMacro）
            // 如果是，提取展开后的内容作为子符号
            if (parentSymbol && parentSymbol.kind === vscode.SymbolKind.Event) {
                // 这可能是展开后的 runtextmacro 内容
                // 提取展开后的符号作为子符号
                this.extractSymbolsFromBlock(stmt, [], parentSymbol);
            }
        }
    }

    /**
     * 从 BlockStatement 中提取 local 变量并添加到父符号
     */
    private extractLocalVariablesFromBlock(
        block: BlockStatement,
        parentSymbol: vscode.DocumentSymbol
    ): void {
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                const localSymbol = this.createLocalVariableSymbol(stmt);
                if (localSymbol) {
                    parentSymbol.children.push(localSymbol);
                }
            } else if (stmt instanceof BlockStatement) {
                // 递归处理嵌套块（如 if/else、loop 等）
                this.extractLocalVariablesFromBlock(stmt, parentSymbol);
            }
        }
    }

    /**
     * 创建局部变量符号
     */
    private createLocalVariableSymbol(variable: VariableDeclaration): vscode.DocumentSymbol | null {
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.toString() : 'unknown';
        const detail = `local ${typeStr}`;

        const range = this.createRange(variable.start, variable.end);
        const selectionRange = this.createRange(variable.name.start, variable.name.end);

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Variable,
            range,
            selectionRange
        );
    }

    /**
     * 创建函数符号
     */
    private createFunctionSymbol(func: FunctionDeclaration): vscode.DocumentSymbol | null {
        if (!func.name) {
            return null;
        }

        const name = func.name.name;
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';
        const detail = `function(${params || 'nothing'}) -> ${returnType}`;

        const range = this.createRange(func.start, func.end);
        const selectionRange = func.name ? this.createRange(func.name.start, func.name.end) : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Function,
            range,
            selectionRange
        );
    }

    /**
     * 创建 Native 函数符号
     */
    private createNativeSymbol(native: NativeDeclaration): vscode.DocumentSymbol | null {
        if (!native.name) {
            return null;
        }

        const name = native.name.name;
        const params = native.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = native.returnType ? native.returnType.toString() : 'nothing';
        const constantStr = native.isConstant ? 'constant ' : '';
        const detail = `${constantStr}native(${params || 'nothing'}) -> ${returnType}`;

        const range = this.createRange(native.start, native.end);
        const selectionRange = native.name ? this.createRange(native.name.start, native.name.end) : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Function,
            range,
            selectionRange
        );
    }

    /**
     * 创建函数接口符号
     */
    private createFunctionInterfaceSymbol(func: FunctionInterfaceDeclaration): vscode.DocumentSymbol | null {
        if (!func.name) {
            return null;
        }

        const name = func.name.name;
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';
        const detail = `function interface(${params || 'nothing'}) -> ${returnType}`;

        const range = this.createRange(func.start, func.end);
        const selectionRange = func.name ? this.createRange(func.name.start, func.name.end) : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Interface,
            range,
            selectionRange
        );
    }

    /**
     * 创建全局变量符号
     */
    private createGlobalVariableSymbol(variable: VariableDeclaration): vscode.DocumentSymbol | null {
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.toString() : 'unknown';
        const constantStr = variable.isConstant ? 'constant ' : '';
        const detail = `${constantStr}${typeStr}`;

        const range = this.createRange(variable.start, variable.end);
        const selectionRange = this.createRange(variable.name.start, variable.name.end);

        return new vscode.DocumentSymbol(
            name,
            detail,
            variable.isConstant ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable,
            range,
            selectionRange
        );
    }

    /**
     * 创建类型符号
     */
    private createTypeSymbol(type: TypeDeclaration): vscode.DocumentSymbol | null {
        if (!type.name) {
            return null;
        }

        const name = type.name.name;
        const baseType = type.baseType ? ` = ${type.baseType.toString()}` : '';
        const detail = `type${baseType}`;

        const range = this.createRange(type.start, type.end);
        const selectionRange = type.name ? this.createRange(type.name.start, type.name.end) : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.TypeParameter,
            range,
            selectionRange
        );
    }

    /**
     * 创建结构体符号
     */
    private createStructSymbol(struct: StructDeclaration): vscode.DocumentSymbol | null {
        if (!struct.name) {
            return null;
        }

        const name = struct.name.name;
        const extendsInfo = struct.extendsType ? ` extends ${struct.extendsType.toString()}` : '';
        const indexInfo = struct.indexSize !== null ? `[${struct.indexSize}]` : '';
        const arrayInfo = struct.isArrayStruct ? ` extends array${struct.arraySize !== null ? ` [${struct.arraySize}]` : ''}` : '';
        const detail = `struct${indexInfo}${extendsInfo}${arrayInfo}`;

        const range = this.createRange(struct.start, struct.end);
        const selectionRange = struct.name ? this.createRange(struct.name.start, struct.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Class,
            range,
            selectionRange
        );

        // 结构体成员会在 extractNestedSymbols 中处理
        return symbol;
    }

    /**
     * 创建接口符号
     */
    private createInterfaceSymbol(interface_: InterfaceDeclaration): vscode.DocumentSymbol | null {
        if (!interface_.name) {
            return null;
        }

        const name = interface_.name.name;
        const detail = 'interface';

        const range = this.createRange(interface_.start, interface_.end);
        const selectionRange = interface_.name ? this.createRange(interface_.name.start, interface_.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Interface,
            range,
            selectionRange
        );

        return symbol;
    }

    /**
     * 创建模块符号
     */
    private createModuleSymbol(module: ModuleDeclaration): vscode.DocumentSymbol | null {
        if (!module.name) {
            return null;
        }

        const name = module.name.name;
        const detail = 'module';

        const range = this.createRange(module.start, module.end);
        const selectionRange = module.name ? this.createRange(module.name.start, module.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Module,
            range,
            selectionRange
        );

        return symbol;
    }

    /**
     * 创建委托符号
     */
    private createDelegateSymbol(delegate: DelegateDeclaration): vscode.DocumentSymbol | null {
        if (!delegate.name) {
            return null;
        }

        const name = delegate.name.name;
        const delegateType = delegate.delegateType ? delegate.delegateType.toString() : 'unknown';
        const privateStr = delegate.isPrivate ? 'private ' : '';
        const detail = `${privateStr}delegate ${delegateType}`;

        const range = this.createRange(delegate.start, delegate.end);
        const selectionRange = delegate.name ? this.createRange(delegate.name.start, delegate.name.end) : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Property,
            range,
            selectionRange
        );
    }

    /**
     * 创建方法符号（用于结构体成员）
     */
    private createMethodSymbol(method: MethodDeclaration): vscode.DocumentSymbol | null {
        if (!method.name) {
            return null;
        }

        const name = method.name.name;
        const params = method.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = method.returnType ? method.returnType.toString() : 'nothing';
        const staticStr = method.isStatic ? 'static ' : '';
        const detail = `${staticStr}method(${params || 'nothing'}) -> ${returnType}`;

        const range = this.createRange(method.start, method.end);
        const selectionRange = method.name ? this.createRange(method.name.start, method.name.end) : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Method,
            range,
            selectionRange
        );
    }

    /**
     * 创建结构体成员变量符号
     */
    private createMemberVariableSymbol(variable: VariableDeclaration): vscode.DocumentSymbol | null {
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.toString() : 'unknown';
        
        // 构建详细信息：包含 static、readonly、constant 等修饰符
        const modifiers: string[] = [];
        if (variable.isStatic) {
            modifiers.push('static');
        }
        if (variable.isReadonly) {
            modifiers.push('readonly');
        }
        if (variable.isConstant) {
            modifiers.push('constant');
        }
        
        const modifierStr = modifiers.length > 0 ? `${modifiers.join(' ')} ` : '';
        const arrayStr = variable.isArray 
            ? (variable.arrayWidth !== null && variable.arrayHeight !== null
                ? ` array[${variable.arrayWidth}][${variable.arrayHeight}]`
                : variable.arraySize !== null
                    ? ` array[${variable.arraySize}]`
                    : ' array')
            : '';
        
        const detail = `${modifierStr}${typeStr}${arrayStr}`;

        const range = this.createRange(variable.start, variable.end);
        const selectionRange = this.createRange(variable.name.start, variable.name.end);

        // 根据属性选择合适的符号类型
        let symbolKind = vscode.SymbolKind.Field;
        if (variable.isConstant) {
            symbolKind = vscode.SymbolKind.Constant;
        } else if (variable.isStatic) {
            symbolKind = vscode.SymbolKind.Property; // 静态成员使用 Property
        }

        return new vscode.DocumentSymbol(
            name,
            detail,
            symbolKind,
            range,
            selectionRange
        );
    }

    /**
     * 创建 implement 符号
     */
    private createImplementSymbol(implement: ImplementStatement): vscode.DocumentSymbol | null {
        const name = implement.moduleName.name;
        const optionalStr = implement.isOptional ? 'optional ' : '';
        const detail = `implement ${optionalStr}${name}`;

        const range = this.createRange(implement.start, implement.end);
        const selectionRange = this.createRange(implement.moduleName.start, implement.moduleName.end);

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Interface, // 使用 Interface 类型表示 implement
            range,
            selectionRange
        );
    }

    /**
     * 创建 TextMacro 语句符号
     */
    private createTextMacroStatementSymbol(textMacro: TextMacroStatement): vscode.DocumentSymbol | null {
        const name = textMacro.name;
        const params = textMacro.parameters.length > 0
            ? ` takes ${textMacro.parameters.join(', ')}`
            : '';
        const detail = `textmacro${params}`;

        // TextMacroStatement 可能没有位置信息，使用默认值
        const range = textMacro.start && textMacro.end
            ? this.createRange(textMacro.start, textMacro.end)
            : new vscode.Range(0, 0, 0, 0);

        // 使用合适的 selectionRange（宏名称的位置）
        const selectionRange = textMacro.start
            ? new vscode.Range(
                  new vscode.Position(textMacro.start.line, textMacro.start.position),
                  new vscode.Position(textMacro.start.line, textMacro.start.position + name.length)
              )
            : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Function, // 使用 Function 类型表示宏定义
            range,
            selectionRange
        );
    }

    /**
     * 创建 Library 符号
     */
    private createLibrarySymbol(library: LibraryDeclaration): vscode.DocumentSymbol | null {
        if (!library.name) {
            return null;
        }

        const name = library.name.name;
        const onceStr = library.isLibraryOnce ? 'once ' : '';
        const dependencies = library.dependencies.length > 0
            ? ` requires ${library.dependencies.map(d => d.toString()).join(', ')}`
            : '';
        const initializer = library.initializer ? ` initializer ${library.initializer.toString()}` : '';
        const detail = `${onceStr}library${dependencies}${initializer}`;

        const range = this.createRange(library.start, library.end);
        const selectionRange = library.name ? this.createRange(library.name.start, library.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Namespace,
            range,
            selectionRange
        );

        return symbol;
    }

    /**
     * 创建 Scope 符号
     */
    private createScopeSymbol(scope: ScopeDeclaration): vscode.DocumentSymbol | null {
        if (!scope.name) {
            return null;
        }

        const name = scope.name.name;
        const initializer = scope.initializer ? ` initializer ${scope.initializer.toString()}` : '';
        const detail = `scope${initializer}`;

        const range = this.createRange(scope.start, scope.end);
        const selectionRange = scope.name ? this.createRange(scope.name.start, scope.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Namespace,
            range,
            selectionRange
        );

        return symbol;
    }

    /**
     * 创建 RunTextMacro 符号
     */
    private createRunTextMacroSymbol(runTextMacro: RunTextMacroStatement): vscode.DocumentSymbol | null {
        const name = runTextMacro.name;
        const optionalStr = runTextMacro.optional ? 'optional ' : '';
        const params = runTextMacro.parameters.length > 0
            ? `(${runTextMacro.parameters.join(', ')})`
            : '()';
        const detail = `runtextmacro ${optionalStr}${name}${params}`;

        const range = runTextMacro.start && runTextMacro.end
            ? this.createRange(runTextMacro.start, runTextMacro.end)
            : new vscode.Range(0, 0, 0, 0);

        // 计算宏名称在行中的精确位置
        // 尝试从文件内容中获取行文本以精确定位宏名称
        let selectionRange = range;
        if (runTextMacro.start) {
            // 尝试从 TextMacroRegistry 获取宏定义信息
            const textMacroRegistry = TextMacroRegistry.getInstance();
            const macro = textMacroRegistry.find(name);
            
            // 如果找到了宏定义，使用更精确的位置
            // 否则，使用 start 位置作为回退
            const nameStartPos = runTextMacro.start.position;
            // 查找 "runtextmacro" 关键字后的宏名称位置
            // 格式：//! runtextmacro [optional] MacroName(params)
            // 需要找到 MacroName 的位置
            selectionRange = new vscode.Range(
                new vscode.Position(runTextMacro.start.line, nameStartPos),
                new vscode.Position(runTextMacro.start.line, nameStartPos + name.length)
            );
        }

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Event, // 使用 Event 类型表示宏调用
            range,
            selectionRange
        );

        return symbol;
    }

    /**
     * 创建 TextMacro 符号（从注册表）
     */
    private createTextMacroSymbol(macro: { name: string; parameters: string[]; filePath: string; start?: { line: number; position: number }; end?: { line: number; position: number } }): vscode.DocumentSymbol | null {
        const name = macro.name;
        const params = macro.parameters.length > 0
            ? ` takes ${macro.parameters.join(', ')}`
            : '';
        const detail = `textmacro${params}`;

        // 使用注册表中的位置信息（如果有）
        const range = macro.start && macro.end
            ? this.createRange(macro.start, macro.end)
            : new vscode.Range(0, 0, 0, 0);

        const selectionRange = macro.start
            ? new vscode.Range(
                  new vscode.Position(macro.start.line, macro.start.position),
                  new vscode.Position(macro.start.line, macro.start.position + name.length)
              )
            : range;

        return new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Function,
            range,
            selectionRange
        );
    }

    /**
     * 创建 Zinc 块符号
     */
    private createZincBlockSymbol(zincBlock: ZincBlockStatement): vscode.DocumentSymbol | null {
        if (!zincBlock.start || !zincBlock.end) {
            return null;
        }

        const range = this.createRange(zincBlock.start, zincBlock.end);
        const selectionRange = range;

        const symbol = new vscode.DocumentSymbol(
            '//! zinc',
            'Zinc Block',
            vscode.SymbolKind.Namespace,
            range,
            selectionRange
        );

        // 解析 Zinc 块内容并提取符号
        try {
            const { InnerZincParser } = require('../vjass/inner-zinc-parser');
            const { ZincProgram } = require('../vjass/zinc-ast');
            const parser = new InnerZincParser(zincBlock.content, '');
            const statements = parser.parse();
            const program = new ZincProgram(statements);
            
            // 提取符号
            const zincSymbols: vscode.DocumentSymbol[] = [];
            const lineOffset = zincBlock.start.line + 1; // Zinc 内容从 //! zinc 的下一行开始
            
            for (const stmt of program.declarations) {
                const stmtSymbol = (this.zincOutlineProvider as any).createSymbolFromStatement(stmt, '');
                if (stmtSymbol) {
                    // 调整行号（将 Zinc 块内的相对行号转换为文档中的绝对行号）
                    this.adjustSymbolLineNumbers(stmtSymbol, lineOffset);
                    
                    // 递归提取嵌套符号（如结构体成员、库成员等）
                    (this.zincOutlineProvider as any).extractNestedSymbols(stmt, stmtSymbol, '');
                    
                    // 调整嵌套符号的行号
                    this.adjustNestedSymbolLineNumbers(stmtSymbol, lineOffset);
                    
                    zincSymbols.push(stmtSymbol);
                }
            }
            symbol.children = zincSymbols;
        } catch (error) {
            console.error('Error parsing Zinc block for outline:', error);
        }

        return symbol;
    }

    /**
     * 调整符号的行号
     */
    private adjustSymbolLineNumbers(symbol: vscode.DocumentSymbol, lineOffset: number): void {
        if (symbol.range) {
            symbol.range = new vscode.Range(
                symbol.range.start.line + lineOffset,
                symbol.range.start.character,
                symbol.range.end.line + lineOffset,
                symbol.range.end.character
            );
        }
        if (symbol.selectionRange) {
            symbol.selectionRange = new vscode.Range(
                symbol.selectionRange.start.line + lineOffset,
                symbol.selectionRange.start.character,
                symbol.selectionRange.end.line + lineOffset,
                symbol.selectionRange.end.character
            );
        }
    }

    /**
     * 递归调整嵌套符号的行号
     */
    private adjustNestedSymbolLineNumbers(symbol: vscode.DocumentSymbol, lineOffset: number): void {
        this.adjustSymbolLineNumbers(symbol, lineOffset);
        if (symbol.children && symbol.children.length > 0) {
            for (const child of symbol.children) {
                this.adjustNestedSymbolLineNumbers(child, lineOffset);
            }
        }
    }

    /**
     * 创建 VSCode Range
     */
    private createRange(
        start: { line: number; position: number } | undefined,
        end: { line: number; position: number } | undefined
    ): vscode.Range {
        if (!start || !end) {
            return new vscode.Range(0, 0, 0, 0);
        }

        return new vscode.Range(
            new vscode.Position(start.line, start.position),
            new vscode.Position(end.line, end.position)
        );
    }
}

