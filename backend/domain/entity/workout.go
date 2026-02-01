package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidDailyScore = errors.New("daily score must be between 0 and 100")
)

// Workout は特定の日のトレーニングセッションを表す
type Workout struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	Date       time.Time
	DailyScore int32
	Memo       *string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// NewWorkout はバリデーション付きで新しいWorkoutエンティティを作成する
func NewWorkout(userID uuid.UUID, date time.Time) *Workout {
	now := time.Now()
	return &Workout{
		ID:         uuid.New(),
		UserID:     userID,
		Date:       date,
		DailyScore: 0, // 初期スコアは0
		CreatedAt:  now,
		UpdatedAt:  now,
	}
}

// ReconstructWorkout は保存されたデータからWorkoutエンティティを再構築する
func ReconstructWorkout(id, userID uuid.UUID, date time.Time, dailyScore int32, memo *string, createdAt, updatedAt time.Time) *Workout {
	return &Workout{
		ID:         id,
		UserID:     userID,
		Date:       date,
		DailyScore: dailyScore,
		Memo:       memo,
		CreatedAt:  createdAt,
		UpdatedAt:  updatedAt,
	}
}

// UpdateDailyScore はワークアウトの日次スコアを更新する
func (w *Workout) UpdateDailyScore(score int32) error {
	if err := ValidateDailyScore(score); err != nil {
		return err
	}
	w.DailyScore = score
	w.UpdatedAt = time.Now()
	return nil
}

// CalculateDailyScore はワークアウトセットに基づいて日次スコアを計算する
// スコア計算:
// - ベース: セット数 * 5ポイント
// - ボーナス: 総ボリューム（セット数 * レップ数 * 重量）が閾値を超えた場合
// - 最大: 100ポイント
func (w *Workout) CalculateDailyScore(totalSets int, totalVolume float64) int32 {
	// ベーススコア: セットごとに5ポイント
	score := int32(totalSets * 5)

	// 高ボリュームに対するボーナス
	if totalVolume > 1000 {
		score += 10
	}
	if totalVolume > 5000 {
		score += 10
	}
	if totalVolume > 10000 {
		score += 10
	}

	// 100で上限
	if score > 100 {
		score = 100
	}

	return score
}

// UpdateMemo はワークアウトのメモを更新する
func (w *Workout) UpdateMemo(memo *string) {
	w.Memo = memo
	w.UpdatedAt = time.Now()
}

// ValidateDailyScore は日次スコアを検証する
func ValidateDailyScore(score int32) error {
	if score < 0 || score > 100 {
		return ErrInvalidDailyScore
	}
	return nil
}
