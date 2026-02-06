package database

import (
	"context"
	"database/sql"
	"errors"
	"strconv"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/sqlc/db"
)

// workoutSetRepository はWorkoutSetRepositoryインターフェースのPostgreSQL実装。
// sqlcで生成されたクエリを使用してワークアウトセットのCRUD操作を行う。
// Weight/Estimated1RMはDB上でDECIMAL(6,2)型（string）、Entity上でfloat64として管理され、
// strconv.FormatFloat/ParseFloatで相互変換する。
type workoutSetRepository struct {
	queries *db.Queries
}

// NewWorkoutSetRepository はWorkoutSetRepositoryの実装を生成する。
//
// パラメータ:
//   - conn: PostgreSQLデータベース接続
//
// 戻り値:
//   - repository.WorkoutSetRepository: ワークアウトセットリポジトリの実装
func NewWorkoutSetRepository(conn *sql.DB) repository.WorkoutSetRepository {
	return &workoutSetRepository{
		queries: db.New(conn),
	}
}

// Create はワークアウトセットを作成する。
// Weight/Estimated1RMはfloat64からDECIMAL(6,2)用の文字列に変換される。
// DB生成のIDとCreatedAtが元のエンティティに反映される。
func (r *workoutSetRepository) Create(ctx context.Context, workoutSet *entity.WorkoutSet) error {
	params := db.CreateWorkoutSetParams{
		WorkoutID:       workoutSet.WorkoutID,
		ExerciseID:      workoutSet.ExerciseID,
		SetNumber:       workoutSet.SetNumber,
		Reps:            workoutSet.Reps,
		Weight:          formatFloat(workoutSet.Weight),
		Estimated1rm:    formatFloat(workoutSet.Estimated1RM),
		DurationSeconds: toNullInt32(workoutSet.DurationSeconds),
		Notes:           toNullString(workoutSet.Notes),
	}

	created, err := r.queries.CreateWorkoutSet(ctx, params)
	if err != nil {
		return err
	}

	workoutSet.ID = created.ID
	workoutSet.CreatedAt = created.CreatedAt

	return nil
}

