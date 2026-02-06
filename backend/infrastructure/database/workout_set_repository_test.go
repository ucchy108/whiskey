package database

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

func TestWorkoutSetRepository_Create(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	// テストデータの作成
	user := createTestUser(t, ctx, userRepo)

	bodyPart := entity.BodyPartChest
	exercise, _ := entity.NewExercise("Bench Press", nil, &bodyPart)
	exerciseRepo.Create(ctx, exercise)

	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	// WorkoutSetを作成
	workoutSet, err := entity.NewWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
	if err != nil {
		t.Fatalf("Failed to create workout set entity: %v", err)
	}

	err = setRepo.Create(ctx, workoutSet)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if workoutSet.ID == uuid.Nil {
		t.Error("Create() did not generate ID")
	}

	if workoutSet.CreatedAt.IsZero() {
		t.Error("Create() did not set CreatedAt")
	}
}

func TestWorkoutSetRepository_FindByID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	workoutSet, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
	setRepo.Create(ctx, workoutSet)

	tests := []struct {
		name    string
		id      uuid.UUID
		wantNil bool
	}{
		{
			name:    "正常系: 存在するセット",
			id:      workoutSet.ID,
			wantNil: false,
		},
		{
			name:    "正常系: 存在しないセット",
			id:      uuid.New(),
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := setRepo.FindByID(ctx, tt.id)
			if err != nil {
				t.Fatalf("FindByID() error = %v", err)
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByID() got nil = %v, want nil = %v", found == nil, tt.wantNil)
				return
			}

			if !tt.wantNil {
				if found.ID != workoutSet.ID {
					t.Errorf("FindByID() ID = %v, want %v", found.ID, workoutSet.ID)
				}
				if found.Weight != 60.0 {
					t.Errorf("FindByID() Weight = %v, want 60.0", found.Weight)
				}
				if found.Reps != 10 {
					t.Errorf("FindByID() Reps = %v, want 10", found.Reps)
				}
			}
		})
	}
}

func TestWorkoutSetRepository_FindByWorkoutID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	set1, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
	set2, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 2, 8, 65.0)
	set3, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 3, 6, 70.0)

	setRepo.Create(ctx, set1)
	setRepo.Create(ctx, set2)
	setRepo.Create(ctx, set3)

	sets, err := setRepo.FindByWorkoutID(ctx, workout.ID)
	if err != nil {
		t.Fatalf("FindByWorkoutID() error = %v", err)
	}

	if len(sets) != 3 {
		t.Errorf("FindByWorkoutID() returned %d sets, want 3", len(sets))
	}
}

func TestWorkoutSetRepository_FindByWorkoutIDAndExerciseID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)

	exercise1, _ := entity.NewExercise("Bench Press", nil, nil)
	exercise2, _ := entity.NewExercise("Squat", nil, nil)
	exerciseRepo.Create(ctx, exercise1)
	exerciseRepo.Create(ctx, exercise2)

	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	// Bench Press: 2セット
	s1, _ := entity.NewWorkoutSet(workout.ID, exercise1.ID, 1, 10, 60.0)
	s2, _ := entity.NewWorkoutSet(workout.ID, exercise1.ID, 2, 8, 65.0)
	// Squat: 1セット
	s3, _ := entity.NewWorkoutSet(workout.ID, exercise2.ID, 1, 5, 100.0)

	setRepo.Create(ctx, s1)
	setRepo.Create(ctx, s2)
	setRepo.Create(ctx, s3)

	// Bench Pressのみ取得
	benchSets, err := setRepo.FindByWorkoutIDAndExerciseID(ctx, workout.ID, exercise1.ID)
	if err != nil {
		t.Fatalf("FindByWorkoutIDAndExerciseID() error = %v", err)
	}

	if len(benchSets) != 2 {
		t.Errorf("FindByWorkoutIDAndExerciseID() returned %d sets, want 2", len(benchSets))
	}

	// Squatのみ取得
	squatSets, err := setRepo.FindByWorkoutIDAndExerciseID(ctx, workout.ID, exercise2.ID)
	if err != nil {
		t.Fatalf("FindByWorkoutIDAndExerciseID() error = %v", err)
	}

	if len(squatSets) != 1 {
		t.Errorf("FindByWorkoutIDAndExerciseID() returned %d sets, want 1", len(squatSets))
	}
}

func TestWorkoutSetRepository_FindByExerciseID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)

	workout1 := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workout2 := entity.NewWorkout(user.ID, time.Date(2026, 1, 16, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout1)
	workoutRepo.Create(ctx, workout2)

	s1, _ := entity.NewWorkoutSet(workout1.ID, exercise.ID, 1, 10, 60.0)
	s2, _ := entity.NewWorkoutSet(workout2.ID, exercise.ID, 1, 8, 65.0)

	setRepo.Create(ctx, s1)
	setRepo.Create(ctx, s2)

	sets, err := setRepo.FindByExerciseID(ctx, exercise.ID)
	if err != nil {
		t.Fatalf("FindByExerciseID() error = %v", err)
	}

	if len(sets) != 2 {
		t.Errorf("FindByExerciseID() returned %d sets, want 2", len(sets))
	}
}

