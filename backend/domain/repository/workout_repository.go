package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

// WorkoutRepository defines the interface for workout data persistence
type WorkoutRepository interface {
	// Create creates a new workout
	Create(ctx context.Context, workout *entity.Workout) error

	// FindByID retrieves a workout by ID
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Workout, error)

	// FindByUserID retrieves all workouts for a user
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.Workout, error)

	// FindByUserIDAndDateRange retrieves workouts for a user within a date range
	FindByUserIDAndDateRange(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]*entity.Workout, error)

	// FindByUserIDAndDate retrieves a workout for a user on a specific date
	FindByUserIDAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (*entity.Workout, error)

	// Update updates an existing workout
	Update(ctx context.Context, workout *entity.Workout) error

	// Delete deletes a workout by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// ExistsByUserIDAndDate checks if a workout exists for a user on a specific date
	ExistsByUserIDAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (bool, error)
}
