import {Range} from "../common";
import { isNewLine, isSpace } from "../tool";
import { removeComment } from "./tool";

class LineText extends Range{

    public readonly text:string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    // 是否空行
    public isEmpty():boolean {
        return this.text.trimStart() === "";
    }

    public getText():string {
        return this.text;
    }

    public lineNumber() :number {
        return this.start.line;
    }

    // 第一个字符下标
    public firstCharacterIndex() :number {
        let index = 0;
        for (; index < this.text.length; index++) {
            const char = this.text[index];
            if (!isSpace(char)) {
                return index;
            }
        }
        return index;
    }

	public length():number {
		return this.text.length;
	}

}

function replaceBlockComment(content: string): string {

    enum BlockCommentState {
        Default,
        LineComment,
        BlockComment,
        String
    };

    const BlockCommentResult = class {
        public readonly state: BlockCommentState;
        public readonly text: string;

        constructor(text: string, state: BlockCommentState = BlockCommentState.Default) {
            this.state = state;
            this.text = text;
        }

    };

    /**
     * 处理块级注释核心方法
     * @param newText 新的文本段
     * @param preState 上一次结果的状态
     * @returns 处理后的文本和最后的状态
     */
    const handle = (newText:string, preState: BlockCommentState) => {

        const chars = newText.split("");
        let state = preState;

        for (let index = 0; index < newText.length;) {
            const char = chars[index];
            
            if (state == BlockCommentState.Default) {
                if (char == "/") {
                    index++;
                    const nextChar = chars[index];
                    if (nextChar) {
                        if (nextChar == "/") {
                            state = BlockCommentState.LineComment;
                            index++;
                        } else if (nextChar == "*") {
                            state = BlockCommentState.BlockComment;
                            chars[index - 1] = " ";
                            chars[index] = " ";
                            index++;
                        }
                    }
                } else {
                    index++;
                }
            } else if (state == BlockCommentState.LineComment) {
                if (isNewLine(char)) {
                    state = BlockCommentState.Default;
                }
                index++;
            } else if (state == BlockCommentState.BlockComment) {
                if (char == "*") {
                    chars[index] = " ";
                    index++;
                    const nextChar = chars[index];
                    if (!nextChar) {
                        continue;
                    }
                    if (nextChar == "/") {
                        state = BlockCommentState.Default;
                        chars[index] = " ";
                        index++;
                    }
                } else {
                    if (isNewLine(char)) {
                        chars[index] = "\n";
                    } else {
                        chars[index] = " ";
                    }
                    index++;
                }
            }
        }

        return new BlockCommentResult(chars.join(""), state);
    };

    // 分段阈值
    const FieldLength = 128;

    if (content.length <= FieldLength) {
        return handle(content, BlockCommentState.Default).text;
    } else { // 当文本长度超过FieldLength个字符时, 按每段FieldLength个字符逐步处理
        let lastState:BlockCommentState = BlockCommentState.Default;
        let text: string = "";
        for (let index = 0; index < content.length; index+=FieldLength) {
            const fieldText = content.substring(index, Math.min(index + FieldLength, content.length));
            const result = handle(fieldText, lastState);
            text += result.text;
            lastState = result.state;
        }
        return text;
    }

}

// function lines(content: string): LineText[] {

// }

if (true) {
    const text = `a/*
    bffdfdsfds测试文本
    */c`;
    console.log(text, replaceBlockComment(text));
    console.log(text.length, replaceBlockComment(text).length);
}


