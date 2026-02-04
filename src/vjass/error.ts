export class SimpleError {
    public start: {
        line: number;
        position: number;
    };
    public end: {
        line: number;
        position: number;
    };
    public message: string;
    /**
     * 修复建议
     */
    public fix?: string;
    constructor(start: {
        line: number;
        position: number;
    }, end: {
        line: number;
        position: number;
    }, message: string, fix?: string) {
        this.start = start;
        this.end = end;
        this.message = message;
        this.fix = fix;
    }
}

export class SimpleWarning {
    public start: {
        line: number;
        position: number;
    };
    public end: {
        line: number;
        position: number;
    };
    public message: string;
    public fix?: string;

    constructor(start: {
        line: number;
        position: number;
    }, end: {
        line: number;
        position: number;
    }, message: string) {
        this.start = start;
        this.end = end;
        this.message = message;
    }
}

/**
 * Check验证错误类型
 */
export enum CheckErrorType {
    SYNTAX_ERROR = "syntax_error",
    TYPE_ERROR = "type_error", 
    SEMANTIC_ERROR = "semantic_error",
    VALIDATION_ERROR = "validation_error",
    RUNTIME_ERROR = "runtime_error"
}

/**
 * Check验证错误
 */
export interface CheckValidationError extends SimpleError {
    nodeType: string;
    checkType: CheckErrorType;
    severity: "error" | "warning" | "info";
}

export interface ErrorCollection {
    errors: SimpleError[];
    warnings: SimpleWarning[];
    checkValidationErrors?: CheckValidationError[];
}
