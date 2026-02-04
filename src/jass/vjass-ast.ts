// @deprecated jass 目录与 vjass 目录将彻底解耦，此依赖将在未来版本中移除
import { SimpleError } from "../vjass/error";

export class VjassNode {
    public tokens: any[] = [];
    public startLine: number = 0;
    public endLine: number = 0;
    public startPosition: number = 0;
    public endPosition: number = 0;

    addToken(token: any) {
        this.tokens.push(token);
        if (this.tokens.length === 1) {
            this.startLine = token.start.lineNumber;
            this.startPosition = token.start.position;
        }
        this.endLine = token.end.lineNumber;
        this.endPosition = token.end.position;
    }

    addTokens(tokens: any[]) {
        tokens.forEach(token => this.addToken(token));
    }
}

export class LineNode extends VjassNode {
    public parent: BlockNode | null = null;
    public previous: LineNode | null = null;
    public next: LineNode | null = null;
}

export class BlockNode extends VjassNode {
    public parent: BlockNode | null = null;
    public previous: BlockNode | null = null;
    public next: BlockNode | null = null;
    public children: BlockNode[] = [];
    public endToken: any = null;

    addChild(child: BlockNode) {
        child.parent = this;
        if (this.children.length > 0) {
            child.previous = this.children[this.children.length - 1];
            this.children[this.children.length - 1].next = child;
        }
        this.children.push(child);
        return this;
    }

    insertChild(child: BlockNode, index: number) {
        child.parent = this;
        if (this.children[index - 1]) {
            child.previous = this.children[index - 1];
            this.children[index - 1].next = child;
        }
        if (this.children[index + 1]) {
            child.next = this.children[index + 1];
            this.children[index + 1].previous = child;
        }
        this.children.splice(index, 0, child);
        return this;
    }
}

export class VjassLibrary extends BlockNode {
    public name: string | null = null;
    public initialize: any = null;
    public requires: any[] = [];
}

export class VjassScope extends BlockNode {
    public name: string | null = null;
}

export class VjassGlobals extends BlockNode {
}

export class VjassGlobalVariable extends LineNode {
    public modifier: any = null;
    public type: any = null;
    public isArray: any = null;
    public arrayDimensions: VjassArrayDimension[] = [];
    public name: string | null = null;
    public initValue: any = null;
}

export class VjassArrayDimension extends LineNode {
    public size: any = null;
}

export class VjassFunction extends BlockNode {
    public modifier: any = null;
    public returnType: any = null;
    public name: string | null = null;
    public parameters: VjassParameter[] = [];
    public statements: VjassStatement[] = [];
}

export class VjassParameter extends LineNode {
    public type: any = null;
    public name: string | null = null;
}

export class VjassStatement extends LineNode {
}

export class VjassNothing extends VjassStatement {
}

export class VjassTypeDefinition extends LineNode {
    public name: string | null = null;
    public type: any = null;
}

export class VjassDynamicArrayType extends LineNode {
    public elementType: any = null;
}

export class VjassStruct extends BlockNode {
    public name: string | null = null;
    public fields: VjassStructField[] = [];
    public methods: VjassStructMethod[] = [];
}

export class VjassStructField extends LineNode {
    public type: any = null;
    public name: string | null = null;
    public isArray: boolean = false;
    public arrayDimensions: VjassArrayDimension[] = [];
}

export class VjassStructMethod extends BlockNode {
    public modifier: any = null;
    public returnType: any = null;
    public name: string | null = null;
    public parameters: VjassParameter[] = [];
    public statements: VjassStatement[] = [];
}

export class VjassInterface extends BlockNode {
    public name: string | null = null;
    public methods: VjassInterfaceMethod[] = [];
}

export class VjassInterfaceMethod extends LineNode {
    public returnType: any = null;
    public name: string | null = null;
    public parameters: VjassParameter[] = [];
}

export class VjassModule extends BlockNode {
    public name: string | null = null;
    public uses: any[] = [];
    public implements: any[] = [];
}

export class VjassModuleImplementation extends BlockNode {
    public name: string | null = null;
    public module: any = null;
}

