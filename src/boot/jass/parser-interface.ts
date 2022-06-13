
type TagMatcher = RegExp;

class TagPair {
    public readonly start: TagMatcher;
    public readonly end: TagMatcher;

    constructor(start: TagMatcher, end: TagMatcher) {
        this.start = start;
        this.end = end;
    }
}

/**
 * 表示一个脚本文件
 */
class Document {

}

interface ParserDefine {
    defineTagPair(document: Document): void;
}