// FindByID はIDでワークアウトセットを取得する。
// 該当するセットが存在しない場合はnilを返す。
// DB上の文字列型のWeight/Estimated1RMはfloat64に変換される。
func (r *workoutSetRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.WorkoutSet, error) {
	dbSet, err := r.queries.GetWorkoutSet(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return toWorkoutSetEntity(dbSet)
}

// FindByWorkoutID はワークアウトIDで全セットを取得する。
// 結果はエクササイズID、セット番号の順でソートされる。
func (r *workoutSetRepository) FindByWorkoutID(ctx context.Context, workoutID uuid.UUID) ([]*entity.WorkoutSet, error) {
	dbSets, err := r.queries.ListWorkoutSetsByWorkout(ctx, workoutID)
	if err != nil {
		return nil, err
	}

	return toWorkoutSetEntities(dbSets)
}

// FindByWorkoutIDAndExerciseID はワークアウトIDとエクササイズIDでセットを取得する。
// 結果はセット番号順でソートされる。
func (r *workoutSetRepository) FindByWorkoutIDAndExerciseID(ctx context.Context, workoutID, exerciseID uuid.UUID) ([]*entity.WorkoutSet, error) {
	params := db.ListWorkoutSetsByWorkoutAndExerciseParams{
		WorkoutID:  workoutID,
		ExerciseID: exerciseID,
	}

	dbSets, err := r.queries.ListWorkoutSetsByWorkoutAndExercise(ctx, params)
	if err != nil {
		return nil, err
	}

	return toWorkoutSetEntities(dbSets)
}

// FindByExerciseID はエクササイズIDで全セットを取得する（全ワークアウト横断）。
// 結果は作成日時の降順でソートされる。
func (r *workoutSetRepository) FindByExerciseID(ctx context.Context, exerciseID uuid.UUID) ([]*entity.WorkoutSet, error) {
	dbSets, err := r.queries.ListWorkoutSetsByExerciseID(ctx, exerciseID)
	if err != nil {
		return nil, err
	}

	return toWorkoutSetEntities(dbSets)
}

// Update はワークアウトセットを更新する。
// Reps、Weight、Estimated1RM、DurationSeconds、Notesを更新する。
// 該当するセットが存在しない場合はnilを返す。
func (r *workoutSetRepository) Update(ctx context.Context, workoutSet *entity.WorkoutSet) error {
	params := db.UpdateWorkoutSetParams{
		ID:              workoutSet.ID,
		Reps:            workoutSet.Reps,
		Weight:          formatFloat(workoutSet.Weight),
		Estimated1rm:    formatFloat(workoutSet.Estimated1RM),
		DurationSeconds: toNullInt32(workoutSet.DurationSeconds),
		Notes:           toNullString(workoutSet.Notes),
	}

	_, err := r.queries.UpdateWorkoutSet(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}

	return nil
}

// Delete はワークアウトセットを削除する
func (r *workoutSetRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.DeleteWorkoutSet(ctx, id)
}

// DeleteByWorkoutID はワークアウトIDで全セットを削除する
func (r *workoutSetRepository) DeleteByWorkoutID(ctx context.Context, workoutID uuid.UUID) error {
	return r.queries.DeleteWorkoutSetsByWorkout(ctx, workoutID)
}

// GetMaxEstimated1RMByExerciseAndUser はユーザーとエクササイズの全期間最大推定1RMを取得する。
// 重量成長の追跡に使用される。該当データが存在しない場合は0を返す。
func (r *workoutSetRepository) GetMaxEstimated1RMByExerciseAndUser(ctx context.Context, userID, exerciseID uuid.UUID) (float64, error) {
	params := db.GetOverallMaxEstimated1RMByExerciseAndUserParams{
		UserID:     userID,
		ExerciseID: exerciseID,
	}

	result, err := r.queries.GetOverallMaxEstimated1RMByExerciseAndUser(ctx, params)
	if err != nil {
		return 0, err
	}

	return parseFloat(result)
}

// formatFloat はfloat64をstring（小数点2桁）に変換する
func formatFloat(f float64) string {
	return strconv.FormatFloat(f, 'f', 2, 64)
}

// parseFloat はstringをfloat64に変換する
func parseFloat(s string) (float64, error) {
	return strconv.ParseFloat(s, 64)
}

// toNullInt32 は*int32をsql.NullInt32に変換する
func toNullInt32(i *int32) sql.NullInt32 {
	if i == nil {
		return sql.NullInt32{Valid: false}
	}
	return sql.NullInt32{Int32: *i, Valid: true}
}

// fromNullInt32 はsql.NullInt32を*int32に変換する
func fromNullInt32(ni sql.NullInt32) *int32 {
	if !ni.Valid {
		return nil
	}
	return &ni.Int32
}

// toWorkoutSetEntity はDB層のWorkoutSetをDomain層のWorkoutSetに変換する
func toWorkoutSetEntity(ws db.WorkoutSet) (*entity.WorkoutSet, error) {
	weight, err := parseFloat(ws.Weight)
	if err != nil {
		return nil, err
	}

	estimated1RM, err := parseFloat(ws.Estimated1rm)
	if err != nil {
		return nil, err
	}

	return entity.ReconstructWorkoutSet(
		ws.ID,
		ws.WorkoutID,
		ws.ExerciseID,
		ws.SetNumber,
		ws.Reps,
		weight,
		estimated1RM,
		fromNullInt32(ws.DurationSeconds),
		fromNullString(ws.Notes),
		ws.CreatedAt,
	), nil
}

// toWorkoutSetEntities はDB層のWorkoutSetスライスをDomain層のWorkoutSetスライスに変換する
func toWorkoutSetEntities(dbSets []db.WorkoutSet) ([]*entity.WorkoutSet, error) {
	sets := make([]*entity.WorkoutSet, len(dbSets))
	for i, ws := range dbSets {
		s, err := toWorkoutSetEntity(ws)
		if err != nil {
			return nil, err
		}
		sets[i] = s
	}
	return sets, nil
}
