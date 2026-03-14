// Package di はアプリケーションの依存関係注入（DI）を構成する。
package di

import (
	"database/sql"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/redis/go-redis/v9"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/infrastructure/database"
	"github.com/ucchy108/whiskey/backend/infrastructure/email"
	"github.com/ucchy108/whiskey/backend/infrastructure/router"
	"github.com/ucchy108/whiskey/backend/infrastructure/storage"
	"github.com/ucchy108/whiskey/backend/interfaces/handler"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// BuildRouterConfig はDB接続とRedisクライアントからルーター設定を構築する。
//
// Clean Architectureの各レイヤーを内側から外側へ順に初期化し、
// 依存関係を注入した router.RouterConfig を返す。
//
// パラメータ:
//   - db: PostgreSQLデータベース接続
//   - redisClient: Redisクライアント
//
// 戻り値:
//   - router.RouterConfig: 全ハンドラーとセッションリポジトリを含むルーター設定
func BuildRouterConfig(db *sql.DB, redisClient *redis.Client, s3Client *s3.Client, s3Bucket string, s3Endpoint string, s3ExternalEndpoint string, smtpHost string, smtpPort string, frontendURL string) router.RouterConfig {
	// Infrastructure層
	userRepo := database.NewUserRepository(db)
	sessionStore := auth.NewSessionStore(redisClient)
	workoutRepo := database.NewWorkoutRepository(db)
	workoutSetRepo := database.NewWorkoutSetRepository(db)
	exerciseRepo := database.NewExerciseRepository(db)

	// Domain層
	userService := service.NewUserService(userRepo)
	workoutService := service.NewWorkoutService(workoutRepo)
	exerciseService := service.NewExerciseService(exerciseRepo)

	// Usecase層
	sessionTTL := 24 * time.Hour
	emailSender := email.NewSmtpSender(smtpHost, smtpPort, frontendURL)
	userUsecase := usecase.NewUserUsecase(userRepo, userService, sessionStore, emailSender, sessionTTL)
	workoutUsecase := usecase.NewWorkoutUsecase(workoutRepo, workoutSetRepo, exerciseRepo, workoutService)
	exerciseUsecase := usecase.NewExerciseUsecase(exerciseRepo, exerciseService)

	// Profile + ObjectStorage
	profileRepo := database.NewProfileRepository(db)
	objectStorage := storage.NewS3ObjectStorage(s3Client, s3Bucket, s3Endpoint, s3ExternalEndpoint)
	profileUsecase := usecase.NewProfileUsecase(profileRepo, objectStorage)

	// Interface層
	userHandler := handler.NewUserHandler(userUsecase)
	workoutHandler := handler.NewWorkoutHandler(workoutUsecase)
	exerciseHandler := handler.NewExerciseHandler(exerciseUsecase)
	profileHandler := handler.NewProfileHandler(profileUsecase)

	return router.RouterConfig{
		UserHandler:     userHandler,
		WorkoutHandler:  workoutHandler,
		ExerciseHandler: exerciseHandler,
		ProfileHandler:  profileHandler,
		SessionRepo:     sessionStore,
	}
}
