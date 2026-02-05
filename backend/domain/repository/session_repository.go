package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// SessionRepository はセッション管理のインターフェース。
// Infrastructure層で実装され、Usecase層で使用される。
type SessionRepository interface {
	// Create creates a new session for the given user ID.
	// Returns the session ID and an error if the operation fails.
	Create(ctx context.Context, userID uuid.UUID, ttl time.Duration) (string, error)

	// Get retrieves the user ID associated with the given session ID.
	// Returns uuid.Nil and an error if the session does not exist or has expired.
	Get(ctx context.Context, sessionID string) (uuid.UUID, error)

	// Delete deletes the session with the given session ID.
	// Returns an error if the operation fails.
	Delete(ctx context.Context, sessionID string) error

	// Extend extends the TTL of the session with the given session ID.
	// Returns an error if the operation fails.
	Extend(ctx context.Context, sessionID string, ttl time.Duration) error
}
