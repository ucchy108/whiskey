// Package di はアプリケーションの依存関係注入（DI）を構成する。
package di

import (
	"database/sql"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/infrastructure/database"
	"github.com/ucchy108/whiskey/backend/infrastructure/router"
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
func BuildRouterConfig(db *sql.DB, redisClient *redis.Client) router.RouterConfig {
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
	userUsecase := usecase.NewUserUsecase(userRepo, userService, sessionStore, sessionTTL)
	workoutUsecase := usecase.NewWorkoutUsecase(workoutRepo, workoutSetRepo, exerciseRepo, workoutService)
	exerciseUsecase := usecase.NewExerciseUsecase(exerciseRepo, exerciseService)

	// Interface層
	userHandler := handler.NewUserHandler(userUsecase)
	workoutHandler := handler.NewWorkoutHandler(workoutUsecase)
	exerciseHandler := handler.NewExerciseHandler(exerciseUsecase)

	return router.RouterConfig{
		UserHandler:     userHandler,
		WorkoutHandler:  workoutHandler,
		ExerciseHandler: exerciseHandler,
		SessionRepo:     sessionStore,
	}
}
