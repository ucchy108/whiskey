# MSW テスト戦略ドキュメント作成

**作業日**: 2026-02-11
**担当**: Claude Code
**ステータス**: 完了

## 目的

MSWの利用方法をドキュメント化し、テスト・Storybook実装時のガイドラインとして参照できるようにする。

## 完了サマリー

### 実装内容

1. `docs/development/frontend-testing-strategy.md` に「MSW によるAPIモック戦略」セクションを追加
   - ファイル構成の図解
   - モックデータ・ハンドラ・サーバーの実装例
   - Vitest での利用パターン3種（デフォルト / server.use() 上書き / renderPage ヘルパー）
   - Storybook での利用パターン5種（Default / Loading / Error / Empty / データ変更）
   - ストーリーバリアントの標準セット表
   - 新ドメイン追加の手順
   - MSW ルール一覧表
2. `frontend/CLAUDE.md` に MSW ガイダンスを追加
   - API モックルール（MSW を使う / vi.mock 禁止）
   - テスト・ストーリーのコード例
   - 詳細ドキュメントへのリンク
3. テスト環境・設定ファイルの表を MSW 関連エントリで更新
4. カスタムフックテストセクションに MSW 使用例を追加

### 変更ファイル一覧

- `docs/development/frontend-testing-strategy.md` - MSWセクション追加 + 既存セクション更新
- `frontend/CLAUDE.md` - MSWガイダンス追加
