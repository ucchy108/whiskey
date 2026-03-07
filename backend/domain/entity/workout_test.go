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

	// 新ロジック: score = 100 × √(totalVolume / 20000)、上限100
	// totalVolume（総負荷量 = 重量 × レップ数の全セット合計）のみでスコアを決定
	tests := []struct {
		name          string
		totalVolume   float64
		expectedScore int32
	}{
		{
			name:          "ボリューム0: トレーニングなし",
			totalVolume:   0.0,
			expectedScore: 0,
		},
		{
			name:          "軽いウォームアップ: 100kg",
			totalVolume:   100.0,
			expectedScore: 7, // 100 * √(100/20000) ≈ 7.07
		},
		{
			name:          "軽いセッション: 500kg",
			totalVolume:   500.0,
			expectedScore: 16, // 100 * √(500/20000) ≈ 15.81
		},
		{
			name:          "軽めのトレーニング: 1000kg",
			totalVolume:   1000.0,
			expectedScore: 22, // 100 * √(1000/20000) ≈ 22.36
		},
		{
			name:          "中程度のトレーニング: 2000kg",
			totalVolume:   2000.0,
			expectedScore: 32, // 100 * √(2000/20000) ≈ 31.62
		},
		{
			name:          "標準的なトレーニング: 5000kg",
			totalVolume:   5000.0,
			expectedScore: 50, // 100 * √(5000/20000) = 50.0
		},
		{
			name:          "ハードなトレーニング: 10000kg",
			totalVolume:   10000.0,
			expectedScore: 71, // 100 * √(10000/20000) ≈ 70.71
		},
		{
			name:          "非常にハードなトレーニング: 15000kg",
			totalVolume:   15000.0,
			expectedScore: 87, // 100 * √(15000/20000) ≈ 86.60
		},
		{
			name:          "最大基準値: 20000kg",
			totalVolume:   20000.0,
			expectedScore: 100, // 100 * √(20000/20000) = 100
		},
		{
			name:          "基準値超過: 25000kg（上限100）",
			totalVolume:   25000.0,
			expectedScore: 100, // 上限100に制限
		},
		{
			name:          "負の値: -100kg（0として扱う）",
			totalVolume:   -100.0,
			expectedScore: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			score := workout.CalculateDailyScore(tt.totalVolume)

			if score != tt.expectedScore {
				t.Errorf("CalculateDailyScore(%v) = %v, want %v",
					tt.totalVolume, score, tt.expectedScore)
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
