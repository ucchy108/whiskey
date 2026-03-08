// Package storage はオブジェクトストレージ（S3）を使用したファイル管理機能を提供する。
package storage

import (
	"bytes"
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/pkg/logger"
)

// S3AvatarRepository はS3を使用してアバター画像を管理する。
// repository.AvatarRepositoryインターフェースを実装する。
type S3AvatarRepository struct {
	client *s3.Client
	bucket string
}

// S3AvatarRepositoryがrepository.AvatarRepositoryを実装していることをコンパイル時にチェック
var _ repository.AvatarRepository = (*S3AvatarRepository)(nil)

// NewS3AvatarRepository は指定されたS3クライアントとバケット名で新しいS3AvatarRepositoryを生成する。
func NewS3AvatarRepository(client *s3.Client, bucket string) *S3AvatarRepository {
	return &S3AvatarRepository{
		client: client,
		bucket: bucket,
	}
}

// avatarPrefix はユーザーのアバターのS3プレフィックスを返す。
func avatarPrefix(userID uuid.UUID) string {
	return fmt.Sprintf("whiskey/users/%s/avatar/", userID.String())
}

// Upload はアバター画像をS3にアップロードし、S3キーを返す。
// 既存のアバターがある場合は削除してから新しいファイルをアップロードする。
func (r *S3AvatarRepository) Upload(ctx context.Context, userID uuid.UUID, data []byte, contentType string) (string, error) {
	// 既存のアバターを削除
	if err := r.Delete(ctx, userID); err != nil {
		return "", fmt.Errorf("failed to delete existing avatar: %w", err)
	}

	// 新しいキーを生成
	key := avatarPrefix(userID) + uuid.New().String() + ".jpg"

	// S3にアップロード
	_, err := r.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(r.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload avatar: %w", err)
	}

	logger.Info("avatar uploaded", "userID", userID.String(), "key", key)
	return key, nil
}

// GetURL はアバターのURLを返す。
// アバターが存在しない場合は空文字列とnilを返す。
func (r *S3AvatarRepository) GetURL(ctx context.Context, userID uuid.UUID) (string, error) {
	prefix := avatarPrefix(userID)

	output, err := r.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket:  aws.String(r.bucket),
		Prefix:  aws.String(prefix),
		MaxKeys: aws.Int32(1),
	})
	if err != nil {
		return "", fmt.Errorf("failed to list avatar objects: %w", err)
	}

	if len(output.Contents) == 0 {
		return "", nil
	}

	// S3のキーからURLを構築
	key := aws.ToString(output.Contents[0].Key)
	return key, nil
}

// Delete はユーザーのアバターをS3から削除する。
// アバターが存在しない場合でもエラーを返さない。
func (r *S3AvatarRepository) Delete(ctx context.Context, userID uuid.UUID) error {
	prefix := avatarPrefix(userID)

	// プレフィックスでオブジェクトを検索
	output, err := r.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(r.bucket),
		Prefix: aws.String(prefix),
	})
	if err != nil {
		return fmt.Errorf("failed to list avatar objects: %w", err)
	}

	// 見つかったオブジェクトを全て削除
	for _, obj := range output.Contents {
		_, err := r.client.DeleteObject(ctx, &s3.DeleteObjectInput{
			Bucket: aws.String(r.bucket),
			Key:    obj.Key,
		})
		if err != nil {
			return fmt.Errorf("failed to delete avatar object: %w", err)
		}
		logger.Info("avatar deleted", "userID", userID.String(), "key", aws.ToString(obj.Key))
	}

	return nil
}
