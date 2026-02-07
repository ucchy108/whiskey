package service

import (
	"context"
	"testing"

	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/infrastructure/database"
)

func TestExerciseService_CheckNameUniqueness(t *testing.T) {
	db := database.SetupTestDB(t)
	defer database.CleanupTestDB(t, db)

	repo := database.NewExerciseRepository(db)
	exerciseService := NewExerciseService(repo)
	ctx := context.Background()

	// テスト用エクササイズを作成して保存
	existing, _ := entity.NewExercise("ベンチプレス", nil, nil)
	repo.Create(ctx, existing)

	tests := []struct {
		name        string
		exerciseName string
		wantErr     bool
		expectedErr error
	}{
		{
			name:         "正常系: 未使用のエクササイズ名",
			exerciseName: "スクワット",
			wantErr:      false,
		},
		{
			name:         "異常系: 既に使用されているエクササイズ名",
			exerciseName: "ベンチプレス",
			wantErr:      true,
			expectedErr:  ErrExerciseNameAlreadyExists,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := exerciseService.CheckNameUniqueness(ctx, tt.exerciseName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("CheckNameUniqueness() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("CheckNameUniqueness() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("CheckNameUniqueness() unexpected error = %v", err)
			}
		})
	}
}
