// Package router はHTTPルーティングとミドルウェアの設定を提供する。
package router

import (
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/interfaces/handler"
	"github.com/ucchy108/whiskey/backend/pkg/logger"
)

// RouterConfig はルーター設定のための構成オプション。
type RouterConfig struct {
	UserHandler     *handler.UserHandler
	WorkoutHandler  *handler.WorkoutHandler
	ExerciseHandler *handler.ExerciseHandler
	SessionRepo     repository.SessionRepository
}

// NewRouter はすべてのルートとミドルウェアが設定された新しいHTTPルーターを生成する。
//
// パラメータ:
//   - config: ハンドラーとリポジトリを含むルーター設定
//
// 戻り値:
//   - *mux.Router: 設定済みのGorilla Muxルーター
func NewRouter(config RouterConfig) *mux.Router {
	r := mux.NewRouter()

	// グローバルミドルウェア（全てのルートに適用）
	r.Use(loggingMiddleware)
	r.Use(corsMiddleware)

	// ヘルスチェックエンドポイント（認証不要）
	r.HandleFunc("/health", healthCheckHandler).Methods("GET")

	// API v1 ルート
	api := r.PathPrefix("/api").Subrouter()

	// 認証不要のエンドポイント
	api.HandleFunc("/users", config.UserHandler.Register).Methods("POST")
	api.HandleFunc("/auth/login", config.UserHandler.Login).Methods("POST")

	// 認証が必要なエンドポイント
	authRequired := api.PathPrefix("").Subrouter()
	authRequired.Use(auth.AuthMiddleware(config.SessionRepo))
	authRequired.HandleFunc("/auth/logout", config.UserHandler.Logout).Methods("POST")
	authRequired.HandleFunc("/users/{id}", config.UserHandler.GetUser).Methods("GET")
	authRequired.HandleFunc("/users/{id}/password", config.UserHandler.ChangePassword).Methods("PUT")

	// ワークアウトルート
	// 注意: /workouts/contributions は /workouts/{id} より前に登録（Gorilla Muxの優先順位）
	authRequired.HandleFunc("/workouts", config.WorkoutHandler.RecordWorkout).Methods("POST")
	authRequired.HandleFunc("/workouts", config.WorkoutHandler.GetUserWorkouts).Methods("GET")
	authRequired.HandleFunc("/workouts/contributions", config.WorkoutHandler.GetContributionData).Methods("GET")
	authRequired.HandleFunc("/workouts/{id}", config.WorkoutHandler.GetWorkout).Methods("GET")
	authRequired.HandleFunc("/workouts/{id}/memo", config.WorkoutHandler.UpdateWorkoutMemo).Methods("PUT")
	authRequired.HandleFunc("/workouts/{id}/sets", config.WorkoutHandler.AddWorkoutSets).Methods("POST")
	authRequired.HandleFunc("/workouts/{id}", config.WorkoutHandler.DeleteWorkout).Methods("DELETE")
	authRequired.HandleFunc("/workout-sets/{id}", config.WorkoutHandler.DeleteWorkoutSet).Methods("DELETE")

	// エクササイズルート
	authRequired.HandleFunc("/exercises", config.ExerciseHandler.CreateExercise).Methods("POST")
	authRequired.HandleFunc("/exercises", config.ExerciseHandler.ListExercises).Methods("GET")
	authRequired.HandleFunc("/exercises/{id}", config.ExerciseHandler.GetExercise).Methods("GET")
	authRequired.HandleFunc("/exercises/{id}", config.ExerciseHandler.UpdateExercise).Methods("PUT")
	authRequired.HandleFunc("/exercises/{id}", config.ExerciseHandler.DeleteExercise).Methods("DELETE")

	return r
}

// healthCheckHandler はサービスの健全性をチェックするためのシンプルなハンドラー。
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

// loggingMiddleware は各HTTPリクエストの詳細をログに記録する。
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// レスポンスライターをラップしてステータスコードを取得
		wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(wrapped, r)

		duration := time.Since(start)
		statusCode := wrapped.statusCode

		// ステータスコードに応じてログレベルを変更
		logFunc := logger.Info
		if statusCode >= 500 {
			logFunc = logger.Error
		} else if statusCode >= 400 {
			logFunc = logger.Warn
		}

		logFunc("HTTP request",
			"method", r.Method,
			"uri", r.RequestURI,
			"remote_addr", r.RemoteAddr,
			"status", statusCode,
			"duration_ms", duration.Milliseconds(),
			"user_agent", r.UserAgent(),
		)
	})
}

// responseWriter はhttp.ResponseWriterをラップしてステータスコードを記録する。
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

// WriteHeader はステータスコードを記録してから親のWriteHeaderを呼び出す。
func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// corsMiddleware はCross-Origin Resource Sharing (CORS)ヘッダーを設定する。
// 開発環境では全てのオリジンからのアクセスを許可する。
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: 本番環境では特定のオリジンのみを許可するように変更
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// プリフライトリクエストに応答
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
