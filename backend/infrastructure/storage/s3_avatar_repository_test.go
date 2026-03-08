package storage_test

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/ucchy108/whiskey/backend/infrastructure/storage"
	"github.com/ucchy108/whiskey/backend/pkg/logger"
)

func TestMain(m *testing.M) {
	logger.Init(logger.Config{
		Level:  slog.LevelDebug,
		Format: "text",
	})
	os.Exit(m.Run())
}

func setupTestS3Client(t *testing.T) *s3.Client {
	t.Helper()

	endpoint := os.Getenv("S3_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://localstack:4566"
	}
	region := os.Getenv("S3_REGION")
	if region == "" {
		region = "ap-northeast-1"
	}

	client := s3.NewFromConfig(aws.Config{
		Region: region,
		Credentials: credentials.NewStaticCredentialsProvider(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		),
	}, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	return client
}

func getBucket() string {
	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		bucket = "whiskey-avatars"
	}
	return bucket
}

func TestS3AvatarRepository_Upload(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	repo := storage.NewS3AvatarRepository(s3Client, bucket)

	userID := uuid.New()
	data := []byte("fake-image-data")
	contentType := "image/jpeg"

	// アップロード実行
	key, err := repo.Upload(ctx, userID, data, contentType)
	require.NoError(t, err)

	// キーのフォーマット確認: whiskey/users/{user_id}/avatar/{uuid}.jpg
	assert.True(t, strings.HasPrefix(key, "whiskey/users/"+userID.String()+"/avatar/"))
	assert.True(t, strings.HasSuffix(key, ".jpg"))

	// S3にオブジェクトが存在することを確認
	_, err = s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	require.NoError(t, err)

	// クリーンアップ
	err = repo.Delete(ctx, userID)
	require.NoError(t, err)
}

func TestS3AvatarRepository_Upload_ReplacesExisting(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	repo := storage.NewS3AvatarRepository(s3Client, bucket)

	userID := uuid.New()

	// 1回目のアップロード
	key1, err := repo.Upload(ctx, userID, []byte("first-image"), "image/jpeg")
	require.NoError(t, err)

	// 2回目のアップロード（古いファイルが削除されるはず）
	key2, err := repo.Upload(ctx, userID, []byte("second-image"), "image/jpeg")
	require.NoError(t, err)

	// キーが異なることを確認
	assert.NotEqual(t, key1, key2)

	// 古いオブジェクトが削除されていることを確認
	_, err = s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key1),
	})
	assert.Error(t, err)

	// 新しいオブジェクトが存在することを確認
	_, err = s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key2),
	})
	require.NoError(t, err)

	// クリーンアップ
	err = repo.Delete(ctx, userID)
	require.NoError(t, err)
}

func TestS3AvatarRepository_GetURL(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	repo := storage.NewS3AvatarRepository(s3Client, bucket)

	userID := uuid.New()

	// アバターが存在しない場合は空文字列を返す
	url, err := repo.GetURL(ctx, userID)
	require.NoError(t, err)
	assert.Empty(t, url)

	// アップロード後はURLが返される
	_, err = repo.Upload(ctx, userID, []byte("image-data"), "image/jpeg")
	require.NoError(t, err)

	url, err = repo.GetURL(ctx, userID)
	require.NoError(t, err)
	assert.NotEmpty(t, url)
	assert.Contains(t, url, userID.String())

	// クリーンアップ
	err = repo.Delete(ctx, userID)
	require.NoError(t, err)
}

func TestS3AvatarRepository_Delete(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	repo := storage.NewS3AvatarRepository(s3Client, bucket)

	userID := uuid.New()

	// アバターが存在しない場合でもエラーにならない
	err := repo.Delete(ctx, userID)
	require.NoError(t, err)

	// アップロードしてから削除
	key, err := repo.Upload(ctx, userID, []byte("image-data"), "image/jpeg")
	require.NoError(t, err)

	err = repo.Delete(ctx, userID)
	require.NoError(t, err)

	// 削除されたことを確認
	_, err = s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	assert.Error(t, err)

	// GetURLも空文字列を返す
	url, err := repo.GetURL(ctx, userID)
	require.NoError(t, err)
	assert.Empty(t, url)
}
