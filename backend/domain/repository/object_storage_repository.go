package repository

import (
	"context"
	"time"
)

// ObjectStorageRepository はオブジェクトストレージの汎用インターフェース。
// ファイルのアップロード・取得は全てPresigned URL経由で行い、
// バックエンドがファイルデータを直接扱わない設計を強制する。
type ObjectStorageRepository interface {
	// PresignedPutURL はアップロード用のPresigned URLを生成する
	PresignedPutURL(ctx context.Context, key string, contentType string, expiry time.Duration) (string, error)

	// PresignedGetURL はダウンロード用のPresigned URLを生成する
	PresignedGetURL(ctx context.Context, key string, expiry time.Duration) (string, error)

	// Delete はキーに対応するオブジェクトを削除する
	// オブジェクトが存在しない場合でもエラーを返さない
	Delete(ctx context.Context, key string) error

	// ListByPrefix はプレフィックスに一致するキーの一覧を返す
	ListByPrefix(ctx context.Context, prefix string) ([]string, error)
}
