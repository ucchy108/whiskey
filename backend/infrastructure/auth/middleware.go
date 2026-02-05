package auth

import (
	"context"
	"net/http"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/repository"
)

// contextKey は他のパッケージとの衝突を避けるためのコンテキストキー専用のカスタム型。
type contextKey string

const (
	// UserIDContextKey は認証済みユーザーのIDを格納するためのコンテキストキー。
	UserIDContextKey contextKey = "userID"

	// SessionCookieName はセッションIDを格納するHTTPクッキーの名前。
	SessionCookieName = "session_id"
)

// AuthMiddleware はセッションベース認証を検証するHTTPミドルウェアを返す。
// 有効なセッションクッキーの存在を確認し、提供されたSessionRepositoryを使用してセッションを検証し、
// 認証済みユーザーIDをリクエストコンテキストに追加する。
// 認証が失敗した場合はHTTP 401 Unauthorizedを返す。
func AuthMiddleware(sessionRepo repository.SessionRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get session cookie
			cookie, err := r.Cookie(SessionCookieName)
			if err != nil {
				http.Error(w, "Unauthorized: no session cookie", http.StatusUnauthorized)
				return
			}

			// Validate session
			userID, err := sessionRepo.Get(r.Context(), cookie.Value)
			if err != nil {
				http.Error(w, "Unauthorized: invalid session", http.StatusUnauthorized)
				return
			}

			// Add user ID to context
			ctx := context.WithValue(r.Context(), UserIDContextKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserIDFromContext はリクエストコンテキストから認証済みユーザーのIDを取得する。
// AuthMiddlewareで保護されたハンドラー内で使用する必要がある。
// コンテキストにユーザーIDが見つからない場合（AuthMiddlewareが適用されていない場合など）はuuid.Nilを返す。
func GetUserIDFromContext(ctx context.Context) uuid.UUID {
	userID, ok := ctx.Value(UserIDContextKey).(uuid.UUID)
	if !ok {
		return uuid.Nil
	}
	return userID
}
