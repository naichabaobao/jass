import * as path from 'path';
import { SpecialParser, SpecialLiteral } from './special-parser';

/**
 * numbers.jass 文件解析器
 * 解析数字字面量
 */
export class NumbersParser extends SpecialParser {
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

            // 查找数字字面量（支持十进制、十六进制、二进制）
            // 匹配：数字、0x/0X 十六进制、$ 十六进制、0b/0B 二进制
            const numberRegex = /\b(0[xX][0-9a-fA-F]+|\$[0-9a-fA-F]+|0[bB][01]+|\d+)\b/g;
            let match: RegExpExecArray | null;

            while ((match = numberRegex.exec(line)) !== null) {
                const content = match[1];
                if (content) {
                    const column = match.index;
                    const description = this.extractLineComment(line);

                    literals.push({
                        content,
                        type: 'number',
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
        return 'number';
    }
}

