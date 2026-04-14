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

`off`, `1.20`, `1.24`, `1.27`, `1.26a`, `1.27a`, `1.28f`, `1.29`, `1.30`, `1.31`, `1.32`, `1.33`, `1.36`

## コントリビュート

Issue / PR を歓迎します。

特に標準ライブラリのバージョン注釈の協力を歓迎します:

- `static/common.j`
- `static/blizzard.j`
- `static/common.ai`

`@since`（`@version` 互換）を補完していただけると、バージョン別補完順位の精度が向上します。
