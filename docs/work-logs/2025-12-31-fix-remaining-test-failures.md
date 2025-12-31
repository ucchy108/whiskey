# 残り4つの失敗テスト修正

**作業日**: 2025-12-31
**担当**: Claude Code
**ステータス**: 完了

## 目的

テスト用DB分離後に残った4つの失敗テストを修正する。

## 作業内容

### 22:20 - 作業開始・エラー調査

- 残り4つの失敗テスト:
  1. `WorkoutService.test.ts` - `createWorkout` (フィールド名の不一致)
  2. `dashboard/stats/route.test.ts` - 3テスト (メソッド名の不一致)

### 22:22 - WorkoutService.test.ts修正

- **問題**: テストが古い`memo`フィールドを使用
- **原因**: データベーススキーマは`dialy`だが、テストが`memo`を期待
- **修正**: テストを`dialy`に統一

### 22:25 - dashboard/stats/route.test.ts修正

- **問題**: 500エラーが返される
- **原因**: ルートが`getDashboardStatsWithCharts()`を呼ぶが、テストは`getDashboardStats()`をモック
- **修正**:
  - モックに`getDashboardStatsWithCharts`を追加
  - mockStatsにチャートデータフィールドを追加

### 22:26 - workouts/[id]/route.test.ts修正

- **問題**: 並列実行無効化後に新たに3つのテストが失敗
- **原因1**: 「詳細情報を含む...」テストでモックの設定漏れ
- **修正1**: `mockedWorkoutService.getWorkoutById.mockResolvedValue(workout)`を追加
- **原因2**: 「他のユーザー...」テストでエラーをスローするモックがない
- **修正2**: `mockRejectedValue(new Error("Workout not found"))`を追加
- **原因3**: テストデータと期待値の不一致
- **修正3**: 期待値を"Strength training"に修正

### 22:28 - 全テスト完了

- **結果**: 116/116テスト（100%）がパス
- すべての失敗テストを修正完了

## 完了サマリー

### 修正した問題

1. **WorkoutService.test.ts** - `memo` → `dialy`フィールド名修正
2. **dashboard/stats/route.test.ts** - メソッド名とレスポンス構造修正
3. **workouts/[id]/route.test.ts** - モック設定追加とデータ修正

### 変更ファイル一覧

- [src/services/__tests__/WorkoutService.test.ts](../src/services/__tests__/WorkoutService.test.ts) - dialyフィールドに修正
- [src/app/api/dashboard/stats/route.test.ts](../src/app/api/dashboard/stats/route.test.ts) - getDashboardStatsWithChartsに修正
- [src/app/api/workouts/[id]/route.test.ts](../src/app/api/workouts/[id]/route.test.ts) - モック設定追加

### テスト結果

| 段階 | 成功 | 失敗 | 成功率 |
|---|---|---|---|
| 修正前 | 112/116 | 4 | 96.6% |
| **修正後** | **116/116** | **0** | **100%** |

### 次のステップ

- [x] 全テストパス達成
- [x] テスト用DB分離完了
- [x] テストの安定性向上
