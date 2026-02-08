# テスト戦略ドキュメント分離

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

testing-strategy.md をバックエンド専用とフロントエンド専用に分離し、それぞれの技術スタックに集中できるようにする。

## 完了サマリー

### 実装内容

- `testing-strategy.md` からフロントエンドセクションを分離
- `frontend-testing-strategy.md` を新規作成
- `testing-strategy.md` をバックエンド専用に整理（タイトル・冒頭説明を変更、相互リンク追加）
- 各 CLAUDE.md からのリンクを更新

### 変更ファイル一覧

- `docs/development/frontend-testing-strategy.md` - 新規作成（フロントエンド専用）
- `docs/development/testing-strategy.md` - バックエンド専用に整理
- `CLAUDE.md` - リンクを2行に分離（バックエンド/フロントエンド）
- `frontend/CLAUDE.md` - リンク先を frontend-testing-strategy.md に変更
- `backend/CLAUDE.md` - リンクテキストを「バックエンドテスト戦略」に変更
