package service

import (
	"context"
	"testing"
	"time"

	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/infrastructure/database"
)

func TestWorkoutService_CheckDateUniqueness(t *testing.T) {
	db := database.SetupTestDB(t)
	defer database.CleanupTestDB(t, db)

	userRepo := database.NewUserRepository(db)
	workoutRepo := database.NewWorkoutRepository(db)
	workoutService := NewWorkoutService(workoutRepo)
	ctx := context.Background()

	// テスト用ユーザーを作成して保存（FK制約のため）
	user, _ := entity.NewUser("workout-test@example.com", "password123")
	userRepo.Create(ctx, user)

	// テスト用ワークアウトを作成して保存
	existingDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)
	existing := entity.NewWorkout(user.ID, existingDate)
	workoutRepo.Create(ctx, existing)

	tests := []struct {
		name        string
		date        time.Time
		wantErr     bool
		expectedErr error
	}{
		{
			name:    "正常系: 未使用の日付",
			date:    time.Date(2026, 2, 8, 0, 0, 0, 0, time.UTC),
			wantErr: false,
		},
		{
			name:        "異常系: 既にワークアウトが存在する日付",
			date:        existingDate,
			wantErr:     true,
			expectedErr: ErrDuplicateWorkoutDate,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := workoutService.CheckDateUniqueness(ctx, user.ID, tt.date)

			if tt.wantErr {
				if err == nil {
					t.Errorf("CheckDateUniqueness() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("CheckDateUniqueness() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("CheckDateUniqueness() unexpected error = %v", err)
			}
		})
	}
}
