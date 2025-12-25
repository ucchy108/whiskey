# DashboardPageのリファクタリング

**作業日**: 2025-12-26
**担当**: Claude Code
**ステータス**: 完了

## 目的

DashboardPageでワークアウト全件を取得してクライアントサイドで統計計算していた処理を、サーバーサイドで統計データを計算して返すように変更し、パフォーマンスとアーキテクチャを改善する。

## 作業内容

### 作業開始 - 要件確認と計画立案

- DashboardPageの現状確認
- `/api/dashboard/stats` APIが既に存在することを確認
- リファクタリング計画を策定

**リファクタリング方針**:
1. Repository層に統計データ取得メソッドを追加
2. Service層にチャート用統計計算ロジックを実装
3. API Routeでチャートデータもまとめて返すように拡張
4. フロントエンドは統計APIのみ呼び出すように変更

### statsRepositoryの拡張

**変更内容**:
- チャート用のデータ取得メソッド `findWorkoutsWithDetailsForStats` を追加
- 必要最小限のフィールドのみをselectして取得（過去30日分）
- 統計関連の型定義を全てRepository層に集約

**追加した型定義**:
```typescript
- DashboardStats
- WeeklyActivity
- MonthlyProgress
- ExerciseDistribution
- DashboardStatsWithCharts
- WorkoutWithDetailsForStats
```

### StatsServiceの拡張

**実装内容**:
- `getDashboardStatsWithCharts` メソッドを追加
- 週次アクティビティ計算ロジック (`calculateWeeklyActivities`)
- 月次進捗計算ロジック (`calculateMonthlyProgresses`)
- 運動種目分布計算ロジック (`calculateExerciseDistributions`)
- Repository層の型定義をimportして使用

**最適化**:
- データ取得を並列化（`Promise.all`）
- 必要な統計のみを計算

### API Routeの修正

**変更箇所**: [src/app/api/dashboard/stats/route.ts](../../src/app/api/dashboard/stats/route.ts)

**変更内容**:
- `getDashboardStats` から `getDashboardStatsWithCharts` に変更
- チャート用データも含めて返すように拡張

### フロントエンドの修正

#### useDashboardStatsフック

**変更箇所**: [src/app/(authorized)/dashboard/hooks/useDashboardStats.ts](../../src/app/(authorized)/dashboard/hooks/useDashboardStats.ts)

**変更内容**:
- Repository層の `DashboardStatsWithCharts` 型を使用
- チャートデータも含む統計データを返すように拡張

#### DashboardPage

**変更箇所**: [src/app/(authorized)/dashboard/page.tsx](../../src/app/(authorized)/dashboard/page.tsx)

**変更内容**:
- `useWorkouts` フックを削除
- `useDashboardStats` のみを使用
- WorkoutChartに統計データを渡すように変更

#### WorkoutChartコンポーネント

**変更箇所**: [src/app/(authorized)/dashboard/components/WorkoutChart/WorkoutChart.tsx](../../src/app/(authorized)/dashboard/components/WorkoutChart/WorkoutChart.tsx)

**変更内容**:
- propsを `workouts` から `stats` に変更
- `useWorkoutChart` フックを削除
- 統計データから直接値を取得するように変更

#### チャートコンポーネントの型修正

**変更ファイル**:
- [WeeklyActivityChart.tsx](../../src/app/(authorized)/dashboard/components/WeeklyActivityChart/WeeklyActivityChart.tsx)
- [MonthlyProgressChart.tsx](../../src/app/(authorized)/dashboard/components/MonthlyProgressChart/MonthlyProgressChart.tsx)
- [ExerciseRankingChart.tsx](../../src/app/(authorized)/dashboard/components/ExerciseRankingChart/ExerciseRankingChart.tsx)
- [createSummaryCards.tsx](../../src/app/(authorized)/dashboard/components/SummaryCards/createSummaryCards.tsx)

**変更内容**:
- Service層からの型importをRepository層からのimportに変更

#### Storybookの更新

**変更箇所**: [WorkoutChart.stories.tsx](../../src/app/(authorized)/dashboard/components/WorkoutChart/WorkoutChart.stories.tsx)

**変更内容**:
- ワークアウトデータから統計データ形式に変更
- サンプルデータを統計データ形式で定義

### 不要ファイルの削除

**削除ファイル**:
- `src/app/(authorized)/dashboard/hooks/useWorkouts.ts`
- `src/app/(authorized)/dashboard/hooks/useWorkoutChart.ts`

