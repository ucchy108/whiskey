package entity

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewWorkout(t *testing.T) {
	userID := uuid.New()
	date := time.Now()

	workout := NewWorkout(userID, date)

	if workout == nil {
		t.Fatal("NewWorkout() returned nil")
	}

	if workout.UserID != userID {
		t.Errorf("UserID = %v, want %v", workout.UserID, userID)
	}

	if workout.Date != date {
		t.Errorf("Date = %v, want %v", workout.Date, date)
	}

	if workout.DailyScore != 0 {
		t.Errorf("DailyScore = %v, want 0", workout.DailyScore)
	}

	if workout.ID == uuid.Nil {
		t.Error("ID should not be nil UUID")
	}
}

func TestWorkout_CalculateDailyScore(t *testing.T) {
	userID := uuid.New()
	date := time.Now()
	workout := NewWorkout(userID, date)

	tests := []struct {
		name          string
		totalSets     int
		totalVolume   float64
		expectedScore int32
	}{
		{
			name:          "低強度: 1セット、100kg",
			totalSets:     1,
			totalVolume:   100.0,
			expectedScore: 5, // 1 * 5 = 5
		},
		{
			name:          "中強度: 10セット、800kg",
			totalSets:     10,
			totalVolume:   800.0,
			expectedScore: 50, // 10 * 5 = 50
		},
		{
			name:          "高強度: 10セット、1500kg（ボーナス+10）",
			totalSets:     10,
			totalVolume:   1500.0,
			expectedScore: 60, // 10 * 5 + 10(>1000) = 60
		},
		{
			name:          "高強度: 15セット、6000kg（ボーナス+20）",
			totalSets:     15,
			totalVolume:   6000.0,
			expectedScore: 95, // 15 * 5 + 10(>1000) + 10(>5000) = 95
		},
		{
			name:          "最大値テスト: 20セット、15000kg",
			totalSets:     20,
			totalVolume:   15000.0,
			expectedScore: 100, // 上限100に制限される
		},
		{
			name:          "ゼロセット",
			totalSets:     0,
			totalVolume:   0.0,
			expectedScore: 0,
		},
		{
			name:          "境界値: 1000kg（ボーナスなし）",
			totalSets:     10,
			totalVolume:   1000.0,
			expectedScore: 50, // ボーナスは >1000 なので付かない
		},
		{
			name:          "境界値: 1001kg（ボーナス+10）",
			totalSets:     10,
			totalVolume:   1001.0,
			expectedScore: 60, // 10 * 5 + 10 = 60
		},
		{
			name:          "境界値: 5001kg（ボーナス+20）",
			totalSets:     10,
			totalVolume:   5001.0,
			expectedScore: 70, // 10 * 5 + 10(>1000) + 10(>5000) = 70
		},
		{
			name:          "境界値: 10001kg（ボーナス+30）",
			totalSets:     10,
			totalVolume:   10001.0,
			expectedScore: 80, // 10 * 5 + 10(>1000) + 10(>5000) + 10(>10000) = 80
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			score := workout.CalculateDailyScore(tt.totalSets, tt.totalVolume)

			if score != tt.expectedScore {
				t.Errorf("CalculateDailyScore(%v, %v) = %v, want %v",
					tt.totalSets, tt.totalVolume, score, tt.expectedScore)
			}
		})
	}
}

func TestWorkout_UpdateDailyScore(t *testing.T) {
	userID := uuid.New()
	date := time.Now()
	workout := NewWorkout(userID, date)
	originalUpdatedAt := workout.UpdatedAt
	time.Sleep(1 * time.Millisecond)

	tests := []struct {
		name        string
		score       int32
		wantErr     bool
		expectedErr error
	}{
		{
			name:    "正常系: 有効なスコア（50）",
			score:   50,
			wantErr: false,
		},
		{
			name:    "正常系: 最小値（0）",
			score:   0,
			wantErr: false,
		},
		{
			name:    "正常系: 最大値（100）",
			score:   100,
			wantErr: false,
		},
		{
			name:        "異常系: 負のスコア",
			score:       -1,
			wantErr:     true,
			expectedErr: ErrInvalidDailyScore,
		},
		{
			name:        "異常系: 101以上",
			score:       101,
			wantErr:     true,
			expectedErr: ErrInvalidDailyScore,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := workout.UpdateDailyScore(tt.score)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateDailyScore() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateDailyScore() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateDailyScore() unexpected error = %v", err)
				return
			}

			if workout.DailyScore != tt.score {
				t.Errorf("DailyScore = %v, want %v", workout.DailyScore, tt.score)
			}

			if !workout.UpdatedAt.After(originalUpdatedAt) {
				t.Error("UpdatedAt should be updated after UpdateDailyScore")
			}
		})
	}
}

func TestWorkout_UpdateMemo(t *testing.T) {
	userID := uuid.New()
	date := time.Now()
	workout := NewWorkout(userID, date)
	originalUpdatedAt := workout.UpdatedAt
	time.Sleep(1 * time.Millisecond)

	memo := "Today's workout was great!"
	workout.UpdateMemo(&memo)

	if workout.Memo == nil {
		t.Error("Memo should not be nil after update")
		return
	}

	if *workout.Memo != memo {
		t.Errorf("Memo = %v, want %v", *workout.Memo, memo)
	}

	if !workout.UpdatedAt.After(originalUpdatedAt) {
		t.Error("UpdatedAt should be updated after UpdateMemo")
	}

	// NOTE: nilに更新するテスト
	workout.UpdateMemo(nil)
	if workout.Memo != nil {
		t.Error("Memo should be nil after setting to nil")
	}
}

func TestReconstructWorkout(t *testing.T) {
	id := uuid.New()
	userID := uuid.New()
	date := time.Now()
	dailyScore := int32(75)
	memo := "Test memo"
	createdAt := time.Now().Add(-24 * time.Hour)
	updatedAt := time.Now()

	workout := ReconstructWorkout(id, userID, date, dailyScore, &memo, createdAt, updatedAt)

	if workout == nil {
		t.Fatal("ReconstructWorkout() returned nil")
	}

	if workout.ID != id {
		t.Errorf("ID = %v, want %v", workout.ID, id)
	}

	if workout.UserID != userID {
		t.Errorf("UserID = %v, want %v", workout.UserID, userID)
	}

	if workout.Date != date {
		t.Errorf("Date = %v, want %v", workout.Date, date)
	}

	if workout.DailyScore != dailyScore {
		t.Errorf("DailyScore = %v, want %v", workout.DailyScore, dailyScore)
	}

	if workout.Memo == nil || *workout.Memo != memo {
		t.Errorf("Memo = %v, want %v", workout.Memo, memo)
	}

	if workout.CreatedAt != createdAt {
		t.Errorf("CreatedAt = %v, want %v", workout.CreatedAt, createdAt)
	}

	if workout.UpdatedAt != updatedAt {
		t.Errorf("UpdatedAt = %v, want %v", workout.UpdatedAt, updatedAt)
	}
}
