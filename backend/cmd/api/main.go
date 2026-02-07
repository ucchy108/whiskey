package main

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"github.com/ucchy108/whiskey/backend/cmd/api/di"
	"github.com/ucchy108/whiskey/backend/infrastructure/router"
	"github.com/ucchy108/whiskey/backend/pkg/logger"
)

func main() {
	// Loggerの初期化
	env := getEnv("ENV", "development")
	logLevel := slog.LevelInfo
	if env == "development" {
		logLevel = slog.LevelDebug
	}
	logger.Init(logger.Config{
		Level:     logLevel,
		Format:    "text",
		AddSource: false,
	})

	logger.Info("Starting whiskey API server",
		"environment", env,
		"go_version", "1.23",
	)

	// 環境変数の読み込み
	port := getEnv("PORT", "8080")
	databaseURL := getEnv("DATABASE_URL", "postgresql://whiskey:password@localhost:5433/whiskey?sslmode=disable")
	redisURL := getEnv("REDIS_URL", "localhost:6379")

	// PostgreSQL接続の初期化
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		logger.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// データベース接続の確認
	if err := db.Ping(); err != nil {
		logger.Error("Failed to ping database", "error", err)
		os.Exit(1)
	}
	logger.Info("Successfully connected to PostgreSQL")

	// Redis接続の初期化
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisURL,
		DB:   0,
	})
	defer redisClient.Close()

	// Redis接続の確認
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		logger.Error("Failed to connect to Redis", "error", err, "redis_url", redisURL)
		os.Exit(1)
	}
	logger.Info("Successfully connected to Redis", "redis_url", redisURL)

	// 依存関係の注入（DI）
	routerConfig := di.BuildRouterConfig(db, redisClient)
	r := router.NewRouter(routerConfig)

	// サーバー起動
	addr := fmt.Sprintf(":%s", port)
	logger.Info("Server starting",
		"address", addr,
		"port", port,
	)

	if err := http.ListenAndServe(addr, r); err != nil {
		logger.Error("Server failed to start", "error", err, "address", addr)
		os.Exit(1)
	}
}

// getEnv は環境変数を取得し、存在しない場合はデフォルト値を返す。
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
