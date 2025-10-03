import * as vscode from 'vscode';
import { GlobalContext, Id, Caller, Call, IdIndex, NodeAst } from '../jass/parser-vjass';

/**
 * 引用信息接口
 */
interface ReferenceInfo {
    name: string;
    locations: vscode.Location[];
    count: number;
}

/**
 * Code Lens 访问者接口
 */
interface CodeLensVisitor {
    visitFunction(node: any, context: CodeLensContext): vscode.CodeLens[];
    visitNative(node: any, context: CodeLensContext): vscode.CodeLens[];
    visitMethod(node: any, context: CodeLensContext): vscode.CodeLens[];
    visitStruct(node: any, context: CodeLensContext): vscode.CodeLens[];
    visitInterface(node: any, context: CodeLensContext): vscode.CodeLens[];
}

/**
 * Code Lens 上下文
 */
interface CodeLensContext {
    document: vscode.TextDocument;
    referenceCache: Map<string, ReferenceInfo>;
}

/**
 * 默认 Code Lens 访问者实现
 */
class DefaultCodeLensVisitor implements CodeLensVisitor {
    visitFunction(node: any, context: CodeLensContext): vscode.CodeLens[] {
        if (!node.name) return [];
        
        const name = node.name.getText();
        const range = this.createRange(node);
        const position = new vscode.Position(node.start.line, 0);
        
        return [this.createCodeLens(range, name, context, position)];
    }

    visitNative(node: any, context: CodeLensContext): vscode.CodeLens[] {
        if (!node.name) return [];
        
        const name = node.name.getText();
        const range = this.createRange(node);
        const position = new vscode.Position(node.start.line, 0);
        
        return [this.createCodeLens(range, name, context, position)];
    }

    visitMethod(node: any, context: CodeLensContext): vscode.CodeLens[] {
        if (!node.name) return [];
        
        const name = node.name.getText();
        const range = this.createRange(node);
        const position = new vscode.Position(node.start.line, 0);
        
        return [this.createCodeLens(range, name, context, position)];
    }

    visitStruct(node: any, context: CodeLensContext): vscode.CodeLens[] {
        if (!node.name) return [];
        
        const name = node.name.getText();
        const range = this.createRange(node);
        const position = new vscode.Position(node.start.line, 0);
        
        // 获取结构体引用
        const references = GlobalContext.get_strcut_by_name(name);
        const referenceCount = references.length;
        
        return [new vscode.CodeLens(range, {
            title: `${referenceCount} references`,
            command: 'vscode.executeReferenceProvider',
            arguments: [context.document.uri, position]
        })];
    }

    visitInterface(node: any, context: CodeLensContext): vscode.CodeLens[] {
        if (!node.name) return [];
        
        const name = node.name.getText();
        const range = this.createRange(node);
        const position = new vscode.Position(node.start.line, 0);
        
        // 获取接口引用
        const references = GlobalContext.get_interface_by_name(name);
        const referenceCount = references.length;
        
        return [new vscode.CodeLens(range, {
            title: `${referenceCount} references`,
            command: 'vscode.executeReferenceProvider',
            arguments: [context.document.uri, position]
        })];
    }

    /**
     * 创建范围
     */
    private createRange(node: any): vscode.Range {
        return new vscode.Range(
            new vscode.Position(node.start.line, 0),
            new vscode.Position(node.end.line, 0)
        );
    }

    /**
     * 创建 Code Lens
     */
    private createCodeLens(range: vscode.Range, name: string, context: CodeLensContext, position: vscode.Position): vscode.CodeLens {
        const referenceInfo = this.getReferenceInfo(name, context);
        
        return new vscode.CodeLens(range, {
            title: `${referenceInfo.count} references`,
            command: 'vscode.executeReferenceProvider',
            arguments: [context.document.uri, position]
        });
    }

    /**
     * 获取引用信息（带缓存）
     */
    private getReferenceInfo(name: string, context: CodeLensContext): ReferenceInfo {
        if (context.referenceCache.has(name)) {
            return context.referenceCache.get(name)!;
        }

        const locations = this.getAllReferences(name);
        const referenceInfo: ReferenceInfo = {
            name,
            locations,
            count: locations.length
        };

        context.referenceCache.set(name, referenceInfo);
        return referenceInfo;
    }

    /**
     * 获取所有引用位置
     */
    private getAllReferences(name: string): vscode.Location[] {
        const locations: vscode.Location[] = [];
        const allDocuments = GlobalContext.keys
            .map(key => GlobalContext.get(key))
            .filter(doc => doc !== undefined);

        allDocuments.forEach(doc => {
            if (!doc) return;

            // 搜索函数调用 - 使用 calls 属性
            const calls = (doc as any).calls || [];
            calls.forEach((call: any) => {
                if (call.ref && call.ref.names.some((ref: any) => this.isNameMatch(ref, name))) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(doc.filePath),
                        new vscode.Range(
                            new vscode.Position(call.start.line, call.start.position),
                            new vscode.Position(call.end.line, call.end.position)
                        )
                    ));
                }
            });
        });

        return locations;
    }

    /**
     * 检查名称是否匹配
     */
    private isNameMatch(ref: any, name: string): boolean {
        if (ref instanceof Id) {
            return ref.expr?.getText() === name;
        } else if (ref instanceof Caller) {
            return ref?.name?.expr?.getText() === name;
        } else if (ref instanceof Call) {
            return (ref as any)?.name?.expr?.getText() === name;
        } else if (ref instanceof IdIndex) {
            return ref?.name?.expr?.getText() === name;
        }
        return false;
    }
}

/**
 * Code Lens 提供者
 */
export class CodeLensProvider implements vscode.CodeLensProvider {
    private readonly _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    private readonly visitor: CodeLensVisitor;

    constructor() {
        this.visitor = new DefaultCodeLensVisitor();
    }

    /**
     * 提供 Code Lenses
     */
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const program = GlobalContext.get(document.uri.fsPath);
        
        if (!program) {
            return [];
        }

        // 创建上下文
        const context: CodeLensContext = {
            document,
            referenceCache: new Map<string, ReferenceInfo>()
        };

        const codeLenses: vscode.CodeLens[] = [];

        // 使用 visitor 模式处理各种节点类型
        const functions = program.get_all_functions();
        functions.forEach((func: any) => {
            codeLenses.push(...this.visitor.visitFunction(func, context));
        });

        const natives = program.get_all_natives();
        natives.forEach((native: any) => {
            codeLenses.push(...this.visitor.visitNative(native, context));
        });

        const methods = program.get_all_methods();
        methods.forEach((method: any) => {
            codeLenses.push(...this.visitor.visitMethod(method, context));
        });

        const structs = program.get_all_structs();
        structs.forEach((struct: any) => {
            codeLenses.push(...this.visitor.visitStruct(struct, context));
        });

        const interfaces = program.get_all_interfaces();
        interfaces.forEach((interface_: any) => {
            codeLenses.push(...this.visitor.visitInterface(interface_, context));
        });

        return codeLenses;
    }

    /**
     * 刷新 Code Lenses
     */
    public refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }

    public resolveCodeLens(codeLens: vscode.CodeLens): vscode.CodeLens {
        return codeLens;
    }
}

