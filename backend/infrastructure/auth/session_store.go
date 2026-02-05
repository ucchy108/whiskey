// Package auth は認証とセッション管理の機能を提供する。
package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/ucchy108/whiskey/backend/domain/repository"
)

// SessionStore はRedisを使用してユーザーセッションを管理する。
// repository.SessionRepositoryインターフェースを実装する。
type SessionStore struct {
	client *redis.Client
}

// SessionStoreがrepository.SessionRepositoryを実装していることをコンパイル時にチェック
var _ repository.SessionRepository = (*SessionStore)(nil)

// NewSessionStore は指定されたRedisクライアントを使用して新しいSessionStoreインスタンスを生成する。
// クライアントは初期化済みでRedisサーバーに接続されている必要がある。
func NewSessionStore(client *redis.Client) *SessionStore {
	return &SessionStore{
		client: client,
	}
}

// Create は指定されたユーザーIDに対して指定されたTTLで新しいセッションを作成する。
// 一意なセッションIDを生成し、Redis内にマッピングを保存する。
// 生成されたセッションIDを返し、操作が失敗した場合はエラーを返す。
func (s *SessionStore) Create(ctx context.Context, userID uuid.UUID, ttl time.Duration) (string, error) {
	sessionID := uuid.New().String()
	key := fmt.Sprintf("session:%s", sessionID)

	err := s.client.Set(ctx, key, userID.String(), ttl).Err()
	if err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	return sessionID, nil
}

// Get は指定されたセッションIDに関連付けられたユーザーIDをRedisから取得する。
// セッションが有効で期限切れでない場合にユーザーIDを返す。
// セッションが存在しない、期限切れ、または保存されたデータが不正な場合はuuid.Nilとエラーを返す。
func (s *SessionStore) Get(ctx context.Context, sessionID string) (uuid.UUID, error) {
	key := fmt.Sprintf("session:%s", sessionID)

	userIDStr, err := s.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return uuid.Nil, fmt.Errorf("session not found")
	}
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to get session: %w", err)
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid user ID in session: %w", err)
	}

	return userID, nil
}

// Delete は指定されたセッションIDのセッションをRedisから削除する。
// この操作は冪等であり、存在しないセッションを削除してもエラーを返さない。
// Redis操作自体が失敗した場合のみエラーを返す。
func (s *SessionStore) Delete(ctx context.Context, sessionID string) error {
	key := fmt.Sprintf("session:%s", sessionID)

	err := s.client.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}

// Extend は指定されたセッションIDのセッションのTTL（有効期限）を延長する。
// まずセッションの存在を確認し、その後有効期限を更新する。
// セッションが存在しない場合、またはRedis操作が失敗した場合はエラーを返す。
func (s *SessionStore) Extend(ctx context.Context, sessionID string, ttl time.Duration) error {
	key := fmt.Sprintf("session:%s", sessionID)

	exists, err := s.client.Exists(ctx, key).Result()
	if err != nil {
		return fmt.Errorf("failed to check session existence: %w", err)
	}
	if exists == 0 {
		return fmt.Errorf("session not found")
	}

	err = s.client.Expire(ctx, key, ttl).Err()
	if err != nil {
		return fmt.Errorf("failed to extend session: %w", err)
	}

	return nil
}
