
var parser = require('luaparse');

export interface LuaNode {
    type: string;
}

export interface ChunkBlock {
    body: Statement[];
}
export interface Block {
    body: Statement[];
}
export interface Condition {
    condition: Term;
}

export interface Clause extends Condition, Block, LuaNode  {}

export interface IfClause extends Clause {}
export interface ElseifClause extends Clause {}
export interface ElseClause extends Clause {}

export type Statement = FunctionDeclaration|IfStatement|DoStatement|WhileStatement|LocalStatement|AssignmentStatement|CallStatement|ForGenericStatement|RepeatStatement|StringCallExpression|ReturnStatement;
// type FunctionStatement = Statement|ReturnStatement;
export type Term = Identifier|NumericLiteral|UnaryExpression|BinaryExpression|StringLiteral|BooleanLiteral|FunctionDeclaration|LogicalExpression|NilLiteral|TableConstructorExpression|CallExpression;

export interface Chunk extends ChunkBlock, LuaNode {
    comments: Comment[];
}

export interface FunctionDeclaration extends LuaNode, Block {
    identifier: Identifier|MemberExpression|null;
    isLocal: boolean;
    parameters: Identifier[];
    body: Statement[];
}
export interface DoStatement extends LuaNode, Block {
}
export interface WhileStatement extends LuaNode, Block, Condition {
}
export interface RepeatStatement extends WhileStatement {
}
export interface ForGenericStatement extends LuaNode, Block {
    variables: Identifier[];
    iterators: Term[];
}
export interface CallExpression extends LuaNode, Block {
    base: Identifier|MemberExpression|CallExpression;
    arguments: Term[];
};
export interface CallStatement extends LuaNode, Block {
    expression: CallExpression;
};
export interface StringCallExpression extends LuaNode, Block {
    base: Identifier|MemberExpression;
    argument: StringLiteral;
};
export interface IfStatement extends LuaNode, Block, Condition {
    clauses: Clause[];
}
export interface LocalStatement extends LuaNode {
    variables: Identifier[];
    init: Term[];
}
export interface AssignmentStatement extends LuaNode {
    variables: (Identifier|IndexExpression)[];
    init: Term[];
}
export interface Identifier extends LuaNode {
    name: string;
}
export interface Expression extends LuaNode {
    operator: string;
}
export interface ReturnStatement extends Expression {
    arguments: Term[];
}
export interface UnaryExpression extends Expression {
    argument: Term;
}
export interface BinaryExpression extends Expression {
    left: Term;
    right: Term;
}
export interface NumericLiteral extends LuaNode {
    value: number;
    raw: string;
}
export interface StringLiteral extends LuaNode {
    value: string|null;
    raw: string;
}
export interface Comment extends LuaNode {
    value: string;
    raw: string;
}
export interface BooleanLiteral extends LuaNode {
    value: boolean;
    raw: string;
}
export interface NilLiteral extends LuaNode {
    value: null;
    raw: string;
}
export interface TableValue extends LuaNode {
    value: Term;
}
export interface TableKeyString extends TableValue {
    key: Identifier;
}
export interface IndexExpression extends LuaNode {
    base: Identifier|IndexExpression;
    index: Term;
}
export interface TableConstructorExpression extends LuaNode {
    fields: TableKeyString[];
}
export interface LogicalExpression extends BinaryExpression {}
export interface MemberExpression extends LuaNode {
    indexer: string;
    identifier: Identifier;
    base: MemberExpression|Identifier;
}
// LocalNameListStatement

export class LuaParser {

    private content: string;

    constructor(content: string) {
        this.content = content;
    }

    public parsing():Chunk {
        const ast = parser.parse(this.content);
        // console.log(JSON.stringify(ast, null, 4));
        return ast;
    }

}

export const LuaAstType = {
    Chunk: "Chunk",
    FunctionDeclaration: "FunctionDeclaration",
    DoStatement: "DoStatement",
    WhileStatement: "WhileStatement",
    IfStatement: "IfStatement",
    LocalStatement: "LocalStatement",
    AssignmentStatement: "AssignmentStatement",
    Identifier: "Identifier",
    UnaryExpression: "UnaryExpression",
    BinaryExpression: "BinaryExpression",
    NumericLiteral: "NumericLiteral",
    StringLiteral: "StringLiteral",
    BooleanLiteral: "BooleanLiteral",
    LogicalExpression: "LogicalExpression",
    ReturnStatement: "ReturnStatement",
    NilLiteral: "NilLiteral",
    TableKeyString: "TableKeyString",
    TableValue: "TableValue",
    TableConstructorExpression: "TableConstructorExpression",
    CallExpression: "CallExpression",
    CallStatement: "CallStatement",
    ForGenericStatement: "ForGenericStatement",
    MemberExpression: "MemberExpression",
    RepeatStatement: "RepeatStatement",
    StringCallExpression: "StringCallExpression",
}

function getExports(root: Chunk) {
    const statements:(FunctionDeclaration|LocalStatement)[] = [];
    const funcstatements:(LocalStatement)[] = [];

    root.body.forEach((statement) => {
        if (statement.type == LuaAstType.FunctionDeclaration) {
            statements.push(<FunctionDeclaration>statement);
        } else if (statement.type == LuaAstType.LocalStatement) {
            statements.push(<LocalStatement>statement);
        }
    });

    return statements;
}