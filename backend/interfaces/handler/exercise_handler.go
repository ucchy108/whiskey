package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// ExerciseHandler はエクササイズ関連のHTTPハンドラーを提供する。
// Usecase層のビジネスロジックをRESTful APIとして公開する。
type ExerciseHandler struct {
	exerciseUsecase usecase.ExerciseUsecaseInterface
}

// NewExerciseHandler はExerciseHandlerの新しいインスタンスを生成する。
//
// パラメータ:
//   - exerciseUsecase: エクササイズに関するビジネスロジックを提供するユースケース
//
// 戻り値:
//   - *ExerciseHandler: 生成されたExerciseHandlerインスタンス
func NewExerciseHandler(exerciseUsecase usecase.ExerciseUsecaseInterface) *ExerciseHandler {
	return &ExerciseHandler{
		exerciseUsecase: exerciseUsecase,
	}
}

// --- リクエスト/レスポンスDTO ---

// CreateExerciseRequest はエクササイズ作成APIのリクエストボディ
type CreateExerciseRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	BodyPart    *string `json:"body_part"`
}

// UpdateExerciseRequest はエクササイズ更新APIのリクエストボディ
type UpdateExerciseRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	BodyPart    *string `json:"body_part"`
}

// ExerciseResponse はエクササイズのレスポンスボディ
type ExerciseResponse struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	BodyPart    *string `json:"body_part"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

// --- ハンドラーメソッド ---

// CreateExercise は新しいエクササイズを作成する。
// POST /api/exercises
//
// リクエストボディ:
//
//	{
//	  "name": "Bench Press",
//	  "description": "Chest exercise",
//	  "body_part": "chest"
//	}
//
// レスポンス:
//   - 201 Created: 作成成功
//   - 400 Bad Request: リクエストボディが不正、バリデーションエラー
//   - 409 Conflict: エクササイズ名が既に存在
//   - 500 Internal Server Error: サーバーエラー
func (h *ExerciseHandler) CreateExercise(w http.ResponseWriter, r *http.Request) {
	// 認証チェック（認証ミドルウェアで保護されているが念のため）
	_ = auth.GetUserIDFromContext(r.Context())

	var req CreateExerciseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var bodyPart *entity.BodyPart
	if req.BodyPart != nil {
		bp := entity.BodyPart(*req.BodyPart)
		bodyPart = &bp
	}

	exercise, err := h.exerciseUsecase.CreateExercise(r.Context(), req.Name, req.Description, bodyPart)
	if err != nil {
		handleExerciseUsecaseError(w, err)
		return
	}

	respondJSON(w, http.StatusCreated, toExerciseResponse(exercise))
}

// ListExercises はエクササイズ一覧を取得する。
// GET /api/exercises?body_part=chest
//
// クエリパラメータ:
//   - body_part: 身体部位でフィルタリング（省略可）
//
// レスポンス:
//   - 200 OK: 取得成功
//   - 400 Bad Request: クエリパラメータが不正
//   - 500 Internal Server Error: サーバーエラー
func (h *ExerciseHandler) ListExercises(w http.ResponseWriter, r *http.Request) {
	_ = auth.GetUserIDFromContext(r.Context())

	var bodyPart *entity.BodyPart
	if bp := r.URL.Query().Get("body_part"); bp != "" {
		bodyPartVal := entity.BodyPart(bp)
		bodyPart = &bodyPartVal
	}

	exercises, err := h.exerciseUsecase.ListExercises(r.Context(), bodyPart)
	if err != nil {
		handleExerciseUsecaseError(w, err)
		return
	}

	resp := make([]ExerciseResponse, 0, len(exercises))
	for _, exercise := range exercises {
		resp = append(resp, toExerciseResponse(exercise))
	}

	respondJSON(w, http.StatusOK, resp)
}

// GetExercise はエクササイズの詳細を取得する。
// GET /api/exercises/{id}
//
// パスパラメータ:
//   - id: エクササイズID (UUID)
//
// レスポンス:
//   - 200 OK: 取得成功
//   - 400 Bad Request: エクササイズIDが不正
//   - 404 Not Found: エクササイズが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *ExerciseHandler) GetExercise(w http.ResponseWriter, r *http.Request) {
	_ = auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	exerciseID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	exercise, err := h.exerciseUsecase.GetExercise(r.Context(), exerciseID)
	if err != nil {
		handleExerciseUsecaseError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toExerciseResponse(exercise))
}

// UpdateExercise はエクササイズを更新する。
// PUT /api/exercises/{id}
//
// パスパラメータ:
//   - id: エクササイズID (UUID)
//
// リクエストボディ:
//
//	{
//	  "name": "Updated Name",
//	  "description": "Updated description",
//	  "body_part": "back"
//	}
//
// レスポンス:
//   - 200 OK: 更新成功
//   - 400 Bad Request: リクエストが不正、バリデーションエラー
//   - 404 Not Found: エクササイズが見つからない
//   - 409 Conflict: エクササイズ名が既に存在
//   - 500 Internal Server Error: サーバーエラー
func (h *ExerciseHandler) UpdateExercise(w http.ResponseWriter, r *http.Request) {
	_ = auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	exerciseID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	var req UpdateExerciseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var bodyPart *entity.BodyPart
	if req.BodyPart != nil {
		bp := entity.BodyPart(*req.BodyPart)
		bodyPart = &bp
	}

	exercise, err := h.exerciseUsecase.UpdateExercise(r.Context(), exerciseID, req.Name, req.Description, bodyPart)
	if err != nil {
		handleExerciseUsecaseError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toExerciseResponse(exercise))
}

// DeleteExercise はエクササイズを削除する。
// DELETE /api/exercises/{id}
//
// パスパラメータ:
//   - id: エクササイズID (UUID)
//
// レスポンス:
//   - 204 No Content: 削除成功
//   - 400 Bad Request: エクササイズIDが不正
//   - 404 Not Found: エクササイズが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *ExerciseHandler) DeleteExercise(w http.ResponseWriter, r *http.Request) {
	_ = auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	exerciseID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	if err := h.exerciseUsecase.DeleteExercise(r.Context(), exerciseID); err != nil {
		handleExerciseUsecaseError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// --- ヘルパー関数 ---

// handleExerciseUsecaseError はExercise Usecase層のエラーを適切なHTTPステータスコードに変換する。
func handleExerciseUsecaseError(w http.ResponseWriter, err error) {
	switch err {
	case usecase.ErrExerciseNotFound:
		respondError(w, http.StatusNotFound, "Exercise not found")
	case service.ErrExerciseNameAlreadyExists:
		respondError(w, http.StatusConflict, "Exercise name already exists")
	default:
		if isExerciseValidationError(err) {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "Internal server error")
	}
}

// isExerciseValidationError はエクササイズ関連のバリデーションエラーかどうかを判定する。
func isExerciseValidationError(err error) bool {
	errMsg := err.Error()
	validationErrors := []string{
		"exercise name must be",
		"invalid body part",
	}

	for _, ve := range validationErrors {
		if len(errMsg) >= len(ve) && errMsg[:len(ve)] == ve {
			return true
		}
	}
	return false
}

// toExerciseResponse はExerciseエンティティをExerciseResponseに変換する。
func toExerciseResponse(exercise *entity.Exercise) ExerciseResponse {
	var bodyPart *string
	if exercise.BodyPart != nil {
		bp := string(*exercise.BodyPart)
		bodyPart = &bp
	}

	return ExerciseResponse{
		ID:          exercise.ID.String(),
		Name:        exercise.Name,
		Description: exercise.Description,
		BodyPart:    bodyPart,
		CreatedAt:   exercise.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   exercise.UpdatedAt.Format(time.RFC3339),
	}
}
