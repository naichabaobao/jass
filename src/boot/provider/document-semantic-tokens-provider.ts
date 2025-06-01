import * as vscode from "vscode";
import { Struct } from "../jass/ast";
import { tokenize } from "../jass/tokens";
import { GlobalContext, zinc } from "../jass/parser-vjass";
import { Token } from "../jass/tokens";

// /*
// namespace	用于声明或引用命名空间、模块或包的标识符。
// class	用于声明或引用类类型的标识符。
// enum	用于声明或引用枚举类型的标识符。
// interface	用于声明或引用接口类型的标识符。
// struct	用于声明或引用结构类型的标识符。
// typeParameter	用于声明或引用类型参数的标识符。
// type	对于声明或引用上面未涵盖的类型的标识符。
// parameter	用于声明或引用函数或方法参数的标识符。
// variable	用于声明或引用局部或全局变量的标识符。
// property	用于声明或引用成员属性、成员字段或成员变量的标识符。
// enumMember	用于声明或引用枚举属性、常量或成员的标识符。
// decorator	用于声明或引用修饰符和批注的标识符。
// event	用于声明事件属性的标识符。
// function	用于声明函数的标识符。
// method	用于声明成员函数或方法的标识符。
// macro	用于声明宏的标识符。
// label	用于声明标签的标识符。
// comment	对于表示注释的标记。
// string	对于表示字符串文本的标记。
// keyword	对于表示语言关键字的标记。
// number	对于表示数字文本的标记。
// regexp	对于表示正则表达式文本的标记。
// operator	对于表示运算符的令牌。
// */
// /*
// declaration	用于符号的声明。
// definition	对于符号的定义，例如，在头文件中。
// readonly	对于只读变量和成员字段（常量）。
// static	对于类成员（静态成员）。
// deprecated	对于不应再使用的符号。
// abstract	对于抽象的类型和成员函数。
// async	对于标记为异步的函数。
// modification	对于将变量分配到的变量引用。
// documentation	用于文档中出现的符号。
// defaultLibrary	对于属于标准库的符号。
// */

const legend = new vscode.SemanticTokensLegend([
    "namespace",
    "class",
    "enum",
    "interface",
    "struct",
    "typeParameter",
    "type",
    "parameter",
    "variable",
    "property",
    "enumMember",
    "decorator",
    "event",
    "function",
    "method",
    "macro",
    "label",
    "comment",
    "string",
    "keyword",
    "number",
    "regexp",
    "operator",
], [
    "declaration",
    "definition",
    "readonly",
    "static",
    "deprecated",
    "abstract",
    "async",
    "modification",
    "documentation",
    "defaultLibrary"
]);

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    onDidChangeSemanticTokens?: vscode.Event<void> | undefined;
    
    provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
        const builder = new vscode.SemanticTokensBuilder(legend);
        const fsPath = document.uri.fsPath;
        const content = document.getText();

        // Get all structs and their deprecated status
        const structs: (Struct | zinc.Struct)[] = [];
        GlobalContext.keys.forEach(key => {
            const program = GlobalContext.get(key);
            if (program) {
                structs.push(...program.structs as (Struct | zinc.Struct)[]);
            }
        });
        
        // Create maps for quick lookup
        const structNames = new Map<string, boolean>();
        structs.forEach((struct) => {
            let name: string | undefined;
            if (struct.name instanceof Token) {
                name = struct.name.value;
            } else if (typeof struct.name === 'string') {
                name = struct.name;
            }
            if (name) {
                structNames.set(name, 'hasDeprecated' in struct ? struct.hasDeprecated() : false);
            }
        });

        // Tokenize and process the content
        const tokens = tokenize(content);
        tokens.forEach((token) => {
            switch (token.type) {
                case "id":
                    const structName = token.value;
                    if (structNames.has(structName)) {
                        const isDeprecated = structNames.get(structName);
                        const modifiers = isDeprecated ? ["deprecated"] : [];
                        builder.push(
                            new vscode.Range(token.start.line, token.start.position, token.end.line, token.end.position),
                            "class",
                            modifiers
                        );
                    }
                    break;
                case "op":
                    builder.push(
                        new vscode.Range(token.start.line, token.start.position, token.end.line, token.end.position),
                        "operator"
                    );
                    break;
                case "string":
                    builder.push(
                        new vscode.Range(token.start.line, token.start.position, token.end.line, token.end.position),
                        "string"
                    );
                    break;
                case "int":
                case "real":
                    builder.push(
                        new vscode.Range(token.start.line, token.start.position, token.end.line, token.end.position),
                        "number"
                    );
                    break;
                case "comment":
                case "block_comment":
                    builder.push(
                        new vscode.Range(token.start.line, token.start.position, token.end.line, token.end.position),
                        "comment"
                    );
                    break;
                case "macro":
                    builder.push(
                        new vscode.Range(token.start.line, token.start.position, token.end.line, token.end.position),
                        "macro"
                    );
                    break;
            }
        });

        return builder.build();
    }
}


