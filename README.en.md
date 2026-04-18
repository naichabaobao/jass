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

`off`, `1.20`, `1.24`, `1.27`, `1.26a`, `1.27a`, `1.28f`, `1.29`, `1.30`, `1.31`, `1.32`, `1.33`, `1.36`

## Contribution

Issues and PRs are welcome.

We especially welcome help on standard-library version annotations:

- `static/common.j`
- `static/blizzard.j`
- `static/common.ai`

Adding `@since` tags (compatible with `@version`) will improve version-aware completion ranking.
