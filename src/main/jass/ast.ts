
import {Range} from "./range";

interface JassFunctionDeclarationInterface {
    /**
     * 方法名称
     */
    name:string|null;
    /**
     * 方法参数
     */
    takes:JassTake[];
    /**
     * 方法返回值
     */
    returns:string|null;
}

interface Origin {
    origin():string;
}

class JassFunctionDeclaration extends Range implements JassFunctionDeclarationInterface, Origin{
    public name: string|null = null;
    public readonly takes: JassTake[] = [];
    public returns: string|null = null;
    public origin(): string {
        return `function ${this.name ?? ""} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin()).join(", ") : "nothing"} returns ${this.returns ?? "nothing"}\nendfunction`;
    }
}

class JassTake extends Range implements Origin{
    
    public type:string|null = null;
    public name:string|null = null;

    public origin(): string {
        return `${this.type ?? ""} ${this.name ?? ""}`;
    }
}

interface JassStatementDeclarationInterface {
    /**
     * 装饰符
     * constant, local, array, private, public, static, protected
     */
    readonly flags:string[];
    /**
     * 类型
     */
    type:string|null;
    /**
     * 标识符
     */
    name:string|null;
}

class JassGlobalDeclaration extends Range implements JassStatementDeclarationInterface, Origin {
    
    public readonly flags: string[] = [];
    public type: string|null = null;
    public name: string|null = null;

    public origin(): string {
        return `${this.isConstant() ? "constant " : ""}${this.type ?? ""} ${this.isArray() ? "array " : ""}${this.name ?? ""}`;
    }

    /**
     * 是否是数组
     */
    public isArray () {
        return this.flags.includes("array");
    }

    /**
     * 是否是常量
     */
    public isConstant () {
        return this.flags.includes("constant");
    }
    
}

class JassGlobalsDeclaration extends Range implements Origin{

    public readonly globals:JassGlobalDeclaration[] = [];

    public origin(): string {
        throw new Error("Method not implemented.");
    }
    
}

class JassNativeFunctionDeclaration extends Range implements JassFunctionDeclarationInterface, Origin {
    public readonly flags: string[] = [];
    public name: string|null = null;
    public readonly takes: JassTake[] = [];
    public returns: string|null = null;
    public origin(): string {
        return `${this.isConstant() ? "constant " : ""}native ${this.name ?? ""} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin()).join(", ") : "nothing"} returns ${this.returns ?? "nothing"}`;
    }

    /**
     * 是否是常量
     */
    public isConstant () {
        return this.flags.includes("constant");
    }

}

interface JassTypeDeclarationInterface {
    name:string|null;
}

class JassTypeDeclaration extends Range implements JassTypeDeclarationInterface, Origin {
    public name:string|null = null;
    public extends:string|null = null;
    public origin(): string {
        return `type ${this.name ?? ""} extends ${this.extends ?? ""}`;
    }
}

export {
    JassFunctionDeclarationInterface,
    JassStatementDeclarationInterface,
    JassTypeDeclarationInterface,
    JassFunctionDeclaration,
    JassGlobalsDeclaration,
    JassGlobalDeclaration,
    JassNativeFunctionDeclaration,
    JassTypeDeclaration,
    JassTake
};

/*
vjass
*/

class VJassFunctionDeclaration extends Range implements JassFunctionDeclarationInterface, Origin{
    /**
     * 装饰符
     * constant, local, array, private, public, static, protected
     */
    public readonly flags: string[] = [];
    public name: string|null = null;
    public readonly takes: JassTake[] = [];
    public returns: string|null = null;
    public origin(): string {
        return `${this.isPublic() ? "public " : this.isPrivate() ? "private " : ""}function ${this.name ?? ""} takes ${this.takes.length > 0 ? this.takes.map(take => take.origin()).join(", ") : "nothing"} returns ${this.returns ?? "nothing"}\nendfunction`;
    }

    public isPublic() {
        return this.flags.includes("public");
    }

    public isPrivate() {
        return this.flags.includes("public");
    }

}

















