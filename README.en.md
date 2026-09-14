# VS Code JASS Extension

Languages: [简体中文](README.md) | English | [日本語](README.ja.md)

## Quick Start

1. Clone repository
```sh
git clone https://github.com/naichabaobao/jass.git
npm install
```
2. Open the project in VS Code
3. Press `F5` to start extension debug host
4. Open `.j`, `.jass`, `.ai`, or `.zn` files

## Features

- Syntax highlighting for JASS / vJASS / Zinc
- Completion, hover, definition, references
- Diagnostics and semantic checks
- Formatting and snippets
- Workspace symbol support
- JASS compile check (powered by `pjass.exe`) with three modes via the editor right-click `JASS` submenu (trigger / custom library / AI script)

## Configuration

This extension supports two configuration layers:

1. Workspace config file: `jass.config.json`
2. VS Code settings (`settings.json`) for extension preferences

### `jass.apiVersion`

```json
{
  "jass.apiVersion": "off"
}
```

- Default is `off` (keeps existing behavior).
- If set to a Warcraft III version, completion items are de-prioritized when their `@since` (or compatible `@version`) is newer than the selected version.
- Items without version tags are not affected.

Common options include:

`off`, `1.20`, `1.24`, `1.27`, `1.26a`, `1.27a`, `1.28f`, `1.29`, `1.30`, `1.31`, `1.32`, `1.33`, `1.36`, `2.00`, `2.02`, `2.03`

### `jass.compiler.*` - JASS compile check

The `jass.compiler.*` settings decouple "standard libraries used for displaying comments" from "standard libraries used for compile checks", and let you customize the `pjass.exe` path.

```json
{
  "jass.compiler.pjassPath": "",
  "jass.compiler.commonJ": "",
  "jass.compiler.blizzardJ": "",
  "jass.compiler.commonAi": "",
  "jass.compiler.checkCommonJ": "",
  "jass.compiler.checkBlizzardJ": "",
  "jass.compiler.checkCommonAi": ""
}
```

| Setting | Description | Default |
| --- | --- | --- |
| `jass.compiler.pjassPath` | Path to `pjass.exe` used for JASS syntax checks. Empty uses the bundled version (`out/extern/pjass/pjass.exe`) | `""` |
| `jass.compiler.commonJ` | Path to `common.j` for displaying Chinese API comments. Empty uses the bundled version (`static/common.j`) | `""` |
| `jass.compiler.blizzardJ` | Path to `Blizzard.j` for displaying Chinese API comments. Empty uses the bundled version (`static/blizzard.j`) | `""` |
| `jass.compiler.commonAi` | Path to `common.ai` for displaying Chinese API comments. Empty uses the bundled version (`static/common.ai`) | `""` |
| `jass.compiler.checkCommonJ` | `common.j` path for compile checks. Empty falls back to `jass.compiler.commonJ` | `""` |
| `jass.compiler.checkBlizzardJ` | `Blizzard.j` path for compile checks. Empty falls back to `jass.compiler.blizzardJ` | `""` |
| `jass.compiler.checkCommonAi` | `common.ai` path for compile checks. Empty falls back to `jass.compiler.commonAi` | `""` |

**Lookup priority (compile check)**: `jass.compiler.check*` > `jass.compiler.*` > bundled `static/` version.

### `jass.lsp` - ydwe-compiler language server (experimental)

The extension bundles a Rust-based compiler language server (Windows: `static/ydwe-compiler.exe`, Linux: `static/ydwe-compiler`)
which can run in LSP mode (`--lsp`). When `jass.lsp` is enabled, **hover and diagnostics** are taken over by this language server,
while all other features (completion, definition, outline, formatting, etc.) are still provided by the extension's built-in TypeScript implementation.

```json
{
  "jass.lsp": true,
  "jass.lsp.trace.server": "off"
}
```

| Setting | Description | Default |
| --- | --- | --- |
| `jass.lsp` | Let the bundled language server take over hover / diagnostics. **Experimental**, disabled by default | `false` |
| `jass.lsp.trace.server` | LSP communication log level: `off` / `messages` / `verbose` | `"off"` |

**Server path**: the language server path is **not configurable** — it always uses the platform-matched binary bundled in the extension's `static/` directory (Windows: `ydwe-compiler.exe`; Linux/macOS: `ydwe-compiler`). On Linux/macOS, the extension copies the bundled binary to its global storage and marks it executable on first use (VSIX packaging loses the executable bit).

**Behavior notes**:

- Toggling the switch **restarts the language server automatically**; no window reload required.
- If anything goes wrong (binary missing, `lsp` feature not enabled, startup failure or unexpected exit), the extension **falls back to its built-in implementation** automatically; the reason is logged in the `JASS Language Server` output channel.
- Diagnostics from the server are tagged with the source `ydwe-compiler`, distinct from the built-in `jass` / `zinc` sources.
- Command palette: **JASS: Restart Language Server (ydwe-compiler)**.

> The bundled language server must be built with `cargo build --release --features lsp` to enable LSP;
> a binary without this feature exits immediately when run with `--lsp`.

### JASS compile check usage

The extension bundles a `pjass.exe` syntax checker. Right-click in the editor → `JASS` submenu to choose a check mode:

| Menu item | Argument order | Use case |
| --- | --- | --- |
| `编译自定义触发` (Check custom trigger) | `common.j` + `blizzard.j` + target file | Check trigger-style scripts (war3map.j) |
| `编译自定义库(Blizzard.j或common.ai)` (Check custom library) | `common.j` + target file | Check custom library scripts (e.g. Blizzard.j, common.ai) |
| `编译自定义ai脚本` (Check custom AI script) | `common.j` + `common.ai` + target file | Check AI scripts |

**Steps**:
1. Open any `.j` / `.jass` / `.ai` file.
2. Right-click in the editor → `JASS` → select the matching check mode.
3. View the results in the `JASS 编译检查` output panel (Chinese paths are decoded with GBK).

> If `pjass.exe` cannot be found, set `jass.compiler.pjassPath` in `settings.json`, or place `pjass.exe` in the extension directory `out/extern/pjass/pjass.exe`.

## Contribution

Issues and PRs are welcome.

We especially welcome help on standard-library version annotations:

- `static/common.j`
- `static/blizzard.j`
- `static/common.ai`

Adding `@since` tags (compatible with `@version`) will improve version-aware completion ranking.
