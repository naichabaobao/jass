# `src/lsp` —— 实验性：接入 ydwe-compiler 语言服务器

`jass.lsp`（默认 `false`）开启后，扩展会把**部分语言特性**交给内置的
`static/ydwe-compiler.exe --lsp`（Rust 实现的语言服务器），其余特性继续由
`src/provider/*` 的 TypeScript 实现提供。

## 模块划分

| 文件 | 职责 |
| --- | --- |
| `takeover.ts` | 声明「哪些特性可被接管」+「服务端能力 → 特性 id」映射，纯函数、无状态 |
| `server-resolver.ts` | 定位 exe（配置 → PATH → 工作区 target → 扩展内置），以及 `--lsp` 可用性探测 |
| `lsp-client-manager.ts` | `vscode-languageclient` 生命周期：启动 / 能力协商 / trace / 停止 / 崩溃上报 + 能力屏蔽中间件 |
| `lsp-mode-controller.ts` | 模式切换总控：`FeatureRegistry` 保证同一特性只有一套实现生效；失败一律回落原生实现 |

## 数据流

```
jass.lsp 变化
      │
      ▼
LspModeController.apply()
      │
      ├─ 关闭 → 全部特性装「原生实现」
      │
      └─ 开启 → 定位 exe → 探测 --lsp 可用
                    │            │
                    │            └─ 不可用 → 提示原因 + 全部回落原生
                    ▼
              LanguageClient 启动
                    │
                    ├─ 成功 → 取服务端 capabilities，
                    │         effective = DEFAULT_TAKEOVER ∩ capabilities
                    │         接管的特性注销原生 provider，其余装原生
                    │
                    └─ 失败/中途崩溃 → 提示原因 + 全部回落原生
```

## 接管策略

默认接管集合见 `takeover.ts` 的 `DEFAULT_TAKEOVER_FEATURES`：

```ts
['diagnostics', 'hover']
```

只放开「错误诊断」与「悬停」的原因：扩展内置实现还带着标准库补全、
Warcraft III API 版本过滤、vJASS 库跨文件解析等能力，服务端暂未复刻。

**要放开更多特性**：把对应 id 加进 `DEFAULT_TAKEOVER_FEATURES` 即可，
其余代码无需改动 —— 原生 provider 会自动让位；若服务端没有声明对应能力，
`resolveEffectiveTakeover` 会自动把它排除并回落原生实现。

**要新增一个可接管特性**：

1. 在 `takeover.ts` 的 `JassFeatureId` 与 `ALL_JASS_FEATURES` 中加 id；
2. 若服务端有对应能力字段，补进 `CAPABILITY_FEATURE_MAP`；
3. 在 `extension.ts` 的 `nativeFeatureFactories` 中登记原生实现工厂
   （没有原生实现的特性可以省略）；
4. 在 `lsp-client-manager.ts` 的 `buildMiddleware()` 里补一条屏蔽规则，
   否则即便没接管，服务端也会和原生实现同时出结果。

## 为什么需要中间件屏蔽

`vscode-languageclient` 只要发现服务端声明了某能力，就会为 `documentSelector`
覆盖的**所有**文档注册对应 provider。若不屏蔽，未接管的能力会出现
「服务端 + 原生」两份结果（补全重复、hover 两段）。中间件把这些能力的返回值
改写成「无结果」，等价于该能力完全交给原生实现。

## 已知副作用

接管 `diagnostics` 会 dispose 内置 `DiagnosticProvider`，它的
`unusedDecorationType` 也随之释放 —— 「未使用符号灰显」在 LSP 模式下会失效
（服务端诊断不带 `tags`）。这是接管诊断的必然代价，若要保留需另行评估。

## 服务端产物要求

`static/ydwe-compiler.exe` 必须用 **带 `lsp` feature** 的方式构建：

```bash
cargo build --release --features lsp
```

未启用该 feature 的产物执行 `--lsp` 会立刻退出并打印
`LSP feature not enabled`，此时控制器会给出明确提示并回落原生实现。

## 排障

- 输出面板：**输出 → JASS Language Server**（记录定位结果、能力协商、回落原因）。
- `jass.lsp.trace.server = verbose` 可打印 JSON-RPC 报文。
- 命令面板：**JASS: 重启语言服务器（ydwe-compiler）**。
- 若曾用旧 exe 触发过探测失败，探测结果按「路径 + mtime」缓存；替换 exe 后会自动失效。
