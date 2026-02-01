package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

// UserRepository defines the interface for user data persistence
type UserRepository interface {
	// Create creates a new user
	Create(ctx context.Context, user *entity.User) error

	// FindByID retrieves a user by ID
	FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error)

	// FindByEmail retrieves a user by email
	FindByEmail(ctx context.Context, email string) (*entity.User, error)

	// FindAll retrieves all users
	FindAll(ctx context.Context) ([]*entity.User, error)

	// Update updates an existing user
	Update(ctx context.Context, user *entity.User) error

	// Delete deletes a user by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// ExistsByEmail checks if a user with the given email exists
	ExistsByEmail(ctx context.Context, email string) (bool, error)
}
