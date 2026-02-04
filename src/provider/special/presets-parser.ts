import * as path from 'path';
import { SpecialParser, SpecialLiteral } from './special-parser';

/**
 * presets.jass 文件解析器
 * 解析标记字面量（单引号）
 */
export class PresetsParser extends SpecialParser {
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

            // 查找标记字面量（单引号）
            const markRegex = /'([^']*)'/g;
            let match: RegExpExecArray | null;

            while ((match = markRegex.exec(line)) !== null) {
                const content = match[1];
                if (content) {
                    const column = match.index;
                    const description = this.extractLineComment(line);

                    literals.push({
                        content,
                        type: 'mark',
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
        return 'mark';
    }
}

