// Package storage はオブジェクトストレージ（S3）を使用したファイル管理機能を提供する。
package storage

import (
	"bytes"
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/pkg/logger"
)

// S3ObjectStorage はS3を使用した汎用オブジェクトストレージ実装。
// repository.ObjectStorageRepositoryインターフェースを実装する。
type S3ObjectStorage struct {
	client *s3.Client
	bucket string
}

// S3ObjectStorageがrepository.ObjectStorageRepositoryを実装していることをコンパイル時にチェック
var _ repository.ObjectStorageRepository = (*S3ObjectStorage)(nil)

// NewS3ObjectStorage は指定されたS3クライアントとバケット名で新しいS3ObjectStorageを生成する。
func NewS3ObjectStorage(client *s3.Client, bucket string) *S3ObjectStorage {
	return &S3ObjectStorage{
		client: client,
		bucket: bucket,
	}
}

// Upload はデータをS3にアップロードする。
func (s *S3ObjectStorage) Upload(ctx context.Context, key string, data []byte, contentType string) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return fmt.Errorf("failed to upload object: %w", err)
	}

	logger.Info("object uploaded", "bucket", s.bucket, "key", key)
	return nil
}

// GetURL はキーに対応するオブジェクトのURLを返す。
// オブジェクトが存在しない場合は空文字列とnilを返す。
func (s *S3ObjectStorage) GetURL(ctx context.Context, key string) (string, error) {
	_, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		// オブジェクトが存在しない場合
		return "", nil
	}

	return key, nil
}

// Delete はキーに対応するオブジェクトをS3から削除する。
// オブジェクトが存在しない場合でもエラーを返さない。
func (s *S3ObjectStorage) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}

	logger.Info("object deleted", "bucket", s.bucket, "key", key)
	return nil
}

// ListByPrefix はプレフィックスに一致するキーの一覧を返す。
func (s *S3ObjectStorage) ListByPrefix(ctx context.Context, prefix string) ([]string, error) {
	output, err := s.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(prefix),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list objects: %w", err)
	}

	keys := make([]string, len(output.Contents))
	for i, obj := range output.Contents {
		keys[i] = aws.ToString(obj.Key)
	}

	return keys, nil
}
