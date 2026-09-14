import * as path from 'path';
import { SpecialParser, SpecialLiteral } from './special-parser';

/**
 * strings.jass 文件解析器
 * 解析字符串字面量（双引号）
 */
export class StringsParser extends SpecialParser {
    public parse(filePath: string, content: string): SpecialLiteral[] {
        const literals: SpecialLiteral[] = [];
        const lines = content.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();

            // 跳过空行和注释行
            if (!trimmedLine || trimmedLine.startsWith('//')) {
                continue;
            }

            // 查找字符串字面量（双引号）
            const stringRegex = /"([^"]*)"/g;
            let match: RegExpExecArray | null;

            while ((match = stringRegex.exec(line)) !== null) {
                const content = match[1];
                if (content) {
                    const column = match.index;
                    // 优先使用同一行的注释，否则使用前置注释
                    const lineComment = this.extractLineComment(line);
                    const leadingComment = this.extractLeadingComments(lines, lineIndex);
                    const description = lineComment || leadingComment;

                    literals.push({
                        content,
                        type: 'string',
                        filePath,
                        line: lineIndex,
                        column,
                        description,
                        deprecated: this.isDeprecated(description)
                    });
                }
            }
        }

        return literals;
    }

    protected getLiteralType(): 'string' | 'mark' | 'number' {
        return 'string';
    }
}

