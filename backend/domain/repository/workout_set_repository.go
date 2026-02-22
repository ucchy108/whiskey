package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

// WeightProgressionPoint は日別の最大推定1RMを表す。
// 重量推移グラフのデータポイントとして使用される。
type WeightProgressionPoint struct {
	Date   time.Time
	Max1RM float64
}

// WorkoutSetRepository defines the interface for workout set data persistence
type WorkoutSetRepository interface {
	// Create creates a new workout set
	Create(ctx context.Context, workoutSet *entity.WorkoutSet) error

	// FindByID retrieves a workout set by ID
	FindByID(ctx context.Context, id uuid.UUID) (*entity.WorkoutSet, error)

	// FindByWorkoutID retrieves all sets for a workout
	FindByWorkoutID(ctx context.Context, workoutID uuid.UUID) ([]*entity.WorkoutSet, error)

	// FindByWorkoutIDAndExerciseID retrieves all sets for a specific exercise in a workout
	FindByWorkoutIDAndExerciseID(ctx context.Context, workoutID, exerciseID uuid.UUID) ([]*entity.WorkoutSet, error)

	// FindByExerciseID retrieves all sets for a specific exercise (across all workouts)
	FindByExerciseID(ctx context.Context, exerciseID uuid.UUID) ([]*entity.WorkoutSet, error)

	// Update updates an existing workout set
	Update(ctx context.Context, workoutSet *entity.WorkoutSet) error

	// Delete deletes a workout set by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// DeleteByWorkoutID deletes all sets for a workout
	DeleteByWorkoutID(ctx context.Context, workoutID uuid.UUID) error

	// GetMaxEstimated1RMByExerciseAndUser retrieves the maximum estimated 1RM for an exercise by a user
	// This is useful for tracking weight progression
	GetMaxEstimated1RMByExerciseAndUser(ctx context.Context, userID, exerciseID uuid.UUID) (float64, error)

	// GetWeightProgression retrieves daily max estimated 1RM progression for an exercise
	// Returns data points sorted by date ascending
	GetWeightProgression(ctx context.Context, userID, exerciseID uuid.UUID) ([]WeightProgressionPoint, error)
}
