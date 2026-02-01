package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidDailyScore = errors.New("daily score must be between 0 and 100")
)

// Workout represents a workout session for a specific date
type Workout struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	Date       time.Time
	DailyScore int32
	Memo       *string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// NewWorkout creates a new Workout entity with validation
func NewWorkout(userID uuid.UUID, date time.Time) *Workout {
	now := time.Now()
	return &Workout{
		ID:         uuid.New(),
		UserID:     userID,
		Date:       date,
		DailyScore: 0, // Initial score is 0
		CreatedAt:  now,
		UpdatedAt:  now,
	}
}

// ReconstructWorkout reconstructs a Workout entity from stored data
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

// UpdateDailyScore updates the workout's daily score
func (w *Workout) UpdateDailyScore(score int32) error {
	if err := ValidateDailyScore(score); err != nil {
		return err
	}
	w.DailyScore = score
	w.UpdatedAt = time.Now()
	return nil
}

// CalculateDailyScore calculates daily score based on workout sets
// Score calculation:
// - Base: number of sets * 5 points
// - Bonus: if total volume (sets * reps * weight) > threshold
// - Maximum: 100 points
func (w *Workout) CalculateDailyScore(totalSets int, totalVolume float64) int32 {
	// Base score: 5 points per set
	score := int32(totalSets * 5)

	// Bonus for high volume
	if totalVolume > 1000 {
		score += 10
	}
	if totalVolume > 5000 {
		score += 10
	}
	if totalVolume > 10000 {
		score += 10
	}

	// Cap at 100
	if score > 100 {
		score = 100
	}

	return score
}

// UpdateMemo updates the workout's memo
func (w *Workout) UpdateMemo(memo *string) {
	w.Memo = memo
	w.UpdatedAt = time.Now()
}

// ValidateDailyScore validates daily score
func ValidateDailyScore(score int32) error {
	if score < 0 || score > 100 {
		return ErrInvalidDailyScore
	}
	return nil
}
