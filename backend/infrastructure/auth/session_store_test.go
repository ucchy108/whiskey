package auth

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestRedis creates a test Redis client using miniredis or connects to a test Redis instance.
func setupTestRedis(t *testing.T) *redis.Client {
	t.Helper()

	// Connect to Redis running in Docker
	client := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
		DB:   15, // Use DB 15 for testing to avoid conflicts
	})

	// Ping to verify connection
	ctx := context.Background()
	err := client.Ping(ctx).Err()
	require.NoError(t, err, "Failed to connect to Redis")

	// Clean up DB 15 before each test
	err = client.FlushDB(ctx).Err()
	require.NoError(t, err, "Failed to flush Redis DB")

	return client
}

func TestSessionStore_Create(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	userID := uuid.New()
	ttl := 1 * time.Hour

	sessionID, err := store.Create(ctx, userID, ttl)

	assert.NoError(t, err)
	assert.NotEmpty(t, sessionID)

	// Verify the session exists in Redis
	retrievedUserID, err := store.Get(ctx, sessionID)
	assert.NoError(t, err)
	assert.Equal(t, userID, retrievedUserID)
}

func TestSessionStore_Get(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	tests := []struct {
		name        string
		setupFunc   func() string
		wantErr     bool
		wantUserID  uuid.UUID
		errContains string
	}{
		{
			name: "valid session",
			setupFunc: func() string {
				userID := uuid.New()
				sessionID, _ := store.Create(ctx, userID, 1*time.Hour)
				return sessionID
			},
			wantErr: false,
		},
		{
			name: "non-existent session",
			setupFunc: func() string {
				return uuid.New().String()
			},
			wantErr:     true,
			errContains: "session not found",
		},
		{
			name: "expired session",
			setupFunc: func() string {
				userID := uuid.New()
				sessionID, _ := store.Create(ctx, userID, 1*time.Millisecond)
				time.Sleep(10 * time.Millisecond) // Wait for expiration
				return sessionID
			},
			wantErr:     true,
			errContains: "session not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			sessionID := tt.setupFunc()

			retrievedUserID, err := store.Get(ctx, sessionID)

			if tt.wantErr {
				assert.Error(t, err)
				if tt.errContains != "" {
					assert.Contains(t, err.Error(), tt.errContains)
				}
				assert.Equal(t, uuid.Nil, retrievedUserID)
			} else {
				assert.NoError(t, err)
				assert.NotEqual(t, uuid.Nil, retrievedUserID)
			}
		})
	}
}

func TestSessionStore_Delete(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	// Create a session
	userID := uuid.New()
	sessionID, err := store.Create(ctx, userID, 1*time.Hour)
	require.NoError(t, err)

	// Verify it exists
	_, err = store.Get(ctx, sessionID)
	assert.NoError(t, err)

	// Delete the session
	err = store.Delete(ctx, sessionID)
	assert.NoError(t, err)

	// Verify it no longer exists
	_, err = store.Get(ctx, sessionID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "session not found")
}

func TestSessionStore_Delete_NonExistent(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	// Delete a non-existent session (should not error)
	sessionID := uuid.New().String()
	err := store.Delete(ctx, sessionID)
	assert.NoError(t, err)
}

func TestSessionStore_Extend(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	// Create a session with short TTL
	userID := uuid.New()
	sessionID, err := store.Create(ctx, userID, 100*time.Millisecond)
	require.NoError(t, err)

	// Extend the session
	err = store.Extend(ctx, sessionID, 1*time.Hour)
	assert.NoError(t, err)

	// Wait past the original TTL
	time.Sleep(200 * time.Millisecond)

	// Session should still exist
	retrievedUserID, err := store.Get(ctx, sessionID)
	assert.NoError(t, err)
	assert.Equal(t, userID, retrievedUserID)
}

func TestSessionStore_Extend_NonExistent(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	// Try to extend a non-existent session
	sessionID := uuid.New().String()
	err := store.Extend(ctx, sessionID, 1*time.Hour)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "session not found")
}
