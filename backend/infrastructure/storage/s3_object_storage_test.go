package storage_test

import (
	"context"
	"log/slog"
	"os"
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

func TestS3ObjectStorage_Upload(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	store := storage.NewS3ObjectStorage(s3Client, bucket)

	key := "whiskey/users/" + uuid.New().String() + "/avatar/" + uuid.New().String() + ".jpg"
	data := []byte("fake-image-data")

	err := store.Upload(ctx, key, data, "image/jpeg")
	require.NoError(t, err)

	// S3にオブジェクトが存在することを確認
	_, err = s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	require.NoError(t, err)

	// クリーンアップ
	err = store.Delete(ctx, key)
	require.NoError(t, err)
}

func TestS3ObjectStorage_GetURL(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	store := storage.NewS3ObjectStorage(s3Client, bucket)

	key := "whiskey/users/" + uuid.New().String() + "/avatar/" + uuid.New().String() + ".jpg"

	// 存在しない場合は空文字列を返す
	url, err := store.GetURL(ctx, key)
	require.NoError(t, err)
	assert.Empty(t, url)

	// アップロード後はキーが返される
	err = store.Upload(ctx, key, []byte("image-data"), "image/jpeg")
	require.NoError(t, err)

	url, err = store.GetURL(ctx, key)
	require.NoError(t, err)
	assert.Equal(t, key, url)

	// クリーンアップ
	err = store.Delete(ctx, key)
	require.NoError(t, err)
}

func TestS3ObjectStorage_Delete(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	store := storage.NewS3ObjectStorage(s3Client, bucket)

	key := "whiskey/users/" + uuid.New().String() + "/avatar/" + uuid.New().String() + ".jpg"

	// 存在しないキーの削除でもエラーにならない
	err := store.Delete(ctx, key)
	require.NoError(t, err)

	// アップロードしてから削除
	err = store.Upload(ctx, key, []byte("image-data"), "image/jpeg")
	require.NoError(t, err)

	err = store.Delete(ctx, key)
	require.NoError(t, err)

	// 削除されたことを確認
	url, err := store.GetURL(ctx, key)
	require.NoError(t, err)
	assert.Empty(t, url)
}

func TestS3ObjectStorage_ListByPrefix(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	store := storage.NewS3ObjectStorage(s3Client, bucket)

	userID := uuid.New().String()
	prefix := "whiskey/users/" + userID + "/avatar/"
	key1 := prefix + uuid.New().String() + ".jpg"
	key2 := prefix + uuid.New().String() + ".jpg"

	// 何もない場合は空スライス
	keys, err := store.ListByPrefix(ctx, prefix)
	require.NoError(t, err)
	assert.Empty(t, keys)

	// 2件アップロード
	err = store.Upload(ctx, key1, []byte("img1"), "image/jpeg")
	require.NoError(t, err)
	err = store.Upload(ctx, key2, []byte("img2"), "image/jpeg")
	require.NoError(t, err)

	// 2件返される
	keys, err = store.ListByPrefix(ctx, prefix)
	require.NoError(t, err)
	assert.Len(t, keys, 2)
	assert.Contains(t, keys, key1)
	assert.Contains(t, keys, key2)

	// クリーンアップ
	_ = store.Delete(ctx, key1)
	_ = store.Delete(ctx, key2)
}
