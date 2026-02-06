package database

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

func createTestUser(t *testing.T, ctx context.Context, repo *userRepository) *entity.User {
	t.Helper()
	user, err := entity.NewUser("workout-test@example.com", "password123")
	if err != nil {
		t.Fatalf("Failed to create user entity: %v", err)
	}
	if err := repo.Create(ctx, user); err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}
	return user
}

func TestWorkoutRepository_Create(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)

	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))

	err := workoutRepo.Create(ctx, workout)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if workout.ID == uuid.Nil {
		t.Error("Create() did not generate ID")
	}

	if workout.CreatedAt.IsZero() {
		t.Error("Create() did not set CreatedAt")
	}

	if workout.UpdatedAt.IsZero() {
		t.Error("Create() did not set UpdatedAt")
	}
}

func TestWorkoutRepository_Create_DuplicateDate(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	date := time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC)

	workout1 := entity.NewWorkout(user.ID, date)
	if err := workoutRepo.Create(ctx, workout1); err != nil {
		t.Fatalf("Create() first workout error = %v", err)
	}

	workout2 := entity.NewWorkout(user.ID, date)
	err := workoutRepo.Create(ctx, workout2)
	if err == nil {
		t.Error("Create() expected unique constraint error for duplicate user+date, got nil")
	}
}

func TestWorkoutRepository_FindByID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	tests := []struct {
		name    string
		id      uuid.UUID
		wantNil bool
	}{
		{
			name:    "正常系: 存在するワークアウト",
			id:      workout.ID,
			wantNil: false,
		},
		{
			name:    "正常系: 存在しないワークアウト",
			id:      uuid.New(),
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := workoutRepo.FindByID(ctx, tt.id)
			if err != nil {
				t.Fatalf("FindByID() error = %v", err)
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByID() got nil = %v, want nil = %v", found == nil, tt.wantNil)
				return
			}

			if !tt.wantNil {
				if found.ID != workout.ID {
					t.Errorf("FindByID() ID = %v, want %v", found.ID, workout.ID)
				}
				if found.UserID != workout.UserID {
					t.Errorf("FindByID() UserID = %v, want %v", found.UserID, workout.UserID)
				}
			}
		})
	}
}

func TestWorkoutRepository_FindByUserID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)

	w1 := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	w2 := entity.NewWorkout(user.ID, time.Date(2026, 1, 16, 0, 0, 0, 0, time.UTC))
	w3 := entity.NewWorkout(user.ID, time.Date(2026, 1, 17, 0, 0, 0, 0, time.UTC))

	workoutRepo.Create(ctx, w1)
	workoutRepo.Create(ctx, w2)
	workoutRepo.Create(ctx, w3)

	workouts, err := workoutRepo.FindByUserID(ctx, user.ID)
	if err != nil {
		t.Fatalf("FindByUserID() error = %v", err)
	}

	if len(workouts) != 3 {
		t.Errorf("FindByUserID() returned %d workouts, want 3", len(workouts))
	}

	// 日付降順でソートされていることを確認
	for i := 0; i < len(workouts)-1; i++ {
		if workouts[i].Date.Before(workouts[i+1].Date) {
			t.Error("FindByUserID() workouts are not sorted by date DESC")
		}
	}
}

func TestWorkoutRepository_FindByUserIDAndDateRange(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)

	w1 := entity.NewWorkout(user.ID, time.Date(2026, 1, 10, 0, 0, 0, 0, time.UTC))
	w2 := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	w3 := entity.NewWorkout(user.ID, time.Date(2026, 1, 20, 0, 0, 0, 0, time.UTC))
	w4 := entity.NewWorkout(user.ID, time.Date(2026, 1, 25, 0, 0, 0, 0, time.UTC))

	workoutRepo.Create(ctx, w1)
	workoutRepo.Create(ctx, w2)
	workoutRepo.Create(ctx, w3)
	workoutRepo.Create(ctx, w4)

	startDate := time.Date(2026, 1, 12, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2026, 1, 22, 0, 0, 0, 0, time.UTC)

	workouts, err := workoutRepo.FindByUserIDAndDateRange(ctx, user.ID, startDate, endDate)
	if err != nil {
		t.Fatalf("FindByUserIDAndDateRange() error = %v", err)
	}

	if len(workouts) != 2 {
		t.Errorf("FindByUserIDAndDateRange() returned %d workouts, want 2", len(workouts))
	}
}

func TestWorkoutRepository_FindByUserIDAndDate(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	date := time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC)

	workout := entity.NewWorkout(user.ID, date)
	workoutRepo.Create(ctx, workout)

	tests := []struct {
		name    string
		date    time.Time
		wantNil bool
	}{
		{
			name:    "正常系: 存在する日付",
			date:    date,
			wantNil: false,
		},
		{
			name:    "正常系: 存在しない日付",
			date:    time.Date(2026, 1, 16, 0, 0, 0, 0, time.UTC),
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := workoutRepo.FindByUserIDAndDate(ctx, user.ID, tt.date)
			if err != nil {
				t.Fatalf("FindByUserIDAndDate() error = %v", err)
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByUserIDAndDate() got nil = %v, want nil = %v", found == nil, tt.wantNil)
			}
		})
	}
}

func TestWorkoutRepository_Update(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	originalUpdatedAt := workout.UpdatedAt

	// スコアとメモを更新
	workout.UpdateDailyScore(80)
	memo := "Great workout!"
	workout.UpdateMemo(&memo)

	err := workoutRepo.Update(ctx, workout)
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	if !workout.UpdatedAt.After(originalUpdatedAt) {
		t.Error("Update() did not update UpdatedAt")
	}

	// DBから取得して確認
	found, _ := workoutRepo.FindByID(ctx, workout.ID)
	if found.DailyScore != 80 {
		t.Errorf("Update() DailyScore = %v, want 80", found.DailyScore)
	}
	if found.Memo == nil || *found.Memo != "Great workout!" {
		t.Errorf("Update() Memo = %v, want 'Great workout!'", found.Memo)
	}
}

func TestWorkoutRepository_Delete(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	workout := entity.NewWorkout(user.ID, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	workoutRepo.Create(ctx, workout)

	err := workoutRepo.Delete(ctx, workout.ID)
	if err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	found, _ := workoutRepo.FindByID(ctx, workout.ID)
	if found != nil {
		t.Error("Delete() did not delete workout")
	}
}

func TestWorkoutRepository_ExistsByUserIDAndDate(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	workoutRepo := NewWorkoutRepository(conn)
	userRepo := NewUserRepository(conn).(*userRepository)
	ctx := context.Background()

	user := createTestUser(t, ctx, userRepo)
	date := time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC)

	workout := entity.NewWorkout(user.ID, date)
	workoutRepo.Create(ctx, workout)

	tests := []struct {
		name string
		date time.Time
		want bool
	}{
		{
			name: "正常系: 存在する日付",
			date: date,
			want: true,
		},
		{
			name: "正常系: 存在しない日付",
			date: time.Date(2026, 1, 16, 0, 0, 0, 0, time.UTC),
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exists, err := workoutRepo.ExistsByUserIDAndDate(ctx, user.ID, tt.date)
			if err != nil {
				t.Fatalf("ExistsByUserIDAndDate() error = %v", err)
			}

			if exists != tt.want {
				t.Errorf("ExistsByUserIDAndDate() = %v, want %v", exists, tt.want)
			}
		})
	}
}
