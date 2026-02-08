# ワークアウトページ コンポーネント分割リファクタリング

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

WorkoutDetailPage (424行), WorkoutFormPage (294行), WorkoutListPage (275行) が肥大化しており、Page層にUIの詳細が混在している。`frontend/CLAUDE.md` の「Pageは接着層、Componentは Pure UI」原則に反しているため、各Pageを縮小し、再利用可能なコンポーネントに分割する。

## 完了サマリー

### 実装内容

#### Phase A: テーマトークン追加
- `theme.ts` に `background.subtle` (#F9FAFB), `border.light` (#F0F0F0), `error.dark` (#DC2626) を追加
- TypeScript型拡張（`TypeBackground`, `border.light`）

#### Phase B: リーフコンポーネント作成（5個）
- `SummaryRow` — ラベル+値の1行表示（重複コード解消）
- `PageHeader` — タイトル+サブタイトル+アクションボタン（3ページ共通）
- `Pagination` — ページネーション（ListPageから抽出）
- `EditableMemo` — メモ表示/編集切替UI（DetailPageから抽出）
- `WorkoutFilterBar` — 検索+エクササイズフィルター（ListPageから抽出）

#### Phase C: 複合コンポーネント（1個）
- `WorkoutSummaryPanel` — サマリーカード（タイトル+区切り線+children）

#### Phase D: ページリファクタリング
- `WorkoutListPage`: 275行 → 153行（PageHeader + WorkoutFilterBar + Pagination使用）
- `WorkoutFormPage`: 294行 → 226行（PageHeader + WorkoutSummaryPanel + SummaryRow使用）
- `WorkoutDetailPage`: 424行 → 299行（PageHeader + EditableMemo + WorkoutSummaryPanel + SummaryRow使用）

#### Phase E: ハードコード色修正
- `WorkoutSetsTable`: `#F9FAFB` → `background.subtle`
- `ExerciseBlock`: `#F9FAFB` → `background.subtle`
- `WorkoutCard`: `#F9FAFB` → `background.subtle`, `#888888` → `textMuted.main`, `#CCCCCC` → `border.main`

#### Phase F: エクスポート更新
- `shared/components/index.ts` に PageHeader, Pagination を追加
- `features/workout/index.ts` に新コンポーネント群を追加

### 変更ファイル一覧

#### 新規作成（24ファイル）
- `frontend/src/shared/components/PageHeader/` (PageHeader.tsx, index.ts, stories.tsx, test.tsx)
- `frontend/src/shared/components/Pagination/` (Pagination.tsx, index.ts, stories.tsx, test.tsx)
- `frontend/src/features/workout/components/SummaryRow/` (SummaryRow.tsx, index.ts, stories.tsx, test.tsx)
- `frontend/src/features/workout/components/EditableMemo/` (EditableMemo.tsx, index.ts, stories.tsx, test.tsx)
- `frontend/src/features/workout/components/WorkoutFilterBar/` (WorkoutFilterBar.tsx, index.ts, stories.tsx, test.tsx)
- `frontend/src/features/workout/components/WorkoutSummaryPanel/` (WorkoutSummaryPanel.tsx, index.ts, stories.tsx, test.tsx)

#### 変更（9ファイル）
- `frontend/src/shared/theme/theme.ts` — テーマトークン追加
- `frontend/src/shared/components/index.ts` — PageHeader, Pagination エクスポート追加
- `frontend/src/features/workout/index.ts` — 新コンポーネントエクスポート追加
- `frontend/src/features/workout/pages/WorkoutDetailPage/WorkoutDetailPage.tsx` — リファクタリング
- `frontend/src/features/workout/pages/WorkoutFormPage/WorkoutFormPage.tsx` — リファクタリング
- `frontend/src/features/workout/pages/WorkoutListPage/WorkoutListPage.tsx` — リファクタリング
- `frontend/src/features/workout/components/WorkoutSetsTable/WorkoutSetsTable.tsx` — ハードコード色修正
- `frontend/src/features/workout/components/ExerciseBlock/ExerciseBlock.tsx` — ハードコード色修正
- `frontend/src/features/workout/components/WorkoutCard/WorkoutCard.tsx` — ハードコード色修正

### テスト結果

- 全68テスト（15ファイル）パス
- 既存ページテスト（13テスト）全て通過
- 新コンポーネントテスト（19テスト）全て通過
- TypeScriptエラーなし（既存のschemas.tsエラーのみ）
