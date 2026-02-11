# useAuth テスト修正

**作業日**: 2026-02-11
**担当**: Claude Code (auth-test-fix)
**ステータス**: 完了

## 目的

useAuth.test.tsx の4件のテスト失敗を調査・修正する。

## 作業内容

### 調査

- テストファイル、フック実装、API層の確認
- vi.mock() とMSWの相互作用の調査

### 根本原因

2つの問題を特定:

1. **vi.mock('../../api') が機能せず、MSWのURL不一致**: `VITE_API_URL=http://localhost:8080` が設定されているため、`request()` 関数は `http://localhost:8080/api/auth/login` のような絶対URLでfetchを実行。MSWハンドラは相対パス `/api/auth/login` で登録されており、Node.js環境ではマッチしなかった。`onUnhandledRequest: 'bypass'` の設定により、実際のネットワークリクエストにパススルーされ、ECONNREFUSED エラーが発生。

2. **AuthProviderなしテスト**: React 18の `renderHook` はレンダリング中のエラーをキャッチしないため、`expect(() => renderHook(...)).toThrow()` パターンで直接キャッチする必要がある。

### 修正内容

1. `vitest.config.ts` に `define: { 'import.meta.env.VITE_API_URL': JSON.stringify('') }` を追加し、テスト環境でAPIクライアントが相対パスを使用するよう設定。これによりMSWハンドラが正しくマッチ。

2. `useAuth.test.tsx` を書き直し:
   - `vi.mock('../../api')` を削除し、MSWハンドラ (`server.use()`) に移行
   - 各テストで `server.use()` によるハンドラオーバーライドを使用
   - 「login失敗」テストを `try/catch` パターンに変更
   - 「AuthProviderなし」テストを `console.error` 抑制付きの `expect().toThrow()` パターンに変更

## 完了サマリー

### 変更ファイル一覧

- `frontend/vitest.config.ts` - テスト環境で VITE_API_URL を空文字に設定
- `frontend/src/features/auth/hooks/useAuth/useAuth.test.tsx` - vi.mock廃止、MSWハンドラ移行

### テスト結果

- 全33テストファイル、144テストがパス
- useAuth.test.tsx: 7/7 パス (修正前: 3/7 パス)
