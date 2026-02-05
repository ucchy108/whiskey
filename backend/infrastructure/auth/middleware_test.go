package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuthMiddleware_ValidSession(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	// Create a session
	userID := uuid.New()
	sessionID, err := store.Create(ctx, userID, 1*time.Hour)
	require.NoError(t, err)

	// Create a test handler that verifies the user ID is in context
	handlerCalled := false
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		retrievedUserID := GetUserIDFromContext(r.Context())
		assert.Equal(t, userID, retrievedUserID)
		w.WriteHeader(http.StatusOK)
	})

	// Wrap with auth middleware
	middleware := AuthMiddleware(store)
	handler := middleware(testHandler)

	// Create request with session cookie
	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{
		Name:  SessionCookieName,
		Value: sessionID,
	})

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assert.True(t, handlerCalled)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestAuthMiddleware_NoSessionCookie(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)

	// Create a test handler
	handlerCalled := false
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	})

	// Wrap with auth middleware
	middleware := AuthMiddleware(store)
	handler := middleware(testHandler)

	// Create request without session cookie
	req := httptest.NewRequest(http.MethodGet, "/protected", nil)

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assert.False(t, handlerCalled)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	assert.Contains(t, rec.Body.String(), "no session cookie")
}

func TestAuthMiddleware_InvalidSession(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)

	// Create a test handler
	handlerCalled := false
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	})

	// Wrap with auth middleware
	middleware := AuthMiddleware(store)
	handler := middleware(testHandler)

	// Create request with invalid session ID
	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{
		Name:  SessionCookieName,
		Value: uuid.New().String(), // Non-existent session
	})

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assert.False(t, handlerCalled)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	assert.Contains(t, rec.Body.String(), "invalid session")
}

func TestAuthMiddleware_ExpiredSession(t *testing.T) {
	client := setupTestRedis(t)
	defer client.Close()

	store := NewSessionStore(client)
	ctx := context.Background()

	// Create a session with very short TTL
	userID := uuid.New()
	sessionID, err := store.Create(ctx, userID, 1*time.Millisecond)
	require.NoError(t, err)

	// Wait for expiration
	time.Sleep(10 * time.Millisecond)

	// Create a test handler
	handlerCalled := false
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	})

	// Wrap with auth middleware
	middleware := AuthMiddleware(store)
	handler := middleware(testHandler)

	// Create request with expired session
	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{
		Name:  SessionCookieName,
		Value: sessionID,
	})

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assert.False(t, handlerCalled)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	assert.Contains(t, rec.Body.String(), "invalid session")
}

func TestGetUserIDFromContext_Valid(t *testing.T) {
	userID := uuid.New()
	ctx := context.WithValue(context.Background(), UserIDContextKey, userID)

	retrievedUserID := GetUserIDFromContext(ctx)

	assert.Equal(t, userID, retrievedUserID)
}

func TestGetUserIDFromContext_NotFound(t *testing.T) {
	ctx := context.Background()

	retrievedUserID := GetUserIDFromContext(ctx)

	assert.Equal(t, uuid.Nil, retrievedUserID)
}

func TestGetUserIDFromContext_WrongType(t *testing.T) {
	ctx := context.WithValue(context.Background(), UserIDContextKey, "not-a-uuid")

	retrievedUserID := GetUserIDFromContext(ctx)

	assert.Equal(t, uuid.Nil, retrievedUserID)
}