func TestWorkoutSetRepository_Update(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	workoutSet, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
	setRepo.Create(ctx, workoutSet)

	// レップ数と重量を更新
	workoutSet.UpdateRepsAndWeight(12, 70.0)
	notes := "Felt strong"
	workoutSet.UpdateNotes(&notes)

	err := setRepo.Update(ctx, workoutSet)
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	// DBから取得して確認
	found, _ := setRepo.FindByID(ctx, workoutSet.ID)
	if found.Reps != 12 {
		t.Errorf("Update() Reps = %v, want 12", found.Reps)
	}
	if found.Weight != 70.0 {
		t.Errorf("Update() Weight = %v, want 70.0", found.Weight)
	}
	if found.Notes == nil || *found.Notes != "Felt strong" {
		t.Errorf("Update() Notes = %v, want 'Felt strong'", found.Notes)
	}
	// 推定1RMも更新されていることを確認
	expected1RM := entity.CalculateEstimated1RM(70.0, 12)
	if found.Estimated1RM != expected1RM {
		t.Errorf("Update() Estimated1RM = %v, want %v", found.Estimated1RM, expected1RM)
	}
}

func TestWorkoutSetRepository_Delete(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	workoutSet, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
	setRepo.Create(ctx, workoutSet)

	err := setRepo.Delete(ctx, workoutSet.ID)
	if err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	found, _ := setRepo.FindByID(ctx, workoutSet.ID)
	if found != nil {
		t.Error("Delete() did not delete workout set")
	}
}

func TestWorkoutSetRepository_DeleteByWorkoutID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	s1, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
	s2, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 2, 8, 65.0)
	s3, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 3, 6, 70.0)

	setRepo.Create(ctx, s1)
	setRepo.Create(ctx, s2)
	setRepo.Create(ctx, s3)

	err := setRepo.DeleteByWorkoutID(ctx, workout.ID)
	if err != nil {
		t.Fatalf("DeleteByWorkoutID() error = %v", err)
	}

	sets, _ := setRepo.FindByWorkoutID(ctx, workout.ID)
	if len(sets) != 0 {
		t.Errorf("DeleteByWorkoutID() did not delete all sets, got %d", len(sets))
	}
}

func TestWorkoutSetRepository_GetMaxEstimated1RMByExerciseAndUser(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)

	workout1 := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workout2 := entity.NewWorkout(user.ID, time.Date(2026, 1, 16, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout1)
	workoutRepo.Create(ctx, workout2)

	// Day 1: 60kg x 10reps -> 1RM = 60 * (1 + 10/30) = 80.0
	s1, _ := entity.NewWorkoutSet(workout1.ID, exercise.ID, 1, 10, 60.0)
	// Day 2: 80kg x 5reps -> 1RM = 80 * (1 + 5/30) ≈ 93.33
	s2, _ := entity.NewWorkoutSet(workout2.ID, exercise.ID, 1, 5, 80.0)

	setRepo.Create(ctx, s1)
	setRepo.Create(ctx, s2)

	max1RM, err := setRepo.GetMaxEstimated1RMByExerciseAndUser(ctx, user.ID, exercise.ID)
	if err != nil {
		t.Fatalf("GetMaxEstimated1RMByExerciseAndUser() error = %v", err)
	}

	// s2の推定1RM（約93.33）が最大値であるはず
	// DECIMAL(6,2)なのでDB格納時に小数点2桁に丸められる
	if max1RM < 93.0 || max1RM > 94.0 {
		t.Errorf("GetMaxEstimated1RMByExerciseAndUser() = %v, want approximately 93.33", max1RM)
	}
}

func TestWorkoutSetRepository_GetMaxEstimated1RMByExerciseAndUser_NoData(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	// データがない場合は0を返す
	max1RM, err := setRepo.GetMaxEstimated1RMByExerciseAndUser(ctx, uuid.New(), uuid.New())
	if err != nil {
		t.Fatalf("GetMaxEstimated1RMByExerciseAndUser() error = %v", err)
	}

	if max1RM != 0 {
		t.Errorf("GetMaxEstimated1RMByExerciseAndUser() = %v, want 0", max1RM)
	}
}

func TestWorkoutSetRepository_WeightConversion(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	userRepo := NewUserRepository(conn).(*userRepository)
	exerciseRepo := NewExerciseRepository(conn)
	workoutRepo := NewWorkoutRepository(conn)
	setRepo := NewWorkoutSetRepository(conn)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	exercise, _ := entity.NewExercise("Bench Press", nil, nil)
	exerciseRepo.Create(ctx, exercise)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	// 小数点付きの重量をテスト
	workoutSet, _ := entity.NewWorkoutSet(workout.ID, exercise.ID, 1, 8, 62.5)
	setRepo.Create(ctx, workoutSet)

	found, err := setRepo.FindByID(ctx, workoutSet.ID)
	if err != nil {
		t.Fatalf("FindByID() error = %v", err)
	}

	if found.Weight != 62.5 {
		t.Errorf("Weight conversion failed: got %v, want 62.5", found.Weight)
	}

	// 推定1RMも正しく変換されているか
	// DECIMAL(6,2)なのでDB格納時に小数点2桁に丸められる
	expected1RM := entity.CalculateEstimated1RM(62.5, 8)
	diff := found.Estimated1RM - expected1RM
	if diff < -0.01 || diff > 0.01 {
		t.Errorf("Estimated1RM conversion failed: got %v, want approximately %v", found.Estimated1RM, expected1RM)
	}
}
