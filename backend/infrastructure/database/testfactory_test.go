package database

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
)

// ---------- Repos: テスト用リポジトリ群 ----------

// Repos はテスト用リポジトリ群をまとめた構造体
type Repos struct {
	User       repository.UserRepository
	Exercise   repository.ExerciseRepository
	Workout    repository.WorkoutRepository
	WorkoutSet repository.WorkoutSetRepository
}

// SetupRepos はテスト用の全リポジトリを生成する
func SetupRepos(conn *sql.DB) *Repos {
	return &Repos{
		User:       NewUserRepository(conn),
		Exercise:   NewExerciseRepository(conn),
		Workout:    NewWorkoutRepository(conn),
		WorkoutSet: NewWorkoutSetRepository(conn),
	}
}

// ---------- User Factory ----------

// userSeq はユニークなメールアドレス生成用のシーケンス番号
var userSeq int

// UserOption はUserファクトリのオプション関数
type UserOption func(email *string, password *string)

// WithEmail はメールアドレスを指定する
func WithEmail(email string) UserOption {
	return func(e *string, _ *string) {
		*e = email
	}
}

// WithPassword はパスワードを指定する
func WithPassword(password string) UserOption {
	return func(_ *string, p *string) {
		*p = password
	}
}

// CreateUser はテスト用ユーザーを作成しDBに保存する。
// オプションを指定しない場合、ユニークなメールアドレスが自動生成される。
func CreateUser(t *testing.T, ctx context.Context, repo repository.UserRepository, opts ...UserOption) *entity.User {
	t.Helper()

	userSeq++
	email := fmt.Sprintf("test-%d@example.com", userSeq)
	password := "password123"

	for _, opt := range opts {
		opt(&email, &password)
	}

	user, err := entity.NewUser(email, password)
	if err != nil {
		t.Fatalf("CreateUser: failed to create entity: %v", err)
	}

	if err := repo.Create(ctx, user); err != nil {
		t.Fatalf("CreateUser: failed to save: %v", err)
	}

	return user
}

// ---------- Exercise Factory ----------

// exerciseSeq はユニークなエクササイズ名生成用のシーケンス番号
var exerciseSeq int

// ExerciseOption はExerciseファクトリのオプション関数
type ExerciseOption func(e *entity.Exercise)

// WithExerciseName はエクササイズ名を指定する
func WithExerciseName(name string) ExerciseOption {
	return func(e *entity.Exercise) {
		e.Name = name
	}
}

// WithDescription はエクササイズの説明を指定する
func WithDescription(desc string) ExerciseOption {
	return func(e *entity.Exercise) {
		e.Description = &desc
	}
}

// WithBodyPart は身体部位を指定する
func WithBodyPart(bp entity.BodyPart) ExerciseOption {
	return func(e *entity.Exercise) {
		e.BodyPart = &bp
	}
}

// CreateExercise はテスト用エクササイズを作成しDBに保存する。
// オプションを指定しない場合、ユニークな名前が自動生成される。
func CreateExercise(t *testing.T, ctx context.Context, repo repository.ExerciseRepository, opts ...ExerciseOption) *entity.Exercise {
	t.Helper()

	exerciseSeq++
	name := fmt.Sprintf("Exercise-%d", exerciseSeq)

	exercise, err := entity.NewExercise(name, nil, nil)
	if err != nil {
		t.Fatalf("CreateExercise: failed to create entity: %v", err)
	}

	for _, opt := range opts {
		opt(exercise)
	}

	if err := repo.Create(ctx, exercise); err != nil {
		t.Fatalf("CreateExercise: failed to save: %v", err)
	}

	return exercise
}

// ---------- Workout Factory ----------

// WorkoutOption はWorkoutファクトリのオプション関数
type WorkoutOption func(w *entity.Workout)

// WithDate はワークアウトの日付を指定する
func WithDate(date time.Time) WorkoutOption {
	return func(w *entity.Workout) {
		w.Date = date
	}
}

// WithDailyScore はワークアウトのスコアを指定する
func WithDailyScore(score int32) WorkoutOption {
	return func(w *entity.Workout) {
		w.DailyScore = score
	}
}

// WithMemo はワークアウトのメモを指定する
func WithMemo(memo string) WorkoutOption {
	return func(w *entity.Workout) {
		w.Memo = &memo
	}
}

// workoutDateSeq はデフォルト日付を順番にずらすためのシーケンス
var workoutDateSeq int

// CreateWorkout はテスト用ワークアウトを作成しDBに保存する。
// WithDateを指定しない場合、衝突しないユニークな日付が自動生成される。
func CreateWorkout(t *testing.T, ctx context.Context, repo repository.WorkoutRepository, userID uuid.UUID, opts ...WorkoutOption) *entity.Workout {
	t.Helper()

	workoutDateSeq++
	defaultDate := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC).AddDate(0, 0, workoutDateSeq)

	w := entity.NewWorkout(userID, defaultDate)

	for _, opt := range opts {
		opt(w)
	}

	if err := repo.Create(ctx, w); err != nil {
		t.Fatalf("CreateWorkout: failed to save: %v", err)
	}

	return w
}

// ---------- WorkoutSet Factory ----------

// WorkoutSetOption はWorkoutSetファクトリのオプション関数
type WorkoutSetOption func(ws *entity.WorkoutSet)

// WithSetNumber はセット番号を指定する
func WithSetNumber(n int32) WorkoutSetOption {
	return func(ws *entity.WorkoutSet) {
		ws.SetNumber = n
	}
}

// WithReps はレップ数を指定する
func WithReps(reps int32) WorkoutSetOption {
	return func(ws *entity.WorkoutSet) {
		ws.Reps = reps
	}
}

// WithWeight は重量を指定する
func WithWeight(weight float64) WorkoutSetOption {
	return func(ws *entity.WorkoutSet) {
		ws.Weight = weight
		ws.Estimated1RM = entity.CalculateEstimated1RM(weight, ws.Reps)
	}
}

// WithNotes はメモを指定する
func WithNotes(notes string) WorkoutSetOption {
	return func(ws *entity.WorkoutSet) {
		ws.Notes = &notes
	}
}

// workoutSetSeq はユニークなセット番号生成用のシーケンス
var workoutSetSeq int32

// CreateWorkoutSet はテスト用ワークアウトセットを作成しDBに保存する。
func CreateWorkoutSet(t *testing.T, ctx context.Context, repo repository.WorkoutSetRepository, workoutID, exerciseID uuid.UUID, opts ...WorkoutSetOption) *entity.WorkoutSet {
	t.Helper()

	workoutSetSeq++

	ws, err := entity.NewWorkoutSet(
		workoutID,
		exerciseID,
		workoutSetSeq,
		10,
		60.0,
	)
	if err != nil {
		t.Fatalf("CreateWorkoutSet: failed to create entity: %v", err)
	}

	for _, opt := range opts {
		opt(ws)
	}

	if err := repo.Create(ctx, ws); err != nil {
		t.Fatalf("CreateWorkoutSet: failed to save: %v", err)
	}

	return ws
}
