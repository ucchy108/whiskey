# Phase 3.1 認証画面の完成

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

Phase 3.1の残りタスクを完了させる。RegisterPage実装、useAuthフック、バックエンドAPI接続。

## 作業内容

### Step 1: registerSchema追加
- `schemas.ts` に `registerSchema` + `RegisterFormValues` 追加
- パスワード8文字以上制約、確認一致チェック（.refine）
- テスト6件追加（計11テスト）

### Step 2: RegisterFormコンポーネント
- `RegisterForm.tsx` 新規作成（LoginFormと同パターン: RHF + zod）
- Stories: Default / WithError / Loading
- テスト7件（レンダリング、送信、バリデーション3件、エラー表示、ローディング）

### Step 3: useAuthフック
- `hooks/useAuth.tsx` 新規作成（AuthContext + AuthProvider + useAuth）
- localStorage でユーザー情報永続化、cookieでサーバー認証
- register後の自動login実装
- テスト7件（初期状態、localStorage読込、login成功/失敗、register、logout、Provider無しエラー）

### Step 4: ProtectedRoute
- `ProtectedRoute.tsx` 新規作成（user null → /login リダイレクト）
- テスト2件（認証済み→children表示、未認証→リダイレクト）

### Step 5: LoginPage API接続 + RegisterPage実装
- `LoginPage.tsx` のTODOを `useAuth().login` に差し替え、エラーハンドリング追加
- `RegisterPage.tsx` をフル実装（BrandPanel + RegisterForm + useAuth().register）
- stories更新・新規作成（AuthProviderデコレーター追加）
- テスト更新・新規作成（API連携テスト追加）

### Step 6: App.tsx / routes 配線
- `App.tsx` に AuthProvider 追加
- `routes/index.tsx` に ProtectedRoute 適用
- `index.ts` barrel export更新

## 完了サマリー

### テスト結果
- 全43テストパス（8テストファイル）
- 型チェックエラーなし

### 変更ファイル一覧
- `features/auth/schemas.ts` — registerSchema追加
- `features/auth/schemas.test.ts` — テスト追加
- `features/auth/components/RegisterForm.tsx` — 新規
- `features/auth/components/RegisterForm.stories.tsx` — 新規
- `features/auth/components/RegisterForm.test.tsx` — 新規
- `features/auth/hooks/useAuth.tsx` — 新規
- `features/auth/hooks/useAuth.test.tsx` — 新規
- `features/auth/components/ProtectedRoute.tsx` — 新規
- `features/auth/components/ProtectedRoute.test.tsx` — 新規
- `features/auth/pages/LoginPage.tsx` — API接続
- `features/auth/pages/LoginPage.stories.tsx` — AuthProvider追加
- `features/auth/pages/LoginPage.test.tsx` — API連携テスト追加
- `features/auth/pages/RegisterPage.tsx` — フル実装
- `features/auth/pages/RegisterPage.stories.tsx` — 新規
- `features/auth/pages/RegisterPage.test.tsx` — 新規
- `App.tsx` — AuthProvider追加
- `routes/index.tsx` — ProtectedRoute適用
- `features/auth/index.ts` — barrel export更新