### 型定義のアーキテクチャ改善

**方針**: 型定義はRepository層に集約し、他の層はRepository層の型を参照する

**実装**:
1. Repository層 (`statsRepository.ts`) に全ての型定義を配置
2. Service層は Repository層の型をimport
3. フロントエンド層も Repository層の型を直接import

**メリット**:
- 型定義の一元管理
- 型の重複を防止
- 依存関係の明確化

## 完了サマリー

### 実装内容

✅ Repository層にチャート用データ取得メソッドを追加
✅ Service層に統計計算ロジックを実装
✅ API Routeを拡張してチャートデータも返すように変更
✅ フロントエンドを統計API使用のみに変更
✅ 型定義をRepository層に集約
✅ 不要なフックを削除

### 変更ファイル一覧

**Repository層**:
- [src/repositories/statsRepository.ts](../../src/repositories/statsRepository.ts) - 型定義追加、データ取得メソッド追加

**Service層**:
- [src/services/StatsService.ts](../../src/services/StatsService.ts) - チャート統計計算ロジック追加

**API層**:
- [src/app/api/dashboard/stats/route.ts](../../src/app/api/dashboard/stats/route.ts) - チャートデータを含むレスポンスに変更

**フロントエンド層**:
- [src/app/(authorized)/dashboard/page.tsx](../../src/app/(authorized)/dashboard/page.tsx) - useWorkouts削除、統計データ利用
- [src/app/(authorized)/dashboard/hooks/useDashboardStats.ts](../../src/app/(authorized)/dashboard/hooks/useDashboardStats.ts) - Repository型使用
- [src/app/(authorized)/dashboard/components/WorkoutChart/WorkoutChart.tsx](../../src/app/(authorized)/dashboard/components/WorkoutChart/WorkoutChart.tsx) - 統計データ受け取り
- [src/app/(authorized)/dashboard/components/WorkoutChart/WorkoutChart.stories.tsx](../../src/app/(authorized)/dashboard/components/WorkoutChart/WorkoutChart.stories.tsx) - 統計データ形式に更新
- [src/app/(authorized)/dashboard/components/WeeklyActivityChart/WeeklyActivityChart.tsx](../../src/app/(authorized)/dashboard/components/WeeklyActivityChart/WeeklyActivityChart.tsx) - Repository型使用
- [src/app/(authorized)/dashboard/components/MonthlyProgressChart/MonthlyProgressChart.tsx](../../src/app/(authorized)/dashboard/components/MonthlyProgressChart/MonthlyProgressChart.tsx) - Repository型使用
- [src/app/(authorized)/dashboard/components/ExerciseRankingChart/ExerciseRankingChart.tsx](../../src/app/(authorized)/dashboard/components/ExerciseRankingChart/ExerciseRankingChart.tsx) - Repository型使用
- [src/app/(authorized)/dashboard/components/SummaryCards/createSummaryCards.tsx](../../src/app/(authorized)/dashboard/components/SummaryCards/createSummaryCards.tsx) - Repository型使用

**削除ファイル**:
- `src/app/(authorized)/dashboard/hooks/useWorkouts.ts`
- `src/app/(authorized)/dashboard/hooks/useWorkoutChart.ts`

### アーキテクチャ改善

**Before**:
```
DashboardPage → useWorkouts → /api/workouts (全件取得)
              → useWorkoutChart (クライアントサイドで統計計算)
```

**After**:
```
DashboardPage → useDashboardStats → /api/dashboard/stats
                                   → StatsService (サーバーサイドで統計計算)
                                   → statsRepository (必要最小限のデータ取得)
```

**メリット**:
1. **パフォーマンス改善**: 全件取得から必要なデータのみ取得に変更
2. **レスポンスサイズ削減**: サーバーサイドで集計済みデータのみ返す
3. **責務の明確化**: 統計計算はサーバーサイド、表示はクライアントサイド
4. **型安全性向上**: Repository層に型定義を集約

### テスト結果

- TypeScript型チェック: ✅ ダッシュボード関連エラーなし
- 既存の型エラー（2件）: 今回のリファクタリング範囲外

### 次のステップ

- [ ] SummaryCardsのStorybook作成
- [ ] StatsServiceの単体テスト追加
- [ ] パフォーマンス計測とモニタリング

## 備考

- 型定義はRepository層に集約するアーキテクチャパターンを採用
- サーバーサイドレンダリングの最適化により、初期表示が高速化
- データ取得は過去30日分に限定し、必要最小限のフィールドのみselect
