/**
 * API Version / @since 统一门禁工具
 *
 * 集中管理「Warcraft III API 版本偏好」相关的版本号解析、比较和门禁逻辑。
 * 原先散落在 13 个 provider 里的 6 组私有方法（parseVersion / compareVersions /
 * isStrictLegacyApiVersion / getConfiguredApiVersion / extractSinceVersion /
 * isStatementAllowedForApiVersion）全部收敛到这里。
 *
 * 设计：所有导出函数都**纯函数**（除了 getConfiguredApiVersion 读取 vscode 配置），
 * 便于测试；vJass Statement 和 ZincStatement 的提取逻辑合并为一套，
 * 因为两者都只是拿 `start.line` 查源码前导注释。
 */

import * as vscode from 'vscode';
import { extractLeadingComments, parseComment } from './comment-parser';

export interface VersionInfo {
    major: number;
    minor: number;
    patch: number;
    /** 字母后缀排名：a=1, b=2, ..., z=26；无后缀=0 */
    suffix: number;
}

/**
 * 解析版本字符串。
 * 支持格式：1.20 / 1.26a / 1.33 / 2.04 / 3.00 / 3.01 等。
 */
export function parseVersion(input: string): VersionInfo | null {
    const match = input.toLowerCase().match(/^(\d+)\.(\d+)(?:\.(\d+))?([a-z])?$/);
    if (!match) {
        return null;
    }
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = match[3] ? Number(match[3]) : 0;
    const suffix = match[4] ? (match[4].charCodeAt(0) - 96) : 0;
    return { major, minor, patch, suffix };
}

/** 版本号比较：负数表示 left < right，正数表示 left > right，0 表示相等 */
export function compareVersions(left: string, right: string): number {
    const l = parseVersion(left);
    const r = parseVersion(right);
    if (!l || !r) {
        return 0;
    }
    if (l.major !== r.major) return l.major - r.major;
    if (l.minor !== r.minor) return l.minor - r.minor;
    if (l.patch !== r.patch) return l.patch - r.patch;
    return l.suffix - r.suffix;
}

/**
 * 严格旧版模式的版本列表。
 * 这些版本会**直接过滤** @since 晚于目标版本的 API；
 * 其他配置值仍允许所有 API，但较新的会降低补全优先级。
 */
const STRICT_LEGACY_VERSIONS = new Set([
    '1.20', '1.24', '1.26a', '1.27', '1.27a'
]);

export function isStrictLegacyApiVersion(version: string): boolean {
    return STRICT_LEGACY_VERSIONS.has(version.toLowerCase());
}

/** 读取用户配置的 API 版本偏好；返回 null 表示关闭（不过滤） */
export function getConfiguredApiVersion(): string | null {
    const value = vscode.workspace.getConfiguration('jass').get<string>('apiVersion', 'off');
    if (!value || value === 'off') {
        return null;
    }
    return value;
}

/**
 * 从 AST 声明所在行往前找注释，提取其中的 @since / @version 版本号。
 *
 * @param fileContent   源码全文（按 \n 分行，行号从 1 起）
 * @param statementLine 声明起始行（与 AST 的 start.line 对齐，1 基）
 */
export function extractSinceVersionFromSourceLine(
    fileContent: string,
    statementLine: number
): string | null {
    const commentLines = extractLeadingComments(fileContent, statementLine);
    if (commentLines.length === 0) {
        return null;
    }
    const parsedComment = parseComment(commentLines);
    const sinceText = (parsedComment.since || parsedComment.version || '').trim();
    if (!sinceText) {
        return null;
    }
    const versionToken = sinceText.match(/(\d+\.\d+(?:\.\d+)?[a-z]?)/i);
    return versionToken?.[1] || null;
}

/**
 * 从已格式化的 Markdown 文档字符串里提取 Since 行。
 * 用于 completion-provider 在构造好 documentation 之后对补全项做版本偏好过滤。
 */
export function extractSinceVersionFromDocumentation(docText: string): string | null {
    const sinceMatch = docText.match(/\*\*Since:\*\*\s*([^\n]+)/i);
    if (!sinceMatch) {
        return null;
    }
    const versionToken = sinceMatch[1].match(/(\d+\.\d+(?:\.\d+)?[a-z]?)/i);
    return versionToken ? versionToken[1] : null;
}

/**
 * 最常用的便捷封装：判断某个声明（按源码行号定位）在当前配置的 API 版本下
 * 是否应该可见。关闭 apiVersion 或声明无 @since 信息时一律可见。
 *
 * @param fileContent   源码全文
 * @param statementLine 声明起始行（1 基）
 * @param configuredVersion 可选，不传则自动读配置；方便测试注入
 */
export function isStatementAllowedForApiVersion(
    fileContent: string,
    statementLine: number,
    configuredVersion?: string | null
): boolean {
    const version = configuredVersion ?? getConfiguredApiVersion();
    if (!version || !isStrictLegacyApiVersion(version)) {
        return true;
    }
    const sinceVersion = extractSinceVersionFromSourceLine(fileContent, statementLine);
    if (!sinceVersion) {
        return true;
    }
    return compareVersions(sinceVersion, version) <= 0;
}
