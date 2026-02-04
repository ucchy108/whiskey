package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// UserHandler はユーザー関連のHTTPハンドラーを提供する。
// Usecase層のビジネスロジックをRESTful APIとして公開する。
type UserHandler struct {
	userUsecase usecase.UserUsecaseInterface
}

// NewUserHandler はUserHandlerの新しいインスタンスを生成する。
//
// パラメータ:
//   - userUsecase: ユーザーに関するビジネスロジックを提供するユースケース
//
// 戻り値:
//   - *UserHandler: 生成されたUserHandlerインスタンス
func NewUserHandler(userUsecase usecase.UserUsecaseInterface) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
	}
}

// RegisterRequest はユーザー登録APIのリクエストボディ
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterResponse はユーザー登録APIのレスポンスボディ
type RegisterResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// LoginRequest はログインAPIのリクエストボディ
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse はログインAPIのレスポンスボディ
type LoginResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// GetUserResponse はユーザー情報取得APIのレスポンスボディ
type GetUserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// ChangePasswordRequest はパスワード変更APIのリクエストボディ
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// ErrorResponse はエラーレスポンスボディ
type ErrorResponse struct {
	Error string `json:"error"`
}

// Register はユーザー登録を行う。
// POST /api/users
//
// リクエストボディ:
//
//	{
//	  "email": "user@example.com",
//	  "password": "securepassword"
//	}
//
// レスポンス:
//   - 201 Created: 登録成功
//   - 400 Bad Request: リクエストボディが不正、バリデーションエラー
//   - 409 Conflict: メールアドレスが既に登録済み
//   - 500 Internal Server Error: サーバーエラー
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userUsecase.Register(r.Context(), req.Email, req.Password)
	if err != nil {
		handleUsecaseError(w, err)
		return
	}

	resp := RegisterResponse{
		ID:    user.ID.String(),
		Email: user.Email.String(),
	}

	respondJSON(w, http.StatusCreated, resp)
}

// Login はログイン処理を行う。
// POST /api/auth/login
//
// リクエストボディ:
//
//	{
//	  "email": "user@example.com",
//	  "password": "securepassword"
//	}
//
// レスポンス:
//   - 200 OK: ログイン成功
//   - 400 Bad Request: リクエストボディが不正
//   - 401 Unauthorized: 認証失敗
//   - 500 Internal Server Error: サーバーエラー
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userUsecase.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		handleUsecaseError(w, err)
		return
	}

	resp := LoginResponse{
		ID:    user.ID.String(),
		Email: user.Email.String(),
	}

	respondJSON(w, http.StatusOK, resp)
}

// GetUser はユーザー情報を取得する。
// GET /api/users/:id
//
// パスパラメータ:
//   - id: ユーザーID (UUID)
//
// レスポンス:
//   - 200 OK: 取得成功
//   - 400 Bad Request: ユーザーIDが不正
//   - 404 Not Found: ユーザーが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["id"]

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.userUsecase.GetUser(r.Context(), userID)
	if err != nil {
		handleUsecaseError(w, err)
		return
	}

	resp := GetUserResponse{
		ID:    user.ID.String(),
		Email: user.Email.String(),
	}

	respondJSON(w, http.StatusOK, resp)
}

// ChangePassword はパスワード変更を行う。
// PUT /api/users/:id/password
//
// パスパラメータ:
//   - id: ユーザーID (UUID)
//
// リクエストボディ:
//
//	{
//	  "current_password": "currentpassword",
//	  "new_password": "newpassword"
//	}
//
// レスポンス:
//   - 204 No Content: 変更成功
//   - 400 Bad Request: リクエストボディが不正、バリデーションエラー
//   - 401 Unauthorized: 現在のパスワードが不正
//   - 404 Not Found: ユーザーが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["id"]

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = h.userUsecase.ChangePassword(r.Context(), userID, req.CurrentPassword, req.NewPassword)
	if err != nil {
		handleUsecaseError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// respondJSON はJSON形式でレスポンスを返す。
func respondJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		// エンコードエラーが発生した場合はログに記録（実装は別途）
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

// respondError はエラーレスポンスを返す。
func respondError(w http.ResponseWriter, statusCode int, message string) {
	respondJSON(w, statusCode, ErrorResponse{Error: message})
}

// handleUsecaseError はUsecase層のエラーを適切なHTTPステータスコードに変換する。
func handleUsecaseError(w http.ResponseWriter, err error) {
	switch err {
	case usecase.ErrInvalidCredentials:
		respondError(w, http.StatusUnauthorized, "Invalid email or password")
	case usecase.ErrUserNotFound:
		respondError(w, http.StatusNotFound, "User not found")
	default:
		// バリデーションエラー（値オブジェクトのエラー）をチェック
		if isValidationError(err) {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		// その他のエラーは内部サーバーエラーとして扱う
		respondError(w, http.StatusInternalServerError, "Internal server error")
	}
}

// isValidationError はバリデーションエラーかどうかを判定する。
// 値オブジェクトのエラーメッセージに基づいて判定する。
func isValidationError(err error) bool {
	errMsg := err.Error()
	validationErrors := []string{
		"invalid email format",
		"email already exists",
		"password must be at least",
		"password must be at most",
	}

	for _, ve := range validationErrors {
		if len(errMsg) >= len(ve) && errMsg[:len(ve)] == ve {
			return true
		}
	}
	return false
}
