package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/infrastructure/database"
	"github.com/ucchy108/whiskey/backend/infrastructure/router"
	"github.com/ucchy108/whiskey/backend/interfaces/handler"
	"github.com/ucchy108/whiskey/backend/usecase"
)

func main() {
	// 環境変数の読み込み
	port := getEnv("PORT", "8080")
	databaseURL := getEnv("DATABASE_URL", "postgresql://whiskey:password@localhost:5433/whiskey?sslmode=disable")
	redisURL := getEnv("REDIS_URL", "localhost:6379")

	// PostgreSQL接続の初期化
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// データベース接続の確認
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Successfully connected to PostgreSQL")

	// Redis接続の初期化
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisURL,
		DB:   0,
	})
	defer redisClient.Close()

	// Redis接続の確認
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Successfully connected to Redis")

	// 依存関係の注入（DI）
	// Infrastructure層
	userRepo := database.NewUserRepository(db)
	sessionStore := auth.NewSessionStore(redisClient)

	// Domain層
	userService := service.NewUserService(userRepo)

	// Usecase層
	sessionTTL := 24 * time.Hour // セッション有効期限: 24時間
	userUsecase := usecase.NewUserUsecase(userRepo, userService, sessionStore, sessionTTL)

	// Interface層
	userHandler := handler.NewUserHandler(userUsecase)

	// ルーターの設定
	routerConfig := router.RouterConfig{
		UserHandler: userHandler,
		SessionRepo: sessionStore,
	}
	r := router.NewRouter(routerConfig)

	// サーバー起動
	addr := fmt.Sprintf(":%s", port)
	log.Printf("Server starting on %s", addr)
	log.Printf("Environment: %s", getEnv("ENV", "development"))
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
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
