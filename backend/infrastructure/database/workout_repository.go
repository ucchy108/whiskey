package database

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/sqlc/db"
)

// workoutRepository はWorkoutRepositoryインターフェースのPostgreSQL実装。
// sqlcで生成されたクエリを使用してワークアウトのCRUD操作を行う。
type workoutRepository struct {
	queries *db.Queries
}

// NewWorkoutRepository はWorkoutRepositoryの実装を生成する。
//
// パラメータ:
//   - conn: PostgreSQLデータベース接続
//
// 戻り値:
//   - repository.WorkoutRepository: ワークアウトリポジトリの実装
func NewWorkoutRepository(conn *sql.DB) repository.WorkoutRepository {
	return &workoutRepository{
		queries: db.New(conn),
	}
}

// Create はワークアウトを作成する。
// DB生成のID、CreatedAt、UpdatedAtが元のエンティティに反映される。
func (r *workoutRepository) Create(ctx context.Context, workout *entity.Workout) error {
	params := db.CreateWorkoutParams{
		UserID:     workout.UserID,
		Date:       workout.Date,
		DailyScore: workout.DailyScore,
		Memo:       toNullString(workout.Memo),
	}

	created, err := r.queries.CreateWorkout(ctx, params)
	if err != nil {
		return err
	}

	workout.ID = created.ID
	workout.CreatedAt = created.CreatedAt
	workout.UpdatedAt = created.UpdatedAt

	return nil
}

// FindByID はIDでワークアウトを取得する。
// 該当するワークアウトが存在しない場合はnilを返す。
func (r *workoutRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Workout, error) {
	dbWorkout, err := r.queries.GetWorkout(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return toWorkoutEntity(dbWorkout), nil
}

// FindByUserID はユーザーIDで全ワークアウトを取得する。
// 結果は日付の降順でソートされる。
func (r *workoutRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.Workout, error) {
	dbWorkouts, err := r.queries.ListAllWorkoutsByUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	return toWorkoutEntities(dbWorkouts), nil
}

// FindByUserIDAndDateRange はユーザーIDと日付範囲でワークアウトを取得する。
// startDateとendDateの両端を含む（>=, <=）。結果は日付の降順でソートされる。
func (r *workoutRepository) FindByUserIDAndDateRange(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]*entity.Workout, error) {
	params := db.ListWorkoutsByUserAndDateRangeParams{
		UserID: userID,
		Date:   startDate,
		Date_2: endDate,
	}

	dbWorkouts, err := r.queries.ListWorkoutsByUserAndDateRange(ctx, params)
	if err != nil {
		return nil, err
	}

	return toWorkoutEntities(dbWorkouts), nil
}

// FindByUserIDAndDate はユーザーIDと日付でワークアウトを取得する。
// 該当するワークアウトが存在しない場合はnilを返す。
func (r *workoutRepository) FindByUserIDAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (*entity.Workout, error) {
	params := db.GetWorkoutByUserAndDateParams{
		UserID: userID,
		Date:   date,
	}

	dbWorkout, err := r.queries.GetWorkoutByUserAndDate(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return toWorkoutEntity(dbWorkout), nil
}

// Update はワークアウトを更新する。
// DailyScoreとMemoを更新し、UpdatedAtが元のエンティティに反映される。
// 該当するワークアウトが存在しない場合はnilを返す。
func (r *workoutRepository) Update(ctx context.Context, workout *entity.Workout) error {
	params := db.UpdateWorkoutParams{
		ID:         workout.ID,
		DailyScore: workout.DailyScore,
		Memo:       toNullString(workout.Memo),
	}

	updated, err := r.queries.UpdateWorkout(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}

	workout.UpdatedAt = updated.UpdatedAt

	return nil
}

// Delete はワークアウトを削除する
func (r *workoutRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.DeleteWorkout(ctx, id)
}

// ExistsByUserIDAndDate はユーザーIDと日付でワークアウトが存在するか確認する
func (r *workoutRepository) ExistsByUserIDAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (bool, error) {
	workout, err := r.FindByUserIDAndDate(ctx, userID, date)
	if err != nil {
		return false, err
	}
	return workout != nil, nil
}

// toNullString は*stringをsql.NullStringに変換する
func toNullString(s *string) sql.NullString {
	if s == nil {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: *s, Valid: true}
}

// fromNullString はsql.NullStringを*stringに変換する
func fromNullString(ns sql.NullString) *string {
	if !ns.Valid {
		return nil
	}
	return &ns.String
}

// toWorkoutEntity はDB層のWorkoutをDomain層のWorkoutに変換する
func toWorkoutEntity(w db.Workout) *entity.Workout {
	return entity.ReconstructWorkout(
		w.ID,
		w.UserID,
		w.Date,
		w.DailyScore,
		fromNullString(w.Memo),
		w.CreatedAt,
		w.UpdatedAt,
	)
}

// toWorkoutEntities はDB層のWorkoutスライスをDomain層のWorkoutスライスに変換する
func toWorkoutEntities(dbWorkouts []db.Workout) []*entity.Workout {
	workouts := make([]*entity.Workout, len(dbWorkouts))
	for i, w := range dbWorkouts {
		workouts[i] = toWorkoutEntity(w)
	}
	return workouts
}
