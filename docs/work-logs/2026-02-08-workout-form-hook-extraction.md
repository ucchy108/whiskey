# WorkoutFormPage computeSummary カスタムフック抽出

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

WorkoutFormPage に `computeSummary` 関数とポーリングロジックが同居しており、1コンポーネント1関数の原則に反している。カスタムフックに切り出してPage層を軽量化する。

## 完了サマリー

### 実装内容

- `useWorkoutSummary` カスタムフック作成（`computeSummary` + ポーリング `useEffect` を抽出）
- `WorkoutSummaryItem` 型を export し再利用可能に
- `WorkoutFormPage` から `computeSummary` 関数と関連 state/useEffect を削除、`useWorkoutSummary` に置換
- WorkoutFormPage: 226行 → 181行

### 変更ファイル一覧

- `frontend/src/features/workout/hooks/useWorkoutSummary/useWorkoutSummary.ts` — 新規
- `frontend/src/features/workout/hooks/useWorkoutSummary/index.ts` — 新規
- `frontend/src/features/workout/hooks/useWorkoutSummary/useWorkoutSummary.test.ts` — 新規
- `frontend/src/features/workout/pages/WorkoutFormPage/WorkoutFormPage.tsx` — リファクタリング

### テスト結果

- useWorkoutSummary テスト: 3テスト全パス
- WorkoutFormPage テスト: 3テスト全パス
