import * as vscode from 'vscode';
import { 
    BlockStatement, 
    Statement, 
    FunctionDeclaration, 
    VariableDeclaration, 
    StructDeclaration, 
    MethodDeclaration, 
    LibraryDeclaration, 
    ScopeDeclaration, 
    ModuleDeclaration, 
    InterfaceDeclaration, 
    TypeDeclaration, 
    NativeDeclaration, 
    FunctionInterfaceDeclaration, 
    DelegateDeclaration, 
    TextMacroStatement, 
    RunTextMacroStatement, 
    ZincBlockStatement,
    IfStatement,
    LoopStatement,
    AssignmentStatement,
    CallStatement,
    ReturnStatement,
    ExitWhenStatement
} from '../vjass/vjass-ast';

/**
 * 基于 AST 的代码格式化器
 */
export class ASTFormatter {
    private indentString: string;
    private indentLevel: number = 0;
    private lines: string[] = [];
    private originalContent: string;
    private originalLines: string[];

    constructor(
        private options: vscode.FormattingOptions,
        originalContent: string
    ) {
        this.indentString = options.insertSpaces 
            ? ' '.repeat(options.tabSize) 
            : '\t';
        this.originalContent = originalContent;
        this.originalLines = originalContent.split('\n');
    }

    /**
     * 格式化 BlockStatement
     */
    formatBlock(block: BlockStatement): string {
        this.lines = [];
        this.indentLevel = 0;

        // 提取所有注释行（从原始内容中）
        const commentLines = this.extractAllCommentLines();
        const processedCommentLines = new Set<number>();

        // 格式化每个语句
        for (let i = 0; i < block.body.length; i++) {
            const stmt = block.body[i];
            
            // 添加语句前的注释（在语句所在行之前的注释行）
            if (stmt.start) {
                const stmtLine = stmt.start.line;
                // 查找并添加语句前的所有注释行
                // 从上一个语句的结束行到当前语句的开始行之间
                const prevStmtEndLine = i > 0 && block.body[i - 1].end 
                    ? block.body[i - 1].end.line 
                    : -1;
                
                for (let lineNum = prevStmtEndLine + 1; lineNum < stmtLine; lineNum++) {
                    if (commentLines.has(lineNum) && !processedCommentLines.has(lineNum)) {
                        const comment = commentLines.get(lineNum)!;
                        // 移除注释行的原始缩进，使用当前缩进级别
                        const trimmedComment = comment.trim();
                        this.addLine(trimmedComment, this.indentLevel);
                        processedCommentLines.add(lineNum); // 标记为已处理
                    }
                }
            }

            // 格式化语句
            this.formatStatement(stmt);

            // 语句后添加空行（某些语句类型）
            if (this.shouldAddBlankLineAfter(stmt)) {
                this.addLine('', this.indentLevel);
            }
        }

        // 添加剩余的注释行（在最后一个语句之后的注释）
        const lastStmtEndLine = block.body.length > 0 && block.body[block.body.length - 1].end
            ? block.body[block.body.length - 1].end.line
            : -1;
        
        for (let lineNum = lastStmtEndLine + 1; lineNum < this.originalLines.length; lineNum++) {
            if (commentLines.has(lineNum) && !processedCommentLines.has(lineNum)) {
                const comment = commentLines.get(lineNum)!;
                const trimmedComment = comment.trim();
                this.addLine(trimmedComment, this.indentLevel);
                processedCommentLines.add(lineNum);
            }
        }

        return this.lines.join('\n');
    }

