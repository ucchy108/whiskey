# MSW v2 導入（Storybook + Vitest統合）

**作業日**: 2026-02-11
**担当**: Claude Code
**ステータス**: 完了

## 目的

Page層のStorybook stories（WorkoutListPage, WorkoutDetailPage, WorkoutFormPage）がバックエンドなしではレンダリングできない問題を解決する。MSW v2を導入し、Storybook（ブラウザ）とVitest（Node.js）の両環境で共通のAPIモックハンドラを使えるようにする。

## 作業内容

### 作業開始 - 計画・設計

- MSW v2 + msw-storybook-addon の導入計画を策定
- 既存のStorybook v10設定、APIモジュール、テストパターンを調査

### パッケージインストール

- `msw`, `msw-storybook-addon` をdevDependenciesに追加
- `npx msw init public/` で `mockServiceWorker.js` を生成

### モックデータ・ハンドラ作成

- `src/test/mocks/data/` に共有モックデータを集約（users, exercises, workouts）
- `src/test/mocks/handlers/` にAPIハンドラを作成（auth, exercise, workout）
- `src/test/mocks/server.ts` にVitest用MSWサーバーを作成

### Storybook・Vitest設定変更

- `.storybook/main.ts` に `staticDirs: ['../public']` を追加
- `.storybook/preview.tsx` に MSW `initialize()` + `mswLoader` + グローバルハンドラを追加
- `src/test/setup.ts` に MSWサーバーライフサイクル（listen/resetHandlers/close）を追加
- `onUnhandledRequest: 'bypass'` を採用（既存テストとの互換性のため）

### Page stories のMSW対応

- WorkoutListPage: Default, Empty, Loading, Error バリアント追加
- WorkoutDetailPage: Default, WithMemo, Loading バリアント追加
- WorkoutFormPage: Default, SubmitConflict バリアント追加

## 完了サマリー

### 実装内容

- MSW v2 + msw-storybook-addon のインストール・設定
- 共有モックデータ（users, exercises, workouts）
- APIハンドラ（auth, exercise, workout の全エンドポイント対応）
- Storybook preview へのMSW統合（グローバルハンドラ + per-storyオーバーライド）
- Vitest setup へのMSWサーバー統合
- 3つのPage stories のMSW対応とバリアント追加

### 変更ファイル一覧

- `frontend/package.json` - msw, msw-storybook-addon 追加
- `frontend/public/mockServiceWorker.js` - 新規（自動生成）
- `frontend/.storybook/main.ts` - staticDirs 追加
- `frontend/.storybook/preview.tsx` - MSW initialize + mswLoader + handlers
- `frontend/src/test/setup.ts` - MSW server lifecycle 追加
- `frontend/src/test/mocks/data/users.ts` - 新規
- `frontend/src/test/mocks/data/exercises.ts` - 新規
- `frontend/src/test/mocks/data/workouts.ts` - 新規
- `frontend/src/test/mocks/data/index.ts` - 新規
- `frontend/src/test/mocks/handlers/auth.ts` - 新規
- `frontend/src/test/mocks/handlers/exercise.ts` - 新規
- `frontend/src/test/mocks/handlers/workout.ts` - 新規
- `frontend/src/test/mocks/handlers/index.ts` - 新規
- `frontend/src/test/mocks/server.ts` - 新規
- `frontend/src/features/workout/pages/WorkoutListPage/WorkoutListPage.stories.tsx` - MSW対応
- `frontend/src/features/workout/pages/WorkoutDetailPage/WorkoutDetailPage.stories.tsx` - MSW対応
- `frontend/src/features/workout/pages/WorkoutFormPage/WorkoutFormPage.stories.tsx` - MSW対応

### テスト結果

- 31テストファイル: 全パス
- 2テストファイル（既存失敗）: MSW導入前と同じ失敗パターン
  - `schemas.test.ts`: ブランチ上のschemas.ts変更による既存失敗
  - `useAuth.test.tsx`: ECONNREFUSED による既存失敗
- MSW導入による新規テスト失敗: **0件**

### 次のステップ

- Storybookブラウザ確認（Page stories のレンダリング検証）
- 将来: フックテスト → ページテストの順で `vi.mock()` から MSW に段階的移行
- 将来: `onUnhandledRequest` を `'warn'` に厳格化
