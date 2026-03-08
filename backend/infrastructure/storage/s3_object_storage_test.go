package storage_test

import (
	"bytes"
	"context"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

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

// putObjectDirect はテストのセットアップ用にS3クライアントで直接オブジェクトを配置する
func putObjectDirect(t *testing.T, s3Client *s3.Client, bucket, key string, data []byte) {
	t.Helper()
	_, err := s3Client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String("image/jpeg"),
	})
	require.NoError(t, err)
}

func TestS3ObjectStorage_PresignedPutURL(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	store := storage.NewS3ObjectStorage(s3Client, bucket)

	key := "whiskey/users/" + uuid.New().String() + "/avatar/" + uuid.New().String() + ".jpg"

	// Presigned PUT URLを生成
	url, err := store.PresignedPutURL(ctx, key, "image/jpeg", 5*time.Minute)
	require.NoError(t, err)
	assert.NotEmpty(t, url)
	assert.True(t, strings.Contains(url, key))

	// Presigned URLでアップロードできることを確認
	body := strings.NewReader("fake-image-data")
	req, err := http.NewRequest("PUT", url, body)
	require.NoError(t, err)
	req.Header.Set("Content-Type", "image/jpeg")

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// アップロードされたことを確認
	_, err = s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	require.NoError(t, err)

	// クリーンアップ
	err = store.Delete(ctx, key)
	require.NoError(t, err)
}

func TestS3ObjectStorage_PresignedGetURL(t *testing.T) {
	ctx := context.Background()
	s3Client := setupTestS3Client(t)
	bucket := getBucket()
	store := storage.NewS3ObjectStorage(s3Client, bucket)

	key := "whiskey/users/" + uuid.New().String() + "/avatar/" + uuid.New().String() + ".jpg"

	// テストデータをS3に直接配置
	putObjectDirect(t, s3Client, bucket, key, []byte("fake-image-data"))

	// Presigned GET URLを生成
	url, err := store.PresignedGetURL(ctx, key, 5*time.Minute)
	require.NoError(t, err)
	assert.NotEmpty(t, url)
	assert.True(t, strings.Contains(url, key))

	// Presigned URLでダウンロードできることを確認
	resp, err := http.Get(url)
	require.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)

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

	// S3に直接配置してから削除
	putObjectDirect(t, s3Client, bucket, key, []byte("image-data"))

	err = store.Delete(ctx, key)
	require.NoError(t, err)

	// 削除されたことを確認
	_, err = s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	assert.Error(t, err)
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

	// S3に直接2件配置
	putObjectDirect(t, s3Client, bucket, key1, []byte("img1"))
	putObjectDirect(t, s3Client, bucket, key2, []byte("img2"))

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
