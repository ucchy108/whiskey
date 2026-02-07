# LoginForm を RHF + zod でリファクタリング

**作業日**: 2026-02-07
**担当**: Claude Code
**ステータス**: 完了

## 目的

LoginForm の状態管理を React Hook Form + zod に移行する。ワークアウト記録画面など今後の複雑なフォームに備え、フォームパターンを早期に確立する。

## 作業内容

### パッケージインストール

- `react-hook-form`, `zod`, `@hookform/resolvers` をインストール

### LoginForm リファクタリング

- `useState` による手動状態管理を `useForm` + `zodResolver` に置換
- `loginSchema` を定義（email: 必須 + メール形式、password: 必須）
- `register()` で各フィールドを接続
- `errors` からフィールド単位のバリデーションエラーを表示
- `noValidate` でブラウザネイティブバリデーションを無効化
- Props インターフェースは変更なし（外部 API 互換維持）

## 完了サマリー

### 変更ファイル一覧

- `frontend/package.json` - react-hook-form, zod, @hookform/resolvers 追加
- `frontend/src/features/auth/components/LoginForm.tsx` - RHF + zod 移行

### テスト結果

- `npx tsc --noEmit` - パス
- `npx vite build` - パス
- `npx storybook build` - パス