export class VjassOperatorOverload extends LineNode {
    public operator: string | null = null;
    public leftType: any = null;
    public rightType: any = null;
    public returnType: any = null;
    public functionName: string | null = null;
}

export class VjassDelegate extends LineNode {
    public returnType: any = null;
    public name: string | null = null;
    public parameters: VjassParameter[] = [];
}

export class VjassLocalVariable extends LineNode {
    public type: any = null;
    public name: string | null = null;
    public initValue: any = null;
}

export class VjassSetStatement extends VjassStatement {
    public target: any = null;
    public value: any = null;
}

export class VjassCallStatement extends VjassStatement {
    public functionName: string | null = null;
    public arguments: any[] = [];
}

export class VjassReturnStatement extends VjassStatement {
    public value: any = null;
}

export class VjassIfStatement extends VjassStatement {
    public condition: any = null;
    public thenStatements: VjassStatement[] = [];
    public elseIfClauses: VjassElseIfClause[] = [];
    public elseStatement: VjassElseStatement | null = null;
}

export class VjassElseIfClause extends VjassStatement {
    public condition: any = null;
    public statements: VjassStatement[] = [];
}

export class VjassElseStatement extends VjassStatement {
    public statements: VjassStatement[] = [];
}

export class VjassLoopStatement extends VjassStatement {
    public statements: VjassStatement[] = [];
}

export class VjassExitWhenStatement extends VjassStatement {
    public condition: any = null;
}

export class VjassExpression extends LineNode {
}

export class VjassBinaryExpression extends VjassExpression {
    public operator: string | null = null;
    public left: any = null;
    public right: any = null;
}

export class VjassUnaryExpression extends VjassExpression {
    public operator: string | null = null;
    public operand: any = null;
}

export class VjassIdentifierExpression extends VjassExpression {
    public name: string | null = null;
}

export class VjassLiteralExpression extends VjassExpression {
    public value: any = null;
}

export class VjassFunctionCallExpression extends VjassExpression {
    public functionName: string | null = null;
    public arguments: any[] = [];
}

export class VjassArrayAccessExpression extends VjassExpression {
    public array: any = null;
    public index: any = null;
}

export class VjassMemberAccessExpression extends VjassExpression {
    public object: any = null;
    public member: string | null = null;
}

export class VjassMethodCallExpression extends VjassExpression {
    public object: any = null;
    public method: string | null = null;
    public arguments: any[] = [];
}

export class VjassCodeLiteralExpression extends VjassExpression {
    public code: string | null = null;
}

export class VjassThisTypeExpression extends VjassExpression {
}

export class VjassSuperExpression extends VjassExpression {
}

export class VjassFunctionInterface extends VjassExpression {
    public returnType: any = null;
    public parameters: VjassParameter[] = [];
}

export class VjassFunctionObjectCall extends VjassExpression {
    public functionObject: any = null;
    public arguments: any[] = [];
}

export class VjassFunctionPointer extends VjassExpression {
    public functionName: string | null = null;
}

export class VjassTypeCastExpression extends VjassExpression {
    public type: any = null;
    public expression: any = null;
}

export class VjassMethodObjectCall extends VjassExpression {
    public methodObject: any = null;
    public arguments: any[] = [];
}

export class VjassMethodObjectProperty extends VjassExpression {
    public methodObject: any = null;
    public property: string | null = null;
}

export class VjassChainedExpression extends VjassExpression {
    public expressions: VjassExpression[] = [];
}

export class VjassArrayPropertyAccess extends VjassExpression {
    public array: any = null;
    public property: string | null = null;
}

export class VjassArrayStructFieldAccess extends VjassExpression {
    public array: any = null;
    public field: string | null = null;
}

export class VjassHook extends VjassStatement {
    public functionName: string | null = null;
    public hookFunction: string | null = null;
}

export class VjassDebugStatement extends VjassStatement {
    public message: string | null = null;
}

export class VjassConstant extends LineNode {
    public name: string | null = null;
    public value: any = null;
}

export class VjassNativeFunction extends LineNode {
    public returnType: any = null;
    public name: string | null = null;
    public parameters: VjassParameter[] = [];
}
