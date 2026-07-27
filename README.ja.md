# VS Code JASS 拡張

言語: [简体中文](README.md) | [English](README.en.md) | 日本語

## クイックスタート

1. リポジトリをクローン
```sh
git clone https://github.com/naichabaobao/jass.git
npm install
```
2. VS Code でプロジェクトを開く
3. `F5` で拡張デバッグホストを起動
4. `.j` / `.jass` / `.ai` / `.zn` ファイルを開く

## 主な機能

- JASS / vJASS / Zinc のシンタックスハイライト
- 補完、ホバー、定義ジャンプ、参照検索
- 診断とセマンティックチェック
- フォーマットとスニペット
- ワークスペースシンボル対応
- JASS コンパイルチェック（`pjass.exe` ベース）：エディタ右クリックの `JASS` サブメニューから 3 モード（トリガー / カスタムライブラリ / AI スクリプト）を選択可能

## 設定

設定は2レイヤーあります:

1. ワークスペース設定ファイル: `jass.config.json`
2. VS Code 設定 (`settings.json`)

### `jass.apiVersion`

```json
{
  "jass.apiVersion": "off"
}
```

- デフォルトは `off`（既存の挙動を変更しません）。
- Warcraft III バージョンを指定すると、補完項目の `@since`（`@version` 互換）が対象バージョンより新しい場合に順位を下げます。
- バージョン注釈のない項目は変更しません。

よく使う選択肢:

`off`, `1.20`, `1.24`, `1.27`, `1.26a`, `1.27a`, `1.28f`, `1.29`, `1.30`, `1.31`, `1.32`, `1.33`, `1.36`, `2.00`, `2.02`, `2.03`

### `jass.compiler.*` - JASS コンパイルチェック設定

`jass.compiler.*` 系設定により、「コメント表示用標準ライブラリ」と「コンパイルチェック用標準ライブラリ」を分離し、`pjass.exe` のパスもカスタマイズできます。

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

| 設定項目 | 説明 | デフォルト |
| --- | --- | --- |
| `jass.compiler.pjassPath` | JASS 構文チェックに使う `pjass.exe` のパス。空の場合は拡張組み込み版（`out/extern/pjass/pjass.exe`）を使用 | `""` |
| `jass.compiler.commonJ` | 中国語 API コメント表示用の `common.j` パス。空の場合は組み込み版（`static/common.j`）を使用 | `""` |
| `jass.compiler.blizzardJ` | 中国語 API コメント表示用の `Blizzard.j` パス。空の場合は組み込み版（`static/blizzard.j`）を使用 | `""` |
| `jass.compiler.commonAi` | 中国語 API コメント表示用の `common.ai` パス。空の場合は組み込み版（`static/common.ai`）を使用 | `""` |
| `jass.compiler.checkCommonJ` | コンパイルチェック用の `common.j` パス。空の場合は `jass.compiler.commonJ` にフォールバック | `""` |
| `jass.compiler.checkBlizzardJ` | コンパイルチェック用の `Blizzard.j` パス。空の場合は `jass.compiler.blizzardJ` にフォールバック | `""` |
| `jass.compiler.checkCommonAi` | コンパイルチェック用の `common.ai` パス。空の場合は `jass.compiler.commonAi` にフォールバック | `""` |

**検索優先度（コンパイルチェック）**: `jass.compiler.check*` > `jass.compiler.*` > 拡張組み込み `static/` 版。

### JASS コンパイルチェックの使い方

拡張は `pjass.exe` 構文チェッカーを内蔵しています。エディタ上で右クリック → `JASS` サブメニューからチェックモードを選択します:

| メニュー項目 | 引数の順序 | 用途 |
| --- | --- | --- |
| `编译自定义触发`（カスタムトリガー） | `common.j` + `blizzard.j` + 対象ファイル | トリガー風スクリプト（war3map.j）のチェック |
| `编译自定义库(Blizzard.j或common.ai)`（カスタムライブラリ） | `common.j` + 対象ファイル | カスタムライブラリスクリプト（Blizzard.j、common.ai など）のチェック |
| `编译自定义ai脚本`（カスタム AI スクリプト） | `common.j` + `common.ai` + 対象ファイル | AI スクリプトのチェック |

**手順**:
1. 任意の `.j` / `.jass` / `.ai` ファイルを開きます。
2. エディタ上で右クリック → `JASS` → 該当するチェックモードを選択します。
3. `JASS 编译检查` 出力パネルで結果を確認します（中国語パスは GBK でデコード）。

> `pjass.exe` が見つからない場合は、`settings.json` で `jass.compiler.pjassPath` を設定するか、`pjass.exe` を拡張ディレクトリ `out/extern/pjass/pjass.exe` に配置してください。

## コントリビュート

Issue / PR を歓迎します。

特に標準ライブラリのバージョン注釈の協力を歓迎します:

- `static/common.j`
- `static/blizzard.j`
- `static/common.ai`

`@since`（`@version` 互換）を補完していただけると、バージョン別補完順位の精度が向上します。
