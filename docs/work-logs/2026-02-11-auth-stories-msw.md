# Auth系ページStoriesへのMSW導入

**作業日**: 2026-02-11
**担当**: Claude Code (auth-stories agent)
**ステータス**: 完了

## 目的

Auth系ページ（LoginPage, RegisterPage）のStorybookストーリーにMSWを導入し、APIモックを統一する。

## 作業内容

### 調査

- Auth系ストーリーファイルの現状を調査
  - LoginPage.stories.tsx: MSW未導入、手動WithErrorSnackbarデコレータでエラー表示をシミュレート
  - RegisterPage.stories.tsx: 同上
- Workout系ストーリー（MSW導入済み）のパターンを参考に確認
- MSWハンドラ（auth.ts）の確認: POST /api/auth/login, POST /api/users, POST /api/auth/logout
- preview.tsx でグローバルにauth/exercise/workoutハンドラが登録済みであることを確認

### MSW導入実装

- LoginPage.stories.tsx を書き換え:
  - Default: デフォルトMSWハンドラ（成功）を使用
  - Loading: `delay('infinite')` で無限ローディング状態
  - LoginError: 401レスポンスで認証エラー
  - ServerError: 500レスポンスでサーバーエラー
  - 不要な `WithErrorSnackbar` ヘルパーコンポーネントを削除
  - 不要な `useEffect`, `useSnackbar` のimportを削除

- RegisterPage.stories.tsx を書き換え:
  - Default: デフォルトMSWハンドラ（成功）を使用
  - Loading: `delay('infinite')` で無限ローディング状態
  - ConflictError: 409レスポンスでメールアドレス重複エラー
  - ValidationError: 400レスポンスでバリデーションエラー
  - ServerError: 500レスポンスでサーバーエラー
  - 不要な `WithErrorSnackbar` ヘルパーコンポーネントを削除

### テスト実行

- LoginPage.test.tsx: 4/4 パス
- RegisterPage.test.tsx: 4/4 パス
- useAuth.test.tsx: 4件失敗（既存の問題 - auth-test-fix担当）

## 完了サマリー

### 実装内容

- LoginPage.stories.tsx にMSW導入（4バリアント: Default, Loading, LoginError, ServerError）
- RegisterPage.stories.tsx にMSW導入（5バリアント: Default, Loading, ConflictError, ValidationError, ServerError）
- 手動のWithErrorSnackbarパターンを廃止し、MSWベースのエラーシミュレーションに統一

### 変更ファイル一覧

- `frontend/src/features/auth/pages/LoginPage/LoginPage.stories.tsx`
- `frontend/src/features/auth/pages/RegisterPage/RegisterPage.stories.tsx`

### テスト結果

- LoginPage テスト: 4/4 パス
- RegisterPage テスト: 4/4 パス
- 全体: 32/33 ファイルパス（useAuth.test.tsxの4件失敗は既存問題）
