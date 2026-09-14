/**
 * LSP 接管策略表
 *
 * 这里定义「哪些语言特性可以被 ydwe-compiler 的 `--lsp` 服务接管」，以及
 * 「服务端能力字段 -> 特性 id」的映射关系。
 *
 * 约定：
 * - 特性 id 同时是**原生实现（src/provider/*）的注册单元**。某个特性被 LSP 接管时，
 *   对应的原生 provider 会被注销；未被接管时则安装原生实现。两者互斥，不会同时生效，
 *   避免 VSCode 把两套结果合并（例如补全项重复、hover 出现两段内容）。
 * - 本文件不依赖任何运行时状态，纯粹是声明 + 纯函数，便于单独推演与测试。
 */

import { ServerCapabilities } from 'vscode-languageclient/node';

/**
 * 可被语言服务器接管的语言特性 id。
 *
 * 注意：`documentHighlight` / `semanticTokens` 没有对应的原生实现，
 * 它们只是「是否允许服务端额外输出」的开关——未接管时通过中间件屏蔽，
 * 避免出现“没让服务端接管却多了高亮”的意外行为。
 */
export type JassFeatureId =
    | 'diagnostics'
    | 'hover'
    | 'completion'
    | 'definition'
    | 'signatureHelp'
    | 'documentSymbol'
    | 'inlayHints'
    | 'documentHighlight'
    | 'semanticTokens';

/** 全部特性，顺序稳定，供注册/注销循环使用 */
export const ALL_JASS_FEATURES: readonly JassFeatureId[] = [
    'diagnostics',
    'hover',
    'completion',
    'definition',
    'signatureHelp',
    'documentSymbol',
    'inlayHints',
    'documentHighlight',
    'semanticTokens'
];

/**
 * 开启 `jass.lsp` 后默认交给 exe 接管的特性。
 *
 * 目前只放开「错误诊断（diagnostics）」与「悬停（hover）」：
 * 扩展内置实现还带着标准库补全、Warcraft III API 版本过滤、vJass 库跨文件解析等
 * 服务端尚未复刻的能力，贸然整体替换会明显降低体验。
 *
 * 需要放开更多特性时，把对应 id 加进这个数组即可，其余代码无需改动
 * （原生 provider 会自动让位，服务端不支持的特性会自动回落原生实现）。
 */
export const DEFAULT_TAKEOVER_FEATURES: readonly JassFeatureId[] = ['diagnostics', 'hover'];

/** 用于日志展示的友好名称 */
export const FEATURE_LABELS: Readonly<Record<JassFeatureId, string>> = {
    diagnostics: '错误诊断',
    hover: '悬停提示',
    completion: '代码补全',
    definition: '跳转定义',
    signatureHelp: '参数提示',
    documentSymbol: '文档大纲',
    inlayHints: '内联提示',
    documentHighlight: '符号高亮',
    semanticTokens: '语义着色'
};

/** 服务端能力字段 -> 特性 id 的映射 */
const CAPABILITY_FEATURE_MAP: ReadonlyArray<readonly [keyof ServerCapabilities, JassFeatureId]> = [
    ['hoverProvider', 'hover'],
    ['completionProvider', 'completion'],
    ['definitionProvider', 'definition'],
    ['signatureHelpProvider', 'signatureHelp'],
    ['documentSymbolProvider', 'documentSymbol'],
    ['inlayHintProvider', 'inlayHints'],
    ['documentHighlightProvider', 'documentHighlight'],
    ['semanticTokensProvider', 'semanticTokens']
];

/**
 * 求「期望接管集合」与「服务端真实能力」的交集。
 *
 * - `diagnostics` 走 push 模型（`textDocument/publishDiagnostics`），
 *   不需要能力声明，只要服务端在跑就视为可用。
 * - 其余特性必须由服务端在 `initialize` 响应里显式声明，否则回落原生实现。
 *
 * @param desired 期望交给服务端接管的特性
 * @param capabilities 服务端 `initialize` 返回的能力声明
 */
export function resolveEffectiveTakeover(
    desired: readonly JassFeatureId[],
    capabilities: ServerCapabilities | undefined
): Set<JassFeatureId> {
    const effective = new Set<JassFeatureId>();

    for (const feature of desired) {
        if (feature === 'diagnostics') {
            effective.add(feature);
            continue;
        }
        const entry = CAPABILITY_FEATURE_MAP.find(([, id]) => id === feature);
        if (entry && capabilities && capabilities[entry[0]]) {
            effective.add(feature);
        }
    }

    return effective;
}

/** 把接管集合格式化成日志文本 */
export function describeTakeover(features: ReadonlySet<JassFeatureId>): string {
    if (features.size === 0) {
        return '(无)';
    }
    return ALL_JASS_FEATURES.filter((id) => features.has(id))
        .map((id) => FEATURE_LABELS[id])
        .join('、');
}
