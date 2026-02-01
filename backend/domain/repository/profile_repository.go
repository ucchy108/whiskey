package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

// ProfileRepository defines the interface for profile data persistence
type ProfileRepository interface {
	// Create creates a new profile
	Create(ctx context.Context, profile *entity.Profile) error

	// FindByID retrieves a profile by ID
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Profile, error)

	// FindByUserID retrieves a profile by user ID
	FindByUserID(ctx context.Context, userID uuid.UUID) (*entity.Profile, error)

	// Update updates an existing profile
	Update(ctx context.Context, profile *entity.Profile) error

	// Delete deletes a profile by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// ExistsByUserID checks if a profile for the given user ID exists
	ExistsByUserID(ctx context.Context, userID uuid.UUID) (bool, error)
}
