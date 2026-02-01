package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

// ExerciseRepository defines the interface for exercise data persistence
type ExerciseRepository interface {
	// Create creates a new exercise
	Create(ctx context.Context, exercise *entity.Exercise) error

	// FindByID retrieves an exercise by ID
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Exercise, error)

	// FindByName retrieves an exercise by name
	FindByName(ctx context.Context, name string) (*entity.Exercise, error)

	// FindAll retrieves all exercises
	FindAll(ctx context.Context) ([]*entity.Exercise, error)

	// FindByBodyPart retrieves exercises by body part
	FindByBodyPart(ctx context.Context, bodyPart entity.BodyPart) ([]*entity.Exercise, error)

	// Update updates an existing exercise
	Update(ctx context.Context, exercise *entity.Exercise) error

	// Delete deletes an exercise by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// ExistsByName checks if an exercise with the given name exists
	ExistsByName(ctx context.Context, name string) (bool, error)
}