    /**
     * 格式化语句
     */
    private formatStatement(stmt: Statement): void {
        if (stmt instanceof FunctionDeclaration) {
            this.formatFunction(stmt);
        } else if (stmt instanceof NativeDeclaration) {
            this.formatNative(stmt);
        } else if (stmt instanceof VariableDeclaration) {
            this.formatVariable(stmt);
        } else if (stmt instanceof StructDeclaration) {
            this.formatStruct(stmt);
        } else if (stmt instanceof MethodDeclaration) {
            this.formatMethod(stmt);
        } else if (stmt instanceof LibraryDeclaration) {
            this.formatLibrary(stmt);
        } else if (stmt instanceof ScopeDeclaration) {
            this.formatScope(stmt);
        } else if (stmt instanceof ModuleDeclaration) {
            this.formatModule(stmt);
        } else if (stmt instanceof InterfaceDeclaration) {
            this.formatInterface(stmt);
        } else if (stmt instanceof TypeDeclaration) {
            this.formatType(stmt);
        } else if (stmt instanceof FunctionInterfaceDeclaration) {
            this.formatFunctionInterface(stmt);
        } else if (stmt instanceof DelegateDeclaration) {
            this.formatDelegate(stmt);
        } else if (stmt instanceof TextMacroStatement) {
            this.formatTextMacro(stmt);
        } else if (stmt instanceof RunTextMacroStatement) {
            this.formatRunTextMacro(stmt);
        } else if (stmt instanceof ZincBlockStatement) {
            this.formatZincBlock(stmt);
        } else if (stmt instanceof BlockStatement) {
            this.formatBlockStatement(stmt);
        } else if (stmt instanceof IfStatement) {
            this.formatIfStatement(stmt);
        } else if (stmt instanceof LoopStatement) {
            this.formatLoopStatement(stmt);
        } else if (stmt instanceof AssignmentStatement) {
            this.formatAssignment(stmt);
        } else if (stmt instanceof CallStatement) {
            this.formatCall(stmt);
        } else if (stmt instanceof ReturnStatement) {
            this.formatReturn(stmt);
        } else if (stmt instanceof ExitWhenStatement) {
            this.formatExitWhen(stmt);
        } else {
            // 使用默认的 toString 方法
            this.addLine(stmt.toString(), this.indentLevel);
        }
    }

