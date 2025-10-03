import { NodeAst } from "./parser-vjass";

export interface Check {
    // 语法检查
    syntaxCheck(): void;
}
