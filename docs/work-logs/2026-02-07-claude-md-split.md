# CLAUDE.md をルート/backend/frontend に3分割

**作業日**: 2026-02-07
**担当**: Claude Code
**ステータス**: 完了

## 目的

単一の CLAUDE.md をルート（共通）、backend、frontend の3ファイルに分割し、各ディレクトリで作業する際に適切なコンテキストのみが読み込まれるようにする。

## 作業内容

### 分割実施

- 現在の CLAUDE.md（220行）を分析し、内容を3カテゴリに分類
- ルート CLAUDE.md: プロジェクト概要、Docker環境、Gitルール、作業ログルール、ドキュメントリンク
- backend/CLAUDE.md: プロジェクト構造、実装状況、テスト実行、DB操作、ログルール
- frontend/CLAUDE.md: feature構成、実装状況、import規約、テーマの使い方

## 完了サマリー

### 実装内容

- `CLAUDE.md` を共通事項のみに縮小（220行 → 116行）
- `backend/CLAUDE.md` を新規作成（バックエンド固有のコンテキスト）
- `frontend/CLAUDE.md` を新規作成（フロントエンド固有のコンテキスト）

### 変更ファイル一覧

- `CLAUDE.md` - 共通事項のみに縮小
- `backend/CLAUDE.md` - 新規作成
- `frontend/CLAUDE.md` - 新規作成

### 分割の効果

- `frontend/` で作業時: ルート CLAUDE.md（共通） + frontend/CLAUDE.md（フロント固有）のみ読み込み
- `backend/` で作業時: ルート CLAUDE.md（共通） + backend/CLAUDE.md（バックエンド固有）のみ読み込み
- コンテキストウィンドウの無駄遣いを防止
