import * as vscode from 'vscode';
import { DataEnterManager } from '../data-enter-manager';

/**
 * Zinc 代码格式化提供者
 */
export class ZincFormattingProvider implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        return this.formatDocument(document, options, token);
    }

    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        return this.formatDocument(document, options, token, range);
    }

    /**
     * 格式化文档
     */
    private formatDocument(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
        range?: vscode.Range
    ): vscode.TextEdit[] {
        try {
            const text = document.getText(range);
            const lines = text.split('\n');
            const formattedLines: string[] = [];
            
            let indentLevel = 0;
            const indentString = options.insertSpaces 
                ? ' '.repeat(options.tabSize) 
                : '\t';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();
                
                // 计算当前行的缩进级别
                const currentIndent = this.calculateIndentLevel(line, indentLevel);
                
                // 格式化当前行
                const formattedLine = this.formatLine(trimmedLine, currentIndent, indentString);
                formattedLines.push(formattedLine);
                
                // 更新缩进级别（基于当前行的内容）
                indentLevel = this.updateIndentLevel(trimmedLine, indentLevel);
            }
            
            const formattedText = formattedLines.join('\n');
            
            // 如果格式化的文本与原文相同，返回空数组
            if (formattedText === text) {
                return [];
            }
            
            // 创建 TextEdit
            const editRange = range || new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            
            return [vscode.TextEdit.replace(editRange, formattedText)];
        } catch (error) {
            console.error('Error formatting Zinc document:', error);
            return [];
        }
    }

    /**
     * 格式化单行
     */
    private formatLine(line: string, indentLevel: number, indentString: string): string {
        if (!line || line.trim().length === 0) {
            return '';
        }
        
        // 添加缩进
        const indent = indentString.repeat(indentLevel);
        
        // 移除行首尾空白
        const trimmed = line.trim();
        
        // 处理注释行
        if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
            return indent + trimmed;
        }
        
        // 格式化语句
        let formatted = trimmed;
        
        // 在关键字后添加空格
        formatted = formatted.replace(/\b(function|public|private|static|library|struct|interface|module|method|for|while|if|else|return|break|continue|constant|delegate|operator|requires|uses|needs)\b/gi, ' $1 ');
        
        // 移除多余的空格
        formatted = formatted.replace(/\s+/g, ' ');
        
        // 在操作符周围添加空格
        formatted = formatted.replace(/([=+\-*/<>!])\s*([=+\-*/<>!])/g, '$1 $2');
        formatted = formatted.replace(/([=+\-*/<>!])\s*([^=+\-*/<>!\s])/g, '$1 $2');
        formatted = formatted.replace(/([^=+\-*/<>!\s])\s*([=+\-*/<>!])/g, '$1 $2');
        
        // 在箭头操作符周围添加空格
        formatted = formatted.replace(/\s*->\s*/g, ' -> ');
        
        // 在逗号后添加空格
        formatted = formatted.replace(/,\s*/g, ', ');
        
        // 在分号后添加空格（如果有）
        formatted = formatted.replace(/;\s*/g, '; ');
        
        // 在括号周围添加空格
        formatted = formatted.replace(/\s*\(\s*/g, ' (');
        formatted = formatted.replace(/\s*\)\s*/g, ') ');
        
        // 在大括号周围添加空格
        formatted = formatted.replace(/\s*\{\s*/g, ' {');
        formatted = formatted.replace(/\s*\}\s*/g, '} ');
        
        // 移除多余的空格
        formatted = formatted.replace(/\s+/g, ' ').trim();
        
        return indent + formatted;
    }

    /**
     * 计算缩进级别
     */
    private calculateIndentLevel(line: string, currentIndent: number): number {
        const trimmed = line.trim();
        
        // 空行保持当前缩进
        if (!trimmed) {
            return currentIndent;
        }
        
        // 检查是否是减少缩进的关键字
        if (/^\s*(endfunction|endif|endloop|endstruct|endmethod|endlibrary|endscope|endmodule|endinterface|})\s*$/.test(trimmed)) {
            return Math.max(0, currentIndent - 1);
        }
        
        // 检查是否是 else/elseif（保持当前缩进）
        if (/^\s*(else|elseif)\b/.test(trimmed)) {
            return Math.max(0, currentIndent - 1);
        }
        
        return currentIndent;
    }

    /**
     * 更新缩进级别
     */
    private updateIndentLevel(line: string, currentIndent: number): number {
        const trimmed = line.trim();
        
        // 空行不改变缩进
        if (!trimmed) {
            return currentIndent;
        }
        
        // 检查是否是增加缩进的关键字
        if (/^\s*(function|public|private|static|library|struct|interface|module|method|for|while|if|else)\s*\(/.test(trimmed) ||
            /^\s*(function|public|private|static|library|struct|interface|module|method|for|while|if|else)\s*\{/.test(trimmed) ||
            trimmed.endsWith('{')) {
            return currentIndent + 1;
        }
        
        // 检查是否是减少缩进的关键字
        if (/^\s*(endfunction|endif|endloop|endstruct|endmethod|endlibrary|endscope|endmodule|endinterface)\s*$/.test(trimmed) ||
            trimmed === '}') {
            return Math.max(0, currentIndent - 1);
        }
        
        return currentIndent;
    }
}