    /**
     * 格式化函数声明
     */
    private formatFunction(func: FunctionDeclaration): void {
        const parts: string[] = ['function'];
        
        if (func.name) {
            parts.push(func.name.toString());
        }
        
        parts.push('takes');
        if (func.parameters.length === 0) {
            parts.push('nothing');
        } else {
            parts.push(func.parameters.map(p => this.formatParameter(p)).join(', '));
        }
        
        parts.push('returns');
        if (func.returnType) {
            parts.push(func.returnType.toString());
        } else {
            parts.push('nothing');
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // 格式化函数体
        if (func.body && func.body.body.length > 0) {
            this.indentLevel++;
            this.formatBlockStatement(func.body);
            this.indentLevel--;
        }
        
        this.addLine('endfunction', this.indentLevel);
    }

    /**
     * 格式化 Native 声明
     */
    private formatNative(native: NativeDeclaration): void {
        const parts: string[] = [];
        
        if (native.isConstant) {
            parts.push('constant');
        }
        
        parts.push('native');
        
        if (native.name) {
            parts.push(native.name.toString());
        }
        
        parts.push('takes');
        if (native.parameters.length === 0) {
            parts.push('nothing');
        } else {
            parts.push(native.parameters.map(p => this.formatParameter(p)).join(', '));
        }
        
        parts.push('returns');
        if (native.returnType) {
            parts.push(native.returnType.toString());
        } else {
            parts.push('nothing');
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
    }

    /**
     * 格式化变量声明
     */
    private formatVariable(variable: VariableDeclaration): void {
        const parts: string[] = [];
        
        if (variable.isConstant) {
            parts.push('constant');
        }
        
        if (variable.isLocal) {
            parts.push('local');
        }
        
        if (variable.type) {
            parts.push(variable.type.toString());
        }
        
        if (variable.isArray) {
            parts.push('array');
        }
        
        if (variable.name) {
            parts.push(variable.name.toString());
        }
        
        if (variable.arraySize !== null) {
            parts.push(`[${variable.arraySize}]`);
        }
        
        if (variable.initializer) {
            parts.push('=', variable.initializer.toString());
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
    }

    /**
     * 格式化结构体声明
     */
    private formatStruct(struct: StructDeclaration): void {
        const parts: string[] = ['struct'];
        
        if (struct.name) {
            parts.push(struct.name.toString());
        }
        
        if (struct.indexSize !== null) {
            parts.push(`[${struct.indexSize}]`);
        }
        
        if (struct.extendsType) {
            parts.push('extends', struct.extendsType.toString());
        }
        
        if (struct.isArrayStruct && struct.arraySize !== null) {
            parts.push(`array[${struct.arraySize}]`);
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // 格式化成员
        if (struct.members.length > 0) {
            this.indentLevel++;
            for (const member of struct.members) {
                this.formatStatement(member);
            }
            this.indentLevel--;
        }
        
        this.addLine('endstruct', this.indentLevel);
    }

    /**
     * 格式化方法声明
     */
    private formatMethod(method: MethodDeclaration): void {
        const parts: string[] = [];
        
        if (method.isStatic) {
            parts.push('static');
        }
        
        if (method.isStub) {
            parts.push('stub');
        }
        
        parts.push('method');
        
        if (method.isOperator && method.operatorName) {
            parts.push(`operator ${method.operatorName}`);
        }
        
        if (method.name) {
            parts.push(method.name.toString());
        }
        
        parts.push('takes');
        if (method.parameters.length === 0) {
            parts.push('nothing');
        } else {
            parts.push(method.parameters.map(p => this.formatParameter(p)).join(', '));
        }
        
        parts.push('returns');
        if (method.returnType) {
            parts.push(method.returnType.toString());
        } else {
            parts.push('nothing');
        }
        
        if (method.defaultsValue) {
            parts.push('defaults', method.defaultsValue.toString());
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // 格式化方法体
        if (method.body && method.body.body.length > 0) {
            this.indentLevel++;
            this.formatBlockStatement(method.body);
            this.indentLevel--;
        }
        
        this.addLine('endmethod', this.indentLevel);
    }

    /**
     * 格式化库声明
     */
    private formatLibrary(library: LibraryDeclaration): void {
        const keyword = library.isLibraryOnce ? 'library_once' : 'library';
        const parts: string[] = [keyword];
        
        if (library.name) {
            parts.push(library.name.toString());
        }
        
        if (library.initializer) {
            parts.push('initializer', library.initializer.toString());
        }
        
        if (library.dependencies.length > 0) {
            parts.push('requires');
            const deps = library.dependencies.map(d => {
                const isOptional = library.optionalDependencies.has(d.toString());
                return isOptional ? `optional ${d.toString()}` : d.toString();
            });
            parts.push(deps.join(', '));
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // 格式化成员
        if (library.members && library.members.length > 0) {
            this.indentLevel++;
            for (const member of library.members) {
                this.formatStatement(member);
            }
            this.indentLevel--;
        }
        
        this.addLine('endlibrary', this.indentLevel);
    }

    /**
     * 格式化作用域声明
     */
    private formatScope(scope: ScopeDeclaration): void {
        const parts: string[] = ['scope'];
        
        if (scope.name) {
            parts.push(scope.name.toString());
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // 格式化成员
        if (scope.members && scope.members.length > 0) {
            this.indentLevel++;
            for (const member of scope.members) {
                this.formatStatement(member);
            }
            this.indentLevel--;
        }
        
        this.addLine('endscope', this.indentLevel);
    }

    /**
     * 格式化模块声明
     */
    private formatModule(module: ModuleDeclaration): void {
        const parts: string[] = ['module'];
        
        if (module.name) {
            parts.push(module.name.toString());
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // 格式化成员
        if (module.members && module.members.length > 0) {
            this.indentLevel++;
            for (const member of module.members) {
                this.formatStatement(member);
            }
            this.indentLevel--;
        }
        
        this.addLine('endmodule', this.indentLevel);
    }

    /**
     * 格式化接口声明
     */
    private formatInterface(interface_: InterfaceDeclaration): void {
        const parts: string[] = ['interface'];
        
        if (interface_.name) {
            parts.push(interface_.name.toString());
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // 格式化成员
        if (interface_.members && interface_.members.length > 0) {
            this.indentLevel++;
            for (const member of interface_.members) {
                this.formatStatement(member);
            }
            this.indentLevel--;
        }
        
        this.addLine('endinterface', this.indentLevel);
    }

    /**
     * 格式化类型声明
     */
    private formatType(type: TypeDeclaration): void {
        const parts: string[] = ['type', type.name.toString(), 'extends', type.baseType.toString()];
        
        if (type.isArray && type.elementSize !== null) {
            const sizeStr = type.elementSize.toString();
            if (type.storageSize !== null) {
                parts.push(`array[${sizeStr}, ${type.storageSize.toString()}]`);
            } else {
                parts.push(`array[${sizeStr}]`);
            }
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
    }

    /**
     * 格式化函数接口声明
     */
    private formatFunctionInterface(funcInterface: FunctionInterfaceDeclaration): void {
        const parts: string[] = ['function', 'interface'];
        
        if (funcInterface.name) {
            parts.push(funcInterface.name.toString());
        }
        
        parts.push('takes');
        if (funcInterface.parameters.length === 0) {
            parts.push('nothing');
        } else {
            parts.push(funcInterface.parameters.map(p => this.formatParameter(p)).join(', '));
        }
        
        parts.push('returns');
        if (funcInterface.returnType) {
            parts.push(funcInterface.returnType.toString());
        } else {
            parts.push('nothing');
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
    }

    /**
     * 格式化委托声明
     */
    private formatDelegate(delegate: DelegateDeclaration): void {
        const parts: string[] = [];
        
        if (delegate.isPrivate) {
            parts.push('private');
        }
        
        parts.push('delegate', delegate.delegateType.toString(), delegate.name.toString());
        
        this.addLine(parts.join(' '), this.indentLevel);
    }

    /**
     * 格式化 TextMacro 声明
     */
    private formatTextMacro(textMacro: TextMacroStatement): void {
        const parts: string[] = ['//!', 'textmacro'];
        
        if (textMacro.name) {
            parts.push(textMacro.name);
        }
        
        if (textMacro.parameters.length > 0) {
            parts.push('takes', textMacro.parameters.join(', '));
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
        
        // TextMacro 内容保持原样（从原始内容中提取）
        if (textMacro.start && textMacro.end) {
            const startLine = textMacro.start.line;
            const endLine = textMacro.end.line;
            for (let i = startLine + 1; i < endLine; i++) {
                if (i < this.originalLines.length) {
                    this.addLine(this.originalLines[i], this.indentLevel);
                }
            }
        }
        
        this.addLine('//! endtextmacro', this.indentLevel);
    }

    /**
     * 格式化 RunTextMacro 语句
     */
    private formatRunTextMacro(runTextMacro: RunTextMacroStatement): void {
        const parts: string[] = ['//!', 'runtextmacro'];
        
        if (runTextMacro.optional) {
            parts.push('optional');
        }
        
        if (runTextMacro.name) {
            parts.push(runTextMacro.name);
        }
        
        if (runTextMacro.parameters.length > 0) {
            parts.push(`(${runTextMacro.parameters.join(', ')})`);
        }
        
        this.addLine(parts.join(' '), this.indentLevel);
    }

    /**
     * 格式化 Zinc 块
     */
    private formatZincBlock(zincBlock: ZincBlockStatement): void {
        this.addLine('//! zinc', this.indentLevel);
        
        // Zinc 块内容保持原样（或使用 Zinc 格式化器）
        const zincLines = zincBlock.content.split('\n');
        this.indentLevel++;
        for (const line of zincLines) {
            this.addLine(line, this.indentLevel);
        }
        this.indentLevel--;
        
        this.addLine('//! endzinc', this.indentLevel);
    }

    /**
     * 格式化 BlockStatement（函数体、方法体等）
     */
    private formatBlockStatement(block: BlockStatement): void {
        // 提取所有注释行
        const commentLines = this.extractAllCommentLines();
        const processedCommentLines = new Set<number>();

        for (let i = 0; i < block.body.length; i++) {
            const stmt = block.body[i];
            
            // 添加语句前的注释
            if (stmt.start) {
                const stmtLine = stmt.start.line;
                const prevStmtEndLine = i > 0 && block.body[i - 1].end 
                    ? block.body[i - 1].end.line 
                    : (block.start ? block.start.line : -1);
                
                for (let lineNum = prevStmtEndLine + 1; lineNum < stmtLine; lineNum++) {
                    if (commentLines.has(lineNum) && !processedCommentLines.has(lineNum)) {
                        const comment = commentLines.get(lineNum)!;
                        const trimmedComment = comment.trim();
                        this.addLine(trimmedComment, this.indentLevel);
                        processedCommentLines.add(lineNum);
                    }
                }
            }

            // 格式化语句
            this.formatStatement(stmt);
        }

        // 添加剩余的注释行（在最后一个语句之后）
        if (block.body.length > 0 && block.body[block.body.length - 1].end) {
            const lastStmtEndLine = block.body[block.body.length - 1].end.line;
            const blockEndLine = block.end ? block.end.line : this.originalLines.length;
            
            for (let lineNum = lastStmtEndLine + 1; lineNum <= blockEndLine; lineNum++) {
                if (lineNum < this.originalLines.length && 
                    commentLines.has(lineNum) && 
                    !processedCommentLines.has(lineNum)) {
                    const comment = commentLines.get(lineNum)!;
                    const trimmedComment = comment.trim();
                    this.addLine(trimmedComment, this.indentLevel);
                    processedCommentLines.add(lineNum);
                }
            }
        }
    }

    /**
     * 格式化 If 语句
     */
    private formatIfStatement(ifStmt: IfStatement): void {
        const staticStr = ifStmt.isStatic ? 'static ' : '';
        this.addLine(`${staticStr}if ${ifStmt.condition.toString()} then`, this.indentLevel);
        
        // 格式化 then 分支
        this.indentLevel++;
        this.formatStatement(ifStmt.consequent);
        this.indentLevel--;
        
        // 格式化 else/elseif 分支
        if (ifStmt.alternate) {
            if (ifStmt.alternate instanceof IfStatement) {
                // elseif - 递归处理
                this.formatElseIf(ifStmt.alternate);
            } else if (ifStmt.alternate instanceof BlockStatement) {
                // else
                this.addLine('else', this.indentLevel);
                this.indentLevel++;
                this.formatBlockStatement(ifStmt.alternate);
                this.indentLevel--;
            }
        }
        
        this.addLine('endif', this.indentLevel);
    }

    /**
     * 格式化 elseif 分支
     */
    private formatElseIf(elseIfStmt: IfStatement): void {
        this.addLine(`elseif ${elseIfStmt.condition.toString()} then`, this.indentLevel);
        
        // 格式化 then 分支
        this.indentLevel++;
        this.formatStatement(elseIfStmt.consequent);
        this.indentLevel--;
        
        // 处理嵌套的 elseif/else
        if (elseIfStmt.alternate) {
            if (elseIfStmt.alternate instanceof IfStatement) {
                this.formatElseIf(elseIfStmt.alternate);
            } else if (elseIfStmt.alternate instanceof BlockStatement) {
                this.addLine('else', this.indentLevel);
                this.indentLevel++;
                this.formatBlockStatement(elseIfStmt.alternate);
                this.indentLevel--;
            }
        }
    }

    /**
     * 格式化 Loop 语句
     */
    private formatLoopStatement(loopStmt: LoopStatement): void {
        this.addLine('loop', this.indentLevel);
        
        if (loopStmt.body && loopStmt.body.body.length > 0) {
            this.indentLevel++;
            this.formatBlockStatement(loopStmt.body);
            this.indentLevel--;
        }
        
        this.addLine('endloop', this.indentLevel);
    }

    /**
     * 格式化赋值语句
     */
    private formatAssignment(assignment: AssignmentStatement): void {
        this.addLine(`set ${assignment.target.toString()} = ${assignment.value.toString()}`, this.indentLevel);
    }

    /**
     * 格式化调用语句
     */
    private formatCall(call: CallStatement): void {
        this.addLine(`call ${call.expression.toString()}`, this.indentLevel);
    }

    /**
     * 格式化 Return 语句
     */
    private formatReturn(returnStmt: ReturnStatement): void {
        this.addLine(returnStmt.toString(), this.indentLevel);
    }

    /**
     * 格式化 ExitWhen 语句
     */
    private formatExitWhen(exitWhen: ExitWhenStatement): void {
        this.addLine(`exitwhen ${exitWhen.condition.toString()}`, this.indentLevel);
    }

    /**
     * 格式化参数
     */
    private formatParameter(param: VariableDeclaration): string {
        const parts: string[] = [];
        
        if (param.type) {
            parts.push(param.type.toString());
        }
        
        if (param.name) {
            parts.push(param.name.toString());
        }
        
        return parts.join(' ');
    }

    /**
     * 添加一行
     */
    private addLine(content: string, indent: number): void {
        const indentStr = this.indentString.repeat(indent);
        this.lines.push(indentStr + content);
    }

    /**
     * 判断是否应该在语句后添加空行
     */
    private shouldAddBlankLineAfter(stmt: Statement): boolean {
        return stmt instanceof FunctionDeclaration ||
               stmt instanceof StructDeclaration ||
               stmt instanceof LibraryDeclaration ||
               stmt instanceof ScopeDeclaration ||
               stmt instanceof ModuleDeclaration ||
               stmt instanceof InterfaceDeclaration;
    }

    /**
     * 提取所有注释行（包括单行注释和多行注释）
     */
    private extractAllCommentLines(): Map<number, string> {
        const commentLines = new Map<number, string>();
        
        for (let i = 0; i < this.originalLines.length; i++) {
            const line = this.originalLines[i];
            const trimmed = line.trim();
            
            // 检查是否是单行注释（//）或多行注释（/* ... */）
            // 注意：空行不算注释
            if (trimmed.length > 0) {
                if (trimmed.startsWith('//') || 
                    trimmed.startsWith('/*') || 
                    trimmed.endsWith('*/') ||
                    trimmed.includes('/*') || 
                    trimmed.includes('*/')) {
                    commentLines.set(i, line);
                }
            }
        }
        
        return commentLines;
    }
}

