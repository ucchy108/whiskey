# Snackbar エラー表示ルール整備 + 実装

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

開発ルールを整備し、API呼び出しはPage層、エラー表示はSnackbarで統一する方針を確定。
`useSnackbar` フック + `SnackbarProvider` + `AppSnackbar` を実装し、既存の認証ページをリファクタリングする。

## 作業内容

### ルール記述

- `frontend/CLAUDE.md` に Page 層責務ルール、Snackbar エラー表示ルールを追記
- `docs/architecture/frontend-architecture.md` に Page 層/Component 層の責務定義、エラー表示方針を追記

### Snackbar 基盤実装

- `shared/hooks/useSnackbar/` — SnackbarProvider + useSnackbar + useSnackbarState
- `shared/components/AppSnackbar/` — MUI Snackbar + Alert ラッパー
- App.tsx に SnackbarProvider + AppSnackbar を追加
- Storybook preview にも SnackbarProvider + AppSnackbar を追加

### 認証画面リファクタリング

- LoginForm / RegisterForm から `error` prop とインラインエラーボックスを削除
- LoginPage / RegisterPage で `useSnackbar().showError()` に移行
- Stories から `WithError` バリアントを削除
- テスト更新: Form のインラインエラーテスト削除、Page の Snackbar テストに変更

## 完了サマリー

### 実装内容

- 開発ルール（Page 層責務、Snackbar 統一、Component Pure UI）をドキュメント化
- `useSnackbar` 汎用 hook（showError / showSuccess）
- `SnackbarProvider` + `AppSnackbar` のグローバル基盤
- LoginForm / RegisterForm の Pure UI 化（error prop 廃止）
- LoginPage / RegisterPage の Snackbar 移行

### 変更ファイル一覧

- `frontend/CLAUDE.md` — Page 層責務ルール、Snackbar ルール追記
- `docs/architecture/frontend-architecture.md` — Page/Component 責務定義追記
- `frontend/src/shared/hooks/useSnackbar/useSnackbar.tsx` — 新規
- `frontend/src/shared/hooks/useSnackbar/useSnackbar.test.tsx` — 新規
- `frontend/src/shared/hooks/useSnackbar/index.ts` — 新規
- `frontend/src/shared/hooks/index.ts` — 新規
- `frontend/src/shared/components/AppSnackbar/AppSnackbar.tsx` — 新規
- `frontend/src/shared/components/AppSnackbar/index.ts` — 新規
- `frontend/src/shared/components/index.ts` — 更新
- `frontend/src/App.tsx` — SnackbarProvider + AppSnackbar 追加
- `frontend/.storybook/preview.tsx` — SnackbarProvider + AppSnackbar 追加
- `frontend/src/features/auth/components/LoginForm/LoginForm.tsx` — error prop 削除
- `frontend/src/features/auth/components/LoginForm/LoginForm.stories.tsx` — WithError 削除
- `frontend/src/features/auth/components/LoginForm/LoginForm.test.tsx` — 更新
- `frontend/src/features/auth/components/RegisterForm/RegisterForm.tsx` — error prop 削除
- `frontend/src/features/auth/components/RegisterForm/RegisterForm.stories.tsx` — WithError 削除
- `frontend/src/features/auth/components/RegisterForm/RegisterForm.test.tsx` — 更新
- `frontend/src/features/auth/pages/LoginPage/LoginPage.tsx` — useSnackbar 移行
- `frontend/src/features/auth/pages/LoginPage/LoginPage.test.tsx` — Snackbar テスト
- `frontend/src/features/auth/pages/RegisterPage/RegisterPage.tsx` — useSnackbar 移行
- `frontend/src/features/auth/pages/RegisterPage/RegisterPage.test.tsx` — Snackbar テスト

### テスト結果

- 全51テストパス（10ファイル）
- TypeScript 型チェック通過

### 次のステップ

- ワークアウト記録画面で `showSuccess('ワークアウトを記録しました')` を活用
