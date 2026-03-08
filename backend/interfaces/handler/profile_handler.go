package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// ProfileHandler はプロフィール関連のHTTPハンドラーを提供する。
type ProfileHandler struct {
	profileUsecase usecase.ProfileUsecaseInterface
}

// NewProfileHandler はProfileHandlerの新しいインスタンスを生成する。
func NewProfileHandler(profileUsecase usecase.ProfileUsecaseInterface) *ProfileHandler {
	return &ProfileHandler{
		profileUsecase: profileUsecase,
	}
}

// CreateProfileRequest はプロフィール作成APIのリクエストボディ
type CreateProfileRequest struct {
	DisplayName string   `json:"display_name"`
	Age         *int32   `json:"age,omitempty"`
	Weight      *float64 `json:"weight,omitempty"`
	Height      *float64 `json:"height,omitempty"`
}

// UpdateProfileRequest はプロフィール更新APIのリクエストボディ
type UpdateProfileRequest struct {
	DisplayName *string  `json:"display_name,omitempty"`
	Age         *int32   `json:"age,omitempty"`
	Weight      *float64 `json:"weight,omitempty"`
	Height      *float64 `json:"height,omitempty"`
}

// ProfileResponse はプロフィールAPIのレスポンスボディ
type ProfileResponse struct {
	ID          string   `json:"id"`
	UserID      string   `json:"user_id"`
	DisplayName string   `json:"display_name"`
	Age         *int32   `json:"age,omitempty"`
	Weight      *float64 `json:"weight,omitempty"`
	Height      *float64 `json:"height,omitempty"`
	BMI         *float64 `json:"bmi,omitempty"`
}

// CreateProfile はプロフィールを作成する。
// POST /api/profile
func (h *ProfileHandler) CreateProfile(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	var req CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	profile, err := h.profileUsecase.CreateProfile(r.Context(), userID, req.DisplayName, req.Age, req.Weight, req.Height)
	if err != nil {
		handleProfileError(w, err)
		return
	}

	respondJSON(w, http.StatusCreated, toProfileResponse(profile))
}

// GetProfile は認証済みユーザーのプロフィールを取得する。
// GET /api/profile
func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	profile, err := h.profileUsecase.GetProfile(r.Context(), userID)
	if err != nil {
		handleProfileError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toProfileResponse(profile))
}

// UpdateProfile は認証済みユーザーのプロフィールを更新する。
// PUT /api/profile
func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	profile, err := h.profileUsecase.UpdateProfile(r.Context(), userID, req.DisplayName, req.Age, req.Weight, req.Height)
	if err != nil {
		handleProfileError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toProfileResponse(profile))
}

// AvatarUploadURLRequest はアバターアップロードURL取得APIのリクエストボディ
type AvatarUploadURLRequest struct {
	ContentType string `json:"content_type"`
}

// AvatarUploadURLResponse はアバターアップロードURL取得APIのレスポンスボディ
type AvatarUploadURLResponse struct {
	UploadURL string `json:"upload_url"`
	Key       string `json:"key"`
}

// AvatarURLResponse はアバターURL取得APIのレスポンスボディ
type AvatarURLResponse struct {
	URL string `json:"url"`
}

// GetAvatarUploadURL はアバター画像アップロード用のPresigned URLを返す。
// POST /api/profile/avatar
func (h *ProfileHandler) GetAvatarUploadURL(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	var req AvatarUploadURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	url, key, err := h.profileUsecase.GetAvatarUploadURL(r.Context(), userID, req.ContentType)
	if err != nil {
		handleProfileError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, AvatarUploadURLResponse{
		UploadURL: url,
		Key:       key,
	})
}

// GetAvatarURL はアバター画像のPresigned GET URLを返す。
// GET /api/profile/avatar
func (h *ProfileHandler) GetAvatarURL(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	url, err := h.profileUsecase.GetAvatarURL(r.Context(), userID)
	if err != nil {
		handleProfileError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, AvatarURLResponse{URL: url})
}

// DeleteAvatar はアバター画像を削除する。
// DELETE /api/profile/avatar
func (h *ProfileHandler) DeleteAvatar(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	if err := h.profileUsecase.DeleteAvatar(r.Context(), userID); err != nil {
		handleProfileError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// toProfileResponse はProfileエンティティをレスポンスDTOに変換する。
func toProfileResponse(p *entity.Profile) ProfileResponse {
	return ProfileResponse{
		ID:          p.ID.String(),
		UserID:      p.UserID.String(),
		DisplayName: p.DisplayName,
		Age:         p.Age,
		Weight:      p.Weight,
		Height:      p.Height,
		BMI:         p.CalculateBMI(),
	}
}

// handleProfileError はProfileUsecase層のエラーを適切なHTTPステータスコードに変換する。
func handleProfileError(w http.ResponseWriter, err error) {
	switch err {
	case usecase.ErrProfileNotFound:
		respondError(w, http.StatusNotFound, "Profile not found")
	case usecase.ErrProfileAlreadyExists:
		respondError(w, http.StatusConflict, "Profile already exists")
	case usecase.ErrInvalidContentType:
		respondError(w, http.StatusBadRequest, err.Error())
	default:
		if isProfileValidationError(err) {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "Internal server error")
	}
}

// isProfileValidationError はプロフィール関連のバリデーションエラーかどうかを判定する。
func isProfileValidationError(err error) bool {
	validationErrors := []string{
		"display name must be",
		"age must be",
		"weight must be",
		"height must be",
	}

	errMsg := err.Error()
	for _, ve := range validationErrors {
		if len(errMsg) >= len(ve) && errMsg[:len(ve)] == ve {
			return true
		}
	}
	return false
}
