package repository

import (
	"context"

	"github.com/google/uuid"
)

// AvatarRepository はアバター画像のストレージインターフェース
type AvatarRepository interface {
	// Upload はアバター画像をアップロードし、S3キーを返す
	// 既存のアバターがある場合は削除してから新しいファイルをアップロードする
	Upload(ctx context.Context, userID uuid.UUID, data []byte, contentType string) (string, error)

	// GetURL はアバターのURLを返す
	// アバターが存在しない場合は空文字列とnilを返す
	GetURL(ctx context.Context, userID uuid.UUID) (string, error)

	// Delete はアバターを削除する
	Delete(ctx context.Context, userID uuid.UUID) error
}
