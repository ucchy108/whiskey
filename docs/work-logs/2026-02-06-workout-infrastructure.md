# Phase 2.2: ワークアウトInfrastructure層の実装

**作業日**: 2026-02-06
**担当**: Claude Code
**ステータス**: 完了

## 目的

Domain層のリポジトリインターフェース（WorkoutRepository, ExerciseRepository, WorkoutSetRepository）のInfrastructure層実装を行い、DBとの接続を完成させる。

## 作業内容

### 作業開始 - 計画立案

- 既存のuser_repository.goパターンを参照
- sqlcクエリの補完
- 3つのリポジトリ実装（Workout, Exercise, WorkoutSet）
- テストヘルパー更新と統合テスト作成

### sqlcクエリ補完

- workouts.sql: `ListAllWorkoutsByUser`、`ListWorkoutsByUserAndDateRange`を追加
- workout_sets.sql: `ListWorkoutSetsByWorkoutAndExercise`、`ListWorkoutSetsByExerciseID`、`GetOverallMaxEstimated1RMByExerciseAndUser`を追加
- sqlc generateで再生成

### リポジトリ実装

- WorkoutRepository: CRUD + FindByUserIDAndDateRange, ExistsByUserIDAndDate
- ExerciseRepository: CRUD + FindByName, FindByBodyPart, ExistsByName
- WorkoutSetRepository: CRUD + FindByWorkoutIDAndExerciseID, FindByExerciseID, DeleteByWorkoutID, GetMaxEstimated1RMByExerciseAndUser

### 型変換の実装

- `*string` ↔ `sql.NullString`: toNullString/fromNullString
- `*entity.BodyPart` ↔ `sql.NullString`: bodyPartToNullString/nullStringToBodyPart
- `float64` ↔ `string(DECIMAL)`: formatFloat/parseFloat
- `*int32` ↔ `sql.NullInt32`: toNullInt32/fromNullInt32

### godocコメント追加

- 全公開関数にgodoc形式の日本語コメントを付与
- パラメータ・戻り値の説明、ソート順序、nilの返し方を明記

## 完了サマリー

### 実装内容

- WorkoutRepository（8メソッド）
- ExerciseRepository（8メソッド）
- WorkoutSetRepository（9メソッド）
- 型変換ヘルパー関数（8関数）
- sqlcクエリ5つ追加

### 変更ファイル一覧

- `backend/sqlc/queries/workouts.sql` - クエリ追加
- `backend/sqlc/queries/workout_sets.sql` - クエリ追加
- `backend/sqlc/db/workouts.sql.go` - 再生成
- `backend/sqlc/db/workout_sets.sql.go` - 再生成
- `backend/sqlc/db/querier.go` - 再生成
- `backend/infrastructure/database/workout_repository.go` - 新規作成
- `backend/infrastructure/database/exercise_repository.go` - 新規作成
- `backend/infrastructure/database/workout_set_repository.go` - 新規作成
- `backend/infrastructure/database/test_helper.go` - TRUNCATE対象テーブル追加
- `backend/infrastructure/database/workout_repository_test.go` - 新規作成
- `backend/infrastructure/database/exercise_repository_test.go` - 新規作成
- `backend/infrastructure/database/workout_set_repository_test.go` - 新規作成
- `docs/task-dashboard.md` - Phase 2.1/2.2を完了に更新

### テスト結果

- 全36テストパス（Exercise: 9, User: 6, Workout: 8, WorkoutSet: 13）
- ビルド成功

### 次のステップ

- Phase 2.3: ワークアウトUsecase層の実装
