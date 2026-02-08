# WorkoutFormPage exerciseApi カスタムフック抽出

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

WorkoutFormPage の `exerciseApi.list()` 呼び出しを `useExercises` カスタムフックに抽出し、Page から exercise feature の API 直接呼び出しを除去する。

## 完了サマリー

### 実装内容

- `features/exercise/hooks/useExercises` を新規作成
  - `exerciseApi.list()` を呼び出して `Exercise[]` を返すシンプルなフック
  - テスト: 1テスト（エクササイズ一覧取得）
- WorkoutFormPage を `useExercises` 使用に書き換え
  - `useState` + `useEffect` + `exerciseApi` の直接参照を除去
  - `import { useExercises } from '@/features/exercise/hooks/useExercises'` に置換
- `features/exercise/index.ts` に `useExercises` エクスポートを追加

### 変更ファイル一覧

#### 新規作成（3ファイル）
- `frontend/src/features/exercise/hooks/useExercises/useExercises.ts`
- `frontend/src/features/exercise/hooks/useExercises/useExercises.test.ts`
- `frontend/src/features/exercise/hooks/useExercises/index.ts`

#### 変更（2ファイル）
- `frontend/src/features/workout/pages/WorkoutFormPage/WorkoutFormPage.tsx`
- `frontend/src/features/exercise/index.ts`

### テスト結果

- useExercises テスト: 1テスト通過
- WorkoutFormPage テスト: 3テスト通過
- TypeScriptエラーなし
